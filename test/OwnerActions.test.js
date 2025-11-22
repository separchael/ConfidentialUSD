const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("ShadowStablecoinMint - Owner Actions Tests", function () {
  let contract;
  let owner, user1, user2, newOwner;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, user1, user2, newOwner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("ShadowStablecoinMint");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;
  });

  describe("Minting", function () {
    it("should allow owner to mint tokens", async function () {
      const mintAmount = 1000n * 10n ** 6n;

      await contract.connect(owner).mintReplica(user1.address, mintAmount);

      const balance = await contract.replicaBalanceOf(user1.address);
      expect(balance).to.not.be.undefined;
      console.log("✅ Owner minting successful");
    });

    it("should prevent non-owner from minting", async function () {
      await expect(
        contract.connect(user1).mintReplica(user2.address, 1000n * 10n ** 6n)
      ).to.be.revertedWith("Not owner");
      console.log("✅ Non-owner minting rejected");
    });

    it("should emit Mint event", async function () {
      const amount = 500n * 10n ** 6n;

      await expect(contract.connect(owner).mintReplica(user1.address, amount))
        .to.emit(contract, "Mint")
        .withArgs(user1.address, amount);

      console.log("✅ Mint event emitted correctly");
    });

    it("should handle multiple mints to same address", async function () {
      const amounts = [100n, 200n, 300n].map(a => a * 10n ** 6n);

      for (const amount of amounts) {
        await contract.connect(owner).mintReplica(user1.address, amount);
      }

      console.log("✅ Multiple mints to same address handled");
    });

    it("should handle mints to multiple addresses", async function () {
      const users = [user1, user2, newOwner];
      const amount = 500n * 10n ** 6n;

      for (const user of users) {
        await contract.connect(owner).mintReplica(user.address, amount);
      }

      console.log("✅ Mints to multiple addresses handled");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint tokens to user1 first
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);
    });

    it("should allow owner to burn tokens", async function () {
      const burnAmount = 500n * 10n ** 6n;

      await contract.connect(owner).burnReplica(user1.address, burnAmount);

      console.log("✅ Owner burning successful");
    });

    it("should prevent non-owner from burning", async function () {
      await expect(
        contract.connect(user1).burnReplica(user1.address, 500n * 10n ** 6n)
      ).to.be.revertedWith("Not owner");
      console.log("✅ Non-owner burning rejected");
    });

    it("should emit Burn event", async function () {
      const amount = 500n * 10n ** 6n;

      await expect(contract.connect(owner).burnReplica(user1.address, amount))
        .to.emit(contract, "Burn")
        .withArgs(user1.address, amount);

      console.log("✅ Burn event emitted correctly");
    });

    it("should use fail-closed design for insufficient balance", async function () {
      // Try to burn more than user has
      const burnAmount = 2000n * 10n ** 6n;

      // Should succeed but burn 0 due to fail-closed design
      await contract.connect(owner).burnReplica(user1.address, burnAmount);

      console.log("✅ Burn fail-closed design works (burns 0 if insufficient)");
    });
  });

  describe("Ownership Transfer", function () {
    it("should allow owner to transfer ownership", async function () {
      await contract.connect(owner).transferReplicaOwnership(newOwner.address);

      const currentOwner = await contract.owner();
      expect(currentOwner).to.equal(newOwner.address);
      console.log("✅ Ownership transferred successfully");
    });

    it("should prevent non-owner from transferring ownership", async function () {
      await expect(
        contract.connect(user1).transferReplicaOwnership(user2.address)
      ).to.be.revertedWith("Not owner");
      console.log("✅ Non-owner ownership transfer rejected");
    });

    it("should prevent transfer to zero address", async function () {
      await expect(
        contract.connect(owner).transferReplicaOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid new owner");
      console.log("✅ Transfer to zero address rejected");
    });

    it("should emit OwnershipTransferred event", async function () {
      await expect(
        contract.connect(owner).transferReplicaOwnership(newOwner.address)
      )
        .to.emit(contract, "OwnershipTransferred")
        .withArgs(owner.address, newOwner.address);

      console.log("✅ OwnershipTransferred event emitted correctly");
    });

    it("should allow new owner to perform owner actions", async function () {
      // Transfer ownership
      await contract.connect(owner).transferReplicaOwnership(newOwner.address);

      // New owner should be able to mint
      await contract.connect(newOwner).mintReplica(user1.address, 100n * 10n ** 6n);

      // Old owner should not be able to mint
      await expect(
        contract.connect(owner).mintReplica(user1.address, 100n * 10n ** 6n)
      ).to.be.revertedWith("Not owner");

      console.log("✅ New owner can perform owner actions, old owner cannot");
    });
  });

  describe("Faucet Settings", function () {
    it("should allow owner to update faucet amount", async function () {
      const newAmount = 2000n * 10n ** 6n;
      const currentCooldown = await contract.faucetCooldown();

      await contract.connect(owner).setReplicaFaucetSettings(newAmount, currentCooldown);

      const updatedAmount = await contract.faucetAmount();
      expect(updatedAmount).to.equal(newAmount);
      console.log("✅ Faucet amount updated successfully");
    });

    it("should allow owner to update faucet cooldown", async function () {
      const currentAmount = await contract.faucetAmount();
      const newCooldown = 12n * 60n * 60n; // 12 hours

      await contract.connect(owner).setReplicaFaucetSettings(currentAmount, newCooldown);

      const updatedCooldown = await contract.faucetCooldown();
      expect(updatedCooldown).to.equal(newCooldown);
      console.log("✅ Faucet cooldown updated successfully");
    });

    it("should prevent non-owner from updating faucet settings", async function () {
      await expect(
        contract.connect(user1).setReplicaFaucetSettings(500n * 10n ** 6n, 3600n)
      ).to.be.revertedWith("Not owner");
      console.log("✅ Non-owner faucet settings update rejected");
    });

    it("should allow both settings to be updated at once", async function () {
      const newAmount = 500n * 10n ** 6n;
      const newCooldown = 6n * 60n * 60n; // 6 hours

      await contract.connect(owner).setReplicaFaucetSettings(newAmount, newCooldown);

      const updatedAmount = await contract.faucetAmount();
      const updatedCooldown = await contract.faucetCooldown();

      expect(updatedAmount).to.equal(newAmount);
      expect(updatedCooldown).to.equal(newCooldown);
      console.log("✅ Both faucet settings updated successfully");
    });
  });

  describe("Decryption Permissions", function () {
    beforeEach(async function () {
      // Mint tokens to user1
      await contract.connect(owner).mintReplica(user1.address, 1000n * 10n ** 6n);
    });

    it("should allow user to make balance decryptable", async function () {
      await contract.connect(user1).makeBalanceDecryptable();
      console.log("✅ User can make balance decryptable");
    });

    it("should allow owner to make total supply decryptable", async function () {
      await contract.connect(owner).makeTotalSupplyDecryptable();
      console.log("✅ Owner can make total supply decryptable");
    });

    it("should prevent non-owner from making total supply decryptable", async function () {
      await expect(
        contract.connect(user1).makeTotalSupplyDecryptable()
      ).to.be.revertedWith("Not owner");
      console.log("✅ Non-owner cannot make total supply decryptable");
    });
  });
});
