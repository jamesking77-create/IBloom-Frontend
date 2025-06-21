import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Mock API functions - replace with actual API calls
const fetchCategoriesFromAPI = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
  {
    id: 1,
    name: "LIGHTINGS",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    description: "Professional LED strip lights, spotlights, and ambient lighting for events",
    itemCount: 25,
    items: [
      {
        id: 1,
        name: "LED Strip Lights",
        description: "Flexible RGB LED strips for ambient lighting and color effects",
        price: "45.00",
        image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 2,
        name: "Professional Spotlights",
        description: "High-intensity spotlights for stage and event lighting",
        price: "180.00",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 2,
    name: "DANCE FLOOR",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    description: "LED dance floors with customizable colors and patterns",
    itemCount: 12,
    items: [
      {
        id: 3,
        name: "LED Interactive Dance Floor",
        description: "Programmable LED dance floor with color-changing capabilities",
        price: "850.00",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 3,
    name: "GLOW FURNITURE",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Illuminated lounge furniture and seating for modern events",
    itemCount: 18,
    items: [
      {
        id: 4,
        name: "LED Cocktail Tables",
        description: "Color-changing illuminated cocktail tables",
        price: "95.00",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 4,
    name: "LED INFLATABLES",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Large inflatable decorations with LED lighting systems",
    itemCount: 8,
    items: [
      {
        id: 5,
        name: "LED Inflatable Arches",
        description: "Customizable LED inflatable entrance arches",
        price: "275.00",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 5,
    name: "LIGHTED PROPS",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Decorative illuminated props and accent pieces",
    itemCount: 22,
    items: [
      {
        id: 6,
        name: "LED Palm Trees",
        description: "Artificial palm trees with integrated LED lighting",
        price: "165.00",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 6,
    name: "LED BACKDROPS",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Programmable LED backdrop panels for stage and photo areas",
    itemCount: 15,
    items: [
      {
        id: 7,
        name: "LED Video Wall Panels",
        description: "High-resolution LED panels for video backdrops",
        price: "450.00",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 7,
    name: "CENTERPIECES/VASES",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Elegant centerpieces and decorative vases for table settings",
    itemCount: 35,
    items: [
      {
        id: 8,
        name: "Crystal LED Vases",
        description: "Crystal vases with LED base lighting",
        price: "35.00",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 8,
    name: "TABLE COVERS",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Premium table linens and decorative covers",
    itemCount: 45,
    items: [
      {
        id: 9,
        name: "Satin Table Covers",
        description: "Elegant satin table covers in various colors",
        price: "25.00",
        image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 9,
    name: "CHAIR COVERS",
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Decorative chair covers and sashes for seating",
    itemCount: 50,
    items: [
      {
        id: 10,
        name: "Spandex Chair Covers",
        description: "Stretch spandex chair covers with bow ties",
        price: "8.00",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 10,
    name: "BRIDAL SOFAS/CHAIRS",
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Elegant bridal seating and luxury furniture for ceremonies",
    itemCount: 12,
    items: [
      {
        id: 11,
        name: "Victorian Bridal Throne",
        description: "Ornate golden bridal throne chairs",
        price: "125.00",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 11,
    name: "WALKWAY PEDESTALS",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Decorative pedestals for aisle and walkway decoration",
    itemCount: 20,
    items: [
      {
        id: 12,
        name: "Marble Column Pedestals",
        description: "Classical marble-style pedestals for ceremonies",
        price: "85.00",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 12,
    name: "MANDAPS",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Traditional and modern mandaps for wedding ceremonies",
    itemCount: 6,
    items: [
      {
        id: 13,
        name: "Crystal Mandap",
        description: "Elegant crystal and gold mandap structure",
        price: "1,200.00",
        image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 13,
    name: "DRAPE ALUMINIUM POLES",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Professional draping systems and aluminum support poles",
    itemCount: 30,
    items: [
      {
        id: 14,
        name: "Adjustable Drape Poles",
        description: "Telescopic aluminum poles for fabric draping",
        price: "45.00",
        image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 14,
    name: "GOLD BACKDROP PANELS",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Luxurious gold backdrop panels for photography and staging",
    itemCount: 18,
    items: [
      {
        id: 15,
        name: "Sequin Gold Panels",
        description: "Shimmering gold sequin backdrop panels",
        price: "95.00",
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 15,
    name: "WATER FOUNTAIN",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Decorative water fountains for elegant ambiance",
    itemCount: 8,
    items: [
      {
        id: 16,
        name: "LED Water Fountain",
        description: "Illuminated tiered water fountain with LED lights",
        price: "350.00",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 16,
    name: "MIRROR BALLS",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Classic disco mirror balls for dance floors and parties",
    itemCount: 15,
    items: [
      {
        id: 17,
        name: "Large Mirror Ball",
        description: "Professional 20-inch disco mirror ball with motor",
        price: "65.00",
        image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 17,
    name: "GREEN MATS/BALLS",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Artificial grass mats and decorative green spheres",
    itemCount: 25,
    items: [
      {
        id: 18,
        name: "Artificial Grass Mats",
        description: "High-quality synthetic grass mats for outdoor themes",
        price: "15.00",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 19,
        name: "Topiary Green Balls",
        description: "Decorative artificial topiary spheres in various sizes",
        price: "45.00",
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: 18,
    name: "LANTERNS",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Decorative lanterns including paper, LED, and vintage styles",
    itemCount: 32,
    items: [
      {
        id: 20,
        name: "Paper Lanterns",
        description: "Colorful paper lanterns in various sizes for ambient lighting",
        price: "12.00",
        image: "https://images.unsplash.com/photo-1478147427282-58c9c25145e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 21,
        name: "Vintage Bronze Lanterns",
        description: "Antique-style bronze lanterns for rustic and elegant events",
        price: "18.00",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 22,
        name: "LED Solar Lanterns",
        description: "Eco-friendly LED lanterns with solar charging capability",
        price: "25.00",
        image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
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
} = categoriesSlice.actions;

export default categoriesSlice.reducer;