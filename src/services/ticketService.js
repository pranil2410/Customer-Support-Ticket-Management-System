import axios from 'axios';

// ============================================================================
// Local Database & State Initialization (LocalStorage)
// ============================================================================

const DEFAULT_USERS = [
  { id: 1, username: 'alice.support', fullName: 'Alice Smith', email: 'alice.smith@supportmanager.com', role: 'Support Engineer' },
  { id: 2, username: 'bob.dev', fullName: 'Bob Johnson', email: 'bob.johnson@supportmanager.com', role: 'Software Engineer' },
  { id: 3, username: 'charlie.support', fullName: 'Charlie Brown', email: 'charlie.brown@supportmanager.com', role: 'Support Engineer' },
  { id: 4, username: 'david.dev', fullName: 'David Davis', email: 'david.davis@supportmanager.com', role: 'Software Engineer' },
  { id: 5, username: 'system.admin', fullName: 'System Administrator', email: 'admin@supportmanager.com', role: 'Administrator' }
];

const DEFAULT_TICKETS = [
  {
    id: 1,
    title: 'Database Connection Timeout',
    description: 'The production database is returning connection timeouts when fetching report details. Error code: 0x80004005.',
    status: 'Open',
    priority: 'Critical',
    assignedUserId: 4,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 2,
    title: 'UI Layout Broken on Mobile Viewport',
    description: 'The ticket list page columns overlap when viewed on screens smaller than 768px. Need responsive design fixes.',
    status: 'In Progress',
    priority: 'Major',
    assignedUserId: 2,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 3600000).toISOString()
  },
  {
    id: 3,
    title: 'Memory Leak in Background Service',
    description: 'The Node.js background worker crashes every 4 hours due to Heap Out of Memory. Suspect the stream listener is not being properly detached.',
    status: 'Open',
    priority: 'Critical',
    assignedUserId: 4,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 3600000).toISOString()
  },
  {
    id: 4,
    title: 'OAuth2 Authentication Failures',
    description: 'Users logging in via Google OAuth are receiving intermittent 403 authorization errors. Client ID mismatch suspected.',
    status: 'In Progress',
    priority: 'Critical',
    assignedUserId: 3,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600000).toISOString()
  },
  {
    id: 5,
    title: 'Typo in Billing Page Footer',
    description: 'Footer copyright year says 2024 instead of 2026. Needs a simple copy change.',
    status: 'Resolved',
    priority: 'Minor',
    assignedUserId: 1,
    resolutionNotes: 'Updated the copyright date in the main footer component config from 2024 to 2026. Re-verified layout renders fine.',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 3600000).toISOString()
  },
  {
    id: 6,
    title: 'CSV Export Fails on Large Datasets',
    description: 'When attempting to export more than 50,000 records, the request times out with a 504 Gateway Timeout.',
    status: 'In Progress',
    priority: 'Major',
    assignedUserId: 4,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 7,
    title: 'Search Index Optimization on AuditLogs',
    description: 'Slow query performance observed when pulling audit history. Need a non-clustered index on TicketId.',
    status: 'Resolved',
    priority: 'Major',
    assignedUserId: 2,
    resolutionNotes: 'Created a non-clustered index on AuditLog(TicketId) in the staging and production databases. Query speed improved from 1.2s to 12ms.',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 8,
    title: 'Password Reset Email Not Sent',
    description: 'Intermittent SMTP transmission failures. Logs show connection closed abruptly by peer. Likely rate-limiting from SendGrid.',
    status: 'Open',
    priority: 'Major',
    assignedUserId: 3,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 9,
    title: 'CSS badge display misalignment',
    description: 'StatusBadge has improper padding on standard tables, making the text touch the border.',
    status: 'Resolved',
    priority: 'Minor',
    assignedUserId: 2,
    resolutionNotes: 'Added standard padding rule (px-2.5 py-1) to StatusBadge component CSS and fixed layout.',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 10,
    title: 'PDF Report Generation Crash',
    description: 'Puppeteer crashes when generating PDF reports containing high-resolution images. Replaced with raw HTML-to-PDF parser or optimized images.',
    status: 'Open',
    priority: 'Critical',
    assignedUserId: 4,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 0.5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 3600000).toISOString()
  }
];

