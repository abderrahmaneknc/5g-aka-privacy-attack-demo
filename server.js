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

// ================= STATE =================
let session = {};
let mitmSession = {};
let ueLogs = [];
let attackLogs = [];
let lastAuthSnapshot = null;

// ================= LOG HELPER =================
function addLog(list, log) {
  list.push({
    event: log.event,
    suci: log.suci || "",
    source: log.source,
    result: log.result || "N/A",
    time: log.time,
  });
}

// ======================================================
// REAL AUTH FLOW
// ======================================================

app.post("/step1", (req, res) => {
  const suci = ue.generateSUCI();
  session.suci = suci;

  addLog(ueLogs, {
    event: "UE_SENDS_SUCI",
    suci,
    source: "REAL",
    result: "OK",
    time: new Date().toLocaleTimeString(),
  });

  res.json({ SUCI: suci });
});

app.post("/step2", (req, res) => {
  const auth = udm.generateAuthData("user1");
  session.auth = auth;

  lastAuthSnapshot = {
    RAND: auth.RAND,
    AUTN: auth.AUTN,
    capturedAt: new Date().toLocaleTimeString(),
  };

  attacker.captureAuth(auth);

  res.json(auth);
});

app.post("/step3", (req, res) => {
  const result = ue.verifyAUTN(session.auth.RAND, session.auth.AUTN);

  if (!result.ok) return res.json(result);

  session.res = ue.computeRES(session.auth.RAND);

  res.json({
    RES: session.res,
    MAC: session.auth.AUTN.mac,
  });
});

app.post("/step4", (req, res) => {
  const success = session.res === session.auth.XRES;

  res.json({
    RES: session.res,
    XRES: session.auth.XRES,
    result: success ? "SUCCESS" : "FAILED",
  });
});

app.post("/step5", (req, res) => {
  res.json({
    K_SEAF: "K_SEAF_" + session.auth.RAND,
    K_AMF: "K_AMF_K_SEAF_" + session.auth.RAND,
  });
});

// ======================================================
// ATTACK FLOW
// ======================================================

app.post("/attack/realistic", (req, res) => {
  const suci = ue.generateSUCI();

  fakeGnb.interceptSUCI(suci);
  attacker.capture(suci);

  const fakeAuth = fakeGnb.sendFakeChallenge();

  addLog(attackLogs, {
    event: "FAKE_GNB_ATTACK",
    suci,
    source: "MITM",
    result: "CAPTURED",
    time: new Date().toLocaleTimeString(),
  });

  const result = ue.verifyAUTN(fakeAuth.RAND, fakeAuth.AUTN);

  res.json({
    SUCI: suci,
    RAND: fakeAuth.RAND,
    AUTN: fakeAuth.AUTN,
    result: result.ok ? "UNEXPECTED SUCCESS" : "REJECTED",
  });
});

// ======================================================
// MITM FLOW
// ======================================================

app.post("/mitm/step0", (req, res) => {
  mitmSession = {};
  attacker.reset();

  res.json({
    status: "Fake gNB active",
    signals: {
      fake: { dbm: -62 },
      real1: { dbm: -88 },
      real2: { dbm: -91 },
    },
  });
});

app.post("/mitm/step1", (req, res) => {
  const suci = ue.generateSUCI();
  mitmSession.suci = suci;

  addLog(attackLogs, {
    event: "SUCI_INTERCEPTED",
    suci,
    source: "MITM",
    result: "CAPTURED",
    time: new Date().toLocaleTimeString(),
  });

  res.json({ SUCI: suci });
});

app.post("/mitm/step2", (req, res) => {
  if (!lastAuthSnapshot) {
    return res.json({ error: "NO_CAPTURED_AUTH_AVAILABLE" });
  }

  mitmSession.auth = {
    RAND: lastAuthSnapshot.RAND,
    AUTN: lastAuthSnapshot.AUTN,
  };

  res.json(mitmSession.auth);
});

app.post("/mitm/step3", (req, res) => {
  const auth = mitmSession.auth;

  const result = ue.verifyAUTN(auth.RAND, auth.AUTN);

  if (result.ok) {
    mitmSession.res = ue.computeRES(auth.RAND);
  }

  res.json({
    mac_check: result.mac_ok ? "PASS" : "FAIL",
    sqn_check: result.sqn_ok ? "VALID" : "REPLAY",
    RES: mitmSession.res || null,
  });
});

app.post("/mitm/step4", (req, res) => {
  const auth = mitmSession.auth;

  mitmSession.replayAttempt = (mitmSession.replayAttempt || 0) + 1;

  res.json({
    replayed_RAND: auth.RAND,
    replayed_AUTN: auth.AUTN,
    replay_attempt: mitmSession.replayAttempt,
  });
});

app.post("/mitm/step5", (req, res) => {
  const auth = mitmSession.auth;

  const result = ue.verifyAUTN(auth.RAND, auth.AUTN);

  res.json({
    mac_check: "PASS",
    sqn_check: result.ok ? "FRESH" : "REPLAY BLOCKED",
    attack_result: result.ok ? "SHOULD NOT HAPPEN" : "ATTACK BLOCKED",
  });
});

// ======================================================
// LOG ENDPOINTS
// ======================================================

app.get("/ue/logs", (req, res) => {
  const formatted = ueLogs.map(
    (l) => `${l.event} | ${l.suci} | ${l.source} | ${l.result} | ${l.time}`,
  );

  res.json({ logs: formatted });
});

app.get("/attack/logs", (req, res) => {
  const formatted = attackLogs.map(
    (l) => `${l.event} | ${l.suci} | ${l.source} | ${l.result} | ${l.time}`,
  );

  res.json({ logs: formatted });
});

app.get("/logs/all", (req, res) => {
  const merged = [...ueLogs, ...attackLogs];

  const formatted = merged.map(
    (l) => `${l.event} | ${l.suci} | ${l.source} | ${l.result} | ${l.time}`,
  );

  res.json({ logs: formatted });
});
app.get("/mitm/captured", (req, res) => {
  res.json({
    suci: mitmSession.suci || session.suci || "NOT CAPTURED",
    captured_auth: lastAuthSnapshot || null,
    timeline: attackLogs,
  });
});
// ======================================================
app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
