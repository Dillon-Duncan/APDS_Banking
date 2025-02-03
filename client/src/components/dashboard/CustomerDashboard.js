import React, { useState, useEffect, useCallback } from 'react';
import TransactionForm from './TransactionForm';
import { API_ENDPOINTS } from '../../config/api';

const CustomerDashboard = ({ user, token }) => {
  const [transactions, setTransactions] = useState([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.MY_TRANSACTIONS, {
        credentials: 'include'
      });
      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="customer-dashboard">
      <div className="user-info">
        <h2>Welcome, {user.first_name} {user.last_name}</h2>
        <p>Account Number: {user.account_number}</p>
      </div>

      <div className="actions">
        <button 
          onClick={() => setShowTransactionForm(!showTransactionForm)}
          className="action-button"
        >
          {showTransactionForm ? 'Cancel Transaction' : 'New Transaction'}
        </button>
      </div>

      {showTransactionForm && (
        <TransactionForm 
          onSuccess={() => {
            setShowTransactionForm(false);
            fetchTransactions();
          }}
        />
      )}

      <div className="transactions-list">
        <h3>Recent Transactions</h3>
        {transactions.map(transaction => (
          <div key={transaction._id} className="transaction-card">
            <div className="transaction-header">
              <span className={`status ${transaction.status}`}>
                {transaction.status.toUpperCase()}
              </span>
              <span className="date">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="transaction-details">
              <p>Amount: {transaction.amount} {transaction.currency}</p>
              <p>Provider: {transaction.provider}</p>
              <p>Swift Code: {transaction.swiftCode}</p>
              <p>Recipient: {transaction.recipientAccountInfo.accountName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;
