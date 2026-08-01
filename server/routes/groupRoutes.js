const express = require('express');
const { getGroups, createGroup, deleteGroup } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, authorize(['faculty', 'staff', 'admin']), getGroups)
  .post(protect, authorize(['faculty', 'staff', 'admin']), createGroup);

router.route('/:id')
  .delete(protect, authorize(['faculty', 'staff', 'admin']), deleteGroup);

module.exports = router;
