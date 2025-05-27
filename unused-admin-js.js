// Admin content management - aligned with existing structure
const contentCol = firebase.firestore().collection('roofing_options');
const usersCol = firebase.firestore().collection('users');

let currentContent = null;

/**
 * Check authentication and admin privileges
 */
async function checkAdminAuth() {
    const user = localStorage.getItem('loggedInUser');
    console.log('Checking admin auth for user:', user);
    
    if (!user) {
        console.log('No user found, redirecting to login');
        window.location.href = 'login.html';
        return false;
    }

    try {
        const userDoc = await usersCol.doc(user).get();
        console.log('User doc exists:', userDoc.exists);
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            console.log('User data:', userData);
            console.log('User role:', userData.role);
            
            if (userData.role !== 'admin') {
                console.log('User is not admin');
                showError();
                return false;
            }
        } else {
            console.log('User document does not exist');
            showError();
            return false;
        }
        
        console.log('Admin auth successful');
        return true;
    } catch (error) {
        console.error('Error checking admin auth:', error);
        showError();
        return false;
    }
}

/**
 * Show error message for non-admin users
 */
function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content-form').style.display = 'none';
    document.getElementById('error').style.display = 'block';
}

/**
 * Load existing content from Firestore
 */
async function loadContent() {
    console.log('Loading content from Firestore...');
    try {
        const snapshot = await contentCol.get();
        console.log('Firestore query successful, documents found:', snapshot.size);
        
        currentContent = {};
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log('Document data:', doc.id, data);
            currentContent[data.type] = data;
        });
        
        console.log('Current content after loading:', currentContent);
        
        if (Object.keys(currentContent).length === 0) {
            console.log('No content found, using defaults');
            currentContent = getDefaultContent();
        }
        
        populateForm();
        updatePreview();
        
    } catch (error) {
        console.error('Error loading content:', error);
        currentContent = getDefaultContent();
        populateForm();
        updatePreview();
    }
}

/**
 * Default content structure - matches existing data model
 */
function getDefaultContent() {
    return {
        good: {
            type: 'good',
            title: "Standard Quality",
            description: "Quality 3-tab asphalt shingles with reliable protection. Perfect for budget-conscious homeowners who want dependable roofing.",
            image: "",
            warranty: "20-year manufacturer warranty with 5-year workmanship guarantee"
        },
        better: {
            type: 'better',
            title: "Premium Quality", 
            description: "Premium architectural shingles with enhanced durability and curb appeal. Superior wind resistance and longer lifespan.",
            image: "",
            warranty: "30-year manufacturer warranty with 10-year workmanship guarantee"
        },
        best: {
            type: 'best',
            title: "Elite Quality",
            description: "Top-tier designer shingles with lifetime warranty. Premium materials with enhanced insulation and comprehensive protection.",
            image: "",
            warranty: "Lifetime manufacturer warranty with 15-year workmanship guarantee"
        }
    };
}

/**
 * Populate form with current content
 */
function populateForm() {
    if (!currentContent) return;

    // Good option
    document.getElementById('good-title').value = currentContent.good?.title || '';
    document.getElementById('good-description').value = currentContent.good?.description || '';
    document.getElementById('good-warranty').value = currentContent.good?.warranty || '';
    document.getElementById('good-image').value = currentContent.good?.image || '';
    
    // Better option
    document.getElementById('better-title').value = currentContent.better?.title || '';
    document.getElementById('better-description').value = currentContent.better?.description || '';
    document.getElementById('better-warranty').value = currentContent.better?.warranty || '';
    document.getElementById('better-image').value = currentContent.better?.image || '';
    
    // Best option
    document.getElementById('best-title').value = currentContent.best?.title || '';
    document.getElementById('best-description').value = currentContent.best?.description || '';
    document.getElementById('best-warranty').value = currentContent.best?.warranty || '';
    document.getElementById('best-image').value = currentContent.best?.image || '';
}

/**
 * Update preview cards
 */
function updatePreview() {
    // Good option preview
    document.getElementById('preview-good-title').textContent = 
        document.getElementById('good-title').value || 'Good Option';
    document.getElementById('preview-good-description').textContent = 
        document.getElementById('good-description').value || 'Description...';
    document.getElementById('preview-good-warranty').textContent = 
        document.getElementById('good-warranty').value || 'Warranty...';
    
    // Better option preview
    document.getElementById('preview-better-title').textContent = 
        document.getElementById('better-title').value || 'Better Option';
    document.getElementById('preview-better-description').textContent = 
        document.getElementById('better-description').value || 'Description...';
    document.getElementById('preview-better-warranty').textContent = 
        document.getElementById('better-warranty').value || 'Warranty...';
    
    // Best option preview
    document.getElementById('preview-best-title').textContent = 
        document.getElementById('best-title').value || 'Best Option';
    document.getElementById('preview-best-description').textContent = 
        document.getElementById('best-description').value || 'Description...';
    document.getElementById('preview-best-warranty').textContent = 
        document.getElementById('best-warranty').value || 'Warranty...';
}

/**
 * Save content to Firestore - matches existing structure
 */
async function saveContent() {
    const saveBtn = document.querySelector('.save-btn');
    const status = document.getElementById('status');
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    status.style.display = 'none';

    try {
        const batch = firebase.firestore().batch();
        const currentUser = localStorage.getItem('loggedInUser');
        
        const options = [
            {
                type: 'good',
                title: document.getElementById('good-title').value.trim(),
                description: document.getElementById('good-description').value.trim(),
                warranty: document.getElementById('good-warranty').value.trim(),
                image: document.getElementById('good-image').value.trim()
            },
            {
                type: 'better',
                title: document.getElementById('better-title').value.trim(),
                description: document.getElementById('better-description').value.trim(),
                warranty: document.getElementById('better-warranty').value.trim(),
                image: document.getElementById('better-image').value.trim()
            },
            {
                type: 'best',
                title: document.getElementById('best-title').value.trim(),
                description: document.getElementById('best-description').value.trim(),
                warranty: document.getElementById('best-warranty').value.trim(),
                image: document.getElementById('best-image').value.trim()
            }
        ];

        // Validate required fields
        for (const option of options) {
            if (!option.title || !option.description || !option.warranty) {
                throw new Error(`All fields are required for ${option.type} option`);
            }
        }

        // Save each option as separate document
        options.forEach(option => {
            const docData = {
                ...option,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser
            };
            batch.set(contentCol.doc(option.type), docData);
        });

        await batch.commit();
        
        // Update local data
        currentContent = {};
        options.forEach(option => {
            currentContent[option.type] = option;
        });
        
        status.className = 'status success';
        status.textContent = 'Content saved successfully!';
        status.style.display = 'block';
        
        console.log('Content saved successfully');

    } catch (error) {
        console.error('Error saving content:', error);
        
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
 * Initialize the admin content page
 */
async function initAdminContent() {
    console.log('Initializing admin content page...');
    
    try {
        const isAdmin = await checkAdminAuth();
        console.log('Admin auth result:', isAdmin);
        
        if (!isAdmin) {
            console.log('Admin auth failed, exiting');
            return;
        }

        console.log('Loading content...');
        await loadContent();
        
        console.log('Setting up preview updates...');
        setupPreviewUpdates();
        
        console.log('Showing content form...');
        showContentForm();
        
    } catch (error) {
        console.error('Error initializing admin content:', error);
        showError();
    }
}

document.addEventListener('DOMContentLoaded', initAdminContent);
window.saveContent = saveContent;
