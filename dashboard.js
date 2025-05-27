// Dashboard functionality with proposal listing
const proposalsCol = firebase.firestore().collection('proposals');
const usersCol = firebase.firestore().collection('users');

let currentUser = null;
let currentPage = 1;
let totalPages = 1;
let proposalsPerPage = 10;
let allProposals = [];

function checkAuth() {
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    currentUser = user;
    return true;
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

/**
 * Check if user is admin and show admin button
 */
async function checkUserRole() {
    try {
        const userDoc = await usersCol.doc(currentUser).get();
        if (userDoc.exists && userDoc.data().role === 'admin') {
            document.getElementById('nav-admin').style.display = 'block';
        }
    } catch (error) {
        console.error('Error checking user role:', error);
    }
}

/**
 * Load proposals for the current user
 */
async function loadProposals() {
    try {
        console.log('Loading proposals for user:', currentUser);
        
        // Query proposals created by current user, ordered by creation date (newest first)
        const snapshot = await proposalsCol
            .where('createdBy', '==', currentUser)
            .orderBy('createdAt', 'desc')
            .get();

        allProposals = [];
        snapshot.forEach(doc => {
            allProposals.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('Loaded proposals:', allProposals.length);
        
        // Calculate pagination
        totalPages = Math.ceil(allProposals.length / proposalsPerPage) || 1;
        currentPage = 1;
        
        displayProposals();
        
    } catch (error) {
        console.error('Error loading proposals:', error);
        showError('Error loading proposals: ' + error.message);
    }
}

/**
 * Display proposals for current page
 */
function displayProposals() {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');
    const proposalsContainer = document.getElementById('proposals-container');
    
    loading.style.display = 'none';
    
    if (allProposals.length === 0) {
        emptyState.style.display = 'block';
        proposalsContainer.style.display = 'none';
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    proposalsContainer.style.display = 'block';
    document.getElementById('pagination').style.display = 'flex';
    
    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * proposalsPerPage;
    const endIndex = Math.min(startIndex + proposalsPerPage, allProposals.length);
    const pageProposals = allProposals.slice(startIndex, endIndex);
    
    // Populate table
    const tbody = document.getElementById('proposals-tbody');
    tbody.innerHTML = '';
    
    pageProposals.forEach(proposal => {
        const row = document.createElement('tr');
        
        // Format date
        let createdDate = 'Unknown';
        if (proposal.createdAt && proposal.createdAt.toDate) {
            createdDate = proposal.createdAt.toDate().toLocaleDateString();
        } else if (proposal.createdAt) {
            createdDate = new Date(proposal.createdAt).toLocaleDateString();
        }
        
        row.innerHTML = `
            <td>${proposal.customerName || 'Unknown'}</td>
            <td>${proposal.address || 'No address'}</td>
            <td>${proposal.squares || 0}</td>
            <td>${createdDate}</td>
            <td style="white-space: nowrap;">
                <a href="proposal.html?id=${proposal.id}" class="btn btn-sm btn-primary" style="margin-right: 5px;">View</a>
                <a href="edit_proposal.html?id=${proposal.id}" class="btn btn-sm btn-secondary" style="margin-right: 5px;">Edit</a>
                <button onclick="deleteProposal('${proposal.id}', '${(proposal.customerName || 'Unknown').replace(/'/g, "\\'")}', '${(proposal.address || 'No address').replace(/'/g, "\\'")}')" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    updatePagination();
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

/**
 * Go to previous page
 */
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayProposals();
    }
}

/**
 * Go to next page
 */
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        displayProposals();
    }
}

/**
 * Show error message
 */
function showError(message) {
    const loading = document.getElementById('loading');
    loading.innerHTML = `<div style="color: red;">${message}</div>`;
}

/**
 * Delete a proposal with confirmation
 */
async function deleteProposal(proposalId, customerName, address) {
    try {
        // Show confirmation dialog
        const confirmMessage = `Are you sure you want to delete this proposal?\n\nCustomer: ${customerName}\nAddress: ${address}\n\nThis action cannot be undone.`;
        
        if (!confirm(confirmMessage)) {
            return; // User cancelled
        }
        
        console.log('Deleting proposal:', proposalId);
        
        // Delete from Firestore
        await proposalsCol.doc(proposalId).delete();
        
        console.log('Proposal deleted successfully');
        
        // Show success message briefly
        const loading = document.getElementById('loading');
        loading.style.display = 'block';
        loading.innerHTML = '<div style="color: green;">Proposal deleted successfully!</div>';
        
        // Reload proposals after a brief delay
        setTimeout(async () => {
            await loadProposals();
        }, 1000);
        
    } catch (error) {
        console.error('Error deleting proposal:', error);
        alert('Error deleting proposal: ' + error.message);
    }
}

/**
 * Initialize dashboard
 */
async function initDashboard() {
    console.log('Initializing dashboard...');
    
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    try {
        // Check user role for admin button
        await checkUserRole();
        
        // Load proposals
        await loadProposals();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Error loading dashboard');
    }
}

// Expose functions globally
window.logout = logout;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.deleteProposal = deleteProposal;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);