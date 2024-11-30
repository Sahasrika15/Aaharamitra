import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        organization: '',
        location: '',
        phone: '',
        role: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSignup = (e) => {
        e.preventDefault();
        // Handle signup logic here (e.g., API call)
    };

    return (
        <div>
            <Navbar />
            <div className="signup-container container">
                <h2>Signup for Aaharamitra</h2>
                <form onSubmit={handleSignup}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Organization Name</label>
                        <input
                            type="text"
                            name="organization"
                            className="form-control"
                            value={formData.organization}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            name="location"
                            className="form-control"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="role-selection">
                        <div
                            className={`role-option ${formData.role === 'donor' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelect('donor')}
                        >
                            Donor
                        </div>
                        <div
                            className={`role-option ${formData.role === 'client' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelect('client')}
                        >
                            Client
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Signup</button>
                </form>
            </div>
        </div>
    );
}

export default Signup;
