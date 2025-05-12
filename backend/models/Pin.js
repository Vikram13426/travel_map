import mongoose from 'mongoose';

const PinSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        min: 3
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    lat: {
        type: Number,
        required: true,
    },
    long: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    
}, { timestamps: true });

const Pin = mongoose.model('Pin', PinSchema);

export default Pin;