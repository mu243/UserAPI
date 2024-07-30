require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  mobileNo: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10 digit number!`
    },
    required: [true, 'User mobile number required']
  },
  email: {
    type: String,
    validate: {
      validator: function(v) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: props => `"${props.value}" is not a valid email!`
    },
    required: [true, 'User email required']
  },
  address: String,
  street: String,
  city: String,
  state: String,
  country: String,
  loginId: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/.test(v);
      },
      message: props => `"${props.value}" is not a valid login ID! Use 8 alpha numeric characters, including at least one letter and one number. `
    },
    required: [true, 'Login ID required']
  },
  password: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(v);
      },
      message: props => `"${props.value}" is not a valid password! 
      Your Password must have 6 characters which includes 1 upper case letter, 1 lower case letter, 1 special character.`
    },
    required: [true, 'Password required']
  },
  creationTime: { type: Date, default: Date.now },
  lastUpdatedOn: { type: Date, default: Date.now }
});

// Create User Model
const User = mongoose.model('User', userSchema);

// API to Create User
app.post('/api/users', (req, res) => {
  console.log('Request received to create user:', req.body);
  const newUser = new User(req.body);
  newUser.save()
    .then(user => {
      console.log('User saved successfully:', user);
      res.status(201).json({ success: true, message: 'User saved successfully' });
    })
    .catch(err => {
      console.log('Error saving user:', err);
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      res.status(400).json({ success: false, errors });
    });
});

// API to Get All Users
app.get('/api/users', (req, res) => {
  console.log('Request received to get all users');
  User.find()
    .then(users => {
      console.log('Users retrieved successfully:', users);
      res.status(200).json(users);
    })
    .catch(err => {
      console.log('Error retrieving users:', err);
      res.status(400).json({ success: false, message: 'Error retrieving users' });
    });
});

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve display.html on /display
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
