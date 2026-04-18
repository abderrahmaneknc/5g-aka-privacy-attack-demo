// simulation/amf.js
class AMF {
  constructor(ausf, udm) {
    this.ausf = ausf;
    this.udm = udm;
  }

  startAuth(id) {
    return this.ausf.requestAuth(this.udm, id);
  }

  verify(res, xres) {
    return this.ausf.verify(res, xres);
  }
}

module.exports = AMF;
