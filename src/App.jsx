import React, { useReducer, useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  User as UserIcon, 
  Lock, 
  Unlock, 
  History, 
  CheckCircle,
  Clock,
  ChevronRight,
  Monitor,
  Settings,
  Zap,
  ShieldCheck,
  TrendingUp,
  Server,
  Fingerprint,
  LogOut,
  Key
} from 'lucide-react';

/**
 * INITIAL STATE
 */
const initialState = {
  currentUser: { id: "u1", name: "Admin User", role: "admin" },
  users: [
    { id: "u1", name: "Admin User", role: "admin", email: "admin@soc.pilot", permissions: "Full Read/Write Access" },
    { id: "u2", name: "Analyst Joe", role: "analyst", email: "j.doe@soc.pilot", permissions: "Incident Management Only" },
    { id: "u3", name: "Viewer Sam", role: "viewer", email: "sam.v@soc.pilot", permissions: "Read-Only Observer" }
  ],
  incidents: [
    { id: "INC-001", title: "Credential Stuffing Attempt", status: "open", severity: "high", description: "Multiple failed login attempts from IP 192.168.1.50. Origin: FR-Paris.", timestamp: "2026-04-13T10:00:00Z", assignedTo: null, isBeingEscalated: false },
    { id: "INC-002", title: "Critical Data Leak Detection", status: "open", severity: "critical", description: "Exfiltration of encrypted payloads to unauthorized bucket s3://hidden-data-leak.", timestamp: "2026-04-13T12:00:00Z", assignedTo: "u2", isBeingEscalated: false },
    { id: "INC-003", title: "Suspicious API Activity", status: "open", severity: "low", description: "Abnormal rate of 401 Unauthorized responses on /api/v1/auth.", timestamp: "2026-04-13T12:45:00Z", assignedTo: null, isBeingEscalated: false }
  ],
  nodes: [
    { id: 'srv-eu-01', name: 'EU-West-Primary', type: 'Core API', status: 'online', cpu: '42%', ram: '12.4GB', health: 98 },
    { id: 'srv-us-02', name: 'US-East-Edge', type: 'Load Balancer', status: 'online', cpu: '18%', ram: '4.1GB', health: 100 },
    { id: 'srv-as-05', name: 'ASIA-South-DB', type: 'Registry/DB', status: 'maintenance', cpu: '85%', ram: '64.0GB', health: 76 }
  ],
  auditLog: []
};

/**
 * RBAC ENGINE
 */
const RBAC = {
  canEditStatus: (role) => ['admin', 'analyst'].includes(role),
  canEscalate: (role) => role === 'admin',
  canAssign: (role, assigneeId, currentUserId) => {
    if (role === 'admin') return true;
    if (role === 'analyst') return assigneeId === currentUserId;
    return false;
  },
  canAddNote: (role) => ['admin', 'analyst'].includes(role)
};

/**
 * REDUCER
 */
function socReducer(state, action) {
  const timestamp = new Date().toISOString();
  switch (action.type) {
    case 'SWITCH_USER':
      return { ...state, currentUser: state.users.find(u => u.id === action.userId) || state.currentUser };
    case 'UPDATE_INCIDENT':
      if (state.currentUser.role === 'viewer') {
        console.error('RBAC BLOCK: Viewers cannot mutate state.');
        return state;
      }
      const idx = state.incidents.findIndex(i => i.id === action.incidentId);
      if (idx === -1) return state;
      const old = state.incidents[idx];
      const updates = { ...action.updates };
      const role = state.currentUser.role;

      // INTERNAL SECURITY VALIDATIONS
      if ('isBeingEscalated' in updates && updates.isBeingEscalated !== old.isBeingEscalated) {
        if (!RBAC.canEscalate(role)) {
          console.error(`RBAC BLOCK: Role '${role}' lacks permission to ESCALATE.`);
          return state;
        }
      }
      if ('status' in updates && updates.status !== old.status) {
        if (!RBAC.canEditStatus(role)) {
          console.error(`RBAC BLOCK: Role '${role}' lacks permission to change STATUS.`);
          return state;
        }
      }
      if ('assignedTo' in updates && updates.assignedTo !== old.assignedTo) {
        if (!RBAC.canAssign(role, updates.assignedTo, state.currentUser.id)) {
          console.error(`RBAC BLOCK: Role '${role}' lacks permission to ASSIGN.`);
          return state;
        }
      }
      
      // Notes handler
      if ('newNote' in updates) {
        if (!RBAC.canAddNote(role)) {
          console.error(`RBAC BLOCK: Role '${role}' lacks permission to add NOTES.`);
          return state;
        }
        const currentNotes = old.notes || [];
        updates.notes = [...currentNotes, { id: `nt-${Date.now()}`, author: state.currentUser.name, text: updates.newNote }];
        delete updates.newNote;
      }

      if (updates.isBeingEscalated && old.isBeingEscalated) return state;
      
      const updated = { ...old, ...updates };
      const newIncidents = [...state.incidents];
      newIncidents[idx] = updated;
      const newLogs = [];
      Object.keys(action.updates).forEach(key => {
        if (old[key] !== updated[key]) {
          let actLog = key === 'status' ? 'STATUS_CHANGE' : key === 'assignedTo' ? 'ASSIGNMENT' : key === 'isBeingEscalated' ? 'ESCALATION' : 'UPDATE';
          newLogs.push({
             id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
             incidentId: action.incidentId,
             action: actLog,
             userId: state.currentUser.id,
             userName: state.currentUser.name,
             timestamp,
             field: key,
             previousValue: String(old[key] || 'None'),
             newValue: String(updated[key] || 'None')
          });
        }
      });
      return { ...state, incidents: newIncidents, auditLog: [...newLogs, ...state.auditLog] };
    case 'AUTO_RELEASE_LOCK':
      return { ...state, incidents: state.incidents.map(inc => inc.id === action.incidentId ? { ...inc, isBeingEscalated: false } : inc) };
    default: return state;
  }
}

