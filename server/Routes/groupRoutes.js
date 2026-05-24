const express = require('express');
const router = express.Router();

const Group = require('../Models/Group');
const Expense = require('../Models/Expense');
const Settlement = require('../Models/Settlement');
const ActivityLog = require('../Models/ActivityLog');

router.post('/create', async(req, res) => {
    try {
        const newGroup = new Group(req.body);
        await newGroup.save();

        await ActivityLog.create({
            action: 'Group created',
            detail: `Group ${newGroup.groupName} created with ${newGroup.members.length} members.`,
            entity: 'group',
            actor: 'system'
        });

        res.status(201).json(newGroup);
    } catch(error) {
        res.status(500).json(error);
    }
});

router.get('/', async(req, res) => {

    try {

        const groups = await Group.find();

        res.json(groups);

    } catch(error) {
        res.status(500).json(error);
    }
});

// Admin endpoint: Clear all groups and related data
router.delete('/admin/clear-all', async(req, res) => {
    try {
        // Delete all groups
        const groupResult = await Group.deleteMany({});
        
        // Delete all expenses related to those groups
        const expenseResult = await Expense.deleteMany({});
        
        // Delete all settlements
        const settlementResult = await Settlement.deleteMany({});

        res.json({
            success: true,
            message: 'All group data has been cleared successfully',
            deletedGroups: groupResult.deletedCount,
            deletedExpenses: expenseResult.deletedCount,
            deletedSettlements: settlementResult.deletedCount
        });

    } catch(error) {
        console.error('Error clearing data:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing data',
            error: error.message
        });
    }
});

module.exports = router;