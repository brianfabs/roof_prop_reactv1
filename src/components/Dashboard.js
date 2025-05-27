import React from 'react';
import { Link } from 'react-router-dom';
import { useProposals } from '../hooks/useFirestore';
import LoadingSpinner from './LoadingSpinner';
import Navigation from './Navigation';

function Dashboard() {
  const { proposals, loading, error, deleteProposal } = useProposals();

  const handleDelete = async (id, customerName) => {
    if (window.confirm(`Are you sure you want to delete the proposal for ${customerName}?`)) {
      try {
        await deleteProposal(id);
      } catch (error) {
        alert('Error deleting proposal: ' + error.message);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner message="Loading proposals..." />;
  }

  return (
    <div className="dashboard">
      <Navigation />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Proposals Dashboard</h1>
          <Link to="/create-proposal" className="btn btn-primary">
            Create New Proposal
          </Link>
        </div>

        {error && (
          <div className="error-message">
            Error loading proposals: {error}
          </div>
        )}

        {proposals.length === 0 ? (
          <div className="no-proposals">
            <p>No proposals found.</p>
            <Link to="/create-proposal" className="btn btn-primary">
              Create Your First Proposal
            </Link>
          </div>
        ) : (
          <div className="proposals-table">
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Address</th>
                  <th>Squares</th>
                  <th>Created By</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td>{proposal.customerName}</td>
                    <td>{proposal.address}</td>
                    <td>{proposal.squares}</td>
                    <td>{proposal.createdBy}</td>
                    <td>{formatDate(proposal.createdAt)}</td>
                    <td className="actions">
                      <Link 
                        to={`/proposal/${proposal.id}`}
                        className="btn btn-small btn-secondary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </Link>
                      
                      <Link 
                        to={`/edit-proposal/${proposal.id}`}
                        className="btn btn-small btn-primary"
                      >
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(proposal.id, proposal.customerName)}
                        className="btn btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 