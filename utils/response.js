// Success response helper
const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Error response helper
const sendError = (res, message = "Error", statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
  };

  // Only include error details in development
  if (process.env.NODE_ENV === "development" && error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

// Pagination helper
const paginate = (page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return {
    skip,
    limit: parseInt(limit),
  };
};

// Format paginated response
const paginatedResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < Math.ceil(total / limit),
      hasPrevPage: parseInt(page) > 1,
    },
  };
};

module.exports = {
  sendSuccess,
  sendError,
  paginate,
  paginatedResponse,
};
