import React, {useState} from 'react';
import Navbar from '../Navbar/Navbar';
import './Login.css';

const BASE_URL = 'http://10.11.50.11:5000'; // Base URL for the API

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
                body: JSON.stringify({username, password}),
            });

            const data = await response.json();

            if (response.ok) {
                const {token, role} = data;

                if (token && role) {
                    localStorage.clear();

                    localStorage.setItem('token', token);
                    localStorage.setItem('role', role);

                    alert('Login successful');

                    if (role === 'donor') {
                        window.location.href = '/donor';
                    } else if (role === 'client') {
                        window.location.href = '/client';
                    } else {
                        setError('Invalid role assigned, please contact support.');
                    }
                } else {
                    setError('Invalid response from the server, please try again later.');
                }
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred while logging in. Please try again later.');
            console.error('Login error:', err);
        }
    };

    return (
        <div>
            <Navbar/>
            <div className="login-container container">
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
                        <button type="submit" className="btn btn-primary btn-block">Login</button>
                        <a href="/signup" className="login-link">Don't have an account? Sign up here</a>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
