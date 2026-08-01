const express = require('express');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, authorize(['admin', 'staff']), getUsers)
  .post(protect, authorize(['admin']), createUser);

router.route('/:id')
  .patch(protect, authorize(['admin']), updateUser)
  .delete(protect, authorize(['admin']), deleteUser);

module.exports = router;

