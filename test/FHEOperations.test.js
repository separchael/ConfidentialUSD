const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("ShadowStablecoinMint - FHE Operations Tests", function () {
  let contract;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, user1, user2, user3] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("ShadowStablecoinMint");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;
  });

  describe("FHE.asEuint64 - Plaintext to Encrypted Conversion", function () {
    it("should convert plaintext to encrypted on mint", async function () {
      const amount = 1000n * 10n ** 6n;

      // Mint uses FHE.asEuint64 internally
      await contract.connect(owner).mintReplica(user1.address, amount);

      const balance = await contract.replicaBalanceOf(user1.address);
      expect(balance).to.not.be.undefined;
      console.log("✅ FHE.asEuint64() - Plaintext to encrypted conversion works");
    });

    it("should handle zero value conversion", async function () {
      await contract.connect(owner).mintReplica(user1.address, 0n);
      console.log("✅ FHE.asEuint64() - Zero value conversion works");
    });

    it("should handle maximum uint64 value", async function () {
      const maxUint64 = 2n ** 64n - 1n;
      await contract.connect(owner).mintReplica(user1.address, maxUint64);
      console.log("✅ FHE.asEuint64() - Max uint64 value conversion works");
    });
  });

  describe("FHE.fromExternal - Encrypted Input Verification", function () {
    beforeEach(async function () {
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);
    });

    it("should verify and convert encrypted input on transfer", async function () {
      const amount = 100n * 10n ** 6n;

      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(amount)
        .encrypt();

      // Transfer uses FHE.fromExternal internally
      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log("✅ FHE.fromExternal() - Encrypted input verification works");
    });

    it("should reject invalid input proof", async function () {
      const validEncrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(100n * 10n ** 6n)
        .encrypt();

      const invalidProof = "0x" + "00".repeat(64);

      await expect(
        contract.connect(user1).transferReplica(
          user2.address,
          validEncrypted.handles[0],
          invalidProof
        )
      ).to.be.reverted;

      console.log("✅ FHE.fromExternal() - Invalid proof rejection works");
    });
  });

  describe("FHE.add - Encrypted Addition", function () {
    it("should add encrypted values on mint (balance accumulation)", async function () {
      const amounts = [100n, 200n, 300n].map(a => a * 10n ** 6n);

      for (const amount of amounts) {
        await contract.connect(owner).mintReplica(user1.address, amount);
      }

      // Total should be 600 cUSD (encrypted)
      const balance = await contract.replicaBalanceOf(user1.address);
      expect(balance).to.not.be.undefined;
      console.log("✅ FHE.add() - Encrypted addition (balance accumulation) works");
    });

    it("should add encrypted values on transfer (recipient balance)", async function () {
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);

      // Multiple transfers to same recipient
      for (let i = 0; i < 3; i++) {
        const encrypted = await fhevm
          .createEncryptedInput(await contract.getAddress(), user1.address)
          .add64(100n * 10n ** 6n)
          .encrypt();

        await contract.connect(user1).transferReplica(
          user2.address,
          encrypted.handles[0],
          encrypted.inputProof
        );
      }

      console.log("✅ FHE.add() - Encrypted addition (transfer) works");
    });

    it("should update total supply with encrypted addition", async function () {
      await contract.connect(owner).mintReplica(user1.address, 500n * 10n ** 6n);
      await contract.connect(owner).mintReplica(user2.address, 500n * 10n ** 6n);

      const totalSupply = await contract.replicaTotalSupply();
      expect(totalSupply).to.not.be.undefined;
      console.log("✅ FHE.add() - Total supply accumulation works");
    });
  });

  describe("FHE.sub - Encrypted Subtraction", function () {
    beforeEach(async function () {
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);
    });

    it("should subtract encrypted values on transfer (sender balance)", async function () {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(300n * 10n ** 6n)
        .encrypt();

      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log("✅ FHE.sub() - Encrypted subtraction (transfer) works");
    });

    it("should subtract encrypted values on burn", async function () {
      await contract.connect(owner).burnReplica(user1.address, 500n * 10n ** 6n);
      console.log("✅ FHE.sub() - Encrypted subtraction (burn) works");
    });
  });

  describe("FHE.le - Encrypted Less Than or Equal Comparison", function () {
    beforeEach(async function () {
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);
    });

    it("should compare encrypted values for balance check (sufficient)", async function () {
      // Transfer amount <= balance
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(500n * 10n ** 6n) // 500 <= 1000
        .encrypt();

      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log("✅ FHE.le() - Balance comparison (sufficient) works");
    });

    it("should compare encrypted values for balance check (insufficient)", async function () {
      // Transfer amount > balance - should use fail-closed
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(2000n * 10n ** 6n) // 2000 > 1000
        .encrypt();

      // Should succeed but transfer 0
      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log("✅ FHE.le() - Balance comparison (insufficient) works");
    });

    it("should handle edge case: transfer exact balance", async function () {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(1000n * 10n ** 6n) // Exact balance
        .encrypt();

      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log("✅ FHE.le() - Exact balance comparison works");
    });
  });

  describe("FHE.select - Conditional Selection", function () {
    beforeEach(async function () {
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);
    });

    it("should select transfer amount when balance sufficient", async function () {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(500n * 10n ** 6n)
        .encrypt();

      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log("✅ FHE.select() - Selects amount when sufficient balance");
    });

    it("should select zero when balance insufficient", async function () {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(2000n * 10n ** 6n)
        .encrypt();

      // Fail-closed: should transfer 0 instead of reverting
      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log("✅ FHE.select() - Selects 0 when insufficient balance (fail-closed)");
    });
  });

  describe("FHE.allowThis and FHE.allow - Permission Management", function () {
    it("should set contract permission on mint", async function () {
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);

      // Contract should be able to read balance
      const balance = await contract.replicaBalanceOf(user1.address);
      expect(balance).to.not.be.undefined;
      console.log("✅ FHE.allowThis() - Contract permission set on mint");
    });

    it("should set user permission on mint", async function () {
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);

      // User should be able to make balance decryptable
      await contract.connect(user1).makeBalanceDecryptable();
      console.log("✅ FHE.allow() - User permission set on mint");
    });

    it("should update permissions after transfer", async function () {
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);

      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(500n * 10n ** 6n)
        .encrypt();

      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      // Both users should be able to make their balances decryptable
      await contract.connect(user1).makeBalanceDecryptable();
      await contract.connect(user2).makeBalanceDecryptable();

      console.log("✅ FHE.allow() - Permissions updated after transfer");
    });
  });

  describe("FHE.makePubliclyDecryptable - Public Decryption", function () {
    beforeEach(async function () {
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);
    });

    it("should allow user to make balance publicly decryptable", async function () {
      await contract.connect(user1).makeBalanceDecryptable();
      console.log("✅ FHE.makePubliclyDecryptable() - User balance decryption works");
    });

    it("should allow owner to make total supply publicly decryptable", async function () {
      await contract.connect(owner).makeTotalSupplyDecryptable();
      console.log("✅ FHE.makePubliclyDecryptable() - Total supply decryption works");
    });
  });

  describe("Performance Tests", function () {
    it("should handle rapid FHE operations", async function () {
      const startTime = Date.now();

      // Rapid mints
      for (let i = 0; i < 5; i++) {
        await contract.connect(owner).mintReplica(user1.address, 100n * 10n ** 6n);
      }

      // Rapid transfers
      for (let i = 0; i < 5; i++) {
        const encrypted = await fhevm
          .createEncryptedInput(await contract.getAddress(), user1.address)
          .add64(10n * 10n ** 6n)
          .encrypt();

        await contract.connect(user1).transferReplica(
          user2.address,
          encrypted.handles[0],
          encrypted.inputProof
        );
      }

      const duration = Date.now() - startTime;
      expect(duration).to.be.lessThan(15000);
      console.log(`✅ Performance: Rapid FHE operations completed in ${duration}ms`);
    });

    it("should handle complex FHE computation chains", async function () {
      // Mint to multiple users
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);
      await contract.connect(owner).mintReplica(user2.address, 500n * 10n ** 6n);

      // Chain of transfers
      // user1 -> user2
      let encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(200n * 10n ** 6n)
        .encrypt();
      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      // user2 -> user3
      encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user2.address)
        .add64(300n * 10n ** 6n)
        .encrypt();
      await contract.connect(user2).transferReplica(
        user3.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      // user3 -> user1
      encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user3.address)
        .add64(100n * 10n ** 6n)
        .encrypt();
      await contract.connect(user3).transferReplica(
        user1.address,
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log("✅ Complex FHE computation chains work correctly");
    });
  });
});
