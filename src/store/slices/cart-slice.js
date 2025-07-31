import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Constants
const CART_STORAGE_KEY = "eventPlatform_cart";
const CART_EXPIRY_DAYS = 7;
const TAX_RATE = 0.075;
const ORDER_MODES = {
  BOOKING: "booking",
  ORDER_BY_DATE: "order-by-date",
};

// Validation schemas
const validationSchemas = {
  customerInfo: {
    name: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { required: true, pattern: /^\+?[\d\s-()]+$/, minLength: 10 },
    eventType: { required: true, minLength: 2, maxLength: 100 },
    guests: { required: true, min: 1, max: 10000 },
    specialRequests: { maxLength: 500 },
  },
  dateTime: {
    startDate: { required: true },
    endDate: { required: true },
    startTime: { required: true, pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    endTime: { required: true, pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  },
  item: {
    name: { required: true, minLength: 1, maxLength: 100 },
    price: { required: true, min: 0, max: 1000000 },
    quantity: { required: true, min: 1, max: 100 },
  },
};

// Validation utilities
const validateField = (value, rules) => {
  const errors = [];

  if (
    rules.required &&
    (!value || (typeof value === "string" && value.trim() === ""))
  ) {
    errors.push("This field is required");
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters`);
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters`);
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    errors.push("Invalid format");
  }

  if (
    value !== undefined &&
    rules.min !== undefined &&
    Number(value) < rules.min
  ) {
    errors.push(`Must be at least ${rules.min}`);
  }

  if (
    value !== undefined &&
    rules.max !== undefined &&
    Number(value) > rules.max
  ) {
    errors.push(`Must be no more than ${rules.max}`);
  }

  return errors;
};

const validateObject = (obj, schema) => {
  const errors = {};

  Object.keys(schema).forEach((key) => {
    const fieldErrors = validateField(obj[key], schema[key]);
    if (fieldErrors.length > 0) {
      errors[key] = fieldErrors;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

// localStorage utilities with atomic operations
const storage = {
  save: (state) => {
    try {
      const cartData = {
        items: state.items,
        orderMode: state.orderMode,
        selectedDates: state.selectedDates,
        customerInfo: state.customerInfo,
        totalAmount: state.totalAmount,
        subtotal: state.subtotal,
        tax: state.tax,
        step: state.step,
        timestamp: new Date().toISOString(),
        version: "1.0", // For future migrations
      };

      const serialized = JSON.stringify(cartData);
      localStorage.setItem(CART_STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.warn("Failed to save cart to localStorage:", error);
      return false;
    }
  },

  load: () => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!savedCart) return null;

      const parsedCart = JSON.parse(savedCart);

      // Validate data structure
      if (!parsedCart || typeof parsedCart !== "object") {
        storage.clear();
        return null;
      }

      // Check expiry
      if (parsedCart.timestamp) {
        const timestamp = new Date(parsedCart.timestamp);
        const now = new Date();
        const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);

        if (daysDiff > CART_EXPIRY_DAYS) {
          storage.clear();
          return null;
        }
      }

      // Validate required fields
      const requiredFields = [
        "items",
        "orderMode",
        "selectedDates",
        "customerInfo",
      ];
      const isValid = requiredFields.every(
        (field) =>
          parsedCart.hasOwnProperty(field) && parsedCart[field] !== null
      );

      if (!isValid) {
        storage.clear();
        return null;
      }

      return parsedCart;
    } catch (error) {
      console.warn("Failed to load cart from localStorage:", error);
      storage.clear();
      return null;
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn("Failed to clear cart from localStorage:", error);
      return false;
    }
  },
};


const utils = {
  generateCartItemId: () => {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  
  normalizeItem: (item) => {
    const id = item.id || item._id || utils.generateCartItemId();
    const name = item.name || item.itemName || "";
    const price = parseFloat(item.price) || 0;

    return {
      id,
      name,
      price,
      description: item.description || "",
      image: item.image || "",
      category: item.category || "",
     
      originalData: item,
    };
  },

  
  calculateTotal: (items) => {
    return items.reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + itemPrice * quantity;
    }, 0);
  },

  // Calculate duration in hours
  calculateDurationHours: (startDate, endDate, startTime, endTime) => {
    if (!startDate || !endDate || !startTime || !endTime) return 1;

    try {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

      const diffMs = end - start;
      return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    } catch (error) {
      console.warn("Error calculating duration hours:", error);
      return 1;
    }
  },

  // Calculate duration in days
  calculateDurationDays: (startDate, endDate) => {
    if (!startDate || !endDate) return 1;

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays);
    } catch (error) {
      console.warn("Error calculating duration days:", error);
      return 1;
    }
  },

  // Validate dates
  validateDates: (startDate, endDate, startTime, endTime) => {
    const errors = [];

    if (!startDate || !endDate) {
      errors.push("Start and end dates are required");
      return errors;
    }

    try {
      const start = new Date(`${startDate}T${startTime || "00:00"}`);
      const end = new Date(`${endDate}T${endTime || "23:59"}`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        errors.push("Invalid date format");
        return errors;
      }

      if (end <= start) {
        errors.push("End date/time must be after start date/time");
      }

      const now = new Date();
      if (start < now) {
        errors.push("Start date cannot be in the past");
      }
    } catch (error) {
      errors.push("Invalid date format");
    }

    return errors;
  },

  // Reset state helper
  resetStateToDefault: (state, defaultState, preserveKeys = []) => {
    Object.keys(defaultState).forEach((key) => {
      if (!preserveKeys.includes(key)) {
        state[key] = defaultState[key];
      }
    });
  },

  calculateTax: (subtotal) => {
    return subtotal * TAX_RATE;
  },

  // Calculate total with tax
  calculateTotalWithTax: (subtotal) => {
    const tax = subtotal * TAX_RATE;
    return subtotal + tax;
  },
};

