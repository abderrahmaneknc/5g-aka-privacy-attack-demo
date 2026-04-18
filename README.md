# 🔐 5G-AKA Security Simulator

A full-stack simulation of the **5G Authentication and Key Agreement (5G-AKA)** protocol, including normal authentication flow, fake gNB attack simulation, and UE (User Equipment) behavior tracking.

This project is designed for educational purposes to help understand how 5G authentication works and how attacks are detected.

---

## 📌 Features

### ✅ Full 5G-AKA Authentication Flow

* UE generates SUCI
* Network generates RAND + AUTN
* UE verifies AUTN
* UE computes RES
* Network compares RES vs XRES
* Session keys are derived (K_SEAF, K_AMF)

### ⚠️ Fake gNB Attack Simulation

* Fake base station forces connection
* Intercepts SUCI
* Sends invalid authentication challenge
* UE detects:

  * MAC Failure
  * Replay / Sync Failure

### 📊 Attack Tracking & Analysis

* Logs all attack attempts
* Tracks per device (SUCI)
* Displays:

  * Number of attempts
  * Success count
  * Failure count

### 📱 UE Behavior Monitoring

* Shows how UE reacts:

  * Normal authentication
  * Attack rejection
* Distinguishes between:

  * REAL network
  * FAKE gNB

---

## 🧱 Project Structure

```
5g-aka-simulation/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── simulation/
│   ├── ue.js
│   ├── udm.js
│   ├── fakeGnb.js
│   └── attacker.js
│
├── server.js
├── package.json
└── README.md
```

---

## ⚙️ Technologies Used

* Node.js
* Express.js
* Vanilla JavaScript
* HTML / CSS

---

## 🚀 Installation & Run

### 1. Clone the repository

```
git clone https://github.com/your-username/5g-aka-simulation.git
cd 5g-aka-simulation
```

### 2. Install dependencies

```
npm install
```

### 3. Run the server

```
node server.js
```

### 4. Open in browser

```
http://localhost:3000
```

---

## 🧪 How to Use

### 📱 Authentication Tab

Click:

```
Start Authentication
```

You will see:

* SUCI generation
* RAND & AUTN
* Verification process
* Key derivation

---

### 📡 Attack Tab

Click:

```
Simulate Attack
```

Then:

```
Show Tracking
```

You will see:

* Fake gNB activity
* UE rejection
* Attack logs
* Analysis

---

### ⚠️ UE Behavior Tab

Click:

```
Show UE Logs
```

You will see:

* UE reactions
* Authentication success/failure
* Source (REAL or FAKE)

---

## 🔍 Example Outputs

### ✅ Normal Authentication

```
---- FULL 5G-AKA FLOW ----
UE → gNB: SUCI sent
SUCI: SUCI_user1
Network generated RAND + AUTN
RAND: xxxx
AUTN SQN: 2
AUTN MAC: xxxx
checking AUTN...
UE authenticated successfully
MAC*: xxxx
RES*: xxxx
Network verifying RES* and XRES ...
RES: xxxx
XRES: xxxx
SUCCESS
Session keys derived successfully
K_SEAF: ...
K_AMF: ...
```

---

### ❌ Attack Simulation

```
---- REALISTIC FAKE GNB ATTACK ----
Fake gNB forces radio connection
UE sends SUCI
Fake authentication attempt
RAND: xxxx
AUTN MAC: fake_xxxx
UE Verification...
Result: REJECTED
UE ERROR: MAC FAILURE
```

---

### 📊 Tracking Analysis

```
SUCI_user1
Attempts: 6
Success: 0
Failures: 2
```

---

## 🧠 Key Concepts

| Concept  | Description                    |
| -------- | ------------------------------ |
| SUCI     | Concealed Subscriber Identity  |
| RAND     | Random challenge               |
| AUTN     | Authentication token           |
| RES      | Response from UE               |
| XRES     | Expected response from network |
| K_SEAF   | Session key                    |
| Fake gNB | Malicious base station         |

---

## ⚠️ Notes

* This is a simulation, not a real 5G system
* Cryptography is simplified
* Attacker success is intentionally rare

---

## 🎯 Learning Objectives

* Understand 5G authentication
* Understand UE verification process
* Learn how fake base station attacks work
* Understand MAC and SQN roles
* Detect replay attacks

---

## 📌 Future Improvements

* Graph visualization
* Real-time packet animation
* Stronger cryptography
* Multi-user simulation

---

## 👨‍💻 Author

Kennouche Abderrahmane

---

## 📜 License

Educational use only
