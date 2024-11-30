import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from '../Navbar/Navbar';
import './MainPageDonor.css';
import { Modal, Button, Form, Card, Col, Row } from 'react-bootstrap';

const BASE_URL = 'http://10.11.50.11:5000'; // Replace with your backend server URL
const socket = io(BASE_URL);

const MainPageDonor = () => {
    const [donations, setDonations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newDonation, setNewDonation] = useState({
        foodItem: '',
        description: '',
        quantity: 0,
        vegStatus: 'Veg',
        packed: false,
        shelfLife: 0,
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchDonations();

        socket.on('foodItemAdded', (newItem) => {
            setDonations((prevDonations) => [...prevDonations, newItem]);
        });

        socket.on('foodItemUpdated', (updatedItem) => {
            setDonations((prevDonations) =>
                prevDonations.map((item) => (item._id === updatedItem._id ? updatedItem : item))
            );
        });

        socket.on('foodItemDeleted', (deletedId) => {
            setDonations((prevDonations) => prevDonations.filter((item) => item._id !== deletedId));
        });

        socket.on('foodItemClaimedUpdate', ({ foodItemId, claimedByOrg }) => {
            setDonations((prevDonations) =>
                prevDonations.map((item) =>
                    item._id === foodItemId
                        ? { ...item, status: 'Claimed', claimedByOrg }
                        : item
                )
            );
        });

        return () => {
            socket.off('foodItemAdded');
            socket.off('foodItemUpdated');
            socket.off('foodItemDeleted');
            socket.off('foodItemClaimedUpdate');
        };
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/food`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setDonations(data);
            } else {
                throw new Error('Failed to fetch donations.');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while fetching donations.');
        }
    };

    const handleAddDonation = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`${BASE_URL}/api/food`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(newDonation),
            });

            if (response.ok) {
                const newItem = await response.json();
                socket.emit('newFoodItem', newItem);
                setNewDonation({
                    foodItem: '',
                    description: '',
                    quantity: 0,
                    vegStatus: 'Veg',
                    packed: false,
                    shelfLife: 0,
                });
                setSuccessMessage('Donation added successfully!');
                setShowModal(false);
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to add donation.');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while adding the donation.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewDonation({ ...newDonation, [name]: value });
    };

    const handlePackedChange = (packed) => {
        setNewDonation({ ...newDonation, packed });
    };

    const handleVegStatusChange = (vegStatus) => {
        setNewDonation({ ...newDonation, vegStatus });
    };

    return (
        <div>
            <Navbar />
            <div className="mainpage-donor-container container">
                <h2 className="text-center mt-4 mb-3">Welcome, Donor!</h2>
                <p className="text-center text-muted mb-4">Thank you for contributing to reducing food wastage.</p>

                {error && <div className="alert alert-danger text-center">{error}</div>}
                {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}

                <div className="text-center my-4">
                    <Button className="btn-success btn-lg" onClick={() => setShowModal(true)}>
                        Add New Donation
                    </Button>
                </div>

                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Add a New Donation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleAddDonation}>
                            <Form.Group className="mb-3">
                                <Form.Label>Food Item</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="foodItem"
                                    value={newDonation.foodItem}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    value={newDonation.description}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="quantity"
                                    value={newDonation.quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Shelf Life (in hours)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="shelfLife"
                                    value={newDonation.shelfLife}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Veg or Non-Veg</Form.Label>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={newDonation.vegStatus === 'Veg' ? 'success' : 'outline-success'}
                                        onClick={() => handleVegStatusChange('Veg')}
                                    >
                                        Veg
                                    </Button>
                                    <Button
                                        variant={newDonation.vegStatus === 'Non-Veg' ? 'danger' : 'outline-danger'}
                                        onClick={() => handleVegStatusChange('Non-Veg')}
                                    >
                                        Non-Veg
                                    </Button>
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Packed or Unpacked</Form.Label>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={newDonation.packed ? 'primary' : 'outline-primary'}
                                        onClick={() => handlePackedChange(true)}
                                    >
                                        Packed
                                    </Button>
                                    <Button
                                        variant={!newDonation.packed ? 'secondary' : 'outline-secondary'}
                                        onClick={() => handlePackedChange(false)}
                                    >
                                        Unpacked
                                    </Button>
                                </div>
                            </Form.Group>
                            <Button type="submit" variant="success" className="w-100">
                                Add Donation
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                <div className="donation-list">
                    <h4 className="mb-4">Your Donations</h4>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {donations.length === 0 ? (
                            <p className="text-center w-100">No donations added yet.</p>
                        ) : (
                            donations.map((donation, index) => (
                                <Col key={donation._id}>
                                    <Card className="h-100 shadow">
                                        <Card.Body>
                                            <Card.Title>{donation.foodItem}</Card.Title>
                                            <Card.Text>{donation.description}</Card.Text>
                                            <ul className="list-unstyled">
                                                <li>Quantity: {donation.quantity}</li>
                                                <li>Shelf Life: {donation.shelfLife} hours</li>
                                                <li>Veg/Non-Veg: {donation.vegStatus}</li>
                                                <li>Packed: {donation.packed ? 'Yes' : 'No'}</li>
                                                <li>
                                                    Status:{' '}
                                                    <span className={`status ${donation.status.toLowerCase()}`}>
                                                        {donation.status}
                                                    </span>
                                                </li>
                                                {donation.status === 'Claimed' && (
                                                    <li>Claimed By: {donation.claimedByOrg}</li>
                                                )}
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default MainPageDonor;
