import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {io} from 'socket.io-client';
import Navbar from '../Navbar/Navbar';
import './MainPageClient.css';

const BASE_URL = 'http://10.11.50.11:5000';
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
                const filteredDonations = filterDonationsWithin10km(data);
                setAvailableDonations(filteredDonations);
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

    const filterDonationsWithin10km = (donations) => {
        return donations.filter((donation) => {
            if (!donation.coordinates) return false;
            const {latitude, longitude} = donation.coordinates;
            return isWithin10km(user.latitude, user.longitude, latitude, longitude);
        });
    };

    const isWithin10km = (lat1, lon1, lat2, lon2) => {
        const toRadians = (deg) => deg * (Math.PI / 180);
        const R = 6371; // Radius of Earth in km

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in km
        return distance <= 10;
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

    return (
        <div>
            <Navbar/>
            <div className="mainpage-client-container container">
                <h2 className="text-center mt-4">Welcome, {user.username}!</h2>
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
                            <th>Description</th>
                            <th>Quantity</th>
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
                                <tr key={donation._id}>
                                    <td>{index + 1}</td>
                                    <td>{donation.foodItem}</td>
                                    <td>{donation.donor.username}</td>
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
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Veg/Non-Veg</th>
                            <th>Packed</th>
                            <th>Shelf Life (hrs)</th>
                            <th>Status</th>
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
                                <tr key={donation._id}>
                                    <td>{index + 1}</td>
                                    <td>{donation.foodItem}</td>
                                    <td>{donation.donor.username}</td>
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
