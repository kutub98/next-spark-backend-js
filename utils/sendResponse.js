/**
 * Send Response utility function
 * Standardizes API response format
 */

const sendResponse = (res, data) => {
  const response = {
    success: data.success,
    message: data.message,
    data: data.data,
  };

  // Add meta information if provided
  if (data.meta) {
    response.meta = data.meta;
  }

  res.status(data.statusCode).json(response);
};

module.exports = sendResponse;
