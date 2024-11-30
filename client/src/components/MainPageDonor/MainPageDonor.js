import React from 'react';
import Navbar from '../Navbar/Navbar';
import './MainPageDonor.css';

const MainPageDonor = () => {
    // Placeholder donation data
    const donations = [
        { id: 1, foodItem: "Vegetable Soup", status: "Delivered" },
        { id: 2, foodItem: "Rice and Curry", status: "Pending" },
        { id: 3, foodItem: "Bread and Pastries", status: "In Transit" },
    ];

    return (
        <div>
            <Navbar />
            <div className="mainpage-donor-container container">
                <h2 className="text-center mt-4">Welcome, Donor!</h2>
                <p className="text-center text-muted">Thank you for contributing to reducing food wastage.</p>

                {/* Add Donation Button */}
                <div className="text-center my-4">
                    <button className="btn btn-success btn-lg">Add New Donation</button>
                </div>

                {/* Donation List */}
                <div className="donation-list">
                    <h4 className="mb-4">Your Donations</h4>
                    <table className="table table-bordered table-hover shadow">
                        <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Food Item</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {donations.map((donation, index) => (
                            <tr key={donation.id}>
                                <td>{index + 1}</td>
                                <td>{donation.foodItem}</td>
                                <td><span className={`status ${donation.status.toLowerCase().replace(" ", "-")}`}>{donation.status}</span></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MainPageDonor;
