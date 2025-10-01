require('dotenv').config();
const { MongoClient } = require('mongodb');

const migrateData = async () => {
  const oldDbUri = 'mongodb://localhost:27017/syriana_student_app';
  const newDbUri = process.env.MONGODB_URI;

  console.log('New DB URI:', newDbUri);

  let oldClient, newClient;

  try {
    console.log('Starting data migration...');

    // Connect to old database
    oldClient = new MongoClient(oldDbUri);
    await oldClient.connect();
    const oldDb = oldClient.db();
    console.log('Connected to old database');

    // Connect to new database
    newClient = new MongoClient(newDbUri);
    await newClient.connect();
    const newDb = newClient.db();
    console.log('Connected to new database');

    // Drop existing collections in new DB
    console.log('Dropping existing collections in new database...');
    const collections = ['users', 'courses', 'grades', 'students'];
    for (const col of collections) {
      try {
        await newDb.dropCollection(col);
        console.log(`Dropped collection: ${col}`);
      } catch (err) {
        console.log(`Collection ${col} not found or already dropped`);
      }
    }

    // Migrate users
    console.log('Migrating users...');
    const users = await oldDb.collection('users').find({}).toArray();
    if (users.length > 0) {
      await newDb.collection('users').insertMany(users);
      console.log(`Migrated ${users.length} users`);
    } else {
      console.log('No users to migrate');
    }

    // Migrate courses
    console.log('Migrating courses...');
    const courses = await oldDb.collection('courses').find({}).toArray();
    if (courses.length > 0) {
      await newDb.collection('courses').insertMany(courses);
      console.log(`Migrated ${courses.length} courses`);
    } else {
      console.log('No courses to migrate');
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    if (oldClient) await oldClient.close();
    if (newClient) await newClient.close();
  }
};

migrateData();

