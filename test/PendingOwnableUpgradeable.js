const { config, ethers, network } = require("hardhat");
const { expect } = require("chai");

describe("MockPendingOwnableUpgradeable", function () {
  before(async function () {
    this.mockPendingOwnableUpgradeableCF = await ethers.getContractFactory(
      "MockPendingOwnableUpgradeable"
    );

    this.signers = await ethers.getSigners();
    this.dev = this.signers[0];
    this.alice = this.signers[1];
    this.bob = this.signers[2];
    this.exploiter = this.signers[2];
  });

  beforeEach(async function () {
    this.mockPendingOwnableUpgradeable =
      await this.mockPendingOwnableUpgradeableCF.deploy();
    await this.mockPendingOwnableUpgradeable.initialize();
  });

  it("Should revert if a non owner tries to use owner function", async function () {
    await expect(
      this.mockPendingOwnableUpgradeable
        .connect(this.alice)
        .setPendingOwner(this.alice.address)
    ).to.be.revertedWith("PendingOwnable__NotOwner");

    await expect(
      this.mockPendingOwnableUpgradeable
        .connect(this.alice)
        .revokePendingOwner()
    ).to.be.revertedWith("PendingOwnable__NotOwner");

    await expect(
      this.mockPendingOwnableUpgradeable.connect(this.alice).becomeOwner()
    ).to.be.revertedWith("PendingOwnable__NotPendingOwner");

    await expect(
      this.mockPendingOwnableUpgradeable.connect(this.alice).renounceOwnership()
    ).to.be.revertedWith("PendingOwnable__NotOwner");
  });

  it("Should allow owner to call ownable function", async function () {
    await expect(
      this.mockPendingOwnableUpgradeable.connect(this.dev).revokePendingOwner()
    ).to.be.revertedWith("PendingOwnable__NoPendingOwner");

    await this.mockPendingOwnableUpgradeable
      .connect(this.dev)
      .setPendingOwner(this.alice.address);

    await expect(
      this.mockPendingOwnableUpgradeable
        .connect(this.dev)
        .setPendingOwner(this.alice.address)
    ).to.be.revertedWith("PendingOwnable__PendingOwnerAlreadySet");

    await this.mockPendingOwnableUpgradeable
      .connect(this.dev)
      .revokePendingOwner();

    await expect(
      this.mockPendingOwnableUpgradeable.connect(this.dev).revokePendingOwner()
    ).to.be.revertedWith("PendingOwnable__NoPendingOwner");
  });

  it("Should allow the pendingOwner to become the owner and revert on the previous owner", async function () {
    await this.mockPendingOwnableUpgradeable
      .connect(this.dev)
      .setPendingOwner(this.alice.address);

    await this.mockPendingOwnableUpgradeable.connect(this.alice).becomeOwner();

    await expect(
      this.mockPendingOwnableUpgradeable
        .connect(this.dev)
        .setPendingOwner(this.alice.address)
    ).to.be.revertedWith("PendingOwnable__NotOwner");

    await expect(
      this.mockPendingOwnableUpgradeable.connect(this.alice).becomeOwner()
    ).to.be.revertedWith("PendingOwnable__NotPendingOwner");
  });

  after(async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [],
    });
  });
});