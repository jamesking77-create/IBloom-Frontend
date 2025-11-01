import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get, post, del } from "../../utils/api";

/* ========================================================
   API SERVICES — simplified and performance-safe
======================================================== */
const fetchGalleryAPI = async () => {
  const { data } = await get("/api/gallery");
  return data?.data || [];
};

const uploadMediaAPI = async (files) => {
  const formData = new FormData();
  for (const file of files) formData.append("media", file);

  const { data } = await post("/api/gallery/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data || data; // normalize response
};

const deleteMediaAPI = async (id) => {
  await del(`/api/gallery/${id}`);
  return id;
};

/* ========================================================
   ASYNC THUNKS
======================================================== */
export const fetchGallery = createAsyncThunk(
  "gallery/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchGalleryAPI();
    } catch (err) {
      return rejectWithValue(err.message || "Unable to load gallery");
    }
  }
);

export const uploadMedia = createAsyncThunk(
  "gallery/upload",
  async (files, { rejectWithValue }) => {
    try {
      return await uploadMediaAPI(files);
    } catch (err) {
      return rejectWithValue(err.message || "Upload failed");
    }
  }
);

export const deleteMedia = createAsyncThunk(
  "gallery/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteMediaAPI(id);
    } catch (err) {
      return rejectWithValue(err.message || "Delete failed");
    }
  }
);

/* ========================================================
   SLICE
======================================================== */
const initialState = {
  items: [],
  loading: false,
  uploading: false,
  error: null,
};

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    clearGalleryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- FETCH ---------- */
      .addCase(fetchGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- UPLOAD ---------- */
      .addCase(uploadMedia.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.uploading = false;
        // prepend new uploads for instant feedback
        state.items.unshift(...action.payload);
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload && item._id !== action.payload
        );
      })
      .addCase(deleteMedia.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearGalleryError } = gallerySlice.actions;
export default gallerySlice.reducer;
