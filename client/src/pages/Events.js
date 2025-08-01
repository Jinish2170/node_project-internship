import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns';

const Events = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['events', { search: searchTerm, category: selectedCategory, upcoming: showUpcoming, page: currentPage }],
    () =>
      eventsAPI.getAll({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        upcoming: showUpcoming || undefined,
        page: currentPage,
        limit: 12,
      }),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );

  const events = eventsData?.data?.events || [];
  const pagination = eventsData?.data?.pagination || {};

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Sports' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cultural: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sports: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      workshop: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      seminar: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return 'Past';
    return format(date, 'MMM dd');
  };

  const getTimeRemaining = (event) => {
    if (!event.timeRemaining || event.timeRemaining <= 0) return null;
    
    const days = Math.floor(event.timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((event.timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Starting soon';
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
          Error loading events: {error.message}
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
            Campus Events
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discover and participate in campus events and activities
          </p>
        </div>
        {hasPermission('faculty') && (
          <div className="mt-4 sm:mt-0">
            <Button as={Link} to="/events/create" className="inline-flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
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

          {/* Upcoming/All Toggle */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUpcoming}
                onChange={(e) => setShowUpcoming(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Upcoming only
              </span>
            </label>
          </div>
        </div>
      </Card>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Event Image */}
              {event.image ? (
                <img
                  src={`http://localhost:5000${event.image}`}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <CalendarIcon className="h-16 w-16 text-white opacity-50" />
                </div>
              )}

              <div className="p-6">
                {/* Category and Date */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    {event.category}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getDateLabel(event.date)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {event.title}
                  </Link>
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span>By {event.organizer}</span>
                  </div>
                </div>

                {/* Time Remaining */}
                {event.isUpcoming && getTimeRemaining(event) && (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400 mb-4">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{getTimeRemaining(event)}</span>
                  </div>
                )}

                {/* Registration Status */}
                {event.registrationRequired && (
                  <div className="mb-4">
                    {event.maxParticipants && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {event.participants?.length || 0} / {event.maxParticipants} registered
                      </div>
                    )}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: event.maxParticipants
                            ? `${Math.min(((event.participants?.length || 0) / event.maxParticipants) * 100, 100)}%`
                            : '0%',
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-between items-center">
                  <Link
                    to={`/events/${event.id}`}
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                  
                  {event.registrationRequired && event.isUpcoming && user?.role === 'student' && (
                    <Button size="sm" variant="primary">
                      {event.participants?.some(p => p.userId === user.id) ? 'Registered' : 'Register'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {events.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No events found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filter criteria.'
              : showUpcoming
              ? 'No upcoming events scheduled.'
              : 'No events have been created yet.'}
          </p>
        </Card>
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

export default Events;
