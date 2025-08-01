import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const { user, canEdit } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: eventData,
    isLoading,
    error,
  } = useQuery(['event', id], () => eventsAPI.getById(id), {
    staleTime: 2 * 60 * 1000,
  });

  const registerMutation = useMutation(eventsAPI.register, {
    onSuccess: () => {
      queryClient.invalidateQueries(['event', id]);
      toast.success('Successfully registered for the event!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const unregisterMutation = useMutation(eventsAPI.unregister, {
    onSuccess: () => {
      queryClient.invalidateQueries(['event', id]);
      toast.success('Successfully unregistered from the event');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Unregistration failed');
    },
  });

  const event = eventData?.data?.event;

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

  const getTimeRemaining = () => {
    if (!event?.timeRemaining || event.timeRemaining <= 0) return null;
    
    const days = Math.floor(event.timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((event.timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((event.timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    if (minutes > 0) return `${minutes}m remaining`;
    return 'Starting soon';
  };

  const isUserRegistered = event?.participants?.some(p => p.userId === user?.id);
  const canRegister = event?.registrationRequired && event?.isUpcoming && user?.role === 'student';
  const isFull = event?.maxParticipants && event?.participants?.length >= event?.maxParticipants;

  const handleRegister = () => {
    registerMutation.mutate(id);
  };

  const handleUnregister = () => {
    unregisterMutation.mutate(id);
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
          Error loading event: {error.response?.data?.message || error.message}
        </p>
        <Button as={Link} to="/events" variant="outline">
          Back to Events
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Event not found</p>
        <Button as={Link} to="/events" variant="outline">
          Back to Events
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
          to="/events"
          variant="outline"
          size="sm"
          className="inline-flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        {canEdit(event) && (
          <div className="flex space-x-2">
            <Button
              as={Link}
              to={`/events/${event.id}/edit`}
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

      {/* Event Image */}
      {event.image && (
        <Card className="p-0 overflow-hidden">
          <img
            src={`http://localhost:5000${event.image}`}
            alt={event.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </Card>
      )}

      {/* Event Content */}
      <Card className="p-8">
        {/* Title and Category */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {event.title}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                event.category
              )}`}
            >
              <TagIcon className="h-4 w-4 mr-1" />
              {event.category}
            </span>
          </div>

          {/* Status indicators */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {event.isUpcoming && getTimeRemaining() && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">{getTimeRemaining()}</span>
              </div>
            )}
            
            {event.isPast && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Event has ended</span>
              </div>
            )}

            {event.registrationRequired && isUserRegistered && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ You are registered
              </div>
            )}
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <CalendarIcon className="h-6 w-6 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                </p>
                <p className="text-sm">at {event.time}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPinIcon className="h-6 w-6 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {event.venue}
                </p>
              </div>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <UserIcon className="h-6 w-6 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Organized by {event.organizer}
                </p>
                <p className="text-sm">
                  By {event.author.name} ({event.author.role})
                </p>
              </div>
            </div>
          </div>

          {/* Registration Info */}
          {event.registrationRequired && (
            <div className="space-y-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <UserGroupIcon className="h-6 w-6 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Registration Required
                  </p>
                  {event.maxParticipants && (
                    <p className="text-sm">
                      {event.participants?.length || 0} / {event.maxParticipants} registered
                      {isFull && <span className="text-red-500 ml-2">(Full)</span>}
                    </p>
                  )}
                </div>
              </div>

              {/* Registration Progress */}
              {event.maxParticipants && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      isFull ? 'bg-red-500' : 'bg-primary-600'
                    }`}
                    style={{
                      width: `${Math.min(((event.participants?.length || 0) / event.maxParticipants) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              )}

              {/* Registration Button */}
              {canRegister && (
                <div className="pt-2">
                  {isUserRegistered ? (
                    <Button
                      variant="outline"
                      onClick={handleUnregister}
                      loading={unregisterMutation.isLoading}
                      className="w-full sm:w-auto"
                    >
                      Unregister
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleRegister}
                      loading={registerMutation.isLoading}
                      disabled={isFull}
                      className="w-full sm:w-auto"
                    >
                      {isFull ? 'Event Full' : 'Register Now'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Event Description */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            About This Event
          </h3>
          <div className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </div>
        </div>
      </Card>

      {/* Participants List (if registration required and user has access) */}
      {event.registrationRequired && 
       event.participants?.length > 0 && 
       (canEdit(event) || user?.role === 'faculty' || user?.role === 'admin') && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Registered Participants ({event.participants.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {participant.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Registered {formatDistanceToNow(new Date(participant.registeredAt))} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Related Events */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Related Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button as={Link} to="/events" variant="outline">
            View All Events
          </Button>
          <Button as={Link} to={`/events?category=${event.category}`} variant="outline">
            More {event.category} Events
          </Button>
          <Button as={Link} to="/notices" variant="outline">
            Browse Notices
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EventDetail;
