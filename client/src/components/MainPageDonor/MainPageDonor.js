import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {io} from 'socket.io-client';
import Navbar from '../Navbar/Navbar';
import './MainPageDonor.css';
import {Modal, Button, Form, Card, Col, Row, Alert} from 'react-bootstrap';

const BASE_URL = 'http://localhost:5000';
const socket = io(BASE_URL);

const MainPageDonor = () => {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newDonation, setNewDonation] = useState({
        foodItem: '',
        description: '',
        quantity: 0, // Use 'quantity' for input
        vegStatus: 'Veg',
        packed: false,
        shelfLife: 0,
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedDonation, setSelectedDonation] = useState(null);

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

    const handleDonationClick = (donation) => {
        setSelectedDonation(donation);
    };

    const handleModalClose = () => {
        setSelectedDonation(null);
    };

    return (
        <div>
            <Navbar/>
            <div className="mainpage-donor-container container">
                <h2 className="text-center mt-4 mb-3">Welcome, {user.username}!</h2>
                <p className="text-center text-muted mb-4">
                    Thank you for contributing to reducing food wastage.
                </p>

                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                {successMessage && <Alert variant="success" className="text-center">{successMessage}</Alert>}

                <div className="text-center my-4">
                    <Button className="btn-donor-action" onClick={() => setShowModal(true)}>
                        Add New Donation
                    </Button>
                </div>

                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton className="modal-header-custom">
                        <Modal.Title className="modal-title-custom">Add a New Donation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modal-body-custom">
                        <Form onSubmit={handleAddDonation}>
                            <Form.Group className="mb-3">
                                <Form.Label>Food Item</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="foodItem"
                                    value={newDonation.foodItem}
                                    onChange={(e) => setNewDonation({...newDonation, foodItem: e.target.value})}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    value={newDonation.description}
                                    onChange={(e) => setNewDonation({...newDonation, description: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Servings</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="quantity"
                                    value={newDonation.quantity}
                                    onChange={(e) => setNewDonation({...newDonation, quantity: e.target.value})}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Shelf Life (in hours)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="shelfLife"
                                    value={newDonation.shelfLife}
                                    onChange={(e) => setNewDonation({...newDonation, shelfLife: e.target.value})}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Veg or Non-Veg</Form.Label>
                                <div className="btn-group w-100">
                                    <Button
                                        className="btn-donation-option"
                                        variant={newDonation.vegStatus === 'Veg' ? 'success' : 'outline-success'}
                                        onClick={() => setNewDonation({...newDonation, vegStatus: 'Veg'})}
                                    >
                                        Veg
                                    </Button>
                                    <Button
                                        className="btn-donation-option"
                                        variant={newDonation.vegStatus === 'Non-Veg' ? 'danger' : 'outline-danger'}
                                        onClick={() => setNewDonation({...newDonation, vegStatus: 'Non-Veg'})}
                                    >
                                        Non-Veg
                                    </Button>
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Packaged or Unpackaged</Form.Label>
                                <div className="btn-group w-100">
                                    <Button
                                        className="btn-donation-option"
                                        variant={newDonation.packed ? 'primary' : 'outline-primary'}
                                        onClick={() => setNewDonation({...newDonation, packed: true})}
                                    >
                                        Packaged
                                    </Button>
                                    <Button
                                        className="btn-donation-option"
                                        variant={!newDonation.packed ? 'secondary' : 'outline-secondary'}
                                        onClick={() => setNewDonation({...newDonation, packed: false})}
                                    >
                                        Unpackaged
                                    </Button>
                                </div>
                            </Form.Group>
                            <Button type="submit" className="btn-submit-donation">
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
                                    <Card className="h-100 shadow card-donation">
                                        <Card.Body onClick={() => handleDonationClick(donation)}
                                                   style={{cursor: 'pointer'}}>
                                            <Card.Title>{donation.foodItem}</Card.Title>
                                            <Card.Text>{donation.description}</Card.Text>
                                            <ul className="list-unstyled">
                                                <li><strong>Servings:</strong> {donation.quantity}</li>
                                                {/* Displaying as servings */}
                                                <li><strong>Shelf Life:</strong> {donation.shelfLife} hours</li>
                                                <li><strong>Status:</strong> {donation.status}</li>
                                                {donation.status === 'Claimed' && (
                                                    <li><strong>Claimed
                                                        By:</strong> {donation.claimedBy?.organizationName || 'N/A'}
                                                    </li>
                                                )}
                                            </ul>
                                            <Button
                                                variant="danger"
                                                className="mt-2 btn-delete-donation"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteDonation(donation._id);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </div>

                {selectedDonation && (
                    <Modal show={true} onHide={handleModalClose} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedDonation.foodItem}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p><strong>Description:</strong> {selectedDonation.description || 'N/A'}</p>
                            <p><strong>Servings:</strong> {selectedDonation.quantity}</p> {/* Displaying as servings */}
                            <p><strong>Shelf Life:</strong> {selectedDonation.shelfLife} hours</p>
                            <p><strong>Status:</strong> {selectedDonation.status}</p>
                            {selectedDonation.status === 'Claimed' && (
                                <p><strong>Claimed By:</strong> {selectedDonation.claimedBy?.organizationName || 'N/A'}
                                </p>
                            )}
                        </Modal.Body>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default MainPageDonor;