// Default state factory
const createDefaultState = () => ({
  items: [],
  orderMode: ORDER_MODES.BOOKING,
  selectedDates: {
    startDate: null,
    endDate: null,
    startTime: "09:00",
    endTime: "17:00",
  },
  customerInfo: {
    name: "",
    email: "",
    phone: "",
    eventType: "",
    guests: 1,
    specialRequests: "",
  },
  totalAmount: 0,
  tax: 0,
  subtotal: 0,
  isOpen: false,
  loading: false,
  error: null,
  validationErrors: {},
  step: 1,
  bookingSubmitted: false,
  orderSubmitted: false,
  lastSyncedAt: null,
});

// Load initial state
const getInitialState = () => {
  const savedCart = storage.load();
  const defaultState = createDefaultState();

  if (savedCart) {
    return {
      ...defaultState,
      items: Array.isArray(savedCart.items) ? savedCart.items : [],
      orderMode: Object.values(ORDER_MODES).includes(savedCart.orderMode)
        ? savedCart.orderMode
        : ORDER_MODES.BOOKING,
      selectedDates: {
        ...defaultState.selectedDates,
        ...(savedCart.selectedDates || {}),
      },
      customerInfo: {
        ...defaultState.customerInfo,
        ...(savedCart.customerInfo || {}),
      },
      totalAmount: parseFloat(savedCart.totalAmount) || 0,
      subtotal: parseFloat(savedCart.subtotal) || 0,
      tax: parseFloat(savedCart.tax) || 0,
      step: parseInt(savedCart.step) || 1,
      lastSyncedAt: savedCart.timestamp || null,
    };
  }

  return defaultState;
};

