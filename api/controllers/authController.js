const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register User
exports.registerUser = async (req, res) => {
    const {username, email, password, organizationName, location, coordinates, phone, role} = req.body;

    // Validation: Check required fields
    if (!username || !email || !password || !location || !coordinates || !role) {
        return res.status(400).json({error: 'All required fields must be filled.'});
    }

    if (!coordinates.latitude || !coordinates.longitude) {
        return res.status(400).json({error: 'Coordinates are required.'});
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({error: 'User with this email already exists.'});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            organizationName,
            location,
            coordinates,
            phone,
            role,
        });

        await newUser.save();
        res.status(201).json({message: 'User registered successfully.'});
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({error: 'Registration failed. Please try again later.'});
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const {email, password} = req.body;

    // Validation: Check required fields
    if (!email || !password) {
        return res.status(400).json({error: 'Email and password are required.'});
    }

    try {
        // Check if the user exists
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({error: 'Invalid email or password.'});
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({error: 'Invalid email or password.'});
        }

        // Store user info in session
        req.session.user = {
            id: user._id,
            role: user.role,
        };

        res.json({message: 'Login successful.', role: user.role});
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({error: 'Login failed. Please try again later.'});
    }
};

// Logout User
exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout Error:', err.message);
            return res.status(500).json({error: 'Logout failed. Please try again later.'});
        }
        res.clearCookie('connect.sid');
        res.json({message: 'Logout successful.'});
    });
};
