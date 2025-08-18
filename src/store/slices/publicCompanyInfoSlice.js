import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "../../utils/api";

// Public API service function - no authentication required
export const getCompanyInfoAPI = async () => {
  const response = await get("/api/company/info");
  return response?.data?.data?.company;
};

// Async thunk for fetching public company information
export const fetchCompanyInfo = createAsyncThunk(
  "public/fetchCompanyInfo",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🚀 Calling company info API...");
      const data = await getCompanyInfoAPI();
      
      // Detailed logging of the response
      console.log("=== FULL API RESPONSE ===");
      console.log("📦 Raw Response Data:", data);
      console.log("📊 Data Type:", typeof data);
      console.log("📋 Data Keys:", data ? Object.keys(data) : 'No data');
      
      // Log each field individually for mapping
      if (data) {
        console.log("=== FIELD MAPPING ===");
        console.log("🏢 name:", data.name);
        console.log("📧 email:", data.email);
        console.log("📱 phone:", data.phone);
        console.log("📍 location:", data.location);
        console.log("📝 bio:", data.bio);
        console.log("🎯 specialize:", data.specialize);
        console.log("📂 categories:", data.categories);
        console.log("🗓️ joinDate:", data.joinDate);
        console.log("🖼️ avatar:", data.avatar);
        console.log("🆔 _id:", data._id);
        console.log("👤 role:", data.role);
        console.log("✅ isEmailVerified:", data.isEmailVerified);
        console.log("🔐 password:", data.password ? "***HIDDEN***" : "No password");
        console.log("📅 updatedAt:", data.updatedAt);
        console.log("========================");
      }
      
      return data;
    } catch (error) {
      console.error("❌ Company Info API Error:", error);
      console.error("📋 Error Response:", error.response?.data);
      console.error("🔢 Error Status:", error.response?.status);
      console.error("📝 Error Message:", error.message);
      return rejectWithValue(error.message || "Failed to fetch company information");
    }
  }
);

// Initial state for public company information
const initialState = {
  companyInfo: {
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
  loading: false,
  error: null,
  lastFetched: null,
};

const publicSlice = createSlice({
  name: "public",
  initialState,
  reducers: {
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset all public data
    resetPublicData: (state) => {
      state.companyInfo = initialState.companyInfo;
      state.error = null;
      state.lastFetched = null;
    },
    
    // Update specific company info field (for real-time updates if needed)
    updateCompanyInfoField: (state, action) => {
      const { field, value } = action.payload;
      state.companyInfo[field] = value;
    },
    
    // Sync categories from category slice
    syncCategoriesFromCategorySlice: (state, action) => {
      const categories = action.payload.map((cat) => ({
        id: cat.id,
        name: cat.name,
      }));
      state.companyInfo.categories = categories;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch company info cases
      .addCase(fetchCompanyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.companyInfo = action.payload;
        state.lastFetched = new Date().toISOString();

      })
      .addCase(fetchCompanyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Failed to load company info:", action.payload);
      })
      
      // Listen to category slice changes to keep categories in sync
      .addCase("categories/fetchCategories/fulfilled", (state, action) => {
        const categories = action.payload.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }));
        state.companyInfo.categories = categories;
        console.log("🔄 Categories synced from category slice:", categories);
      })
      
      .addCase("categories/createCategory/fulfilled", (state, action) => {
        const newCategory = {
          id: action.payload.id,
          name: action.payload.name,
        };
        
        const exists = state.companyInfo.categories.some(
          (cat) => cat.id === newCategory.id
        );
        
        if (!exists) {
          state.companyInfo.categories.push(newCategory);
          console.log("➕ New category added to public state:", newCategory);
        }
      })
      
      .addCase("categories/updateCategory/fulfilled", (state, action) => {
        const updatedCategory = action.payload;
        const categoryIndex = state.companyInfo.categories.findIndex(
          (cat) => cat.id === updatedCategory.id
        );
        
        if (categoryIndex !== -1) {
          state.companyInfo.categories[categoryIndex].name = updatedCategory.name;
          console.log("📝 Category updated in public state:", updatedCategory);
        }
      })
      
      .addCase("categories/deleteCategory/fulfilled", (state, action) => {
        const deletedCategoryId = action.payload;
        state.companyInfo.categories = state.companyInfo.categories.filter(
          (cat) => cat.id !== deletedCategoryId
        );
        console.log("🗑️ Category removed from public state:", deletedCategoryId);
      });
  },
});

// Export actions
export const {
  clearError,
  resetPublicData,
  updateCompanyInfoField,
  syncCategoriesFromCategorySlice,
} = publicSlice.actions;

// Export selectors for easy access
export const selectCompanyInfo = (state) => state.public.companyInfo;
export const selectPublicLoading = (state) => state.public.loading;
export const selectPublicError = (state) => state.public.error;
export const selectLastFetched = (state) => state.public.lastFetched;

// Export reducer
export default publicSlice.reducer;