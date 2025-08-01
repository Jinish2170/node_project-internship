import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  MegaphoneIcon,
  CalendarIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  UserGroupIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { noticesAPI, eventsAPI, materialsAPI } from '../services/api';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch recent data
  const { data: notices, isLoading: noticesLoading } = useQuery(
    'dashboard-notices',
    () => noticesAPI.getAll({ limit: 5 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: events, isLoading: eventsLoading } = useQuery(
    'dashboard-events',
    () => eventsAPI.getAll({ upcoming: true, limit: 5 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: materials, isLoading: materialsLoading } = useQuery(
    'dashboard-materials',
    () => materialsAPI.getAll({ limit: 5 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const stats = [
    {
      name: 'Total Notices',
      value: notices?.data?.pagination?.total || 0,
      icon: MegaphoneIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      href: '/notices',
    },
    {
      name: 'Upcoming Events',
      value: events?.data?.pagination?.total || 0,
      icon: CalendarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      href: '/events',
    },
    {
      name: 'Study Materials',
      value: materials?.data?.pagination?.total || 0,
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      href: '/materials',
    },
    {
      name: 'Resume Vault',
      value: '24',
      icon: BriefcaseIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      href: '/resumes',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-primary-100">
          Welcome back to CampusConnect. Here's what's happening on campus today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href} className="group">
            <Card className="hover:shadow-md transition-shadow p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Notices */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recent Notices
            </h2>
            <Link
              to="/notices"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              View all
            </Link>
          </div>
          
          {noticesLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {notices?.data?.notices?.slice(0, 5).map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/notices/${notice.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {notice.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(notice.createdAt), 'MMM dd, yyyy')} • {notice.category}
                    </p>
                  </div>
                </div>
              ))}
              
              {!notices?.data?.notices?.length && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No notices available
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Upcoming Events
            </h2>
            <Link
              to="/events"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              View all
            </Link>
          </div>
          
          {eventsLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {events?.data?.events?.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {event.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time} • {event.venue}
                    </p>
                  </div>
                </div>
              ))}
              
              {!events?.data?.events?.length && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            to="/notices"
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MegaphoneIcon className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Browse Notices
            </span>
          </Link>
          
          <Link
            to="/events"
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <CalendarIcon className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              View Events
            </span>
          </Link>
          
          <Link
            to="/materials"
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Study Materials
            </span>
          </Link>
          
          <Link
            to="/resumes"
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <BriefcaseIcon className="h-8 w-8 text-orange-500 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Resume Vault
            </span>
          </Link>
        </div>
      </Card>

      {/* Role-specific content */}
      {user?.role === 'student' && (
        <Card>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Student Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <TrendingUpIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Academic Progress</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track your semester performance
              </p>
            </div>
            <div className="text-center p-4">
              <UserGroupIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Study Groups</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Connect with classmates
              </p>
            </div>
            <div className="text-center p-4">
              <BriefcaseIcon className="h-12 w-12 text-purple-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Career Services</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Placement assistance & guidance
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
