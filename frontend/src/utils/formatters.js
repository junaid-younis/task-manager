export const formatError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors.map(err => err.msg).join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const formatSuccessMessage = (action, resource) => {
  return `${resource} ${action} successfully!`;
};

export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(error => error.msg || error.message).join(', ');
  }
  return errors;
};