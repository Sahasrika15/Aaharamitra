import React, {useState, useEffect} from 'react';
import Navbar from '../Navbar/Navbar';
import './Signup.css';

const BASE_URL = 'https://aaharamitra.onrender.com';
const GOOGLE_MAPS_API_KEY = 'AIzaSyCd9-aeTjeDQ_g1Z9JT9F_-s73YO0jLLSE';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        organizationName: '',
        location: '',
        coordinates: {latitude: '', longitude: ''},
        phone: '',
        role: '',
    });
    const [error, setError] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        const loadGoogleMaps = () => {
            if (!window.google) {
                const googleMapsScript = document.createElement('script');
                googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
                googleMapsScript.async = true;
                googleMapsScript.defer = true;
                googleMapsScript.onload = () => setMapLoaded(true);
                document.body.appendChild(googleMapsScript);
            } else {
                setMapLoaded(true);
            }
        };

        loadGoogleMaps();
    }, []);

    useEffect(() => {
        if (mapLoaded) {
            initMap();
        }
    }, [mapLoaded]);

    const initMap = () => {
        const telanganaCenter = {lat: 17.123184, lng: 79.208824};

        const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
            center: telanganaCenter,
            zoom: 7,
        });

        const markerInstance = new window.google.maps.Marker({
            map: mapInstance,
            position: telanganaCenter,
            draggable: true,
        });

        markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition();
            if (position) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    coordinates: {
                        latitude: position.lat(),
                        longitude: position.lng(),
                    },
                }));
            }
        });

        initAutocomplete(mapInstance, markerInstance);
    };

    const initAutocomplete = (mapInstance, markerInstance) => {
        const autocomplete = new window.google.maps.places.Autocomplete(
            document.getElementById('location'),
            {
                componentRestrictions: {country: 'in'},
                fields: ['geometry', 'formatted_address'],
            }
        );

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry || !place.geometry.location) {
                setError('Invalid location selected. Please try again.');
                return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setFormData((prevFormData) => ({
                ...prevFormData,
                location: place.formatted_address || '',
                coordinates: {latitude: lat, longitude: lng},
            }));

            mapInstance.setCenter({lat, lng});
            mapInstance.setZoom(14);
            markerInstance.setPosition({lat, lng});
        });
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleRoleSelect = (role) => {
        setFormData({...formData, role});
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.coordinates.latitude || !formData.coordinates.longitude) {
            setError('Please select a valid address or move the marker to a location.');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Signup failed. Please try again.');
            }

            alert('Signup successful!');
            window.location.href = '/login';
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        }
    };

    return (
        <div>
            <Navbar/>
            <div className="signup-container">
                <div className="form-container">
                    <h2>Signup for Aaharamitra</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
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
                                name="organizationName"
                                className="form-control"
                                value={formData.organizationName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                className="form-control"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Type your address"
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
                        <div className="role-selection mb-3">
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
                        <button type="submit" className="btn btn-primary">
                            Signup
                        </button>
                    </form>
                </div>
                <div id="map-container">
                    <div id="map"></div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
