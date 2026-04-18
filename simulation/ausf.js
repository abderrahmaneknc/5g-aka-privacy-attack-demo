// simulation/ausf.js
class AUSF {
  requestAuth(udm, id) {
    return udm.generateAuthData(id);
  }

  verify(res, xres) {
    return res === xres;
  }
}

module.exports = AUSF;
