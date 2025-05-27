// Wait for Firebase to be fully loaded
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        if (typeof firebase !== 'undefined') {
            resolve();
        } else {
            const maxAttempts = 10;
            let attempts = 0;
            const checkFirebase = setInterval(() => {
                attempts++;
                if (typeof firebase !== 'undefined') {
                    clearInterval(checkFirebase);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkFirebase);
                    reject(new Error('Firebase failed to load after multiple attempts'));
                }
            }, 500);
        }
    });
}

// Initialize Firebase collections after Firebase is loaded
async function initializeFirebase() {
    try {
        await waitForFirebase();
        contentCol = firebase.firestore().collection('roofing_options');
        usersCol = firebase.firestore().collection('users');
        debugLog('Firebase initialized successfully', 'success');
        return true;
    } catch (error) {
        debugLog(`Firebase initialization failed: ${error.message}`, 'error');
        showError('Failed to initialize Firebase. Please refresh the page.');
        return false;
    }
}

// Admin content management - aligned with existing structure
let contentCol;
let usersCol;
let currentContent = null;
let debugOutput = null;
let editingUserId = null;

/**
 * Debug logging function
 */
function debugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
        info: '#0f0',
        error: '#f00',
        warn: '#ff0',
        success: '#0f0'
    };
    
    if (!debugOutput) {
        debugOutput = document.getElementById('debug-output');
    }
    
    if (debugOutput) {
        const logEntry = `[${timestamp}] ${message}\n`;
        debugOutput.innerHTML += `<span style="color: ${colors[type] || '#0f0'}">${logEntry}</span>`;
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
    
    console.log(`[ADMIN DEBUG] ${message}`);
}

/**
 * Clear debug output
 */
function clearDebug() {
    if (debugOutput) {
        debugOutput.innerHTML = '';
    }
}

/**
 * Test Firebase connection
 */
