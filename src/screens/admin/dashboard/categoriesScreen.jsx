import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  X,
  Upload,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createItem,
  updateItem,
  deleteItem,
  setSearchQuery,
  setFilterBy,
  setSelectedCategory,
  openModal,
  closeModal,
  setEditingCategory,
  setEditingItem,
  clearError,
  syncCategoryRemoval
} from '../../../store/slices/categoriesSlice';
import { removeCategory } from '../../../store/slices/profile-slice';

const CategoriesScreen = () => {
  const dispatch = useDispatch();
  const {
    filteredCategories,
    selectedCategory,
    searchQuery,
    filterBy,
    isLoading,
    error,
    modals,
    editingCategory,
    editingItem
  } = useSelector(state => state.categories);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle category form
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (editingCategory) {
      await dispatch(updateCategory({ id: editingCategory.id, categoryData: categoryForm }));
    } else {
      await dispatch(createCategory(categoryForm));
    }
    setCategoryForm({ name: '', description: '', image: '' });
  };

  // Handle item form
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (editingItem) {
      await dispatch(updateItem({
        categoryId: selectedCategory.id,
        itemId: editingItem.id,
        itemData: itemForm
      }));
    } else {
      await dispatch(createItem({
        categoryId: selectedCategory.id,
        itemData: itemForm
      }));
    }
    setItemForm({ name: '', description: '', price: '', image: '' });
  };

  // Handle category deletion with profile sync
  const handleDeleteCategory = async (categoryId, categoryName) => {
    await dispatch(deleteCategory(categoryId));
    // Also remove from profile
    dispatch(removeCategory(categoryId));
    dispatch(syncCategoryRemoval(categoryName));
  };

  // Handle file upload simulation
  const handleFileUpload = (type, field) => {
    // In a real app, this would handle actual file upload
    const mockImageUrl = `/api/placeholder/300/200?${Date.now()}`;
    if (type === 'category') {
      setCategoryForm(prev => ({ ...prev, [field]: mockImageUrl }));
    } else {
      setItemForm(prev => ({ ...prev, [field]: mockImageUrl }));
    }
  };

  // Open edit modals
  const openEditCategory = (category) => {
    dispatch(setEditingCategory(category));
    setCategoryForm({
      name: category.name,
      description: category.description,
      image: category.image
    });
    dispatch(openModal('categoryModal'));
  };

  const openEditItem = (item) => {
    dispatch(setEditingItem(item));
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price || '',
      image: item.image
    });
    dispatch(openModal('itemModal'));
  };

  const openViewItems = (category) => {
    dispatch(setSelectedCategory(category));
    dispatch(openModal('itemsViewModal'));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-600">Manage your product categories and items</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterBy}
              onChange={(e) => dispatch(setFilterBy(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="hasItems">With Items</option>
              <option value="noItems">Empty Categories</option>
            </select>
            
            <button
              onClick={() => dispatch(openModal('categoryModal'))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button onClick={() => dispatch(clearError())} className="ml-2 text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => openEditCategory(category)}
                    className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{category.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <button
                    onClick={() => openViewItems(category)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Items
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCategories.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No categories found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Category Modal */}
      {modals.categoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={() => dispatch(closeModal('categoryModal'))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image
                  </label>
                  <div className="flex items-center gap-3">
                    {categoryForm.image && (
                      <img src={categoryForm.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleFileUpload('category', 'image')}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => dispatch(closeModal('categoryModal'))}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Items View Modal */}
      {modals.itemsViewModal && selectedCategory && (
        <div className="fixed inset-0  bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedCategory.name} Items</h2>
                  <p className="text-gray-600 text-sm">{selectedCategory.items.length} items</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch(openModal('itemModal'))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                  <button
                    onClick={() => dispatch(closeModal('itemsViewModal'))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedCategory.items.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No items yet</h3>
                  <p className="text-gray-500">Add your first item to this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCategory.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="relative mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => openEditItem(item)}
                            className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100"
                          >
                            <Edit className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => dispatch(deleteItem({ categoryId: selectedCategory.id, itemId: item.id }))}
                            className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                      {item.price && (
                        <p className="text-blue-600 font-semibold">{item.price}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {modals.itemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={() => dispatch(closeModal('itemModal'))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={itemForm.description}
                    onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $25.00"
                    value={itemForm.price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Image
                  </label>
                  <div className="flex items-center gap-3">
                    {itemForm.image && (
                      <img src={itemForm.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleFileUpload('item', 'image')}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => dispatch(closeModal('itemModal'))}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingItem ? 'Update' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesScreen;