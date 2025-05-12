import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';


export const AvatarUpload = ({ isEditing, currentAvatar, onAvatarChange }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setAvatarPreview(result);
        onAvatarChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative mb-4">
      <div
        className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 cursor-pointer"
        onClick={handleAvatarClick}
      >
        <img
          src={avatarPreview || currentAvatar}
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
          <p className="text-white text-sm">Change Photo</p>
        </div>
      )}
    </div>
  );
};