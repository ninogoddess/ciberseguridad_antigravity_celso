# CyberPulse Data Schema

This document defines the core data structures utilized in the CyberPulse SOC Dashboard.

## 1. User Structure
Represents a user in the system, defining their identity and role-based access control (RBAC) level.

```json
{
  "id": "string",          // Unique identifier for the user (e.g., "u1")
  "name": "string",        // Full display name of the user
  "role": "string",        // Authorized role: "admin" | "operator" | "viewer"
  "email": "string",       // User's email address
  "permissions": "string"  // Description of user's permission scope
}
```

## 2. Incident Structure
Represents a security event detected or logged into the SOC command center.

```json
{
  "id": "string",               // Unique incident identifier (e.g., "INC-001")
  "title": "string",            // Short, descriptive title of the incident
  "status": "string",           // Current operational status: "open" | "resolved"
  "severity": "string",         // Threat tier: "low" | "medium" | "high" | "critical"
  "description": "string",      // Detailed payload or contextual explanation
  "timestamp": "string",        // ISO 8601 timestamp of incident creation
  "assignedTo": "string|null",  // User ID of the operator assigned, or null if unassigned
  "isBeingEscalated": "boolean" // Lock state to prevent concurrent escalations
}
```

## 3. AuditLog Structure
Immutable ledger entry tracking any mutation inside the platform state.

```json
{
  "id": "string",                // Unique audit entry ID (e.g., "aud-1681380000000")
  "userId": "string",            // ID of the user executing the action
  "userName": "string",          // Name snapshot of the user executing the action
  "targetId": "string",          // ID of the affected resource (Incident ID, etc.)
  "action": "string",            // Human-readable action label (e.g., "Escalation requested")
  "timestamp": "string",         // ISO 8601 execution timestamp
  "diff": [                      // Array of changes performed during the action
    {
      "field": "string",         // State property modified (e.g., "status")
      "from": "string",          // Previous state value
      "to": "string"             // New state value
    }
  ]
}
```
