import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { get, post } from "../../utils/api";

const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Helper function to create form data for file uploads (copied from categories)
const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    if (key === "attachments" && Array.isArray(data[key])) {
      // CRITICAL FIX: Handle attachments array - add each file individually
      data[key].forEach((attachment) => {
        if (attachment.file instanceof File) {
          // Append the actual File object, not the attachment wrapper
          formData.append("attachments", attachment.file);
        }
      });
    } else if (key === "recipients" && Array.isArray(data[key])) {
      // For broadcast recipients, stringify the array
      formData.append(key, JSON.stringify(data[key]));
    } else if (data[key] instanceof File) {
      // Handle direct file upload
      formData.append(key, data[key]);
    } else if (key !== "imagePreview" && key !== "imageFile") {
      // Include all other fields as strings
      formData.append(key, String(data[key]));
    }
  });
  
  return formData;
};

// Async thunk for fetching mails from bookings - FIXED to use new endpoint
export const fetchBookingMails = createAsyncThunk(
  "mailer/fetchBookingMails",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching booking emails from API...");
      const response = await get("/api/bookings/emails");
      console.log("API response received:", response?.data);
      return response?.data?.data;
    } catch (error) {
      console.error("Failed to fetch booking emails:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Add file to attachments (no upload, just store file)
// In your Redux slice - update addFileAttachment
export const addFileAttachment = createAsyncThunk(
  "mailer/addFileAttachment",
  async (file, { rejectWithValue }) => {
    try {
      console.log("Adding file attachment:", file.name, file.type, file.size);

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain", "text/csv"
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not supported for ${file.name}`);
      }

      // Create preview URL for images
      let preview = null;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      // Return attachment object with the actual File object
      return {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file, // CRITICAL: Keep the actual File object for upload
        preview: preview, // URL for preview (will be revoked later)
        lastModified: file.lastModified,
      };
    } catch (error) {
      console.error("Error adding attachment:", error);
      return rejectWithValue(error.message);
    }
  }
);

// export const sendIndividualMail = createAsyncThunk(
//   "mailer/sendIndividualMail",
//   async (
//     { email, subject, message, customerName, attachments = [] },
//     { rejectWithValue }
//   ) => {
//     try {
//       console.log(
//         "Sending email to:",
//         email,
//         "with",
//         attachments.length,
//         "attachments"
//       );

//       const formData = new FormData();
//       formData.append("to", email);
//       formData.append("subject", subject);
//       formData.append("message", message);
//       formData.append("customerName", customerName);

//       // Add files to FormData
//       attachments.forEach((attachment) => {
//         if (attachment.file) {
//           formData.append("attachments", attachment.file);
//         }
//       });

//       const response = await post("/api/mailer/send-individual", formData, {
//         headers: {
//           Authorization: `Bearer ${getAuthToken()}`,
//         },
//       });

//       console.log("Email sent successfully:", response);

//       return {
//         email,
//         subject,
//         message,
//         attachments: attachments.map((att) => ({
//           name: att.name,
//           size: att.size,
//           type: att.type,
//         })),
//         sentAt: new Date().toISOString(),
//         customerName,
//       };
//     } catch (error) {
//       console.error("Send email error:", error);
//       return rejectWithValue(error.message || "Failed to send email");
//     }
//   }
// );
// In sendIndividualMail function, add more detailed logging:

// FIXED: Send individual email - Following categories pattern
export const sendIndividualMail = createAsyncThunk(
  "mailer/sendIndividualMail",
  async (
    { email, subject, message, customerName, attachments = [] },
    { rejectWithValue }
  ) => {
    try {
      console.log("=== SENDING EMAIL DEBUG ===");
      console.log("Email to:", email);
      console.log("Attachments:", attachments.length);

      // Prepare the data payload
      const emailData = {
        to: email,
        subject: subject,
        message: message,
        customerName: customerName,
        attachments: attachments, // This will be processed by createFormData
      };

      // Check if we have file upload (any File object in attachments)
      const hasFile = attachments.some(
        (attachment) => attachment.file instanceof File
      );

      let data;
      let config = {};

      if (hasFile) {
        console.log("Has files - using FormData");
        data = createFormData(emailData);
        config = {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(getAuthToken() && {
              Authorization: `Bearer ${getAuthToken()}`,
            }),
          },
        };
      } else {
        console.log("No files - using JSON");
        // For no files, we still need to format the data properly
        data = {
          to: email,
          subject: subject,
          message: message,
          customerName: customerName,
        };
        config = {
          headers: {
            "Content-Type": "application/json",
            ...(getAuthToken() && {
              Authorization: `Bearer ${getAuthToken()}`,
            }),
          },
        };
      }

      // Debug FormData contents if it's FormData
      if (hasFile) {
        console.log("FormData entries:");
        for (let [key, value] of data.entries()) {
          if (key === "attachments") {
            console.log(`${key}:`, value.name, value.size, value.type);
          } else {
            console.log(`${key}:`, value);
          }
        }
      }

      // Use your custom post function (like categories do)
      const response = await post("/api/mailer/send-individual", data, config);
      console.log("Email sent successfully:", response);

      return {
        email,
        subject,
        message,
        attachments: attachments.map((att) => ({
          name: att.name,
          size: att.size,
          type: att.type,
        })),
        sentAt: new Date().toISOString(),
        customerName,
      };
    } catch (error) {
      console.error("Send email error:", error);
      return rejectWithValue(error.message || "Failed to send email");
    }
  }
);

// FIXED: Send broadcast email - Following categories pattern
export const broadcastMail = createAsyncThunk(
  "mailer/broadcastMail",
  async (
    { subject, message, recipients, attachments = [] },
    { rejectWithValue }
  ) => {
    try {
      console.log("=== BROADCASTING EMAIL DEBUG ===");
      console.log("Recipients:", recipients.length);
      console.log("Attachments:", attachments.length);

      // Prepare the data payload
      const emailData = {
        subject: subject,
        message: message,
        recipients: recipients,
        attachments: attachments, // This will be processed by createFormData
      };

      // Check if we have file upload (any File object in attachments)
      const hasFile = attachments.some(
        (attachment) => attachment.file instanceof File
      );

      let data;
      let config = {};

      if (hasFile) {
        console.log("Has files - using FormData");
        data = createFormData(emailData);
        config = {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(getAuthToken() && {
              Authorization: `Bearer ${getAuthToken()}`,
            }),
          },
        };
      } else {
        console.log("No files - using JSON");
        data = {
          subject: subject,
          message: message,
          recipients: JSON.stringify(recipients),
        };
        config = {
          headers: {
            "Content-Type": "application/json",
            ...(getAuthToken() && {
              Authorization: `Bearer ${getAuthToken()}`,
            }),
          },
        };
      }

      // Debug FormData contents if it's FormData
      if (hasFile) {
        console.log("FormData entries:");
        for (let [key, value] of data.entries()) {
          if (key === "attachments") {
            console.log(`${key}:`, value.name, value.size, value.type);
          } else {
            console.log(`${key}:`, value);
          }
        }
      }

      // Use your custom post function
      const response = await post("/api/mailer/broadcast", data, config);
      console.log("Broadcast email sent successfully:", response);

      return {
        subject,
        message,
        attachments: attachments.map((att) => ({
          name: att.name,
          size: att.size,
          type: att.type,
        })),
        recipientCount: recipients.length,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Broadcast email error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching mail history
export const fetchMailHistory = createAsyncThunk(
  "mailer/fetchMailHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/mailer/history");
      if (!response.ok) {
        throw new Error("Failed to fetch mail history");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fallback sample data (only used when API fails)
const fallbackSampleMails = [
  {
    id: "sample-1",
    customerName: "Sample Customer",
    email: "sample@example.com",
    eventType: "Sample Event",
    bookingDate: new Date().toISOString().split("T")[0],
    status: "pending",
  },
];

// Initial state - starts empty, populated by API
const initialState = {
  // Mail recipients from bookings - populated by fetchBookingMails
  bookingMails: [],

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

  // Statistics - updated by API
  stats: {
    totalRecipients: 0,
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

    // Load sample data (fallback only)
    loadSampleData: (state) => {
      console.log("Loading fallback sample data");
      state.bookingMails = fallbackSampleMails;
      state.stats.totalRecipients = fallbackSampleMails.length;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch booking mails - FIXED to handle new endpoint response
      .addCase(fetchBookingMails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingMails.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Booking emails loaded:", action.payload);

        // action.payload contains { email: [...], stats: {...} }
        const emailData = action.payload?.email || [];
        const statsData = action.payload?.stats || {};

        state.bookingMails = emailData;
        state.stats = {
          ...state.stats,
          ...statsData,
          totalRecipients: emailData.length,
        };

        console.log(
          `Loaded ${emailData.length} real booking emails from database`
        );
      })
      .addCase(fetchBookingMails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Failed to fetch booking emails:", action.payload);

        // Fallback to sample data only when API fails
        console.log("Using fallback sample data");
        state.bookingMails = fallbackSampleMails;
        state.stats.totalRecipients = fallbackSampleMails.length;
      })

      // Add file attachment
      .addCase(addFileAttachment.pending, (state) => {
        state.uploadingAttachment = true;
        state.error = null;
      })
      .addCase(addFileAttachment.fulfilled, (state, action) => {
        state.uploadingAttachment = false;
        state.mailComposition.attachments.push(action.payload);
        console.log("File attachment added:", action.payload.name);
      })
      .addCase(addFileAttachment.rejected, (state, action) => {
        state.uploadingAttachment = false;
        state.error = action.payload;
        console.error("Failed to add attachment:", action.payload);
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

        console.log("Individual email sent successfully");
      })
      .addCase(sendIndividualMail.rejected, (state, action) => {
        state.sendingMail = false;
        state.error = action.payload;
        console.error("Individual email failed:", action.payload);
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

        console.log(
          `Broadcast email sent to ${action.payload.recipientCount} recipients`
        );
      })
      .addCase(broadcastMail.rejected, (state, action) => {
        state.sendingMail = false;
        state.error = action.payload;
        console.error("Broadcast email failed:", action.payload);
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

// Export actions
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
