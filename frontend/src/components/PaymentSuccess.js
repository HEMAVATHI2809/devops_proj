import React from 'react';
import './Payment.css';

const PaymentSuccess = () => {
  return (
    <div className="success-animation p-8 bg-transparent">
      <div className="success-circle">
        <svg className="checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="success-text text-center">
        ✔ Payment Successful
      </div>
    </div>
  );
};

export default PaymentSuccess;
