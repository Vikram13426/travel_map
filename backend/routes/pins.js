import express from 'express';
import { createPins, getPins, deletePin, editPin } from '../controllers/pins.js';

const router = express.Router();

router.post("/", createPins);
router.get("/", getPins);
router.patch("/:id", editPin);
router.delete("/:id", deletePin);

export default router;