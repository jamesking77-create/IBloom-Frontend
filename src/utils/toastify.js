import { toast, Slide, Bounce, Flip, Zoom } from 'react-toastify';

// Default theme colors that can be customized
const defaultTheme = {
  success: {
    background: '#4caf50',
    text: '#ffffff',
    progressBar: '#2e7d32'
  },
  error: {
    background: '#f44336',
    text: '#ffffff',
    progressBar: '#c62828'
  },
  info: {
    background: '#A61A5A',
    text: '#ffffff',
    progressBar: '#A61A5A'
  },
  warning: {
    background: '#ff9800',
    text: '#ffffff',
    progressBar: '#e65100'
  },
  dark: {
    background: '#333333',
    text: '#ffffff',
    progressBar: '#111111'
  },
  default: {
    background: '#ffffff',
    text: '#333333',
    progressBar: '#888888'
  }
};

// Available transition animations
const transitions = {
  slide: Slide,
  bounce: Bounce,
  flip: Flip,
  zoom: Zoom
};


const defaultConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: false,
  transition: Slide
};


let currentTheme = { ...defaultTheme };
let currentConfig = { ...defaultConfig };


export const initializeToastify = (theme = {}, config = {}) => {

  currentTheme = {
    success: { ...defaultTheme.success, ...theme.success },
    error: { ...defaultTheme.error, ...theme.error },
    info: { ...defaultTheme.info, ...theme.info },
    warning: { ...defaultTheme.warning, ...theme.warning },
    dark: { ...defaultTheme.dark, ...theme.dark },
    default: { ...defaultTheme.default, ...theme.default }
  };


  if (config.transition && typeof config.transition === 'string') {
    config.transition = transitions[config.transition.toLowerCase()] || defaultConfig.transition;
  }

  currentConfig = { ...defaultConfig, ...config };
};


const applyTheme = (type, options = {}) => {
  const themeColors = currentTheme[type] || currentTheme.default;
  
  return {
    ...currentConfig,
    ...options,
    style: {
      background: themeColors.background,
      color: themeColors.text,
      ...(options.style || {})
    },
    progressStyle: {
      background: themeColors.progressBar,
      ...(options.progressStyle || {})
    }
  };
};


export const notifySuccess = (message, options = {}) => {
  return toast.success(message, applyTheme('success', options));
};

export const notifyError = (message, options = {}) => {
  return toast.error(message, applyTheme('error', options));
};

export const notifyInfo = (message, options = {}) => {
  return toast.info(message, applyTheme('info', options));
};

export const notifyWarning = (message, options = {}) => {
  return toast.warning(message, applyTheme('warning', options));
};

export const notifyDark = (message, options = {}) => {
  return toast.dark(message, applyTheme('dark', options));
};

export const notifyDefault = (message, options = {}) => {
  return toast(message, applyTheme('default', options));
};

export const notifyLoading = (message, options = {}) => {
  return toast.loading(message, applyTheme('info', {
    autoClose: false,
    ...options
  }));
};

export const notifyUpdate = (toastId, message, type = 'default', options = {}) => {
  return toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    ...applyTheme(type, options)
  });
};

export const notifyDismiss = (toastId) => {
  toast.dismiss(toastId);
};

export const notifyDismissAll = () => {
  toast.dismiss();
};

export const notifyPromise = async (
  asyncFunction,
  loadingMessage = 'Processing...',
  successMessage = 'Success!',
  errorMessage = 'Something went wrong',
  options = {}
) => {
  const toastId = notifyLoading(loadingMessage, options);
  
  try {
    const result = await asyncFunction();
    notifyUpdate(toastId, successMessage, 'success', options);
    return result;
  } catch (error) {
    const errorMsg = error?.message || errorMessage;
    notifyUpdate(toastId, errorMsg, 'error', options);
    throw error;
  }
};

export const notifyWithPromise = (promise, messages = {}, options = {}) => {
  return toast.promise(
    promise,
    {
      pending: messages.pending || 'Processing...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong',
    },
    applyTheme('default', options)
  );
};


export const notifyCustom = (message, options = {}) => {
  return toast(message, { ...currentConfig, ...options });
};


export const updateToastConfig = (config = {}) => {

  if (config.transition && typeof config.transition === 'string') {
    config.transition = transitions[config.transition.toLowerCase()] || currentConfig.transition;
  }
  
  currentConfig = { ...currentConfig, ...config };
};

// Utility to update theme colors at runtime
export const updateToastTheme = (theme = {}) => {
  Object.keys(theme).forEach(type => {
    if (currentTheme[type]) {
      currentTheme[type] = { ...currentTheme[type], ...theme[type] };
    }
  });
};