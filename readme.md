# Roofing Proposal App
Primary repository for professional roofing proposal application

## Overview
A comprehensive web-based sales proposal application for roofing companies to create, manage, and present professional pricing proposals to customers. The application serves both internal sales teams and provides customer-facing proposal views with integrated financing options.

## Features

### Core Functionality
- **User Authentication**: Simple localStorage-based authentication system
- **Proposal Management**: Create, edit, view, and manage customer proposals
- **3-Tier Pricing**: Good/Better/Best roofing options with configurable pricing
- **Loan Integration**: Integrated financing options with payment calculations
- **Admin Controls**: Content management and user administration
- **Responsive Design**: Mobile-friendly interface using modern CSS

### Pricing System
- **Dynamic Pricing**: Different rates for projects above/below 16 squares
- **Automatic Calculations**: Real-time price calculations based on project size
- **Financing Options**: Up to 3 configurable loan options with monthly payment calculations
- **Professional Display**: Customer-facing proposals with clean pricing presentation

### Admin Features
- **Content Management**: Manage roofing option details, pricing, and descriptions
- **Loan Options**: Configure financing terms, interest rates, and payment calculations
- **User Management**: Create and manage user accounts with role-based access
- **Debug Tools**: Toggle-able debug panel for troubleshooting
- **Live Preview**: Real-time preview of changes in admin interfaces

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Firestore (NoSQL database)
- **Authentication**: localStorage-based user sessions
- **Styling**: Custom CSS framework with professional design system
- **Deployment**: Static web hosting compatible

## Data Structure

### Enhanced Roofing Options Collection
```javascript
{
  type: "good" | "better" | "best",
  title: "Option Title",
  description: "Detailed description",
  warranty: "Warranty information",
  image: "Image URL",
  pricePerSquare: 625.00,        // Standard pricing (≥16 squares)
  pricePerSquareUnder16: 725.00  // Higher pricing (<16 squares)
}
```

### Proposals Collection
```javascript
{
  customerName: "Customer Name",
  address: "Property Address", 
  squares: 25.5,
  createdBy: "user@company.com",
  createdAt: timestamp,
  updatedAt: timestamp,
  updatedBy: "user@company.com"
}
```

### Loan Options Collection
```javascript
{
  name: "Financing Option Name",
  years: 15,    // Term length in years
  rate: 6.99    // Annual percentage rate
}
```

### Users Collection
```javascript
{
  email: "user@company.com",
  fullName: "User Name",
  password: "plaintext",
  role: "user" | "admin"
}
```

## Application Structure

### Customer-Facing Pages
- `proposal.html` - Professional proposal display with pricing and financing options

### Internal Management
- `dashboard.html` - Proposal listing with edit/view controls
- `create_proposal.html` - New proposal creation
- `edit_proposal.html` - Proposal modification
- `login.html` - User authentication

### Admin Interface
- `admin.html` - Roofing options content management
- `loan_admin.html` - Financing options configuration  
- `user-management.html` - User account administration

### Shared Components
- `main.css` - Professional design system and styling
- `firebase-config.js` - Database configuration
- Navigation component - Reusable navigation bar for internal pages

## Pricing Logic
The application implements dynamic pricing based on project size:
- **Standard Rate**: Projects ≥16 squares use `pricePerSquare`
- **Small Job Rate**: Projects <16 squares use `pricePerSquareUnder16` (higher rate)
- **Automatic Selection**: System automatically applies correct pricing tier

## Loan Calculations
Monthly payment calculation using standard amortization formula:
```
M = P[r(1+r)^n]/[(1+r)^n-1]
```
Where:
- M = Monthly payment
- P = Principal amount
- r = Monthly interest rate
- n = Total number of payments

## Firebase Configuration

The app requires a `firebase-config.js` file with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN", 
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
```

## File Structure
```
├── login.html / login.js           # Authentication
├── dashboard.html / dashboard.js   # Proposal management
├── create_proposal.html / create_proposal.js # Proposal creation
├── edit_proposal.html             # Proposal editing
├── proposal.html                  # Customer-facing proposal view
├── admin.html / admin.js          # Content management
├── loan_admin.html               # Loan options management
├── user-management.html / user-management.js # User administration
├── main.css                      # Design system
├── firebase-config.js            # Firebase configuration
└── README.md                     # Documentation
```

## Recent Updates

### Version 2.0 Features
- **Enhanced Pricing**: Added support for small job pricing (<16 squares)
- **Loan Integration**: Complete financing options with payment calculations
- **Navigation Standardization**: Reusable navigation component across pages
- **Admin Enhancements**: Loan options management and debug tools
- **Improved UX**: Streamlined customer-facing proposal display

### Security Considerations
- Simple authentication system (development/demo purposes)
- Admin role validation for content management
- Client-side form validation with server-side constraints
- Error handling and user feedback systems

## Development Status
Work in progress - Core features implemented with ongoing enhancements for production readiness.