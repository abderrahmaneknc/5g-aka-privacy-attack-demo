const crypto = require("crypto");

class Network {
  constructor() {
    this.users = {};
  }

  registerUser(id, key) {
    this.users[id] = key;
  }

  generateChallenge() {
    return crypto.randomBytes(8).toString("hex");
  }

  computeExpectedRES(id, rand) {
    const key = this.users[id];

    return crypto
      .createHash("sha256")
      .update(key + rand)
      .digest("hex");
  }

  verify(id, rand, res) {
    const expected = this.computeExpectedRES(id, rand);
    return expected === res;
  }
}

module.exports = Network;
