console.log("app.js loaded");

// ======================
// PAGE SWITCH
// ======================
function showPage(page) {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("attackPage").classList.add("hidden");
  document.getElementById("mitmPage").classList.add("hidden");
  document.getElementById("uePage").classList.add("hidden");
  document.getElementById(page + "Page").classList.remove("hidden");
}

// ======================
// LOG FUNCTIONS
// ======================
function logAuth(msg) {
  document.getElementById("authLog").innerText += msg + "\n";
}
function logAttack(msg) {
  document.getElementById("attackLog").innerText += msg + "\n";
}
function logMITM(msg) {
  document.getElementById("mitmLog").innerText += msg + "\n";
}
function logUE(msg) {
  document.getElementById("ueLog").innerText += msg + "\n";
}

function delay(ms = 700) {
  return new Promise((r) => setTimeout(r, ms));
}

// ======================
// AUTH FLOW
// ======================
async function startFullFlow() {
  const log = document.getElementById("authLog");
  log.innerText = "";
  const print = (msg) => (log.innerText += msg + "\n");

  print("---- FULL 5G-AKA FLOW ----");
  let res, data;

  res = await fetch("/step1", { method: "POST" });
  data = await res.json();
  await delay();
  print("UE → gNB: SUCI sent");
  await delay();
  print("SUCI: " + data.SUCI);
  await delay();

  res = await fetch("/step2", { method: "POST" });
  data = await res.json();
  print("Network generated RAND + AUTN");
  await delay();
  print("RAND: " + data.RAND);
  print("AUTN SQN: " + data.AUTN.sqn);
  print("AUTN MAC: " + data.AUTN.mac);
  await delay();

  res = await fetch("/step3", { method: "POST" });
  data = await res.json();
  await delay();
  print("checking AUTN...");
  await delay();
  if (data.error) {
    print("UE authentication FAILED ❌");
    print("ERROR: " + data.error);
    return;
  }
  print("UE authenticated successfully ✅");
  print("MAC*: " + data.MAC);
  print("RES*: " + data.RES);
  await delay();

  res = await fetch("/step4", { method: "POST" });
  data = await res.json();
  await delay();
  print("Network verifying RES* and XRES ...");
  await delay();
  print("RES: " + data.RES);
  print("XRES: " + data.XRES);
  print(data.result + " ✅");
  await delay();

  res = await fetch("/step5", { method: "POST" });
  data = await res.json();
  print("Session keys derived successfully ✅");
  print("K_SEAF: " + data.K_SEAF);
  print("K_AMF: " + data.K_AMF);
}

// ======================
// ATTACK FLOW
// ======================
async function realisticAttack() {
  document.getElementById("attackLog").innerText = "";
  const res = await fetch("/attack/realistic", { method: "POST" });
  const data = await res.json();
  logAttack("---- REALISTIC FAKE GNB ATTACK ----");
  await delay();
  logAttack("📡 " + data.phase1);
  await delay();
  logAttack("📱 " + data.phase2);
  await delay();
  logAttack("SUCI: " + data.SUCI);
  await delay();
  logAttack("⚠️ " + data.phase3);
  await delay();
  logAttack("RAND: " + data.RAND);
  if (data.AUTN) {
    logAttack("AUTN SQN: " + (data.AUTN.sqn ?? "N/A"));
    logAttack("AUTN MAC: " + (data.AUTN.mac ?? "N/A"));
  }
  await delay();
  logAttack("🔐 UE Verification...");
  await delay(1200);
  logAttack("Result: " + data.result);
  if (data.error) logAttack("❌ UE ERROR: " + data.error);
}

