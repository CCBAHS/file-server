require('dotenv').config();
const cors = require('cors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { default: axios, AxiosError } = require('axios');

const app = express();



app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());

app.use('/api', require('./routes/file'));


const port = process.env.PORT || 3001;
app.listen(port);
axios.post(process.env.BLOCKCHAIN_URI+"/addNode").then((_)=>{
    console.log(`Server running at ${res.url}`);
}).catch((err)=>{
    return new AxiosError("Internal Error");
});
console.log(`File server listening on ${port}`);