// Async thunks with better error handling
export const submitBooking = createAsyncThunk(
  "cart/submitBooking",
  async (bookingData, { rejectWithValue, getState }) => {
    try {
      const state = getState().cart;

      // Validate customer info
      const customerErrors = validateObject(
        state.customerInfo,
        validationSchemas.customerInfo
      );
      if (customerErrors) {
        return rejectWithValue({ type: "validation", errors: customerErrors });
      }

      // Validate dates
      const dateErrors = utils.validateDates(
        state.selectedDates.startDate,
        state.selectedDates.endDate,
        state.selectedDates.startTime,
        state.selectedDates.endTime
      );
      if (dateErrors.length > 0) {
        return rejectWithValue({
          type: "validation",
          errors: { dates: dateErrors },
        });
      }

      // Validate items
      if (!state.items || state.items.length === 0) {
        return rejectWithValue({
          type: "validation",
          errors: { items: ["Cart is empty"] },
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue({
          type: "timeout",
          message: "Request timed out",
        });
      }
      return rejectWithValue({ type: "network", message: error.message });
    }
  }
);

export const submitOrderByDate = createAsyncThunk(
  "cart/submitOrderByDate",
  async (orderData, { rejectWithValue, getState }) => {
    try {
      const state = getState().cart;

      const customerErrors = validateObject(
        state.customerInfo,
        validationSchemas.customerInfo
      );
      if (customerErrors) {
        return rejectWithValue({ type: "validation", errors: customerErrors });
      }

      const dateErrors = utils.validateDates(
        state.selectedDates.startDate,
        state.selectedDates.endDate
      );
      if (dateErrors.length > 0) {
        return rejectWithValue({
          type: "validation",
          errors: { dates: dateErrors },
        });
      }

      if (!state.items || state.items.length === 0) {
        return rejectWithValue({
          type: "validation",
          errors: { items: ["Cart is empty"] },
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue({
          type: "timeout",
          message: "Request timed out",
        });
      }
      return rejectWithValue({ type: "network", message: error.message });
    }
  }
);

const initialState = getInitialState();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setOrderMode: (state, action) => {
      if (!Object.values(ORDER_MODES).includes(action.payload)) {
        console.warn("Invalid order mode:", action.payload);
        return;
      }

      state.orderMode = action.payload;
      state.error = null;
      state.validationErrors = {};
      state.items.forEach((item) => {
        let duration = 1;
        if (state.orderMode === ORDER_MODES.BOOKING) {
          duration = utils.calculateDurationHours(
            state.selectedDates.startDate,
            state.selectedDates.endDate,
            state.selectedDates.startTime,
            state.selectedDates.endTime
          );
        } else if (state.orderMode === ORDER_MODES.ORDER_BY_DATE) {
          duration = utils.calculateDurationDays(
            state.selectedDates.startDate,
            state.selectedDates.endDate
          );
        }
        item.duration = duration;
      });

      state.subtotal = utils.calculateTotal(state.items);
      state.tax = utils.calculateTax(state.subtotal);
      state.totalAmount = utils.calculateTotalWithTax(state.subtotal);
      storage.save(state);
    },

  // FIXED: Update the addToCart action in cart-slice.js

addToCart: (state, action) => {
  const { item, dates, allowDuplicates = false } = action.payload;

  console.log('🔄 addToCart called with:', { item, dates, allowDuplicates });

  if (!item || !item.name || item.price === undefined) {
    console.error('❌ Invalid item data:', item);
    state.error = "Invalid item data";
    return;
  }

  // Clear previous errors
  state.error = null;
  state.validationErrors = {};

  // Normalize item data
  const normalizedItem = {
    id: item.id || item._id || utils.generateCartItemId(),
    name: item.name || item.itemName || "",
    itemName: item.name || item.itemName || "", // Keep both for compatibility
    price: parseFloat(item.price) || 0,
    description: item.description || "",
    image: item.image || item.imageUrl || "",
    category: item.category || "",
    originalData: item,
  };

  // Check for existing item (prevent duplicates unless explicitly allowed)
  if (!allowDuplicates) {
    const existingItemIndex = state.items.findIndex(
      (i) => i.id === normalizedItem.id || i.name === normalizedItem.name
    );

    if (existingItemIndex !== -1) {
      console.log('📝 Item already exists, updating quantity to 1');
      state.items[existingItemIndex].quantity = 1;
      state.subtotal = utils.calculateTotal(state.items);
      state.tax = utils.calculateTax(state.subtotal);
      state.totalAmount = utils.calculateTotalWithTax(state.subtotal);
      state.isOpen = true;
      storage.save(state);
      return;
    }
  }

  // Calculate duration based on order mode and dates
  let duration = 1;
  const eventDates = dates || state.selectedDates;
  
  if (state.orderMode === ORDER_MODES.BOOKING) {
    duration = utils.calculateDurationHours(
      eventDates?.startDate,
      eventDates?.endDate,
      eventDates?.startTime,
      eventDates?.endTime
    );
  } else if (state.orderMode === ORDER_MODES.ORDER_BY_DATE) {
    duration = utils.calculateDurationDays(
      eventDates?.startDate,
      eventDates?.endDate
    );
  }

  // Create cart item
  const cartItem = {
    cartId: utils.generateCartItemId(),
    id: normalizedItem.id,
    name: normalizedItem.name,
    itemName: normalizedItem.name, // Ensure both properties exist
    description: normalizedItem.description,
    price: normalizedItem.price,
    image: normalizedItem.image,
    category: normalizedItem.category,
    quantity: 1,
    duration,
    bookingDates: eventDates ? { ...eventDates } : { ...state.selectedDates },
    orderMode: state.orderMode,
    addedAt: new Date().toISOString(),
    originalData: normalizedItem.originalData,
  };

  console.log('✅ Adding cart item:', cartItem);

  // Add to cart
  state.items.push(cartItem);
  
  // Recalculate totals
  state.subtotal = utils.calculateTotal(state.items);
  state.tax = utils.calculateTax(state.subtotal);
  state.totalAmount = utils.calculateTotalWithTax(state.subtotal);
  state.isOpen = true;
  
  // Save to storage
  storage.save(state);
  
  console.log('✅ Item added to cart successfully');
},

    removeFromCart: (state, action) => {
      const cartId = action.payload;
      const initialLength = state.items.length;

      state.items = state.items.filter((item) => item.cartId !== cartId);

      if (state.items.length === initialLength) {
        state.error = "Item not found in cart";
        return;
      }

      state.error = null;
      state.subtotal = utils.calculateTotal(state.items);
      state.tax = utils.calculateTax(state.subtotal);
      state.totalAmount = utils.calculateTotalWithTax(state.subtotal);
      storage.save(state);
    },

    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const parsedQuantity = parseInt(quantity);

      if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
        state.error = "Invalid quantity";
        return;
      }

      const item = state.items.find((i) => i.cartId === itemId);

      if (!item) {
        state.error = "Item not found in cart";
        return;
      }

      item.quantity = parsedQuantity;
      state.error = null;
      state.subtotal = utils.calculateTotal(state.items);
      state.tax = utils.calculateTax(state.subtotal);
      state.totalAmount = utils.calculateTotalWithTax(state.subtotal);
      storage.save(state);
    },

    incrementQuantity: (state, action) => {
      const cartId = action.payload;
      const item = state.items.find((i) => i.cartId === cartId);

      if (!item) {
        state.error = "Item not found in cart";
        return;
      }

      if (item.quantity >= 100) {
        state.error = "Maximum quantity reached";
        return;
      }

      item.quantity += 1;
      state.error = null;
      state.subtotal = utils.calculateTotal(state.items);
      state.tax = utils.calculateTax(state.subtotal);
      state.totalAmount = utils.calculateTotalWithTax(state.subtotal);
      storage.save(state);
    },

    decrementQuantity: (state, action) => {
      const cartId = action.payload;
      const item = state.items.find((i) => i.cartId === cartId);

      if (!item) {
        state.error = "Item not found in cart";
        return;
      }

      if (item.quantity <= 1) {
        state.error = "Minimum quantity is 1";
        return;
      }

      item.quantity -= 1;
      state.error = null;
      state.subtotal = utils.calculateTotal(state.items);
      state.tax = utils.calculateTax(state.subtotal);
      state.totalAmount = utils.calculateTotalWithTax(state.subtotal);
      storage.save(state);
    },

setSelectedDates: (state, action) => {
  console.log('🔄 setSelectedDates called with:', action.payload);
  
  const newDates = action.payload;
  const updatedDates = { ...state.selectedDates, ...newDates };

  // Validate dates
  const dateErrors = utils.validateDates(
    updatedDates.startDate,
    updatedDates.endDate,
    updatedDates.startTime,
    updatedDates.endTime
  );

  if (dateErrors.length > 0) {
    console.log('❌ Date validation errors:', dateErrors);
    state.validationErrors = { ...state.validationErrors, dates: dateErrors };
    state.error = 'Please fix date/time selection issues';
    return;
  }

  // Update dates
  state.selectedDates = updatedDates;
  state.error = null;
  
  // Clear date validation errors
  const { dates, ...otherErrors } = state.validationErrors;
  state.validationErrors = otherErrors;

  // Update duration for all items
  state.items.forEach((item) => {
    let duration = 1;
    if (state.orderMode === ORDER_MODES.BOOKING) {
      duration = utils.calculateDurationHours(
        updatedDates.startDate,
        updatedDates.endDate,
        updatedDates.startTime,
        updatedDates.endTime
      );
    } else if (state.orderMode === ORDER_MODES.ORDER_BY_DATE) {
      duration = utils.calculateDurationDays(
        updatedDates.startDate,
        updatedDates.endDate
      );
    }
    item.duration = duration;
    item.bookingDates = { ...updatedDates };
  });

  // Recalculate totals
  state.subtotal = utils.calculateTotal(state.items);
  state.tax = utils.calculateTax(state.subtotal);
  state.totalAmount = utils.calculateTotalWithTax(state.subtotal);
  
  // Save to storage
  storage.save(state);
  
  console.log('✅ Dates updated successfully');
},

  setCustomerInfo: (state, action) => {
  console.log('🔄 setCustomerInfo called with:', action.payload);
  
  const newInfo = action.payload;
  const updatedInfo = { ...state.customerInfo, ...newInfo };
  
  // Update customer info
  state.customerInfo = updatedInfo;
  
  // Clear any previous errors when user starts updating info
  state.error = null;
  
  // Validate the updated info
  const validationErrors = {};
  
  // Required field validation
  const requiredFields = ['name', 'email', 'phone', 'location', 'delivery', 'installation'];
  requiredFields.forEach(field => {
    if (!updatedInfo[field] || updatedInfo[field].toString().trim() === '') {
      validationErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });
  
  // Email format validation
  if (updatedInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedInfo.email)) {
    validationErrors.email = 'Please enter a valid email address';
  }
  
  // Phone format validation
  if (updatedInfo.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(updatedInfo.phone)) {
    validationErrors.phone = 'Please enter a valid phone number';
  }
  
  // Name length validation
  if (updatedInfo.name && updatedInfo.name.trim().length < 2) {
    validationErrors.name = 'Name must be at least 2 characters';
  }
  
  // Location length validation
  if (updatedInfo.location && updatedInfo.location.trim().length < 5) {
    validationErrors.location = 'Location must be at least 5 characters';
  }
  
  // Guest validation (if provided)
  if (updatedInfo.guests && (isNaN(updatedInfo.guests) || parseInt(updatedInfo.guests) < 1)) {
    validationErrors.guests = 'Number of guests must be a positive number';
  }
  
  // Update validation errors
  if (Object.keys(validationErrors).length > 0) {
    state.validationErrors = { ...state.validationErrors, customerInfo: validationErrors };
  } else {
    // Clear customer info validation errors if all valid
    const { customerInfo, ...otherErrors } = state.validationErrors;
    state.validationErrors = otherErrors;
  }
  
  // Save to storage
  storage.save(state);
  
  console.log('✅ Customer info updated and validated');
},

   nextStep: (state) => {
  console.log('🔄 nextStep called, current step:', state.step);
  
  if (state.step >= 3) {
    console.log('⚠️ Already at max step, cannot proceed');
    return;
  }

  let canProceed = true;
  let errorMessage = '';

  // Step 1 validation - Date and Cart
  if (state.step === 1) {
    console.log('🔍 Validating step 1...');
    
    if (!state.items || state.items.length === 0) {
      errorMessage = 'Please add items to cart before proceeding';
      canProceed = false;
    } else if (!state.selectedDates?.startDate) {
      errorMessage = 'Please select a start date';
      canProceed = false;
    } else if (!state.selectedDates?.startTime || !state.selectedDates?.endTime) {
      errorMessage = 'Please select start and end times';
      canProceed = false;
    } else if (state.selectedDates?.multiDay && !state.selectedDates?.endDate) {
      errorMessage = 'Please select an end date for multi-day events';
      canProceed = false;
    }
  }

  // Step 2 validation - Customer Info
  if (state.step === 2) {
    console.log('🔍 Validating step 2...');
    
    const requiredFields = ['name', 'email', 'phone', 'location', 'delivery', 'installation'];
    const missingFields = requiredFields.filter(field => 
      !state.customerInfo?.[field] || state.customerInfo[field].toString().trim() === ''
    );
    
    if (missingFields.length > 0) {
      errorMessage = `Please provide: ${missingFields.join(', ')}`;
      canProceed = false;
    }
    
    // Email format validation
    if (state.customerInfo?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customerInfo.email)) {
      errorMessage = 'Please provide a valid email address';
      canProceed = false;
    }
    
    // Phone format validation
    if (state.customerInfo?.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(state.customerInfo.phone)) {
      errorMessage = 'Please provide a valid phone number';
      canProceed = false;
    }
  }

  if (canProceed) {
    console.log('✅ Validation passed, proceeding to step:', state.step + 1);
    state.step += 1;
    state.error = null;
    state.validationErrors = {};
    storage.save(state);
  } else {
    console.log('❌ Validation failed:', errorMessage);
    state.error = errorMessage;
  }
},


prevStep: (state) => {
  console.log('🔄 prevStep called, current step:', state.step);
  
  if (state.step > 1) {
    state.step -= 1;
    state.error = null;
    // Don't clear validation errors when going back - user might want to see what needs fixing
    storage.save(state);
    console.log('✅ Moved to previous step:', state.step);
  } else {
    console.log('⚠️ Already at first step, cannot go back');
  }
},

setStep: (state, action) => {
  const newStep = parseInt(action.payload);
  console.log('🔄 setStep called with:', newStep);
  
  if (newStep >= 1 && newStep <= 3) {
    // Don't enforce validation when explicitly setting step (for edit functionality)
    state.step = newStep;
    state.error = null;
    storage.save(state);
    console.log('✅ Step set to:', newStep);
  } else {
    console.log('❌ Invalid step:', newStep);
    state.error = 'Invalid step number';
  }
},

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },

    clearCart: (state) => {
      const defaultState = createDefaultState();
      utils.resetStateToDefault(state, defaultState, ["isOpen"]);
      storage.clear();
    },