// ======================
// MITM ATTACK FLOW
// ======================
async function mitmAttack() {
  document.getElementById("mitmLog").innerText = "";

  const safe = (v, fallback = "N/A") =>
    v === undefined || v === null ? fallback : v;

  // STEP 0
  // STEP 0
  logMITM("╔══════════════════════════════════════╗");
  logMITM("║  STEP 0 — ATTACKER POSITIONING       ║");
  logMITM("╚══════════════════════════════════════╝");
  await delay();

  logMITM("🕵️  Attacker deploys a rogue base station (fake gNB)");
  logMITM("📶 Radio signal scan:");
  await delay();

  // ✅ YOU WERE MISSING THIS FETCH
  let res = await fetch("/mitm/step0", { method: "POST" });
  let data = await res.json();

  const signals = data?.signals;

  if (!signals) {
    logMITM("❌ No signal data received from server");
    return;
  }

  logMITM(
    "   🔴 Fake gNB  (Attacker) : " + signals.fake.dbm + " dBm  ← STRONGEST",
  );

  logMITM("   🟢 Real gNB  (Tower A)  : " + signals.real1.dbm + " dBm");
  logMITM("   🟢 Real gNB  (Tower B)  : " + signals.real2.dbm + " dBm");

  logMITM("⚡ " + data.status);
  // STEP 1
  await delay(800);
  logMITM("\n╔══════════════════════════════════════╗");
  logMITM("║  STEP 1 — FORCED ATTACHMENT          ║");
  logMITM("╚══════════════════════════════════════╝");
  await delay();

  res = await fetch("/mitm/step1", { method: "POST" });
  data = await res.json();

  logMITM("SUCI: " + safe(data.SUCI));
  logMITM("Path: UE → Fake gNB → Network");

  // STEP 2
  await delay(800);
  logMITM("\n╔══════════════════════════════════════╗");
  logMITM("║  STEP 2 — INTERCEPT AUTH DATA        ║");
  logMITM("╚══════════════════════════════════════╝");
  await delay();

  res = await fetch("/mitm/step2", { method: "POST" });
  data = await res.json();

  logMITM("RAND: " + safe(data.RAND));
  logMITM("AUTN SQN: " + safe(data.AUTN?.sqn));
  logMITM("AUTN MAC: " + safe(data.AUTN?.mac));

  // STEP 3
  await delay(800);
  logMITM("\n╔══════════════════════════════════════╗");
  logMITM("║  STEP 3 — UE VERIFICATION            ║");
  logMITM("╚══════════════════════════════════════╝");
  await delay();

  res = await fetch("/mitm/step3", { method: "POST" });
  data = await res.json();

  logMITM("MAC check : " + safe(data.mac_check));
  logMITM("SQN check : " + safe(data.sqn_check));

  if (!data.RES) {
    logMITM("❌ AUTH FAILED");
    return;
  }

  logMITM("RES: " + data.RES);

  // STEP 4
  await delay(800);
  logMITM("\n╔══════════════════════════════════════╗");
  logMITM("║  STEP 4 — REPLAY ATTACK              ║");
  logMITM("╚══════════════════════════════════════╝");
  await delay();

  res = await fetch("/mitm/step4", { method: "POST" });
  data = await res.json();

  logMITM("Replay #" + safe(data.replay_attempt));
  logMITM("RAND: " + safe(data.replayed_RAND));
  logMITM("SQN: " + safe(data.replayed_AUTN?.sqn));
  logMITM("MAC: " + safe(data.replayed_AUTN?.mac));

  // STEP 5
  await delay(800);
  logMITM("\n╔══════════════════════════════════════╗");
  logMITM("║  STEP 5 — UE DEFENSE                 ║");
  logMITM("╚══════════════════════════════════════╝");
  await delay();

  res = await fetch("/mitm/step5", { method: "POST" });
  data = await res.json();

  logMITM("MAC check : " + safe(data.mac_check));
  logMITM("SQN check : " + safe(data.sqn_check));

  logMITM("\n" + safe(data.attack_result, "ATTACK RESULT UNKNOWN"));
}
// ======================
// SHOW CAPTURED DATA
// ======================
async function showCapturedData() {
  document.getElementById("mitmLog").innerText = "";

  const res = await fetch("/mitm/captured");
  const data = await res.json();

  logMITM("\n── Identity ──────────────────────────");
  logMITM("SUCI: " + (data.suci ?? "NOT CAPTURED"));

  const auth = data.captured_auth || {};

  logMITM("\n── Authentication Data ───────────────");
  logMITM("RAND: " + (auth.RAND ?? "NOT CAPTURED"));
  logMITM("AUTN SQN: " + (auth.AUTN?.sqn ?? "NOT CAPTURED"));
  logMITM("AUTN MAC: " + (auth.AUTN?.mac ?? "NOT CAPTURED"));
  logMITM("Captured at: " + (auth.capturedAt ?? "NOT CAPTURED"));

  logMITM("\n── Attack Timeline ───────────────────");
  if (data.timeline && data.timeline.length > 0) {
    data.timeline.forEach((entry, i) => {
      logMITM(`   #${i + 1} [${entry.time}] ${entry.event}  (${entry.type})`);
      if (entry.rand) logMITM(`       RAND: ${entry.rand}`);
      if (entry.mac) logMITM(`       MAC:  ${entry.mac}`);
      if (entry.detail) logMITM(`       Note: ${entry.detail}`);
    });
  } else {
    logMITM("   (no events logged yet)");
  }
}

// ======================
// UE LOGS
// ======================

async function showUELogs() {
  const res = await fetch("/logs/all");
  const data = await res.json();

  document.getElementById("ueLog").innerText = "";
  logUE("---- UE + ATTACK LOGS ----");

  const logs = data.logs || [];

  logs.forEach((l) => {
    logUE(l);
  });
}

async function showAttackLogs() {
  const res = await fetch("/attack/logs");
  const data = await res.json();

  document.getElementById("attackLog").innerText = "";
  logAttack("---- ATTACK LOGS ----");

  const logs = data.logs || [];

  logs.forEach((l) => {
    logAttack(l);
  });
}

async function showCapturedData() {
  document.getElementById("mitmLog").innerText = "";

  const res = await fetch("/mitm/captured");
  const data = await res.json();

  logMITM("── Identity ──────────────────────────");
  logMITM("SUCI: " + (data.suci || "NOT CAPTURED"));

  const auth = data.captured_auth || {};

  logMITM("\n── Authentication Data ───────────────");
  logMITM("RAND: " + (auth.RAND || "NOT CAPTURED"));
  logMITM("AUTN SQN: " + (auth.AUTN?.sqn || "NOT CAPTURED"));
  logMITM("AUTN MAC: " + (auth.AUTN?.mac || "NOT CAPTURED"));
  logMITM("Captured at: " + (auth.capturedAt || "NOT CAPTURED"));

  logMITM("\n── Attack Timeline ───────────────────");

  const timeline = data.timeline || [];

  if (timeline.length === 0) {
    logMITM("   (no events yet)");
    return;
  }

  timeline.forEach((entry, i) => {
    logMITM(
      `#${i + 1} | ${entry.event} | ${entry.source} | ${entry.result} | ${entry.time}`,
    );

    if (entry.suci) logMITM("   SUCI: " + entry.suci);
  });
}
