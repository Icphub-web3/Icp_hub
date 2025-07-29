import React, { useEffect, useContext } from 'react';
import { useUser } from '../hooks/useICPHub';
import { AuthContext } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

const UserProfile = () => {
  const { user: currentUser } = useContext(AuthContext);
  const { userProfile, getUser, updateProfile, loading, error } = useUser();

  useEffect(() => {
    // Use the current authenticated user's principal
    if (currentUser?.principal) {
      getUser(currentUser.principal);
    }
  }, [getUser, currentUser]);

  const handleUpdateProfile = async profileData => {
    try {
      await updateProfile(profileData);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <LoadingSpinner />
        <p className="text-center text-gray-600 mt-4">
          Loading user profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <ErrorDisplay
          error={error}
          onRetry={() =>
            currentUser?.principal && getUser(currentUser.principal)
          }
          variant="card"
        />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Profile Found
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't registered your profile yet.
          </p>
          <button
            onClick={() => {
              // Navigate to registration or show registration modal
              console.log('Navigate to registration');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">User Profile</h2>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              {userProfile.profile.avatar ? (
                <img
                  src={URL.createObjectURL(
                    new Blob([userProfile.profile.avatar])
                  )}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {userProfile.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {userProfile.username}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <p className="text-gray-900">
                    {userProfile.profile.displayName?.[0] || 'Not set'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">
                    {userProfile.email?.[0] || 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <p className="text-gray-900">
                    {userProfile.profile.location?.[0] || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <p className="text-gray-900">
                    {userProfile.profile.website?.[0] ? (
                      <a
                        href={userProfile.profile.website[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {userProfile.profile.website[0]}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {userProfile.profile.bio?.[0] || 'No bio available'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.profile.skills?.length > 0 ? (
                      userProfile.profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No skills listed
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repositories
                  </label>
                  <p className="text-2xl font-bold text-blue-600">
                    {userProfile.repositories?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {userProfile.profile.socialLinks?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Social Links
                </label>
                <div className="flex flex-wrap gap-3">
                  {userProfile.profile.socialLinks.map(
                    ([platform, url], index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                      >
                        {platform}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Member since:</span>
                  <br />
                  {new Date(
                    Number(userProfile.createdAt) / 1000000
                  ).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last updated:</span>
                  <br />
                  {new Date(
                    Number(userProfile.updatedAt) / 1000000
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={() => {
              // Open edit profile modal
              console.log('Edit profile clicked');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium"
          >
            Edit Profile
          </button>
          <button
            onClick={() =>
              currentUser?.principal && getUser(currentUser.principal)
            }
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
