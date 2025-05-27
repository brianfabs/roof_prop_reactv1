import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProposal, useRoofingOptions, useLoanOptions } from '../hooks/useFirestore';
import { calculateTotalPrice, calculateMonthlyPayment, formatCurrency, formatCurrencyWithCents } from '../utils/calculations';
import LoadingSpinner from './LoadingSpinner';

function ProposalView() {
  const { id } = useParams();
  const { proposal, loading: proposalLoading, error: proposalError } = useProposal(id);
  const { options, loading: optionsLoading } = useRoofingOptions();
  const { loanOptions, loading: loanLoading } = useLoanOptions();
  
  const [selectedLoanOptions, setSelectedLoanOptions] = useState({
    good: '',
    better: '',
    best: ''
  });

  const loading = proposalLoading || optionsLoading || loanLoading;

  const handleLoanChange = (optionType, loanOptionId) => {
    setSelectedLoanOptions(prev => ({
      ...prev,
      [optionType]: loanOptionId
    }));
  };

  const renderLoanDropdown = (optionType, totalPrice) => {
    if (!loanOptions.length) return null;

    const selectedLoanId = selectedLoanOptions[optionType];
    const selectedLoan = loanOptions.find(loan => loan.id === selectedLoanId);

    return (
      <div className="loan-section">
        <h4>Financing Options</h4>
        <select
          value={selectedLoanId}
          onChange={(e) => handleLoanChange(optionType, e.target.value)}
          className="loan-select"
        >
          <option value="">Select financing option</option>
          {loanOptions.map(loan => (
            <option key={loan.id} value={loan.id}>
              {loan.name} - {loan.years} years at {loan.rate}%
            </option>
          ))}
        </select>
        
        {selectedLoan && (
          <div className="loan-details">
            <div className="monthly-payment">
              <strong>Monthly Payment: {formatCurrencyWithCents(calculateMonthlyPayment(totalPrice, selectedLoan.rate, selectedLoan.years))}</strong>
            </div>
            <div className="loan-info">
              <p>Loan Amount: {formatCurrency(totalPrice)}</p>
              <p>Term: {selectedLoan.years} years</p>
              <p>Interest Rate: {selectedLoan.rate}%</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOption = (optionType, option) => {
    if (!option || !proposal) return null;

    const totalPrice = calculateTotalPrice(option, proposal.squares);
    const pricePerSquare = proposal.squares < 16 && option.pricePerSquareUnder16 
      ? option.pricePerSquareUnder16 
      : option.pricePerSquare;

    return (
      <div key={optionType} className={`option-card option-${optionType}`}>
        <div className="option-header">
          <h3>{option.title}</h3>
          <div className="option-price">
            <span className="total-price">{formatCurrency(totalPrice)}</span>
            <span className="price-per-square">
              {formatCurrency(pricePerSquare)} per square
            </span>
          </div>
        </div>
        
        <div className="option-content">
          {option.image ? (
            <img src={option.image} alt={`${option.title} roofing option`} className="option-image" onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }} />
          ) : (
            <img src="https://via.placeholder.com/400x200?text=No+Image" alt="Placeholder for missing roofing option" className="option-image" />
          )}
          
          <div className="option-details">
            <p className="option-description">{option.description}</p>
            
            {option.warranty && (
              <div className="warranty-info">
                <h4>Warranty</h4>
                <p>{option.warranty}</p>
              </div>
            )}
          </div>
        </div>
        
        {renderLoanDropdown(optionType, totalPrice)}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading your personalized proposal..." />;
  }

  if (proposalError) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{proposalError}</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="error-container">
        <h3>Proposal Not Found</h3>
        <p>The requested proposal could not be found.</p>
      </div>
    );
  }

  const createdDate = proposal.createdAt && proposal.createdAt.toDate 
    ? proposal.createdAt.toDate().toLocaleDateString() 
    : 'Today';

  return (
    <div className="proposal-view">
      {/* Premium Header Section */}
      <div className="proposal-header">
        <img src="https://getglobalroofing.com/wp-content/uploads/2025/05/Logo512.png" alt="Global Roofing" className="company-logo" />
        <h1 className="proposal-title">Your Roofing Investment Proposal</h1>
        <p className="proposal-subtitle">Professional roofing solutions tailored for your home</p>
        
        <div className="trust-indicators">
          <div className="trust-badge">
            <svg className="trust-badge-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Licensed & Insured
          </div>
          <div className="trust-badge">
            <svg className="trust-badge-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            A+ BBB Rating
          </div>
          <div className="trust-badge">
            <svg className="trust-badge-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            25+ Years Experience
          </div>
        </div>
      </div>

      {/* Customer Information Section */}
      <div className="proposal-section" id="customer-info-section">
        <div className="section-header">
          <h3 className="section-title">Project Overview</h3>
          <p className="section-subtitle">Your personalized roofing solution details</p>
        </div>
        <div className="customer-info-grid">
          <div className="info-card">
            <div className="info-card-header">
              <svg className="info-card-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <h4 className="info-card-title">Customer Details</h4>
            </div>
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{proposal.customerName || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Property Address:</span>
              <span className="info-value">{proposal.address || 'No address provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Roof Size:</span>
              <span className="info-value">{proposal.squares || 0} squares</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-header">
              <svg className="info-card-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <h4 className="info-card-title">Project Timeline</h4>
            </div>
            <div className="info-item">
              <span className="info-label">Proposal Date:</span>
              <span className="info-value">{createdDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Estimated Start:</span>
              <span className="info-value">Within 2-3 weeks</span>
            </div>
            <div className="info-item">
              <span className="info-label">Project Duration:</span>
              <span className="info-value">1-3 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roofing Options Section */}
      <div className="proposal-section">
        <div className="section-header">
          <h3 className="section-title">Your Roofing Options</h3>
          <p className="section-subtitle">Choose the perfect solution for your home and budget</p>
        </div>
        <div className="options-grid">
          {options.good && renderOption('good', options.good)}
          {options.better && renderOption('better', options.better)}
          {options.best && renderOption('best', options.best)}
        </div>
      </div>

      <div className="proposal-footer">
        <p>This proposal is valid for 30 days from the date of creation.</p>
        <p>All prices include materials and labor. Additional charges may apply for permits and disposal.</p>
      </div>
    </div>
  );
}

export default ProposalView; 