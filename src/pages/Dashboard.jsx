import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import RealTimeDashboard from '../components/dashboard/RealTimeDashboard';

// Role-specific components
import CollectorDashboard from '../components/dashboard/CollectorDashboard';
import LabTechDashboard from '../components/dashboard/LabTechDashboard';
import ProcessorDashboard from '../components/dashboard/ProcessorDashboard';
import ManufacturerDashboard from '../components/dashboard/ManufacturerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('workflow');

  const renderRoleSpecificDashboard = () => {
    switch (user.role) {
      case 'Collector':
        return <CollectorDashboard />;
      case 'LabTech':
        return <LabTechDashboard />;
      case 'Processor':
        return <ProcessorDashboard />;
      case 'Manufacturer':
        return <ManufacturerDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return <div>Role not recognized</div>;
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user.name}</h1>
          <p>Role: {user.role} | Organization: {user.organization}</p>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            My Workflow
          </button>
          <button 
            className={`tab-button ${activeTab === 'blockchain' ? 'active' : ''}`}
            onClick={() => setActiveTab('blockchain')}
          >
            View Blockchain Records
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'workflow' ? (
            renderRoleSpecificDashboard()
          ) : (
            <RealTimeDashboard />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;