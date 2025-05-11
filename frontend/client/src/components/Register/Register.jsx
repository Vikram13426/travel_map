import CancelIcon from '@mui/icons-material/Cancel';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import axios from 'axios';
import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import './Register.css';

const userRegisterSuccess = () => {
    toast.success("Register Successfully!");
};

const userRegisterFail = (err) => {
    toast.error("Failed to register! " + err);
};

const Register = ({ setShowRegister }) => {
    const nameRef = useRef();
    const emailRef = useRef();
    const passRef = useRef();
    const [showProgress, setShowProgress] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newUser = {
            userName: nameRef.current.value,
            email: emailRef.current.value,
            password: passRef.current.value,
        };

        try {
            setShowProgress(true);
            await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, newUser);
            setShowProgress(false);
            userRegisterSuccess();
            setShowRegister(false);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                userRegisterFail(err.response.data.error);
                setShowProgress(false);
            } else if (err.response && err.response.data && err.response.data.message) {
                userRegisterFail(err.response.data.message);
                setShowProgress(false);
            } else {
                userRegisterFail("");
                setShowProgress(false);
            }
        }
    };

    return (
        <div className="register_container">
            <div className="application">
                <ExitToAppIcon />
                Create a profile
            </div>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Email" ref={emailRef} />
                <input type="text" placeholder="Username" ref={nameRef} />
                <input type="password" placeholder="Password" ref={passRef} />
                <button className="register_button">Register</button>
                {showProgress && (
                    <Box sx={{ width: '100%', marginTop: '5px' }}>
                        <LinearProgress />
                    </Box>
                )}
            </form>
            <CancelIcon className="register_cancel" onClick={() => setShowRegister(false)} />
        </div>
    );
};

export default Register;