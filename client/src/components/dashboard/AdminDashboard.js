import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ user, token }) => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchPendingTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transaction/admin/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPendingTransactions(data);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    }
  };

  useEffect(() => {
    fetchPendingTransactions();
    const interval = setInterval(fetchPendingTransactions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [token]);

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
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="pending-transactions">
        <h3>Pending Transactions</h3>
        {pendingTransactions.map(transaction => (
          <div key={transaction._id} className="transaction-card">
            <div className="customer-info">
              <h4>Customer: {transaction.customer.first_name} {transaction.customer.last_name}</h4>
              <p>Account: {transaction.customer.account_number}</p>
            </div>
            <div className="transaction-details">
              <p>Amount: {transaction.amount} {transaction.currency}</p>
              <p>Provider: {transaction.provider}</p>
              <p>Swift Code: {transaction.swiftCode}</p>
              <p>Recipient: {transaction.recipientAccountInfo.accountName}</p>
              <p>Recipient Account: {transaction.recipientAccountInfo.accountNumber}</p>
              <p>Recipient Bank: {transaction.recipientAccountInfo.bankName}</p>
            </div>
            <div className="verification-actions">
              <textarea
                placeholder="Verification notes..."
                value={selectedTransaction?.verificationNotes || ''}
                onChange={(e) => setSelectedTransaction({
                  ...transaction,
                  verificationNotes: e.target.value
                })}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard; 