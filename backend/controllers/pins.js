import Pin from '../models/Pin.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

// Allowed tags for validation
const ALLOWED_TAGS = ['Beach', 'Mountain', 'City', 'Adventure', 'Food', 'Historical', 'Nature', 'Culture'];

// Creating new pin and save to DB
export const createPins = async (req, res) => {
    const { tags } = req.body;

    // Validate tags if provided
    if (tags) {
        if (!Array.isArray(tags)) {
            return res.status(400).json({ message: 'Tags must be an array' });
        }
        if (!tags.every(tag => ALLOWED_TAGS.includes(tag))) {
            return res.status(400).json({ message: `Tags must be one of: ${ALLOWED_TAGS.join(', ')}` });
        }
    }

    const newPin = new Pin(req.body);

    try {
        await newPin.save();
        return res.status(200).json(newPin);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get all the pins
export const getPins = async (req, res) => {
    try {
        const pins = await Pin.find();
        return res.status(200).json(pins);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Edit a pin
export const editPin = [verifyToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, rating, tags } = req.body;

    // Validate tags if provided
    if (tags) {
        if (!Array.isArray(tags)) {
            return res.status(400).json({ message: 'Tags must be an array' });
        }
        if (!tags.every(tag => ALLOWED_TAGS.includes(tag))) {
            return res.status(400).json({ message: `Tags must be one of: ${ALLOWED_TAGS.join(', ')}` });
        }
    }

    try {
        const pin = await Pin.findById(id);
        if (!pin) {
            return res.status(400).json({ message: 'No pin was found' });
        }

        if (pin.userName !== req.user.userName) {
            return res.status(403).json({ message: 'You can only edit your own pins' });
        }

        await Pin.findByIdAndUpdate(id, { title, description, rating, tags });
        const updatedPin = await Pin.findById(id);
        return res.status(200).json({
            message: 'Pin updated successfully',
            newPin: updatedPin,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}];

// Delete a pin
export const deletePin = [verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const pin = await Pin.findById(id);
        if (!pin) {
            return res.status(400).json({ message: 'No pin was found' });
        }

        if (pin.userName !== req.user.userName) {
            return res.status(403).json({ message: 'You can only delete your own pins' });
        }

        await Pin.findOneAndRemove({ _id: id });
        return res.status(200).json({ message: 'Pin deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}];