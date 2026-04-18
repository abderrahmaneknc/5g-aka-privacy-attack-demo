const express = require("express");
const app = express();

const UE = require("./simulation/ue");
const UDM = require("./simulation/udm");
const FakeGNB = require("./simulation/fakeGnb");
const Attacker = require("./simulation/attacker");

app.use(express.json());
app.use(express.static("public"));

// ================= INIT =================
const udm = new UDM();
const userKey = "secret123";

udm.registerUser("user1", userKey);

const ue = new UE("user1", userKey);
const fakeGnb = new FakeGNB();
const attacker = new Attacker();

let session = {};

// ================= LOG STORAGE =================
let ueLogs = []; // REAL + FAKE UE behavior (tagged)
let attackLogs = []; // ONLY fake gNB behavior

// ======================================================
// REAL AUTH FLOW
// ======================================================

app.post("/step1", (req, res) => {
  const suci = ue.generateSUCI();
  session.suci = suci;

  ueLogs.push({
    suci,
    event: "UE_SENDS_SUCI",
    source: "REAL",
    time: new Date().toLocaleTimeString(),
  });

  res.json({ message: "UE → gNB: SUCI sent", SUCI: suci });
});

app.post("/step2", (req, res) => {
  session.auth = udm.generateAuthData("user1");

  res.json({
    message: "Network generated RAND + AUTN",
    RAND: session.auth.RAND,
    AUTN: session.auth.AUTN,
  });
});

app.post("/step3", (req, res) => {
  const result = ue.verifyAUTN(session.auth.RAND, session.auth.AUTN);

  if (!result.ok) {
    ueLogs.push({
      suci: session.suci,
      event: "AUTH_FAILED",
      source: "REAL",
      error: result.error,
      time: new Date().toLocaleTimeString(),
    });

    return res.json({
      message: "UE authentication FAILED",
      error: result.error,
    });
  }

  session.res = ue.computeRES(session.auth.RAND);

  ueLogs.push({
    suci: session.suci,
    event: "AUTH_SUCCESS",
    source: "REAL",
    time: new Date().toLocaleTimeString(),
  });

  res.json({
    message: "UE authenticated successfully",
    RES: session.res,
    MAC: session.auth.AUTN.mac,
  });
});

app.post("/step4", (req, res) => {
  const success = session.res === session.auth.XRES;

  res.json({
    message: "Network verification",
    RES: session.res,
    XRES: session.auth.XRES,
    result: success ? "SUCCESS" : "FAILED",
  });
});

app.post("/step5", (req, res) => {
  const k_seaf = "K_SEAF_" + session.auth.RAND;
  const k_amf = "K_AMF_" + k_seaf;

  res.json({
    message: "Keys derived",
    K_SEAF: k_seaf,
    K_AMF: k_amf,
  });
});

// ======================================================
// REALISTIC ATTACK FLOW (CLEAN SEPARATION)
// ======================================================

app.post("/attack/realistic", (req, res) => {
  const suci = ue.generateSUCI();

  fakeGnb.interceptSUCI(suci);
  attacker.capture(suci);

  // STEP 1: forced connection
  attackLogs.push({
    suci,
    type: "ATTACK",
    event: "FAKE_GNB_FORCED_CONNECTION",
    time: new Date().toLocaleTimeString(),
  });

  // UE sees connection attempt (fake context only)
  ueLogs.push({
    suci,
    event: "UE_SENDS_SUCI",
    source: "FAKE_GNB",
    time: new Date().toLocaleTimeString(),
  });

  // STEP 2: fake authentication
  const fakeAuth = fakeGnb.sendFakeChallenge();

  attackLogs.push({
    suci,
    type: "ATTACK",
    event: "FAKE_GNB_SENDS_AUTH",
    rand: fakeAuth.RAND,
    mac: fakeAuth.AUTN?.mac,
    sqn: fakeAuth.AUTN?.sqn,
    time: new Date().toLocaleTimeString(),
  });

  // STEP 3: UE verification
  const result = ue.verifyAUTN(fakeAuth.RAND, fakeAuth.AUTN);

  if (!result.ok) {
    attackLogs.push({
      suci,
      type: "FAIL",
      event: "UE_REJECTED_FAKE_NETWORK",
      error: result.error,
      time: new Date().toLocaleTimeString(),
    });

    ueLogs.push({
      suci,
      event: "AUTH_FAILED",
      source: "FAKE_GNB",
      error: result.error,
      time: new Date().toLocaleTimeString(),
    });
  } else {
    attackLogs.push({
      suci,
      type: "SUCCESS",
      event: "UE_ACCEPTED_FAKE_NETWORK",
      time: new Date().toLocaleTimeString(),
    });

    ueLogs.push({
      suci,
      event: "AUTH_SUCCESS",
      source: "FAKE_GNB",
      time: new Date().toLocaleTimeString(),
    });
  }

  res.json({
    phase1: "Fake gNB forces connection",
    phase2: "UE sends SUCI",
    SUCI: suci,
    phase3: "Fake authentication sent",
    RAND: fakeAuth.RAND,
    AUTN: fakeAuth.AUTN,
    result: result.ok ? "UNEXPECTED SUCCESS" : "REJECTED",
    error: result.ok ? null : result.error,
  });
});

// ======================================================
// ATTACK LOGS + ANALYSIS
// ======================================================

app.get("/attack/logs", (req, res) => {
  const summary = {};

  for (const log of attackLogs) {
    if (!summary[log.suci]) {
      summary[log.suci] = {
        attempts: 0,
        success: 0,
        failures: 0,
      };
    }

    summary[log.suci].attempts++;

    if (log.type === "SUCCESS") summary[log.suci].success++;
    if (log.type === "FAIL") summary[log.suci].failures++;
  }

  res.json({
    trackedDevices: attackLogs,
    analysis: summary,
  });
});

// ======================================================
// UE LOGS
// ======================================================

app.get("/ue/logs", (req, res) => {
  res.json(ueLogs);
});

// ======================================================
app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
