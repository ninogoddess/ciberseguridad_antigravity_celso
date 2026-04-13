# 📐 SOP: SOC Dashboard Architecture (A.N.T. Layer 1)

## 🎯 Goal
Create a deterministic, high-performance SOC dashboard in React that ensures RBAC enforcement and auditing for every state change.

## 📥 Inputs
- **Initial State**: Defined in `gemini.md` (Users, Incidents, Logs).
- **Design Specs**: Defined in `branding/branding.md` (Spotify-inspired theme).

## ⚙️ Logic & Tool Flow
1. **State Management**: Use React `useContext` + `useReducer`. Global state includes `incidents`, `users`, and `auditLog`.
2. **Action Dispatcher**: 
   - `UPDATE_INCIDENT`: 
     - RBAC: Verify role !== `viewer`.
     - LOCK: If `escalate`, set `isBeingEscalated: true` and trigger a 15-second auto-release timer.
     - AUDIT: Compare `oldState` and `newState` to log specific changes (e.g., "Status changed from OPEN to RESOLVED").
   - `ADD_LOG`: Include `timestamp`, `userId`, `action`, `targetId`, and `diff` (before/after).
   - `SANITIZE`: All text inputs must be stripped of HTML via `DOMPurify` or regex utility.
3. **UI Components (Canvas + Spotify Inspiration)**:
   - `Sidebar`: Slim vertical navigation with rounded icons (inspired by image.png).
   - `Main Content`: Clean typography with CircularSp fonts. Breadcrumbs for navigation.
   - `Timeline`: A visual audit trail showing the "before/after" of each entry.

## ⚠️ Edge Cases
- **Simultaneous Escalation**: UI must disable "Escalate" button if `isBeingEscalated` is true.
- **Empty State**: Handle zero incidents gracefully with a "Safe" status.
- **Role Switching**: Changing user role in the UI should immediately toggle write permissions.

---
*Created: 2026-04-13 | Architecture Layer*
