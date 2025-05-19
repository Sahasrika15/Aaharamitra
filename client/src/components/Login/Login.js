import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './Login.css';
import backgroundImage from './pic.jpg'; // Import background image

const BASE_URL = 'http://localhost:5000';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                const { token, role, userId, username, organizationName, location, coordinates } = data;

                if (!token || !role || !userId) {
                    setError('Invalid response from the server. Please try again later.');
                    return;
                }

                sessionStorage.clear();
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('role', role);
                sessionStorage.setItem('userId', userId);
                sessionStorage.setItem('username', username || '');
                sessionStorage.setItem('organizationName', organizationName || '');
                sessionStorage.setItem('location', location || '');
                sessionStorage.setItem('latitude', coordinates?.latitude || '');
                sessionStorage.setItem('longitude', coordinates?.longitude || '');

                if (role === 'donor') {
                    window.location.href = '/donor';
                } else if (role === 'client') {
                    window.location.href = '/client';
                } else {
                    setError('Invalid role assigned, please contact support.');
                }
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred while logging in. Please try again later.');
        }
    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <Navbar />
            <div className="login-card">
                <h2>Login to Aaharamitra</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        Login
                    </button>
                    <a href="/signup" className="login-link">
                        Don't have an account? Sign up here
                    </a>
                </form>
            </div>
        </div>
    );
};

export default Login;
