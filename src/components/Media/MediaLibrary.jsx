// src/components/Media/MediaLibrary.jsx
//use this component to create a media library for selecting images, and displaying existing media items and manage uploads
import React, { useState, useEffect } from 'react';
import { apiService } from '../../utils/api';

const MediaLibrary = ({ onSelect, onClose, multiple = false }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      // Assume your backend has a media endpoint
      const response = await apiService.getMedia();
      setMedia(response.data.data);
    } catch (err) {
      setError('Failed to load media');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    if (multiple) {
      if (selectedItems.some((selected) => selected._id === item._id)) {
        setSelectedItems(
          selectedItems.filter((selected) => selected._id !== item._id)
        );
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    } else {
      setSelectedItems([item]);
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await apiService.uploadMultipleImages(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      // Add new media to the list
      setMedia([...response.data.data, ...media]);
      setIsUploading(false);
      setUploadProgress(0);
    } catch (err) {
      setError('Failed to upload media');
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      onSelect(selectedItems);
    } else {
      onSelect(selectedItems[0]);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Media Library
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-4">
          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Upload
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple={true}
              onChange={handleUpload}
            />
          </label>

          {isUploading && (
            <div className="flex-1 flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-4">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {uploadProgress}%
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 border-b border-red-200">
            <p>{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : media.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item._id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedItems.some((selected) => selected._id === item._id)
                      ? 'border-blue-500 shadow-lg transform scale-95'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <img
                    src={item.url}
                    alt={item.filename || 'Media item'}
                    className="w-full h-32 object-cover"
                  />
                  {selectedItems.some(
                    (selected) => selected._id === item._id
                  ) && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 text-xs truncate">
                    {item.filename || 'Unnamed'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>No media items found</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedItems.length}{' '}
            {selectedItems.length === 1 ? 'item' : 'items'} selected
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedItems.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {multiple ? 'Select Items' : 'Select Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
