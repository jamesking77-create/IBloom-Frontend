import { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
} from 'lucide-react';

const initialUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, USA',
  joinDate: 'January 2023',
  avatar: '/api/placeholder/150/150',
  bio: 'Software developer with 5 years of experience in React and Node.js. Passionate about building user-friendly interfaces and solving complex problems.',
  specialize: ['Decor', 'Event Planning', 'Catering', 'Rental'],
};

export default function Profile({ onProfileUpdate, profileData }) {
  const [userData, setUserData] = useState(profileData || initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(userData);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [newSpecialization, setNewSpecialization] = useState('');
  const fileInputRef = useRef(null);

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
    setAvatarPreview(null);
  };

  const handleSave = () => {
    const updatedData = {
      ...editData,
      avatar: avatarPreview || editData.avatar,
    };
    setUserData(updatedData);
    setIsEditing(false);
    setAvatarPreview(null);
    if (onProfileUpdate) onProfileUpdate(updatedData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpecializationAdd = () => {
    if (newSpecialization.trim()) {
      setEditData((prev) => ({
        ...prev,
        specialize: [...(prev.specialize || []), newSpecialization.trim()],
      }));
      setNewSpecialization('');
    }
  };

  const handleSpecializationRemove = (index) => {
    setEditData((prev) => ({
      ...prev,
      specialize: prev.specialize.filter((_, i) => i !== index),
    }));
  };

  const handleSpecializationKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSpecializationAdd();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-50 min-h-[100%]">
      {/* Left Side */}
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 cursor-pointer"
              onClick={handleAvatarClick}
            >
              <img
                src={avatarPreview || userData.avatar}
                alt="Profile avatar"
                className="w-full h-full object-cover"
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {isEditing && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full cursor-pointer"
                onClick={handleAvatarClick}
              >
                <Camera size={32} className="text-white" />
              </div>
            )}
          </div>

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

        <div className="border-t pt-4">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="text-gray-400" size={18} />
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <p className="text-gray-700">{userData.email}</p>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Phone className="text-gray-400" size={18} />
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={editData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <p className="text-gray-700">{userData.phone}</p>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <MapPin className="text-gray-400" size={18} />
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={editData.location}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <p className="text-gray-700">{userData.location}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="text-gray-400" size={18} />
            <p className="text-gray-700">Member since {userData.joinDate}</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* About Us */}
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

        {/* Specializations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">We Specialize In:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(isEditing ? editData.specialize : userData.specialize)?.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#A61A5A] text-white rounded-full text-sm flex items-center gap-1"
              >
                {item}
                {isEditing && (
                  <button onClick={() => handleSpecializationRemove(index)}>
                    <X size={14} />
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyDown={handleSpecializationKeyDown}
                className="border p-2 rounded-md w-full"
                placeholder="Add specialization"
              />
              <button
                onClick={handleSpecializationAdd}
                className="bg-[#A61A5A] text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Profile updated</p>
                <p className="text-sm text-gray-500">3 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Completed project "Dashboard Redesign"</p>
                <p className="text-sm text-gray-500">1 week ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Joined the platform</p>
                <p className="text-sm text-gray-500">{userData.joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
