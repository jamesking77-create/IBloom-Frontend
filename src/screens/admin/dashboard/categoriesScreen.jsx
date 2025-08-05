import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Image as ImageIcon,
} from "lucide-react";
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
} from "../../../store/slices/categoriesSlice";

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
    editingItem,
  } = useSelector((state) => state.categories);

  // Form states - Updated to handle files properly
  const [categoryForm, setCategoryForm] = useState({
    id: "",
    name: "",
    description: "",
    itemCount: "",
    image: "",
    imageFile: null, // Store the actual file
    imagePreview: "", // Store the preview URL
    hasQuotes: false,
  });
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    imageFile: null, // Store the actual file
    imagePreview: "", // Store the preview URL
  });

  const categoryFileRef = useRef(null);
  const itemFileRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Update selectedCategory when categories change (after item operations)
  useEffect(() => {
    if (selectedCategory && filteredCategories.length > 0) {
      const updatedCategory = filteredCategories.find(cat => cat.id === selectedCategory.id);
      if (updatedCategory && JSON.stringify(updatedCategory) !== JSON.stringify(selectedCategory)) {
        dispatch(setSelectedCategory(updatedCategory));
      }
    }
  }, [filteredCategories, selectedCategory, dispatch]);

  // Handle category form - Updated to handle file uploads properly
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for submission
      const submitData = {
        id: categoryForm.id,
        name: categoryForm.name,
        description: categoryForm.description,
        itemCount: categoryForm.itemCount,
        hasQuotes: categoryForm.hasQuotes,
      };

      // If there's a new file, include it
      if (categoryForm.imageFile) {
        submitData.image = categoryForm.imageFile;
      } else if (categoryForm.image && !categoryForm.image.startsWith('blob:')) {
        // If there's an existing image URL (not a blob), keep it
        submitData.image = categoryForm.image;
      }

      if (editingCategory) {
        await dispatch(
          updateCategory({ id: editingCategory.id, categoryData: submitData })
        );
      } else {
        await dispatch(createCategory(submitData));
      }
      
      // Reset form
      setCategoryForm({ 
        id: "", 
        name: "", 
        description: "", 
        itemCount: "", 
        image: "", 
        imageFile: null,
        imagePreview: "",
        hasQuotes: false 
      });
      dispatch(closeModal("categoryModal"));
      dispatch(setEditingCategory(null));
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  // Handle item form - Updated to handle file uploads properly
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for submission
      const submitData = {
        name: itemForm.name,
        description: itemForm.description,
        price: itemForm.price,
      };

      // If there's a new file, include it
      if (itemForm.imageFile) {
        submitData.image = itemForm.imageFile;
      } else if (itemForm.image && !itemForm.image.startsWith('blob:')) {
        // If there's an existing image URL (not a blob), keep it
        submitData.image = itemForm.image;
      }

      let result;
      if (editingItem) {
        result = await dispatch(
          updateItem({
            categoryId: selectedCategory.id,
            itemId: editingItem.id,
            itemData: submitData,
          })
        );
      } else {
        result = await dispatch(
          createItem({
            categoryId: selectedCategory.id,
            itemData: submitData,
          })
        );
      }
      
      // Check if the operation was successful
      if (result.type.endsWith('/fulfilled')) {
        // Reset form and close modal
        setItemForm({ 
          name: "", 
          description: "", 
          price: "", 
          image: "",
          imageFile: null,
          imagePreview: ""
        });
        dispatch(closeModal("itemModal"));
        dispatch(setEditingItem(null));
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId, categoryName) => {
    try {
      await dispatch(deleteCategory(categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (itemId) => {
    try {
      const result = await dispatch(
        deleteItem({
          categoryId: selectedCategory.id,
          itemId: itemId,
        })
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Handle file change - Updated to store both file and preview
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const imagePreview = URL.createObjectURL(file);
      if (type === 'category') {
        setCategoryForm(prev => ({ 
          ...prev, 
          imageFile: file,
          imagePreview: imagePreview
        }));
      } else if (type === 'item') {
        setItemForm(prev => ({ 
          ...prev, 
          imageFile: file,
          imagePreview: imagePreview
        }));
      }
    }
  };

  // Open edit modals - Updated to handle image preview properly
  const openEditCategory = (category) => {
    dispatch(setEditingCategory(category));
    setCategoryForm({
      id: category.id,
      name: category.name,
      itemCount: category.itemCount,
      description: category.description,
      image: category.image,
      imageFile: null,
      imagePreview: category.image, // Use existing image for preview
      hasQuotes: category.hasQuotes || false,
    });
    dispatch(openModal("categoryModal"));
  };

  const openEditItem = (item) => {
    dispatch(setEditingItem(item));
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price || "",
      image: item.image,
      imageFile: null,
      imagePreview: item.image, // Use existing image for preview
    });
    dispatch(openModal("itemModal"));
  };

  const openViewItems = (category) => {
    dispatch(setSelectedCategory(category));
    dispatch(openModal("itemsViewModal"));
  };

  // Modal close handlers - Updated to clean up blob URLs
  const handleCloseCategoryModal = () => {
    // Clean up blob URL if it exists
    if (categoryForm.imagePreview && categoryForm.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(categoryForm.imagePreview);
    }
    dispatch(closeModal("categoryModal"));
    dispatch(setEditingCategory(null));
    setCategoryForm({ 
      id: "", 
      name: "", 
      description: "", 
      itemCount: "", 
      image: "",
      imageFile: null,
      imagePreview: "",
      hasQuotes: false
    });
  };

  const handleCloseItemModal = () => {
    // Clean up blob URL if it exists
    if (itemForm.imagePreview && itemForm.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(itemForm.imagePreview);
    }
    dispatch(closeModal("itemModal"));
    dispatch(setEditingItem(null));
    setItemForm({ 
      name: "", 
      description: "", 
      price: "", 
      image: "",
      imageFile: null,
      imagePreview: ""
    });
  };

  const handleCloseItemsViewModal = () => {
    dispatch(closeModal("itemsViewModal"));
    dispatch(setSelectedCategory(null));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Categories
        </h1>
        <p className="text-gray-600">
          Manage your product categories and items
        </p>
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
              onClick={() => dispatch(openModal("categoryModal"))}
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
          <button
            onClick={() => dispatch(clearError())}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
            >
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
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
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
                    onClick={() =>
                      handleDeleteCategory(category.id, category.name)
                    }
                    className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      {category.itemCount}{" "}
                      {category.itemCount === 1 ? "item" : "items"}
                    </span>
                    {category.hasQuotes && (
                      <span className="text-xs text-green-600 font-medium">
                        Has Quotes
                      </span>
                    )}
                  </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No categories found
          </h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Category Modal */}
      {modals.categoryModal && (
        <div className="fixed inset-0 bg-black/60  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={handleCloseCategoryModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category ID
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.id}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Items
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.itemCount}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        itemCount: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={categoryForm.hasQuotes}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          hasQuotes: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Has Quotes
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image
                  </label>
                  <div className="flex items-center gap-3">
                    {(categoryForm.imagePreview || categoryForm.image) && (
                      <img
                        src={categoryForm.imagePreview || categoryForm.image}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => categoryFileRef.current.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                    <input
                      ref={categoryFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "category")}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
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
                    {editingCategory ? "Update" : "Create"}
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
                  <h2 className="text-lg font-semibold">
                    {selectedCategory.name} Items
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedCategory.items?.length || 0} items
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch(openModal("itemModal"))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                  <button
                    onClick={handleCloseItemsViewModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!selectedCategory.items || selectedCategory.items.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No items yet
                  </h3>
                  <p className="text-gray-500">
                    Add your first item to this category
                  </p>
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
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {item.name}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      {item.price && (
                        <p className="text-blue-600 font-semibold">
                          ₦{item.price}
                        </p>
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
        <div className="fixed inset-0 bg-black/60  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingItem ? "Edit Item" : "Add New Item"}
                </h2>
                <button
                  onClick={handleCloseItemModal}
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
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, name: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 25,000"
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Image
                  </label>
                  <div className="flex items-center gap-3">
                    {(itemForm.imagePreview || itemForm.image) && (
                      <img
                        src={itemForm.imagePreview || itemForm.image}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => itemFileRef.current.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                    <input
                      ref={itemFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "item")}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseItemModal}
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
                    {editingItem ? "Update" : "Add Item"}
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