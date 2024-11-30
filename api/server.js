// Import required modules
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const session = require('express-session');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const claimRoutes = require('./routes/claimRoutes');

// Initialize Express app
const app = express();

// Create HTTP server to work with Socket.IO
const server = http.createServer(app);

// Middleware setup
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:19006"], // Allow web and mobile app during development
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the server if the database connection fails
    });

// Set up session middleware (in-memory session store)
app.use(session({
    secret: process.env.SESSION_SECRET, // Use a secret from environment variables
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: false // Set this to true if using HTTPS
    }
}));

// Route handling
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/foods', foodRoutes);
// app.use('/api/claims', claimRoutes);

// Socket.IO events
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('newFoodDonation', (data) => {
        console.log('New food donation:', data);
        io.emit('updateFoodDonations', data); // Notify all clients
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
