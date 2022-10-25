const express = require('express');
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const PORT = process.env.PORT || 5000;
const ConnectDB = require('./database/connect');
const paymentRoute = require("./router/payment");


//middlewares
app.use(express.json());
app.use(cors());

//routes
app.use('/api',paymentRoute);

// Connect to database
ConnectDB.connect(process.env.MONGO_DB_URL);

//listening to port
app.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`);
})