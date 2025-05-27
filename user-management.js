// Simple user management using Firestore only.
// No authentication or security checks are performed.

const usersCol = firebase.firestore().collection('users');
let editingEmail = null;

async function loadUsers() {
    try {
        const snapshot = await usersCol.get();
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.email}</td>
                <td>${data.fullName || ''}</td>
                <td>${data.role}</td>
                <td style="text-align:right;">
                    <button onclick="editUser('${data.email}')">Edit</button>
                    <button onclick="deleteUser('${data.email}')">Delete</button>
                </td>`;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to load users', err);
    }
}

document.addEventListener('DOMContentLoaded', loadUsers);

async function submitUser() {
    const email = document.getElementById('new-user-email').value.trim();
    const fullName = document.getElementById('new-user-fullname').value.trim();
    const password = document.getElementById('new-user-password').value;
    const role = document.getElementById('new-user-role').value;

    if (!email || !fullName || !password) {
        document.getElementById('user-error').textContent = 'All fields are required.';
        return;
    }

    try {
        const docRef = usersCol.doc(email);
        if (!editingEmail) {
            const snap = await docRef.get();
            if (snap.exists) {
                document.getElementById('user-error').textContent = 'Email already exists.';
                return;
            }
        } else if (editingEmail !== email) {
            // email not editable
            document.getElementById('user-error').textContent = 'Email cannot be changed.';
            return;
        }

        await docRef.set({ email, fullName, password, role });
        resetForm();
        loadUsers();
    } catch (err) {
        console.error('Failed to save user', err);
        document.getElementById('user-error').textContent = err.message;
    }
}

async function editUser(email) {
    try {
        const doc = await usersCol.doc(email).get();
        if (doc.exists) {
            const data = doc.data();
            editingEmail = email;
            document.getElementById('form-title').textContent = 'Edit User';
            document.getElementById('submit-btn').textContent = 'Save User';
            document.getElementById('new-user-email').value = data.email;
            document.getElementById('new-user-email').disabled = true;
            document.getElementById('new-user-fullname').value = data.fullName || '';
            document.getElementById('new-user-password').value = data.password || '';
            document.getElementById('new-user-role').value = data.role;
        }
    } catch (err) {
        console.error('Failed to load user', err);
    }
}

function resetForm() {
    editingEmail = null;
    document.getElementById('form-title').textContent = 'Create User';
    document.getElementById('submit-btn').textContent = 'Create User';
    document.getElementById('new-user-email').value = '';
    document.getElementById('new-user-email').disabled = false;
    document.getElementById('new-user-fullname').value = '';
    document.getElementById('new-user-password').value = '';
    document.getElementById('new-user-role').value = 'user';
    document.getElementById('user-error').textContent = '';
}

async function deleteUser(email) {
    if (!confirm('Delete this user?')) return;
    try {
        await usersCol.doc(email).delete();
        if (editingEmail === email) resetForm();
        loadUsers();
    } catch (err) {
        console.error('Failed to delete user', err);
    }
}
