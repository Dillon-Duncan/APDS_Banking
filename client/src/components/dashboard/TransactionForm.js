import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';

const TransactionForm = ({ token, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'ZAR',
    provider: '',
    recipientAccountInfo: {
      accountName: '',
      accountNumber: '',
      bankName: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Transaction created:', data);
        onSuccess();
      } else {
        const error = await response.json();
        console.error('Transaction creation failed:', error);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          required
          min="0"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label>Provider</label>
        <select name="provider" value={formData.provider} onChange={handleInputChange} required>
          <option value="">Select Bank</option>
          <option value="ABSA Bank">ABSA Bank</option>
          <option value="Capitec Bank">Capitec Bank</option>
          <option value="First National Bank">First National Bank</option>
          <option value="Nedbank">Nedbank</option>
          <option value="Standard Bank">Standard Bank</option>
        </select>
      </div>

      <div className="form-group">
        <label>Recipient Name</label>
        <input
          type="text"
          name="recipientAccountInfo.accountName"
          value={formData.recipientAccountInfo.accountName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Recipient Account Number</label>
        <input
          type="text"
          name="recipientAccountInfo.accountNumber"
          value={formData.recipientAccountInfo.accountNumber}
          onChange={handleInputChange}
          required
          pattern="[0-9]{10,20}"
        />
      </div>

      <div className="form-group">
        <label>Recipient Bank</label>
        <input
          type="text"
          name="recipientAccountInfo.bankName"
          value={formData.recipientAccountInfo.bankName}
          onChange={handleInputChange}
          required
        />
      </div>

      <button type="submit" className="submit-button">Create Transaction</button>
    </form>
  );
};

export default TransactionForm;
