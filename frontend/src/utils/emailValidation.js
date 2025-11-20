// Email validation function
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  // Check for common email providers
  const validDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
    'protonmail.com', 'aol.com', 'mail.com', 'yandex.com', 'zoho.com',
    'gmail.co.in', 'yahoo.co.in', 'rediffmail.com', 'company.com',
    'business.com', 'enterprise.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  
  // Allow all domains but show warning for uncommon ones
  if (domain && !validDomains.some(d => domain.includes(d))) {
    // Still valid but uncommon domain
    return { valid: true, message: 'Uncommon email domain detected' };
  }

  return { valid: true, message: '' };
};

