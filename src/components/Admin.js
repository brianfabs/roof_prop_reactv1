import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import LoanOptionsManager from './LoanOptionsManager';

function Admin() {
  const [section, setSection] = useState('dashboard');
  // User management state
  const [users, setUsers] = useState([]); // Firestore users
  const [newUser, setNewUser] = useState({ email: '', fullName: '', password: '', role: 'user' });
  const [editUser, setEditUser] = useState(null); // { email, fullName, password, role }
  const [showEditModal, setShowEditModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState('');
  // Content management state
  const [options, setOptions] = useState({
    good: { title: '', description: '', warranty: '', image: '', pricePerSquare: '', pricePerSquareUnder16: '' },
    better: { title: '', description: '', warranty: '', image: '', pricePerSquare: '', pricePerSquareUnder16: '' },
    best: { title: '', description: '', warranty: '', image: '', pricePerSquare: '', pricePerSquareUnder16: '' }
  });
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsMsg, setOptionsMsg] = useState('');

  // Fetch users from Firestore
  useEffect(() => {
    if (section === 'users') fetchUsers();
    // eslint-disable-next-line
  }, [section]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUserError('');
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => doc.data()));
    } catch (err) {
      setUserError('Failed to load users: ' + err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Add user to Firestore
  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserError('');
    try {
      if (!newUser.email || !newUser.fullName || !newUser.password) {
        setUserError('All fields are required.');
        return;
      }
      const userDoc = doc(db, 'users', newUser.email.toLowerCase());
      await setDoc(userDoc, {
        email: newUser.email.toLowerCase(),
        fullName: newUser.fullName,
        password: newUser.password,
        role: newUser.role
      });
      setNewUser({ email: '', fullName: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setUserError('Failed to add user: ' + err.message);
    }
  };

  // Edit user (open modal)
  const handleEditUser = (user) => {
    setEditUser({ ...user, password: '' }); // Don't show password
    setShowEditModal(true);
  };

  // Save edited user to Firestore
  const handleSaveEditUser = async () => {
    setUserError('');
    try {
      const userDoc = doc(db, 'users', editUser.email.toLowerCase());
      const updateData = {
        fullName: editUser.fullName,
        role: editUser.role
      };
      if (editUser.password) updateData.password = editUser.password;
      await updateDoc(userDoc, updateData);
      setShowEditModal(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setUserError('Failed to update user: ' + err.message);
    }
  };

  // Delete user from Firestore
  const handleDeleteUser = async (email) => {
    setUserError('');
    try {
      await deleteDoc(doc(db, 'users', email.toLowerCase()));
      fetchUsers();
    } catch (err) {
      setUserError('Failed to delete user: ' + err.message);
    }
  };

  // Load options from Firestore when section is 'content'
  useEffect(() => {
    if (section === 'content') fetchOptions();
    // eslint-disable-next-line
  }, [section]);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    setOptionsMsg('');
    try {
      const snapshot = await getDocs(collection(db, 'roofing_options'));
      const opts = { ...options };
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (opts[data.type]) {
          opts[data.type] = {
            title: data.title || '',
            description: data.description || '',
            warranty: data.warranty || '',
            image: data.image || '',
            pricePerSquare: data.pricePerSquare || '',
            pricePerSquareUnder16: data.pricePerSquareUnder16 || ''
          };
        }
      });
      setOptions(opts);
    } catch (err) {
      setOptionsMsg('Failed to load options: ' + err.message);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleOptionChange = (type, field, value) => {
    setOptions(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleSaveOptions = async (e) => {
    e.preventDefault();
    setOptionsMsg('');
    setLoadingOptions(true);
    try {
      // Save each option as a doc
      await Promise.all(['good', 'better', 'best'].map(async type => {
        const docRef = doc(db, 'roofing_options', type);
        await setDoc(docRef, {
          type,
          ...options[type],
          pricePerSquare: parseFloat(options[type].pricePerSquare) || 0,
          pricePerSquareUnder16: parseFloat(options[type].pricePerSquareUnder16) || 0
        });
      }));
      setOptionsMsg('Options saved successfully!');
    } catch (err) {
      setOptionsMsg('Failed to save options: ' + err.message);
    } finally {
      setLoadingOptions(false);
    }
  };

  return (
    <div className="admin-root" style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <aside className="sidebar admin-sidebar" style={{ width: 250, background: 'white', borderRight: '1px solid #e8eaed', padding: '24px 0', minHeight: '100vh' }}>
        <div className="sidebar-header" style={{ padding: '0 24px 24px', borderBottom: '1px solid #e8eaed' }}>
          <h1 className="sidebar-title" style={{ fontSize: 20, margin: 0, color: '#1a73e8' }}>Admin Panel</h1>
          <p className="sidebar-subtitle" style={{ margin: '8px 0 0', color: '#5f6368', fontSize: 14 }}>Global Roofing Management</p>
        </div>
        <ul className="nav-menu" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { key: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
            { key: 'users', icon: 'people', label: 'User Management' },
            { key: 'content', icon: 'edit', label: 'Content Management' },
            { key: 'loans', icon: 'payments', label: 'Loan Options' },
            { key: 'debug', icon: 'bug_report', label: 'Debug' }
          ].map(item => (
            <li key={item.key} className={`nav-item${section === item.key ? ' active' : ''}`} style={{ margin: 0 }}>
              <button
                className="nav-link"
                onClick={() => setSection(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 12,
                  padding: '12px 0 12px 24px',
                  color: section === item.key ? '#1a73e8' : '#5f6368',
                  background: section === item.key ? '#e8f0fe' : 'transparent',
                  fontSize: 15,
                  fontWeight: 500,
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  borderRadius: 0,
                  margin: 0,
                  borderLeft: section === item.key ? '4px solid #1a73e8' : '4px solid transparent',
                  transition: 'all 0.18s',
                  boxShadow: 'none'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f1f3f4'}
                onMouseOut={e => e.currentTarget.style.background = section === item.key ? '#e8f0fe' : 'transparent'}
              >
                <span className="material-icons nav-icon" style={{ fontSize: 20, textAlign: 'left' }}>{item.icon}</span>
                <span style={{ textAlign: 'left', display: 'block', padding: 0, margin: 0 }}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content admin-main-content" style={{ flex: 1, padding: 24 }}>
        {section === 'dashboard' && (
          <section className="content-section active">
            <header className="admin-header">
              <div className="admin-header-row">
                <div>
                  <h2 className="admin-title">Dashboard</h2>
                  <p className="admin-subtitle">Welcome to the Global Roofing Admin Panel</p>
                </div>
                <a href="/dashboard" className="btn btn-green btn-lg back-btn">
                  <span className="material-icons">arrow_back</span>
                  <span>Back to Dashboard</span>
                </a>
              </div>
            </header>
            <div className="admin-grid">
              <div className="admin-card">
                <div className="card-header">
                  <span className="card-icon card-icon-blue"><span className="material-icons">people</span></span>
                  <span className="card-title">Users</span>
                </div>
                <p className="card-description">Manage user accounts and permissions</p>
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={() => setSection('users')}>
                    Manage Users
                  </button>
                </div>
              </div>
              <div className="admin-card">
                <div className="card-header">
                  <span className="card-icon card-icon-green"><span className="material-icons">edit</span></span>
                  <span className="card-title">Content</span>
                </div>
                <p className="card-description">Manage roofing options and content</p>
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={() => setSection('content')}>
                    Manage Content
                  </button>
                </div>
              </div>
              <div className="admin-card">
                <div className="card-header">
                  <span className="card-icon card-icon-purple"><span className="material-icons">payments</span></span>
                  <span className="card-title">Loan Options</span>
                </div>
                <p className="card-description">Manage financing options for proposals</p>
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={() => setSection('loans')}>
                    Manage Loans
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {section === 'users' && (
          <section className="content-section active">
            <header className="admin-header">
              <div className="admin-header-row">
                <div>
                  <h2 className="admin-title">User Management</h2>
                  <p className="admin-subtitle">Manage user accounts and permissions</p>
                </div>
                <button className="btn btn-green btn-lg back-btn" onClick={() => setSection('dashboard')}>
                  <span className="material-icons">arrow_back</span>
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </header>
            <form className="add-user-form" style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e8eaed', maxWidth: 800, marginBottom: 24 }} onSubmit={handleAddUser}>
              <div className="form-row" style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" required placeholder="Enter email address" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div className="form-field" style={{ flex: 1 }}>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required placeholder="Enter full name" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
                </div>
              </div>
              <div className="form-row" style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" required placeholder="Enter password (min 6 characters)" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div className="form-field" style={{ flex: 1 }}>
                  <label className="form-label">Role</label>
                  <select className="form-input" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" type="submit">Add User</button>
              </div>
              {userError && <div className="error-message" style={{ color: 'red', marginTop: 12 }}>{userError}</div>}
            </form>
            {loadingUsers ? (
              <div style={{ padding: 24 }}>Loading users...</div>
            ) : (
              <table className="user-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.email}>
                      <td>{user.email}</td>
                      <td>{user.fullName}</td>
                      <td>{user.role}</td>
                      <td className="action-buttons" style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={() => handleEditUser(user)}>Edit</button>
                        <button className="btn btn-outline" onClick={() => handleDeleteUser(user.email)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Edit User Modal */}
            {showEditModal && editUser && (
              <div className="modal" style={{ display: 'block', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                <div className="modal-content" style={{ position: 'relative', background: 'white', margin: '10% auto', padding: 24, width: '90%', maxWidth: 500, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2>Edit User</h2>
                    <button className="close-btn" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#5f6368', cursor: 'pointer', padding: 0 }}>&times;</button>
                  </div>
                  <div className="modal-body" style={{ marginBottom: 20 }}>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" value={editUser.email} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" value={editUser.fullName} onChange={e => setEditUser({ ...editUser, fullName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password (leave blank to keep current)</label>
                      <input type="password" className="form-input" placeholder="Enter new password" onChange={e => setEditUser({ ...editUser, password: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <select className="form-input" value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button className="btn btn-primary" onClick={handleSaveEditUser}>Save Changes</button>
                    <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                  </div>
                  {userError && <div className="error-message" style={{ color: 'red', marginTop: 12 }}>{userError}</div>}
                </div>
              </div>
            )}
          </section>
        )}

        {section === 'content' && (
          <section className="content-section active">
            <header className="admin-header">
              <div className="admin-header-row">
                <div>
                  <h2 className="admin-title">Content Management</h2>
                  <p className="admin-subtitle">Manage roofing options and content</p>
                </div>
                <button className="btn btn-green btn-lg back-btn" onClick={() => setSection('dashboard')}>
                  <span className="material-icons">arrow_back</span>
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </header>
            <form className="form-grid" onSubmit={handleSaveOptions} style={{ marginBottom: 32 }}>
              {['good', 'better', 'best'].map(type => (
                <div key={type} className="option-form-group" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e8eaed', padding: 24, marginBottom: 24 }}>
                  <h3 style={{ color: '#1a73e8', marginBottom: 16, textTransform: 'capitalize' }}>{type} Option</h3>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-input" value={options[type].title} onChange={e => handleOptionChange(type, 'title', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={3} value={options[type].description} onChange={e => handleOptionChange(type, 'description', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warranty</label>
                    <input type="text" className="form-input" value={options[type].warranty} onChange={e => handleOptionChange(type, 'warranty', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input type="url" className="form-input" value={options[type].image} onChange={e => handleOptionChange(type, 'image', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price per Square</label>
                    <input type="number" className="form-input" value={options[type].pricePerSquare} onChange={e => handleOptionChange(type, 'pricePerSquare', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price per Square (Under 16)</label>
                    <input type="number" className="form-input" value={options[type].pricePerSquareUnder16} onChange={e => handleOptionChange(type, 'pricePerSquareUnder16', e.target.value)} required />
                  </div>
                </div>
              ))}
              <div className="form-group" style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                <button type="submit" className="btn btn-blue" disabled={loadingOptions}>{loadingOptions ? 'Saving...' : 'Save Content'}</button>
                {optionsMsg && <div style={{ marginTop: 12, color: optionsMsg.includes('success') ? 'green' : 'red' }}>{optionsMsg}</div>}
              </div>
            </form>
          </section>
        )}

        {section === 'loans' && (
          <section className="content-section active">
            <header className="admin-header">
              <div className="admin-header-row">
                <div>
                  <h2 className="admin-title">Loan Options Management</h2>
                  <p className="admin-subtitle">Manage financing options for proposals</p>
                </div>
                <button className="btn btn-green btn-lg back-btn" onClick={() => setSection('dashboard')}>
                  <span className="material-icons">arrow_back</span>
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </header>
            <LoanOptionsManager />
          </section>
        )}

        {section === 'debug' && (
          <section className="content-section active">
            <header className="admin-header">
              <div className="admin-header-row">
                <div>
                  <h2 className="admin-title">Debug Tools</h2>
                  <p className="admin-subtitle">Development and debugging utilities</p>
                </div>
                <button className="btn btn-green btn-lg back-btn" onClick={() => setSection('dashboard')}>
                  <span className="material-icons">arrow_back</span>
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </header>
            {/* Debug tools content */}
          </section>
        )}
      </main>
    </div>
  );
}

export default Admin; 