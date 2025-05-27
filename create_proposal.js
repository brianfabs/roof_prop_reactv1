// Make sure firebase-config.js is loaded first and exposes firebase
const proposalsCol = firebase.firestore().collection('proposals');

/**
 * Redirect unauthenticated users to the login page.
 */
function checkAuth() {
  const user = localStorage.getItem('loggedInUser');
  console.log('Auth check - User from localStorage:', user);
  
  if (!user) {
    console.warn('No user found in localStorage, redirecting to login');
    window.location.href = 'login.html';
  } else {
    console.log('User authenticated:', user);
  }
}

/**
 * Display detailed error information in the UI
 */
function displayDetailedError(error, context = '') {
  const errorElement = document.getElementById('proposal-error');
  let errorMessage = '';
  
  if (context) {
    errorMessage += `Context: ${context}\n`;
  }
  
  if (error) {
    errorMessage += `Error Code: ${error.code || 'Unknown'}\n`;
    errorMessage += `Error Message: ${error.message || error.toString()}\n`;
    
    if (error.stack) {
      errorMessage += `Stack Trace: ${error.stack}\n`;
    }
    
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          errorMessage += 'Issue: You may not have permission to write to the proposals collection.\n';
          errorMessage += 'Check Firestore security rules.\n';
          break;
        case 'unauthenticated':
          errorMessage += 'Issue: Firebase authentication required.\n';
          break;
        case 'unavailable':
          errorMessage += 'Issue: Firestore service is temporarily unavailable.\n';
          break;
        case 'deadline-exceeded':
          errorMessage += 'Issue: Request timed out.\n';
          break;
        default:
          errorMessage += `Firebase Error Code: ${error.code}\n`;
      }
    }
  }
  
  console.error('Detailed error:', errorMessage);
  errorElement.innerHTML = `<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto;">${errorMessage}</pre>`;
}

/**
 * Test Firebase connection and permissions
 */
async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    if (!firebase.apps.length) {
      throw new Error('Firebase not initialized');
    }
    console.log('✓ Firebase is initialized');
    
    const testDoc = await firebase.firestore().collection('proposals').limit(1).get();
    console.log('✓ Firestore connection successful');
    console.log('✓ Can read from proposals collection');
    
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    displayDetailedError(error, 'Firebase Connection Test');
    return false;
  }
}

/**
 * Collect form values, validate them, and write a new proposal
 * document to Firestore, including the user who created it.
 */
async function addProposal(event) {
  // Prevent the default form submission
  if (event) {
    event.preventDefault();
  }
  
  try {
    console.log('Starting addProposal function...');
    
    // Clear previous errors
    document.getElementById('proposal-error').innerHTML = '';
    
    const connectionOk = await testFirebaseConnection();
    if (!connectionOk) {
      return;
    }
    
    const name = document.getElementById('customer-name').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const squaresValue = document.getElementById('total-squares').value;
    const squares = parseFloat(squaresValue);
    const createdBy = localStorage.getItem('loggedInUser');
    
    console.log('Form values:', {
      name,
      address,
      squaresValue,
      squares,
      createdBy
    });

    // Basic validation
    if (!name || !address || isNaN(squares)) {
      const error = 'Validation failed: All fields are required and squares must be a valid number.';
      console.error(error);
      displayDetailedError(new Error(error), 'Form Validation');
      return;
    }
    
    if (!createdBy) {
      const error = 'User not authenticated - no user found in localStorage.';
      console.error(error);
      displayDetailedError(new Error(error), 'Authentication Check');
      return;
    }

    const proposalData = {
      customerName: name,
      address,
      squares,
      createdBy,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('Attempting to save proposal data:', proposalData);
    
    const button = document.querySelector('button');
    const originalText = button.textContent;
    button.textContent = 'Saving...';
    button.disabled = true;
    
    try {
      const docRef = await proposalsCol.add(proposalData);
      console.log('✓ Proposal saved successfully with ID:', docRef.id);
      
      // Redirect to proposal page with the new proposal ID
      window.location.href = `proposal.html?id=${docRef.id}`;
      
    } catch (firestoreError) {
      console.error('Firestore write error:', firestoreError);
      displayDetailedError(firestoreError, 'Firestore Write Operation');
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
    
  } catch (generalError) {
    console.error('General error in addProposal:', generalError);
    displayDetailedError(generalError, 'General Function Error');
  }
}

function debugEnvironment() {
  console.log('=== DEBUG ENVIRONMENT ===');
  console.log('Firebase available:', typeof firebase !== 'undefined');
  console.log('Firebase apps:', firebase.apps ? firebase.apps.length : 'N/A');
  console.log('Firestore available:', typeof firebase.firestore !== 'undefined');
  console.log('Current URL:', window.location.href);
  console.log('Local storage user:', localStorage.getItem('loggedInUser'));
  console.log('Document ready state:', document.readyState);
  console.log('========================');
}

document.addEventListener('DOMContentLoaded', () => {
  debugEnvironment();
  checkAuth();
});

window.addProposal = addProposal;
window.testFirebaseConnection = testFirebaseConnection;
window.debugEnvironment = debugEnvironment;