const DEFAULT_AUDIT_LOGS = [
  { id: 1, ticketId: 2, changedByUserId: 2, fieldName: 'status', oldValue: 'Open', newValue: 'In Progress', changedAt: new Date(Date.now() - 18 * 3600000).toISOString() },
  { id: 2, ticketId: 4, changedByUserId: 3, fieldName: 'status', oldValue: 'Open', newValue: 'In Progress', changedAt: new Date(Date.now() - 10 * 3600000).toISOString() },
  { id: 3, ticketId: 5, changedByUserId: 1, fieldName: 'status', oldValue: 'Open', newValue: 'In Progress', changedAt: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: 4, ticketId: 5, changedByUserId: 1, fieldName: 'status', oldValue: 'In Progress', newValue: 'Resolved', changedAt: new Date(Date.now() - 7 * 3600000).toISOString() },
  { id: 5, ticketId: 5, changedByUserId: 1, fieldName: 'resolutionNotes', oldValue: '', newValue: 'Updated the copyright date in the main footer component config from 2024 to 2026. Re-verified layout renders fine.', changedAt: new Date(Date.now() - 7 * 3600000).toISOString() },
  { id: 6, ticketId: 7, changedByUserId: 2, fieldName: 'status', oldValue: 'Open', newValue: 'In Progress', changedAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 7, ticketId: 7, changedByUserId: 2, fieldName: 'status', oldValue: 'In Progress', newValue: 'Resolved', changedAt: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 8, ticketId: 7, changedByUserId: 2, fieldName: 'resolutionNotes', oldValue: '', newValue: 'Created a non-clustered index on AuditLog(TicketId) in the staging and production databases. Query speed improved from 1.2s to 12ms.', changedAt: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 9, ticketId: 9, changedByUserId: 2, fieldName: 'status', oldValue: 'Open', newValue: 'Resolved', changedAt: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: 10, ticketId: 9, changedByUserId: 2, fieldName: 'resolutionNotes', oldValue: '', newValue: 'Added standard padding rule (px-2.5 py-1) to StatusBadge component CSS and fixed layout.', changedAt: new Date(Date.now() - 1 * 3600000).toISOString() }
];

const getLocalStorage = (key, defaultVal) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
};

const setLocalStorage = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Initialize DB tables in LocalStorage
let ticketsDb = getLocalStorage('db_tickets', DEFAULT_TICKETS);
let usersDb = getLocalStorage('db_users', DEFAULT_USERS);
let auditLogsDb = getLocalStorage('db_audit_logs', DEFAULT_AUDIT_LOGS);

// ============================================================================
// XML Helper Utilities
// ============================================================================

/**
 * Helper to convert a JavaScript Object to XML string
 */
