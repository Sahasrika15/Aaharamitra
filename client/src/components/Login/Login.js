import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Handle login logic here (e.g., make API call)
    };

    return (
        <div>
            <Navbar />
            <div className="login-container container">
                <h2>Login to Aaharamitra</h2>
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
}

export default Login;
