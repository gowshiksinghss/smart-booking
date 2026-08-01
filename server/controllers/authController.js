const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber,
      year: user.year,
      semester: user.semester,
    },
    process.env.JWT_SECRET || 'bitsathy_smart_classroom_jwt_secret_2026_super_secure',
    { expiresIn: '30d' }
  );
};

// Google Callback Success handler
const googleCallback = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  const token = generateToken(req.user);
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login-success?token=${token}`);
};

// Dev/Test login to bypass OAuth during local testing/dev
const devLogin = async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.endsWith('@bitsathy.ac.in')) {
    return res.status(403).json({ message: 'Only @bitsathy.ac.in emails are allowed' });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      let role = 'student';
      let name = email.split('@')[0];
      if (email.includes('faculty') || email.includes('.fac') || email.startsWith('fac.')) {
        role = 'faculty';
      } else if (email.includes('staff') || email.includes('.stf') || email.startsWith('staff.')) {
        role = 'staff';
      } else if (email.startsWith('admin.')) {
        role = 'admin';
      }

      user = await User.create({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        role,
        department: 'Computer Science and Engineering',
        rollNumber: role === 'student' ? '21CS001' : null,
        facultyId: role === 'faculty' ? 'FAC-CS-042' : null,
        staffId: role === 'staff' ? 'STF-CS-012' : null,
        year: role === 'student' ? '3rd Year' : null,
        semester: role === 'student' ? 'Semester 6' : null,
        isAuthorized: true
      });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        year: user.year,
        semester: user.semester,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  googleCallback,
  devLogin
};
