import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <Card className="p-8">
          {/* 404 Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          {/* 404 Text */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or the URL might be incorrect.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              as={Link}
              to="/dashboard"
              variant="primary"
              size="lg"
              className="w-full inline-flex items-center justify-center"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="lg"
              className="w-full inline-flex items-center justify-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Help Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Looking for something specific?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/notices"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
              >
                View Notices
              </Link>
              <Link
                to="/events"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
              >
                Browse Events
              </Link>
              <Link
                to="/materials"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
              >
                Study Materials
              </Link>
              <Link
                to="/resumes"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
              >
                Resume Vault
              </Link>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If you think this is an error, please contact the system administrator.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
