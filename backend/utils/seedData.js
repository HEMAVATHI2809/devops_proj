require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-scheduler');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('Created admin user: admin@example.com / admin123');

    // Create sample customers
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: customerPassword,
        role: 'customer'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: customerPassword,
        role: 'customer'
      }
    ];

    for (const customer of customers) {
      await new User(customer).save();
    }
    console.log('Created sample customers');

    // Create sample services
    const services = [
      // Healthcare & Wellness
      {
        name: 'General Consultation',
        domain: 'Healthcare & Wellness',
        description: 'Comprehensive health check-up and consultation with experienced physicians',
        providerName: 'Dr. Sarah Johnson',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTimeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
      },
      {
        name: 'Dental Check-up',
        domain: 'Healthcare & Wellness',
        description: 'Complete dental examination and cleaning services',
        providerName: 'Dr. Michael Chen',
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        availableTimeSlots: ['08:00 AM', '09:00 AM', '10:00 AM', '01:00 PM', '02:00 PM']
      },
      {
        name: 'Yoga Session',
        domain: 'Healthcare & Wellness',
        description: 'Relaxing yoga sessions for all skill levels',
        providerName: 'Emma Wilson',
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        availableTimeSlots: ['06:00 AM', '07:00 AM', '06:00 PM', '07:00 PM']
      },

      // Beauty & Personal Care
      {
        name: 'Hair Styling',
        domain: 'Beauty & Personal Care',
        description: 'Professional hair styling and treatment services',
        providerName: 'Alex Thompson',
        availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        availableTimeSlots: ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM']
      },
      {
        name: 'Facial Treatment',
        domain: 'Beauty & Personal Care',
        description: 'Rejuvenating facial treatments for glowing skin',
        providerName: 'Lisa Martinez',
        availableDays: ['Monday', 'Thursday', 'Friday'],
        availableTimeSlots: ['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM']
      },
      {
        name: 'Massage Therapy',
        domain: 'Beauty & Personal Care',
        description: 'Therapeutic massage sessions for relaxation and pain relief',
        providerName: 'David Brown',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimeSlots: ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM']
      },

      // Education & Training
      {
        name: 'Python Programming',
        domain: 'Education & Training',
        description: 'Learn Python programming from basics to advanced concepts',
        providerName: 'Prof. Robert Anderson',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTimeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
      },
      {
        name: 'Business English',
        domain: 'Education & Training',
        description: 'Improve your business English communication skills',
        providerName: 'Sarah Williams',
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        availableTimeSlots: ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM']
      },
      {
        name: 'Digital Marketing',
        domain: 'Education & Training',
        description: 'Comprehensive digital marketing strategies and implementation',
        providerName: 'Mark Johnson',
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        availableTimeSlots: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM']
      },

      // Corporate & Professional Services
      {
        name: 'Business Consulting',
        domain: 'Corporate & Professional Services',
        description: 'Strategic business consulting for growth and optimization',
        providerName: 'Jennifer Davis',
        availableDays: ['Tuesday', 'Wednesday', 'Thursday'],
        availableTimeSlots: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM']
      },
      {
        name: 'Legal Advisory',
        domain: 'Corporate & Professional Services',
        description: 'Professional legal advice and consultation services',
        providerName: 'Attorney James Wilson',
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        availableTimeSlots: ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM']
      },
      {
        name: 'Financial Planning',
        domain: 'Corporate & Professional Services',
        description: 'Comprehensive financial planning and investment advice',
        providerName: 'Charles Miller',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTimeSlots: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM']
      }
    ];

    for (const service of services) {
      await new Service(service).save();
    }
    console.log('Created sample services');

    console.log('\n=== Seed Data Summary ===');
    console.log('Admin: admin@example.com / admin123');
    console.log('Customers: john@example.com / customer123, jane@example.com / customer123');
    console.log(`Services: ${services.length} services across 4 domains`);
    console.log('\nSeed data created successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
