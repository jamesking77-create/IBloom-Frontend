import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get, put, post } from "../../utils/api";

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

// Async thunk for fetching profile from backend
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProfileAPI();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

// Only showing the key changes to your existing profile slice

// Update the saveProfile thunk (replace your existing one)
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
      console.log("new profile data: ",data.data.user);
      
      return data.data.user; // Return the updated user data
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
    avatar: null, // Will store the avatar object from your backend
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
    avatar: null, // Will store the avatar object from your backend
    bio: "",
    specialize: [],
    categories: [],
  },
  isEditing: false,
  loading: false,
  error: null,
  saving: false,
  selectedAvatarFile: null, // NEW: Store the selected file before upload
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
    // NEW: Set selected avatar file
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
    syncCategoriesFromCategorySlice: (state, action) => {
      const categories = action.payload.map((cat) => ({
        id: cat.id,
        name: cat.name,
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
      // Save profile cases (now handles both profile + avatar upload)
      .addCase(saveProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.userData = action.payload;
        state.editData = { ...action.payload };
        state.isEditing = false;
        state.selectedAvatarFile = null; // Clear selected file after save
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
      })
      .addCase("categories/deleteCategory/fulfilled", (state, action) => {
        const deletedCategoryId = action.payload;

        state.userData.categories = state.userData.categories.filter(
          (cat) => cat.id !== deletedCategoryId
        );
        state.editData.categories = state.editData.categories.filter(
          (cat) => cat.id !== deletedCategoryId
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
  setSelectedAvatarFile, // NEW
  addSpecialization,
  removeSpecialization,
  clearProfileError,
  clearLoadingStates,
  syncCategoriesFromCategorySlice,
} = profileSlice.actions;

export default profileSlice.reducer;
