import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  FolderPlus,
  Package,
  Palette,
  Ruler,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  createItem,
  updateItem,
  deleteItem,
  setSearchQuery,
  setFilterBy,
  setSelectedCategory,
  setSelectedSubCategory,
  openModal,
  closeModal,
  setEditingCategory,
  setEditingSubCategory,
  setEditingItem,
  clearError,
} from "../../../store/slices/categoriesSlice";
import ConfirmationModal from "../../../UI/confirmationModal";

// Tag component for colors/sizes - Memoized to prevent re-renders
const TagComponent = React.memo(
  ({
    items,
    onRemove,
    placeholder,
    inputValue,
    onInputChange,
    onAdd,
    icon: Icon,
  }) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), onAdd())
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
);

// Multiple Image Upload Component
const MultipleImageUpload = React.memo(
  ({ images, onImagesChange, maxImages = 3 }) => {
    const fileRefs = useRef([]);

    const handleFileChange = (index, file) => {
      if (file) {
        const newImages = { ...images };
        const imageKey = `image${index + 1}`;
        newImages[imageKey] = file;
        newImages[`${imageKey}Preview`] = URL.createObjectURL(file);
        onImagesChange(newImages);
      }
    };

    const removeImage = (index) => {
      const newImages = { ...images };
      const imageKey = `image${index + 1}`;
      const previewKey = `${imageKey}Preview`;

      // Revoke object URL to prevent memory leaks
      if (newImages[previewKey] && newImages[previewKey].startsWith("blob:")) {
        URL.revokeObjectURL(newImages[previewKey]);
      }

      delete newImages[imageKey];
      delete newImages[previewKey];
      onImagesChange(newImages);
    };

    const getImagePreview = (index) => {
      const imageKey = `image${index + 1}`;
      const previewKey = `${imageKey}Preview`;
      return images[previewKey] || images[imageKey];
    };

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: maxImages }).map((_, index) => {
            const hasImage = getImagePreview(index);

            return (
              <div key={index} className="relative">
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition-colors">
                  {hasImage ? (
                    <>
                      <img
                        src={hasImage}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRefs.current[index]?.click()}
                      className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs">Add Image</span>
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => (fileRefs.current[index] = el)}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                  className="hidden"
                />
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500">
          You can upload up to {maxImages} images. Images will be displayed in
          the order uploaded.
        </p>
      </div>
    );
  }
);

