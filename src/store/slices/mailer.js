import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { get, put, post, del } from "../../utils/api";

const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Async thunk for fetching mails from bookings
export const fetchBookingMails = createAsyncThunk(
  "mailer/fetchBookingMails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get("/api/bookings/emails");
      return response?.data?.data?.email;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for uploading attachments - Send file to backend
export const uploadAttachment = createAsyncThunk(
  "mailer/uploadAttachment",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Send file to backend for actual upload (Cloudinary or other service)
      const response = await fetch("/api/mailer/upload-attachment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload attachment");
      }

      const data = await response.json();
      
      // Return the actual response from backend
      return {
        id: data.id || Date.now() + Math.random(), // Use backend ID if available
        name: file.name,
        size: file.size,
        type: file.type,
        url: data.url, // Actual URL from backend
        cloudinaryUrl: data.cloudinaryUrl || data.url, // Backend provides the real Cloudinary URL
        publicId: data.publicId, // Store Cloudinary public ID if needed
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for sending individual email with attachments
export const sendIndividualMail = createAsyncThunk(
  "mailer/sendIndividualMail",
  async (
    { email, subject, message, customerName, attachments = [] },
    { rejectWithValue }
  ) => {
    try {
      const response = await post(
        "/api/mailer/send-individual",
        {
          to: email,
          subject,
          message,
          customerName,
          attachments: attachments.map((att) => ({
            id: att.id,
            name: att.name,
            url: att.cloudinaryUrl || att.url,
            type: att.type,
            publicId: att.publicId, // Include publicId if backend needs it
          })),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      return {
        email,
        subject,
        message,
        attachments,
        sentAt: new Date().toISOString(),
        customerName,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send email");
    }
  }
);

// Async thunk for broadcasting email with attachments
export const broadcastMail = createAsyncThunk(
  "mailer/broadcastMail",
  async (
    { subject, message, recipients, attachments = [] },
    { rejectWithValue }
  ) => {
    try {
      const response = await post(
        "/api/mailer/broadcast",
        {
          subject,
          message,
          recipients,
          attachments: attachments.map((att) => ({
            id: att.id,
            name: att.name,
            url: att.cloudinaryUrl || att.url,
            type: att.type,
            publicId: att.publicId, // Include publicId if backend needs it
          })),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      return {
        subject,
        message,
        attachments,
        recipientCount: recipients.length,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching mail history
export const fetchMailHistory = createAsyncThunk(
  "mailer/fetchMailHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get("/api/mailer/history", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Sample data for development
const sampleMails = [
  {
    id: 1,
    customerName: "Mayopo Adeoye",
    email: "adeoyemayopoelijah@gmail.com",
    eventType: "Wedding Reception",
    bookingDate: "2024-06-15",
    status: "pending",
  },
  {
    id: 2,
    customerName: "Michael Chen",
    email: "michael.chen@company.com",
    eventType: "Corporate Event",
    bookingDate: "2024-06-18",
    status: "confirmed",
  },
  {
    id: 3,
    customerName: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    eventType: "Birthday Party",
    bookingDate: "2024-06-20",
    status: "pending",
  },
  {
    id: 4,
    customerName: "David Thompson",
    email: "david.thompson@email.com",
    eventType: "Anniversary Dinner",
    bookingDate: "2024-06-22",
    status: "confirmed",
  },
  {
    id: 5,
    customerName: "Lisa Wang",
    email: "lisa.wang@email.com",
    eventType: "Baby Shower",
    bookingDate: "2024-06-25",
    status: "pending",
  },
];

const initialState = {
  // Mail recipients from bookings
  bookingMails: sampleMails,

  // Mail composition
  mailComposition: {
    type: "individual", // 'individual' or 'broadcast'
    recipient: null,
    subject: "",
    message: "",
    attachments: [],
    isComposing: false,
  },

  // Mail history
  mailHistory: [],

  // UI state
  loading: false,
  sendingMail: false,
  uploadingAttachment: false,
  error: null,

  // Filters and search
  searchQuery: "",
  statusFilter: "all", // 'all', 'pending', 'confirmed'

  // Statistics
  stats: {
    totalRecipients: sampleMails.length,
    emailsSentToday: 0,
    emailsSentThisMonth: 0,
    lastEmailSent: null,
  },
};

const mailerSlice = createSlice({
  name: "mailer",
  initialState,
  reducers: {
    // Mail composition actions
    startComposing: (state, action) => {
      state.mailComposition.isComposing = true;
      state.mailComposition.type = action.payload.type;
      state.mailComposition.recipient = action.payload.recipient || null;
      state.mailComposition.subject = "";
      state.mailComposition.message = "";
      state.mailComposition.attachments = [];
    },

    updateMailSubject: (state, action) => {
      state.mailComposition.subject = action.payload;
    },

    updateMailMessage: (state, action) => {
      state.mailComposition.message = action.payload;
    },

    // Attachment actions
    addAttachment: (state, action) => {
      state.mailComposition.attachments.push(action.payload);
    },

    removeAttachment: (state, action) => {
      state.mailComposition.attachments =
        state.mailComposition.attachments.filter(
          (att) => att.id !== action.payload
        );
    },

    clearAttachments: (state) => {
      state.mailComposition.attachments = [];
    },

    clearComposition: (state) => {
      state.mailComposition = {
        type: "individual",
        recipient: null,
        subject: "",
        message: "",
        attachments: [],
        isComposing: false,
      };
    },

    // Filter actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    // Load sample data
    loadSampleData: (state) => {
      state.bookingMails = sampleMails;
      state.stats.totalRecipients = sampleMails.length;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch booking mails
      .addCase(fetchBookingMails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingMails.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingMails = action.payload.emails || [];
        state.stats = { ...state.stats, ...action.payload.stats };
      })
      .addCase(fetchBookingMails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Fallback to sample data
        state.bookingMails = sampleMails;
      })

      // Upload attachment
      .addCase(uploadAttachment.pending, (state) => {
        state.uploadingAttachment = true;
        state.error = null;
      })
      .addCase(uploadAttachment.fulfilled, (state, action) => {
        state.uploadingAttachment = false;
        state.mailComposition.attachments.push(action.payload);
      })
      .addCase(uploadAttachment.rejected, (state, action) => {
        state.uploadingAttachment = false;
        state.error = action.payload;
      })

      // Send individual mail
      .addCase(sendIndividualMail.pending, (state) => {
        state.sendingMail = true;
        state.error = null;
      })
      .addCase(sendIndividualMail.fulfilled, (state, action) => {
        state.sendingMail = false;
        // Add to mail history
        state.mailHistory.unshift({
          id: Date.now(),
          type: "individual",
          ...action.payload,
        });
        // Update stats
        state.stats.emailsSentToday += 1;
        state.stats.emailsSentThisMonth += 1;
        state.stats.lastEmailSent = action.payload.sentAt;
        // Clear composition
        state.mailComposition = {
          type: "individual",
          recipient: null,
          subject: "",
          message: "",
          attachments: [],
          isComposing: false,
        };
      })
      .addCase(sendIndividualMail.rejected, (state, action) => {
        state.sendingMail = false;
        state.error = action.payload;
      })

      // Broadcast mail
      .addCase(broadcastMail.pending, (state) => {
        state.sendingMail = true;
        state.error = null;
      })
      .addCase(broadcastMail.fulfilled, (state, action) => {
        state.sendingMail = false;
        // Add to mail history
        state.mailHistory.unshift({
          id: Date.now(),
          type: "broadcast",
          ...action.payload,
        });
        // Update stats
        state.stats.emailsSentToday += action.payload.recipientCount;
        state.stats.emailsSentThisMonth += action.payload.recipientCount;
        state.stats.lastEmailSent = action.payload.sentAt;
        // Clear composition
        state.mailComposition = {
          type: "individual",
          recipient: null,
          subject: "",
          message: "",
          attachments: [],
          isComposing: false,
        };
      })
      .addCase(broadcastMail.rejected, (state, action) => {
        state.sendingMail = false;
        state.error = action.payload;
      })

      // Fetch mail history
      .addCase(fetchMailHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMailHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.mailHistory = action.payload.history || [];
      })
      .addCase(fetchMailHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  startComposing,
  updateMailSubject,
  updateMailMessage,
  addAttachment,
  removeAttachment,
  clearAttachments,
  clearComposition,
  setSearchQuery,
  setStatusFilter,
  clearError,
  loadSampleData,
} = mailerSlice.actions;

// Selectors
export const selectBookingMails = (state) => state.mailer?.bookingMails || [];
export const selectMailComposition = (state) =>
  state.mailer?.mailComposition || initialState.mailComposition;
export const selectMailHistory = (state) => state.mailer?.mailHistory || [];
export const selectMailerLoading = (state) => state.mailer?.loading || false;
export const selectSendingMail = (state) => state.mailer?.sendingMail || false;
export const selectUploadingAttachment = (state) =>
  state.mailer?.uploadingAttachment || false;
export const selectMailerError = (state) => state.mailer?.error || null;
export const selectSearchQuery = (state) => state.mailer?.searchQuery || "";
export const selectStatusFilter = (state) =>
  state.mailer?.statusFilter || "all";
export const selectMailerStats = (state) =>
  state.mailer?.stats || initialState.stats;

// Memoized filtered mails selector
export const selectFilteredMails = createSelector(
  [selectBookingMails, selectSearchQuery, selectStatusFilter],
  (mails, searchQuery, statusFilter) => {
    if (!Array.isArray(mails)) return [];

    return mails.filter((mail) => {
      const matchesStatus =
        statusFilter === "all" || mail.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        mail.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mail.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mail.eventType?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }
);

export default mailerSlice.reducer;