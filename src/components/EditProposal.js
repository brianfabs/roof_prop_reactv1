import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProposal, useProposals } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';
import LoadingSpinner from './LoadingSpinner';

function EditProposal() {
  const { id } = useParams();
  const { proposal, loading: proposalLoading, error: proposalError } = useProposal(id);
  const { updateProposal } = useProposals();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    squares: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form data when proposal loads
  useEffect(() => {
    if (proposal) {
      setFormData({
        customerName: proposal.customerName || '',
        address: proposal.address || '',
        squares: proposal.squares?.toString() || ''
      });
    }
  }, [proposal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.address || !formData.squares) {
      setError('Please fill in all fields');
      return;
    }

    const squares = parseFloat(formData.squares);
    if (isNaN(squares) || squares <= 0) {
      setError('Please enter a valid number of squares');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const updates = {
        customerName: formData.customerName.trim(),
        address: formData.address.trim(),
        squares: squares,
        updatedBy: currentUser.email
      };
      
      await updateProposal(id, updates);
      navigate(`/proposal/${id}`);
    } catch (error) {
      setError('Failed to update proposal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (proposalLoading) {
    return <LoadingSpinner message="Loading proposal..." />;
  }

  if (proposalError) {
    return (
      <div className="edit-proposal">
        <Navigation />
        <div className="edit-proposal-content">
          <div className="error-container">
            <h3>Error</h3>
            <p>{proposalError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="edit-proposal">
        <Navigation />
        <div className="edit-proposal-content">
          <div className="error-container">
            <h3>Proposal Not Found</h3>
            <p>The requested proposal could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-proposal">
      <Navigation />
      
      <div className="edit-proposal-content">
        <div className="form-container">
          <h1>Edit Proposal</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="proposal-form">
            <div className="form-group">
              <label htmlFor="customerName">Customer Name:</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter customer's full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Property Address:</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter complete property address"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="squares">Number of Squares:</label>
              <input
                type="number"
                id="squares"
                name="squares"
                value={formData.squares}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter number of roofing squares"
                step="0.1"
                min="0.1"
              />
              <small className="form-help">
                Enter the total number of roofing squares for this project
              </small>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Proposal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProposal; 