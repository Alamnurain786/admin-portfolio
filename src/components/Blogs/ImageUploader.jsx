import React from 'react';

const ImageUploader = ({
  imagePreview,
  handleImageChange,
  handleRemoveImage,
}) => {
  return (
    <div className="flex items-center space-x-6">
      <div className="flex-1">
        <label className="flex justify-center w-full h-32 px-4 transition bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
          <span className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="font-medium text-gray-600 dark:text-gray-300">
              Drop files to upload, or{' '}
              <span className="text-blue-600 underline">browse</span>
            </span>
          </span>
          <input
            type="file"
            name="image"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
      </div>

      {imagePreview && (
        <div className="relative w-32 h-32">
          <img
            src={imagePreview}
            alt="Preview"
            className="object-cover w-full h-full rounded-md"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
