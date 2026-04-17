import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import api from '../services/api';

const categories = [
  'All',
  'Healthcare & Wellness',
  'Beauty & Personal Care',
  'Education & Training',
  'Corporate & Professional Services',
  'Home & Maintenance',
  'Creative & Arts',
  'Technology & Digital',
  'Sports & Fitness',
  'Other'
];

const Home = () => {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedCategory && selectedCategory !== 'All'
        ? `/services/category/${encodeURIComponent(selectedCategory)}`
        : '/services';
      const response = await api.get(url);
      // Backend returns { services } so we need to access response.data.services
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Book Appointments with Ease
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Connect with professionals across healthcare, beauty, education, and corporate services
            </p>
            <div className="space-x-4">
              <Link to="/signup" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                Get Started
              </Link>
              <Link to="/login" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Categories */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? 'All' : category)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedCategory === category
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 hover:border-primary-300 dark:border-gray-600 dark:hover:border-primary-400'
                }`}
              >
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {category}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {selectedCategory === category ? 'Click to clear' : 'Click to filter'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {selectedCategory !== 'All' ? `${selectedCategory} Services` : 'All Services'}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">
                No services available in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Appointment Scheduler</h3>
              <p className="text-gray-300">
                Your trusted platform for booking professional appointments across various services.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white">Login</Link></li>
                <li><Link to="/signup" className="text-gray-300 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-300">
                Support: support@appointmentscheduler.com<br />
                Phone: +91 9876543210
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2024 Appointment Scheduler. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
