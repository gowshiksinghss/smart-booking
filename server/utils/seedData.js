// server/utils/seedData.js
// Simple seeder that runs on server startup. It checks whether the
// `users` and `rooms` collections are empty and, if so, inserts a set of
// baseline documents (admin, sample faculty, staff, student and a few rooms).

const User = require('../models/User');
const Room = require('../models/Room');

const seedData = async () => {
  try {
    // ------- Users -------
    const userCount = await User.estimatedDocumentCount();
    if (userCount === 0) {
      console.log('Seeding initial users...');
      await User.insertMany([
        {
          name: 'Admin User',
          email: 'admin@bitsathy.ac.in',
          role: 'admin',
          department: 'Administration',
          password: 'admin123', // real app would hash – kept simple for seed
          isAuthorized: true
        },
        {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@bitsathy.ac.in',
          role: 'faculty',
          department: 'Computer Science and Engineering',
          facultyId: 'FAC-CS-001',
          isAuthorized: true
        },
        {
          name: 'Subramanian M',
          email: 'subramanian.m@bitsathy.ac.in',
          role: 'staff',
          department: 'Mechanical Engineering',
          staffId: 'STF-ME-001',
          isAuthorized: true
        },
        {
          name: 'Student One',
          email: 'student1@bitsathy.ac.in',
          role: 'student',
          department: 'Computer Science and Engineering',
          rollNumber: '21CS001',
          year: '3rd Year',
          semester: 'Semester 6',
          isAuthorized: true
        }
      ]);
      console.log('✅ Users seeded');
    } else {
      console.log('Users collection already has data – skipping seeding');
    }

    // ------- Rooms -------
    const roomCount = await Room.estimatedDocumentCount();
    if (roomCount === 0) {
      console.log('Seeding initial rooms...');
      await Room.insertMany([
        {
          name: 'Lecture Hall 101',
          roomId: 'LH-101',
          block: 'SF Block',
          capacity: 120,
          roomType: 'classroom',
          amenities: ['Projector', 'AC', 'Whiteboard']
        },
        {
          name: 'Lab 402',
          roomId: 'LAB-402',
          block: 'IB Block',
          capacity: 30,
          roomType: 'lab',
          amenities: ['Computers', 'AV', 'Airflow']
        },
        {
          name: 'Seminar Hall 201',
          roomId: 'SH-201',
          block: 'Mechanical Block',
          capacity: 60,
          roomType: 'seminar_hall',
          amenities: ['Projector', 'Microphone']
        }
      ]);
      console.log('✅ Rooms seeded');
    } else {
      console.log('Rooms collection already has data – skipping seeding');
    }
  } catch (err) {
    console.error('⚠️ Seed data error:', err);
  }
};

module.exports = seedData;
