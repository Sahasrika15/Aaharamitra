import React from 'react';
import Navbar from '../Navbar/Navbar';
import './MainPageClient.css';

const MainPageClient = () => {
    // Placeholder available food donations data
    const availableDonations = [
        { id: 1, foodItem: "Vegetable Soup", donor: "John Doe", status: "Available" },
        { id: 2, foodItem: "Bread and Pastries", donor: "Charity Foundation", status: "Available" },
        { id: 3, foodItem: "Rice and Curry", donor: "Jane Smith", status: "Claimed" },
    ];

    return (
        <div>
            <Navbar />
            <div className="mainpage-client-container container">
                <h2 className="text-center mt-4">Welcome, Recipient!</h2>
                <p className="text-center text-muted">Browse and claim available food donations to help those in need.</p>

                {/* Available Food Donations List */}
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
                        {availableDonations.map((donation, index) => (
                            <tr key={donation.id}>
                                <td>{index + 1}</td>
                                <td>{donation.foodItem}</td>
                                <td>{donation.donor}</td>
                                <td><span className={`status ${donation.status.toLowerCase()}`}>{donation.status}</span></td>
                                <td>
                                    {donation.status === "Available" && (
                                        <button className="btn btn-primary btn-sm">Claim</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MainPageClient;
