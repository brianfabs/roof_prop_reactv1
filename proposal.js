const proposalsCol = firebase.firestore().collection('proposals');
const optionsCol = firebase.firestore().collection('roofing_options');
const loanOptionsCol = firebase.firestore().collection('loan_options');
const contentCol = firebase.firestore().collection('roofing_options');

// Fallback pricing if options don't have pricing data
const FALLBACK_PRICING = {
    good: 625,
    better: 770,
    best: 850
};

/**
 * Calculate monthly payment for loan
 */
function calculateMonthlyPayment(principal, annualRate, years) {
    if (annualRate === 0) return principal / (years * 12);
    
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
}

/**
 * Get proposal ID from URL parameters
 */
function getProposalId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Check authentication
 */
function checkAuth() {
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Display error message
 */
function displayError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<h3>Error</h3><p>${message}</p>`;
    errorContainer.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}

/**
 * Load proposal data from Firestore
 */
async function loadProposal(proposalId) {
    try {
        console.log('Loading proposal with ID:', proposalId);
        const proposalDoc = await proposalsCol.doc(proposalId).get();
        
        if (!proposalDoc.exists) {
            throw new Error('Proposal not found');
        }
        
        const proposalData = proposalDoc.data();
        console.log('Proposal data loaded:', proposalData);
        return proposalData;
    } catch (error) {
        console.error('Error loading proposal:', error);
        throw error;
    }
}

/**
 * Load and display roofing options
 */
async function loadRoofingOptions() {
    try {
        const [goodDoc, betterDoc, bestDoc] = await Promise.all([
            contentCol.doc('good').get(),
            contentCol.doc('better').get(),
            contentCol.doc('best').get()
        ]);

        // Helper function to create option card
        function createOptionCard(data, id) {
            const card = document.createElement('div');
            card.className = 'option-card';
            card.id = id;
            
            const featuresList = data.features ? data.features.map(feature => 
                `<li>${feature}</li>`
            ).join('') : '';

            card.innerHTML = `
                <div class="option-header">
                    <h3>${data.tier || ''}</h3>
                    <h4>${data.title || ''}</h4>
                </div>
                <div class="option-content">
                    <div class="option-image">
                        <img src="${data.image || ''}" alt="${data.title || ''}">
                    </div>
                    <div class="option-details">
                        <p class="description">${data.description || ''}</p>
                        <ul class="features">
                            ${featuresList}
                        </ul>
                        <p class="warranty">Warranty: ${data.warranty || ''}</p>
                        <p class="price">$${data.pricePerSquare || 0} per square</p>
                    </div>
                </div>
            `;
            
            return card;
        }

        // Create and append cards
        const optionsContainer = document.getElementById('roofing-options');
        optionsContainer.innerHTML = ''; // Clear existing content

        if (goodDoc.exists) {
            optionsContainer.appendChild(createOptionCard(goodDoc.data(), 'good-option'));
        }
        if (betterDoc.exists) {
            optionsContainer.appendChild(createOptionCard(betterDoc.data(), 'better-option'));
        }
        if (bestDoc.exists) {
            optionsContainer.appendChild(createOptionCard(bestDoc.data(), 'best-option'));
        }

    } catch (error) {
        console.error('Error loading roofing options:', error);
        showError('Failed to load roofing options. Please try again later.');
    }
}

/**
 * Load loan options from Firestore
 */
async function loadLoanOptions() {
    try {
        console.log('Loading loan options...');
        const snapshot = await loanOptionsCol.get();
        
        const loanOptions = [];
        snapshot.forEach(doc => {
            loanOptions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by loan term
        loanOptions.sort((a, b) => a.years - b.years);
        
        console.log('Loan options loaded:', loanOptions);
        return loanOptions;
    } catch (error) {
        console.error('Error loading loan options:', error);
        return []; // Return empty array if no loan options
    }
}

/**
 * Create missing roofing options
 */
async function createMissingOptions(existingOptions) {
    const defaultOptions = {
        good: {
            type: 'good',
            title: 'Standard Quality',
            description: 'Reliable and affordable roofing solution with quality materials that provide excellent protection for your home.',
            warranty: '10-year manufacturer warranty on materials, 2-year workmanship warranty',
            image: 'https://via.placeholder.com/400x200/28a745/ffffff?text=Standard+Quality+Roofing',
            pricePerSquare: 625.00
        },
        better: {
            type: 'better',
            title: 'Premium Quality',
            description: 'Enhanced roofing system with superior materials and advanced installation techniques for long-lasting durability.',
            warranty: '20-year manufacturer warranty on materials, 5-year workmanship warranty',
            image: 'https://via.placeholder.com/400x200/ffc107/000000?text=Premium+Quality+Roofing',
            pricePerSquare: 770.00
        },
        best: {
            type: 'best',
            title: 'Elite Quality',
            description: 'Top-of-the-line roofing system with premium materials, cutting-edge technology, and expert craftsmanship.',
            warranty: '30-year manufacturer warranty on materials, 10-year workmanship warranty',
            image: 'https://via.placeholder.com/400x200/dc3545/ffffff?text=Elite+Quality+Roofing',
            pricePerSquare: 850.00
        }
    };
    
    const batch = firebase.firestore().batch();
    
    ['good', 'better', 'best'].forEach(type => {
        if (!existingOptions[type]) {
            const docRef = optionsCol.doc(type);
            batch.set(docRef, defaultOptions[type]);
            console.log(`Creating missing ${type} option`);
        }
    });
    
    await batch.commit();
    console.log('Missing roofing options created');
}

/**
 * Create default roofing options if none exist
 */
async function createDefaultOptions() {
    return await createMissingOptions({});
}

/**
 * Display customer information
 */
function displayCustomerInfo(proposal) {
    const customerInfoDiv = document.getElementById('customer-info');
    const createdDate = proposal.createdAt && proposal.createdAt.toDate ? 
        proposal.createdAt.toDate().toLocaleDateString() : 'Today';
    
    customerInfoDiv.innerHTML = `
        <h3>Customer Information</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: var(--spacing-md);">
            <div>
                <p><strong>Customer:</strong> ${proposal.customerName || 'Unknown'}</p>
                <p><strong>Address:</strong> ${proposal.address || 'No address provided'}</p>
            </div>
            <div>
                <p><strong>Total Squares:</strong> ${proposal.squares || 0}</p>
                <p><strong>Proposal Date:</strong> ${createdDate}</p>
                <div style="margin-top: var(--spacing-md);">
                    <a href="edit_proposal.html?id=${getProposalId()}" class="btn btn-secondary btn-sm">Edit Proposal</a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate loan options dropdown
 */
function generateLoanDropdown(loanOptions, totalPrice, optionType) {
    if (!loanOptions || loanOptions.length === 0) {
        return '<p style="font-size: var(--font-size-sm); color: #666; margin-top: var(--spacing-sm);">No financing options available</p>';
    }
    
    const principal = parseFloat(totalPrice.replace(/[$,]/g, ''));
    
    let dropdownHTML = `
        <div style="margin-top: var(--spacing-md);">
            <h6 style="margin-bottom: var(--spacing-sm); color: #666;">Financing Options:</h6>
            <select id="loan-select-${optionType}" style="width: 100%; padding: var(--spacing-sm); border: 1px solid #ddd; border-radius: var(--radius);" onchange="updateLoanDisplay('${optionType}', ${principal})">
                <option value="">Select financing option...</option>
    `;
    
    loanOptions.forEach((loan, index) => {
        const monthlyPayment = calculateMonthlyPayment(principal, loan.rate, loan.years);
        const formattedPayment = monthlyPayment.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
        
        dropdownHTML += `
            <option value="${index}" data-payment="${monthlyPayment}" data-years="${loan.years}" data-rate="${loan.rate}">
                ${loan.name} - ${formattedPayment}/month (${loan.years} years at ${loan.rate}% APR)
            </option>
        `;
    });
    
    dropdownHTML += `
            </select>
            <div id="loan-details-${optionType}" style="margin-top: var(--spacing-sm); padding: var(--spacing-sm); background: #f8f9fa; border-radius: var(--radius); display: none;">
                <!-- Loan details will be displayed here -->
            </div>
        </div>
    `;
    
    return dropdownHTML;
}

/**
 * Update loan display when option is selected
 */
function updateLoanDisplay(optionType, principal) {
    const select = document.getElementById(`loan-select-${optionType}`);
    const detailsDiv = document.getElementById(`loan-details-${optionType}`);
    
    if (select.value === '') {
        detailsDiv.style.display = 'none';
        return;
    }
    
    const selectedOption = select.options[select.selectedIndex];
    const monthlyPayment = parseFloat(selectedOption.getAttribute('data-payment'));
    const years = parseInt(selectedOption.getAttribute('data-years'));
    const rate = parseFloat(selectedOption.getAttribute('data-rate'));
    
    const totalPaid = monthlyPayment * years * 12;
    const totalInterest = totalPaid - principal;
    
    detailsDiv.innerHTML = `
        <div style="font-size: var(--font-size-sm);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-sm);">
                <div><strong>Monthly Payment:</strong> ${monthlyPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                <div><strong>Total Interest:</strong> ${totalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                <div><strong>Total Paid:</strong> ${totalPaid.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                <div><strong>Term:</strong> ${years} years at ${rate}% APR</div>
            </div>
        </div>
    `;
    detailsDiv.style.display = 'block';
}

/**
 * Display roofing options
 */
function displayOptions(options, loanOptions, squares) {
    const optionsContainer = document.getElementById('options-container');
    
    const optionTypes = ['good', 'better', 'best'];
    let optionsHTML = '';
    
    optionTypes.forEach(type => {
        const option = options[type];
        if (!option) {
            console.log(`Missing ${type} option`);
            return;
        }
        
        const pricePerSquare = option.pricePerSquare || FALLBACK_PRICING[type];
        const totalPrice = (pricePerSquare * squares).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
        
        const pricePerSquareFormatted = pricePerSquare.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
        
        const colorMap = {
            good: 'var(--color-success)',
            better: 'var(--color-secondary)',
            best: 'var(--color-danger)'
        };
        
        const textColorMap = {
            good: 'var(--color-text-light)',
            better: 'var(--color-text)',
            best: 'var(--color-text-light)'
        };
        
        optionsHTML += `
            <div class="card option-card ${type}" style="margin-bottom: var(--spacing-lg);">
                <div class="card-header" style="background: ${colorMap[type]}; color: ${textColorMap[type]}; text-align: center; padding: var(--spacing-lg);">
                    <h4 style="margin: 0; text-transform: uppercase;">${type}</h4>
                </div>
                <div class="card-content">
                    <img src="${option.image || 'https://via.placeholder.com/400x200/6c757d/ffffff?text=Image+Not+Available'}" 
                         alt="${option.title}" 
                         class="option-image" 
                         style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius); margin-bottom: var(--spacing-md);" 
                         onerror="this.src='https://via.placeholder.com/400x200/6c757d/ffffff?text=Image+Not+Available'">
                    <h5>${option.title}</h5>
                    <p class="option-description">${option.description}</p>
                    
                    <div class="warranty-section" style="background: var(--color-bg-alt); padding: var(--spacing-md); border-radius: var(--radius); margin: var(--spacing-md) 0;">
                        <div style="font-weight: 600; margin-bottom: var(--spacing-xs);">Warranty Information:</div>
                        <div>${option.warranty}</div>
                    </div>
                    
                    <div class="price-section" style="background: ${colorMap[type]}; color: ${textColorMap[type]}; padding: var(--spacing-lg); text-align: center; border-radius: var(--radius);">
                        <div style="font-size: 2rem; font-weight: 700;">${totalPrice}</div>
                        <div class="price-breakdown" style="font-size: var(--font-size-sm); margin-top: var(--spacing-sm); opacity: 0.9;">
                            ${pricePerSquareFormatted} per square × ${squares} squares
                        </div>
                        <div style="font-size: var(--font-size-sm); margin-top: var(--spacing-xs); opacity: 0.8;">
                            Cash Price
                        </div>
                    </div>
                    
                    ${generateLoanDropdown(loanOptions, totalPrice, type)}
                </div>
            </div>
        `;
    });
    
    optionsContainer.innerHTML = optionsHTML;
    optionsContainer.style.display = 'block';
}

/**
 * Initialize the proposal page
 */
async function initializeProposal() {
    console.log('Initializing proposal page...');
    
    if (!checkAuth()) {
        console.log('Authentication failed');
        return;
    }
    
    const proposalId = getProposalId();
    console.log('Proposal ID from URL:', proposalId);
    
    if (!proposalId) {
        displayError('No proposal ID provided in URL. Please ensure you accessed this page from a valid proposal link.');
        return;
    }
    
    try {
        console.log('Loading proposal, options, and loan options...');
        
        const [proposal, options, loanOptions] = await Promise.all([
            loadProposal(proposalId),
            loadRoofingOptions(),
            loadLoanOptions()
        ]);
        
        console.log('Proposal loaded:', proposal);
        console.log('Options loaded:', options);
        console.log('Loan options loaded:', loanOptions);
        
        if (!proposal.squares || proposal.squares <= 0) {
            throw new Error('Invalid proposal data: squares must be greater than 0');
        }
        
        displayCustomerInfo(proposal);
        displayOptions(options, loanOptions, proposal.squares);
        
        document.getElementById('loading').style.display = 'none';
        
        console.log('Proposal page initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize proposal:', error);
        displayError(`Failed to load proposal: ${error.message}`);
    }
}

// Make updateLoanDisplay available globally
window.updateLoanDisplay = updateLoanDisplay;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing proposal...');
    initializeProposal();
});