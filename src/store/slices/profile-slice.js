import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get, put, post } from "../../utils/api";

// Local storage keys for caching profile data
const PROFILE_CACHE_KEY = 'user_profile_data';
const PUBLIC_PROFILE_CACHE_KEY = 'public_business_profile_data';

// Helper functions for caching private profile data
const cacheProfileData = (data) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
      expires: Date.now() + (5 * 60 * 1000) // Cache for 5 minutes
    }));
  } catch (error) {
    console.warn('Failed to cache profile data:', error);
  }
};

const getCachedProfileData = () => {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;
    
    const { data, expires } = JSON.parse(cached);
    
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

// Helper functions for caching public profile data
const cachePublicProfileData = (data) => {
  try {
    localStorage.setItem(PUBLIC_PROFILE_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
      expires: Date.now() + (10 * 60 * 1000) // Cache for 10 minutes for public data
    }));
  } catch (error) {
    console.warn('Failed to cache public profile data:', error);
  }
};

const getCachedPublicProfileData = () => {
  try {
    const cached = localStorage.getItem(PUBLIC_PROFILE_CACHE_KEY);
    if (!cached) return null;
    
    const { data, expires } = JSON.parse(cached);
    
    if (Date.now() > expires) {
      localStorage.removeItem(PUBLIC_PROFILE_CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to get cached public profile data:', error);
    return null;
  }
};

const clearProfileCache = () => {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    localStorage.removeItem(PUBLIC_PROFILE_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear profile cache:', error);
  }
};

// API service functions
export const getProfileAPI = async () => {
  const response = await get("/api/users/profile");
  return response?.data?.data?.user;
};

export const getPublicProfileAPI = async () => {
  const response = await get("/api/public/business-profile");
  return response?.data?.data?.user;
};

export const updateProfileAPI = async (profileData) => {
  if (profileData.avatar instanceof File) {
    const formData = new FormData();

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
    const response = await put("/api/users/updateProfile", profileData);
    return response.data;
  }
};

// NEW: Public profile fetch thunk (for unauthenticated users)
export const fetchPublicProfile = createAsyncThunk(
  "profile/fetchPublicProfile",
  async (options = {}, { rejectWithValue }) => {
    try {
      const { forceRefresh = false, useCache = true } = options;
      
      // Try cached data first
      if (!forceRefresh && useCache) {
        const cachedData = getCachedPublicProfileData();
        if (cachedData) {
          console.log('Using cached public profile data');
          return cachedData;
        }
      }
      
      console.log('Fetching fresh public profile data from API');
      const data = await getPublicProfileAPI();
      
      // Cache the fresh data
      if (data) {
        cachePublicProfileData(data);
      }
      
      return data;
    } catch (error) {
      console.error('Public profile fetch error:', error);
      
      // Fallback to cached data if API fails
      const cachedData = getCachedPublicProfileData();
      if (cachedData) {
        console.log('API failed, using cached public profile data as fallback');
        return cachedData;
      }
      
      return rejectWithValue(error.message || "Failed to fetch public profile");
    }
  }
);

// Enhanced fetchProfile thunk with public fallback
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (options = {}, { rejectWithValue, dispatch }) => {
    try {
      const { forceRefresh = false, useCache = true, fallbackToPublic = true } = options;
      
      // Try to get cached authenticated data first
      if (!forceRefresh && useCache) {
        const cachedData = getCachedProfileData();
        if (cachedData) {
          console.log('Using cached authenticated profile data');
          return { data: cachedData, isPublic: false };
        }
      }
      
      console.log('Fetching fresh authenticated profile data from API');
      const data = await getProfileAPI();
      
      // Cache the fresh data
      if (data) {
        cacheProfileData(data);
      }
      
      return { data, isPublic: false };
    } catch (error) {
      console.error('Authenticated profile fetch error:', error);
      
      // If authenticated fetch fails and fallbackToPublic is true, try public endpoint
      if (fallbackToPublic) {
        console.log('Falling back to public profile data');
        try {
          const publicProfileResult = await dispatch(fetchPublicProfile({ useCache })).unwrap();
          return { data: publicProfileResult, isPublic: true };
        } catch (publicError) {
          console.error('Public profile fallback also failed:', publicError);
        }
      }
      
      // If we have any cached data as final fallback
      const cachedPrivateData = getCachedProfileData();
      const cachedPublicData = getCachedPublicProfileData();
      
      if (cachedPrivateData) {
        console.log('Using cached private data as final fallback');
        return { data: cachedPrivateData, isPublic: false };
      } else if (cachedPublicData) {
        console.log('Using cached public data as final fallback');
        return { data: cachedPublicData, isPublic: true };
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
      
      if (avatarFile && avatarFile instanceof File) {
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
      cachePublicProfileData(updatedUser); // Also update public cache
      
      console.log("Profile saved and cached:", updatedUser);
      
      return { data: updatedUser, isPublic: false };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to save profile");
    }
  }
);

// Update profile field thunk
export const updateProfileField = createAsyncThunk(
  "profile/updateProfileField",
  async (fieldData, { rejectWithValue }) => {
    try {
      const data = await updateProfileAPI(fieldData);
      
      // Update both caches with new field data
      const cachedPrivateData = getCachedProfileData();
      const cachedPublicData = getCachedPublicProfileData();
      
      if (cachedPrivateData) {
        const updatedPrivateData = { ...cachedPrivateData, ...data };
        cacheProfileData(updatedPrivateData);
      }
      
      if (cachedPublicData) {
        const updatedPublicData = { ...cachedPublicData, ...data };
        cachePublicProfileData(updatedPublicData);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update profile field");
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
  lastFetched: null,
  isFromCache: false,
  isPublicData: false, // Track if current data is from public endpoint
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
    clearCache: (state) => {
      clearProfileCache();
      state.isFromCache = false;
    },
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
      
      // Update both caches with new categories
      const cachedPrivateData = getCachedProfileData();
      const cachedPublicData = getCachedPublicProfileData();
      
      if (cachedPrivateData) {
        cacheProfileData({ ...cachedPrivateData, categories });
      }
      
      if (cachedPublicData) {
        cachePublicProfileData({ ...cachedPublicData, categories });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle public profile fetch
      .addCase(fetchPublicProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.editData = { ...action.payload };
        state.lastFetched = Date.now();
        state.isFromCache = false;
        state.isPublicData = true;
        state.error = null;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Enhanced fetchProfile cases
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload.data;
        state.editData = { ...action.payload.data };
        state.lastFetched = Date.now();
        state.isFromCache = false;
        state.isPublicData = action.payload.isPublic;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save profile cases
      .addCase(saveProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.userData = action.payload.data;
        state.editData = { ...action.payload.data };
        state.isEditing = false;
        state.selectedAvatarFile = null;
        state.lastFetched = Date.now();
        state.isFromCache = false;
        state.isPublicData = action.payload.isPublic;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Update profile field cases
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
      // Listen to category slice changes
      .addCase("categories/fetchCategories/fulfilled", (state, action) => {
        const categories = action.payload.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }));

        state.userData.categories = categories;
        if (!state.isEditing) {
          state.editData.categories = categories;
        }
        
        // Update both caches with new categories
        const cachedPrivateData = getCachedProfileData();
        const cachedPublicData = getCachedPublicProfileData();
        
        if (cachedPrivateData) {
          cacheProfileData({ ...cachedPrivateData, categories });
        }
        
        if (cachedPublicData) {
          cachePublicProfileData({ ...cachedPublicData, categories });
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
        
        // Update both caches
        const cachedPrivateData = getCachedProfileData();
        const cachedPublicData = getCachedPublicProfileData();
        
        if (cachedPrivateData) {
          const updatedCategories = [...(cachedPrivateData.categories || []), newCategory];
          cacheProfileData({ ...cachedPrivateData, categories: updatedCategories });
        }
        
        if (cachedPublicData) {
          const updatedCategories = [...(cachedPublicData.categories || []), newCategory];
          cachePublicProfileData({ ...cachedPublicData, categories: updatedCategories });
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
        
        // Update both caches
        const cachedPrivateData = getCachedProfileData();
        const cachedPublicData = getCachedPublicProfileData();
        
        if (cachedPrivateData && cachedPrivateData.categories) {
          const categoryIndex = cachedPrivateData.categories.findIndex(
            (cat) => cat.id === updatedCategory.id
          );
          if (categoryIndex !== -1) {
            cachedPrivateData.categories[categoryIndex].name = updatedCategory.name;
            cacheProfileData(cachedPrivateData);
          }
        }
        
        if (cachedPublicData && cachedPublicData.categories) {
          const categoryIndex = cachedPublicData.categories.findIndex(
            (cat) => cat.id === updatedCategory.id
          );
          if (categoryIndex !== -1) {
            cachedPublicData.categories[categoryIndex].name = updatedCategory.name;
            cachePublicProfileData(cachedPublicData);
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
        
        // Update both caches
        const cachedPrivateData = getCachedProfileData();
        const cachedPublicData = getCachedPublicProfileData();
        
        if (cachedPrivateData && cachedPrivateData.categories) {
          const updatedCategories = cachedPrivateData.categories.filter(
            (cat) => cat.id !== deletedCategoryId
          );
          cacheProfileData({ ...cachedPrivateData, categories: updatedCategories });
        }
        
        if (cachedPublicData && cachedPublicData.categories) {
          const updatedCategories = cachedPublicData.categories.filter(
            (cat) => cat.id !== deletedCategoryId
          );
          cachePublicProfileData({ ...cachedPublicData, categories: updatedCategories });
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
export const selectIsPublicData = (state) => state.profile.isPublicData;
export const selectLastFetched = (state) => state.profile.lastFetched;

export default profileSlice.reducer;