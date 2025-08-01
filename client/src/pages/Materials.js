import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { materialsAPI, downloadFile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Materials = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: materialsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['materials', { 
      search: searchTerm, 
      semester: selectedSemester, 
      department: selectedDepartment,
      materialType: selectedType,
      page: currentPage 
    }],
    () =>
      materialsAPI.getAll({
        search: searchTerm || undefined,
        semester: selectedSemester || undefined,
        department: selectedDepartment || undefined,
        materialType: selectedType || undefined,
        page: currentPage,
        limit: 12,
      }),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );

  const materials = materialsData?.data?.materials || [];
  const pagination = materialsData?.data?.pagination || {};

  const materialTypes = [
    { value: '', label: 'All Types' },
    { value: 'notes', label: 'Notes' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'syllabus', label: 'Syllabus' },
    { value: 'previous-papers', label: 'Previous Papers' },
    { value: 'reference', label: 'Reference Material' },
  ];

  const departments = [
    { value: '', label: 'All Departments' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Electronics', label: 'Electronics & Communication' },
    { value: 'Mechanical', label: 'Mechanical Engineering' },
    { value: 'Civil', label: 'Civil Engineering' },
    { value: 'Electrical', label: 'Electrical Engineering' },
    { value: 'Business', label: 'Business Administration' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
  ];

  const getTypeColor = (type) => {
    const colors = {
      notes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      assignment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      syllabus: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'previous-papers': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      reference: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (material) => {
    try {
      const response = await materialsAPI.download(material.id);
      downloadFile(response, material.fileName);
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Error loading materials: {error.message}
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
            Study Materials
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Access and download study materials, notes, and academic resources
          </p>
        </div>
        {hasPermission('faculty') && (
          <div className="mt-4 sm:mt-0">
            <Button as={Link} to="/materials/upload" className="inline-flex items-center">
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Upload Material
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </form>

          {/* Semester Filter */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>

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

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {materialTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <Card key={material.id} className="p-6 hover:shadow-md transition-shadow">
              {/* Material Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {material.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                      material.materialType
                    )}`}
                  >
                    {material.materialType.replace('-', ' ')}
                  </span>
                </div>
                <DocumentTextIcon className="h-8 w-8 text-gray-400 flex-shrink-0 ml-2" />
              </div>

              {/* Description */}
              {material.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {material.description}
                </p>
              )}

              {/* Material Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {material.subject}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                  <span className="text-gray-900 dark:text-gray-100">{material.semester}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Department:</span>
                  <span className="text-gray-900 dark:text-gray-100">{material.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">File Size:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatFileSize(material.fileSize)}
                  </span>
                </div>
              </div>

              {/* Upload Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <p>Uploaded by {material.uploadedBy.name}</p>
                <p>{format(new Date(material.createdAt), 'MMM dd, yyyy')}</p>
                {material.downloadCount > 0 && (
                  <p>{material.downloadCount} downloads</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownload(material)}
                  className="flex-1 inline-flex items-center justify-center"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  as={Link}
                  to={`/materials/${material.id}`}
                >
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {materials.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No materials found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedSemester || selectedDepartment || selectedType
              ? 'Try adjusting your search or filter criteria.'
              : 'No study materials have been uploaded yet.'}
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

export default Materials;
