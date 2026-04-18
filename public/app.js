console.log("app.js loaded");

// ======================
// PAGE SWITCH
// ======================
function showPage(page) {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("attackPage").classList.add("hidden");
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

function logUE(msg) {
  document.getElementById("ueLog").innerText += msg + "\n";
}

// ======================
// DELAY
// ======================
function delay() {
  return new Promise((r) => setTimeout(r, 700));
}
// ======================
// AUTH FLOW
// ======================
async function startFullFlow() {
  const log = document.getElementById("authLog");
  log.innerText = "";

  const print = (msg) => {
    log.innerText += msg + "\n";
  };

  print("---- FULL 5G-AKA FLOW ----");

  let res, data;

  // STEP 1
  res = await fetch("/step1", { method: "POST" });

  data = await res.json();
  await delay();

  print("UE → gNB: SUCI sent");
  await delay();
  await delay();

  print("SUCI: " + data.SUCI);
  await delay();
  await delay();

  // STEP 2
  res = await fetch("/step2", { method: "POST" });
  data = await res.json();

  print("Network generated RAND + AUTN");
  await delay();
  await delay();

  print("RAND: " + data.RAND);
  print("AUTN SQN: " + data.AUTN.sqn);
  print("AUTN MAC: " + data.AUTN.mac);
  await delay();

  // STEP 3
  res = await fetch("/step3", { method: "POST" });
  data = await res.json();
  await delay();
  await delay();

  print("checking AUTN...");
  await delay();
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

  // STEP 4
  res = await fetch("/step4", { method: "POST" });
  data = await res.json();
  await delay();
  await delay();

  print("Network verifying RES* and XRES ...");
  await delay();
  await delay();

  print("RES: " + data.RES);
  print("XRES: " + data.XRES);
  print(data.result + "✅");
  await delay();
  await delay();

  // STEP 5
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
  await delay();

  if (data.AUTN) {
    logAttack("AUTN SQN: " + (data.AUTN.sqn ?? "N/A"));
    logAttack("AUTN MAC: " + (data.AUTN.mac ?? "N/A"));
  }
  await delay();

  logAttack("🔐 UE Verification...");
  await delay();
  await delay();
  await delay();

  logAttack("Result: " + data.result);

  if (data.error) {
    logAttack("❌ UE ERROR: " + data.error);
  }
}

// ======================
// ATTACK LOGS
// ======================
async function showAttackLogs() {
  const res = await fetch("/attack/logs");
  const data = await res.json();

  document.getElementById("attackLog").innerText = "";

  logAttack("---- TRACKING DATA ----");

  (data.trackedDevices || []).forEach((d, i) => {
    logAttack(`#${i + 1} | ${d.suci} | ${d.type}`);
    logAttack(`   Event: ${d.event}`);
    logAttack(`   Time: ${d.time}`);

    if (d.rand) logAttack(`   RAND: ${d.rand}`);
    if (d.mac) logAttack(`   MAC: ${d.mac}`);
    if (d.error) logAttack(`   Error: ${d.error}`);
  });

  logAttack("\n---- ANALYSIS ----");

  const analysis = data.analysis || {};

  for (let suci in analysis) {
    const a = analysis[suci];

    logAttack(`📱 ${suci}`);
    logAttack(`   Attempts: ${a.attempts ?? 0}`);
    logAttack(`   Success: ${a.success ?? 0}`);
    logAttack(`   Failures: ${a.failures ?? 0}`);
  }
}

// ======================
// UE LOGS
// ======================
async function showUELogs() {
  const res = await fetch("/ue/logs");
  const data = await res.json();

  document.getElementById("ueLog").innerText = "";

  logUE("---- UE AUTH LOGS ----");

  (data || []).forEach((l) => {
    logUE(
      `${l.event} | ${l.suci || ""} | ${l.source || ""} | ${l.error || ""} | ${l.time || ""}`,
    );
  });
}
