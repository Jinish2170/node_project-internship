import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { noticesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

const Notices = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: noticesData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['notices', { search: searchTerm, category: selectedCategory, page: currentPage }],
    () =>
      noticesAPI.getAll({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        page: currentPage,
        limit: 10,
      }),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const notices = noticesData?.data?.notices || [];
  const pagination = noticesData?.data?.pagination || {};

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'event', label: 'Event' },
    { value: 'general', label: 'General' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[category] || colors.general;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Error loading notices: {error.message}
        </p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Notice Board
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Stay updated with the latest announcements and notices
          </p>
        </div>
        {hasPermission('faculty') && (
          <div className="mt-4 sm:mt-0">
            <Button as={Link} to="/notices/create" className="inline-flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Post Notice
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </form>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <FunnelIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Notices List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/notices/${notice.id}`}
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {notice.title}
                    </Link>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        notice.category
                      )}`}
                    >
                      {notice.category}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {notice.content}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span>By {notice.author.name}</span>
                    <span>•</span>
                    <span>{format(new Date(notice.createdAt), 'MMM dd, yyyy')}</span>
                    {notice.targetAudience !== 'all' && (
                      <>
                        <span>•</span>
                        <span className="capitalize">For {notice.targetAudience}</span>
                      </>
                    )}
                    {notice.expiryDate && (
                      <>
                        <span>•</span>
                        <span>
                          Expires {format(new Date(notice.expiryDate), 'MMM dd, yyyy')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <Link
                    to={`/notices/${notice.id}`}
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </Card>
          ))}

          {notices.length === 0 && (
            <Card className="p-12 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No notices found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedCategory
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No notices have been posted yet.'}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)} to{' '}
              {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}{' '}
              results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {[...Array(pagination.pages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === pagination.pages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Notices;
