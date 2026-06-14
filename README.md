# Support Ticket Manager

A modern, responsive, and feature-rich **Support Ticket Manager** application designed for support and software engineers. Built with a structured **MVC (Model-View-Controller)** architecture, utilizing React for views, service classes using Axios (with mocked local database storage) for the controllers, and T-SQL scripts representing the database schema.

---

## 🚀 Tech Stack

- **Front-end (View)**: ReactJS (Functional Components + Hooks), jQuery (for interactive DOM flashing/helpers), HTML5, CSS3.
- **Data Exchange (Controller)**: REST API calls with JSON/XML dual payloads using Axios.
- **Database (Model)**: MS SQL Server T-SQL Schema (`/db/schema.sql` and `/db/seed.sql` with indexes).
- **Aesthetics**: Premium Dark Dashboard theme featuring HSL gradients, glassmorphism, responsive grids, and subtle hover animations.

---

## 📂 Project Structure

```text
├── db/
│   ├── schema.sql      # T-SQL DDL script (Tables: Users, Tickets, AuditLog + Indexes)
│   └── seed.sql        # Seed data (10 pre-loaded tickets & user roles)
├── public/
│   └── index.html      # HTML entry point (contains jQuery CDN)
├── src/
│   ├── components/
│   │   ├── TicketList.jsx   # List grid + Status/Priority filters + Search input
│   │   ├── TicketForm.jsx   # Create ticket form (supports JSON / XML dispatching)
│   │   ├── TicketDetail.jsx # Ticket inspection + Audit Log Timeline + Resolution notes
│   │   └── StatusBadge.jsx  # Styled CSS badge labels
│   ├── services/
│   │   └── ticketService.js # Axios API client & LocalStorage database simulator
│   ├── App.jsx              # Main routing & layout navigation
│   ├── App.js               # Copy of routing layer for path-matching
│   ├── index.css            # Premium dark mode CSS stylesheet
│   └── main.jsx             # React DOM root render file
├── package.json             # NPM dependencies & running scripts
└── README.md                # Project documentation
```

---

## 🛠️ Getting Started & Setup

### Local Development
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/pranil2410/Customer-Support-Ticket-Management-System.git
   cd Customer-Support-Ticket-Management-System
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the Dev Server**:
   ```bash
   npm run dev
   ```

### ⚡ Deploy to Vercel
You can deploy this React+Vite project to Vercel in two ways:

#### Option 1: Vercel Git Integration (Recommended)
1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `pranil2410/Customer-Support-Ticket-Management-System`.
4. Vercel will auto-detect Vite settings. Click **Deploy**.

#### Option 2: Vercel CLI
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command in the project root:
   ```bash
   vercel --prod
   ```

---

## 🖥️ Application Features Demo

1. **Dashboard & Filters**: Filter tickets by Status (`Open`, `In Progress`, `Resolved`) and Priority (`Critical`, `Major`, `Minor`). Perform full-text search against titles and descriptions.
2. **Issue Creation Form**: Submit a support ticket and assign it to an engineer. You can check the **"Transmit payload as XML"** box to verify the XML API fallback capabilities.
3. **Resolution Notes & Audit Logs**: Select any ticket to inspect details. Set status to `Resolved` (requires documentation of resolution notes) and save to commit changes. The database audit history timeline will update immediately with chronological change records.
4. **🔌 XML API Integration (Data Export)**: From a ticket detail page, click **"Export API XML"** to fetch and preview a schema-validated XML representation of the ticket, assigned engineer, and audit history.

---

## 🌐 API Endpoint Reference Table

The `/src/services/ticketService.js` controller handles the following endpoints. They are simulated locally with Axios request adapters and standard REST responses:

| HTTP Method | Endpoint | Accept / Content-Type | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/users` | `application/json` | Fetches list of all support & software engineers. |
| **GET** | `/api/tickets` | `application/json` or `application/xml` | Lists all tickets, supporting filters (`status`, `priority`, `search`). |
| **GET** | `/api/tickets/:id` | `application/json` or `application/xml` | Retrieves details for a specific ticket, including its audit logs. |
| **POST** | `/api/tickets` | `application/json` or `application/xml` | Creates a new support ticket (default status: `Open`). |
| **PUT** | `/api/tickets/:id` | `application/json` or `application/xml` | Updates status, assignee, or resolution notes. Creates audit log. |
| **GET** | `/api/tickets/:id/export` | `application/xml` | Exports full ticket + logs as a structured XML document. |

---

## 💾 XML Payload Example

Below is the standard XML structure returned by the `/api/tickets/:id/export` endpoint for third-party integrations:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<supportTicketExport>
  <id>5</id>
  <title>Typo in Billing Page Footer</title>
  <description>Footer copyright year says 2024 instead of 2026. Needs a simple copy change.</description>
  <status>Resolved</status>
  <priority>Minor</priority>
  <createdAt>2026-06-14T11:35:15.000Z</createdAt>
  <updatedAt>2026-06-14T12:35:15.000Z</updatedAt>
  <resolutionNotes>Updated the copyright date in the main footer component config from 2024 to 2026. Re-verified layout renders fine.</resolutionNotes>
  <assignedUser>
    <id>1</id>
    <username>alice.support</username>
    <fullName>Alice Smith</fullName>
    <email>alice.smith@supportmanager.com</email>
  </assignedUser>
  <auditLogs>
    <auditLogsItem>
      <id>3</id>
      <changedByUserId>1</changedByUserId>
      <fieldName>status</fieldName>
      <oldValue>Open</oldValue>
      <newValue>In Progress</newValue>
      <changedAt>2026-06-14T11:35:15.000Z</changedAt>
    </auditLogsItem>
    <auditLogsItem>
      <id>4</id>
      <changedByUserId>1</changedByUserId>
      <fieldName>status</fieldName>
      <oldValue>In Progress</oldValue>
      <newValue>Resolved</newValue>
      <changedAt>2026-06-14T12:35:15.000Z</changedAt>
    </auditLogsItem>
  </auditLogs>
</supportTicketExport>
```

---

## 📸 Screenshots Placeholder

![Dashboard Overview](https://via.placeholder.com/1200x675/0f111a/f8fafc?text=Support+Ticket+Manager+-+Main+Dashboard)
*Main Dashboard View: Filtering and search results loaded from LocalStorage.*

![Ticket Detail & Timeline](https://via.placeholder.com/1200x675/0f111a/f8fafc?text=Ticket+Detail+Pane+and+Audit+Trail)
*Detail Page: Client resolution notes form and database audit timeline.*
