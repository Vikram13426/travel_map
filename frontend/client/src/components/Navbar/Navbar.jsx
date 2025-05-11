import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import './Navbar.css';

const Navbar = ({ currentUser, setShowLogin, setShowRegister, handleLogOut, handleSearch, setShowHowToUse }) => {
    const handleLoginClick = () => {
        console.log('Login button clicked');
        setShowLogin(true);
        setShowRegister(false);
    };

    const handleRegisterClick = () => {
        console.log('Register button clicked');
        setShowRegister(true);
        setShowLogin(false);
    };

    const handleHowToUseClick = () => {
        console.log('How to Use button clicked');
        setShowHowToUse(true);
    };

    return (
        <nav className="navbar">
            <div className="navbar-title">
                <h1>TRAVEL_MAP</h1>
            </div>
            <div className="navbar-search">
                <div className="search-container">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search pins by country (e.g., India)..."
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="navbar-auth">
                <button
                    className="navbar-button how-to-use"
                    onClick={handleHowToUseClick}
                >
                    How to Use
                </button>
                {currentUser ? (
                    <button className="navbar-button logout" onClick={handleLogOut}>
                        Log Out
                    </button>
                ) : (
                    <>
                        <button
                            className="navbar-button login"
                            onClick={handleLoginClick}
                        >
                            Login
                        </button>
                        <button
                            className="navbar-button register"
                            onClick={handleRegisterClick}
                        >
                            Register
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;