
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config();


mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('\n\t Connected to MongoDB 🔥\n');
}).catch(err => {
    console.error('\n\t Error connecting to MongoDB', err);
});


const db = mongoose.connection;


const userSchema = new mongoose.Schema({
    name: String,
    domain: String,
    gender: String,
    availability: Boolean
});

const User = mongoose.model('User', userSchema);

app.use(express.json());

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.get('/api/users', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const users = await User.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.get('/api/users/:id', getUser, (req, res) => {
    res.json(res.user);
});


app.put('/api/users/:id', getUser, async (req, res) => {
    if (req.body.name != null) {
        res.user.name = req.body.name;
    }
    if (req.body.domain != null) {
        res.user.domain = req.body.domain;
    }
    if (req.body.gender != null) {
        res.user.gender = req.body.gender;
    }
    if (req.body.availability != null) {
        res.user.availability = req.body.availability;
    }
    try {
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.delete('/api/users/:id', getUser, async (req, res) => {
    try {
        await res.user.remove();
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


async function getUser(req, res, next) {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.user = user;
    next();
}

app.get('/api/filter/users', async (req, res) => {
    const { domain, gender, availability } = req.query;
    const query = {};

    if (domain) query.domain = domain;
    if (gender) query.gender = gender;
    if (availability) query.availability = availability;

    try {
        const filteredUsers = await User.find(query);
        res.json(filteredUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/search/users', async (req, res) => {
    const { name } = req.query;

    try {
        const regex = new RegExp(name, 'i');
        const searchedUsers = await User.find({ name: regex });
        res.json(searchedUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new team
app.post('/api/team', async (req, res) => {
    const { userIds } = req.body;
    
    // Assuming each user can be part of only one team
    const uniqueDomains = new Set();
    const uniqueAvailabilities = new Set();
    userIds.forEach(async userId => {
        try {
            const user = await User.findById(userId);
            if (user) {
                uniqueDomains.add(user.domain);
                uniqueAvailabilities.add(user.availability);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    // Create team with unique domains and availabilities
    const team = {
        domains: Array.from(uniqueDomains),
        availabilities: Array.from(uniqueAvailabilities),
        members: userIds
    };

    res.status(201).json(team);
});

// Retrieve details of a specific team by ID
app.get('/api/team/:id', async (req, res) => {
    const teamId = req.params.id;
    // Logic to retrieve team details from the database
    // Assuming team details are stored in another collection or document
    res.json({ message: `Team details for ID ${teamId}` });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n\t Server running on port ${PORT}`);
});
