import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full dark:bg-primary-900 dark:text-primary-300">
          {service.category}
        </span>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {service.name}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {service.description}
      </p>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Provider: {service.providerId?.businessName || service.providerId?.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Available: {service.availableDays && service.availableDays.length > 0 ? service.availableDays.join(', ') : 'Not specified'}
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {service.availableTimeSlots && Array.isArray(service.availableTimeSlots) ? service.availableTimeSlots.length : 0} time slots
        </div>
        <Link
          to={`/service/${service._id}`}
          className="btn btn-primary text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
