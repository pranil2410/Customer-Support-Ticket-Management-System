import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import StatusBadge from './StatusBadge';

/**
 * TicketDetail Component
 * Displays full ticket information, allows updating status, editing resolution notes,
 * shows audit trail logs, and triggers XML exports.
 * 
 * @param {number} ticketId - ID of the ticket to display
 * @param {Array} users - List of users for reassignment options
 * @param {Function} onBack - Navigation callback to return to ticket list
 * @param {Function} onUpdate - Callback triggered when the ticket is updated
 */
const TicketDetail = ({ ticketId, users, onBack, onUpdate }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form edit states
  const [status, setStatus] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [sessionUserId, setSessionUserId] = useState(5); // Default: system.admin
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  // XML Export states
  const [xmlContent, setXmlContent] = useState('');
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketService.getTicketById(ticketId);
      setTicket(data);
      // Sync form states
      setStatus(data.status);
      setAssignedUserId(data.assignedUserId || '');
      setResolutionNotes(data.resolutionNotes || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg({ type: '', text: '' });

    // Enforce resolution notes if setting status to Resolved
    if (status === 'Resolved' && !resolutionNotes.trim()) {
      setUpdateMsg({ type: 'error', text: 'Resolution notes are required when status is Resolved.' });
      setIsUpdating(false);
      return;
    }

    const updateData = {
      status,
      assignedUserId: assignedUserId ? parseInt(assignedUserId, 10) : null,
      resolutionNotes: resolutionNotes.trim(),
      changedByUserId: sessionUserId // Pass chosen actor to generate audit log
    };

    try {
      const updated = await ticketService.updateTicket(ticketId, updateData);
      
      // Use jQuery DOM helper to highlight updated container
      if (window.$) {
        window.$('#ticket-details-pane').addClass('jquery-flash');
        setTimeout(() => {
          window.$('#ticket-details-pane').removeClass('jquery-flash');
        }, 1500);
      }

      setUpdateMsg({ type: 'success', text: 'Ticket updated and audit log entry created successfully!' });
      
      // Reload ticket data to fetch fresh audit trail logs
      await loadTicket();
      
      if (onUpdate) {
        onUpdate(updated);
      }
    } catch (err) {
      console.error(err);
      setUpdateMsg({ type: 'error', text: 'Failed to update ticket.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleXmlExport = async () => {
    setIsExporting(true);
    try {
      const xmlStr = await ticketService.exportTicketXml(ticketId);
      setXmlContent(xmlStr);
      setShowXmlModal(true);
    } catch (err) {
      console.error(err);
      alert('Failed to generate XML export payload.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(xmlContent);
    alert('XML copied to clipboard!');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '1rem' }}>Loading Ticket #{ticketId}...</div>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem 2rem' }}>
        <div className="error-text" style={{ color: 'var(--color-critical)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>{error || 'Ticket not found'}</div>
        <button className="btn btn-secondary" onClick={onBack}>← Back to Ticket List</button>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation and Actions Row */}
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            ← Back to Tickets
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleXmlExport}
            disabled={isExporting}
          >
            {isExporting ? 'Generating XML...' : '🔌 Export API XML'}
          </button>
        </div>
      </div>

      <div className="ticket-detail-grid">
        
        {/* Left Pane: Ticket Details & Resolution Notes */}
        <div className="detail-main-pane">
          <div id="ticket-details-pane" className="glass-card">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>TICKET #{ticket.id}</span>
                <StatusBadge type="priority" value={ticket.priority} />
                <StatusBadge type="status" value={ticket.status} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Opened on {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {ticket.title}
            </h1>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Description</label>
              <div className="ticket-description-box">
                {ticket.description}
              </div>
            </div>

            {/* Client Issue Resolution Notes Field */}
            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label className="form-label" style={{ fontWeight: '600', color: 'var(--color-resolved)' }}>
                🛠️ Client Issue Resolution Notes
              </label>
              <textarea
                className="form-textarea"
                placeholder="Document technical steps taken to resolve the ticket, configuration changes made, or patches applied..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                disabled={isUpdating}
                style={{ borderColor: status === 'Resolved' ? 'var(--color-resolved)' : 'var(--border-glass)' }}
              />
              {status === 'Resolved' && !resolutionNotes.trim() && (
                <span style={{ color: 'var(--color-critical)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  * Resolution notes are required before marking this support ticket as Resolved.
                </span>
              )}
            </div>

            {ticket.status === 'Resolved' && ticket.resolutionNotes && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px'
              }}>
                <strong style={{ color: 'var(--color-resolved)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                  Current Saved Resolution Summary
                </strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Actions and Audit Logs */}
        <div className="detail-side-pane">
          
          {/* Quick Actions Panel */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚙️ Manage State
            </h3>

            {updateMsg.text && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                backgroundColor: updateMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                color: updateMsg.type === 'success' ? '#34d399' : '#f43f5e',
                border: `1px solid ${updateMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
              }}>
                {updateMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateTicket}>
              <div className="form-group">
                <label className="form-label">Update Status</label>
                <select 
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reassign Engineer</label>
                <select 
                  className="form-select"
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">-- Unassigned --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName}</option>
                  ))}
                </select>
              </div>

              {/* Actor Session Selector for Audit trail simulation */}
              <div className="form-group" style={{ 
                borderTop: '1px solid var(--border-glass)', 
                paddingTop: '1rem',
                marginTop: '1rem' 
              }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Perform Action As (Session User)
                </label>
                <select 
                  className="form-select"
                  style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                  value={sessionUserId}
                  onChange={(e) => setSessionUserId(parseInt(e.target.value, 10))}
                  disabled={isUpdating}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving Changes...' : 'Save Ticket Status'}
              </button>
            </form>
          </div>

          {/* Audit Log Timeline */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📜 Audit History (T-SQL Logs)
            </h3>
            
            {ticket.auditLogs && ticket.auditLogs.length > 0 ? (
              <div className="audit-timeline">
                {ticket.auditLogs.map((log) => (
                  <div key={log.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-user">{log.changedByUser?.fullName || 'System Admin'}</span>
                        <span>•</span>
                        <span>{new Date(log.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="timeline-body">
                        {log.fieldName === 'status' && (
                          <>
                            Changed status from <span className="timeline-change-badge">{log.oldValue || 'None'}</span> to <span className="timeline-change-badge">{log.newValue}</span>
                          </>
                        )}
                        {log.fieldName === 'assignedUserId' && (
                          <>
                            Reassigned ticket from user ID <span className="timeline-change-badge">{log.oldValue || 'None'}</span> to <span className="timeline-change-badge">{log.newValue || 'Unassigned'}</span>
                          </>
                        )}
                        {log.fieldName === 'resolutionNotes' && (
                          <>
                            Updated resolution notes.
                          </>
                        )}
                        {log.fieldName !== 'status' && log.fieldName !== 'assignedUserId' && log.fieldName !== 'resolutionNotes' && (
                          <>
                            Modified <span className="timeline-change-badge">{log.fieldName}</span>
                          </>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.15rem' }}>
                        {new Date(log.changedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0', textAlign: 'center' }}>
                No database audit actions recorded yet.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* XML Code Export Modal */}
      {showXmlModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                🔌 Ticket XML Payload (API Integration)
              </h2>
              <button 
                onClick={() => setShowXmlModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                This is a schema-validated XML export generated directly by the Controller API layer. It contains the complete Ticket Model data, Assigned User Model details, and related Audit Log entries.
              </p>
              <div className="xml-code-box">
                {xmlContent}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCopyToClipboard}>
                📋 Copy XML
              </button>
              <button className="btn btn-primary" onClick={() => setShowXmlModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TicketDetail;
