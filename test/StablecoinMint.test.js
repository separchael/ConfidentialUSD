const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("ShadowStablecoinMint - Basic Functionality Tests", function () {
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

  it("should deploy contract successfully", async function () {
    expect(await contract.getAddress()).to.be.properAddress;
    console.log("✅ Contract deployed at:", await contract.getAddress());
  });

  it("should have correct token info", async function () {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();

    expect(name).to.equal("Confidential USD");
    expect(symbol).to.equal("cUSD");
    expect(decimals).to.equal(6);
    console.log("✅ Token info correct: cUSD with 6 decimals");
  });

  it("should set deployer as owner", async function () {
    const contractOwner = await contract.owner();
    expect(contractOwner).to.equal(owner.address);
    console.log("✅ Owner set correctly:", owner.address);
  });

  it("should have correct default faucet settings", async function () {
    const faucetAmount = await contract.faucetAmount();
    const faucetCooldown = await contract.faucetCooldown();

    expect(faucetAmount).to.equal(1000n * 10n ** 6n); // 1000 cUSD
    expect(faucetCooldown).to.equal(86400n); // 24 hours
    console.log("✅ Faucet settings correct: 1000 cUSD, 24h cooldown");
  });

  it("should mint tokens to user (owner only)", async function () {
    const mintAmount = 500n * 10n ** 6n; // 500 cUSD

    await contract.connect(owner).mintReplica(user1.address, mintAmount);

    const balance = await contract.replicaBalanceOf(user1.address);
    expect(balance).to.not.be.undefined;
    console.log("✅ Minted 500 cUSD to user1");
  });

  it("should prevent non-owner from minting", async function () {
    const mintAmount = 500n * 10n ** 6n;

    await expect(
      contract.connect(user1).mintReplica(user2.address, mintAmount)
    ).to.be.revertedWith("Not owner");

    console.log("✅ Non-owner mint correctly rejected");
  });

  it("should allow user to claim from faucet", async function () {
    await contract.connect(user1).claimReplicaFaucet();

    const balance = await contract.replicaBalanceOf(user1.address);
    expect(balance).to.not.be.undefined;
    console.log("✅ User1 claimed from faucet successfully");
  });

  it("should enforce faucet cooldown", async function () {
    // First claim
    await contract.connect(user1).claimReplicaFaucet();

    // Second claim should fail (cooldown not elapsed)
    await expect(
      contract.connect(user1).claimReplicaFaucet()
    ).to.be.revertedWith("Faucet cooldown not elapsed");

    console.log("✅ Faucet cooldown enforced correctly");
  });

  it("should allow faucet claim after cooldown", async function () {
    // First claim
    await contract.connect(user1).claimReplicaFaucet();

    // Advance time by 24 hours + 1 second
    await ethers.provider.send("evm_increaseTime", [86401]);
    await ethers.provider.send("evm_mine", []);

    // Second claim should succeed
    await contract.connect(user1).claimReplicaFaucet();

    console.log("✅ Faucet claim allowed after cooldown");
  });

  it("should return correct time until next claim", async function () {
    // Before first claim
    let timeUntilClaim = await contract.replicaTimeUntilNextClaim(user1.address);
    expect(timeUntilClaim).to.equal(0);

    // After first claim
    await contract.connect(user1).claimReplicaFaucet();
    timeUntilClaim = await contract.replicaTimeUntilNextClaim(user1.address);
    expect(timeUntilClaim).to.be.greaterThan(0);

    console.log("✅ Time until next claim calculated correctly");
  });
});
