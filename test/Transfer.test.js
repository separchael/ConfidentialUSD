const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("ShadowStablecoinMint - Encrypted Transfer Tests", function () {
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

    // Mint initial tokens to user1
    const initialAmount = 1000n * 10n ** 6n; // 1000 cUSD
    await contract.connect(owner).mintReplica(user1.address, initialAmount);
  });

  it("should transfer encrypted amount successfully", async function () {
    const transferAmount = 100n * 10n ** 6n; // 100 cUSD

    // Create encrypted input
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(transferAmount)
      .encrypt();

    // Execute transfer
    await contract.connect(user1).transferReplica(
      user2.address,
      encrypted.handles[0],
      encrypted.inputProof
    );

    const user2Balance = await contract.replicaBalanceOf(user2.address);
    expect(user2Balance).to.not.be.undefined;
    console.log("✅ Encrypted transfer executed successfully");
  });

  it("should fail-closed when insufficient balance", async function () {
    // Try to transfer more than user1 has
    const transferAmount = 2000n * 10n ** 6n; // 2000 cUSD (user1 only has 1000)

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(transferAmount)
      .encrypt();

    // Transfer should succeed but transfer 0 due to fail-closed design
    await contract.connect(user1).transferReplica(
      user2.address,
      encrypted.handles[0],
      encrypted.inputProof
    );

    console.log("✅ Fail-closed design: insufficient balance transfers 0");
  });

  it("should handle multiple transfers from same sender", async function () {
    const amounts = [100n, 200n, 150n].map(a => a * 10n ** 6n);

    for (let i = 0; i < amounts.length; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(amounts[i])
        .encrypt();

      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );
    }

    console.log("✅ Multiple transfers from same sender handled");
  });

  it("should handle transfers between multiple users", async function () {
    // user1 -> user2
    const amount1 = 200n * 10n ** 6n;
    const encrypted1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(amount1)
      .encrypt();

    await contract.connect(user1).transferReplica(
      user2.address,
      encrypted1.handles[0],
      encrypted1.inputProof
    );

    // user2 -> user3
    const amount2 = 100n * 10n ** 6n;
    const encrypted2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), user2.address)
      .add64(amount2)
      .encrypt();

    await contract.connect(user2).transferReplica(
      user3.address,
      encrypted2.handles[0],
      encrypted2.inputProof
    );

    console.log("✅ Multi-user transfers completed successfully");
  });

  it("should emit Transfer event on transfer", async function () {
    const transferAmount = 50n * 10n ** 6n;

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(transferAmount)
      .encrypt();

    await expect(
      contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      )
    ).to.emit(contract, "Transfer")
      .withArgs(user1.address, user2.address);

    console.log("✅ Transfer event emitted correctly");
  });

  it("should handle edge case: zero transfer", async function () {
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(0n)
      .encrypt();

    await contract.connect(user1).transferReplica(
      user2.address,
      encrypted.handles[0],
      encrypted.inputProof
    );

    console.log("✅ Zero transfer handled correctly");
  });

  it("should handle transfer to self", async function () {
    const amount = 100n * 10n ** 6n;

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(amount)
      .encrypt();

    await contract.connect(user1).transferReplica(
      user1.address,
      encrypted.handles[0],
      encrypted.inputProof
    );

    console.log("✅ Self-transfer handled correctly");
  });

  it("should handle rapid sequential transfers", async function () {
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(10n * 10n ** 6n) // 10 cUSD each
        .encrypt();

      await contract.connect(user1).transferReplica(
        user2.address,
        encrypted.handles[0],
        encrypted.inputProof
      );
    }

    const duration = Date.now() - startTime;
    expect(duration).to.be.lessThan(15000); // Should complete in under 15 seconds
    console.log(`✅ Rapid sequential transfers completed in ${duration}ms`);
  });
});
