require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: 'https://aaharamitra.vercel.app/', // Allow requests from any origin
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

// Middleware to handle CORS
app.use(cors({
    origin: '*', // Replace '*' with your frontend URL in production
    credentials: true,
}));

// Middleware to parse incoming JSON requests
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// WebSocket setup
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Routes
const authRoutes = require('./auth');
const foodRoutes = require('./food')(io); // Pass the `io` instance to the food routes

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);

// Route to check server health
app.get('/', (req, res) => {
    res.status(200).send('Server is running and healthy!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Internal server error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Handle 404 errors for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