async function testFirebaseConnection() {
    debugLog('Testing Firebase connection...', 'info');
    
    try {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase not loaded');
        }
        debugLog('✓ Firebase object exists', 'success');
        
        if (firebase.apps.length === 0) {
            throw new Error('No Firebase apps initialized');
        }
        debugLog(`✓ Firebase apps initialized: ${firebase.apps.length}`, 'success');
        
        const app = firebase.app();
        debugLog(`✓ Firebase app name: ${app.name}`, 'success');
        
        if (!firebase.firestore) {
            throw new Error('Firestore not available');
        }
        debugLog('✓ Firestore available', 'success');
        
        const db = firebase.firestore();
        debugLog('✓ Firestore instance created', 'success');
        
        return true;
    } catch (error) {
        debugLog(`✗ Firebase connection failed: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Test Firestore read operations
 */
async function testFirestoreRead() {
    debugLog('Testing Firestore read operations...', 'info');
    
    try {
        const snapshot = await contentCol.limit(1).get();
        debugLog(`✓ Read test successful, docs found: ${snapshot.size}`, 'success');
        
        const allSnapshot = await contentCol.get();
        debugLog(`✓ All documents read: ${allSnapshot.size}`, 'success');
        
        allSnapshot.forEach(doc => {
            debugLog(`Document ${doc.id}: ${JSON.stringify(doc.data())}`, 'info');
        });
        
        return true;
    } catch (error) {
        debugLog(`✗ Firestore read failed: ${error.message}`, 'error');
        debugLog(`Error code: ${error.code}`, 'error');
        return false;
    }
}

/**
 * Test Firestore write operations
 */
async function testFirestoreWrite() {
    debugLog('Testing Firestore write operations...', 'info');
    
    try {
        const testDoc = contentCol.doc('test-write');
        await testDoc.set({
            test: true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        debugLog('✓ Write test successful', 'success');
        
        await testDoc.delete();
        debugLog('✓ Delete test successful', 'success');
        
        return true;
    } catch (error) {
        debugLog(`✗ Firestore write failed: ${error.message}`, 'error');
        debugLog(`Error code: ${error.code}`, 'error');
        return false;
    }
}

/**
 * Debug function to check user document
 */
async function debugUserDocument() {
    const user = localStorage.getItem('loggedInUser');
    debugLog(`Debugging user document for: ${user}`, 'info');
    
    try {
        const userDoc = await usersCol.doc(user).get();
        debugLog(`User document exists: ${userDoc.exists}`, 'info');
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            debugLog('User document data:', 'info');
            debugLog(JSON.stringify(userData, null, 2), 'info');
        }
    } catch (error) {
        debugLog(`Error getting user document: ${error.message}`, 'error');
    }
}

/**
 * Check authentication and admin privileges
 */
async function checkAdminAuth() {
    const user = localStorage.getItem('loggedInUser');
    debugLog(`Checking admin auth for user: ${user}`, 'info');
    
    if (!user) {
        debugLog('No user found in localStorage, redirecting to login', 'warn');
        window.location.href = 'login.html';
        return false;
    }

    try {
        debugLog('Querying user document...', 'info');
        const userDoc = await usersCol.doc(user.toLowerCase()).get();
        
        if (!userDoc.exists) {
            debugLog('User document does not exist', 'error');
            showError('User account not found. Please contact support.');
            return false;
        }

        const userData = userDoc.data();
        debugLog(`User role: ${userData.role}`, 'info');
        
        if (!userData.role || userData.role.toLowerCase() !== 'admin') {
            debugLog('User is not admin - access denied', 'error');
            showError('You do not have permission to access the admin panel.');
            return false;
        }
        
        debugLog('✓ Admin auth successful', 'success');
        return true;
    } catch (error) {
        debugLog(`✗ Error checking admin auth: ${error.message}`, 'error');
        showError('Failed to verify admin access. Please try again.');
        return false;
    }
}

/**
 * Show error message for non-admin users
 */
function showError(message) {
    debugLog(`Showing error page: ${message}`, 'warn');
    document.getElementById('loading').style.display = 'none';
    
    // Hide the main content areas
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    if (mainContent) mainContent.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    
    // Show error page
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.style.display = 'block';
        // Update error message if provided
        if (message) {
            const errorMessage = errorDiv.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
    }
}

/**
 * Load existing content from Firestore
 */
async function loadContent() {
    debugLog('Loading content from Firestore...', 'info');
    try {
        debugLog('Querying roofing_options collection...', 'info');
        const snapshot = await contentCol.get();
        debugLog(`Firestore query successful, documents found: ${snapshot.size}`, 'success');
        
        currentContent = {};
        
        snapshot.forEach(doc => {
            const data = doc.data();
            debugLog(`Document ${doc.id}: ${JSON.stringify(data)}`, 'info');
            currentContent[data.type] = data;
        });
        
        debugLog(`Current content after loading: ${JSON.stringify(currentContent)}`, 'info');
        
        if (Object.keys(currentContent).length === 0) {
            debugLog('No content found, using defaults', 'warn');
            currentContent = getDefaultContent();
        }
        
        debugLog('Populating form...', 'info');
        populateForm();
        debugLog('Updating preview...', 'info');
        updatePreview();
        debugLog('✓ Content loading complete', 'success');
        
    } catch (error) {
        debugLog(`✗ Error loading content: ${error.message}`, 'error');
        debugLog(`Error code: ${error.code}`, 'error');
        currentContent = getDefaultContent();
        populateForm();
        updatePreview();
    }
}

/**
 * Default content structure - matches existing data model with new pricing
 */
function getDefaultContent() {
    return {
        good: {
            type: 'good',
            title: "Standard Quality",
            description: "Quality 3-tab asphalt shingles with reliable protection. Perfect for budget-conscious homeowners who want dependable roofing.",
            image: "",
            warranty: "20-year manufacturer warranty with 5-year workmanship guarantee",
            pricePerSquare: 625,
            pricePerSquareUnder16: 725
        },
        better: {
            type: 'better',
            title: "Premium Quality", 
            description: "Premium architectural shingles with enhanced durability and curb appeal. Superior wind resistance and longer lifespan.",
            image: "",
            warranty: "30-year manufacturer warranty with 10-year workmanship guarantee",
            pricePerSquare: 770,
            pricePerSquareUnder16: 870
        },
        best: {
            type: 'best',
            title: "Elite Quality",
            description: "Top-tier designer shingles with lifetime warranty. Premium materials with enhanced insulation and comprehensive protection.",
            image: "",
            warranty: "Lifetime manufacturer warranty with 15-year workmanship guarantee",
            pricePerSquare: 850,
            pricePerSquareUnder16: 950
        }
    };
}

/**
 * Populate form with current content
 */
function populateForm() {
    if (!currentContent) return;

    // Helper function to safely set input values
    const safeSetValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        } else {
            debugLog(`Warning: Element with id '${id}' not found`, 'warn');
        }
    };

    // Good option
    safeSetValue('good-title', currentContent.good?.title || '');
    safeSetValue('good-description', currentContent.good?.description || '');
    safeSetValue('good-warranty', currentContent.good?.warranty || '');
    safeSetValue('good-image', currentContent.good?.image || '');
    safeSetValue('good-price', currentContent.good?.pricePerSquare || 625);
    safeSetValue('good-price-under16', currentContent.good?.pricePerSquareUnder16 || 725);
    
    // Better option
    safeSetValue('better-title', currentContent.better?.title || '');
    safeSetValue('better-description', currentContent.better?.description || '');
    safeSetValue('better-warranty', currentContent.better?.warranty || '');
    safeSetValue('better-image', currentContent.better?.image || '');
    safeSetValue('better-price', currentContent.better?.pricePerSquare || 770);
    safeSetValue('better-price-under16', currentContent.better?.pricePerSquareUnder16 || 870);
    
    // Best option
    safeSetValue('best-title', currentContent.best?.title || '');
    safeSetValue('best-description', currentContent.best?.description || '');
    safeSetValue('best-warranty', currentContent.best?.warranty || '');
    safeSetValue('best-image', currentContent.best?.image || '');
    safeSetValue('best-price', currentContent.best?.pricePerSquare || 850);
    safeSetValue('best-price-under16', currentContent.best?.pricePerSquareUnder16 || 950);
}

/**
 * Update preview cards
 */
function updatePreview() {
    try {
        // Helper function to safely update text content
        const safeUpdateText = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '...';
            }
        };

        // Good option preview
        safeUpdateText('preview-good-title', document.getElementById('good-title')?.value);
        safeUpdateText('preview-good-description', document.getElementById('good-description')?.value);
        safeUpdateText('preview-good-warranty', document.getElementById('good-warranty')?.value);
        
        // Better option preview
        safeUpdateText('preview-better-title', document.getElementById('better-title')?.value);
        safeUpdateText('preview-better-description', document.getElementById('better-description')?.value);
        safeUpdateText('preview-better-warranty', document.getElementById('better-warranty')?.value);
        
        // Best option preview
        safeUpdateText('preview-best-title', document.getElementById('best-title')?.value);
        safeUpdateText('preview-best-description', document.getElementById('best-description')?.value);
        safeUpdateText('preview-best-warranty', document.getElementById('best-warranty')?.value);
    } catch (error) {
        debugLog(`Error updating preview: ${error.message}`, 'error');
    }
}

/**
 * Save content to Firestore - matches existing structure with new pricing
 */
async function saveContent() {
    debugLog('=== SAVING CONTENT ===', 'info');
    const saveBtn = document.querySelector('.save-btn');
    const status = document.getElementById('status');
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    status.style.display = 'none';

    try {
        debugLog('Creating batch write operation...', 'info');
        const batch = firebase.firestore().batch();
        const currentUser = localStorage.getItem('loggedInUser');
        
        const options = [
            {
                type: 'good',
                title: document.getElementById('good-title').value.trim(),
                description: document.getElementById('good-description').value.trim(),
                warranty: document.getElementById('good-warranty').value.trim(),
                image: document.getElementById('good-image').value.trim(),
                pricePerSquare: parseFloat(document.getElementById('good-price').value) || 625,
                pricePerSquareUnder16: parseFloat(document.getElementById('good-price-under16').value) || 725
            },
            {
                type: 'better',
                title: document.getElementById('better-title').value.trim(),
                description: document.getElementById('better-description').value.trim(),
                warranty: document.getElementById('better-warranty').value.trim(),
                image: document.getElementById('better-image').value.trim(),
                pricePerSquare: parseFloat(document.getElementById('better-price').value) || 770,
                pricePerSquareUnder16: parseFloat(document.getElementById('better-price-under16').value) || 870
            },
            {
                type: 'best',
                title: document.getElementById('best-title').value.trim(),
                description: document.getElementById('best-description').value.trim(),
                warranty: document.getElementById('best-warranty').value.trim(),
                image: document.getElementById('best-image').value.trim(),
                pricePerSquare: parseFloat(document.getElementById('best-price').value) || 850,
                pricePerSquareUnder16: parseFloat(document.getElementById('best-price-under16').value) || 950
            }
        ];

        debugLog(`Preparing to save ${options.length} options`, 'info');

        // Validate required fields
        for (const option of options) {
            debugLog(`Validating ${option.type} option...`, 'info');
            if (!option.title || !option.description || !option.warranty) {
                const error = `All fields are required for ${option.type} option`;
                debugLog(`✗ Validation failed: ${error}`, 'error');
                throw new Error(error);
            }
            if (option.pricePerSquareUnder16 <= option.pricePerSquare) {
                const error = `Under-16 price must be higher than regular price for ${option.type} option`;
                debugLog(`✗ Validation failed: ${error}`, 'error');
                throw new Error(error);
            }
            debugLog(`✓ ${option.type} validation passed`, 'success');
        }

        // Save each option as separate document
        options.forEach(option => {
            const docData = {
                ...option,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser
            };
            debugLog(`Adding ${option.type} to batch: ${JSON.stringify(docData)}`, 'info');
            batch.set(contentCol.doc(option.type), docData);
        });

        debugLog('Committing batch write...', 'info');
        await batch.commit();
        debugLog('✓ Batch write successful!', 'success');
        
        // Update local data
        currentContent = {};
        options.forEach(option => {
            currentContent[option.type] = option;
        });
        
        status.className = 'status success';
        status.textContent = 'Content saved successfully!';
        status.style.display = 'block';
        
        debugLog('✓ Content save operation complete!', 'success');

    } catch (error) {
        debugLog(`✗ Error saving content: ${error.message}`, 'error');
        debugLog(`Error code: ${error.code}`, 'error');
        
        status.className = 'status error';
        status.textContent = 'Error saving content: ' + error.message;
        status.style.display = 'block';
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save All Content';
        
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }
}

/**
 * Add real-time preview updates
 */
function setupPreviewUpdates() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

/**
 * Show content form
 */
function showContentForm() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content-form').style.display = 'block';
}

/**
 * Global logout function
 */
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

/**
 * Initialize the admin panel
 */
async function initAdminPanel() {
    debugLog('Initializing admin panel...', 'info');
    
    try {
        // Check authentication
        const isAdmin = await checkAdminAuth();
        if (!isAdmin) {
            debugLog('Admin authentication failed', 'error');
            return;
        }

        debugLog('Admin authentication successful, showing admin panel', 'success');

        // Hide loading screen and show main content
        document.getElementById('loading').style.display = 'none';
        
        // Ensure main content and sidebar are visible
        const mainContent = document.querySelector('.main-content');
        const sidebar = document.querySelector('.sidebar');
        if (mainContent) mainContent.style.display = 'block';
        if (sidebar) sidebar.style.display = 'block';

        // Setup navigation
        setupNavigation();

        // Load initial content
        await loadContent();
        await loadUsers();

        debugLog('Admin panel initialized successfully', 'success');
    } catch (error) {
        debugLog(`Error initializing admin panel: ${error.message}`, 'error');
        document.getElementById('loading').style.display = 'none';
        showError('Failed to initialize admin panel. Please try refreshing the page.');
    }
}

/**
 * Setup navigation functionality
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');

            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

/**
 * Load and display users
 */
async function loadUsers() {
    try {
        const snapshot = await usersCol.get();
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        snapshot.forEach(doc => {
            const user = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.email}</td>
                <td>${user.fullName || ''}</td>
                <td>${user.role || 'user'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline" onclick="editUser('${doc.id}')">
                            <i class="material-icons">edit</i>
                        </button>
                        <button class="btn btn-outline" onclick="deleteUser('${doc.id}')">
                            <i class="material-icons">delete</i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users');
    }
}

/**
 * Add a new user
 */
async function addUser() {
    const email = document.getElementById('new-user-email').value.trim();
    const fullName = document.getElementById('new-user-fullname').value.trim();
    const password = document.getElementById('new-user-password').value;
    const role = document.getElementById('new-user-role').value;

    if (!email || !fullName || !password) {
        showError('Please fill in all required fields');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    try {
        // Check if user already exists
        const userDoc = await usersCol.doc(email.toLowerCase()).get();
        if (userDoc.exists) {
            showError('User with this email already exists');
            return;
        }

        await usersCol.doc(email.toLowerCase()).set({
            email: email.toLowerCase(),
            fullName: fullName,
            password: password, // Note: In a production environment, this should be hashed
            role: role,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Clear form and reload users
        document.getElementById('new-user-email').value = '';
        document.getElementById('new-user-fullname').value = '';
        document.getElementById('new-user-password').value = '';
        await loadUsers();
        showSuccess('User added successfully');
    } catch (error) {
        console.error('Error adding user:', error);
        showError('Failed to add user');
    }
}

/**
 * Edit user
 */
async function editUser(userId) {
    try {
        const userDoc = await usersCol.doc(userId).get();
        if (!userDoc.exists) {
            showError('User not found');
            return;
        }

        const userData = userDoc.data();
        editingUserId = userId;

        // Populate the edit form
        document.getElementById('edit-user-email').value = userData.email;
        document.getElementById('edit-user-fullname').value = userData.fullName || '';
        document.getElementById('edit-user-password').value = ''; // Clear password field
        document.getElementById('edit-user-role').value = userData.role || 'user';

        // Show the modal
        document.getElementById('edit-user-modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading user:', error);
        showError('Failed to load user details');
    }
}

/**
 * Close the edit modal
 */
function closeEditModal() {
    document.getElementById('edit-user-modal').style.display = 'none';
    editingUserId = null;
}

/**
 * Save user edits
 */
async function saveUserEdit() {
    if (!editingUserId) {
        showError('No user selected for editing');
        return;
    }

    const fullName = document.getElementById('edit-user-fullname').value.trim();
    const password = document.getElementById('edit-user-password').value;
    const role = document.getElementById('edit-user-role').value;

    if (!fullName) {
        showError('Full name is required');
        return;
    }

    if (password && password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    try {
        const updateData = {
            fullName: fullName,
            role: role,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Only update password if a new one was provided
        if (password) {
            updateData.password = password;
        }

        await usersCol.doc(editingUserId).update(updateData);
        
        // Close modal and refresh user list
        closeEditModal();
        await loadUsers();
        showSuccess('User updated successfully');
    } catch (error) {
        console.error('Error updating user:', error);
        showError('Failed to update user');
    }
}

/**
 * Delete user
 */
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        await usersCol.doc(userId).delete();
        await loadUsers();
        showSuccess('User deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Failed to delete user');
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    // Implement toast notification
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Show a specific section and update navigation
 */
function showSection(sectionId) {
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    // Show selected section
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
}

// Global function declarations for onclick handlers
window.saveContent = saveContent;
window.addUser = addUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.testFirebaseConnection = testFirebaseConnection;
window.testFirestoreRead = testFirestoreRead;
window.testFirestoreWrite = testFirestoreWrite;
window.clearDebug = clearDebug;
window.logout = logout;
window.debugUserDocument = debugUserDocument;
window.closeEditModal = closeEditModal;
window.saveUserEdit = saveUserEdit;
window.showSection = showSection;

document.addEventListener('DOMContentLoaded', async () => {
    debugLog('DOM loaded, initializing admin panel...', 'info');
    
    // Check if user is logged in
    const user = localStorage.getItem('loggedInUser');
    debugLog(`Logged in user: ${user}`, 'info');
    
    // Initialize Firebase first
    const firebaseInitialized = await initializeFirebase();
    if (!firebaseInitialized) {
        return;
    }
    
    initAdminPanel();
});