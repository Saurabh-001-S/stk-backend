const express = require('express')
const morgan = require('morgan');
const cors = require('cors');
const userRoute = require('./Route/userRoute')
const stockeRoute = require('./Route/stcokeRoute')

const app = express()
app.use(cors())
app.use(express.json())

// Use Morgan middleware to log requests
app.use(morgan('combined'));
// Custom middleware to log request payload
app.use((req:any, res:any, next:any) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Payload:', req.body);
    }
    next();
});

app.use("/api/v1/userRoute", userRoute);
app.use("/api/v1/stockRoute", stockeRoute);

app.listen(3000, () => {
    console.log('Server ready at port 3000');
});