const CustomGroup = require('../models/CustomGroup');

const getGroups = async (req, res) => {
  try {
    const groups = await CustomGroup.find({ createdBy: req.user._id });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGroup = async (req, res) => {
  const { groupName, rollNumbers } = req.body;

  try {
    const group = await CustomGroup.create({
      groupName,
      rollNumbers,
      createdBy: req.user._id
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await CustomGroup.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!group) {
      return res.status(404).json({ message: 'Group not found or unauthorized' });
    }
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGroups,
  createGroup,
  deleteGroup
};
