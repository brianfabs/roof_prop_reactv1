const usersCol = firebase.firestore().collection('users');

async function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    // Clear previous errors and hide error div
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    if (!email || !password) {
        errorDiv.textContent = 'Email and password are required.';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const doc = await usersCol.doc(email).get();
        if (!doc.exists || !doc.data()) {
            errorDiv.textContent = 'Invalid credentials.';
            errorDiv.style.display = 'block';
            return;
        }
        const data = doc.data();
        if (data.password !== password) {
            errorDiv.textContent = 'Invalid credentials.';
            errorDiv.style.display = 'block';
            return;
        }
        localStorage.setItem('loggedInUser', email);
        window.location.href = 'dashboard.html';
    } catch (err) {
        console.error('Login failed', err);
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Allow Enter key to submit login
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    emailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
});