// Category card component - Memoized to prevent unnecessary re-renders
const CategoryCard = React.memo(
  ({ category, onEdit, onDelete, onViewItems, onViewSubCategories }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-40 sm:h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <Edit className="w-3.5 h-3.5 text-gray-700" />
          </button>
          <button
            onClick={() => onDelete(category.id, category.name)}
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

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span>
              {category.itemCount} {category.itemCount === 1 ? "item" : "items"}
            </span>
            {category.hasQuotes && (
              <span className="text-green-600 font-medium">Has Quotes</span>
            )}
          </div>

          {category.colors && category.colors.length > 0 && (
            <div className="flex items-center gap-1">
              <Palette className="w-3 h-3 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {category.colors.slice(0, 3).map((color, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 px-1 rounded"
                  >
                    {color}
                  </span>
                ))}
                {category.colors.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{category.colors.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {category.sizes && category.sizes.length > 0 && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {category.sizes.slice(0, 3).map((size, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 px-1 rounded"
                  >
                    {size}
                  </span>
                ))}
                {category.sizes.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{category.sizes.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onViewItems(category)}
              className="flex-1 px-2 sm:px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm"
            >
              <Package className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden sm:inline">Items</span>
            </button>
            <button
              onClick={() => onViewSubCategories(category)}
              className="flex-1 px-2 sm:px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm"
            >
              <FolderPlus className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden sm:inline">Subs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

// Category list item component - Memoized
const CategoryListItem = React.memo(
  ({ category, onEdit, onDelete, onViewItems, onViewSubCategories }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4">
      <img
        src={category.image}
        alt={category.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">
          {category.name}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
          {category.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{category.itemCount} items</span>
          {category.hasQuotes && (
            <span className="text-green-600 font-medium">Has Quotes</span>
          )}
          {category.colors && category.colors.length > 0 && (
            <span className="flex items-center gap-1">
              <Palette className="w-3 h-3" />
              {category.colors.length}
            </span>
          )}
          {category.sizes && category.sizes.length > 0 && (
            <span className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              {category.sizes.length}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
        <button
          onClick={() => onViewItems(category)}
          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Package className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewSubCategories(category)}
          className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(category)}
          className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(category.id, category.name)}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
);

const CategoriesScreen = () => {
  const dispatch = useDispatch();
  const {
    filteredCategories,
    selectedCategory,
    selectedSubCategory,
    searchQuery,
    filterBy,
    isLoading,
    error,
    modals,
    editingCategory,
    editingSubCategory,
    editingItem,
    loading,
  } = useSelector((state) => state.categories);

  // ==================== STATE MANAGEMENT ====================
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    id: null,
    name: "",
    onConfirm: null,
  });

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
    imageFile: null,
    imagePreview: "",
    hasQuotes: false,
    colors: [],
    sizes: [],
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
    imageFile: null,
    imagePreview: "",
    colors: [],
    sizes: [],
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    images: {},
    imagePreviews: {},
    colors: [],
    sizes: [],
    outOfStock: false,
  });

  // Input states for dynamic arrays
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [itemColorInput, setItemColorInput] = useState("");
  const [itemSizeInput, setItemSizeInput] = useState("");
  const [subCatColorInput, setSubCatColorInput] = useState("");
  const [subCatSizeInput, setSubCatSizeInput] = useState("");

  // Refs
  const categoryFileRef = useRef(null);
  const subCategoryFileRef = useRef(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory && filteredCategories.length > 0) {
      const updatedCategory = filteredCategories.find(
        (cat) => cat.id === selectedCategory.id
      );
      if (
        updatedCategory &&
        JSON.stringify(updatedCategory) !== JSON.stringify(selectedCategory)
      ) {
        dispatch(setSelectedCategory(updatedCategory));
      }
    }
  }, [filteredCategories, selectedCategory, dispatch]);

  // ==================== MEMOIZED HANDLERS ====================
  // Category handlers
  const handleCategoryEdit = useCallback(
    (category) => {
      dispatch(setEditingCategory(category));
      setCategoryForm({
        name: category.name,
        description: category.description,
        image: category.image,
        imageFile: null,
        imagePreview: category.image,
        hasQuotes: category.hasQuotes || false,
        colors: category.colors || [],
        sizes: category.sizes || [],
      });
      dispatch(openModal("categoryModal"));
    },
    [dispatch]
  );

  const handleCategoryDelete = useCallback(
    (categoryId, categoryName) => {
      setConfirmModal({
        isOpen: true,
        type: "category",
        id: categoryId,
        name: categoryName,
        onConfirm: async () => {
          try {
            await dispatch(deleteCategory(categoryId));
            setConfirmModal({
              isOpen: false,
              type: "",
              id: null,
              name: "",
              onConfirm: null,
            });
          } catch (error) {
            console.error("Error deleting category:", error);
          }
        },
      });
    },
    [dispatch]
  );

  const handleViewItems = useCallback(
    (category) => {
      dispatch(setSelectedCategory(category));
      dispatch(setSelectedSubCategory(null));
      dispatch(openModal("itemsViewModal"));
    },
    [dispatch]
  );

  const handleViewSubCategories = useCallback(
    (category) => {
      dispatch(setSelectedCategory(category));
      dispatch(openModal("subCategoriesViewModal"));
    },
    [dispatch]
  );

  // SubCategory handlers
  const handleSubCategoryEdit = useCallback(
    (subCategory) => {
      dispatch(setEditingSubCategory(subCategory));
      setSubCategoryForm({
        name: subCategory.name,
        description: subCategory.description,
        image: subCategory.image,
        imageFile: null,
        imagePreview: subCategory.image,
        colors: subCategory.colors || [],
        sizes: subCategory.sizes || [],
      });
      dispatch(openModal("subCategoryModal"));
    },
    [dispatch]
  );

  const handleSubCategoryDelete = useCallback(
    (subCategoryId, subCategoryName) => {
      setConfirmModal({
        isOpen: true,
        type: "subcategory",
        id: subCategoryId,
        name: subCategoryName,
        onConfirm: async () => {
          try {
            await dispatch(
              deleteSubCategory({
                categoryId: selectedCategory.id,
                subCategoryId: subCategoryId,
              })
            );
            setConfirmModal({
              isOpen: false,
              type: "",
              id: null,
              name: "",
              onConfirm: null,
            });
          } catch (error) {
            console.error("Error deleting subcategory:", error);
          }
        },
      });
    },
    [dispatch, selectedCategory]
  );

  const handleViewSubCategoryItems = useCallback(
    (subCategory) => {
      dispatch(setSelectedSubCategory(subCategory));
      dispatch(openModal("itemsViewModal"));
    },
    [dispatch]
  );

  // Enhanced handleItemEdit function that supports both old and new image structures
  const handleItemEdit = useCallback(
    (item) => {
      dispatch(setEditingItem(item));

      // Enhanced image data preparation for editing - handles ALL image structures
      const images = {};

      // Priority 1: Handle new structure (item.images object)
      if (item.images && typeof item.images === "object") {
        if (item.images.image1) {
          images.image1 = item.images.image1;
          images.image1Preview = item.images.image1;
        }
        if (item.images.image2) {
          images.image2 = item.images.image2;
          images.image2Preview = item.images.image2;
        }
        if (item.images.image3) {
          images.image3 = item.images.image3;
          images.image3Preview = item.images.image3;
        }
      }

      // Priority 2: Handle old structure (direct image1, image2, image3 fields)
      // Only add if not already present from images object
      if (item.image1 && !images.image1) {
        images.image1 = item.image1;
        images.image1Preview = item.image1;
      }
      if (item.image2 && !images.image2) {
        images.image2 = item.image2;
        images.image2Preview = item.image2;
      }
      if (item.image3 && !images.image3) {
        images.image3 = item.image3;
        images.image3Preview = item.image3;
      }

      // Priority 3: Handle single image field (legacy support)
      // Only add as image1 if no other images exist
      if (item.image && Object.keys(images).length === 0) {
        images.image1 = item.image;
        images.image1Preview = item.image;
      }

      // Priority 4: Handle array structure (item.images as array)
      if (item.images && Array.isArray(item.images)) {
        item.images.forEach((img, index) => {
          if (img && index < 3) {
            // Limit to 3 images
            const imageKey = `image${index + 1}`;
            const previewKey = `${imageKey}Preview`;
            if (!images[imageKey]) {
              // Don't overwrite if already set
              images[imageKey] = img;
              images[previewKey] = img;
            }
          }
        });
      }

      console.log("Edit item images prepared:", {
        originalItem: {
          name: item.name,
          hasImages: !!item.images,
          hasImage: !!item.image,
          hasImage1: !!item.image1,
          hasImage2: !!item.image2,
          hasImage3: !!item.image3,
        },
        preparedImages: Object.keys(images),
        imagesCount: Object.keys(images).filter(
          (key) => !key.includes("Preview")
        ).length,
      });

      setItemForm({
        name: item.name,
        description: item.description,
        price: item.price || "",
        images: images, // This will now contain properly structured image data
        colors: item.colors || [],
        sizes: item.sizes || [],
        outOfStock: item.outOfStock || false,
      });
      dispatch(openModal("itemModal"));
    },
    [dispatch]
  );

  // Enhanced MultipleImageUpload Component with better existing image handling
  const MultipleImageUpload = React.memo(
    ({ images, onImagesChange, maxImages = 3 }) => {
      const fileRefs = useRef([]);

      const handleFileChange = (index, file) => {
        if (file) {
          const newImages = { ...images };
          const imageKey = `image${index + 1}`;
          const previewKey = `${imageKey}Preview`;

          // Clean up old blob URL if it exists
          if (
            newImages[previewKey] &&
            newImages[previewKey].startsWith("blob:")
          ) {
            URL.revokeObjectURL(newImages[previewKey]);
          }

          newImages[imageKey] = file;
          newImages[previewKey] = URL.createObjectURL(file);
          onImagesChange(newImages);
        }
      };

      const removeImage = (index) => {
        const newImages = { ...images };
        const imageKey = `image${index + 1}`;
        const previewKey = `${imageKey}Preview`;

        // Revoke object URL to prevent memory leaks (only for blob URLs)
        if (
          newImages[previewKey] &&
          newImages[previewKey].startsWith("blob:")
        ) {
          URL.revokeObjectURL(newImages[previewKey]);
        }

        delete newImages[imageKey];
        delete newImages[previewKey];
        onImagesChange(newImages);
      };

      const getImagePreview = (index) => {
        const imageKey = `image${index + 1}`;
        const previewKey = `${imageKey}Preview`;

        // Return preview first (for new uploads), then fallback to original image (for existing)
        return images[previewKey] || images[imageKey];
      };

      const hasImage = (index) => {
        const imageKey = `image${index + 1}`;
        const previewKey = `${imageKey}Preview`;
        return !!(images[imageKey] || images[previewKey]);
      };

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: maxImages }).map((_, index) => {
              const imagePreview = getImagePreview(index);
              const imageExists = hasImage(index);

              return (
                <div key={index} className="relative">
                  <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition-colors">
                    {imageExists && imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(
                              `Failed to load image ${index + 1}:`,
                              imagePreview
                            );
                            // Fallback to placeholder or remove the broken image
                            e.target.src = "/api/placeholder/300/300";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {/* Image indicator */}
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRefs.current[index]?.click()}
                        className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-xs">Add Image</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={(el) => (fileRefs.current[index] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                    className="hidden"
                  />
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500">
            You can upload up to {maxImages} images. Images will be displayed in
            the order uploaded.
            {Object.keys(images).filter((key) => !key.includes("Preview"))
              .length > 0 &&
              ` Currently: ${
                Object.keys(images).filter((key) => !key.includes("Preview"))
                  .length
              } image(s)`}
          </p>
        </div>
      );
    }
  );

  const handleItemDelete = useCallback(
    (itemId, itemName) => {
      setConfirmModal({
        isOpen: true,
        type: "item",
        id: itemId,
        name: itemName,
        onConfirm: async () => {
          try {
            await dispatch(
              deleteItem({
                categoryId: selectedCategory.id,
                itemId: itemId,
                subCategoryId: selectedSubCategory?.id,
              })
            );
            setConfirmModal({
              isOpen: false,
              type: "",
              id: null,
              name: "",
              onConfirm: null,
            });
          } catch (error) {
            console.error("Error deleting item:", error);
          }
        },
      });
    },
    [dispatch, selectedCategory, selectedSubCategory]
  );

  // ==================== MEMOIZED COLOR/SIZE HANDLERS ====================
  const addColorToCategory = useCallback(() => {
    if (colorInput.trim() && !categoryForm.colors.includes(colorInput.trim())) {
      setCategoryForm((prev) => ({
        ...prev,
        colors: [...prev.colors, colorInput.trim()],
      }));
      setColorInput("");
    }
  }, [colorInput, categoryForm.colors]);

  const removeColorFromCategory = useCallback((colorToRemove) => {
    setCategoryForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  }, []);

  const addSizeToCategory = useCallback(() => {
    if (sizeInput.trim() && !categoryForm.sizes.includes(sizeInput.trim())) {
      setCategoryForm((prev) => ({
        ...prev,
        sizes: [...prev.sizes, sizeInput.trim()],
      }));
      setSizeInput("");
    }
  }, [sizeInput, categoryForm.sizes]);

  const removeSizeFromCategory = useCallback((sizeToRemove) => {
    setCategoryForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove),
    }));
  }, []);

  const addColorToSubCategory = useCallback(() => {
    if (
      subCatColorInput.trim() &&
      !subCategoryForm.colors.includes(subCatColorInput.trim())
    ) {
      setSubCategoryForm((prev) => ({
        ...prev,
        colors: [...prev.colors, subCatColorInput.trim()],
      }));
      setSubCatColorInput("");
    }
  }, [subCatColorInput, subCategoryForm.colors]);

  const removeColorFromSubCategory = useCallback((colorToRemove) => {
    setSubCategoryForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  }, []);

  const addSizeToSubCategory = useCallback(() => {
    if (
      subCatSizeInput.trim() &&
      !subCategoryForm.sizes.includes(subCatSizeInput.trim())
    ) {
      setSubCategoryForm((prev) => ({
        ...prev,
        sizes: [...prev.sizes, subCatSizeInput.trim()],
      }));
      setSubCatSizeInput("");
    }
  }, [subCatSizeInput, subCategoryForm.sizes]);

  const removeSizeFromSubCategory = useCallback((sizeToRemove) => {
    setSubCategoryForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove),
    }));
  }, []);

  const addColorToItem = useCallback(() => {
    if (
      itemColorInput.trim() &&
      !itemForm.colors.includes(itemColorInput.trim())
    ) {
      setItemForm((prev) => ({
        ...prev,
        colors: [...prev.colors, itemColorInput.trim()],
      }));
      setItemColorInput("");
    }
  }, [itemColorInput, itemForm.colors]);

  const removeColorFromItem = useCallback((colorToRemove) => {
    setItemForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  }, []);

  const addSizeToItem = useCallback(() => {
    if (
      itemSizeInput.trim() &&
      !itemForm.sizes.includes(itemSizeInput.trim())
    ) {
      setItemForm((prev) => ({
        ...prev,
        sizes: [...prev.sizes, itemSizeInput.trim()],
      }));
      setItemSizeInput("");
    }
  }, [itemSizeInput, itemForm.sizes]);

  const removeSizeFromItem = useCallback((sizeToRemove) => {
    setItemForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove),
    }));
  }, []);

  // ==================== FORM RESET FUNCTIONS ====================
  const resetCategoryForm = useCallback(() => {
    setCategoryForm({
      name: "",
      description: "",
      image: "",
      imageFile: null,
      imagePreview: "",
      hasQuotes: false,
      colors: [],
      sizes: [],
    });
    setColorInput("");
    setSizeInput("");
  }, []);

  const resetSubCategoryForm = useCallback(() => {
    setSubCategoryForm({
      name: "",
      description: "",
      image: "",
      imageFile: null,
      imagePreview: "",
      colors: [],
      sizes: [],
    });
    setSubCatColorInput("");
    setSubCatSizeInput("");
  }, []);

  const resetItemForm = useCallback(() => {
    // Clean up any blob URLs
    Object.keys(itemForm.images).forEach((key) => {
      if (
        key.includes("Preview") &&
        itemForm.images[key]?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(itemForm.images[key]);
      }
    });

    setItemForm({
      name: "",
      description: "",
      price: "",
      images: {},
      imagePreviews: {},
      colors: [],
      sizes: [],
      outOfStock: false,
    });
    setItemColorInput("");
    setItemSizeInput("");
  }, [itemForm.images]);

  // ==================== FILE HANDLING ====================
  const handleFileChange = useCallback((e, type) => {
    const file = e.target.files[0];
    if (file) {
      const imagePreview = URL.createObjectURL(file);
      if (type === "category") {
        setCategoryForm((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: imagePreview,
        }));
      } else if (type === "subcategory") {
        setSubCategoryForm((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: imagePreview,
        }));
      }
    }
  }, []);

  const handleItemImagesChange = useCallback((newImages) => {
    setItemForm((prev) => ({
      ...prev,
      images: newImages,
    }));
  }, []);

  // ==================== FORM SUBMISSION HANDLERS ====================
  const handleCategorySubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const submitData = {
          name: categoryForm.name,
          description: categoryForm.description,
          hasQuotes: categoryForm.hasQuotes,
          colors: categoryForm.colors,
          sizes: categoryForm.sizes,
        };

        if (categoryForm.imageFile) {
          submitData.image = categoryForm.imageFile;
        } else if (
          categoryForm.image &&
          !categoryForm.image.startsWith("blob:")
        ) {
          submitData.image = categoryForm.image;
        }

        if (editingCategory) {
          await dispatch(
            updateCategory({ id: editingCategory.id, categoryData: submitData })
          );
        } else {
          await dispatch(createCategory(submitData));
        }

        resetCategoryForm();
        dispatch(closeModal("categoryModal"));
        dispatch(setEditingCategory(null));
      } catch (error) {
        console.error("Error saving category:", error);
      }
    },
    [categoryForm, editingCategory, dispatch, resetCategoryForm]
  );

  const handleSubCategorySubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const submitData = {
          name: subCategoryForm.name,
          description: subCategoryForm.description,
          colors: subCategoryForm.colors,
          sizes: subCategoryForm.sizes,
        };

        if (subCategoryForm.imageFile) {
          submitData.image = subCategoryForm.imageFile;
        } else if (
          subCategoryForm.image &&
          !subCategoryForm.image.startsWith("blob:")
        ) {
          submitData.image = subCategoryForm.image;
        }

        if (editingSubCategory) {
          await dispatch(
            updateSubCategory({
              categoryId: selectedCategory.id,
              subCategoryId: editingSubCategory.id,
              subCategoryData: submitData,
            })
          );
        } else {
          await dispatch(
            createSubCategory({
              categoryId: selectedCategory.id,
              subCategoryData: submitData,
            })
          );
        }

        resetSubCategoryForm();
        dispatch(closeModal("subCategoryModal"));
        dispatch(setEditingSubCategory(null));
      } catch (error) {
        console.error("Error saving subcategory:", error);
      }
    },
    [
      subCategoryForm,
      editingSubCategory,
      selectedCategory,
      dispatch,
      resetSubCategoryForm,
    ]
  );

  // In CategoriesScreen.js - Add debugging to handleItemSubmit
  const handleItemSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        console.log("=== FRONTEND CREATE ITEM DEBUG ===");
        console.log(
          "selectedCategory:",
          selectedCategory?.name,
          "ID:",
          selectedCategory?.id
        );
        console.log(
          "selectedSubCategory:",
          selectedSubCategory?.name,
          "ID:",
          selectedSubCategory?.id
        );
        console.log("editingItem:", editingItem?.name);

        const submitData = {
          name: itemForm.name,
          description: itemForm.description,
          price: itemForm.price,
          colors: itemForm.colors,
          sizes: itemForm.sizes,
          outOfStock: itemForm.outOfStock,
          images: {},
        };

        // Handle multiple images
        Object.keys(itemForm.images).forEach((key) => {
          if (key.startsWith("image") && !key.includes("Preview")) {
            submitData.images[key] = itemForm.images[key];
          }
        });

        console.log("submitData:", {
          name: submitData.name,
          hasImages: Object.keys(submitData.images).length > 0,
          targetSubCategory: selectedSubCategory?.id,
        });

        let result;
        if (editingItem) {
          console.log("UPDATING existing item");
          result = await dispatch(
            updateItem({
              categoryId: selectedCategory.id,
              itemId: editingItem.id,
              itemData: submitData,
              subCategoryId: selectedSubCategory?.id,
            })
          );
        } else {
          console.log(
            "CREATING new item in subcategory:",
            selectedSubCategory?.id || "main category"
          );
          result = await dispatch(
            createItem({
              categoryId: selectedCategory.id,
              itemData: submitData,
              subCategoryId: selectedSubCategory?.id,
            })
          );
        }

        console.log("Redux result type:", result.type);
        console.log("=== END FRONTEND DEBUG ===");

        if (result.type.endsWith("/fulfilled")) {
          resetItemForm();
          dispatch(closeModal("itemModal"));
          dispatch(setEditingItem(null));
        } else {
          console.error("Item creation/update failed:", result);
        }
      } catch (error) {
        console.error("Error saving item:", error);
      }
    },
    [
      itemForm,
      editingItem,
      selectedCategory,
      selectedSubCategory,
      dispatch,
      resetItemForm,
    ]
  );
  // ==================== MODAL CLOSE HANDLERS ====================
  const handleCloseCategoryModal = useCallback(() => {
    if (
      categoryForm.imagePreview &&
      categoryForm.imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(categoryForm.imagePreview);
    }
    dispatch(closeModal("categoryModal"));
    dispatch(setEditingCategory(null));
    resetCategoryForm();
  }, [categoryForm.imagePreview, dispatch, resetCategoryForm]);

  const handleCloseSubCategoryModal = useCallback(() => {
    if (
      subCategoryForm.imagePreview &&
      subCategoryForm.imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(subCategoryForm.imagePreview);
    }
    dispatch(closeModal("subCategoryModal"));
    dispatch(setEditingSubCategory(null));
    resetSubCategoryForm();
  }, [subCategoryForm.imagePreview, dispatch, resetSubCategoryForm]);

  const handleCloseItemModal = useCallback(() => {
    // Clean up any blob URLs from item images
    Object.keys(itemForm.images).forEach((key) => {
      if (
        key.includes("Preview") &&
        itemForm.images[key]?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(itemForm.images[key]);
      }
    });
    dispatch(closeModal("itemModal"));
    dispatch(setEditingItem(null));
    resetItemForm();
  }, [itemForm.images, dispatch, resetItemForm]);

  const handleCloseItemsViewModal = useCallback(() => {
    dispatch(closeModal("itemsViewModal"));
    dispatch(setSelectedCategory(null));
    dispatch(setSelectedSubCategory(null));
  }, [dispatch]);

  const handleCloseSubCategoriesViewModal = useCallback(() => {
    dispatch(closeModal("subCategoriesViewModal"));
    dispatch(setSelectedCategory(null));
  }, [dispatch]);

  // ==================== MEMOIZED SEARCH HANDLERS ====================
  const handleSearchChange = useCallback(
    (value) => {
      dispatch(setSearchQuery(value));
    },
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (value) => {
      dispatch(setFilterBy(value));
    },
    [dispatch]
  );

  const handleOpenCategoryModal = useCallback(() => {
    dispatch(openModal("categoryModal"));
  }, [dispatch]);

  const handleOpenSubCategoryModal = useCallback(() => {
    dispatch(openModal("subCategoryModal"));
  }, [dispatch]);

  const handleOpenItemModal = useCallback(() => {
    dispatch(openModal("itemModal"));
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ==================== MEMOIZED VIEW MODE HANDLERS ====================
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  const closeMobileFilters = useCallback(() => {
    setShowMobileFilters(false);
  }, []);

  // ==================== MEMOIZED FILE HANDLERS ====================
  const handleCategoryFileClick = useCallback(() => {
    categoryFileRef.current?.click();
  }, []);

  const handleSubCategoryFileClick = useCallback(() => {
    subCategoryFileRef.current?.click();
  }, []);

  // ==================== MAIN RENDER ====================
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
                Manage your product categories, subcategories and items
              </p>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileFilters}
              className="sm:hidden flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop view controls */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleOpenCategoryModal}
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
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-50"
          onClick={closeMobileFilters}
        >
          <div
            className="bg-white w-80 max-w-[85vw] h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Filters & Actions</h2>
                <button onClick={closeMobileFilters}>
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
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="hasItems">With Items</option>
                <option value="noItems">Empty Categories</option>
              </select>

              {/* View mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Mode
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleViewModeChange("grid")}
                    className={`flex-1 py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Grid
                  </button>
                  <button
                    onClick={() => handleViewModeChange("list")}
                    className={`flex-1 py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 ${
                      viewMode === "list"
                        ? "bg-white shadow-sm"
                        : "hover:bg-gray-200"
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
                  handleOpenCategoryModal();
                  closeMobileFilters();
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterBy}
            onChange={(e) => handleFilterChange(e.target.value)}
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
              onClick={handleClearError}
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
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-4"
            }`}
          >
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
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={handleOpenCategoryModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Your First Category
            </button>
          </div>
        ) : (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-4"
            }`}
          >
            {filteredCategories.map((category) =>
              viewMode === "grid" ? (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleCategoryEdit}
                  onDelete={handleCategoryDelete}
                  onViewItems={handleViewItems}
                  onViewSubCategories={handleViewSubCategories}
                />
              ) : (
                <CategoryListItem
                  key={category.id}
                  category={category}
                  onEdit={handleCategoryEdit}
                  onDelete={handleCategoryDelete}
                  onViewItems={handleViewItems}
                  onViewSubCategories={handleViewSubCategories}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Category Modal */}
      {modals.categoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
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

                {/* Colors Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Colors (Optional)
                  </label>
                  <TagComponent
                    items={categoryForm.colors}
                    onRemove={removeColorFromCategory}
                    placeholder="Add a color (e.g., Red, Blue)"
                    inputValue={colorInput}
                    onInputChange={setColorInput}
                    onAdd={addColorToCategory}
                    icon={Palette}
                  />
                </div>

                {/* Sizes Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Sizes (Optional)
                  </label>
                  <TagComponent
                    items={categoryForm.sizes}
                    onRemove={removeSizeFromCategory}
                    placeholder="Add a size (e.g., S, M, L, XL)"
                    inputValue={sizeInput}
                    onInputChange={setSizeInput}
                    onAdd={addSizeToCategory}
                    icon={Ruler}
                  />
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
                      onClick={handleCategoryFileClick}
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
                    disabled={loading.create || loading.update}
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

      {/* SubCategories View Modal */}
      {modals.subCategoriesViewModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {selectedCategory.name} - Subcategories
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedCategory.subCategories?.length || 0} subcategories
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenSubCategoryModal}
                    className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Subcategory</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                  <button
                    onClick={handleCloseSubCategoriesViewModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {!selectedCategory.subCategories ||
              selectedCategory.subCategories.length === 0 ? (
                <div className="text-center py-16">
                  <FolderPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No subcategories yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add your first subcategory to organize items better
                  </p>
                  <button
                    onClick={handleOpenSubCategoryModal}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Add First Subcategory
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCategory.subCategories.map((subCategory) => (
                    <div
                      key={subCategory.id}
                      className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={subCategory.image || "/api/placeholder/300/200"}
                          alt={subCategory.name}
                          className="w-full h-32 sm:h-40 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => handleSubCategoryEdit(subCategory)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          <button
                            onClick={() =>
                              handleSubCategoryDelete(
                                subCategory.id,
                                subCategory.name
                              )
                            }
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                          {subCategory.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {subCategory.description}
                        </p>

                        <div className="space-y-1 mb-3">
                          {subCategory.colors &&
                            subCategory.colors.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Palette className="w-3 h-3 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {subCategory.colors
                                    .slice(0, 2)
                                    .map((color, index) => (
                                      <span
                                        key={index}
                                        className="text-xs bg-blue-100 text-blue-700 px-1 rounded"
                                      >
                                        {color}
                                      </span>
                                    ))}
                                  {subCategory.colors.length > 2 && (
                                    <span className="text-xs text-gray-400">
                                      +{subCategory.colors.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                          {subCategory.sizes &&
                            subCategory.sizes.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Ruler className="w-3 h-3 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {subCategory.sizes
                                    .slice(0, 2)
                                    .map((size, index) => (
                                      <span
                                        key={index}
                                        className="text-xs bg-green-100 text-green-700 px-1 rounded"
                                      >
                                        {size}
                                      </span>
                                    ))}
                                  {subCategory.sizes.length > 2 && (
                                    <span className="text-xs text-gray-400">
                                      +{subCategory.sizes.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {subCategory.items?.length || 0} items
                          </span>
                          <button
                            onClick={() =>
                              handleViewSubCategoryItems(subCategory)
                            }
                            className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm"
                          >
                            View Items
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SubCategory Modal */}
      {modals.subCategoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingSubCategory
                    ? "Edit Subcategory"
                    : "Add New Subcategory"}
                </h2>
                <button
                  onClick={handleCloseSubCategoryModal}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubCategorySubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={subCategoryForm.name}
                    onChange={(e) =>
                      setSubCategoryForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter subcategory name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={subCategoryForm.description}
                    onChange={(e) =>
                      setSubCategoryForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Describe your subcategory"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Colors (Optional)
                  </label>
                  <TagComponent
                    items={subCategoryForm.colors}
                    onRemove={removeColorFromSubCategory}
                    placeholder="Add a color"
                    inputValue={subCatColorInput}
                    onInputChange={setSubCatColorInput}
                    onAdd={addColorToSubCategory}
                    icon={Palette}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Sizes (Optional)
                  </label>
                  <TagComponent
                    items={subCategoryForm.sizes}
                    onRemove={removeSizeFromSubCategory}
                    placeholder="Add a size"
                    inputValue={subCatSizeInput}
                    onInputChange={setSubCatSizeInput}
                    onAdd={addSizeToSubCategory}
                    icon={Ruler}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory Image
                  </label>
                  <div className="space-y-3">
                    {(subCategoryForm.imagePreview ||
                      subCategoryForm.image) && (
                      <div className="relative inline-block">
                        <img
                          src={
                            subCategoryForm.imagePreview ||
                            subCategoryForm.image
                          }
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSubCategoryFileClick}
                      className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                    <input
                      ref={subCategoryFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "subcategory")}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseSubCategoryModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading.subcategory}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingSubCategory ? "Update" : "Create"}
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
                    {selectedSubCategory
                      ? `${selectedCategory.name} > ${selectedSubCategory.name} - Items`
                      : `${selectedCategory.name} - Items`}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedSubCategory
                      ? selectedSubCategory.items?.length || 0
                      : selectedCategory.items?.length || 0}{" "}
                    items
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenItemModal}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm sm:text-base"
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
              {(() => {
                const items = selectedSubCategory
                  ? selectedSubCategory.items
                  : selectedCategory.items;
                return !items || items.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No items yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Add your first item to this{" "}
                      {selectedSubCategory ? "subcategory" : "category"}
                    </p>
                    <button
                      onClick={handleOpenItemModal}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Item
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="relative">
                          {/* Display primary image - always prioritize image1 from images object */}
                          <img
                            src={
                              item.images?.image1 ||
                              item.image1 ||
                              item.image ||
                              "/api/placeholder/300/200"
                            }
                            alt={item.name}
                            className="w-full h-32 sm:h-40 object-cover"
                          />
                          {/* Image indicators for multiple images */}
                          {(item.images?.image1 ||
                            item.images?.image2 ||
                            item.images?.image3 ||
                            item.image1 ||
                            item.image2 ||
                            item.image3) && (
                            <div className="absolute bottom-2 left-2 flex gap-1">
                              {(item.images?.image1 || item.image1) && (
                                <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                              )}
                              {(item.images?.image2 || item.image2) && (
                                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                              )}
                              {(item.images?.image3 || item.image3) && (
                                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                              )}
                            </div>
                          )}
                          {item.outOfStock && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                              Out of Stock
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              onClick={() => handleItemEdit(item)}
                              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                            >
                              <Edit className="w-3.5 h-3.5 text-gray-700" />
                            </button>
                            <button
                              onClick={() =>
                                handleItemDelete(item.id, item.name)
                              }
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

                          <div className="space-y-1 mb-2">
                            {item.colors && item.colors.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Palette className="w-3 h-3 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {item.colors
                                    .slice(0, 2)
                                    .map((color, index) => (
                                      <span
                                        key={index}
                                        className="text-xs bg-purple-100 text-purple-700 px-1 rounded"
                                      >
                                        {color}
                                      </span>
                                    ))}
                                  {item.colors.length > 2 && (
                                    <span className="text-xs text-gray-400">
                                      +{item.colors.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {item.sizes && item.sizes.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Ruler className="w-3 h-3 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {item.sizes.slice(0, 2).map((size, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-orange-100 text-orange-700 px-1 rounded"
                                    >
                                      {size}
                                    </span>
                                  ))}
                                  {item.sizes.length > 2 && (
                                    <span className="text-xs text-gray-400">
                                      +{item.sizes.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            {item.price && (
                              <p className="text-green-600 font-semibold">
                                ₦{item.price}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              {item.outOfStock ? (
                                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  In Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {modals.itemModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={itemForm.name}
                      onChange={(e) =>
                        setItemForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter item name"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
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
                    Item Colors (Optional)
                  </label>
                  <TagComponent
                    items={itemForm.colors}
                    onRemove={removeColorFromItem}
                    placeholder="Add item color"
                    inputValue={itemColorInput}
                    onInputChange={setItemColorInput}
                    onAdd={addColorToItem}
                    icon={Palette}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Sizes (Optional)
                  </label>
                  <TagComponent
                    items={itemForm.sizes}
                    onRemove={removeSizeFromItem}
                    placeholder="Add item size"
                    inputValue={itemSizeInput}
                    onInputChange={setItemSizeInput}
                    onAdd={addSizeToItem}
                    icon={Ruler}
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={itemForm.outOfStock}
                      onChange={(e) =>
                        setItemForm((prev) => ({
                          ...prev,
                          outOfStock: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Out of Stock
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Images (Up to 3 images)
                  </label>
                  <MultipleImageUpload
                    images={itemForm.images}
                    onImagesChange={handleItemImagesChange}
                    maxImages={3}
                  />
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
                    disabled={loading.item}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingItem ? "Update Item" : "Add Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            type: "",
            id: null,
            name: "",
            onConfirm: null,
          })
        }
        onConfirm={confirmModal.onConfirm}
        title={`Delete ${confirmModal.type
          ?.charAt(0)
          .toUpperCase()}${confirmModal.type?.slice(1)}`}
        message={`Are you sure you want to delete "${confirmModal.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default CategoriesScreen;
