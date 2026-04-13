# 📐 SOP: Phase 2 — Link Verification (Connectivity Handshake)

## 🎯 Goal
Verify that all local resources (branding, images, and config) are accessible and correctly formatted before committing to Layer 3 (Tools) or Layer 4 (Stylize).

## 📥 Inputs
- `branding/branding.md`
- `branding/image.png`
- `package.json`

## ⚙️ Verification Logic (tools/verify_links.py)
1. **Asset Check**: Verify `branding.md` exists and contains the keys `Colors`, `Fonts`, and `Typography`.
2. **Image Check**: Verify `image.png` is a valid image file and its size is > 0.
3. **Env Check**: Verify `node_modules` exists (result of `npm install`).

## 📤 Expected Output
A JSON report in `.tmp/link_status.json` confirming all systems are GO.

---
*Created: 2026-04-13 | Layer 1: Architecture*
