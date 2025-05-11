import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import PreviewIcon from '@mui/icons-material/Preview';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import './HowToUse.css';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
};

const HowToUse = () => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <button
                onClick={handleOpen}
                className="button how_to_use"
            >
                How to use the app
            </button>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <CancelIcon
                            className="cancel_icon"
                            onClick={handleClose}
                        />
                        <Typography id="transition-modal-title" variant="h6" component="h2">
                            How to use the map
                        </Typography>
                        <Typography component="ul" variant="body1" id="transition-modal-description" sx={{ mt: 2 }}>
                            <li><span className="bold-text"><PeopleIcon className="instruction_icon" /> Join the Community:</span> <span className="uppercase-text"> Register</span> and <span className="uppercase-text"> login</span> to unlock the power of sharing your opinions on the places you love or have visited.</li>
                            <li><span className="bold-text"><PeopleIcon className="instruction_icon" /> Zoom In/Out: </span> <span className="uppercase-text">Scroll up </span> and <span className="uppercase-text">down </span> to zoom in and out the map</li>
                            <li><span className="bold-text"><PreviewIcon className="instruction_icon" /> Discover Insights:</span> Easily explore engaging reviews and experiences shared by other users by <span className="uppercase-text">clicking on the pin icon</span>.</li>
                            <li><span className="bold-text"><RecordVoiceOverIcon className="instruction_icon" /> Share Your Voice:</span> Contribute your own reviews to the map by <span className="uppercase-text">double-clicking</span> on the places you're passionate about, and let your opinions be heard!</li>
                            <li><span className="bold-text"><EditCalendarIcon className="instruction_icon" /> Edit or Delete Reviews:</span> You have the option to modify or remove your reviews from the map by <span className="uppercase-text">editing</span> or <span className="uppercase-text">deleting </span>the pins.</li>
                        </Typography>
                        <Typography className="bottom-text" component="p">
                            Have a good day!
                        </Typography>
                        <Typography className="bottom-text signature" component="p">
                            Vy Huynh
                        </Typography>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
};

export default HowToUse;