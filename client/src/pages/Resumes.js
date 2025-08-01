import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { resumesAPI, downloadFile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Resumes = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: resumesData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['resumes', { 
      search: searchTerm, 
      department: selectedDepartment,
      skill: selectedSkill,
      page: currentPage 
    }],
    () =>
      resumesAPI.getAll({
        search: searchTerm || undefined,
        department: selectedDepartment || undefined,
        skill: selectedSkill || undefined,
        page: currentPage,
        limit: 12,
      }),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );

  const resumes = resumesData?.data?.resumes || [];
  const pagination = resumesData?.data?.pagination || {};

  const departments = [
    { value: '', label: 'All Departments' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Electronics', label: 'Electronics & Communication' },
    { value: 'Mechanical', label: 'Mechanical Engineering' },
    { value: 'Civil', label: 'Civil Engineering' },
    { value: 'Electrical', label: 'Electrical Engineering' },
    { value: 'Business', label: 'Business Administration' },
  ];

  const commonSkills = [
    { value: '', label: 'All Skills' },
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'Python', label: 'Python' },
    { value: 'Java', label: 'Java' },
    { value: 'React', label: 'React' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Data Analysis', label: 'Data Analysis' },
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'UI/UX Design', label: 'UI/UX Design' },
    { value: 'Project Management', label: 'Project Management' },
    { value: 'Database Management', label: 'Database Management' },
    { value: 'Cloud Computing', label: 'Cloud Computing' },
    { value: 'DevOps', label: 'DevOps' },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (resume) => {
    try {
      const response = await resumesAPI.download(resume.id);
      downloadFile(response, resume.fileName);
      toast.success('Download started');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Download failed');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const canDownload = (resume) => {
    // Students can only see public resumes
    // Faculty and admin can see all resumes
    return hasPermission('faculty') || resume.isPublic || resume.uploadedBy.id === user.id;
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Error loading resumes: {error.message}
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
            Resume Vault
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Browse and download student resumes {hasPermission('faculty') ? 'for recruitment and assessment' : 'for networking and collaboration'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {user.role === 'student' && (
            <Button as={Link} to="/resumes/upload" className="inline-flex items-center">
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          )}
          <Button as={Link} to="/resumes/my" variant="outline">
            My Resumes
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skills, experience..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </form>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {departments.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>

          {/* Skill Filter */}
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {commonSkills.map((skill) => (
              <option key={skill.value} value={skill.value}>
                {skill.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Info Banner for Students */}
      {user.role === 'student' && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start">
            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Resume Visibility
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                You can only view public resumes from other students. Faculty members have access to all resumes for academic and placement purposes.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Resumes Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card key={resume.id} className="p-6 hover:shadow-md transition-shadow">
              {/* Resume Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {resume.uploadedBy.name}
                    </h3>
                    {resume.isPublic ? (
                      <EyeIcon className="h-4 w-4 text-green-500" title="Public" />
                    ) : (
                      <EyeSlashIcon className="h-4 w-4 text-orange-500" title="Private" />
                    )}
                  </div>
                  {resume.title && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {resume.title}
                    </p>
                  )}
                </div>
                <DocumentTextIcon className="h-8 w-8 text-gray-400 flex-shrink-0 ml-2" />
              </div>

              {/* Student Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Department:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {resume.uploadedBy.department}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Year:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {resume.uploadedBy.year}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">File Size:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatFileSize(resume.fileSize)}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {resume.skills && resume.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.slice(0, 6).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {resume.skills.length > 6 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{resume.skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Experience */}
              {resume.experience && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Experience:</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                    {resume.experience}
                  </p>
                </div>
              )}

              {/* Upload Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <p>Updated {format(new Date(resume.updatedAt), 'MMM dd, yyyy')}</p>
                {hasPermission('faculty') && resume.downloadCount > 0 && (
                  <p>{resume.downloadCount} downloads</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {canDownload(resume) ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownload(resume)}
                    className="flex-1 inline-flex items-center justify-center"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex-1"
                    title="This resume is private"
                  >
                    Private
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  as={Link}
                  to={`/resumes/${resume.id}`}
                >
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {resumes.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No resumes found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedDepartment || selectedSkill
              ? 'Try adjusting your search or filter criteria.'
              : 'No resumes have been uploaded yet.'}
          </p>
          {user.role === 'student' && (
            <Button as={Link} to="/resumes/upload" className="mt-4">
              Upload Your Resume
            </Button>
          )}
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

export default Resumes;
