const express = require("express");
const app = express();
const http = require('http').Server(app);
const bodyParser = require("body-parser");
const cookieParser= require('cookie-parser');
const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(express.json());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

//Middleware for error
const errorMiddleware = require("./middleware/error");


//Routes
const products = require('./routes/productRoute');
const user= require('./routes/userRoute');
const order=require('./routes/orderRoute');
app.use('/api/v1', products);
app.use('/api/v1',user);
app.use('/api/v1',order);

app.use(errorMiddleware);


const PORT =4000;
http.listen(PORT, function(){
    console.log('Server is running');
});



