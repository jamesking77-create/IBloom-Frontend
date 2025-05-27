import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// You would replace this with an actual API call
const fetchProfileFromAPI = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'Username',
        email: 'companyemail@example.com',
        phone: 'phone number',
        location: 'address',
        joinDate: Date.now(),
        avatar: '/api/placeholder/150/150',
        bio: 'Software developer with 5 years of experience in React and Node.js. Passionate about building user-friendly interfaces and solving complex problems.',
        specialize: ['Decor', 'Event Planning', 'Catering', 'Rental'],
        categories: [
          { name: 'Chairs' ,types:[ 
            {
              item_name: "",
              describtion:"",
              quantity: " ",
              price : ""
            }
          ] },
          { name: 'Tables' },
          { name: 'Lighting' }
        ]
      });
    }, 500);
  });
};

// Async thunk for fetching profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchProfileFromAPI();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

// Async thunk for saving profile changes
export const saveProfile = createAsyncThunk(
  'profile/saveProfile',
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
      return rejectWithValue(error.message || 'Failed to save profile');
    }
  }
);

const initialState = {
  userData: {
    name: '',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    avatar: '/api/placeholder/150/150',
    bio: '',
    specialize: [],
    categories: []
  },
  editData: {
    name: '',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    avatar: '/api/placeholder/150/150',
    bio: '',
    specialize: [],
    categories: []
  },
  isEditing: false,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
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
      state.editData.specialize = state.editData.specialize.filter((_, i) => i !== index);
    },
    addCategory: (state, action) => {
      state.editData.categories.push({ name: action.payload });
    },
    removeCategory: (state, action) => {
      const index = action.payload;
      state.editData.categories = state.editData.categories.filter((_, i) => i !== index);
    },
    // This local action is replaced by the saveProfile async thunk
    clearProfileError: (state) => {
      state.error = null;
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
  addCategory,
  removeCategory,
  clearProfileError
} = profileSlice.actions;

export default profileSlice.reducer;