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

    const expectedMac = crypto
      .createHash("sha256")
      .update(this.K + rand + sqn)
      .digest("hex");

    const mac_ok = expectedMac === mac;

    // SQN rule (important FIX)
    const sqn_ok = sqn > this.lastSqn;

    console.log("\n--- UE CHECK ---");
    console.log("EXPECTED MAC :", expectedMac);
    console.log("RECEIVED MAC :", mac);
    console.log("SQN RECEIVED :", sqn, "LAST SQN:", this.lastSqn);
    console.log("MAC OK       :", mac_ok);
    console.log("SQN OK       :", sqn_ok);

    // update only if BOTH valid
    if (mac_ok && sqn_ok) {
      this.lastSqn = sqn;
    }

    return {
      mac_ok,
      sqn_ok,
      ok: mac_ok && sqn_ok,
      error: !mac_ok ? "MAC FAILURE" : "REPLAY / SYNC FAILURE",
    };
  }

  computeRES(rand) {
    return crypto
      .createHash("sha256")
      .update(this.K + rand)
      .digest("hex");
  }
}

module.exports = UE;
