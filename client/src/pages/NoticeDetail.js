import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { noticesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

const NoticeDetail = () => {
  const { id } = useParams();
  const { canEdit } = useAuth();

  const {
    data: noticeData,
    isLoading,
    error,
  } = useQuery(['notice', id], () => noticesAPI.getById(id), {
    staleTime: 5 * 60 * 1000,
  });

  const notice = noticeData?.data?.notice;

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[category] || colors.general;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">
          Error loading notice: {error.response?.data?.message || error.message}
        </p>
        <Button as={Link} to="/notices" variant="outline">
          Back to Notices
        </Button>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Notice not found</p>
        <Button as={Link} to="/notices" variant="outline">
          Back to Notices
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          as={Link}
          to="/notices"
          variant="outline"
          size="sm"
          className="inline-flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Notices
        </Button>

        {canEdit(notice) && (
          <div className="flex space-x-2">
            <Button
              as={Link}
              to={`/notices/${notice.id}/edit`}
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
            <Button variant="danger" size="sm">
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Notice Content */}
      <Card className="p-8">
        {/* Title and Category */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {notice.title}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                notice.category
              )}`}
            >
              <TagIcon className="h-4 w-4 mr-1" />
              {notice.category}
            </span>
          </div>

          {/* Urgent notice alert */}
          {notice.category === 'urgent' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Urgent Notice
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This is an urgent notice that requires immediate attention.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <UserIcon className="h-5 w-5 mr-2" />
            <span>
              {notice.author.name} ({notice.author.role})
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>Posted on {format(new Date(notice.createdAt), 'MMMM dd, yyyy')}</span>
          </div>

          {notice.updatedAt !== notice.createdAt && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span>
                Updated on {format(new Date(notice.updatedAt), 'MMMM dd, yyyy')}
              </span>
            </div>
          )}

          {notice.targetAudience !== 'all' && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Target Audience:</span>
              <span className="ml-1 capitalize">{notice.targetAudience}</span>
            </div>
          )}

          {notice.department && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Department:</span>
              <span className="ml-1">{notice.department}</span>
            </div>
          )}

          {notice.expiryDate && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Expires:</span>
              <span className="ml-1">
                {format(new Date(notice.expiryDate), 'MMMM dd, yyyy')}
              </span>
            </div>
          )}
        </div>

        {/* Notice Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </div>
        </div>

        {/* Expiry Warning */}
        {notice.expiryDate && new Date(notice.expiryDate) > new Date() && (
          <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This notice will expire on{' '}
                  <span className="font-medium">
                    {format(new Date(notice.expiryDate), 'MMMM dd, yyyy')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Related Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Related Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button as={Link} to="/notices" variant="outline">
            View All Notices
          </Button>
          <Button as={Link} to="/events" variant="outline">
            Browse Events
          </Button>
          {notice.category === 'academic' && (
            <Button as={Link} to="/materials" variant="outline">
              Study Materials
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NoticeDetail;
