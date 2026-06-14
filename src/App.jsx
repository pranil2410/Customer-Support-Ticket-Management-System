import React, { useState, useEffect } from 'react';
import { ticketService } from './services/ticketService';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import TicketDetail from './components/TicketDetail';

function App() {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'create', 'detail'
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [users, setUsers] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Load users list for assigned dropdowns
    const fetchUsers = async () => {
      try {
        const usersList = await ticketService.getUsers();
        setUsers(usersList);
      } catch (err) {
        console.error('Failed to load initial users', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    setActiveTab('detail');
  };

  const handleTicketCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('tickets');
  };

  const handleTicketUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-icon">S</div>
            <span className="brand-name">Support Flow</span>
          </div>

          <nav>
            <ul className="nav-menu">
              <li>
                <div 
                  className={`nav-item ${activeTab === 'tickets' || activeTab === 'detail' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tickets')}
                >
                  <span className="nav-item-icon">📊</span>
                  Ticket Dashboard
                </div>
              </li>
              <li>
                <div 
                  className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
                  onClick={() => setActiveTab('create')}
                >
                  <span className="nav-item-icon">➕</span>
                  Create Ticket
                </div>
              </li>
            </ul>
          </nav>
        </div>

        {/* Current Session Indicator */}
        <div className="user-profile-widget">
          <div className="avatar">SA</div>
          <div className="profile-info">
            <span className="profile-name">Admin Session</span>
            <span className="profile-role">SQL Administrator</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'tickets' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Support Ticket Manager</h1>
                <p className="page-subtitle">MVC Architecture • React View • SQL Model • Axios Controllers</p>
              </div>
              <button className="btn btn-primary" onClick={() => setActiveTab('create')}>
                ➕ New Ticket
              </button>
            </div>
            
            <TicketList 
              users={users} 
              onSelectTicket={handleSelectTicket} 
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {activeTab === 'create' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Create Ticket</h1>
                <p className="page-subtitle">File support issues directly to SQL schema models</p>
              </div>
              <button className="btn btn-secondary" onClick={() => setActiveTab('tickets')}>
                Cancel
              </button>
            </div>

            <TicketForm 
              users={users} 
              onSuccess={handleTicketCreated}
            />
          </div>
        )}

        {activeTab === 'detail' && (
          <div>
            <TicketDetail 
              ticketId={selectedTicketId}
              users={users}
              onBack={() => setActiveTab('tickets')}
              onUpdate={handleTicketUpdated}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
