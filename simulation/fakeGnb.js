class FakeGNB {
  constructor() {
    this.capturedUsers = [];
  }

  interceptSUCI(suci) {
    const entry = {
      suci,
      time: new Date().toLocaleTimeString(),
    };

    this.capturedUsers.push(entry);
    return entry;
  }
  sendFakeChallenge() {
    return {
      RAND: require("crypto").randomBytes(8).toString("hex"),
      AUTN: {
        sqn: Math.floor(Math.random() * 10),
        mac: "fake_" + require("crypto").randomBytes(8).toString("hex"),
      },
    };
  }

  showTracking() {
    return this.capturedUsers;
  }
}

module.exports = FakeGNB;
