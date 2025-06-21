// src/components/Blogs/BlogPostForm.jsx
// This component is used to create or edit a blog post in the admin panel.
import React from 'react';
import TextInput from '../UI/TextInput';
import TextArea from '../UI/TextArea';
import Button from '../UI/Button';
import ImageUploader from './ImageUploader';
import TopicsManager from './TopicsManager';
import SeoScoreIndicator from './SeoScoreIndicator';
import MarkdownEditor from './MarkdownEditor';

const BlogPostForm = ({
  post,
  handleChange,
  handleTopicAdd,
  handleTopicRemove,
  handleImageSelection,
  handleRemoveImage,
  handleSubmit,
  isSubmitting,
  uploadProgress,
  imagePreview,
  seoScore,
  validationErrors,
  setValidationErrors,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow overflow-hidden"
    >
      <div className="p-4 sm:p-6">
        {' '}
        {/* Added responsive padding */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TextInput
              label="Title"
              id="headline"
              name="headline"
              value={post.headline}
              onChange={handleChange}
              placeholder="Enter post title"
              required
              error={validationErrors.headline}
            />

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <TextInput
                  label="Permalink"
                  id="permalink"
                  name="permalink"
                  value={post.permalink}
                  onChange={handleChange}
                  placeholder="post-url-slug"
                  required
                  error={validationErrors.permalink}
                />
              </div>

              <div className="w-full md:w-1/3">
                <label
                  htmlFor="visibility" // Added htmlFor for accessibility
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Status
                </label>
                <select
                  id="visibility" // Added id
                  name="visibility"
                  value={post.metadata.visibility}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    validationErrors.visibility
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                {validationErrors.visibility && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.visibility}
                  </p>
                )}
              </div>
            </div>

            <TextArea
              label="Excerpt/Summary"
              id="excerpt"
              name="excerpt"
              value={post.excerpt}
              onChange={handleChange}
              placeholder="Brief summary of your post (appears in search results and social shares)"
              rows={3}
              error={validationErrors.excerpt}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <MarkdownEditor
                value={post.articleBody}
                onChange={(value) => {
                  // Ensure validationErrors.articleBody is cleared safely
                  if (validationErrors.articleBody) {
                    setValidationErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.articleBody;
                      return updated;
                    });
                  }
                  handleChange({
                    target: { name: 'articleBody', value: value },
                  });
                }}
              />
              {validationErrors.articleBody && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.articleBody}
                </p>
              )}
            </div>
          </div>

          {/* Right Sidebar - SEO Score, Featured Image, Topics */}
          <div className="space-y-6 lg:col-span-1">
            {' '}
            {/* Explicitly setting col-span for clarity */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                SEO Score
                <SeoScoreIndicator score={seoScore} />
              </h3>

              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {seoScore < 40
                    ? 'Poor'
                    : seoScore < 70
                      ? 'Good'
                      : 'Excellent'}{' '}
                  SEO score ({seoScore}/100)
                </p>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      seoScore < 40
                        ? 'bg-red-500'
                        : seoScore < 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${seoScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Featured Image
              </h3>

              <ImageUploader
                imagePreview={imagePreview}
                handleImageChange={handleImageSelection}
                handleRemoveImage={handleRemoveImage}
              />

              {uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}

              {validationErrors.heroImage && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.heroImage}
                </p>
              )}

              {imagePreview && (
                <TextInput
                  label="Image Alt Text"
                  id="imageAlt"
                  name="imageAlt"
                  value={post.imageAlt}
                  onChange={handleChange}
                  placeholder="Describe the image for accessibility"
                  className="mt-4"
                  error={validationErrors.imageAlt}
                />
              )}
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Topics & Tags
              </h3>

              <TopicsManager
                topics={post.topics}
                onAddTopic={handleTopicAdd}
                onRemoveTopic={handleTopicRemove}
              />

              {validationErrors.topics && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.topics}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end sm:px-6">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {post.id ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
};

export default BlogPostForm;
// This component is designed to be used in a blog management system where users can create or edit blog posts.
// It includes fields for the post title, permalink, visibility status, excerpt, content, featured image, SEO score, and topics.
