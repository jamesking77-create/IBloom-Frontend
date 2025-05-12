import React, { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { notifySuccess } from '../../../utils/toastify';
import { AvatarUpload } from '../../../components/Admin/proflie/avatarUpload';
import { PersonalInfo } from '../../../components/Admin/proflie/personalInfo';
import { Specializations } from '../../../components/Admin/proflie/specializations';
import { Activity } from '../../../components/Admin/proflie/activity';
import { Category } from '../../../components/Admin/proflie/categoryManagement';


const initialUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, USA',
  joinDate: 'January 2023',
  avatar: '/api/placeholder/150/150',
  bio: 'Software developer with 5 years of experience in React and Node.js. Passionate about building user-friendly interfaces and solving complex problems.',
  specialize: ['Decor', 'Event Planning', 'Catering', 'Rental'],
  categories: [
    { name: 'Chairs' },
    { name: 'Tables' },
    { name: 'Lighting' }
  ]
};


export default function Profile({
  onProfileUpdate,
  profileData
}) {
  const [userData, setUserData] = useState(profileData || initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(userData);
  const [editCategoryData, setEditCategoryData] = useState(userData);

  useEffect(() => {
    if (profileData) {
      setUserData(profileData);
      setEditData(profileData);
    }
  }, [profileData]);

  useEffect(() => {
    if (onProfileUpdate) {
      onProfileUpdate(userData);
    }
  }, [userData, onProfileUpdate]);

  const handleEdit = () => {
    setEditData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
    if (onProfileUpdate) onProfileUpdate(editData);
    notifySuccess("Profile updated successfully!")
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(userData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (newAvatar) => {
    setEditData((prev) => ({
      ...prev,
      avatar: newAvatar,
    }));
  };

  const handleSpecializationAdd = (specialization) => {
    setEditData((prev) => ({
      ...prev,
      specialize: [...(prev.specialize || []), specialization],
    }));
  };

  const handleCategoryAdd = (newCategory) => {
    setEditData((prev) => ({
      ...prev,
      categories: [...(prev.categories || []), { name: newCategory }]
    }));
  };

  const handleSpecializationRemove = (index) => {
    setEditCategoryData((prev) => ({
      ...prev,
      specialize: prev.specialize.filter((_, i) => i !== index),
    }));
  };

  const handleCategoryRemove = (index) => {
    setEditData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-50 min-h-[100%]">
      {/* Left Side */}
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <AvatarUpload
            isEditing={isEditing}
            currentAvatar={userData.avatar}
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
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
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

        {/* In the editing section */}
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