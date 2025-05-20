import React from 'react';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { validateEmail } from '../../../utils/validateEmail';


export const PersonalInfo = ({ userData, isEditing, editData, onChangeHandler, handleEmailBlur }) => {

 
  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-3 mb-3">
        <Mail className="text-gray-400" size={18} />
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={editData.email}
            onChange={onChangeHandler}
            onBlur={handleEmailBlur}
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
            onChange={onChangeHandler}
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
            onChange={onChangeHandler}
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
  );
};