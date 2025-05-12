import React, { useState } from 'react';
import { X } from 'lucide-react';

export const Category = ({ 
  isEditing = false, 
  categories = [], 
  onAddCategory, 
  onRemoveCategory 
}) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    if (newCategory.trim() && onAddCategory) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
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
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Categories</h3>
      
      {/* Category Display */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-[#A61A5A] text-white rounded-full text-sm flex items-center gap-1"
          >
            {/* Assuming the category is an object with a 'name' property */}
            {category.name || category}
            {isEditing && (
              <button onClick={() => onRemoveCategory(index)}>
                <X size={14} />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Add Category Input */}
      {isEditing && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border p-2 rounded-md w-full"
            placeholder="Add Category"
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