const crypto = require("crypto");

class UE {
  constructor(id, key) {
    this.id = id;
    this.K = key;
    this.lastSqn = 0;
  }

  generateSUCI() {
    return "SUCI_" + this.id;
  }

  verifyAUTN(rand, autn) {
    const { sqn, mac } = autn;

    if (sqn <= this.lastSqn) {
      return { ok: false, error: "REPLAY / SYNC FAILURE" };
    }

    const expectedMac = crypto
      .createHash("sha256")
      .update(this.K + rand + sqn)
      .digest("hex");

    if (expectedMac !== mac) {
      return { ok: false, error: "MAC FAILURE" };
    }

    this.lastSqn = sqn;

    return { ok: true };
  }

  computeRES(rand) {
    return crypto
      .createHash("sha256")
      .update(this.K + rand)
      .digest("hex");
  }
}

module.exports = UE;
