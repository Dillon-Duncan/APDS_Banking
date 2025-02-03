import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { 
  NAME_REGEX, 
  ACCOUNT_REGEX, 
  AMOUNT_REGEX,
  SWIFT_REGEX,
  validateInput 
} from '../../utils/validations';

const TransactionForm = ({ token, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'ZAR',
    provider: '',
    swiftCode: '',
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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let isValid = true;
    
    switch(name) {
      case 'recipientAccountInfo.accountName':
        isValid = validateInput(value, NAME_REGEX);
        break;
      case 'recipientAccountInfo.accountNumber':
        isValid = validateInput(value, ACCOUNT_REGEX);
        break;
      case 'swiftCode':
        isValid = validateInput(value, SWIFT_REGEX);
        break;
      case 'amount':
        isValid = validateInput(value, AMOUNT_REGEX);
        break;
      default:
        throw new Error(`Unhandled transaction type: ${name}`);
    }
    
    setFormData({
      ...formData,
      [`${name}Touched`]: true,
      [`${name}Error`]: isValid ? '' : 'Invalid format'
    });
  };

  return (
    <div className="centered-container">
      <form onSubmit={handleSubmit} className="transaction-form centered-content">
        <h2 className="dashboard-heading">New Transaction</h2>
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            onKeyPress={(e) => !/[0-9.]/.test(e.key) && e.preventDefault()}
            onBlur={handleBlur}
            min="0"
            step="0.01"
            required
          />
          {formData.amountTouched && formData.amountError && (
            <p className="error">{formData.amountError}</p>
          )}
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
          <label>SWIFT Code</label>
          <input
            type="text"
            name="swiftCode"
            value={formData.swiftCode}
            onChange={handleInputChange}
            onKeyPress={(e) => !/[A-Z0-9]/.test(e.key) && e.preventDefault()}
            onBlur={handleBlur}
            maxLength="11"
            pattern="^[A-Z0-9]{8,11}$"
          />
          {formData.swiftCodeTouched && formData.swiftCodeError && (
            <p className="error">{formData.swiftCodeError}</p>
          )}
        </div>

        <div className="form-group">
          <label>Recipient Name</label>
          <input
            type="text"
            name="recipientAccountInfo.accountName"
            value={formData.recipientAccountInfo.accountName}
            onChange={handleInputChange}
            required
            onBlur={handleBlur}
          />
          {formData.recipientAccountInfoTouched && formData.recipientAccountInfoError && (
            <p className="error">{formData.recipientAccountInfoError}</p>
          )}
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
            onBlur={handleBlur}
          />
          {formData.recipientAccountInfoTouched && formData.recipientAccountInfoError && (
            <p className="error">{formData.recipientAccountInfoError}</p>
          )}
        </div>

        <div className="form-group">
          <label>Recipient Bank</label>
          <select
            name="recipientAccountInfo.bankName"
            value={formData.recipientAccountInfo.bankName}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Bank</option>
            <option value="ABSA Bank">ABSA Bank</option>
            <option value="Capitec Bank">Capitec Bank</option>
            <option value="First National Bank">First National Bank</option>
            <option value="Nedbank">Nedbank</option>
            <option value="Standard Bank">Standard Bank</option>
            <option value="African Bank">African Bank</option>
            <option value="Investec Bank">Investec Bank</option>
            <option value="TymeBank">TymeBank</option>
            <option value="Discovery Bank">Discovery Bank</option>
            <option value="Bank Zero">Bank Zero</option>
          </select>
        </div>

        <button type="submit" className="submit-button">Create Transaction</button>
      </form>
    </div>
  );
};

export default TransactionForm;
