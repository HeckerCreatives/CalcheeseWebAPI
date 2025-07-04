const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const http = require("http");
const cors = require("cors");
const socketio = require('socket.io');
require("dotenv").config();

const app = express();

//  Uncomment when you created initialize function for the server
const {initialize} = require("./initialization/serverinit")

const CORS_ALLOWED = process.env.ALLOWED_CORS

const corsConfig = {
    origin: CORS_ALLOWED.split(" "),
    methods: ["GET", "POST", "PUT", "DELETE"], // List only` available methods
    credentials: true, // Must be set to true
    allowedHeaders: ["Origin", "Content-Type", "X-Requested-With", "Accept", "Authorization"],
    credentials: true, // Allowed Headers to be received
};

app.use(cors(corsConfig));
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: CORS_ALLOWED.split(" "),
        methods: ["GET", "POST"],
        credentials: true,
    },
});

module.exports.io = io;

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //  Uncomment when you created initialize function for the server
    initialize();
    console.log("MongoDB Connected");
  })
  .catch((err) => console.log(err));
  

app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false, parameterLimit: 50000 }))
app.use(cookieParser());

// Routes
require("./routes")(app);


const port = process.env.PORT || 5003; // Dynamic port for deployment
server.listen(port, () => console.log(`Server is running on port: ${port}`));