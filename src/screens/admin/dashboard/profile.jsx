import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit, Save, X } from 'lucide-react';
import { notifySuccess } from '../../../utils/toastify';
import { AvatarUpload } from '../../../components/Admin/proflie/avatarUpload';
import { PersonalInfo } from '../../../components/Admin/proflie/personalInfo';
import { Specializations } from '../../../components/Admin/proflie/specializations';
import { Activity } from '../../../components/Admin/proflie/activity';
import { Category } from '../../../components/Admin/proflie/categoryManagement';

import {
  setUserData,
  setEditData,
  setIsEditing,
  resetEditData,
  updateEditDataField,
  updateAvatar,
  addSpecialization,
  removeSpecialization,
  addCategory,
  removeCategory,
  saveProfile // This is now the async thunk, not the local action
} from '../../../store/slices/profile-slice';

export default function Profile({ onProfileUpdate, profileData }) {
  const dispatch = useDispatch();

  const {
    userData,
    editData,
    isEditing,
    loading
  } = useSelector((state) => state.profile);

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
  };

  const handleSave = async () => {
    await dispatch(saveProfile());
    notifySuccess("Profile updated successfully!");
    if (onProfileUpdate) onProfileUpdate(editData);
  };

  const handleCancel = () => {
    dispatch(resetEditData());
    dispatch(setIsEditing(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateEditDataField({ name, value }));
  };

  const handleAvatarChange = (newAvatar) => {
    dispatch(updateAvatar(newAvatar));
  };

  const handleSpecializationAdd = (specialization) => {
    dispatch(addSpecialization(specialization));
  };

  const handleSpecializationRemove = (index) => {
    dispatch(removeSpecialization(index));
  };

  const handleCategoryAdd = (newCategory) => {
    dispatch(addCategory(newCategory));
  };

  const handleCategoryRemove = (index) => {
    dispatch(removeCategory(index));
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
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
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

        {!isEditing && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {userData.categories?.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#468E36] text-white rounded-full text-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {isEditing && (
          <Category
            isEditing={isEditing}
            categories={editData.categories}
            onAddCategory={handleCategoryAdd}
            onRemoveCategory={handleCategoryRemove}
          />
        )}

        <Activity joinDate={userData.joinDate} />
      </div>
    </div>
  );
}