forceResetCart: (state) => {
  console.log('🔄 Force resetting cart...');
  
  const defaultState = createDefaultState();
  
  // Reset all cart state except UI state
  Object.keys(defaultState).forEach((key) => {
    if (key !== 'isOpen') {
      state[key] = defaultState[key];
    }
  });
  
  // Clear storage
  storage.clear();
  
  console.log('✅ Cart force reset completed');
},

// Additional helper functions for better state management
syncWithLocalStorage: (state) => {
  const saved = storage.save(state);
  if (saved) {
    state.lastSyncedAt = new Date().toISOString();
    console.log('✅ Cart synced with localStorage');
  } else {
    console.warn('⚠️ Failed to sync cart with localStorage');
  }
},

clearError: (state) => {
  state.error = null;
},

clearValidationErrors: (state) => {
  state.validationErrors = {};
},

    resetSubmissionStatus: (state) => {
      state.bookingSubmitted = false;
      state.orderSubmitted = false;
    },

    syncWithLocalStorage: (state) => {
      const saved = storage.save(state);
      if (saved) {
        state.lastSyncedAt = new Date().toISOString();
      }
    },

    loadFromLocalStorage: (state) => {
      const savedData = storage.load();
      if (savedData) {
        const defaultState = createDefaultState();
        Object.keys(savedData).forEach((key) => {
          if (key in defaultState && key !== "isOpen") {
            state[key] = savedData[key];
          }
        });
        state.lastSyncedAt = savedData.timestamp || null;
      }
    },
  },

  validateCurrentStep: (state) => {
  const errors = {};
  
  switch (state.step) {
    case 1:
      if (!state.items || state.items.length === 0) {
        errors.cart = 'Add at least one item to your cart';
      }
      if (!state.selectedDates?.startDate) {
        errors.startDate = 'Select a start date';
      }
      if (!state.selectedDates?.startTime || !state.selectedDates?.endTime) {
        errors.time = 'Select start and end times';
      }
      if (state.selectedDates?.multiDay && !state.selectedDates?.endDate) {
        errors.endDate = 'Select an end date for multi-day events';
      }
      break;
      
    case 2:
      const requiredFields = ['name', 'email', 'phone', 'location', 'delivery', 'installation'];
      requiredFields.forEach(field => {
        if (!state.customerInfo?.[field] || state.customerInfo[field].toString().trim() === '') {
          errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
      });
      
      if (state.customerInfo?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customerInfo.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (state.customerInfo?.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(state.customerInfo.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
      break;
      
    case 3:
      // Final validation before submission
      if (!state.items || state.items.length === 0) {
        errors.items = 'Cart cannot be empty';
      }
      if (!state.customerInfo?.name || !state.customerInfo?.email || !state.customerInfo?.phone) {
        errors.customer = 'Customer information is incomplete';
      }
      if (!state.selectedDates?.startDate || !state.selectedDates?.endDate) {
        errors.dates = 'Event dates are required';
      }
      break;
  }
  
  return errors;
},

  extraReducers: (builder) => {
    builder
      // Booking submission
      .addCase(submitBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(submitBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingSubmitted = true;
        state.orderSubmitted = false;
        const defaultState = createDefaultState();
        utils.resetStateToDefault(state, defaultState, ["isOpen"]);
        storage.clear();
      })
      .addCase(submitBooking.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload || {};

        if (error.type === "validation") {
          state.validationErrors = error.errors || {};
          state.error = "Please fix validation errors";
        } else {
          state.error = error.message || "Failed to submit booking";
        }
      })

      .addCase(submitOrderByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(submitOrderByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.orderSubmitted = true;
        state.bookingSubmitted = false;
        const defaultState = createDefaultState();
        utils.resetStateToDefault(state, defaultState, ["isOpen"]);
        storage.clear();
      })
      .addCase(submitOrderByDate.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload || {};

        if (error.type === "validation") {
          state.validationErrors = error.errors || {};
          state.error = "Please fix validation errors";
        } else {
          state.error = error.message || "Failed to submit order";
        }
      });
  },
});

