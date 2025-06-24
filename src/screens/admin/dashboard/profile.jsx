import React, { useEffect, useState } from 'react';
import dayjs from "dayjs";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit, Save, X } from 'lucide-react';
import { notifySuccess } from '../../../utils/toastify';
import { AvatarUpload } from '../../../components/Admin/proflie/avatarUpload';
import { PersonalInfo } from '../../../components/Admin/proflie/personalInfo';
import { Specializations } from '../../../components/Admin/proflie/specializations';
import { CategoryManagement } from '../../../components/Admin/proflie/categoryManagement';
import { Activity } from '../../../components/Admin/proflie/activity';

import {
  setUserData,
  setEditData,
  setIsEditing,
  resetEditData,
  updateEditDataField,
  updateAvatar,
  addSpecialization,
  removeSpecialization,
  saveProfile,
  fetchProfile
} from '../../../store/slices/profile-slice';

import { fetchCategories } from '../../../store/slices/categoriesSlice';

export default function Profile({ onProfileUpdate, profileData }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  const {
    userData,
    editData,
    isEditing,
    loading,
    saving
  } = useSelector((state) => state.profile);

  const { categories } = useSelector((state) => state.categories);

  useEffect(() => {
    // Fetch profile and categories when component mounts
    dispatch(fetchProfile());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (profileData) {
      dispatch(setUserData(profileData));
      dispatch(setEditData(profileData));
    }
  }, [profileData, dispatch]);

  useEffect(() => {
    if (onProfileUpdate) {
      onProfileUpdate(userData);
    }
  }, [userData, onProfileUpdate]);

  const handleEdit = () => {
    dispatch(setEditData(userData));
    dispatch(setIsEditing(true));
    setSelectedAvatarFile(null); // Reset selected file when entering edit mode
  };

  const handleSave = async () => {
    try {
      // Pass the selected file to the saveProfile action
      await dispatch(saveProfile(selectedAvatarFile)).unwrap();
      notifySuccess("Profile updated successfully!");
      setSelectedAvatarFile(null); // Clear selected file after successful save
      if (onProfileUpdate) onProfileUpdate(editData);
    } catch (error) {
      console.error('Error saving profile:', error);
      // Error will be handled by the slice and shown in UI
    }
  };

  const handleCancel = () => {
    dispatch(resetEditData());
    dispatch(setIsEditing(false));
    setSelectedAvatarFile(null); // Clear selected file when canceling
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateEditDataField({ name, value }));
  };

  const handleAvatarChange = (fileOrUrl) => {
    if (fileOrUrl instanceof File) {
      // If it's a file, store it locally and update the preview
      setSelectedAvatarFile(fileOrUrl);
      // Don't update Redux state with the file, just update the preview
    } else {
      // If it's a URL or null, update Redux state
      dispatch(updateAvatar(fileOrUrl));
      setSelectedAvatarFile(null);
    }
  };

  const handleSpecializationAdd = (specialization) => {
    dispatch(addSpecialization(specialization));
  };

  const handleSpecializationRemove = (index) => {
    dispatch(removeSpecialization(index));
  };

  const handleManageCategories = () => {
    navigate('/dashboard/categories');
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-50 min-h-[100%] overflow-hidden">
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <AvatarUpload
            isEditing={isEditing}
            currentAvatar={isEditing ? editData.avatar : userData.avatar}
            onAvatarChange={handleAvatarChange}
          />

          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                className="border rounded-md p-2 w-full text-center"
              />
            ) : (
              userData.name
            )}
          </h2>

          {!isEditing && <p className="text-gray-500 mt-1">{userData.bio}</p>}

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#468E36] text-white rounded-md hover:bg-[#2C5D22] transition-colors"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <PersonalInfo
          userData={userData}
          isEditing={isEditing}
          editData={editData}
          onChangeHandler={handleChange}
        />
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">About Us</h3>
          {isEditing ? (
            <textarea
              name="bio"
              value={editData.bio}
              onChange={handleChange}
              className="w-full p-3 border rounded-md min-h-32"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-700">{userData.bio}</p>
          )}
        </div>

        <Specializations
          isEditing={isEditing}
          specialize={isEditing ? editData.specialize : userData.specialize}
          onAddSpecialization={handleSpecializationAdd}
          onRemoveSpecialization={handleSpecializationRemove}
        />

        <CategoryManagement
          categories={isEditing ? editData.categories : userData.categories}
          onManageCategories={handleManageCategories}
        />

        <Activity joinDate={dayjs(userData.joinDate).format("DD/MM/YYYY")} />
      </div>
    </div>
  );
}