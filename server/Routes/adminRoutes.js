const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../Models/User');
const Group = require('../Models/Group');
const Expense = require('../Models/Expense');
const Settlement = require('../Models/Settlement');
const Notification = require('../Models/Notification');
const Feedback = require('../Models/Feedback');
const ActivityLog = require('../Models/ActivityLog');
const AdminSetting = require('../Models/AdminSetting');
const bcrypt = require('bcryptjs');
const { verifyAdmin } = require('../middleware/auth');

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseSearchDate = (value) => {
  const trimmed = String(value || '').trim();
  const dmy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    if (year >= 1900 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day);
    }
  }

  const ymd = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) {
    const year = parseInt(ymd[1], 10);
    const month = parseInt(ymd[2], 10) - 1;
    const day = parseInt(ymd[3], 10);
    if (year >= 1900 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day);
    }
  }

  return null;
};

const getExpenseShares = (expense, members = []) => {
  const amount = parseFloat(expense.amount) || 0;
  let splitDetails = {};

  if (expense.splits) {
    if (expense.splits instanceof Map) {
      splitDetails = Object.fromEntries(expense.splits);
    } else if (typeof expense.splits === 'object') {
      splitDetails = { ...expense.splits };
    }
  }

  if (Object.keys(splitDetails).length > 0) {
    return Object.fromEntries(
      Object.entries(splitDetails).map(([person, value]) => [person, parseFloat(value) || 0])
    );
  }

  const splitAmong = Array.isArray(expense.splitAmong)
    ? expense.splitAmong
    : expense.splitAmong
    ? String(expense.splitAmong).split(',')
    : [];

  if (splitAmong.length > 0) {
    const perPerson = parseFloat((amount / splitAmong.length).toFixed(2));
    return splitAmong.reduce((acc, person) => ({ ...acc, [person]: perPerson }), {});
  }

  if (members.length > 0) {
    const perPerson = parseFloat((amount / members.length).toFixed(2));
    return members.reduce((acc, person) => ({ ...acc, [person]: perPerson }), {});
  }

  return { [expense.paidBy || 'Unknown']: amount };
};

router.use(verifyAdmin);

