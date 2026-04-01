const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (value = "") =>
  EMAIL_REGEX.test(String(value).trim().toLowerCase());

const isStrongPassword = (value = "") => {
  const password = String(value);
  return (
    password.length >= 8 && /[a-z]/i.test(password) && /[0-9]/.test(password)
  );
};

const isValidOptionalString = (value, { maxLength = 128 } = {}) => {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  return value.trim().length <= maxLength;
};

export { isValidEmail, isStrongPassword, isValidOptionalString };
