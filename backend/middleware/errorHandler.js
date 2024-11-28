export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle Axios errors
  if (err.isAxiosError) {
    const status = err.response?.status || 500;
    const message = err.response?.status === 429 
      ? 'Rate limit exceeded. Please try again later.'
      : err.response?.data?.message || err.message;
      
    return res.status(status).json({
      error: 'External API Error',
      message: message
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  // Handle authentication errors
  if (err.message.includes('Authentication failed') || 
      err.message.includes('Invalid credentials') ||
      err.message.includes('User not found')) {
    return res.status(401).json({
      error: 'Authentication Error',
      message: err.message
    });
  }

  // Handle user creation errors
  if (err.message.includes('Username already taken') ||
      err.message.includes('Failed to create account')) {
    return res.status(400).json({
      error: 'Registration Error',
      message: err.message
    });
  }
  
  // Handle other errors
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : 'API Error',
    message: message
  });
};