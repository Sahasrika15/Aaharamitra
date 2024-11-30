import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div className="container">
                    <a className="navbar-brand fw-bold" href="/">Aaharamitra</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
                            <li className="nav-item"><a className="nav-link" href="#stats">Statistics</a></li>
                            <li className="nav-item"><a className="nav-link" href="#leaderboard">Leaderboard</a></li>
                            <li className="nav-item"><a className="nav-link" href="#impact">Impact</a></li>
                        </ul>
                        <a href="/login" className="btn btn-outline-light ms-3">Login</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section text-center text-white py-5" style={{ backgroundColor: '#2c3e50' }}>
                <div className="container">
                    <h1 className="display-4 fw-bold">Welcome to Aaharamitra</h1>
                    <p className="lead">Join us in the fight against food wastage and make a lasting impact!</p>
                    <p className="mt-4 fs-5">"Together, we can ensure that no food goes to waste."</p>
                    <a href="/signup" className="btn btn-warning btn-lg mt-3">Sign Up</a>
                </div>
            </header>

            {/* About Section */}
            <section id="about" className="py-5 bg-light">
                <div className="container">
                    <h2 className="text-center mb-4">Our Mission</h2>
                    <p className="text-center">
                        At Aaharamitra, we aim to reduce food wastage and deliver surplus food to those in need. Through collaboration with donors, volunteers, and NGOs, we ensure food reaches the right people while also making a positive impact on the environment.
                    </p>
                </div>
            </section>

            {/* Statistics Section */}
            <section id="stats" className="py-5" style={{ backgroundColor: '#f0f3f4' }}>
                <div className="container">
                    <h2 className="text-center mb-4">Our Achievements</h2>
                    <div className="row text-center">
                        <div className="col-md-4 mb-4">
                            <div className="stat-box bg-primary text-white p-4 rounded shadow">
                                <h3>500+ Tons</h3>
                                <p>Food Saved</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="stat-box bg-success text-white p-4 rounded shadow">
                                <h3>2000+ Kg</h3>
                                <p>Carbon Emissions Stopped</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="stat-box bg-warning text-white p-4 rounded shadow">
                                <h3>100+</h3>
                                <p>Lives Impacted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leaderboard Section */}
            <section id="leaderboard" className="py-5 bg-light">
                <div className="container">
                    <h2 className="text-center mb-4">Top Donors</h2>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover shadow">
                            <thead className="table-dark">
                            <tr>
                                <th>Rank</th>
                                <th>Name</th>
                                <th>Donations</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>John Doe</td>
                                <td>2000 Meals</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Jane Smith</td>
                                <td>1500 Meals</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Charity Foundation</td>
                                <td>1200 Meals</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section id="impact" className="py-5" style={{ backgroundColor: '#f0f3f4' }}>
                <div className="container">
                    <h2 className="text-center mb-4">Impact on Lives</h2>
                    <div className="row text-center">
                        <div className="col-md-6 mb-4">
                            <div className="impact-box bg-primary text-white p-4 rounded shadow">
                                <h3>50+ NGOs</h3>
                                <p>Collaborated</p>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="impact-box bg-success text-white p-4 rounded shadow">
                                <h3>10,000+</h3>
                                <p>People Fed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-dark text-white py-4 text-center">
                <p>&copy; 2024 Aaharamitra. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
