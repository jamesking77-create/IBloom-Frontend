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
  Menu,
  Grid,
  List,
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

  // View state for mobile
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Form states - Updated to handle files properly
  const [categoryForm, setCategoryForm] = useState({
    id: "",
    name: "",
    description: "",
    itemCount: "",
    image: "",
    imageFile: null,
    imagePreview: "",
    hasQuotes: false,
  });
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    imageFile: null,
    imagePreview: "",
  });

  const categoryFileRef = useRef(null);
  const itemFileRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Update selectedCategory when categories change
  useEffect(() => {
    if (selectedCategory && filteredCategories.length > 0) {
      const updatedCategory = filteredCategories.find(cat => cat.id === selectedCategory.id);
      if (updatedCategory && JSON.stringify(updatedCategory) !== JSON.stringify(selectedCategory)) {
        dispatch(setSelectedCategory(updatedCategory));
      }
    }
  }, [filteredCategories, selectedCategory, dispatch]);

  // Handle category form
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        id: categoryForm.id,
        name: categoryForm.name,
        description: categoryForm.description,
        itemCount: categoryForm.itemCount,
        hasQuotes: categoryForm.hasQuotes,
      };

      if (categoryForm.imageFile) {
        submitData.image = categoryForm.imageFile;
      } else if (categoryForm.image && !categoryForm.image.startsWith('blob:')) {
        submitData.image = categoryForm.image;
      }

      if (editingCategory) {
        await dispatch(
          updateCategory({ id: editingCategory.id, categoryData: submitData })
        );
      } else {
        await dispatch(createCategory(submitData));
      }
      
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

  // Handle item form
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        name: itemForm.name,
        description: itemForm.description,
        price: itemForm.price,
      };

      if (itemForm.imageFile) {
        submitData.image = itemForm.imageFile;
      } else if (itemForm.image && !itemForm.image.startsWith('blob:')) {
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
      
      if (result.type.endsWith('/fulfilled')) {
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
      await dispatch(
        deleteItem({
          categoryId: selectedCategory.id,
          itemId: itemId,
        })
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Handle file change
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

  // Open edit modals
  const openEditCategory = (category) => {
    dispatch(setEditingCategory(category));
    setCategoryForm({
      id: category.id,
      name: category.name,
      itemCount: category.itemCount,
      description: category.description,
      image: category.image,
      imageFile: null,
      imagePreview: category.image,
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
      imagePreview: item.image,
    });
    dispatch(openModal("itemModal"));
  };

  const openViewItems = (category) => {
    dispatch(setSelectedCategory(category));
    dispatch(openModal("itemsViewModal"));
  };

  // Modal close handlers
  const handleCloseCategoryModal = () => {
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

  // Render category card
  const CategoryCard = ({ category }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-40 sm:h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => openEditCategory(category)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <Edit className="w-3.5 h-3.5 text-gray-700" />
          </button>
          <button
            onClick={() => handleDeleteCategory(category.id, category.name)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-1">
          {category.name}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
          {category.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-gray-500">
              {category.itemCount} {category.itemCount === 1 ? "item" : "items"}
            </span>
            {category.hasQuotes && (
              <span className="text-xs text-green-600 font-medium">
                Has Quotes
              </span>
            )}
          </div>
          <button
            onClick={() => openViewItems(category)}
            className="px-2 sm:px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 text-xs sm:text-sm"
          >
            <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
            <span className="hidden sm:inline">View Items</span>
            <span className="sm:hidden">View</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Render category list item
  const CategoryListItem = ({ category }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4">
      <img
        src={category.image}
        alt={category.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{category.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{category.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{category.itemCount} items</span>
          {category.hasQuotes && <span className="text-green-600 font-medium">Has Quotes</span>}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
        <button
          onClick={() => openViewItems(category)}
          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => openEditCategory(category)}
          className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteCategory(category.id, category.name)}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Categories
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage your product categories and items
              </p>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop view controls */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => dispatch(openModal("categoryModal"))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Add Category</span>
                <span className="md:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filters overlay */}
      {showMobileFilters && (
        <div className="sm:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowMobileFilters(false)}>
          <div className="bg-white w-80 max-w-[85vw] h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Filters & Actions</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => dispatch(setFilterBy(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="hasItems">With Items</option>
                <option value="noItems">Empty Categories</option>
              </select>

              {/* View mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                </div>
              </div>

              {/* Add category button */}
              <button
                onClick={() => {
                  dispatch(openModal("categoryModal"));
                  setShowMobileFilters(false);
                }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Search and Filter Bar */}
      <div className="hidden sm:block bg-white shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between max-w-7xl mx-auto">
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

          <select
            value={filterBy}
            onChange={(e) => dispatch(setFilterBy(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="hasItems">With Items</option>
            <option value="noItems">Empty Categories</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 sm:mx-6 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Categories Grid/List */}
        {isLoading ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
              : 'space-y-4'
          }`}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
              >
                <div className="w-full h-32 sm:h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => dispatch(openModal("categoryModal"))}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
              : 'space-y-4'
          }`}>
            {filteredCategories.map((category) => (
              viewMode === 'grid' ? (
                <CategoryCard key={category.id} category={category} />
              ) : (
                <CategoryListItem key={category.id} category={category} />
              )
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {modals.categoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={handleCloseCategoryModal}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter unique category ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Describe your category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <div className="space-y-3">
                    {(categoryForm.imagePreview || categoryForm.image) && (
                      <div className="relative inline-block">
                        <img
                          src={categoryForm.imagePreview || categoryForm.image}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => categoryFileRef.current.click()}
                      className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
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

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {selectedCategory.name} Items
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedCategory.items?.length || 0} items
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch(openModal("itemModal"))}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Item</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                  <button
                    onClick={handleCloseItemsViewModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {!selectedCategory.items || selectedCategory.items.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No items yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add your first item to this category
                  </p>
                  <button
                    onClick={() => dispatch(openModal("itemModal"))}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {selectedCategory.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 sm:h-40 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => openEditItem(item)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingItem ? "Edit Item" : "Add New Item"}
                </h2>
                <button
                  onClick={handleCloseItemModal}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleItemSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Describe your item"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Image
                  </label>
                  <div className="space-y-3">
                    {(itemForm.imagePreview || itemForm.image) && (
                      <div className="relative inline-block">
                        <img
                          src={itemForm.imagePreview || itemForm.image}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => itemFileRef.current.click()}
                      className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
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

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseItemModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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