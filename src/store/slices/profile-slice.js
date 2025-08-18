import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get, put, post } from "../../utils/api";

// Local storage key for caching profile data
const PROFILE_CACHE_KEY = 'user_profile_data';

// Helper function to cache profile data in localStorage
const cacheProfileData = (data) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
      // Cache for 5 minutes
      expires: Date.now() + (5 * 60 * 1000)
    }));
  } catch (error) {
    console.warn('Failed to cache profile data:', error);
  }
};

// Helper function to get cached profile data
const getCachedProfileData = () => {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;
    
    const { data, expires } = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() > expires) {
      localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to get cached profile data:', error);
    return null;
  }
};

// Helper function to clear profile cache
const clearProfileCache = () => {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear profile cache:', error);
  }
};

// API service functions for profile operations
export const getProfileAPI = async () => {
  const response = await get("/api/users/profile");
  return response?.data?.data?.user;
};

export const updateProfileAPI = async (profileData) => {
  // If profileData contains an avatar file, send as FormData
  if (profileData.avatar instanceof File) {
    const formData = new FormData();

    // Append all profile data to FormData
    Object.keys(profileData).forEach((key) => {
      if (key === "avatar") {
        formData.append("avatar", profileData.avatar);
      } else if (Array.isArray(profileData[key])) {
        formData.append(key, JSON.stringify(profileData[key]));
      } else {
        formData.append(key, profileData[key]);
      }
    });

    const response = await put("/api/users/updateProfile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } else {
    // Regular JSON update (no file)
    const response = await put("/api/users/updateProfile", profileData);
    return response.data;
  }
};

// Enhanced async thunk for fetching profile with caching
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (options = {}, { rejectWithValue }) => {
    try {
      const { forceRefresh = false, useCache = true } = options;
      
      // Try to get cached data first (if not forcing refresh and cache is enabled)
      if (!forceRefresh && useCache) {
        const cachedData = getCachedProfileData();
        if (cachedData) {
          console.log('Using cached profile data');
          return cachedData;
        }
      }
      
      console.log('Fetching fresh profile data from API');
      const data = await getProfileAPI();
      
      // Cache the fresh data
      if (data) {
        cacheProfileData(data);
      }
      
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      
      // If API fails, try to fallback to cached data
      const cachedData = getCachedProfileData();
      if (cachedData) {
        console.log('API failed, using cached profile data as fallback');
        return cachedData;
      }
      
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

// Enhanced save profile thunk with cache invalidation
export const saveProfile = createAsyncThunk(
  "profile/saveProfile",
  async (avatarFile = null, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const profileData = { ...state.profile.editData };
      
      // If there's a selected avatar file, add it to the profile data
      if (avatarFile && avatarFile instanceof File) {
        // Validate file before upload
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (avatarFile.size > maxSize) {
          throw new Error('File size must be less than 5MB');
        }
        
        if (!allowedTypes.includes(avatarFile.type)) {
          throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
        }
        
        profileData.avatar = avatarFile;
      }
      
      const data = await updateProfileAPI(profileData);
      const updatedUser = data.data.user;
      
      // Clear old cache and cache the new data
      clearProfileCache();
      cacheProfileData(updatedUser);
      
      console.log("Profile saved and cached:", updatedUser);
      
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to save profile");
    }
  }
);

// Optional: Async thunk for updating specific profile fields
export const updateProfileField = createAsyncThunk(
  "profile/updateProfileField",
  async (fieldData, { rejectWithValue }) => {
    try {
      const data = await updateProfileAPI(fieldData);
      
      // Update cache with new field data
      const cachedData = getCachedProfileData();
      if (cachedData) {
        const updatedData = { ...cachedData, ...data };
        cacheProfileData(updatedData);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update profile field");
    }
  }
);

// Action to load profile from cache
export const loadProfileFromCache = createAsyncThunk(
  "profile/loadProfileFromCache",
  async (_, { rejectWithValue }) => {
    try {
      const cachedData = getCachedProfileData();
      if (cachedData) {
        return cachedData;
      }
      return rejectWithValue("No cached data available");
    } catch (error) {
      return rejectWithValue("Failed to load cached profile");
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
    avatar: null,
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
    avatar: null,
    bio: "",
    specialize: [],
    categories: [],
  },
  isEditing: false,
  loading: false,
  error: null,
  saving: false,
  selectedAvatarFile: null,
  lastFetched: null, // Track when data was last fetched
  isFromCache: false, // Track if current data is from cache
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.lastFetched = Date.now();
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
    setSelectedAvatarFile: (state, action) => {
      state.selectedAvatarFile = action.payload;
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
    clearProfileError: (state) => {
      state.error = null;
    },
    clearLoadingStates: (state) => {
      state.loading = false;
      state.saving = false;
    },
    // Action to clear profile cache manually
    clearCache: (state) => {
      clearProfileCache();
      state.isFromCache = false;
    },
    // Action to force refresh profile data
    forceRefresh: (state) => {
      clearProfileCache();
      state.isFromCache = false;
    },
    syncCategoriesFromCategorySlice: (state, action) => {
      const categories = action.payload.map((cat) => ({
        id: cat.id,
        name: cat.name,
      }));

      state.userData.categories = categories;
      state.editData.categories = categories;
      
      // Update cache with new categories
      const cachedData = getCachedProfileData();
      if (cachedData) {
        cacheProfileData({ ...cachedData, categories });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load profile from cache cases
      .addCase(loadProfileFromCache.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.editData = { ...action.payload };
        state.isFromCache = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadProfileFromCache.rejected, (state) => {
        state.isFromCache = false;
      })
      // Fetch profile cases (enhanced with cache handling)
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.editData = { ...action.payload };
        state.lastFetched = Date.now();
        state.isFromCache = false; // This is fresh data
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't clear userData if we have cached data as fallback
      })
      // Save profile cases (enhanced with cache updates)
      .addCase(saveProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.userData = action.payload;
        state.editData = { ...action.payload };
        state.isEditing = false;
        state.selectedAvatarFile = null;
        state.lastFetched = Date.now();
        state.isFromCache = false;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Update profile field cases (enhanced with cache updates)
      .addCase(updateProfileField.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProfileField.fulfilled, (state, action) => {
        state.saving = false;
        state.userData = { ...state.userData, ...action.payload };
        state.editData = { ...state.editData, ...action.payload };
        state.lastFetched = Date.now();
      })
      .addCase(updateProfileField.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Listen to category slice changes (enhanced with cache updates)
      .addCase("categories/fetchCategories/fulfilled", (state, action) => {
        const categories = action.payload.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }));

        state.userData.categories = categories;
        if (!state.isEditing) {
          state.editData.categories = categories;
        }
        
        // Update cache with new categories
        const cachedData = getCachedProfileData();
        if (cachedData) {
          cacheProfileData({ ...cachedData, categories });
        }
      })
      .addCase("categories/createCategory/fulfilled", (state, action) => {
        const newCategory = {
          id: action.payload.id,
          name: action.payload.name,
        };

        const existsInUserData = state.userData.categories.some(
          (cat) => cat.id === newCategory.id
        );
        if (!existsInUserData) {
          state.userData.categories.push(newCategory);
        }

        const existsInEditData = state.editData.categories.some(
          (cat) => cat.id === newCategory.id
        );
        if (!existsInEditData) {
          state.editData.categories.push(newCategory);
        }
        
        // Update cache
        const cachedData = getCachedProfileData();
        if (cachedData) {
          const updatedCategories = [...(cachedData.categories || []), newCategory];
          cacheProfileData({ ...cachedData, categories: updatedCategories });
        }
      })
      .addCase("categories/updateCategory/fulfilled", (state, action) => {
        const updatedCategory = action.payload;

        const userDataIndex = state.userData.categories.findIndex(
          (cat) => cat.id === updatedCategory.id
        );
        if (userDataIndex !== -1) {
          state.userData.categories[userDataIndex].name = updatedCategory.name;
        }

        const editDataIndex = state.editData.categories.findIndex(
          (cat) => cat.id === updatedCategory.id
        );
        if (editDataIndex !== -1) {
          state.editData.categories[editDataIndex].name = updatedCategory.name;
        }
        
        // Update cache
        const cachedData = getCachedProfileData();
        if (cachedData && cachedData.categories) {
          const categoryIndex = cachedData.categories.findIndex(
            (cat) => cat.id === updatedCategory.id
          );
          if (categoryIndex !== -1) {
            cachedData.categories[categoryIndex].name = updatedCategory.name;
            cacheProfileData(cachedData);
          }
        }
      })
      .addCase("categories/deleteCategory/fulfilled", (state, action) => {
        const deletedCategoryId = action.payload;

        state.userData.categories = state.userData.categories.filter(
          (cat) => cat.id !== deletedCategoryId
        );
        state.editData.categories = state.editData.categories.filter(
          (cat) => cat.id !== deletedCategoryId
        );
        
        // Update cache
        const cachedData = getCachedProfileData();
        if (cachedData && cachedData.categories) {
          const updatedCategories = cachedData.categories.filter(
            (cat) => cat.id !== deletedCategoryId
          );
          cacheProfileData({ ...cachedData, categories: updatedCategories });
        }
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
  setSelectedAvatarFile,
  addSpecialization,
  removeSpecialization,
  clearProfileError,
  clearLoadingStates,
  clearCache,
  forceRefresh,
  syncCategoriesFromCategorySlice,
} = profileSlice.actions;

// Selectors
export const selectProfileData = (state) => state.profile.userData;
export const selectIsProfileLoading = (state) => state.profile.loading;
export const selectProfileError = (state) => state.profile.error;
export const selectIsFromCache = (state) => state.profile.isFromCache;
export const selectLastFetched = (state) => state.profile.lastFetched;

// Helper function to check if profile data needs refresh
export const shouldRefreshProfile = (state) => {
  const lastFetched = selectLastFetched(state);
  if (!lastFetched) return true;
  
  // Refresh if data is older than 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - lastFetched > fiveMinutes;
};

export default profileSlice.reducer;