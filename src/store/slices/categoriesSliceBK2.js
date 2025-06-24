import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get, put, post, del } from "../../utils/api";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to create form data for file uploads
const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'items' && Array.isArray(data[key])) {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

// API functions using your existing utils
const fetchCategoriesFromAPI = async () => {
  const response = await get("/api/services/categories");
  return response?.data?.data?.categories || [];
};

const fetchCategoryByIdAPI = async (categoryId) => {
  const response = await get(`/api/services/categories/${categoryId}`);
  return response?.data?.data?.category;
};

const searchCategoriesAPI = async (searchParams) => {
  const queryString = new URLSearchParams(searchParams).toString();
  const response = await get(`/api/services/categories/search?${queryString}`);
  return {
    categories: response?.data?.data?.categories || [],
    pagination: response?.data?.data?.pagination || {},
    searchCriteria: response?.data?.data?.searchCriteria || {}
  };
};

const createCategoryAPI = async (categoryData) => {
  const config = {};
  let data;

  // Check if we have file upload
  if (categoryData.image instanceof File) {
    data = createFormData(categoryData);
    config.headers = {
      'Content-Type': 'multipart/form-data',
      ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` })
    };
  } else {
    data = categoryData;
    config.headers = {
      ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` })
    };
  }

  const response = await post("/api/services/categories", data, config);
  return response?.data?.data?.category;
};

const updateCategoryAPI = async (categoryId, categoryData) => {
  const config = {};
  let data;

  // Check if we have file upload
  if (categoryData.image instanceof File) {
    data = createFormData(categoryData);
    config.headers = {
      'Content-Type': 'multipart/form-data',
      ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` })
    };
  } else {
    data = categoryData;
    config.headers = {
      ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` })
    };
  }

  const response = await put(`/api/services/categories/${categoryId}`, data, config);
  return response?.data?.data?.category;
};

