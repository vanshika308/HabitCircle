import Group from '../models/Group.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({})
      .populate('creator', 'name email')
      .select('name description members maxMembers creator');
    
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res) => {
  try {
    const { name, description, maxMembers } = req.body;

    if (!name) {
      res.status(400);
      return res.json({ message: 'Group name is required' });
    }

    const groupExists = await Group.findOne({ name });
    if (groupExists) {
      res.status(400);
      return res.json({ message: 'A group with this name already exists' });
    }

    const group = await Group.create({
      name,
      description,
      maxMembers: maxMembers || 10,
      creator: req.user._id,
      members: [req.user._id], // Creator automatically joins
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group details, competitive standing, and activity feed
// @route   GET /api/groups/:id
// @access  Private
export const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members', 'name email avatarUrl streaks riskScore');

    if (!group) {
      res.status(404);
      return res.json({ message: 'Group not found' });
    }

    // Verify requesting user is a member of the group
    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      res.status(403);
      return res.json({ message: 'Access denied. You are not a member of this circle.' });
    }

    // 1. Sort Standings: Order members by current streak (descending)
    const standings = [...group.members].sort(
      (a, b) => (b.streaks?.currentStreak || 0) - (a.streaks?.currentStreak || 0)
    );

    // 2. Compile Feed: Retrieve activities in this group, sorted by date (descending)
    const activities = await Activity.find({ group: group._id })
      .populate('sender', 'name avatarUrl')
      .populate('recipient', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50); // Cap feed at last 50 activities for performance

    res.json({
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        maxMembers: group.maxMembers,
        creator: group.creator,
        membersCount: group.members.length,
      },
      standings,
      feed: activities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a group
// @route   POST /api/groups/:id/join
// @access  Private
export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404);
      return res.json({ message: 'Group not found' });
    }

    // Verify membership limits
    if (group.members.length >= group.maxMembers) {
      res.status(400);
      return res.json({ message: 'Circle group is full' });
    }

    // Check if user is already a member
    const alreadyMember = group.members.includes(req.user._id);
    if (alreadyMember) {
      res.status(400);
      return res.json({ message: 'You are already a member of this circle' });
    }

    group.members.push(req.user._id);
    await group.save();

    res.json({ message: 'Successfully joined circle', group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404);
      return res.json({ message: 'Group not found' });
    }

    // Check if creator is leaving (we don't block, but log it)
    const isCreator = group.creator.toString() === req.user._id.toString();

    // Verify membership
    const memberIndex = group.members.indexOf(req.user._id);
    if (memberIndex === -1) {
      res.status(400);
      return res.json({ message: 'You are not a member of this circle' });
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    // Clean up activities posted by this user if needed (optional)
    res.json({ message: 'Successfully left circle' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send Nudge (Encouragement interaction)
// @route   POST /api/groups/:id/interactions/nudge
// @access  Private
export const sendNudge = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const groupId = req.params.id;

    if (!recipientId) {
      res.status(400);
      return res.json({ message: 'Recipient is required for nudges' });
    }

    // Create activity record
    const activity = await Activity.create({
      group: groupId,
      sender: req.user._id,
      recipient: recipientId,
      type: 'nudge',
    });

    const populatedActivity = await Activity.findById(activity._id)
      .populate('sender', 'name avatarUrl')
      .populate('recipient', 'name avatarUrl');

    res.status(201).json(populatedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send High-Five
// @route   POST /api/groups/:id/interactions/highfive
// @access  Private
export const sendHighFive = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const groupId = req.params.id;

    if (!recipientId) {
      res.status(400);
      return res.json({ message: 'Recipient is required for high-fives' });
    }

    const activity = await Activity.create({
      group: groupId,
      sender: req.user._id,
      recipient: recipientId,
      type: 'high_five',
    });

    const populatedActivity = await Activity.findById(activity._id)
      .populate('sender', 'name avatarUrl')
      .populate('recipient', 'name avatarUrl');

    res.status(201).json(populatedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
