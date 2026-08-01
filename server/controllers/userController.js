const User = require('../models/User');

// Get all users, optionally matching regex query, structured by department hierarchy
const getUsers = async (req, res) => {
  const { search } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
      { facultyId: { $regex: search, $options: 'i' } },
      { staffId: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const users = await User.find(query);
    
    // Group and structure as a nested tree payload by department
    const tree = {};
    
    users.forEach(user => {
      const dept = user.department || 'Unassigned';
      if (!tree[dept]) {
        tree[dept] = {
          students: [],
          faculty: [],
          staff: [],
          admin: []
        };
      }
      
      if (user.role === 'student') {
        tree[dept].students.push(user);
      } else if (user.role === 'faculty') {
        tree[dept].faculty.push(user);
      } else if (user.role === 'staff') {
        tree[dept].staff.push(user);
      } else if (user.role === 'admin') {
        tree[dept].admin.push(user);
      }
    });

    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};

