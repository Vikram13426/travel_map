import CancelIcon from '@mui/icons-material/Cancel';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './Login.css';

const userLoginSuccess = () => {
    toast.success("Login Successfully!");
};

const userLoginFail = (err) => {
    toast.error("Failed to login! " + err);
};

const Login = ({ setShowLogin, setCurrentUser }) => {
    const emailRef = useRef();
    const passRef = useRef();
    const [showProgress, setShowProgress] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('handleSubmit called');

        const newUser = {
            email: emailRef.current.value,
            password: passRef.current.value,
        };
        console.log('User data:', newUser);

        try {
            setShowProgress(true);
            console.log('Making API call...');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/login`,
                newUser
            );
            console.log('API response:', response.data);
            localStorage.setItem('user', response.data.user);
            localStorage.setItem('token', response.data.token);
            setCurrentUser(response.data.user);
            setShowProgress(false);
            userLoginSuccess();
            setShowLogin(false);
            console.log('setShowLogin called with false');
        } catch (err) {
            console.error('Login error:', err);
            setShowProgress(false);
            userLoginFail(err.message || "Unknown error");
        }
    };

    return (
        <div className="login_container">
            <div className="application">
                <ExitToAppIcon />
                Login to your profile
            </div>
            <form onSubmit={(e) => {
                console.log('Form onSubmit triggered');
                handleSubmit(e);
            }}>
                <input
                    type="text"
                    placeholder="Email"
                    ref={emailRef}
                    onChange={() => console.log('Email input:', emailRef.current.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    ref={passRef}
                    onChange={() => console.log('Password input:', passRef.current.value)}
                />
                <button
                    className="login_button"
                    type="submit"
                    onClick={() => console.log('Login button clicked')}
                >
                    Login
                </button>
                {showProgress && (
                    <Box sx={{ width: '100%', marginTop: '5px' }}>
                        <LinearProgress />
                    </Box>
                )}
            </form>
            <CancelIcon className="login_cancel" onClick={() => setShowLogin(false)} />
        </div>
    );
};

export default Login;