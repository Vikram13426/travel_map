import Pin from '../models/Pin.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

// Allowed tags for validation
const ALLOWED_TAGS = [
    'Beach', 'Mountain', 'City', 'Adventure', 'Food', 'Historical', 'Nature', 'Culture',
    'Park', 'Museum', 'Temple', 'Church', 'Wildlife', 'Lake', 'Desert', 'Cave', 'Island',
    'Festival', 'Market', 'Hiking', 'Camping', 'Monument', 'Waterfall', 'Forest', 'Art',
    'Nightlife', 'Village', 'Harbor', 'Bridge', 'Garden', 'Palace', 'Fort', 'River'
];

// Creating new pin and save to DB
export const createPins = async (req, res) => {
    const { userName, title, rating, lat, long, description, tags } = req.body;

    // Validate required fields
    if (!userName || !title || !rating || !lat || !long || !description) {
        return res.status(400).json({ message: 'All fields (userName, title, rating, lat, long, description) are required' });
    }

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
        const newPin = new Pin({
            userName,
            title,
            rating,
            lat,
            long,
            description,
            tags: tags || [],
        });

        await newPin.save();
        return res.status(200).json(newPin);
    } catch (err) {
        return res.status(500).json({ message: `Failed to create pin: ${err.message}` });
    }
};

// Get all the pins
export const getPins = async (req, res) => {
    try {
        const pins = await Pin.find();
        return res.status(200).json(pins);
    } catch (err) {
        return res.status(500).json({ message: `Failed to fetch pins: ${err.message}` });
    }
};

// Edit a pin
export const editPin = [verifyToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, rating, tags } = req.body;

    // Validate required fields
    if (!title || !description || !rating) {
        return res.status(400).json({ message: 'Title, description, and rating are required' });
    }

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    // Validate title length
    if (title.length < 3) {
        return res.status(400).json({ message: 'Title must be at least 3 characters long' });
    }

    // Validate tags if provided
    let parsedTags = [];
    if (tags) {
        if (!Array.isArray(tags)) {
            return res.status(400).json({ message: 'Tags must be an array' });
        }
        if (!tags.every(tag => ALLOWED_TAGS.includes(tag))) {
            return res.status(400).json({ message: `Tags must be one of: ${ALLOWED_TAGS.join(', ')}` });
        }
        parsedTags = tags;
    }

    try {
        const pin = await Pin.findById(id);
        if (!pin) {
            return res.status(404).json({ message: 'No pin was found' });
        }

        if (pin.userName !== req.user.userName) {
            return res.status(403).json({ message: 'You can only edit your own pins' });
        }

        const updatedPin = await Pin.findByIdAndUpdate(
            id,
            { title, description, rating, tags: parsedTags },
            { new: true, runValidators: true }
        );

        if (!updatedPin) {
            return res.status(500).json({ message: 'Failed to update pin: Update operation returned null' });
        }

        return res.status(200).json({
            message: 'Pin updated successfully',
            newPin: updatedPin,
        });
    } catch (err) {
        return res.status(500).json({ message: `Failed to update pin: ${err.message}` });
    }
}];

// Delete a pin
export const deletePin = [verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const pin = await Pin.findById(id);
        if (!pin) {
            return res.status(404).json({ message: 'No pin was found' });
        }

        if (pin.userName !== req.user.userName) {
            return res.status(403).json({ message: 'You can only delete your own pins' });
        }

        await Pin.findOneAndDelete({ _id: id });
        return res.status(200).json({ message: 'Pin deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: `Failed to delete pin: ${err.message}` });
    }
}];