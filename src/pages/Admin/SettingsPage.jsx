import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import ImageUploader from '../../components/Blogs/ImageUploader';
import MarkdownEditor from '../../components/Blogs/MarkdownEditor';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { apiService } from '../../utils/api';
import Toast from '../../components/UI/Toast';
import { FaTrash, FaPlus } from 'react-icons/fa';

const SettingsPage = () => {
  // --- State for all settings fields ---
  const [siteTitle, setSiteTitle] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [passwordPolicy, setPasswordPolicy] = useState('strong');
  const [profileImage, setProfileImage] = useState('');
  const [newProfileImageFile, setNewProfileImageFile] = useState(null);
  const [aboutText, setAboutText] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const initialImagePublicId = useRef(null);
  const [heroContent, setHeroContent] = useState({
    name: '',
    tagline: '',
    ctaButtonText: '',
    ctaButtonLink: '',
  });

  // --- UI state ---
  const [editStates, setEditStates] = useState({
    profile: false,
    about: false,
    hero: false,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', show: false });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: '', type: '', show: false }), 3000);
  }, []);

  // --- Fetch settings on mount ---
  useEffect(() => {
    setLoading(true);
    apiService
      .getSettings()
      .then((response) => {
        const settings = response.data.data;
        setSiteTitle(settings.siteTitle || 'My Admin Panel');
        setEmailNotifications(settings.emailNotifications ?? true);
        setPasswordPolicy(settings.passwordPolicy || 'strong');
        setProfileImage(settings.aboutContent?.profileImageUrl || '');
        setAboutText(settings.aboutContent?.aboutText || '');
        setParagraphs(settings.aboutContent?.paragraphs || []);
        setHeroContent(
          settings.heroContent || {
            name: '',
            tagline: '',
            ctaButtonText: '',
            ctaButtonLink: '',
          }
        );
        initialImagePublicId.current =
          settings.aboutContent?.profileImagePublicId || null;
      })
      .catch(() => showToast('Failed to load settings.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  // --- Image selection and validation ---
  const handleProfileImageChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];
      if (!allowedTypes.includes(file.type)) {
        showToast(
          'Invalid file type. Please use JPEG, PNG, WebP, or GIF.',
          'error'
        );
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast('Image file must be smaller than 5MB.', 'error');
        return;
      }
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
      setProfileImagePreview(URL.createObjectURL(file));
      setNewProfileImageFile(file);
    },
    [profileImagePreview, showToast]
  );

  // --- API Handlers ---
  const handleSaveProfile = async () => {
    if (!newProfileImageFile) {
      setEditStates((prev) => ({ ...prev, profile: false }));
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', newProfileImageFile);
      const uploadResponse = await apiService.uploadImage(formData);
      const { imageUrl, publicId } = uploadResponse.data.data;

      await apiService.updateProfileImageReference({ imageUrl, publicId });

      setProfileImage(imageUrl);
      initialImagePublicId.current = publicId;
      showToast('Profile image updated successfully!');
      setEditStates((prev) => ({ ...prev, profile: false }));
      setNewProfileImageFile(null);
      setProfileImagePreview('');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to update profile image.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    if (!initialImagePublicId.current) {
      if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
      setProfileImagePreview('');
      setNewProfileImageFile(null);
      setProfileImage('');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiService.deleteProfileImage();
      setProfileImage('');
      setProfileImagePreview('');
      setNewProfileImageFile(null);
      initialImagePublicId.current = null;
      showToast('Profile image removed successfully.');
      setEditStates((prev) => ({ ...prev, profile: false }));
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to remove image.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAbout = async () => {
    setIsSubmitting(true);
    try {
      await apiService.updateSettings({
        aboutContent: { aboutText, paragraphs },
      });
      setEditStates((prev) => ({ ...prev, about: false }));
      showToast('About section updated successfully!');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to update about section.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveHero = async () => {
    setIsSubmitting(true);
    try {
      await apiService.updateSettings({ heroContent });
      setEditStates((prev) => ({ ...prev, hero: false }));
      showToast('Hero section updated successfully!');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to update hero section.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.updateSettings({
        siteTitle,
        emailNotifications,
        passwordPolicy,
      }); // <-- CORRECTED API CALL
      showToast('General settings saved successfully!');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to save settings.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Dynamic content handlers ---
  const handleParagraphChange = (index, value) =>
    setParagraphs((p) => p.map((item, i) => (i === index ? value : item)));
  const addParagraph = () => setParagraphs((p) => [...p, '']);
  const removeParagraph = (index) =>
    setParagraphs((p) => p.filter((_, i) => i !== index));
  const handleHeroContentChange = (e) =>
    setHeroContent((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          System Settings
        </h1>

        {/* Profile Image Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Public Profile Image
          </h2>
          {!editStates.profile ? (
            <div className="flex items-center gap-6">
              <img
                src={profileImage || '/default-profile.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
                onClick={() =>
                  setEditStates((prev) => ({ ...prev, profile: true }))
                }
              >
                Edit
              </button>
            </div>
          ) : (
            <div>
              <ImageUploader
                imagePreview={profileImagePreview || profileImage}
                handleImageChange={handleProfileImageChange}
                handleRemoveImage={handleRemoveProfileImage}
              />
              <div className="mt-4 flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
                  onClick={() => {
                    setEditStates((prev) => ({ ...prev, profile: false }));
                    setProfileImagePreview('');
                    setNewProfileImageFile(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* About Me Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            About Me (Public)
          </h2>
          {!editStates.about ? (
            <div>
              <div
                className="prose dark:prose-invert max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: aboutText }}
              />
              <h3 className="font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
                Key Points:
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {paragraphs.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <button
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
                onClick={() =>
                  setEditStates((prev) => ({ ...prev, about: true }))
                }
              >
                Edit
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Main Bio
              </label>
              <MarkdownEditor
                value={aboutText}
                onChange={(value) => setAboutText(value)}
              />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-1">
                Key Point Paragraphs
              </label>
              <div className="space-y-2">
                {paragraphs.map((p, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) =>
                        handleParagraphChange(index, e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={`Paragraph ${index + 1}`}
                    />
                    <button
                      onClick={() => removeParagraph(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addParagraph}
                className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <FaPlus /> Add Paragraph
              </button>
              <div className="mt-4 flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
                  onClick={handleSaveAbout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
                  onClick={() =>
                    setEditStates((prev) => ({ ...prev, about: false }))
                  }
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hero Section Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Hero Section (Public)
          </h2>
          {!editStates.hero ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-gray-600 dark:text-gray-400">
                    Name:
                  </strong>{' '}
                  <span className="text-gray-800 dark:text-white">
                    {heroContent.name}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600 dark:text-gray-400">
                    Tagline:
                  </strong>{' '}
                  <span className="text-gray-800 dark:text-white">
                    {heroContent.tagline}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600 dark:text-gray-400">
                    Button Text:
                  </strong>{' '}
                  <span className="text-gray-800 dark:text-white">
                    {heroContent.ctaButtonText}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600 dark:text-gray-400">
                    Button Link:
                  </strong>{' '}
                  <span className="text-gray-800 dark:text-white">
                    {heroContent.ctaButtonLink}
                  </span>
                </div>
              </div>
              <button
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
                onClick={() =>
                  setEditStates((prev) => ({ ...prev, hero: true }))
                }
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="heroName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="heroName"
                  name="name"
                  value={heroContent.name}
                  onChange={handleHeroContentChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="heroTagline"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tagline
                </label>
                <input
                  type="text"
                  id="heroTagline"
                  name="tagline"
                  value={heroContent.tagline}
                  onChange={handleHeroContentChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="heroCtaText"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  CTA Button Text
                </label>
                <input
                  type="text"
                  id="heroCtaText"
                  name="ctaButtonText"
                  value={heroContent.ctaButtonText}
                  onChange={handleHeroContentChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="heroCtaLink"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  CTA Button Link
                </label>
                <input
                  type="text"
                  id="heroCtaLink"
                  name="ctaButtonLink"
                  value={heroContent.ctaButtonLink}
                  onChange={handleHeroContentChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
                  onClick={handleSaveHero}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
                  onClick={() =>
                    setEditStates((prev) => ({ ...prev, hero: false }))
                  }
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* General Settings Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            General & Security
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="siteTitle"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Site Title
              </label>
              <input
                type="text"
                id="siteTitle"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="passwordPolicy"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password Policy
              </label>
              <select
                id="passwordPolicy"
                value={passwordPolicy}
                onChange={(e) => setPasswordPolicy(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="weak">Weak</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="emailNotifications"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Enable Email Notifications
              </label>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '', show: false })}
        />
      )}
    </AdminLayout>
  );
};

export default SettingsPage;
