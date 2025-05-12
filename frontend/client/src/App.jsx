import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login/Login.jsx';
import Register from './components/Register/Register.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import './App.css';

console.log('Mapbox Token:', import.meta.env.VITE_MAPBOX);

const pinAddSuccess = () => {
    toast.success("Pin added successfully!");
};

const pinDeleteSuccess = () => {
    toast.success("Pin deleted successfully!");
};

const pinEditSuccess = () => {
    toast.success("Pin updated successfully!");
};

const pinEditFailed = (error) => {
    toast.error(error);
};

const pinDeleteFailed = () => {
    toast.error("Pin failed to delete. Please try again!");
};

const userNotLoggedIn = () => {
    toast.warning("Login to account to add pin!");
};

const userLoggedOut = (user) => {
    toast.warning("Log out from " + user);
};

const pinAddFailure = () => {
    toast.error("Couldn't add pin. Please fill all data");
};

const fetchCountryFromCoordinates = async (lat, long) => {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`
        );
        const country = response.data.address?.country || 'Unknown';
        return country;
    } catch (error) {
        console.error(`Error fetching country for lat=${lat}, lon=${long}:`, error);
        return 'Unknown';
    }
};

const App = () => {
    const [pins, setPins] = useState([]);
    const [filteredPins, setFilteredPins] = useState([]);
    const [viewport, setViewport] = useState({
        longitude: 12.4,
        latitude: 37.8,
        zoom: 2,
    });
    const [currentPlaceId, setCurrentPlaceId] = useState(null);
    const [newPlace, setNewPlace] = useState(null);
    const [title, setTitle] = useState(null);
    const [description, setDescription] = useState(null);
    const [rating, setRating] = useState(1);
    const [tags, setTags] = useState([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [currentUser, setCurrentUser] = useState(localStorage.getItem('user'));
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showHowToUse, setShowHowToUse] = useState(false);
    const [showFormEdit, setShowFormEdit] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowTagDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSetShowLogin = (value) => {
        console.log('Setting showLogin to:', value);
        setShowLogin(value);
    };

    const handleSetShowRegister = (value) => {
        console.log('Setting showRegister to:', value);
        setShowRegister(value);
    };

    useEffect(() => {
        console.log('showLogin:', showLogin);
        console.log('showRegister:', showRegister);
    }, [showLogin, showRegister]);

    const handleSearch = (query) => {
        console.log('Search query:', query);
        console.log('Current pins:', pins);

        if (!query) {
            console.log('Query is empty, resetting filteredPins to all pins');
            setFilteredPins([...pins]);
            setViewport({
                longitude: 12.4,
                latitude: 37.8,
                zoom: 2,
            });
            return;
        }

        const lowerQuery = query.toLowerCase().trim();
        const filtered = pins.filter((pin) => {
            const country = pin.country ? pin.country.toLowerCase() : 'unknown';
            const tagMatch = pin.tags ? pin.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) : false;
            const matches = country.includes(lowerQuery) || tagMatch;
            console.log(`Pin: ${pin.title}, Country: ${country}, Tags: ${pin.tags}, Matches: ${matches}`);
            return matches;
        });

        console.log('Filtered pins:', filtered);
        setFilteredPins([...filtered]);

        if (lowerQuery.includes('india') && filtered.length > 0) {
            const lats = filtered.map((pin) => pin.lat);
            const longs = filtered.map((pin) => pin.long);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLong = Math.min(...longs);
            const maxLong = Math.max(...longs);
            const centerLat = (minLat + maxLat) / 2;
            const centerLong = (minLong + maxLong) / 2;
            const latDiff = maxLat - minLat;
            const longDiff = maxLong - minLong;
            const maxDiff = Math.max(latDiff, longDiff);
            const zoom = Math.min(10, Math.max(4, 10 - Math.log2(maxDiff * 10)));
            setViewport({
                longitude: centerLong,
                latitude: centerLat,
                zoom: zoom,
                transitionDuration: 1000,
            });
        } else if (lowerQuery.includes('india')) {
            setViewport({
                longitude: 78.9629,
                latitude: 20.5937,
                zoom: 5,
                transitionDuration: 1000,
            });
        }
    };

    const handleMarkerClick = (id, lat, long) => {
        setCurrentPlaceId(id);
        setViewport({
            ...viewport,
            latitude: lat,
            longitude: long,
            zoom: 10,
        });
    };

    const handleAddClick = (e) => {
        console.log('Double-click detected at:', e.lngLat);
        setNewPlace({
            lat: e.lngLat.lat,
            long: e.lngLat.lng,
        });
        setShowFormEdit(false);
    };

    const handlePinSubmit = async (e) => {
        e.preventDefault();

        console.log('Submitting new pin with values:', {
            currentUser,
            title,
            rating,
            description,
            lat: newPlace?.lat,
            long: newPlace?.long,
            tags,
        });

        const newPin = {
            userName: currentUser,
            title: title,
            rating: rating,
            description: description,
            lat: newPlace.lat,
            long: newPlace.long,
            tags: tags,
        };

        try {
            if (!currentUser) {
                console.log('User not logged in');
                userNotLoggedIn();
            } else if (
                title === null ||
                rating === null ||
                description === null ||
                title === "" ||
                rating === "" ||
                description === ""
            ) {
                console.log('Validation failed: Some fields are empty or null');
                pinAddFailure();
            } else {
                setShowProgress(true);
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/pins`,
                    newPin,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }
                );
                const country = await fetchCountryFromCoordinates(newPin.lat, newPlace.long);
                const pinWithCountry = { ...response.data, country, tags };
                const updatedPins = [...pins, pinWithCountry];
                setPins(updatedPins);
                setFilteredPins(updatedPins);
                setNewPlace(null);
                setShowProgress(false);
                pinAddSuccess();
                setRating(1);
                setDescription(null);
                setTitle(null);
                setTags([]);
            }
        } catch (err) {
            console.log('Error adding pin:', err);
            pinAddFailure();
        }
    };

    const handleEditPin = (pin) => {
        setCurrentPlaceId(pin._id);
        setShowFormEdit(true);
        setNewPlace({
            lat: pin.lat,
            long: pin.long,
        });
        setTitle(pin.title);
        setDescription(pin.description);
        setRating(pin.rating);
        setTags(pin.tags || []);
    };

    const handleEditPinSubmit = async (e, pin) => {
        e.preventDefault();

        const id = pin._id;
        const updatedPin = {
            title: title,
            rating: rating,
            description: description,
            tags: tags,
        };

        let error = "";

        try {
            if (
                title === null ||
                rating === null ||
                description === null ||
                title === "" ||
                rating === "" ||
                description === ""
            ) {
                error = "Couldn't update the pin. Please fill all data";
                pinEditFailed(error);
            } else {
                setShowProgress(true);
                const response = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/pins/${id}`,
                    updatedPin,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }
                );
                const updatedPins = pins.map((p) => (p._id === id ? { ...response.data.newPin, country: p.country, tags } : p));
                setPins(updatedPins);
                setFilteredPins(updatedPins.map((p) => (p._id === id ? { ...response.data.newPin, country: p.country, tags } : p)));
                setNewPlace(null);
                setShowProgress(false);
                setShowFormEdit(false);
                pinEditSuccess();
                setRating(1);
                setDescription(null);
                setTitle(null);
                setTags([]);
            }
        } catch (err) {
            pinEditFailed(err.response?.data?.message || 'Failed to update pin');
            setShowFormEdit(false);
            console.log(err);
        }
    };

    const handleDeletePin = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/pins/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const updatedPins = pins.filter((pin) => pin._id !== id);
            setPins(updatedPins);
            setFilteredPins(updatedPins);
            pinDeleteSuccess();
        } catch (err) {
            pinDeleteFailed();
            console.log(err);
        }
    };

    const handleLogOut = () => {
        setCurrentUser(null);
        userLoggedOut(currentUser);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    useEffect(() => {
        const getPins = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/pins`);
                const pinsWithCountry = await Promise.all(
                    response.data.map(async (pin) => {
                        const country = await fetchCountryFromCoordinates(pin.lat, pin.long);
                        return { ...pin, country };
                    })
                );
                setPins(pinsWithCountry);
                setFilteredPins(pinsWithCountry);
            } catch (err) {
                console.log('Error fetching pins:', err);
            }
        };
        getPins();
    }, []);

    const calculateMarkerSize = () => {
        const baseMultiplier = windowWidth / 100;
        return Math.max(15, Math.min(40, baseMultiplier + viewport.zoom * 2));
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: '#fff',
        borderRadius: '15px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        p: 4,
        background: 'linear-gradient(135deg,rgb(67, 116, 189) 0%,rgb(120, 157, 216) 100%)',
        maxHeight: '80vh',
        overflowY: 'auto',
    };

    const availableTags = [
        'Beach', 'Mountain', 'City', 'Adventure', 'Food', 'Historical', 'Nature', 'Culture',
        'Park', 'Museum', 'Temple', 'Church', 'Wildlife', 'Lake', 'Desert', 'Cave', 'Island',
        'Festival', 'Market', 'Hiking', 'Camping', 'Monument', 'Waterfall', 'Forest', 'Art',
        'Nightlife', 'Village', 'Harbor', 'Bridge', 'Garden', 'Palace', 'Fort', 'River'
    ];

    const handleTagSelect = (tag) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setShowTagDropdown(false);
    };

    const handleTagRemove = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    console.log('Rendering filteredPins on map:', filteredPins);

    return (
        <div>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                className="custom-toast-container"
                style={{ top: '70px' }}
            />
            <Navbar
                currentUser={currentUser}
                setShowLogin={handleSetShowLogin}
                setShowRegister={handleSetShowRegister}
                handleLogOut={handleLogOut}
                handleSearch={handleSearch}
                setShowHowToUse={setShowHowToUse}
            />
            <div className="map-container">
                <Map
                    initialViewState={{
                        longitude: viewport.longitude,
                        latitude: viewport.latitude,
                        zoom: viewport.zoom,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="mapbox://styles/mapbox/outdoors-v12"
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX}
                    onDblClick={handleAddClick}
                    doubleClickZoom={false}
                    onMove={(evt) => setViewport(evt.viewState)}
                    onLoad={() => console.log('Map loaded successfully')}
                >
                    <NavigationControl
                        position="top-right"
                        style={{ marginTop: '60px' }}
                    />
                    {filteredPins.map((pin, idx) => {
                        console.log(`Rendering marker for pin: ${pin.title}, lat: ${pin.lat}, long: ${pin.long}`);
                        return (
                            <React.Fragment key={idx}>
                                <Marker longitude={pin.long} latitude={pin.lat} anchor="center">
                                    <LocationOnIcon
                                        className="icon"
                                        style={{
                                            color: !currentUser ? '#ff0000' : (pin.userName === currentUser ? '#3342ff' : '#ff0000'),
                                            fontSize: calculateMarkerSize(),
                                        }}
                                        onDoubleClick={(event) => event.stopPropagation()}
                                        onClick={() => handleMarkerClick(pin._id, pin.lat, pin.long)}
                                    />
                                </Marker>

                                {pin._id === currentPlaceId && (
                                    <Popup
                                        longitude={pin.long}
                                        latitude={pin.lat}
                                        closeOnClick={false}
                                        closeOnMove={false}
                                        anchor="left"
                                        onClose={() => setCurrentPlaceId(null)}
                                        className="pin-view-popup"
                                    >
                                        <div className="card-3d">
                                            <div className="card-header">
                                                <h4 className="place">{pin.title}</h4>
                                            </div>
                                            <div className="card-body">
                                                <div className="info-section">
                                                    <span className="info-label">Country:</span>
                                                    <p className="info-text">{pin.country}</p>
                                                </div>
                                                <div className="info-section">
                                                    <span className="info-label">Tags:</span>
                                                    <p className="info-text tags">{pin.tags?.join(', ') || 'None'}</p>
                                                </div>
                                                <div className="info-section">
                                                    <span className="info-label">Review:</span>
                                                    <p className="info-text">{pin.description}</p>
                                                </div>
                                                <div className="info-section">
                                                    <span className="info-label">Rating:</span>
                                                    <div className="stars">
                                                        {Array(pin.rating).fill(<StarIcon className="star" />)}
                                                    </div>
                                                </div>
                                                <div className="info-section">
                                                    <span className="info-label">Created by:</span>
                                                    <span className="info-text username">{pin.userName}</span>
                                                </div>
                                                <div className="info-section">
                                                    <span className="info-label">Date:</span>
                                                    <span className="info-text date">{moment(pin.createdAt).fromNow()}</span>
                                                </div>
                                            </div>
                                            {currentUser === pin.userName && (
                                                <div className="btn-group-3d">
                                                    <button
                                                        className="btn-3d edit"
                                                        type="button"
                                                        onClick={() => handleEditPin(pin)}
                                                    >
                                                        Edit Pin
                                                    </button>
                                                    <button
                                                        className="btn-3d delete"
                                                        type="button"
                                                        onClick={() => handleDeletePin(pin._id)}
                                                    >
                                                        Delete Pin
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {newPlace && (
                        <Popup
                            longitude={newPlace.long}
                            latitude={newPlace.lat}
                            closeOnClick={false}
                            closeOnMove={false}
                            onClose={() => {
                                setNewPlace(null);
                                setShowFormEdit(false);
                                setTags([]);
                                setShowTagDropdown(false);
                            }}
                            anchor="left"
                            className="pin-form-popup"
                        >
                            <div>
                                {console.log('Rendering popup for newPlace:', newPlace)}
                                {!showFormEdit && newPlace && (
                                    <form onSubmit={handlePinSubmit} className="pin-form-3d">
                                        <div className="form-header">
                                            <h3>Add a New Pin</h3>
                                        </div>
                                        <div className="form-field">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                placeholder="Enter a title"
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="input-3d"
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Review</label>
                                            <textarea
                                                placeholder="Say something about this place"
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="textarea-3d"
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Tags</label>
                                            <div className="tag-selector-3d" ref={dropdownRef}>
                                                <button
                                                    type="button"
                                                    className="tag-dropdown-button-3d"
                                                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                                                >
                                                    {tags.length > 0 ? `${tags.length} tag(s) selected` : 'Select tags'}
                                                </button>
                                                {showTagDropdown && (
                                                    <div className="tag-dropdown-3d">
                                                        {availableTags.map((tag) => (
                                                            <div
                                                                key={tag}
                                                                className={`tag-option-3d ${tags.includes(tag) ? 'selected' : ''}`}
                                                                onClick={() => handleTagSelect(tag)}
                                                            >
                                                                {tag}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {tags.length > 0 && (
                                                    <div className="selected-tags-3d">
                                                        {tags.map((tag) => (
                                                            <span key={tag} className="tag-chip-3d">
                                                                {tag}
                                                                <CloseIcon
                                                                    className="tag-chip-remove-3d"
                                                                    onClick={() => handleTagRemove(tag)}
                                                                />
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label>Rating</label>
                                            <select
                                                value={rating}
                                                onChange={(e) => setRating(Number(e.target.value))}
                                                className="select-3d"
                                            >
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                            </select>
                                        </div>
                                        <button className="submit-btn-3d" type="submit">
                                            Add Pin
                                        </button>
                                        {showProgress && (
                                            <Box sx={{ width: '100%' }}>
                                                <LinearProgress className="progress-bar-3d" />
                                            </Box>
                                        )}
                                    </form>
                                )}

                                {showFormEdit && newPlace && (
                                    <form
                                        onSubmit={(e) => handleEditPinSubmit(e, { _id: currentPlaceId })}
                                        className="pin-form-3d"
                                    >
                                        <div className="form-header">
                                            <h3>Edit Pin</h3>
                                        </div>
                                        <div className="form-field">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                placeholder="Enter a title"
                                                value={title || ''}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="input-3d"
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Review</label>
                                            <textarea
                                                placeholder="Say something about this place"
                                                value={description || ''}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="textarea-3d"
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Tags</label>
                                            <div className="tag-selector-3d" ref={dropdownRef}>
                                                <button
                                                    type="button"
                                                    className="tag-dropdown-button-3d"
                                                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                                                >
                                                    {tags.length > 0 ? `${tags.length} tag(s) selected` : 'Select tags'}
                                                </button>
                                                {showTagDropdown && (
                                                    <div className="tag-dropdown-3d">
                                                        {availableTags.map((tag) => (
                                                            <div
                                                                key={tag}
                                                                className={`tag-option-3d ${tags.includes(tag) ? 'selected' : ''}`}
                                                                onClick={() => handleTagSelect(tag)}
                                                            >
                                                                {tag}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {tags.length > 0 && (
                                                    <div className="selected-tags-3d">
                                                        {tags.map((tag) => (
                                                            <span key={tag} className="tag-chip-3d">
                                                                {tag}
                                                                <CloseIcon
                                                                    className="tag-chip-remove-3d"
                                                                    onClick={() => handleTagRemove(tag)}
                                                                />
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label>Rating</label>
                                            <select
                                                value={rating}
                                                onChange={(e) => setRating(Number(e.target.value))}
                                                className="select-3d"
                                            >
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                            </select>
                                        </div>
                                        <button className="submit-btn-3d" type="submit">
                                            Update Pin
                                        </button>
                                        {showProgress && (
                                            <Box sx={{ width: '100%' }}>
                                                <LinearProgress className="progress-bar-3d" />
                                            </Box>
                                        )}
                                    </form>
                                )}
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>

            {(showLogin || showRegister || showHowToUse) && (
                <div className="modal-backdrop" onClick={() => {
                    setShowLogin(false);
                    setShowRegister(false);
                    setShowHowToUse(false);
                }} />
            )}
            {showRegister && <Register setShowRegister={setShowRegister} />}
            {showLogin && <Login setShowLogin={setShowLogin} setCurrentUser={setCurrentUser} />}
            {showHowToUse && (
                <Modal
                    aria-labelledby="how-to-use-modal-title"
                    aria-describedby="how-to-use-modal-description"
                    open={showHowToUse}
                    onClose={() => setShowHowToUse(false)}
                    closeAfterTransition
                    slots={{ backdrop: Backdrop }}
                    slotProps={{
                        backdrop: {
                            timeout: 500,
                        },
                    }}
                >
                    <Fade in={showHowToUse}>
                        <Box sx={modalStyle}>
                            <CancelIcon
                                className="how-to-use-cancel-icon"
                                onClick={() => setShowHowToUse(false)}
                            />
                            <Typography id="how-to-use-modal-title" variant="h6" component="h2" className="how-to-use-title">
                                How to Use TRAVEL_MAP
                            </Typography>
                            <Typography component="ul" variant="body1" id="how-to-use-modal-description" className="how-to-use-list">
                                <li className="how-to-use-item">
                                    <SearchIcon className="how-to-use-icon" />
                                    <div>
                                        <span className="how-to-use-bold">Explore the World:</span> Use the <span className="how-to-use-uppercase">search bar</span> to find travel pins by country (e.g., search "India").
                                    </div>
                                </li>
                                <li className="how-to-use-item">
                                    <MapIcon className="how-to-use-icon" />
                                    <div>
                                        <span className="how-to-use-bold">Zoom and Navigate:</span> <span className="how-to-use-uppercase">Scroll</span> to zoom in/out and <span className="how-to-use-uppercase">drag</span> to explore the map.
                                    </div>
                                </li>
                                <li className="how-to-use-item">
                                    <VisibilityIcon className="how-to-use-icon" />
                                    <div>
                                        <span className="how-to-use-bold">Discover Travel Stories:</span> <span className="how-to-use-uppercase">Click on pins</span> to read reviews and ratings from other travelers.
                                    </div>
                                </li>
                                <li className="how-to-use-item">
                                    <AddLocationIcon className="how-to-use-icon" />
                                    <div>
                                        <span className="how-to-use-bold">Share Your Journey:</span> <span className="how-to-use-uppercase">Double-click</span> on the map to add a pin with your travel story, rating, and title.
                                    </div>
                                </li>
                                <li className="how-to-use-item">
                                    <EditIcon className="how-to-use-icon" />
                                    <div>
                                        <span className="how-to-use-bold">Manage Your Pins:</span> <span className="how-to-use-uppercase">Edit</span> or <span className="how-to-use-uppercase">delete</span> your pins to keep your travel map up to date.
                                    </div>
                                </li>
                            </Typography>
                            <Typography className="how-to-use-bottom-text" component="p">
                                Happy Traveling!
                            </Typography>
                            <Typography className="how-to-use-bottom-text how-to-use-signature" component="p">
                                Your TRAVEL_MAP Team
                            </Typography>
                        </Box>
                    </Fade>
                </Modal>
            )}
        </div>
    );
};

export default App;