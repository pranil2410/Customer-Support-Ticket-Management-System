import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import StatusBadge from './StatusBadge';

/**
 * TicketList Component
 * Displays a list of support tickets with filters for status, priority, and text search.
 * 
 * @param {Array} users - List of users for rendering assignees
 * @param {Function} onSelectTicket - Callback triggered when clicking on a ticket to view details
 * @param {number} refreshTrigger - Numeric counter to trigger list reloads from parent
 */
const TicketList = ({ users, onSelectTicket, refreshTrigger }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // XML Fallback API Demonstration state
  const [useXmlEndpoint, setUseXmlEndpoint] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, searchQuery, refreshTrigger, useXmlEndpoint]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      // We call the API using JSON or XML format based on the toggle to showcase API fallbacks
      const data = await ticketService.getTickets(filters, useXmlEndpoint);
      
      if (useXmlEndpoint && typeof data === 'string') {
        // If XML format was requested, parse the response back to JSON structure for rendering
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'application/xml');
        const ticketNodes = xmlDoc.querySelectorAll('ticketsItem');
        const parsedTickets = Array.from(ticketNodes).map(node => {
          return {
            id: parseInt(node.querySelector('id')?.textContent || '0', 10),
            title: node.querySelector('title')?.textContent || '',
            description: node.querySelector('description')?.textContent || '',
            status: node.querySelector('status')?.textContent || '',
            priority: node.querySelector('priority')?.textContent || '',
            assignedUserId: node.querySelector('assignedUserId')?.textContent 
              ? parseInt(node.querySelector('assignedUserId').textContent, 10) 
              : null,
            createdAt: node.querySelector('createdAt')?.textContent || '',
            updatedAt: node.querySelector('updatedAt')?.textContent || '',
            assignedUser: node.querySelector('assignedUser') ? {
              id: parseInt(node.querySelector('assignedUser > id')?.textContent || '0', 10),
              fullName: node.querySelector('assignedUser > fullName')?.textContent || '',
              role: node.querySelector('assignedUser > role')?.textContent || ''
            } : null
          };
        });
        setTickets(parsedTickets);
      } else {
        setTickets(data);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick stats calculations
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const progressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div>
      {/* Dynamic Dashboard Quick Stats */}
      <div className="stats-grid">
        
        <div className="stat-card glass-card" style={{ borderLeft: '4px solid var(--color-open)' }}>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : openCount}</span>
            <span className="stat-label">Open Tickets</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-open-glow)', color: 'var(--color-open)' }}>
            📬
          </div>
        </div>

        <div className="stat-card glass-card" style={{ borderLeft: '4px solid var(--color-progress)' }}>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : progressCount}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-progress-glow)', color: 'var(--color-progress)' }}>
            ⏳
          </div>
        </div>

        <div className="stat-card glass-card" style={{ borderLeft: '4px solid var(--color-resolved)' }}>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : resolvedCount}</span>
            <span className="stat-label">Resolved Issues</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-resolved-glow)', color: 'var(--color-resolved)' }}>
            ✅
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div className="filter-bar">
          
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search by ticket title, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

        </div>

        {/* API Format switch option (Demo XML integration capability) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={useXmlEndpoint}
              onChange={(e) => setUseXmlEndpoint(e.target.checked)}
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <span>Fetch tickets over REST API as XML payload format</span>
          </label>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Synchronizing SQL Database Model...</div>
          <div style={{ width: '30px', height: '30px', border: '2px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      ) : tickets.length > 0 ? (
        <div className="tickets-container">
          {tickets.map((t) => (
            <div 
              key={t.id} 
              className="ticket-card"
              onClick={() => onSelectTicket(t.id)}
            >
              
              <div className="ticket-id">#{t.id}</div>
              
              <div className="ticket-main-info">
                <div className="ticket-title-row">
                  <span className="ticket-card-title">{t.title}</span>
                </div>
                <div className="ticket-card-desc">{t.description}</div>
                <div className="ticket-meta">
                  <div className="ticket-meta-item">
                    <span>📅</span> {new Date(t.createdAt).toLocaleDateString()} at {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>

              <div>
                <StatusBadge type="priority" value={t.priority} />
              </div>

              <div>
                <StatusBadge type="status" value={t.status} />
              </div>

              <div className="ticket-assignee">
                <div className="assignee-avatar">
                  {t.assignedUser ? t.assignedUser.fullName.charAt(0) : '?'}
                </div>
                <span style={{ fontSize: '0.875rem' }}>
                  {t.assignedUser ? t.assignedUser.fullName : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}
                </span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No tickets match the query</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Try adjusting your search keywords, status filters, or priority levels.
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketList;
