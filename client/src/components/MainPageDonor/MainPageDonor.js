import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../Navbar/Navbar';
import './MainPageDonor.css';
import { Modal, Button, Form, Card, Col, Row, Alert } from 'react-bootstrap';

const BASE_URL = 'http://localhost:5000';
const socket = io(BASE_URL);

const MainPageDonor = () => {
    const navigate = useNavigate();
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

    const user = {
        username: sessionStorage.getItem('username'),
        role: sessionStorage.getItem('role'),
    };

    useEffect(() => {
        if (!user.username || user.role !== 'donor') {
            alert('Unauthorized access! Redirecting to login page.');
            navigate('/login');
            return;
        }

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

        return () => {
            socket.off('foodItemAdded');
            socket.off('foodItemUpdated');
            socket.off('foodItemDeleted');
        };
    }, [user, navigate]);

    const fetchDonations = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/food`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setDonations(data);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch donations.');
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
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify(newDonation),
            });

            if (response.ok) {
                const newItem = await response.json();
                setDonations((prevDonations) => [...prevDonations, newItem]);
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
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add donation.');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while adding the donation.');
        }
    };

    const handleDeleteDonation = async (id) => {
        setError('');
        setSuccessMessage('');
        try {
            const response = await fetch(`${BASE_URL}/api/food/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                setDonations((prevDonations) => prevDonations.filter((donation) => donation._id !== id));
                setSuccessMessage('Donation deleted successfully!');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete donation.');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while deleting the donation.');
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
                <h2 className="text-center mt-4 mb-3">Welcome, {user.username}!</h2>
                <p className="text-center text-muted mb-4">
                    Thank you for contributing to reducing food wastage.
                </p>

                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                {successMessage && <Alert variant="success" className="text-center">{successMessage}</Alert>}

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
                            donations.map((donation) => (
                                <Col key={donation._id}>
                                    <Card className="h-100 shadow">
                                        <Card.Body>
                                            <Card.Title>{donation.foodItem}</Card.Title>
                                            <Card.Text>{donation.description}</Card.Text>
                                            <p>Quantity: {donation.quantity}</p>
                                            <p>Shelf Life: {donation.shelfLife} hours</p>
                                            <Button
                                                variant="danger"
                                                className="w-100"
                                                onClick={() => handleDeleteDonation(donation._id)}
                                            >
                                                Delete Donation
                                            </Button>
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
