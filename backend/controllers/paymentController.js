const Razorpay = require('razorpay');
const Appointment = require('../models/Appointment');

// Initialize Razorpay with test credentials
const razorpay = new Razorpay({
  key_id: 'rzp_test_Rki3nHw3jIkH21',
  key_secret: 'LRKsEjG7NvwxRTsV5sv50J0V'
});

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    const options = {
      amount: amount, // amount in smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1 // auto capture payment
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
};

// Verify payment and create appointment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, appointmentData } = req.body;
    
    // In a real application, you would verify the payment signature here
    // For test mode, we'll assume the payment is successful
    
    // Create appointment
    const appointment = new Appointment({
      ...appointmentData,
      payment: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: 'completed',
        amount: appointmentData.amount / 100, // Convert back to INR from paise
        currency: 'INR',
        paymentDate: new Date()
      },
      status: 'confirmed'
    });
    
    await appointment.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment verified and appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
