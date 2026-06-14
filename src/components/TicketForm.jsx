import React, { useState } from 'react';
import { ticketService } from '../services/ticketService';

/**
 * TicketForm Component
 * Renders form to create support tickets. Allows selecting payload type (JSON or XML)
 * to demonstrate API integration versatility.
 * 
 * @param {Array} users - List of available users for assignment
 * @param {Function} onSuccess - Callback triggered when ticket is created successfully
 */
const TicketForm = ({ users, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Minor');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [sendAsXml, setSendAsXml] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    const ticketData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignedUserId: assignedUserId ? parseInt(assignedUserId, 10) : null
    };

    try {
      const createdTicket = await ticketService.createTicket(ticketData, sendAsXml);
      
      // Use jQuery DOM helper to flash the form on success (Requirement: jQuery for DOM helpers)
      if (window.$) {
        window.$('#ticket-creation-card').addClass('jquery-flash');
        setTimeout(() => {
          window.$('#ticket-creation-card').removeClass('jquery-flash');
        }, 1500);
      }

      setMessage({ 
        type: 'success', 
        text: `Success! Ticket #${createdTicket.id} has been created using ${sendAsXml ? 'XML' : 'JSON'} payload.` 
      });
      
      // Reset form fields
      setTitle('');
      setDescription('');
      setPriority('Minor');
      setAssignedUserId('');
      
      if (onSuccess) {
        onSuccess(createdTicket);
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      setMessage({ type: 'error', text: error.message || 'Error occurred while creating ticket.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="ticket-creation-card" className="glass-card">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🎫</span> Create Support Ticket
      </h2>

      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          border: '1px solid',
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
          color: message.type === 'success' ? '#34d399' : '#f43f5e',
          borderColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Ticket Title <span style={{ color: 'var(--color-critical)' }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Brief summary of the issue (e.g. Database Timeout)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Detailed Description <span style={{ color: 'var(--color-critical)' }}>*</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder="Describe the steps to reproduce, errors seen, and environment details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign Support/Software Engineer</label>
            <select
              className="form-select"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">-- Unassigned --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Extras: API Content-Type payload switcher */}
        <div className="form-group" style={{ 
          marginTop: '0.5rem', 
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: '8px'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              checked={sendAsXml}
              onChange={(e) => setSendAsXml(e.target.checked)}
              disabled={isSubmitting}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>API Simulation:</strong> Transmit payload as XML (Fallback Endpoint demo)
            </span>
          </label>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', paddingLeft: '1.5rem' }}>
            When checked, the payload is serialized to XML before transmission and Axios sets <code>Content-Type: application/xml</code>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ minWidth: '150px' }}
          >
            {isSubmitting ? 'Submitting...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
