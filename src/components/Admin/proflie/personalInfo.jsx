import React, { useState } from 'react';
import dayjs from "dayjs";
import { Mail, Phone, MapPin, Calendar, Smartphone, MessageCircle } from 'lucide-react';
import { validateEmail } from '../../../utils/validateEmail';
import { validatePhoneNumber } from '../../../utils/validatePhoneNumber';

export const PersonalInfo = ({ userData, isEditing, editData, onChangeHandler, handleEmailBlur, onValidationChange }) => {
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [whatsappError, setWhatsappError] = useState('');

  const handleEmailValidation = (e) => {
    const email = e.target.value;
    const isValid = validateEmail(email);
    
    if (email && !isValid) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
    
    // Make sure to update the Redux state with the current email value
    onChangeHandler({
      target: {
        name: 'email',
        value: email
      }
    });
    
    if (handleEmailBlur) {
      handleEmailBlur(e);
    }
    
    if (onValidationChange) {
      onValidationChange('email', isValid);
    }
  };

  const handlePhoneValidation = (e) => {
    const phone = e.target.value;
    const validation = validatePhoneNumber(phone);
    
    if (phone && !validation.isValid) {
      setPhoneError(validation.error);
    } else {
      setPhoneError('');
    }
    
    // Update the phone field with formatted version if valid
    if (validation.isValid) {
      onChangeHandler({
        target: {
          name: 'phone',
          value: validation.local // Use local format (0801234567)
        }
      });
    }
    
    // Notify parent about validation status
    if (onValidationChange) {
      onValidationChange('phone', validation.isValid);
    }
  };

  const handleMobileValidation = (e) => {
    const mobile = e.target.value;
    const validation = validatePhoneNumber(mobile);
    
    if (mobile && !validation.isValid) {
      setMobileError(validation.error);
    } else {
      setMobileError('');
    }
    
    // Update the mobile field with formatted version if valid
    if (validation.isValid) {
      onChangeHandler({
        target: {
          name: 'mobile',
          value: validation.local // Use local format (0801234567)
        }
      });
    }
    
    // Notify parent about validation status
    if (onValidationChange) {
      onValidationChange('mobile', validation.isValid);
    }
  };

  const handleWhatsappValidation = (e) => {
    const whatsapp = e.target.value;
    const validation = validatePhoneNumber(whatsapp);
    
    if (whatsapp && !validation.isValid) {
      setWhatsappError(validation.error);
    } else {
      setWhatsappError('');
    }
    
    // Update the whatsapp field with formatted version if valid
    if (validation.isValid) {
      onChangeHandler({
        target: {
          name: 'whatsapp',
          value: validation.local // Use local format (0801234567)
        }
      });
    }
    
    // Notify parent about validation status
    if (onValidationChange) {
      onValidationChange('whatsapp', validation.isValid);
    }
  };

  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-3 mb-3">
        <Mail className="text-gray-400" size={18} />
        {isEditing ? (
          <div className="w-full">
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={onChangeHandler}
              onBlur={handleEmailValidation}
              className={`w-full p-2 border rounded-md ${emailError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your email"
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-700">{userData.email}</p>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Phone className="text-gray-400" size={18} />
        {isEditing ? (
          <div className="w-full">
            <input
              type="text"
              name="phone"
              value={editData.phone}
              onChange={onChangeHandler}
              onBlur={handlePhoneValidation}
              className={`w-full p-2 border rounded-md ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your phone number"
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-700">{userData.phone}</p>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Smartphone className="text-gray-400" size={18} />
        {isEditing ? (
          <div className="w-full">
            <input
              type="text"
              name="mobile"
              value={editData.mobile}
              onChange={onChangeHandler}
              onBlur={handleMobileValidation}
              className={`w-full p-2 border rounded-md ${mobileError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your mobile number"
            />
            {mobileError && (
              <p className="text-red-500 text-sm mt-1">{mobileError}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-700">{userData.mobile}</p>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <MessageCircle className="text-gray-400" size={18} />
        {isEditing ? (
          <div className="w-full">
            <input
              type="text"
              name="whatsapp"
              value={editData.whatsapp}
              onChange={onChangeHandler}
              onBlur={handleWhatsappValidation}
              className={`w-full p-2 border rounded-md ${whatsappError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your WhatsApp number"
            />
            {whatsappError && (
              <p className="text-red-500 text-sm mt-1">{whatsappError}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-700">{userData.whatsapp}</p>
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
            placeholder="Enter your location"
          />
        ) : (
          <p className="text-gray-700">{userData.location}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Calendar className="text-gray-400" size={18} />
        <p className="text-gray-700">Member since {dayjs(userData.joinDate).format("DD/MM/YYYY")}</p>
      </div>
    </div>
  );
};