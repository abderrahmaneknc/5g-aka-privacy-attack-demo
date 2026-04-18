// simulation/gnb.js
class GNB {
  constructor(amf) {
    this.amf = amf;
  }

  handleRegistration(suci) {
    const id = suci.replace("SUCI_", "");
    return this.amf.startAuth(id);
  }

  verify(res, xres) {
    return this.amf.verify(res, xres);
  }
}

module.exports = GNB;
