import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/theme.css';
import DOMPurify from 'dompurify';

const AdminDashboard = ({ user, token }) => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [swiftValidationResults, setSwiftValidationResults] = useState({});

  const fetchPendingTransactions = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.ADMIN.PENDING, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
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

  const handleValidateSwift = async (transactionId, swiftCode) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.TRANSACTION.ADMIN.VALIDATE_SWIFT}/${transactionId}`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ swiftCode })
      });
      const result = await response.json();
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
                <h4>Customer: {transaction.customer.first_name} {transaction.customer.last_name}</h4>
                <p>Account: {transaction.customer.account_number}</p>
              </div>
              <div className="transaction-details">
                <p>Amount: {transaction.amount} {transaction.currency}</p>
                <p>Provider: {transaction.provider}</p>
                <p>SWIFT Code: {transaction.swiftCode} 
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
                {transaction.recipientAccountInfo.accountName && (
                  <p>Recipient: {DOMPurify.sanitize(transaction.recipientAccountInfo.accountName)}</p>
                )}
                {transaction.recipientAccountInfo.accountNumber && (
                  <p>Recipient Account: {DOMPurify.sanitize(transaction.recipientAccountInfo.accountNumber)}</p>
                )}
                {transaction.recipientAccountInfo.bankName && (
                  <p>Recipient Bank: {DOMPurify.sanitize(transaction.recipientAccountInfo.bankName)}</p>
                )}
              </div>
              <div className="verification-actions">
                <textarea
                  placeholder="Verification notes..."
                  value={selectedTransaction?.verificationNotes || ''}
                  onChange={(e) => {
                    const sanitizedValue = DOMPurify.sanitize(e.target.value.substring(0, 200));
                    setSelectedTransaction({
                      ...transaction,
                      verificationNotes: sanitizedValue
                    })
                  }}
                  onKeyPress={(e) => {
                    if(!/[a-zA-Z0-9\s.,!?@()-]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
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
              {transaction.verificationNotes && (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(transaction.verificationNotes) 
                  }} 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
