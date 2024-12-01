import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../Navbar/Navbar';
import './MainPageClient.css';
import { Table, Button, Alert } from 'react-bootstrap';

const BASE_URL = 'http://192.168.230.19:5000';
const socket = io(BASE_URL);

const MainPageClient = () => {
    const navigate = useNavigate();
    const [availableDonations, setAvailableDonations] = useState([]);
    const [claimedDonations, setClaimedDonations] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const user = {
        username: sessionStorage.getItem('username'),
        role: sessionStorage.getItem('role'),
        latitude: parseFloat(sessionStorage.getItem('latitude')),
        longitude: parseFloat(sessionStorage.getItem('longitude')),
    };

    useEffect(() => {
        if (!user.username || user.role !== 'client') {
            alert('Unauthorized access! Redirecting to login page.');
            navigate('/login');
            return;
        }

        fetchDonations();

        socket.on('foodItemAdded', (newItem) => {
            setAvailableDonations((prev) => [...prev, newItem]);
        });

        socket.on('foodItemClaimedUpdate', ({ foodItemId }) => {
            setAvailableDonations((prev) => prev.filter((item) => item._id !== foodItemId));
            fetchClaimedDonations();
        });

        socket.on('foodItemDeleted', ({ foodItemId }) => {
            setAvailableDonations((prev) => prev.filter((item) => item._id !== foodItemId));
        });

        return () => {
            socket.off('foodItemAdded');
            socket.off('foodItemClaimedUpdate');
            socket.off('foodItemDeleted');
        };
    }, [user, navigate]);

    const fetchDonations = () => {
        fetchAvailableDonations();
        fetchClaimedDonations();
    };

    const fetchAvailableDonations = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/food/available`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableDonations(data);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch available donations.');
            }
        } catch (error) {
            setError(error.message || 'Error fetching available donations.');
        }
    };

    const fetchClaimedDonations = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/food/claimed`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setClaimedDonations(data);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch claimed donations.');
            }
        } catch (error) {
            setError(error.message || 'Error fetching claimed donations.');
        }
    };

    const handleClaimDonation = async (donationId) => {
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`${BASE_URL}/api/food/claim/${donationId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                setSuccessMessage('Donation claimed successfully!');
                fetchDonations();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to claim the donation.');
            }
        } catch (error) {
            setError(error.message || 'Error claiming the donation.');
        }
    };

    const getGoogleMapsLink = (latitude, longitude) => {
        return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    };

    return (
        <div>
            <Navbar />
            <div className="mainpage-client-container container">
                <h2 className="text-center mt-4">Welcome, {user.username}!</h2>
                <p className="text-center text-muted">
                    Browse and claim available food donations to help those in need.
                </p>

                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                {successMessage && <Alert variant="success" className="text-center">{successMessage}</Alert>}

                <div className="available-list">
                    <h4 className="mb-4">Available Donations</h4>
                    <Table responsive bordered hover className="shadow">
                        <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Food Item</th>
                            <th>Organization</th>
                            <th>Description</th>
                            <th>Servings</th>
                            <th>Veg/Non-Veg</th>
                            <th>Packed</th>
                            <th>Shelf Life (hrs)</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {availableDonations.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center">
                                    No donations available within your 10km radius.
                                </td>
                            </tr>
                        ) : (
                            availableDonations.map((donation, index) => (
                                <>
                                    <tr key={donation._id}>
                                        <td>{index + 1}</td>
                                        <td>{donation.foodItem}</td>
                                        <td>{donation.donor.organizationName || 'N/A'}</td>
                                        <td>{donation.description || 'N/A'}</td>
                                        <td>{donation.quantity}</td>
                                        <td>{donation.vegStatus}</td>
                                        <td>{donation.packed ? 'Yes' : 'No'}</td>
                                        <td>{donation.shelfLife}</td>
                                        <td>
                                                <span className={`status ${donation.status.toLowerCase()}`}>
                                                    {donation.status}
                                                </span>
                                        </td>
                                        <td>
                                            {donation.coordinates && (
                                                <a
                                                    href={getGoogleMapsLink(
                                                        donation.coordinates.latitude,
                                                        donation.coordinates.longitude
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-info"
                                                >
                                                    View Location
                                                </a>
                                            )}
                                            {donation.status === 'Available' && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleClaimDonation(donation._id)}
                                                >
                                                    Claim
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="10" className="text-muted">
                                            Address: {donation.location || 'N/A'}
                                        </td>
                                    </tr>
                                </>
                            ))
                        )}
                        </tbody>
                    </Table>
                </div>

                <div className="claimed-list mt-5">
                    <h4 className="mb-4">Your Claimed Donations</h4>
                    <Table responsive bordered hover className="shadow">
                        <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Food Item</th>
                            <th>Organization</th>
                            <th>Description</th>
                            <th>Servings</th>
                            <th>Veg/Non-Veg</th>
                            <th>Packed</th>
                            <th>Shelf Life (hrs)</th>
                            <th>Google Maps</th>
                        </tr>
                        </thead>
                        <tbody>
                        {claimedDonations.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center">
                                    No claimed donations yet.
                                </td>
                            </tr>
                        ) : (
                            claimedDonations.map((donation, index) => (
                                <>
                                    <tr key={donation._id}>
                                        <td>{index + 1}</td>
                                        <td>{donation.foodItem}</td>
                                        <td>{donation.donor.organizationName || 'N/A'}</td>
                                        <td>{donation.description || 'N/A'}</td>
                                        <td>{donation.quantity}</td>
                                        <td>{donation.vegStatus}</td>
                                        <td>{donation.packed ? 'Yes' : 'No'}</td>
                                        <td>{donation.shelfLife}</td>
                                        <td>
                                            <a
                                                href={getGoogleMapsLink(
                                                    donation.coordinates.latitude,
                                                    donation.coordinates.longitude
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-info"
                                            >
                                                View Location
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="9" className="text-muted">
                                            Address: {donation.location || 'N/A'}
                                        </td>
                                    </tr>
                                </>
                            ))
                        )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default MainPageClient;
