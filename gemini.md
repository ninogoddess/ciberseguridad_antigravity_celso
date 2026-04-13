# 📜 Project Constitution — gemini.md

> **This file is LAW.** All architectural decisions, data schemas, and behavioral rules live here.
> Only update when: a schema changes, a rule is added, or architecture is modified.

---

## 🔒 Architectural Invariants

1. **3-Layer Architecture (A.N.T.)** is enforced at all times:
   - **Layer 1 — Architecture** (`architecture/`): Markdown SOPs define all logic before code is written.
   - **Layer 2 — Navigation**: Reasoning & routing layer. Orchestrates SOPs and Tools.
   - **Layer 3 — Tools** (`tools/`): Deterministic Python scripts. Atomic, testable, no guessing.
2. **Data-First Rule**: No code is written until the JSON Data Schema (Input/Output) is defined below and confirmed by the user.
3. **Self-Annealing**: Every failure triggers Analyze → Patch → Test → Update Architecture.
4. **Deliverables vs. Intermediates**: `.tmp/` is ephemeral. Cloud payloads are the only "done" state.
5. **SOPs before Code**: If logic changes, the SOP is updated *before* the code.

---

## 📊 Data Schema

> ⚠️ **STATUS: PENDING** — Awaiting Discovery Phase (Phase 1) completion.

### Input Schema (Initial State Mock)

```json
{
  "users": [
    { "id": "u1", "name": "Admin User", "role": "admin" },
    { "id": "u2", "name": "Operator Joe", "role": "operator" },
    { "id": "u3", "name": "Viewer Sam", "role": "viewer" }
  ],
  "incidents": [
    {
      "id": "inc-001",
      "title": "Credential Stuffing Attempt",
      "status": "open",
      "severity": "high",
      "description": "Multiple failed login attempts from IP 192.168.1.50",
      "timestamp": "2026-04-13T10:00:00Z",
      "assignedTo": null,
      "isBeingEscalated": false
    }
  ],
  "auditLog": []
}
```

### Output Schema (Payload / State Update)

```json
{
  "action": "UPDATE_INCIDENT | ADD_LOG | LOGIN",
  "payload": {
    "targetId": "string",
    "changes": "object",
    "timestamp": "ISO8601",
    "userId": "string"
  }
}
```

---

## 🎯 Behavioral Rules

- **RBAC Enforcement**: Viewers must have write actions disabled/hidden in the UI.
- **Auto-Auditing**: Every mutation (Phase 3 logic) must append an entry to the `auditLog` with `userId`, `action`, and `timestamp`.
- **Escalation Lock**: The field `isBeingEscalated` must be checked before a second user can trigger an escalation action.
- **Input Sanitization**: All text inputs (descriptions, titles) must be passed through a sanitization function to strip `<script>` and HTML tags.
- **Branding**: UI reflects the "modern/high energy" style defined in `branding/branding.md`. Primary color `#1ED760`, Dark background `#121212`.
- **Identity**: SOC Pilot Dashboard branding applied via central CSS variables.

---

## 🔗 Integrations & Services

> ⚠️ **STATUS: PENDING** — Awaiting Discovery Phase.

| Service | Status | Key Ready? | Notes |
|---------|--------|------------|-------|
| Branding | ✅ Local | N/A | Using `branding/branding.md` and `image.png` |
| Mock Data| ✅ Ready | N/A | Defined in `Input Schema` |

---

## 📁 Directory Structure

```
c:\CELSO\
├── gemini.md              ← 📜 THIS FILE (Project Constitution)
├── task_plan.md            ← 📋 Phases, goals, checklists
├── findings.md             ← 🔍 Research, discoveries, constraints
├── progress.md             ← 📈 Activity log, errors, test results
├── architecture/           ← 📐 Layer 1: SOPs in Markdown
├── tools/                  ← ⚙️  Layer 3: Deterministic Python scripts
├── .tmp/                   ← 🗑️  Ephemeral intermediate files
└── .env                    ← 🔑 Environment variables & tokens
```

---

## 🛠️ Maintenance & Operations Log

### Scaling the Dashboard
- **Adding Users**: Update the `initialState.users` list in `src/App.jsx`.
- **New Incident Types**: Modify the `severity` badges in `index.css` if new levels (e.g., 'informational') are added.
- **Audit Logic**: The `diffing` engine automatically detects and logs any key-value change in the incident object.

### Deployment Triggers
1. **Build**: Run `npm run build` to generate the `/dist` folder.
2. **Cloud**: The `/dist` folder is production-ready for Vercel, Netlify, or AWS S3.

---

## ✅ Mission Debrief
- **Status**: COMPLETE
- **Deployment**: Local + Git Initialized
- **Compliance**: B.L.A.S.T. v1.0 / A.N.T. 3-Layer Verified

*Final Update: 2026-04-13 | Mission Accomplished*