/**
 * UI COMPONENTS
 */
const SidebarItem = ({ icon: Icon, label, active, onClick, bottom }) => (
  <div className="sidebar-item" onClick={onClick} style={{
    padding: '20px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    color: active ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
    borderRight: active ? '3px solid var(--primary)' : '3px solid transparent',
    transition: 'var(--transition)',
    background: active ? 'rgba(30, 215, 96, 0.05)' : 'transparent',
    marginTop: bottom ? 'auto' : '0'
  }}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>{label}</span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span>
      <Icon size={16} color={color} />
    </div>
    <div className="stat-value" style={{ color: color }}>{value}</div>
  </div>
);

export default function App() {
  const [state, dispatch] = useReducer(socReducer, initialState);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedIncidentId, setExpandedIncidentId] = useState(null);
  const locksRef = useRef({});

  useEffect(() => {
    state.incidents.forEach(inc => {
      if (inc.isBeingEscalated && !locksRef.current[inc.id]) {
        locksRef.current[inc.id] = setTimeout(() => {
          dispatch({ type: 'AUTO_RELEASE_LOCK', incidentId: inc.id });
          delete locksRef.current[inc.id];
        }, 15000);
      }
    });
  }, [state.incidents]);

  const stats = {
    total: state.incidents.length,
    critical: state.incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length,
    active: state.incidents.filter(i => i.status === 'open').length,
    resolved: state.incidents.filter(i => i.status === 'resolved').length,
    userActions: state.auditLog.filter(l => l.userId === state.currentUser.id).length
  };

  return (
    <div className="dashboard-container" style={{ gridTemplateColumns: '90px 1fr' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '30px 0', textAlign: 'center' }}>
          <Zap fill="var(--primary)" color="var(--primary)" size={32} />
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <SidebarItem icon={Activity} label="Stream" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Monitor} label="Nodes" active={activeTab === 'nodes'} onClick={() => setActiveTab('nodes')} />
          <SidebarItem icon={History} label="Audit" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
          <SidebarItem icon={Settings} label="Config" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <SidebarItem icon={UserIcon} label="Account" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} bottom />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'var(--primary)', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.1em' }}>
              <TrendingUp size={14} /> LIVE_OPS <ChevronRight size={10} /> {activeTab.toUpperCase()}
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-0.04em' }}>
              {activeTab === 'dashboard' && 'Command Center'}
              {activeTab === 'nodes' && 'Network Topology'}
              {activeTab === 'audit' && 'Audit Ledger'}
              {activeTab === 'settings' && 'System Parameters'}
              {activeTab === 'profile' && 'Identity & Security'}
            </h1>
          </div>
          <div className="card" style={{ padding: '12px 20px', borderRadius: '500px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 215, 96, 0.1)', border: '1px solid rgba(30, 215, 96, 0.3)' }}>
            <Shield size={16} color="var(--primary)" />
            <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary)' }}>{state.currentUser.role.toUpperCase()} MODE</span>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <section className="stats-grid">
              <StatCard icon={AlertTriangle} label="Critical Alerts" value={stats.critical} color={stats.critical > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
              <StatCard icon={Clock} label="Active Incidents" value={stats.active} color="var(--warning)" />
              <StatCard icon={CheckCircle} label="Total Resolved" value={stats.resolved} color="var(--success)" />
              <StatCard icon={Activity} label="Health Index" value="98.2%" color="var(--primary)" />
            </section>
            <div style={{ display: 'grid', gap: '16px' }}>
              {state.incidents.map((inc, i) => (
                <div key={inc.id} className={`card ${inc.severity === 'critical' ? 'critical' : ''}`} style={{ animationDelay: `${i * 0.1}s`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedIncidentId(expandedIncidentId === inc.id ? null : inc.id)}>
                      <div style={{ height: '40px', width: '2px', background: inc.severity === 'critical' ? 'var(--danger)' : 'var(--primary)', opacity: inc.status === 'resolved' ? 0.2 : 1 }} />
                      <div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                          <span className={`incident-badge badge-${inc.severity}`}>{inc.severity}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>{inc.id}</span>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>{inc.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '700px' }}>{inc.description}</p>
                      </div>
                    </div>
                     <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {inc.status === 'resolved' ? ( <div style={{ color: 'var(--success)', fontWeight: 900, fontSize: '12px' }}>✓ SYSTEM_SAFE</div> ) : (
                        <>
                          <button className="btn" disabled={!RBAC.canAssign(state.currentUser.role, state.currentUser.id, state.currentUser.id) || (inc.assignedTo && state.currentUser.role !== 'admin')} onClick={(e) => { e.stopPropagation(); dispatch({ type: 'UPDATE_INCIDENT', incidentId: inc.id, updates: { assignedTo: state.currentUser.id } }) }} style={{ background: 'transparent', color: 'var(--text-primary)', border: `1px solid ${inc.assignedTo ? 'var(--border)' : 'var(--primary)'}` }}> {inc.assignedTo ? (state.currentUser.role === 'admin' && inc.assignedTo !== state.currentUser.id ? 'REASSIGN ALIAS' : 'ASSIGNED') : 'ASSIGN TO ME'} </button>
                          <button className="btn" disabled={!RBAC.canEscalate(state.currentUser.role) || inc.isBeingEscalated} onClick={(e) => { e.stopPropagation(); dispatch({ type: 'UPDATE_INCIDENT', incidentId: inc.id, updates: { isBeingEscalated: true } }) }} style={{ background: inc.isBeingEscalated ? 'var(--bg-card-hover)' : 'var(--primary)', width: inc.isBeingEscalated ? '160px' : 'auto' }}>
                            {inc.isBeingEscalated ? <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Clock size={16}/> LOCK_15S</span> : 'ESCALATE'}
                          </button>
                          <button className="btn" disabled={!RBAC.canEditStatus(state.currentUser.role)} onClick={(e) => { e.stopPropagation(); dispatch({ type: 'UPDATE_INCIDENT', incidentId: inc.id, updates: { status: 'resolved', isBeingEscalated: false } }) }} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.2)' }}> RESOLVE </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {expandedIncidentId === inc.id && (
                    <div style={{ padding: '20px', borderTop: '1px solid var(--border)', marginTop: '8px', animation: 'fadeIn 0.3s ease-out' }}>
                      {/* Notes Section */}
                      <div style={{ marginBottom: '32px' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--primary)' }}>Investigative Notes</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {(inc.notes || []).length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No notes explicitly added.</div>}
                          {(inc.notes || []).map(n => (
                            <div key={n.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '4px', fontSize: '13px' }}>
                              <span style={{ fontWeight: 800, color: 'var(--primary)', marginRight: '8px' }}>{n.author}:</span>
                              <span>{n.text}</span>
                            </div>
                          ))}
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); const val = e.target.elements.note.value; if(val) { dispatch({ type: 'UPDATE_INCIDENT', incidentId: inc.id, actionLabel: 'NOTE_ADDED', updates: { newNote: val } }); e.target.reset(); } }} onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '8px' }}>
                          <input name="note" disabled={!RBAC.canAddNote(state.currentUser.role)} placeholder={RBAC.canAddNote(state.currentUser.role) ? "Append security note..." : "Viewers cannot append notes"} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} />
                          <button type="submit" disabled={!RBAC.canAddNote(state.currentUser.role)} className="btn" style={{ padding: '10px 20px' }}>APPEND</button>
                        </form>
                      </div>

                      <h4 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--primary)' }}>Incident Timeline (Audit Log)</h4>
                      {state.auditLog.filter(l => l.incidentId === inc.id).length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No actions logged yet.</div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {state.auditLog.filter(l => l.incidentId === inc.id).map(log => (
                            <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '16px', fontSize: '12px', alignItems: 'center', background: 'var(--bg-dark)', padding: '12px', borderRadius: '4px' }}>
                              <div style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                              <div>
                                 <span style={{ fontWeight: 800, marginRight: '8px', color: 'var(--text-primary)' }}>{log.userName}</span>
                                 <span style={{ opacity: 0.7 }}>performed</span> 
                                 <span style={{ fontWeight: 800, margin: '0 8px', color: 'var(--primary)' }}>{log.action}</span>
                                 <span style={{ margin: '0 8px', opacity: 0.5 }}>on</span>
                                 <span style={{ fontWeight: 800, opacity: 0.8 }}>{log.field.toUpperCase()}</span>
                                 <br/>
                                 <div style={{ marginTop: '4px' }}>
                                   <span style={{ color: 'var(--danger)', textDecoration: 'line-through', fontSize: '11px' }}>{log.previousValue}</span> <ChevronRight size={10} style={{ margin: '0 4px', display: 'inline-block', verticalAlign: 'middle' }} /> <span style={{ color: 'var(--success)', fontSize: '11px' }}>{log.newValue}</span>
                                 </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'nodes' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {state.nodes.map((node, i) => (
              <div key={node.id} className="card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                   <Server color={node.status === 'online' ? 'var(--primary)' : 'var(--warning)'} />
                   <span style={{ fontSize: '10px', fontWeight: 900, color: node.status === 'online' ? 'var(--primary)' : 'var(--warning)' }}>{node.status.toUpperCase()}</span>
                </div>
                <h3 style={{ marginBottom: '4px' }}>{node.name}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>{node.type} • {node.id}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="card" style={{ padding: '12px', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ fontSize: '10px', opacity: 0.5 }}>CPU LOAD</div>
                    <div style={{ fontWeight: 800 }}>{node.cpu}</div>
                  </div>
                  <div className="card" style={{ padding: '12px', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ fontSize: '10px', opacity: 0.5 }}>RAM USE</div>
                    <div style={{ fontWeight: 800 }}>{node.ram}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="card" style={{ padding: 0 }}>
            {state.auditLog.map(log => (
              <div key={log.id} style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', textAlign: 'center', color: 'var(--bg-dark)', lineHeight: '32px' }}>{log.userName.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800 }}>{log.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--primary)' }}>{log.action.toUpperCase()}</div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{log.timestamp}</span>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-dark)', borderRadius: '4px', fontSize: '13px' }}>
                  <div style={{ opacity: 0.6 }}>TARGET: {log.incidentId}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginTop: '8px' }}>
                    <span style={{ fontWeight: 800, opacity: 0.4 }}>{log.field.toUpperCase()}</span>
                    <span> <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{log.previousValue}</span> <ChevronRight size={12} style={{ margin: '0 10px', display: 'inline-block', verticalAlign: 'middle' }} /> <span style={{ color: 'var(--success)' }}>{log.newValue}</span> </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gap: '24px' }}>
             <div className="card">
              <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Active Protocols</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="card" style={{ background: 'rgba(30, 215, 96, 0.05)', borderColor: 'var(--primary)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>B.L.A.S.T. Framework</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Protocol v1.0 • ACTIVE</div>
                </div>
                <div className="card">
                  <div style={{ fontWeight: 800, marginBottom: '4px' }}>A.N.T. Architecture</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>3-Layer Compliance • VALIDATED</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                 <div style={{ width: '120px', height: '120px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(30, 215, 96, 0.2)' }}>
                   <UserIcon size={64} color="var(--bg-dark)" />
                 </div>
                 <div>
                   <h2 style={{ fontSize: '32px', fontWeight: 900 }}>{state.currentUser.name}</h2>
                   <div style={{ color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.1em' }}>{state.currentUser.role.toUpperCase()} • {state.currentUser.id}</div>
                   <div style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{state.currentUser.email}</div>
                 </div>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Fingerprint color="var(--primary)" />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5 }}>PERMISSIONS</div>
                      <div style={{ fontWeight: 700 }}>{state.currentUser.permissions}</div>
                    </div>
                  </div>
                </div>
                <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                   <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Activity color="var(--primary)" />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5 }}>SESSION_ANALYTICS</div>
                      <div style={{ fontWeight: 700 }}>{stats.userActions} actions logged this session</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="btn" style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', width: 'fit-content' }}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}><LogOut size={16}/> TERMINATE_SESSION</div>
              </button>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 900 }}>SWITCH_ACCOUNT</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Select an identity to test Role-Based Access Control (RBAC) constraints.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {state.users.map(u => (
                  <div 
                    key={u.id}
                    onClick={() => dispatch({ type: 'SWITCH_USER', userId: u.id })}
                    style={{ 
                      padding: '16px', background: state.currentUser.id === u.id ? 'rgba(30, 215, 96, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${state.currentUser.id === u.id ? 'var(--primary)' : 'transparent'}`,
                      cursor: 'pointer', transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800 }}>{u.name}</span>
                      {state.currentUser.id === u.id && <CheckCircle size={14} color="var(--primary)" />}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>{u.role.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RBAC Overlay */}
      {state.currentUser.role === 'viewer' && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: 'var(--danger)', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', padding: '16px 30px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000 }}>
          <Lock size={20} /> <div style={{ fontSize: '13px', fontWeight: 900 }}>SECURITY_ALERT: VIEWER_ONLY_MODE</div>
        </div>
      )}
    </div>
  );
}
