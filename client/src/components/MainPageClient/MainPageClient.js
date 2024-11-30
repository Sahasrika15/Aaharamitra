import React, {useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import Navbar from '../Navbar/Navbar';
import './MainPageClient.css';

const BASE_URL = 'http://10.11.50.11:5000';
const socket = io(BASE_URL);

const MainPageClient = () => {
    const [availableDonations, setAvailableDonations] = useState([]);
    const [claimedDonations, setClaimedDonations] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchDonations();

        socket.on('foodItemAdded', (newItem) => {
            setAvailableDonations((prev) => [...prev, newItem]);
        });

        socket.on('foodItemClaimedUpdate', ({foodItemId}) => {
            setAvailableDonations((prev) => prev.filter((item) => item._id !== foodItemId));
            fetchClaimedDonations();
        });

        socket.on('foodItemDeleted', ({foodItemId}) => {
            setAvailableDonations((prev) => prev.filter((item) => item._id !== foodItemId));
        });

        return () => {
            socket.off('foodItemAdded');
            socket.off('foodItemClaimedUpdate');
            socket.off('foodItemDeleted');
        };
    }, []);

    const fetchDonations = () => {
        fetchAvailableDonations();
        fetchClaimedDonations();
    };

    const fetchAvailableDonations = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/food/available`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableDonations(data);
            } else {
                throw new Error('Failed to fetch available donations.');
            }
        } catch (error) {
            setError(error.message || 'Error fetching available donations.');
        }
    };

    const fetchClaimedDonations = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/food/claimed`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setClaimedDonations(data);
            } else {
                throw new Error('Failed to fetch claimed donations.');
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
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                setSuccessMessage('Donation claimed successfully!');
                socket.emit('foodItemClaimed', {foodItemId: donationId});
                fetchDonations();
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to claim the donation.');
            }
        } catch (error) {
            setError(error.message || 'Error claiming the donation.');
        }
    };

    return (
        <div>
            <Navbar/>
            <div className="mainpage-client-container container">
                <h2 className="text-center mt-4">Welcome, Recipient!</h2>
                <p className="text-center text-muted">
                    Browse and claim available food donations to help those in need.
                </p>

                {error && <div className="alert alert-danger text-center">{error}</div>}
                {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}

                <div className="available-list">
                    <h4 className="mb-4">Available Donations</h4>
                    <table className="table table-bordered table-hover shadow">
                        <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Food Item</th>
                            <th>Donor</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {availableDonations.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No donations available at the moment.
                                </td>
                            </tr>
                        ) : (
                            availableDonations.map((donation, index) => (
                                <tr key={donation._id}>
                                    <td>{index + 1}</td>
                                    <td>{donation.foodItem}</td>
                                    <td>{donation.donor.username}</td>
                                    <td>
                                            <span className={`status ${donation.status.toLowerCase()}`}>
                                                {donation.status}
                                            </span>
                                    </td>
                                    <td>
                                        {donation.status === 'Available' && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleClaimDonation(donation._id)}
                                            >
                                                Claim
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="claimed-list mt-5">
                    <h4 className="mb-4">Your Claimed Donations</h4>
                    <table className="table table-bordered table-hover shadow">
                        <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Food Item</th>
                            <th>Donor</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {claimedDonations.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    No claimed donations yet.
                                </td>
                            </tr>
                        ) : (
                            claimedDonations.map((donation, index) => (
                                <tr key={donation._id}>
                                    <td>{index + 1}</td>
                                    <td>{donation.foodItem}</td>
                                    <td>{donation.donor.username}</td>
                                    <td>
                                            <span className={`status ${donation.status.toLowerCase()}`}>
                                                {donation.status}
                                            </span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MainPageClient;
