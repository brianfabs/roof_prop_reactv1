import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc
} from 'firebase/firestore';

function LoanOptionsManager() {
  const [loanOptions, setLoanOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newOption, setNewOption] = useState({
    name: '',
    term: '',
    rate: '',
    minAmount: '',
    maxAmount: '',
    description: ''
  });
  const [editOption, setEditOption] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchLoanOptions();
  }, []);

  const fetchLoanOptions = async () => {
    setLoading(true);
    setError('');
    try {
      const snapshot = await getDocs(collection(db, 'loan_options'));
      const options = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLoanOptions(options);
    } catch (err) {
      setError('Failed to load loan options: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const docRef = doc(collection(db, 'loan_options'));
      await setDoc(docRef, {
        ...newOption,
        term: parseInt(newOption.term),
        rate: parseFloat(newOption.rate),
        minAmount: parseFloat(newOption.minAmount),
        maxAmount: parseFloat(newOption.maxAmount)
      });
      setNewOption({
        name: '',
        term: '',
        rate: '',
        minAmount: '',
        maxAmount: '',
        description: ''
      });
      fetchLoanOptions();
    } catch (err) {
      setError('Failed to add loan option: ' + err.message);
    }
  };

  const handleDeleteOption = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan option?')) {
      return;
    }
    setError('');
    try {
      await deleteDoc(doc(db, 'loan_options', id));
      fetchLoanOptions();
    } catch (err) {
      setError('Failed to delete loan option: ' + err.message);
    }
  };

  const handleEditOption = (option) => {
    setEditOption({ ...option });
    setShowEditModal(true);
  };

  const handleSaveEditOption = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const docRef = doc(db, 'loan_options', editOption.id);
      await setDoc(docRef, {
        ...editOption,
        term: parseInt(editOption.term),
        rate: parseFloat(editOption.rate),
        minAmount: parseFloat(editOption.minAmount),
        maxAmount: parseFloat(editOption.maxAmount)
      });
      setShowEditModal(false);
      setEditOption(null);
      fetchLoanOptions();
    } catch (err) {
      setError('Failed to update loan option: ' + err.message);
    }
  };

  if (loading) {
    return <div>Loading loan options...</div>;
  }

  return (
    <div className="content-section active">
      {error && <div className="error-message" style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleAddOption} style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Add New Loan Option</h3>
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={newOption.name}
              onChange={e => setNewOption({ ...newOption, name: e.target.value })}
              required
              placeholder="e.g., 10 Year Fixed"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Term (months)</label>
            <input
              type="number"
              className="form-input"
              value={newOption.term}
              onChange={e => setNewOption({ ...newOption, term: e.target.value })}
              required
              placeholder="e.g., 120"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Interest Rate (%)</label>
            <input
              type="number"
              className="form-input"
              value={newOption.rate}
              onChange={e => setNewOption({ ...newOption, rate: e.target.value })}
              required
              step="0.01"
              placeholder="e.g., 5.99"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Amount ($)</label>
            <input
              type="number"
              className="form-input"
              value={newOption.minAmount}
              onChange={e => setNewOption({ ...newOption, minAmount: e.target.value })}
              required
              placeholder="e.g., 10000"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Maximum Amount ($)</label>
            <input
              type="number"
              className="form-input"
              value={newOption.maxAmount}
              onChange={e => setNewOption({ ...newOption, maxAmount: e.target.value })}
              required
              placeholder="e.g., 100000"
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={newOption.description}
              onChange={e => setNewOption({ ...newOption, description: e.target.value })}
              required
              placeholder="Enter a description of the loan option"
              rows={3}
            />
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: 16, textAlign: 'right' }}>
          <button type="submit" className="btn btn-primary">Add Loan Option</button>
        </div>
      </form>

      <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: 16 }}>Current Loan Options</h3>
        {loanOptions.length === 0 ? (
          <p>No loan options found. Add your first option above.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Term</th>
                <th>Rate</th>
                <th>Min Amount</th>
                <th>Max Amount</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loanOptions.map(option => (
                <tr key={option.id}>
                  <td>{option.name}</td>
                  <td>{option.term} months</td>
                  <td>{option.rate}%</td>
                  <td>${typeof option.minAmount === 'number' && !isNaN(option.minAmount) ? option.minAmount.toLocaleString() : 'N/A'}</td>
                  <td>${typeof option.maxAmount === 'number' && !isNaN(option.maxAmount) ? option.maxAmount.toLocaleString() : 'N/A'}</td>
                  <td>{option.description}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ marginRight: 8 }}
                      onClick={() => handleEditOption(option)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEditModal && editOption && (
        <div className="modal" style={{ display: 'block', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <div className="modal-content" style={{ position: 'relative', background: 'white', margin: '5% auto', padding: 24, width: '90%', maxWidth: 500, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Edit Loan Option</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#5f6368', cursor: 'pointer', padding: 0 }}>&times;</button>
            </div>
            <form onSubmit={handleSaveEditOption}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editOption.name}
                  onChange={e => setEditOption({ ...editOption, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Term (months)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editOption.term}
                  onChange={e => setEditOption({ ...editOption, term: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Interest Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editOption.rate}
                  onChange={e => setEditOption({ ...editOption, rate: e.target.value })}
                  required
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Amount ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editOption.minAmount}
                  onChange={e => setEditOption({ ...editOption, minAmount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Amount ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editOption.maxAmount}
                  onChange={e => setEditOption({ ...editOption, maxAmount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={editOption.description}
                  onChange={e => setEditOption({ ...editOption, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="form-actions" style={{ marginTop: 16, textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanOptionsManager; 