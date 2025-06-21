import React from 'react';
import { Settings } from 'lucide-react';

export const CategoryManagement = ({ 
  categories, 
  onManageCategories 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Categories</h3>
        <button
          onClick={onManageCategories}
          className="flex items-center gap-2 text-[#468E36] hover:text-[#2C5D22] transition-colors"
          title="Manage Categories"
        >
          <Settings size={18} />
          <span className="text-sm">Manage</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories?.map((category, index) => (
          <span
            key={category.id || index}
            className="px-3 py-1 bg-[#468E36] text-white rounded-full text-sm cursor-default"
          >
            {category.name}
          </span>
        ))}
      </div>

      {(!categories || categories.length === 0) && (
        <div className="text-gray-500 text-center py-4">
          No categories available. Use the manage button to add categories.
        </div>
      )}

      {/* Read-only message */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md border-l-4 border-[#468E36]">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Categories are managed from the Category Management section. 
          Click "Manage" above to add, edit, or remove categories.
        </p>
      </div>
    </div>
  );
};