// import modules 
const express = require('express'); // Importing the 'express' package
const jwt = require('jsonwebtoken'); // Importing the 'jsonwebtoken' package
// manage environment variables of your Application without hardcoding secrets & pushing to Github
const dotenv = require('dotenv');

const app = express();
const PORT = 3000;

// Load environment variables
dotenv.config();
//require('dotenv').config(); alternative

// Middleware to parse incoming JSON requests
app.use(express.json());

// Simulate a user database (you can replace this with a real database)
const users = [
    { id: 1, username: 'admin', password: 'password' }, // Example user
];

// Example route to generate a JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if user exists in the simulated database
    const user = users.find(user => user.username === username && user.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token (user.id is used as the payload)
    // Access the SECRET_KEY from the .env file using dotenv
    //jwt.sign({payload info: },secret key,{expiresIn:});
    //for testing have less expire in time
    //const token = jwt.sign({ userId: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '10m' });
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '10s' });

    // Send the JWT token to the client
    res.json({ token });
});

// Middleware to protect routes with JWT verification
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(403).json({ message: 'Access denied, token required' });
    }

    //(err, user): This is the callback function that gets called after the token is verified:
        //err: If the token is invalid, this will contain the error.
        //user: If the token is valid, this will contain the decoded payload (e.g., the user's info).

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            // Token is invalid or expired
            return res.status(403).json({ message: 'Invalid token' });
        }
        // If no error, continue with the request
        req.user = user; // Attach user information to the request object
        next(); // Continue to the protected route
    });
};

// Protected route that requires JWT authentication
app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/verify', (req, res) => {
    const { token } = req.body; // Accept the JWT token as part of the request body
    
    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    // Decode the token (without verifying its signature)
    // The jsonwebtoken library allows you to decode the JWT and inspect the payload.
    const decodedToken = jwt.decode(token);

    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (decodedToken && decodedToken.exp < currentTime) {
        return res.status(401).json({ message: 'Token has expired.' });
    }

    // If it's valid (and not expired)
    res.json({ message: 'Token is still valid.', decodedToken });
});
