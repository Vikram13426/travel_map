import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerValidation, loginValidation } from '../middlewares/validationMiddleware.js';

// Register
export const register = async (req, res) => {
    const { error } = await registerValidation(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const userExist = await User.findOne({ userName: req.body.userName });
    if (userExist) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            userName: req.body.userName,
            email: req.body.email,
            password: hashedPassword,
        });

        await newUser.save();
        return res.status(200).json({ message: 'Profile created successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Login
export const login = async (req, res) => {
    const { error } = await loginValidation(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: 'Wrong email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Wrong email or password' });
        }

        const token = jwt.sign(
            { id: user._id, userName: user.userName },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login successfully',
            user: user.userName,
            _id: user._id,
            token,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};