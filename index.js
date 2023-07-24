const express = require('express');
const mongoose = require('mongoose');
// const routes = require('routes');
require('dotenv').config();
const app = express();

app.use(express.json());
app.listen(3000,()=>{
    console.log("Server started on localhost 3000");
})

//connecting DB
mongoose.connect(process.env.DBURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const con =  mongoose.connection;

con.on('open',()=>{
    console.log("MongoDB is connected")
})




const routes = require('./router/index');

app.use('/api',routes);