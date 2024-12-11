const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
    console.error(err.message); // Log the error object
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // wrong MongoDB Id error
    if(err.name === "CastError")
    // Send JSON response
    

    //Mongoose duplicate key error
    if(err.code === 11000){
        // ${Object.Keys(err.keyValue)} is like email is duplicate
        const message= `Duplicate ${Object.Keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message,400);
    }

    //Wrong JWT Error
    if(err.name === "JsonWebTokenError"){
        const message = "JSON web Token is invalid , Try again";
        err = new ErrorHandler(message,400);
    }

    //JWT EXPIRE error

    if(err.name === "TokenExpiredError"){
        const message = "JSON web Token is Expired";
        err=new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success: false,
        error: err.message
    });
};