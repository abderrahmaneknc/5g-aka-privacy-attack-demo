// simulation/udm.js
const crypto = require("crypto");

class UDM {
  constructor() {
    this.users = {};
    this.sqn = {}; 
  }

  registerUser(id, key) {
    this.users[id] = key;
    this.sqn[id] = 1; 
  }

  generateAuthData(id) {
    const K = this.users[id];

    const rand = crypto.randomBytes(8).toString("hex");

    const sqn = this.sqn[id]++;

    const mac = crypto
      .createHash("sha256")
      .update(K + rand + sqn)
      .digest("hex");

    const autn = {
      sqn,
      mac,
    };
    
    const xres = crypto
      .createHash("sha256")
      .update(K + rand)
      .digest("hex");

    return {
      RAND: rand,
      AUTN: autn,
      XRES: xres,
    };
  }
}

module.exports = UDM;
