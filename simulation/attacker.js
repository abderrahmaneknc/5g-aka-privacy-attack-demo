class Attacker {
  constructor() {
    this.logs = [];
  }

  capture(suci, type) {
    if (!type) type = "ATTACK";

    this.logs.push({
      suci,
      type,
      time: new Date().toLocaleTimeString(),
    });
  }

  analyze() {
    const result = {};

    for (const log of this.logs) {
      if (!log.type) continue;

      if (!result[log.suci]) {
        result[log.suci] = {
          attempts: 0,
          success: 0,
          failures: 0,
        };
      }

      if (log.type === "ATTACK") result[log.suci].attempts++;
      if (log.type === "SUCCESS") result[log.suci].success++;
      if (log.type === "FAIL") result[log.suci].failures++;
    }

    return result;
  }

  showTracking() {
    return this.logs;
  }
}

module.exports = Attacker;
