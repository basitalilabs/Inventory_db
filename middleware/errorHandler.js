const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Something went wrong';
    console.error(err);
    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;