export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required',
      formatted: null
    };
  }

  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (!cleanNumber || cleanNumber.length < 10) {
    return {
      isValid: false,
      error: 'Phone number too short',
      formatted: null
    };
  }

  const nigerianPrefixes = [
    '070', '080', '081', '090', '091',
    '701', '708', '902', '907', '901', '904', '912',
    '703', '706', '803', '806', '810', '813', '814', '816', '903', '905', '915',
    '704', '707', '802', '808', '812', '815', '818', '909', '908', '817', '919',
    '705', '805', '807', '811', '815', '819', '818', '909', '908', '906', '916',
    '809', '817', '818', '819', '909', '908', '906', '916', '912', '915', '916', '917', '918', '919'
  ];

  const uniquePrefixes = [...new Set(nigerianPrefixes)].sort();
  
  let validNumber = null;
  let countryCode = '+234';

  if (cleanNumber.startsWith('234') && cleanNumber.length === 13) {
    validNumber = cleanNumber.substring(3);
  } else if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
    validNumber = cleanNumber.substring(1);
  } else if (cleanNumber.length === 10) {
    validNumber = cleanNumber;
  } else {
    return {
      isValid: false,
      error: 'Invalid Nigerian phone number format',
      formatted: null
    };
  }

  if (validNumber.length !== 10) {
    return {
      isValid: false,
      error: 'Invalid Nigerian phone number length',
      formatted: null
    };
  }

  const prefix = validNumber.substring(0, 3);
  if (!uniquePrefixes.includes(prefix)) {
    return {
      isValid: false,
      error: 'Invalid Nigerian network prefix',
      formatted: null
    };
  }

  return {
    isValid: true,
    error: null,
    formatted: `${countryCode}${validNumber}`,
    local: `0${validNumber}`,
    international: `${countryCode}${validNumber}`,
    displayFormat: `${countryCode} ${validNumber.substring(0, 3)} ${validNumber.substring(3, 6)} ${validNumber.substring(6)}`
  };
};

export const isValidNigerianPhoneNumber = (phoneNumber) => {
  return validatePhoneNumber(phoneNumber).isValid;
};

export const formatNigerianPhoneNumber = (phoneNumber, format = 'international') => {
  const validation = validatePhoneNumber(phoneNumber);
  
  if (!validation.isValid) {
    return phoneNumber;
  }

  switch (format) {
    case 'local':
      return validation.local;
    case 'international':
      return validation.international;
    case 'display':
      return validation.displayFormat;
    default:
      return validation.formatted;
  }
};

export default validatePhoneNumber;