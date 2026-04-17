import React, { useState } from 'react';
import PaymentLoader from './PaymentLoader';
import PaymentSuccess from './PaymentSuccess';
import './Payment.css';

const PaymentModal = ({ isOpen, onClose, amount, serviceName, onSuccess }) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'success'
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (!isOpen) return null;

  const handlePay = () => {
    setStatus('processing');
    
    // Simulate API call / processing time
    setTimeout(() => {
      setStatus('success');
      
      // Show success animation briefly then trigger callback
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  const resetAndClose = () => {
    if (status !== 'processing') {
      setStatus('idle');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-md p-8 payment-modal-container"
        onClick={e => e.stopPropagation()}
      >
        {status === 'idle' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Complete Payment</h2>
              <button 
                onClick={resetAndClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Paying for</p>
              <p className="font-semibold text-gray-900 dark:text-white mb-3">{serviceName}</p>
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">₹{amount}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Payment Method</p>
              <div className="grid grid-cols-3 gap-3">
                {['card', 'upi', 'gpay'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`payment-option py-3 px-2 flex flex-col items-center justify-center rounded-lg border-2 ${
                      paymentMethod === method 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-sm font-medium capitalize">{method === 'gpay' ? 'GPay' : method.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full py-3 text-lg pay-btn mt-4"
            >
              Pay ₹{amount}
            </button>
            
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Payments are safe and encrypted (Simulated mode)
            </p>
          </>
        )}

        {status === 'processing' && <PaymentLoader />}
        
        {status === 'success' && <PaymentSuccess />}
      </div>
    </div>
  );
};

export default PaymentModal;
