# 🔍 Findings — Research, Discoveries & Constraints

> This file stores all research outcomes, API quirks, edge cases, and constraints discovered during the project lifecycle.

---

## Discovery Phase Answers

> ⚠️ **PENDING** — Awaiting user responses to the 5 Discovery Questions.

| # | Question         | Answer |
|---|------------------|--------|
| 1 | North Star       | Dashboard SOC funcional para visualización, filtrado y gestión de incidentes en tiempo real con control de acceso granular y auditoría completa. |
| 2 | Integrations     | Ninguna externa en esta fase. Datos mock enriquecidos + Firecrawl para extracción de branding. |
| 3 | Source of Truth   | Estado local (React Context) inicializado vía esquemas JSON en gemini.md. |
| 4 | Delivery Payload | App web interactiva (React) con sistema de diseño CSS centralizado y archivos de memoria actualizados. |
| 5 | Behavioral Rules | 1. Viewers: Solo lectura. 2. Integridad: Audit Log automático. 3. Concurrencia: Un solo escalamiento a la vez por incidente. 4. Sanitización: Limpieza de HTML/JS en todos los inputs. |

---

## Research Notes

_No research conducted yet. Will populate after Blueprint phase begins._

---

## Constraints & Edge Cases

- **Audit Diffing**: The system now stores `oldValue` and `newValue` for every state change to ensure 100% observability.
- **Auto-Release Lock**: Continuous escalation is prevented by a 15-second mandatory lock, managed via React `useEffect` and `setTimeout`.
- **Branding Analysis**: The UI layout was inspired by the standard LMS sidebar structure (seen in `image.png`), combined with high-contrast Spotify styling.

---

## API & Service Quirks

_None discovered yet._

---

*Last updated: 2026-04-13 | Protocol 0*