export const objectToXml = (obj, rootName = 'ticket') => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
  const serialize = (data, indent = '  ') => {
    let parts = '';
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        parts += `${indent}<${key} />\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        parts += `${indent}<${key}>\n${serialize(value, indent + '  ')}${indent}</${key}>\n`;
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'object') {
            parts += `${indent}<${key}Item>\n${serialize(item, indent + '  ')}${indent}</${key}Item>\n`;
          } else {
            parts += `${indent}<${key}Item>${escapeXml(item)}</${key}Item>\n`;
          }
        });
      } else {
        parts += `${indent}<${key}>${escapeXml(value.toString())}</${key}>\n`;
      }
    }
    return parts;
  };
  
  xml += serialize(obj);
  xml += `</${rootName}>`;
  return xml;
};

const escapeXml = (unsafe) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * Minimal XML to JSON Parser for handling XML payloads
 */
export const xmlToObject = (xmlStr) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
    
    // Check for parsing error
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing error: ' + parserError.textContent);
    }
    
    const nodeToJson = (node) => {
      // If it's a leaf node (only has text content)
      if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
        const text = node.childNodes[0].nodeValue.trim();
        // Try to parse as number or boolean
        if (text === 'true') return true;
        if (text === 'false') return false;
        if (!isNaN(text) && text !== '') return Number(text);
        return text;
      }
      
      const obj = {};
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === 1) { // Element node
          const childName = child.nodeName;
          const childVal = nodeToJson(child);
          
          if (obj[childName] !== undefined) {
            if (!Array.isArray(obj[childName])) {
              obj[childName] = [obj[childName]];
            }
            obj[childName].push(childVal);
          } else {
            obj[childName] = childVal;
          }
        }
      }
      return obj;
    };
    
    const rootNode = xmlDoc.documentElement;
    return {
      _root: rootNode.nodeName,
      ...nodeToJson(rootNode)
    };
  } catch (error) {
    console.error('Failed to parse XML, falling back to JSON parser', error);
    return null;
  }
};

// ============================================================================
// Axios Configuration with Mock Interceptors (Controller Layer)
// ============================================================================

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Custom Axios Adapter to intercept HTTP requests and serve mock data
api.defaults.adapter = async (config) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  
  // Reload data from localstorage to ensure consistency across sessions/tabs
  ticketsDb = getLocalStorage('db_tickets', DEFAULT_TICKETS);
  usersDb = getLocalStorage('db_users', DEFAULT_USERS);
  auditLogsDb = getLocalStorage('db_audit_logs', DEFAULT_AUDIT_LOGS);

  try {
    // ------------------------------------------------------------------------
    // Route 1: GET /api/users (List all users)
    // ------------------------------------------------------------------------
    if (url === '/users' && method === 'get') {
      return {
        data: usersDb,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config
      };
    }

    // ------------------------------------------------------------------------
    // Route 2: GET /api/tickets (List tickets with filters)
    // ------------------------------------------------------------------------
    if (url.startsWith('/tickets') && method === 'get' && !url.includes('/export') && !/\/\d+$/.test(url)) {
      const params = config.params || {};
      let filtered = [...ticketsDb];

      if (params.status) {
        filtered = filtered.filter(t => t.status.toLowerCase() === params.status.toLowerCase());
      }
      if (params.priority) {
        filtered = filtered.filter(t => t.priority.toLowerCase() === params.priority.toLowerCase());
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.title.toLowerCase().includes(query) || 
          t.description.toLowerCase().includes(query)
        );
      }

      // Sort by updated time descending
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      // Enrich with user object
      const enriched = filtered.map(ticket => ({
        ...ticket,
        assignedUser: usersDb.find(u => u.id === ticket.assignedUserId) || null
      }));

      // XML Format check for XML fallback API capability
      const isXmlRequested = config.headers['Accept'] === 'application/xml' || config.headers['Content-Type'] === 'application/xml';
      
      if (isXmlRequested) {
        const xmlData = objectToXml({ tickets: enriched }, 'ticketResponse');
        return {
          data: xmlData,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/xml' },
          config
        };
      }

      return {
        data: enriched,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config
      };
    }

    // ------------------------------------------------------------------------
    // Route 3: GET /api/tickets/:id (Get single ticket details with audit log)
    // ------------------------------------------------------------------------
    const ticketIdMatch = url.match(/^\/tickets\/(\d+)$/);
    if (ticketIdMatch && method === 'get') {
      const id = parseInt(ticketIdMatch[1], 10);
      const ticket = ticketsDb.find(t => t.id === id);

      if (!ticket) {
        return {
          status: 404,
          statusText: 'Not Found',
          data: { message: `Ticket with ID ${id} not found.` },
          headers: { 'content-type': 'application/json' },
          config
        };
      }

      // Gather audit log for this ticket
      const ticketLogs = auditLogsDb
        .filter(log => log.ticketId === id)
        .map(log => ({
          ...log,
          changedByUser: usersDb.find(u => u.id === log.changedByUserId) || null
        }))
        .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

      const enrichedTicket = {
        ...ticket,
        assignedUser: usersDb.find(u => u.id === ticket.assignedUserId) || null,
        auditLogs: ticketLogs
      };

      const isXmlRequested = config.headers['Accept'] === 'application/xml';
      if (isXmlRequested) {
        return {
          data: objectToXml(enrichedTicket, 'ticketDetail'),
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/xml' },
          config
        };
      }

      return {
        data: enrichedTicket,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config
      };
    }

    // ------------------------------------------------------------------------
    // Route 4: POST /api/tickets (Create a ticket)
    // Supports both JSON payloads and XML payloads as standard XML fallback
    // ------------------------------------------------------------------------
    if (url === '/tickets' && method === 'post') {
      let bodyData = config.data;

      // Handle XML request body fallback
      const contentType = config.headers['Content-Type'] || config.headers['content-type'] || '';
      if (contentType.includes('application/xml') && typeof bodyData === 'string') {
        const parsed = xmlToObject(bodyData);
        if (parsed) {
          bodyData = {
            title: parsed.title,
            description: parsed.description || parsed.ticketDescription,
            priority: parsed.priority,
            assignedUserId: parsed.assignedUserId
          };
        }
      } else if (typeof bodyData === 'string') {
        bodyData = JSON.parse(bodyData);
      }

      const { title, description, priority, assignedUserId } = bodyData;
      
      if (!title || !description || !priority) {
        return {
          status: 400,
          statusText: 'Bad Request',
          data: { message: 'Missing required fields: title, description, and priority.' },
          headers: { 'content-type': 'application/json' },
          config
        };
      }

      const newId = ticketsDb.reduce((max, t) => t.id > max ? t.id : max, 0) + 1;
      const newTicket = {
        id: newId,
        title,
        description,
        status: 'Open',
        priority,
        assignedUserId: assignedUserId ? parseInt(assignedUserId, 10) : null,
        resolutionNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      ticketsDb.push(newTicket);
      setLocalStorage('db_tickets', ticketsDb);

      // Create Audit Log for creation
      const logId = auditLogsDb.reduce((max, l) => l.id > max ? l.id : max, 0) + 1;
      const creationLog = {
        id: logId,
        ticketId: newId,
        changedByUserId: 5, // Default system admin
        fieldName: 'status',
        oldValue: null,
        newValue: 'Open',
        changedAt: new Date().toISOString()
      };
      auditLogsDb.push(creationLog);
      setLocalStorage('db_audit_logs', auditLogsDb);

      const isXmlRequested = config.headers['Accept'] === 'application/xml';
      if (isXmlRequested) {
        return {
          data: objectToXml(newTicket, 'ticketCreateResponse'),
          status: 201,
          statusText: 'Created',
          headers: { 'content-type': 'application/xml' },
          config
        };
      }

      return {
        data: newTicket,
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
        config
      };
    }

    // ------------------------------------------------------------------------
    // Route 5: PUT /api/tickets/:id (Update ticket status + audit logs + resolution)
    // ------------------------------------------------------------------------
    const ticketIdPutMatch = url.match(/^\/tickets\/(\d+)$/);
    if (ticketIdPutMatch && method === 'put') {
      const id = parseInt(ticketIdPutMatch[1], 10);
      const ticketIdx = ticketsDb.findIndex(t => t.id === id);

      if (ticketIdx === -1) {
        return {
          status: 404,
          statusText: 'Not Found',
          data: { message: `Ticket with ID ${id} not found.` },
          headers: { 'content-type': 'application/json' },
          config
        };
      }

      let bodyData = config.data;
      if (typeof bodyData === 'string') {
        const contentType = config.headers['Content-Type'] || config.headers['content-type'] || '';
        if (contentType.includes('application/xml')) {
          const parsed = xmlToObject(bodyData);
          if (parsed) bodyData = parsed;
        } else {
          bodyData = JSON.parse(bodyData);
        }
      }

      const originalTicket = { ...ticketsDb[ticketIdx] };
      const updatedTicket = {
        ...originalTicket,
        ...bodyData,
        updatedAt: new Date().toISOString()
      };

      ticketsDb[ticketIdx] = updatedTicket;
      setLocalStorage('db_tickets', ticketsDb);

      // System user or specific admin user ID making changes (default to admin id=5)
      const changedByUserId = bodyData.changedByUserId ? parseInt(bodyData.changedByUserId, 10) : 5;

      // Detect changes and generate Audit Logs
      const changes = [];
      const fieldsToTrack = ['status', 'priority', 'assignedUserId', 'resolutionNotes'];
      
      fieldsToTrack.forEach(field => {
        let oldVal = originalTicket[field];
        let newVal = updatedTicket[field];

        if (oldVal !== newVal) {
          // Normalize values
          if (oldVal === null || oldVal === undefined) oldVal = '';
          if (newVal === null || newVal === undefined) newVal = '';

          // Add to log
          if (oldVal.toString() !== newVal.toString()) {
            changes.push({
              field,
              old: oldVal.toString(),
              new: newVal.toString()
            });
          }
        }
      });

      // Write changes to Audit Logs Db
      let currentLogId = auditLogsDb.reduce((max, l) => l.id > max ? l.id : max, 0);
      changes.forEach(change => {
        currentLogId++;
        auditLogsDb.push({
          id: currentLogId,
          ticketId: id,
          changedByUserId,
          fieldName: change.field,
          oldValue: change.old,
          newValue: change.new,
          changedAt: new Date().toISOString()
        });
      });

      if (changes.length > 0) {
        setLocalStorage('db_audit_logs', auditLogsDb);
      }

      const isXmlRequested = config.headers['Accept'] === 'application/xml';
      if (isXmlRequested) {
        return {
          data: objectToXml(updatedTicket, 'ticketUpdateResponse'),
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/xml' },
          config
        };
      }

      return {
        data: updatedTicket,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config
      };
    }

    // ------------------------------------------------------------------------
    // Route 6: GET /api/tickets/:id/export (XML Data export endpoint mock)
    // ------------------------------------------------------------------------
    const exportMatch = url.match(/^\/tickets\/(\d+)\/export$/);
    if (exportMatch && method === 'get') {
      const id = parseInt(exportMatch[1], 10);
      const ticket = ticketsDb.find(t => t.id === id);

      if (!ticket) {
        return {
          status: 404,
          statusText: 'Not Found',
          data: '<error><message>Ticket not found</message></error>',
          headers: { 'content-type': 'application/xml' },
          config
        };
      }

      const assignedUser = usersDb.find(u => u.id === ticket.assignedUserId) || null;
      const ticketLogs = auditLogsDb.filter(log => log.ticketId === id);

      // Structure export object
      const exportObject = {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        resolutionNotes: ticket.resolutionNotes,
        assignedUser: assignedUser ? {
          id: assignedUser.id,
          username: assignedUser.username,
          fullName: assignedUser.fullName,
          email: assignedUser.email
        } : null,
        auditLogs: ticketLogs.map(l => ({
          id: l.id,
          changedByUserId: l.changedByUserId,
          fieldName: l.fieldName,
          oldValue: l.oldValue,
          newValue: l.newValue,
          changedAt: l.changedAt
        }))
      };

      const xmlResponse = objectToXml(exportObject, 'supportTicketExport');

      return {
        data: xmlResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/xml' },
        config
      };
    }

    // Default 404 for unknown endpoints
    return {
      status: 404,
      statusText: 'Not Found',
      data: { message: `Mock API Endpoint ${method.toUpperCase()} ${url} not found.` },
      headers: { 'content-type': 'application/json' },
      config
    };

  } catch (error) {
    console.error('Mock Adapter Error:', error);
    return {
      status: 500,
      statusText: 'Internal Server Error',
      data: { message: error.message },
      headers: { 'content-type': 'application/json' },
      config
    };
  }
};

// ============================================================================
// Service Export Methods (Controller Layer implementation)
// ============================================================================

export const ticketService = {
  /**
   * Fetch users list
   */
  async getUsers() {
    const res = await api.get('/users');
    return res.data;
  },

  /**
   * Fetch all tickets with filters
   * Supports XML header configuration fallback
   */
  async getTickets(filters = {}, useXml = false) {
    const headers = {};
    if (useXml) {
      headers['Accept'] = 'application/xml';
    }
    const res = await api.get('/tickets', { params: filters, headers });
    return res.data;
  },

  /**
   * Fetch a single ticket by ID
   */
  async getTicketById(id) {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },

  /**
   * Create a new ticket
   * Supports sending XML payload as required
   */
  async createTicket(ticketData, sendAsXml = false) {
    const headers = {};
    let payload = ticketData;

    if (sendAsXml) {
      headers['Content-Type'] = 'application/xml';
      headers['Accept'] = 'application/xml';
      payload = objectToXml(ticketData, 'ticketInput');
    }

    const res = await api.post('/tickets', payload, { headers });
    
    // Parse response if XML returned
    if (res.headers['content-type']?.includes('application/xml')) {
      return xmlToObject(res.data);
    }
    return res.data;
  },

  /**
   * Update an existing ticket (status, assignment, notes)
   */
  async updateTicket(id, updateData, sendAsXml = false) {
    const headers = {};
    let payload = updateData;

    if (sendAsXml) {
      headers['Content-Type'] = 'application/xml';
      headers['Accept'] = 'application/xml';
      payload = objectToXml(updateData, 'ticketUpdate');
    }

    const res = await api.put(`/tickets/${id}`, payload, { headers });
    
    if (res.headers['content-type']?.includes('application/xml')) {
      return xmlToObject(res.data);
    }
    return res.data;
  },

  /**
   * Export support ticket data in XML format
   */
  async exportTicketXml(id) {
    const res = await api.get(`/tickets/${id}/export`);
    return res.data;
  }
};
