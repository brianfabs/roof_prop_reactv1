import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProposals } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';

function CreateProposal() {
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    squares: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { createProposal } = useProposals();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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
      
      const proposalData = {
        customerName: formData.customerName.trim(),
        address: formData.address.trim(),
        squares: squares,
        createdBy: currentUser.email,
        updatedBy: currentUser.email
      };
      
      const proposalId = await createProposal(proposalData);
      navigate(`/proposal/${proposalId}`);
    } catch (error) {
      setError('Failed to create proposal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-proposal">
      <Navigation />
      
      <div className="create-proposal-content">
        <div className="form-container">
          <h1>Create New Proposal</h1>
          
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
                {loading ? 'Creating...' : 'Create Proposal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProposal; 