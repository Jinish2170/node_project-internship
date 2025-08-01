import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  MegaphoneIcon,
  CalendarIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Notices', href: '/notices', icon: MegaphoneIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'Materials', href: '/materials', icon: DocumentTextIcon },
    { name: 'Resumes', href: '/resumes', icon: BriefcaseIcon },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  // Admin navigation (if needed in future)
  const adminNavigation = [
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-6 pt-4">
        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={clsx(
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                        location.pathname === item.href
                          ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <item.icon
                        className={clsx(
                          'h-6 w-6 shrink-0',
                          location.pathname === item.href
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* User Section */}
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Account
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {userNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={clsx(
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                        location.pathname === item.href
                          ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <item.icon
                        className={clsx(
                          'h-6 w-6 shrink-0',
                          location.pathname === item.href
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Admin Section (if admin) */}
            {user?.role === 'admin' && (
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Admin
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {adminNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                          location.pathname === item.href
                            ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                            : 'text-gray-700 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            'h-6 w-6 shrink-0',
                            location.pathname === item.href
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {/* User Info */}
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
