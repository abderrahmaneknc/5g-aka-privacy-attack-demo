# 5G-AKA Privacy & Authentication Attack Demo

Educational full-stack simulator for **5G Authentication and Key Agreement (5G-AKA)**. It walks through a legitimate authentication run, simulates a **fake gNB (rogue base station)**, and demonstrates **privacy-related threats** such as SUCI interception, MAC verification failure, and **replay** of captured challenges.

> Simplified cryptography for learning — not a production 5G implementation.

## Features

- **End-to-end 5G-AKA flow**: SUCI → RAND/AUTN → UE verification → RES/XRES check → session keys (`K_SEAF`, `K_AMF`)
- **Fake gNB attack**: forced attach, invalid AUTN, UE rejection (MAC / sync failures)
- **Attacker module**: capture authentication vectors and attempt replay
- **Live UI**: authentication, attack, and UE behavior tabs with structured logs
- **Per-subscriber tracking**: attempt counts, success/failure statistics

## Tech stack

- Node.js, Express
- Vanilla JavaScript (simulation modules + browser UI)

## Project structure

```
├── public/           # Web UI (index.html, app.js, style.css)
├── simulation/       # UE, gNB, AMF, AUSF, UDM, fake gNB, attacker
├── docs/             # Supporting notes
├── server.js         # API + static hosting
└── package.json
```

## Quick start

```bash
git clone https://github.com/abderrahmaneknc/5g-aka-privacy-attack-demo.git
cd 5g-aka-privacy-attack-demo
npm install
npm start
```

Open **http://localhost:3000** in your browser.

## Using the demo

1. **Authentication** — run the normal 5G-AKA procedure and inspect derived keys.
2. **Attack** — trigger a fake gNB scenario, then open tracking to review captured SUCI and failures.
3. **UE behavior** — compare reactions from the real network vs. the rogue base station.

## Key concepts

| Term | Meaning |
|------|---------|
| SUCI | Concealed subscriber identity sent over the air |
| AUTN | Network authentication token (includes SQN, MAC) |
| RES / XRES | UE response vs. network expected value |
| Fake gNB | Rogue base station attempting impersonation |
| Replay | Reusing a previously captured RAND/AUTN pair |

## Learning goals

- Understand how 5G-AKA binds the UE to the serving network
- See why MAC and sequence-number checks block many over-the-air attacks
- Relate authentication failures to privacy and tracking risks in rogue-cell scenarios

## Author

**Kennouche Abderrahmane**

## License

Educational use only.