export const {
  setOrderMode,
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  setSelectedDates,
  setCustomerInfo,
  nextStep,
  prevStep,
  setStep,
  toggleCart,
  openCart,
  closeCart,
  clearCart,
  forceResetCart,
  clearError,
  clearValidationErrors,
  resetSubmissionStatus,
  syncWithLocalStorage,
  loadFromLocalStorage,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart?.items || [];
export const selectCartTotal = (state) => state.cart?.totalAmount || 0;
export const selectCartSubtotal = (state) => state.cart?.subtotal || 0;
export const selectCartIsOpen = (state) => state.cart?.isOpen || false;
export const selectCartItemCount = (state) =>
  state.cart?.items?.reduce(
    (total, item) => total + (parseInt(item.quantity) || 0),
    0
  ) || 0;
export const selectSelectedDates = (state) => state.cart?.selectedDates || {};
export const selectCustomerInfo = (state) => state.cart?.customerInfo || {};
export const selectCartStep = (state) => state.cart?.step || 1;
export const selectCartLoading = (state) => state.cart?.loading || false;
export const selectCartError = (state) => state.cart?.error || null;
export const selectBookingSubmitted = (state) =>
  state.cart?.bookingSubmitted || false;
export const selectOrderSubmitted = (state) =>
  state.cart?.orderSubmitted || false;
export const selectOrderMode = (state) => state.cart?.orderMode || "booking";
export const selectCartTax = (state) => state.cart?.tax || 0

export const selectCartSummary = (state) => {
  const cart = state.cart || {};
  return {
    items: cart.items || [],
    itemCount:
      cart.items?.reduce(
        (total, item) => total + (parseInt(item.quantity) || 0),
        0
      ) || 0,
    subtotal: cart.subtotal || 0,
    tax: cart.tax || 0,
    total: cart.totalAmount || 0,
    orderMode: cart.orderMode || "booking",
    dates: cart.selectedDates || {},
    isEmpty: !cart.items || cart.items.length === 0,
  };
};


export const selectCartHasPersistedData = (state) => {
  const cart = state.cart || {};
  return cart.items && cart.items.length > 0;
};


export const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};


export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (startDate === endDate) {
    return start;
  }

  return `${start} - ${end}`;
};


export const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return "";

  const start = formatTime(startTime);
  const end = formatTime(endTime);

  return `${start} - ${end}`;
};


export const getCartFromLocalStorage = () => {
  return loadFromLocalStorage();
};

export const saveCartToLocalStorage = (cartData) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    return true;
  } catch (error) {
    console.warn("Failed to save cart to localStorage:", error);
    return false;
  }
};

export const clearCartFromLocalStorage = () => {
  clearLocalStorage();
};

export default cartSlice.reducer;