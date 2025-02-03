// File: src/components/dashboard/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/theme.css';


const AdminDashboard = ({ user, token }) => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [swiftValidationResults, setSwiftValidationResults] = useState({});
  const [validationError, setValidationError] = useState('');

  // Fetch all pending transactions from the backend
  const fetchPendingTransactions = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.ADMIN.PENDING, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingTransactions(data);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingTransactions();
    const interval = setInterval(fetchPendingTransactions, 30000);
    return () => clearInterval(interval);
  }, [token, fetchPendingTransactions]);

  // Handle approval/rejection of a transaction
  const handleVerification = async (transactionId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/transaction/admin/verify/${transactionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          verificationNotes: selectedTransaction?.verificationNotes || ''
        })
      });

      if (response.ok) {
        fetchPendingTransactions();
        setSelectedTransaction(null);
        // Clear any validation result for this transaction
        setSwiftValidationResults(prev => {
          const newResults = { ...prev };
          delete newResults[transactionId];
          return newResults;
        });
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
    }
  };

  // Handle SWIFT code validation by calling the admin endpoint
  const handleValidateSwift = async (transactionId, swiftCode) => {
    try {
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, '$1');
      
      const response = await fetch(API_ENDPOINTS.TRANSACTION.ADMIN.VALIDATE_SWIFT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-XSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ swiftCode: swiftCode.substring(0, 11) })
      });
      const result = await response.json();
      // Save the result (which includes a validity flag and message) for this transaction
      setSwiftValidationResults(prev => ({
        ...prev,
        [transactionId]: result
      }));
    } catch (error) {
      console.error('Error validating SWIFT code:', error);
      setSwiftValidationResults(prev => ({
        ...prev,
        [transactionId]: { valid: false, message: 'Validation failed' }
      }));
    }
  };

  return (
    <div className="centered-container">
      <h2 className="dashboard-heading">Admin Dashboard</h2>
      <div className="centered-content">
        <h3 className="section-heading">Pending Transactions</h3>
        <div className="pending-transactions">
          {pendingTransactions.map(transaction => (
            <div key={transaction._id} className="transaction-card centered-card">
              <div className="customer-info">
                <h4>
                  Customer: {transaction.customer.first_name} {transaction.customer.last_name}
                </h4>
                <p>Account: {transaction.customer.account_number}</p>
              </div>
              <div className="transaction-details">
                <p>Amount: {transaction.amount} {transaction.currency}</p>
                <p>Provider: {transaction.provider}</p>
                <p>
                  SWIFT Code: {transaction.swiftCode}{' '}
                  <button
                    onClick={() => handleValidateSwift(transaction._id, transaction.swiftCode)}
                    className="action-button"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      marginLeft: '10px'
                    }}
                  >
                    Validate SWIFT
                  </button>
                </p>
                {swiftValidationResults[transaction._id] && (
                  <p style={{ color: swiftValidationResults[transaction._id].valid ? 'green' : 'red' }}>
                    {swiftValidationResults[transaction._id].message}
                  </p>
                )}
                <p>Recipient: {transaction.recipientAccountInfo.accountName}</p>
                <p>Recipient Account: {transaction.recipientAccountInfo.accountNumber}</p>
                <p>Recipient Bank: {transaction.recipientAccountInfo.bankName}</p>
              </div>
              <div className="verification-actions">
                <textarea
                  placeholder="Verification notes..."
                  value={selectedTransaction?.verificationNotes || ''}
                  onChange={(e) => {
                    if(e.target.value.length <= 200) {
                      setSelectedTransaction({
                        ...transaction,
                        verificationNotes: e.target.value
                      })
                    }
                  }}
                  onKeyPress={(e) => {
                    if(!/[a-zA-Z0-9\s.,!?@()-]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={validationError ? 'input-error' : ''}
                />
                {validationError && <div className="error-message">{validationError}</div>}
                <div className="buttons">
                  <button
                    onClick={() => handleVerification(transaction._id, 'completed')}
                    className="approve-button"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerification(transaction._id, 'rejected')}
                    className="reject-button"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