const deleteCategoryAPI = async (categoryId) => {
  const config = {
    headers: {
      ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` })
    }
  };
  
  const response = await del(`/api/services/categories/${categoryId}`, config);
  return response?.data?.data?.deletedCategory;
};

// Mock item API functions (since your backend handles items within categories)
const createItemAPI = async (categoryId, itemData) => {
  // Get current category
  const currentCategory = await fetchCategoryByIdAPI(categoryId);
  const newItem = {
    id: Date.now(),
    ...itemData,
  };
  
  // Add item to category's items array
  const updatedItems = [...(currentCategory.items || []), newItem];
  
  // Update category with new items
  const updatedCategory = await updateCategoryAPI(categoryId, {
    items: updatedItems
  });
  
  return { categoryId, item: newItem, category: updatedCategory };
};

const updateItemAPI = async (categoryId, itemId, itemData) => {
  // Get current category
  const currentCategory = await fetchCategoryByIdAPI(categoryId);
  
  // Update the specific item
  const updatedItems = currentCategory.items.map(item => 
    item.id === itemId ? { ...item, ...itemData } : item
  );
  
  // Update category with modified items
  const updatedCategory = await updateCategoryAPI(categoryId, {
    items: updatedItems
  });
  
  return { categoryId, item: { id: itemId, ...itemData }, category: updatedCategory };
};

const deleteItemAPI = async (categoryId, itemId) => {
  // Get current category
  const currentCategory = await fetchCategoryByIdAPI(categoryId);
  
  // Remove the item
  const updatedItems = currentCategory.items.filter(item => item.id !== itemId);
  
  // Update category with remaining items
  const updatedCategory = await updateCategoryAPI(categoryId, {
    items: updatedItems
  });
  
  return { categoryId, itemId, category: updatedCategory };
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCategoriesFromAPI();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch categories");
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetchCategoryByIdAPI(categoryId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch category");
    }
  }
);

export const searchCategories = createAsyncThunk(
  "categories/searchCategories",
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await searchCategoriesAPI(searchParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to search categories");
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await createCategoryAPI(categoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create category");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await updateCategoryAPI(id, categoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update category");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCategoryAPI(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete category");
    }
  }
);

export const createItem = createAsyncThunk(
  "categories/createItem",
  async ({ categoryId, itemData }, { rejectWithValue }) => {
    try {
      const response = await createItemAPI(categoryId, itemData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create item");
    }
  }
);

export const updateItem = createAsyncThunk(
  "categories/updateItem",
  async ({ categoryId, itemId, itemData }, { rejectWithValue }) => {
    try {
      const response = await updateItemAPI(categoryId, itemId, itemData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update item");
    }
  }
);

export const deleteItem = createAsyncThunk(
  "categories/deleteItem",
  async ({ categoryId, itemId }, { rejectWithValue }) => {
    try {
      const response = await deleteItemAPI(categoryId, itemId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete item");
    }
  }
);

const initialState = {
  categories: [],
  filteredCategories: [],
  searchResults: [],
  selectedCategory: null,
  currentCategory: null,
  searchQuery: "",
  filterBy: "all", // all, hasItems, noItems
  
  // Search and pagination
  isSearchMode: false,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  },
  searchCriteria: {},
  
  // Loading states
  isLoading: false,
  loading: {
    fetch: false,
    fetchById: false,
    search: false,
    create: false,
    update: false,
    delete: false
  },
  
  error: null,
  
  // Modal states
  modals: {
    categoryModal: false,
    itemModal: false,
    itemsViewModal: false,
  },
  
  editingCategory: null,
  editingItem: null,
  lastUpdated: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.filteredCategories = filterCategories(state.categories, action.payload, state.filterBy);
    },
    setFilterBy: (state, action) => {
      state.filterBy = action.payload;
      state.filteredCategories = filterCategories(state.categories, state.searchQuery, action.payload);
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    toggleSearchMode: (state, action) => {
      state.isSearchMode = action.payload ?? !state.isSearchMode;
      if (!state.isSearchMode) {
        state.searchResults = [];
        state.searchCriteria = {};
        state.pagination = initialState.pagination;
      }
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
      if (action.payload === 'categoryModal') {
        state.editingCategory = null;
      }
      if (action.payload === 'itemModal') {
        state.editingItem = null;
      }
    },
    setEditingCategory: (state, action) => {
      state.editingCategory = action.payload;
    },
    setEditingItem: (state, action) => {
      state.editingItem = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPagination: (state) => {
      state.pagination = initialState.pagination;
    },
    updateCategoryLocally: (state, action) => {
      const { categoryId, updates } = action.payload;
      const index = state.categories.findIndex(cat => cat.id === categoryId);
      if (index !== -1) {
        state.categories[index] = { ...state.categories[index], ...updates };
      }
      
      // Update in search results too if in search mode
      if (state.isSearchMode) {
        const searchIndex = state.searchResults.findIndex(cat => cat.id === categoryId);
        if (searchIndex !== -1) {
          state.searchResults[searchIndex] = { ...state.searchResults[searchIndex], ...updates };
        }
      }
      
      // Update current category if it matches
      if (state.currentCategory?.id === categoryId) {
        state.currentCategory = { ...state.currentCategory, ...updates };
      }
      
      // Update filtered categories
      state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading.fetch = false;
        state.categories = action.payload;
        state.filteredCategories = filterCategories(action.payload, state.searchQuery, state.filterBy);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.loading.fetch = false;
        state.error = action.payload;
      })
      
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading.fetchById = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading.fetchById = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.error = action.payload;
        state.currentCategory = null;
      })
      
      // Search categories
      .addCase(searchCategories.pending, (state) => {
        state.loading.search = true;
        state.error = null;
      })
      .addCase(searchCategories.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload.categories;
        state.pagination = action.payload.pagination;
        state.searchCriteria = action.payload.searchCriteria;
        state.isSearchMode = true;
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.loading.search = false;
        state.error = action.payload;
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading.create = false;
        state.categories.unshift(action.payload); // Add to beginning
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
        state.modals.categoryModal = false;
        state.editingCategory = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.loading.create = false;
        state.error = action.payload;
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading.update = false;
        const updatedCategory = action.payload;
        
        // Update in main categories array
        const index = state.categories.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          state.categories[index] = updatedCategory;
        }
        
        // Update in search results if in search mode
        if (state.isSearchMode) {
          const searchIndex = state.searchResults.findIndex(cat => cat.id === updatedCategory.id);
          if (searchIndex !== -1) {
            state.searchResults[searchIndex] = updatedCategory;
          }
        }
        
        // Update current category if it matches
        if (state.currentCategory?.id === updatedCategory.id) {
          state.currentCategory = updatedCategory;
        }
        
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
        state.modals.categoryModal = false;
        state.editingCategory = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload;
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading.delete = false;
        const categoryId = action.payload;
        
        // Remove from main categories array
        state.categories = state.categories.filter(cat => cat.id !== categoryId);
        
        // Remove from search results if in search mode
        if (state.isSearchMode) {
          state.searchResults = state.searchResults.filter(cat => cat.id !== categoryId);
        }
        
        // Clear current category if it was deleted
        if (state.currentCategory?.id === categoryId) {
          state.currentCategory = null;
        }
        
        // Clear selected category if it was deleted
        if (state.selectedCategory?.id === categoryId) {
          state.selectedCategory = null;
        }
        
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload;
      })
      
      // Create item
      .addCase(createItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const { categoryId, item, category } = action.payload;
        
        // Update the category with the new item data from backend
        const categoryIndex = state.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex !== -1) {
          state.categories[categoryIndex] = category;
        }
        
        // Update current category if it matches
        if (state.currentCategory?.id === categoryId) {
          state.currentCategory = category;
        }
        
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
        state.modals.itemModal = false;
        state.editingItem = null;
      })
      .addCase(createItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update item
      .addCase(updateItem.fulfilled, (state, action) => {
        const { categoryId, item, category } = action.payload;
        
        // Update the category with the modified item data from backend
        const categoryIndex = state.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex !== -1) {
          state.categories[categoryIndex] = category;
        }
        
        // Update current category if it matches
        if (state.currentCategory?.id === categoryId) {
          state.currentCategory = category;
        }
        
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
        state.modals.itemModal = false;
        state.editingItem = null;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete item
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { categoryId, itemId, category } = action.payload;
        
        // Update the category with the remaining items from backend
        const categoryIndex = state.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex !== -1) {
          state.categories[categoryIndex] = category;
        }
        
        // Update current category if it matches
        if (state.currentCategory?.id === categoryId) {
          state.currentCategory = category;
        }
        
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Helper function to filter categories
const filterCategories = (categories, searchQuery, filterBy) => {
  let filtered = categories;

  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by item count
  if (filterBy === 'hasItems') {
    filtered = filtered.filter(category => category.itemCount > 0);
  } else if (filterBy === 'noItems') {
    filtered = filtered.filter(category => category.itemCount === 0);
  }

  return filtered;
};

export const {
  setSearchQuery,
  setFilterBy,
  setSelectedCategory,
  setCurrentCategory,
  toggleSearchMode,
  openModal,
  closeModal,
  setEditingCategory,
  setEditingItem,
  clearError,
  resetPagination,
  updateCategoryLocally,
} = categoriesSlice.actions;

// Selectors
export const selectCategories = (state) => state.categories.categories;
export const selectFilteredCategories = (state) => state.categories.filteredCategories;
export const selectSearchResults = (state) => state.categories.searchResults;
export const selectCurrentCategory = (state) => state.categories.currentCategory;
export const selectSelectedCategory = (state) => state.categories.selectedCategory;
export const selectPagination = (state) => state.categories.pagination;
export const selectSearchCriteria = (state) => state.categories.searchCriteria;
export const selectIsSearchMode = (state) => state.categories.isSearchMode;
export const selectLoading = (state) => state.categories.loading;
export const selectIsLoading = (state) => state.categories.isLoading;
export const selectError = (state) => state.categories.error;
export const selectModals = (state) => state.categories.modals;
export const selectEditingCategory = (state) => state.categories.editingCategory;
export const selectEditingItem = (state) => state.categories.editingItem;
export const selectLastUpdated = (state) => state.categories.lastUpdated;

// Computed selectors
export const selectDisplayCategories = (state) => 
  state.categories.isSearchMode ? state.categories.searchResults : state.categories.filteredCategories;

export const selectCategoryById = (categoryId) => (state) =>
  state.categories.categories.find(cat => cat.id === categoryId) ||
  state.categories.searchResults.find(cat => cat.id === categoryId);

export default categoriesSlice.reducer;