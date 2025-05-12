import React, { useState } from 'react';
import { X } from 'lucide-react';


export const Specializations = ({ 
  isEditing, 
  specialize, 
  onAddSpecialization, 
  onRemoveSpecialization 
}) => {
  const [newSpecialization, setNewSpecialization] = useState('');

  const handleAdd = () => {
    if (newSpecialization.trim() && onAddSpecialization) {
      onAddSpecialization(newSpecialization.trim());
      setNewSpecialization('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">We Specialize In:</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {specialize?.map((item, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-[#A61A5A] text-white rounded-full text-sm flex items-center gap-1"
          >
            {item}
            {isEditing && onRemoveSpecialization && (
              <button onClick={() => onRemoveSpecialization(index)}>
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
            onKeyDown={handleKeyDown}
            className="border p-2 rounded-md w-full"
            placeholder="Add specialization"
          />
          <button
            onClick={handleAdd}
            className="bg-[#A61A5A] text-white px-4 py-2 rounded-md"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};