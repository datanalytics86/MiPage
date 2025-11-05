/**
 * Utilidades de validación profesionales
 */

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validador de email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validador de RUT chileno
 */
export const isValidRUT = (rut: string): boolean => {
  // Limpiar RUT
  const cleanRut = rut.replace(/[^0-9kK]/g, '');

  if (cleanRut.length < 2) return false;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();

  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDV = 11 - (sum % 11);
  const calculatedDV =
    expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();

  return dv === calculatedDV;
};

/**
 * Validador de teléfono chileno
 */
export const isValidChileanPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/;
  return phoneRegex.test(phone);
};

/**
 * Validador de contraseña segura
 */
export const isStrongPassword = (password: string): boolean => {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
};

/**
 * Validador de URL
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validador genérico
 */
export const validate = (value: any, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Reglas de validación pre-definidas
 */
export const validationRules = {
  required: (message = 'Este campo es requerido'): ValidationRule => ({
    validate: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length >= min,
    message: message || `Debe tener al menos ${min} caracteres`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length <= max,
    message: message || `No puede tener más de ${max} caracteres`,
  }),

  email: (message = 'Email inválido'): ValidationRule => ({
    validate: isValidEmail,
    message,
  }),

  phone: (message = 'Teléfono inválido'): ValidationRule => ({
    validate: isValidChileanPhone,
    message,
  }),

  rut: (message = 'RUT inválido'): ValidationRule => ({
    validate: isValidRUT,
    message,
  }),

  strongPassword: (
    message = 'Contraseña debe tener 8+ caracteres, mayúscula, minúscula y número'
  ): ValidationRule => ({
    validate: isStrongPassword,
    message,
  }),

  url: (message = 'URL inválida'): ValidationRule => ({
    validate: isValidURL,
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: number) => value >= min,
    message: message || `Debe ser mayor o igual a ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: number) => value <= max,
    message: message || `Debe ser menor o igual a ${max}`,
  }),

  pattern: (regex: RegExp, message = 'Formato inválido'): ValidationRule => ({
    validate: (value: string) => regex.test(value),
    message,
  }),
};

/**
 * Sanitizador de strings
 */
export const sanitize = {
  html: (str: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return str.replace(/[&<>"'/]/g, (char) => map[char]);
  },

  phone: (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
  },

  rut: (rut: string): string => {
    return rut.replace(/[^0-9kK]/g, '');
  },

  alphanumeric: (str: string): string => {
    return str.replace(/[^a-zA-Z0-9]/g, '');
  },

  trim: (str: string): string => {
    return str.trim().replace(/\s+/g, ' ');
  },
};

/**
 * Formateadores
 */
export const format = {
  rut: (rut: string): string => {
    const clean = sanitize.rut(rut);
    if (clean.length < 2) return clean;

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);

    // Formatear con puntos
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted}-${dv}`;
  },

  phone: (phone: string): string => {
    const clean = sanitize.phone(phone);
    if (clean.startsWith('+56')) {
      return `+56 ${clean.slice(3, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
    }
    if (clean.startsWith('9') && clean.length === 9) {
      return `+56 ${clean.slice(0, 1)} ${clean.slice(1, 5)} ${clean.slice(5)}`;
    }
    return phone;
  },

  currency: (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  },
};