router.get('/summary', async (req, res) => {
  try {
    console.log('ENDPOINT: /summary - START');
    const responseData = {
      totalUsers: 0,
      totalGroups: 0,
      totalExpenses: 0,
      totalSettlements: 0,
      activeUsers: 0,
      highestSpender: 'N/A',
      mostActiveGroup: 'N/A',
      monthlyExpenses: [],
      expenseDistribution: [],
      activeGroups: [],
      recentGroups: [],
      recentActivities: []
    };
    console.log('ENDPOINT: /summary - About to call res.json()');
    res.json(responseData);
    console.log('ENDPOINT: /summary - res.json() called successfully');
  } catch (error) {
    console.error('ENDPOINT: /summary - ERROR in try block:', error.message);
    console.error('ENDPOINT: /summary - ERROR stack:', error.stack);
    res.status(500).json({ success: false, message: 'Unable to fetch summary', error: error.message });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalGroups = await Group.countDocuments();

    const expenseStats = await Expense.aggregate([
      { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expenseStats[0]?.count || 0;
    const totalExpenseAmount = expenseStats[0]?.totalAmount || 0;

    const settlementStats = await Settlement.aggregate([
      { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);
    const totalSettlements = settlementStats[0]?.count || 0;
    const totalSettlementAmount = settlementStats[0]?.totalAmount || 0;

    const pendingSettlements = await Settlement.countDocuments({ status: 'Pending' });

    const monthlyExpensesAggregation = await Expense.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const monthlyExpenses = monthlyExpensesAggregation.map((item) => ({
      name: monthNames[item._id.month - 1],
      amount: item.totalAmount
    }));

    const groupExpenseAggregation = await Expense.aggregate([
      { $group: { _id: '$groupId', totalAmount: { $sum: '$amount' }, expenseCount: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } },
      { $limit: 8 }
    ]);

    const groupIds = groupExpenseAggregation
      .filter((item) => item._id)
      .map((item) => item._id);
    const groupsWithExpenses = await Group.find({ _id: { $in: groupIds } });
    const groupLookup = new Map((groupsWithExpenses || [])
      .filter((groupItem) => groupItem && groupItem._id)
      .map((groupItem) => [groupItem._id.toString(), groupItem.groupName]));

    const groupWiseExpenses = groupExpenseAggregation.map((item) => ({
      groupId: item._id,
      groupName: item._id ? groupLookup.get(item._id.toString()) || 'Unknown Group' : 'Unknown Group',
      totalAmount: item.totalAmount,
      expenseCount: item.expenseCount
    }));

    const categoryDistributionAggregation = await Expense.aggregate([
      { $group: { _id: { $ifNull: ['$category', 'Uncategorized'] }, totalAmount: { $sum: '$amount' } } },
      { $sort: { totalAmount: -1 } }
    ]);
    const categoryDistribution = categoryDistributionAggregation.map((item) => ({
      name: item._id,
      value: item.totalAmount
    }));

    const recentActivities = await ActivityLog.find().sort({ createdAt: -1 }).limit(6);

    res.json({
      totalUsers,
      totalGroups,
      totalExpenses,
      totalExpenseAmount,
      totalSettlements,
      totalSettlementAmount,
      pendingSettlements,
      monthlyExpenses,
      groupWiseExpenses,
      categoryDistribution,
      recentActivities: (recentActivities || []).map((activity) => ({
        id: activity && activity._id ? activity._id.toString() : 'unknown',
        title: (activity && activity.action) || '',
        description: (activity && activity.detail) || '',
        time: (activity && activity.createdAt) || null
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to fetch reports.' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { role: regex },
        { status: regex }
      ];
    }

    const currentPage = parseInt(page, 10) || 1;
    const perPage = parseInt(limit, 10) || 10;

    const totalCount = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    const items = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'Active',
      createdAt: user.createdAt
    }));

    res.json({
      items,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage),
      currentPage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to fetch users.' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const { name, email, role, status } = req.body;
    if (!name || !email || !role || !status) {
      return res.status(400).json({ success: false, message: 'Name, email, role, and status are required.' });
    }

    const existingEmailUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingEmailUser) {
      return res.status(409).json({ success: false, message: 'Email already in use by another user.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        role,
        status,
        isAdmin: role === 'admin'
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await ActivityLog.create({
      action: 'User updated',
      detail: `${updatedUser.name} was updated by admin ${req.user.email || 'admin'}`,
      entity: 'user',
      actor: req.user.email || 'admin'
    });

    res.json({ success: true, user: {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status || 'Active',
      createdAt: updatedUser.createdAt
    } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to update user.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await ActivityLog.create({
      action: 'User deleted',
      detail: `${deletedUser.name} was deleted by admin ${req.user.email || 'admin'}`,
      entity: 'user',
      actor: req.user.email || 'admin'
    });

    res.json({ success: true, message: 'User removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to delete user.' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    let settings = await AdminSetting.findOne({ key: 'admin' });
    if (!settings) {
      settings = await AdminSetting.create({ key: 'admin' });
    }

    res.json({
      theme: settings.theme,
      security: {
        requireBackupConfirmation: settings.security?.requireBackupConfirmation || false,
        securityPasscodeSet: Boolean(settings.security?.securityCodeHash)
      }
    });
  } catch (error) {
    console.error('Unable to load admin settings:', error);
    res.status(500).json({ success: false, message: 'Unable to load admin settings.' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const {
      theme,
      security = {},
      currentPasscode,
      newPasscode,
      confirmPasscode
    } = req.body;

    if (theme && !['Light', 'Dark'].includes(theme)) {
      return res.status(400).json({ success: false, message: 'Invalid theme selected.' });
    }

    let settings = await AdminSetting.findOne({ key: 'admin' });
    if (!settings) {
      settings = new AdminSetting({ key: 'admin' });
    }

    if (typeof theme === 'string') {
      settings.theme = theme;
    }

    if (typeof security.requireBackupConfirmation === 'boolean') {
      settings.security.requireBackupConfirmation = security.requireBackupConfirmation;
    }

    if (newPasscode) {
      if (newPasscode.length < 6) {
        return res.status(400).json({ success: false, message: 'New passcode must be at least 6 characters long.' });
      }
      if (newPasscode !== confirmPasscode) {
        return res.status(400).json({ success: false, message: 'Passcode confirmation does not match.' });
      }

      if (settings.security?.securityCodeHash) {
        if (!currentPasscode) {
          return res.status(400).json({ success: false, message: 'Current passcode is required to change the security passcode.' });
        }

        const isMatch = await bcrypt.compare(currentPasscode, settings.security.securityCodeHash);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Current passcode is incorrect.' });
        }
      }

      settings.security.securityCodeHash = await bcrypt.hash(newPasscode, 10);
      settings.security.updatedAt = new Date();
    }

    await settings.save();

    await ActivityLog.create({
      action: 'Admin settings updated',
      detail: `Admin settings were updated by ${req.user.email || 'admin'}`,
      entity: 'settings',
      actor: req.user.email || 'admin'
    });

    res.json({
      success: true,
      settings: {
        theme: settings.theme,
        security: {
          requireBackupConfirmation: settings.security.requireBackupConfirmation,
          securityPasscodeSet: Boolean(settings.security.securityCodeHash)
        }
      }
    });
  } catch (error) {
    console.error('Unable to save admin settings:', error);
    res.status(500).json({ success: false, message: 'Unable to save admin settings.' });
  }
});

router.get('/backup', async (req, res) => {
  try {
    const [users, groups, expenses, settlements, notifications, feedback, activityLogs, settings] = await Promise.all([
      User.find().lean(),
      Group.find().lean(),
      Expense.find().lean(),
      Settlement.find().lean(),
      Notification.find().lean(),
      Feedback.find().lean(),
      ActivityLog.find().lean(),
      AdminSetting.findOne({ key: 'admin' }).lean()
    ]);

    const safeUsers = (users || []).map((user) => {
      const safe = { ...user };
      delete safe.passwordHash;
      return safe;
    });

    const backupData = {
      users: safeUsers,
      groups: groups || [],
      expenses: expenses || [],
      settlements: settlements || [],
      notifications: notifications || [],
      feedback: feedback || [],
      activityLogs: activityLogs || [],
      settings: settings || {}
    };

    const fileName = `expense-splitter-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error('Unable to create backup:', error);
    res.status(500).json({ success: false, message: 'Unable to create database backup.' });
  }
});

// Notifications endpoints
router.get('/notifications', async (req, res) => {
  try {
    const items = await Notification.find().sort({ createdAt: -1 }).limit(200);
    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.json({ items, unreadCount });
  } catch (error) {
    console.error('Unable to fetch notifications:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch notifications.' });
  }
});

router.put('/notifications/read/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id.' });
    }
    const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Notification not found.' });
    await ActivityLog.create({ action: 'Notification read', detail: `Notification ${id} marked read`, entity: 'notification', actor: req.user.email || 'admin' });
    res.json({ success: true, notification: updated });
  } catch (error) {
    console.error('Unable to mark notification read:', error);
    res.status(500).json({ success: false, message: 'Unable to mark notification read.' });
  }
});

router.put('/notifications/read-all', async (req, res) => {
  try {
    const result = await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    await ActivityLog.create({ action: 'Notifications marked read', detail: `Marked all notifications read by ${req.user.email || 'admin'}`, entity: 'notification', actor: req.user.email || 'admin' });
    res.json({ success: true, modifiedCount: result.nModified || result.modifiedCount || 0 });
  } catch (error) {
    console.error('Unable to mark all notifications read:', error);
    res.status(500).json({ success: false, message: 'Unable to mark all notifications read.' });
  }
});

router.get('/groups', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const filter = {};
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { groupName: regex },
        { status: regex }
      ];
    }

    const total = await Group.countDocuments(filter);
    const totalPages = Math.ceil(total / parsedLimit);
    const groups = await Group.find(filter)
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      data: groups,
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to fetch groups.' });
  }
});

router.get('/groups/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    const expenseCount = await Expense.countDocuments({ groupId: group._id.toString() });
    const expenseTotalAgg = await Expense.aggregate([
      { $match: { groupId: group._id.toString() } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const expenseTotal = expenseTotalAgg.length ? expenseTotalAgg[0].total : 0;

    const settlementCount = await Settlement.countDocuments({ groupId: group._id.toString() });
    const settlementTotalAgg = await Settlement.aggregate([
      { $match: { groupId: group._id.toString() } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const settlementTotal = settlementTotalAgg.length ? settlementTotalAgg[0].total : 0;

    const recentExpenses = await Expense.find({ groupId: group._id.toString() })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('description amount paidBy category createdAt');

    res.json({
      group,
      expenseCount,
      expenseTotal,
      settlementCount,
      settlementTotal,
      recentExpenses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to fetch group details.' });
  }
});

router.delete('/groups/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    await Expense.deleteMany({ groupId: group._id.toString() });
    await Settlement.deleteMany({ groupId: group._id.toString() });
    await group.deleteOne();

    await ActivityLog.create({
      action: 'Group deleted',
      detail: `${group.groupName} was deleted by admin ${req.user.email || 'admin'}`,
      entity: 'group',
      actor: req.user.email || 'admin'
    });

    res.json({ success: true, message: 'Group and associated data deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to delete group.' });
  }
});

router.delete('/expenses/:id', async (req, res) => {
    try {
      const expense = await Expense.findById(req.params.id);
      if (!expense) {
        return res.status(404).json({ success: false, message: 'Expense not found.' });
      }

      const group = await Group.findById(expense.groupId);
      await expense.deleteOne();

      if (group) {
        const remainingTotalResult = await Expense.aggregate([
          { $match: { groupId: group._id.toString() } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        group.totalExpense = remainingTotalResult[0]?.total || 0;
        await group.save();

        await Settlement.deleteMany({ groupId: group._id.toString() });

        const groupExpenses = await Expense.find({ groupId: group._id.toString() });
        for (const nextExpense of groupExpenses) {
          const shares = getExpenseShares(nextExpense, group.members || []);
          for (const [person, amount] of Object.entries(shares)) {
            const owe = parseFloat(amount) || 0;
            if (person !== nextExpense.paidBy && owe > 0) {
              const settlement = new Settlement({
                groupId: group._id.toString(),
                debtor: person,
                creditor: nextExpense.paidBy,
                amount: owe,
                totalAmount: owe,
                paidAmount: 0,
                remainingAmount: owe,
                status: 'Pending',
                paymentHistory: [],
                note: nextExpense.note || ''
              });
              await settlement.save();
            }
          }
        }
      }

      await ActivityLog.create({
        action: 'Expense deleted',
        detail: `${expense.description} of ₹${expense.amount} deleted${group ? ` from ${group.groupName}` : ''}.`, 
        entity: 'expense',
        actor: req.user.email || 'admin'
      });

      res.json({ success: true, message: 'Expense deleted successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Unable to delete expense.' });
    }
  });

  router.get('/expenses', async (req, res) => {
    try {
      const { search = '', page = 1, limit = 10 } = req.query;
      const filter = {};
      const groups = await Group.find();
      const groupMap = new Map(groups.map((groupItem) => [groupItem._id.toString(), groupItem.groupName]));

      const normalizedSearch = String(search || '').trim();
      if (normalizedSearch) {
        const regex = new RegExp(escapeRegex(normalizedSearch), 'i');
        const or = [
          { description: regex },
          { paidBy: regex },
          { category: regex },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$amount' },
                regex
              }
            }
          },
          {
            $expr: {
              $regexMatch: {
                input: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                regex
              }
            }
          }
        ];

        const matchingGroupIds = groups
          .filter((groupItem) => regex.test(groupItem.groupName))
          .map((groupItem) => groupItem._id.toString());

        if (matchingGroupIds.length) {
          or.push({ groupId: { $in: matchingGroupIds } });
        }

        const numericValue = Number(normalizedSearch.replace(/,/g, ''));
        if (!Number.isNaN(numericValue)) {
          or.push({ amount: numericValue });
        }

        const parsedDate = parseSearchDate(normalizedSearch);
        if (parsedDate) {
          const endOfDay = new Date(parsedDate);
          endOfDay.setHours(23, 59, 59, 999);
          or.push({ createdAt: { $gte: parsedDate, $lte: endOfDay } });
        }

        filter.$or = or;
      }

      const currentPage = Math.max(parseInt(page, 10) || 1, 1);
      const perPage = Math.max(parseInt(limit, 10) || 10, 1);

    const totalCount = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    const transformed = expenses.map((expense) => ({
      id: expense._id.toString(),
      description: expense.description,
      title: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      group: groupMap.get(expense.groupId) || expense.groupId,
      date: expense.createdAt,
      category: expense.category || 'Other',
      status: 'Recorded'
    }));

    res.json({
      items: transformed,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage),
      currentPage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to fetch expenses.' });
  }
});

router.get('/settlements', async (req, res) => {
  try {
    const {
      search = '',
      group = '',
      status = '',
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    const groups = await Group.find();
    const groupMap = new Map(groups.map((groupItem) => [groupItem._id.toString(), groupItem.groupName]));

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { debtor: regex },
        { creditor: regex }
      ];
    }

    if (group) {
      const matchingGroups = groups
        .filter((groupItem) => groupItem.groupName.toLowerCase().includes(group.toLowerCase()))
        .map((groupItem) => groupItem._id.toString());
      filter.groupId = matchingGroups.length ? { $in: matchingGroups } : { $in: [] };
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const currentPage = parseInt(page, 10) || 1;
    const perPage = parseInt(limit, 10) || 10;

    const totalCount = await Settlement.countDocuments(filter);
    const settlements = await Settlement.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    const mapped = settlements.map((settlement) => ({
      id: settlement._id.toString(),
      debtor: settlement.debtor,
      creditor: settlement.creditor,
      amount: settlement.amount,
      status: settlement.status || (settlement.settled ? 'Settled' : 'Pending'),
      paymentStatus: settlement.paymentStatus,
      group: groupMap.get(settlement.groupId) || settlement.groupId,
      date: settlement.createdAt
    }));

    res.json({
      items: mapped,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage),
      currentPage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to fetch settlements.' });
  }
});

const ALLOWED_NOTIFICATION_STATUSES = ['Pending', 'Sent', 'Failed'];

const processPendingReminders = async () => {
  try {
    const now = new Date();
    const dueReminders = await Notification.find({
      type: 'reminder',
      status: 'Pending',
      scheduledTime: { $lte: now }
    });

    if (!dueReminders.length) {
      return;
    }

    const bulkUpdates = dueReminders.map((reminder) => ({
      updateOne: {
        filter: { _id: reminder._id },
        update: { status: 'Sent', sentTime: now }
      }
    }));

    await Notification.bulkWrite(bulkUpdates);
    console.log(`Processed ${dueReminders.length} due reminder(s).`);
  } catch (error) {
    console.error('Reminder processor failed:', error);
  }
};

const startReminderProcessor = () => {
  processPendingReminders();
  setInterval(processPendingReminders, 30000);
};

router.get('/notifications', async (req, res) => {
  try {
    await processPendingReminders();
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch notifications.' });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type, scheduledTime } = req.body;
    const trimmedMessage = String(message || '').trim();

    if (!trimmedMessage) {
      return res.status(400).json({ success: false, message: 'Notification message is required.' });
    }

    const notificationType = type === 'reminder' ? 'reminder' : 'announcement';
    const notificationData = {
      title: String(title || (notificationType === 'reminder' ? 'Reminder' : 'Announcement')).trim(),
      message: trimmedMessage,
      type: notificationType,
      createdBy: req.user?.email || 'Admin'
    };

    if (notificationType === 'reminder') {
      if (!scheduledTime) {
        return res.status(400).json({ success: false, message: 'Reminder date and time are required.' });
      }

      const scheduleDate = new Date(scheduledTime);
      if (Number.isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
        return res.status(400).json({ success: false, message: 'Please select a future reminder date and time.' });
      }

      notificationData.status = 'Pending';
      notificationData.scheduledTime = scheduleDate;
    } else {
      notificationData.status = 'Sent';
      notificationData.sentTime = new Date();
    }

    const notification = new Notification(notificationData);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Unable to create notification:', error);
    res.status(500).json({ success: false, message: 'Unable to create notification.' });
  }
});

router.patch('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_NOTIFICATION_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid notification status.' });
    }

    const updateData = { status };
    if (status === 'Sent') {
      updateData.sentTime = new Date();
    }

    const notification = await Notification.findByIdAndUpdate(id, updateData, { new: true });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Unable to update notification status:', error);
    res.status(500).json({ success: false, message: 'Unable to update notification.' });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Unable to delete notification:', error);
    res.status(500).json({ success: false, message: 'Unable to delete notification.' });
  }
});

router.get('/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch feedback.' });
  }
});

router.get('/activity-logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch activity logs.' });
  }
});

module.exports = {
  router,
  startReminderProcessor,
};
