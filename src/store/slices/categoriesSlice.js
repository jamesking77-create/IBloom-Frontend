import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Mock API functions - replace with actual API calls
const fetchCategoriesFromAPI = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Lightings",
          image: "/api/placeholder/300/200",
          description: "Professional lighting equipment for events and venues",
          itemCount: 12,
          items: [
            {
              id: 1,
              name: "LED Strip Lights",
              description: "Flexible LED strips for ambient lighting",
              price: "$25.00",
              image: "/api/placeholder/200/150",
            },
            {
              id: 2,
              name: "Spotlight Set",
              description: "Professional spotlights for stage lighting",
              price: "$150.00",
              image: "/api/placeholder/200/150",
            },
          ],
        },
        {
          id: 2,
          name: "Dance Floor",
          image: "/api/placeholder/300/200",
          description: "High-quality dance floors for all types of events",
          itemCount: 8,
          items: [
            {
              id: 3,
              name: "LED Dance Floor",
              description: "Interactive LED dance floor with color patterns",
              price: "$500.00",
              image: "/api/placeholder/200/150",
            },
          ],
        },
        {
          id: 3,
          name: "Glow Furniture",
          image: "/api/placeholder/300/200",
          description: "Illuminated furniture pieces for modern events",
          itemCount: 15,
          items: [],
        },
      ]);
    }, 500);
  });
};

const createCategoryAPI = async (categoryData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        ...categoryData,
        itemCount: 0,
        items: [],
      });
    }, 500);
  });
};

const updateCategoryAPI = async (id, categoryData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, ...categoryData });
    }, 500);
  });
};

const deleteCategoryAPI = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(id);
    }, 500);
  });
};

const createItemAPI = async (categoryId, itemData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        ...itemData,
      });
    }, 500);
  });
};

const updateItemAPI = async (categoryId, itemId, itemData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: itemId, ...itemData });
    }, 500);
  });
};

const deleteItemAPI = async (categoryId, itemId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ categoryId, itemId });
    }, 500);
  });
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
      return { categoryId, item: response };
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
      return { categoryId, item: response };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update item");
    }
  }
);

export const deleteItem = createAsyncThunk(
  "categories/deleteItem",
  async ({ categoryId, itemId }, { rejectWithValue }) => {
    try {
      await deleteItemAPI(categoryId, itemId);
      return { categoryId, itemId };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete item");
    }
  }
);

const initialState = {
  categories: [],
  filteredCategories: [],
  selectedCategory: null,
  searchQuery: "",
  filterBy: "all", // all, hasItems, noItems
  isLoading: false,
  error: null,
  modals: {
    categoryModal: false,
    itemModal: false,
    itemsViewModal: false,
  },
  editingCategory: null,
  editingItem: null,
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
    // Sync with profile slice - remove category when removed from profile
    syncCategoryRemoval: (state, action) => {
      const categoryName = action.payload;
      state.categories = state.categories.filter(cat => cat.name !== categoryName);
      state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.filteredCategories = filterCategories(action.payload, state.searchQuery, state.filterBy);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
        state.modals.categoryModal = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = { ...state.categories[index], ...action.payload };
        }
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
        state.modals.categoryModal = false;
        state.editingCategory = null;
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
      })
      // Create item
      .addCase(createItem.fulfilled, (state, action) => {
        const { categoryId, item } = action.payload;
        const category = state.categories.find(cat => cat.id === categoryId);
        if (category) {
          category.items.push(item);
          category.itemCount = category.items.length;
        }
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
        state.modals.itemModal = false;
      })
      // Update item
      .addCase(updateItem.fulfilled, (state, action) => {
        const { categoryId, item } = action.payload;
        const category = state.categories.find(cat => cat.id === categoryId);
        if (category) {
          const itemIndex = category.items.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            category.items[itemIndex] = item;
          }
        }
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
        state.modals.itemModal = false;
        state.editingItem = null;
      })
      // Delete item
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { categoryId, itemId } = action.payload;
        const category = state.categories.find(cat => cat.id === categoryId);
        if (category) {
          category.items = category.items.filter(item => item.id !== itemId);
          category.itemCount = category.items.length;
        }
        state.filteredCategories = filterCategories(state.categories, state.searchQuery, state.filterBy);
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
  openModal,
  closeModal,
  setEditingCategory,
  setEditingItem,
  clearError,
  syncCategoryRemoval,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;