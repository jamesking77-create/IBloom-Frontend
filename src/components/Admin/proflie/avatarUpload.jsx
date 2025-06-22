import React, { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import avatarpreview from "../../../assets/androgynous-avatar-non-binary-queer-person.png";

export const AvatarUpload = ({ isEditing, currentAvatar, onAvatarChange }) => {
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size and type
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPEG, PNG, GIF, and WebP images are allowed');
        return;
      }

      // Store file in local state (not Redux to avoid serialization issues)
      setSelectedFile(file);

      // Create preview for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setAvatarPreview(result);
        // Pass the file object to parent component
        onAvatarChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveAvatar = (e) => {
    e.stopPropagation();
    setAvatarPreview(null);
    setSelectedFile(null);
    onAvatarChange(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine what avatar to display
  const getDisplayAvatar = () => {
    if (avatarPreview) return avatarPreview;
    if (currentAvatar?.url) return currentAvatar.url;
    if (currentAvatar && typeof currentAvatar === 'string') return currentAvatar;
    return null;
  };

  const displayAvatar = getDisplayAvatar();

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={handleAvatarClick}
        className={`
          h-40 w-40 rounded-full overflow-hidden border-2 relative
          ${isEditing ? 'cursor-pointer border-[#468E36] hover:opacity-90' : 'border-gray-200'}
        `}
      >
        {displayAvatar ? (
          <img 
            src={displayAvatar}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <Camera size={32} className="text-gray-400" />
          </div>
        )}
        
        {isEditing && displayAvatar && (
          <div 
            className="absolute top-0 right-0 p-1 bg-red-500 rounded-full cursor-pointer"
            onClick={handleRemoveAvatar}
          >
            <X size={16} className="text-white" />
          </div>
        )}
        
        {isEditing && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium">Change Photo</span>
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {isEditing && (
        <button 
          onClick={handleAvatarClick}
          className="mt-2 text-sm text-[#468E36] font-medium"
        >
          Change Photo
        </button>
      )}
    </div>
  );
};

export default AvatarUpload;