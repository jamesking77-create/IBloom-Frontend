import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// You would replace this with an actual API call
const fetchProfileFromAPI = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "IBLOOM",
        email: "ibloomrentals@gmail.com",
        phone: "0817-225-8085",
        location: "85B, Laifaji way, dolphin estate, ikoyi, Lagos.",
        joinDate: new Date().toLocaleDateString(),
        avatar: "/api/placeholder/150/150",
        bio: "We are a leading event rental company based in Lagos, dedicated to making your special occasions memorable. With years of experience in the industry, we provide high-quality rental equipment and exceptional service for weddings, corporate events, parties, and celebrations of all sizes",
        specialize: ["Decor", "Event Planning", "Catering", "Rental"],
        categories: [], // This will be populated from category slice
      });
    }, 500);
  });
};

// Async thunk for fetching profile
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchProfileFromAPI();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

// Async thunk for saving profile changes
export const saveProfile = createAsyncThunk(
  "profile/saveProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const profileData = state.profile.editData;

      // Here you would make the actual API call to update the profile
      // For now, we'll simulate a successful API call
      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve(profileData);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to save profile");
    }
  }
);

const initialState = {
  userData: {
    name: "",
    email: "",
    phone: "",
    location: "",
    joinDate: "",
    avatar: "/api/placeholder/150/150",
    bio: "",
    specialize: [],
    categories: [],
  },
  editData: {
    name: "",
    email: "",
    phone: "",
    location: "",
    joinDate: "",
    avatar: "/api/placeholder/150/150",
    bio: "",
    specialize: [],
    categories: [],
  },
  isEditing: false,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setEditData: (state, action) => {
      state.editData = { ...action.payload };
    },
    setIsEditing: (state, action) => {
      state.isEditing = action.payload;
    },
    resetEditData: (state) => {
      state.editData = { ...state.userData };
    },
    updateEditDataField: (state, action) => {
      const { name, value } = action.payload;
      state.editData[name] = value;
    },
    updateAvatar: (state, action) => {
      state.editData.avatar = action.payload;
    },
    addSpecialization: (state, action) => {
      if (!state.editData.specialize.includes(action.payload)) {
        state.editData.specialize.push(action.payload);
      }
    },
    removeSpecialization: (state, action) => {
      const index = action.payload;
      state.editData.specialize = state.editData.specialize.filter(
        (_, i) => i !== index
      );
    },
    // Clear profile error
    clearProfileError: (state) => {
      state.error = null;
    },
    // Sync categories from category slice
    syncCategoriesFromCategorySlice: (state, action) => {
      const categories = action.payload.map(cat => ({
        id: cat.id,
        name: cat.name
      }));
      
      state.userData.categories = categories;
      state.editData.categories = categories;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile cases
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.editData = { ...action.payload };
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save profile cases
      .addCase(saveProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.isEditing = false;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Listen to category slice changes
      .addCase('categories/fetchCategories/fulfilled', (state, action) => {
        // Sync categories when they are fetched
        const categories = action.payload.map(cat => ({
          id: cat.id,
          name: cat.name
        }));
        
        state.userData.categories = categories;
        if (!state.isEditing) {
          state.editData.categories = categories;
        }
      })
      .addCase('categories/createCategory/fulfilled', (state, action) => {
        // Add new category to profile
        const newCategory = {
          id: action.payload.id,
          name: action.payload.name
        };
        
        const existsInUserData = state.userData.categories.some(cat => cat.id === newCategory.id);
        if (!existsInUserData) {
          state.userData.categories.push(newCategory);
        }
        
        const existsInEditData = state.editData.categories.some(cat => cat.id === newCategory.id);
        if (!existsInEditData) {
          state.editData.categories.push(newCategory);
        }
      })
      .addCase('categories/updateCategory/fulfilled', (state, action) => {
        // Update category name in profile
        const updatedCategory = action.payload;
        
        // Update in userData
        const userDataIndex = state.userData.categories.findIndex(cat => cat.id === updatedCategory.id);
        if (userDataIndex !== -1) {
          state.userData.categories[userDataIndex].name = updatedCategory.name;
        }
        
        // Update in editData
        const editDataIndex = state.editData.categories.findIndex(cat => cat.id === updatedCategory.id);
        if (editDataIndex !== -1) {
          state.editData.categories[editDataIndex].name = updatedCategory.name;
        }
      })
      .addCase('categories/deleteCategory/fulfilled', (state, action) => {
        // Remove category from profile
        const deletedCategoryId = action.payload;
        
        state.userData.categories = state.userData.categories.filter(
          cat => cat.id !== deletedCategoryId
        );
        state.editData.categories = state.editData.categories.filter(
          cat => cat.id !== deletedCategoryId
        );
      });
  },
});

export const {
  setUserData,
  setEditData,
  setIsEditing,
  resetEditData,
  updateEditDataField,
  updateAvatar,
  addSpecialization,
  removeSpecialization,
  clearProfileError,
  syncCategoriesFromCategorySlice,
} = profileSlice.actions;

export default profileSlice.reducer;