import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Assuming you receive a token and the user's role in response
                const { token, role } = data;
                localStorage.setItem('token', token);

                alert('Login successful');
                if (role === 'donor') {
                    window.location.href = '/donor'; // Redirect to donor main page
                } else if (role === 'client') {
                    window.location.href = '/client'; // Redirect to client main page
                }
            } else {
                setError(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred while logging in. Please try again later.');
            console.error('Login error:', err);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="login-container container">
                <h2>Login to Aaharamitra</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                    <button type="submit" className="btn btn-primary">Login</button>
                    <a href="/signup" className="login-link">Don't have an account? Sign up here</a>
                </form>
            </div>
        </div>
    );
};

export default Login;
