import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

export const Category = ({
  isEditing = false,
  categories = [],
  onAddCategory,
  onRemoveCategory,
  readOnly = false // New prop to make it read-only
}) => {
  const navigate = useNavigate();

  const handleManageCategories = () => {
    navigate('/dashboard/categories'); // Navigate to category management page
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Categories</h3>
        {readOnly && (
          <button
            onClick={handleManageCategories}
            className="flex items-center gap-2 text-[#A61A5A] hover:text-[#8B1548] transition-colors"
            title="Manage Categories"
          >
            <Settings size={18} />
            <span className="text-sm">Manage</span>
          </button>
        )}
      </div>
      
      {/* Category Display */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category, index) => (
          <span
            key={category.id || index}
            className={`px-3 py-1 bg-[#A61A5A] text-white rounded-full text-sm flex items-center gap-1 ${
              readOnly ? 'cursor-default' : ''
            }`}
          >
            {category.name || category}
          </span>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-gray-500 text-center py-4">
          {readOnly 
            ? "No categories available. Use the manage button to add categories."
            : "No categories added yet."
          }
        </div>
      )}

      {/* Read-only message */}
      {readOnly && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border-l-4 border-[#A61A5A]">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Categories are managed from the Category Management section. 
            Click "Manage" above to add, edit, or remove categories.
          </p>
        </div>
      )}
    </div>
  );
};