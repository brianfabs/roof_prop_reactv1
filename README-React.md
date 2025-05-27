# Roofing Proposal React App

A modern React.js application for creating, managing, and presenting professional roofing proposals. This is a complete conversion of the original vanilla JavaScript application to React with improved architecture, state management, and user experience.

## Features

### Core Functionality
- **Modern React Architecture**: Built with React 18, React Router, and Context API
- **Firebase Integration**: Real-time data with Firestore using Firebase v9 SDK
- **User Authentication**: Secure login system with role-based access control
- **Proposal Management**: Create, edit, view, and manage customer proposals
- **3-Tier Pricing**: Good/Better/Best roofing options with dynamic pricing
- **Loan Integration**: Integrated financing options with payment calculations
- **Responsive Design**: Mobile-friendly interface with modern CSS

### Technical Features
- **Component-Based Architecture**: Reusable React components
- **Custom Hooks**: Efficient data fetching and state management
- **Protected Routes**: Authentication and authorization guards
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Smooth user experience with loading indicators
- **Form Validation**: Client-side validation with user-friendly messages

## Technology Stack

- **Frontend**: React 18, React Router v6
- **State Management**: React Context API with custom hooks
- **Backend**: Firebase Firestore (NoSQL database)
- **Authentication**: Custom authentication with localStorage
- **Styling**: Custom CSS with CSS variables and modern design system
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/           # React components
│   ├── Login.js         # Authentication component
│   ├── Dashboard.js     # Proposal management dashboard
│   ├── CreateProposal.js # New proposal creation
│   ├── EditProposal.js  # Proposal editing
│   ├── ProposalView.js  # Customer-facing proposal display
│   ├── Navigation.js    # Navigation component
│   ├── ProtectedRoute.js # Route protection
│   └── LoadingSpinner.js # Loading indicator
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication context
├── hooks/               # Custom React hooks
│   └── useFirestore.js  # Firebase data management hooks
├── utils/               # Utility functions
│   └── calculations.js  # Pricing and loan calculations
├── config/              # Configuration files
│   └── firebase.js      # Firebase configuration
├── App.js               # Main application component
├── index.js             # Application entry point
└── index.css            # Global styles
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### Installation Steps

1. **Install Node.js** (if not already installed):
   ```bash
   # Using Homebrew on macOS
   brew install node
   
   # Or download from https://nodejs.org/
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Update `src/config/firebase.js` with your Firebase project credentials
   - Ensure Firestore is enabled in your Firebase console

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Firebase Configuration

Update the Firebase configuration in `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Data Structure

The application uses the following Firestore collections:

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

### Roofing Options Collection
```javascript
{
  type: "good" | "better" | "best",
  title: "Option Title",
  description: "Detailed description",
  warranty: "Warranty information",
  image: "Image URL",
  pricePerSquare: 625.00,
  pricePerSquareUnder16: 725.00
}
```

### Loan Options Collection
```javascript
{
  name: "Financing Option Name",
  years: 15,
  rate: 6.99
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

## Key Features

### Dynamic Pricing System
- **Standard Rate**: Projects ≥16 squares use `pricePerSquare`
- **Small Job Rate**: Projects <16 squares use `pricePerSquareUnder16`
- **Real-time Calculations**: Automatic price updates based on project size

### Loan Calculations
Monthly payment calculation using standard amortization formula:
```
M = P[r(1+r)^n]/[(1+r)^n-1]
```

### Authentication & Authorization
- Simple email/password authentication
- Role-based access control (user/admin)
- Protected routes for authenticated users
- Persistent login state with localStorage

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Component Architecture

### Custom Hooks
- **useProposals()**: Manages proposal CRUD operations
- **useProposal(id)**: Fetches individual proposal data
- **useRoofingOptions()**: Manages roofing options data
- **useLoanOptions()**: Manages loan options data

### Context Providers
- **AuthProvider**: Manages authentication state and user data
- Provides login, logout, and user role checking functions

### Protected Routes
- Automatic redirection to login for unauthenticated users
- Admin-only routes for administrative functions
- Seamless navigation between authenticated pages

## Styling and Design

The application uses a modern design system with:
- CSS custom properties (variables) for consistent theming
- Responsive grid layouts
- Professional color palette
- Smooth transitions and hover effects
- Mobile-first responsive design

## Performance Optimizations

- **Code Splitting**: Automatic code splitting with React Router
- **Efficient Re-renders**: Optimized with React hooks and context
- **Firebase Optimization**: Efficient Firestore queries with proper indexing
- **Image Optimization**: Responsive images with proper sizing

## Security Considerations

- Input validation on all forms
- Protected routes with authentication checks
- Role-based access control for admin features
- Secure Firebase rules (to be configured)

## Future Enhancements

Potential improvements for the application:
- Firebase Authentication integration
- Real-time collaboration features
- PDF proposal generation
- Email integration for proposal sharing
- Advanced reporting and analytics
- Multi-tenant support
- Offline functionality with service workers

## Deployment

The application can be deployed to various platforms:

### Netlify/Vercel
```bash
npm run build
# Deploy the build folder
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions about the application, please contact the development team or create an issue in the repository.