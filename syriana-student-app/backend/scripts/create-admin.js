const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/syriana_student_app');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@syriana.edu',
      password: 'admin123',
      role: 'admin'
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    const admin = await User.create({
      ...adminData,
      password: hashedPassword
    });

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', adminData.password);
    console.log('Role:', admin.role);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdmin();

