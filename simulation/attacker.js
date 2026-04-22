class Attacker {
  constructor() {
    this.capturedAuth = null;
    this.replayAttempts = 0;
    this.logs = [];
  }

  captureAuth(auth) {
    this.capturedAuth = {
      RAND: auth.RAND,
      AUTN: auth.AUTN,
      capturedAt: new Date().toLocaleTimeString(),
    };
  }

  getCapturedAuth() {
    return this.capturedAuth;
  }

  buildReplayPayload() {
    this.replayAttempts++;

    if (!this.capturedAuth) return null;

    return {
      RAND: this.capturedAuth.RAND,
      AUTN: this.capturedAuth.AUTN,
      replayAttempt: this.replayAttempts,
    };
  }

  capture(suci) {
    this.logs.push({
      suci,
      time: new Date().toLocaleTimeString(),
    });
  }

  reset() {
    this.capturedAuth = null;
    this.replayAttempts = 0;
  }
}

module.exports = Attacker;
