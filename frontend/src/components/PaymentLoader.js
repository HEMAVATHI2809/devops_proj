import React from 'react';
import './Payment.css';

const PaymentLoader = () => {
  return (
    <div className="loader-container p-8">
      <div className="loader"></div>
      <div className="loader-text mt-4">
        Processing Payment...
      </div>
    </div>
  );
};

export default PaymentLoader;
