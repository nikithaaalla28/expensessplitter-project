const express = require("express");
const router = express.Router();

const Expense = require("../Models/Expense");
const Settlement = require("../Models/Settlement");
const Group = require("../Models/Group");
const ActivityLog = require("../Models/ActivityLog");

const getExpenseShares = (expense, members = []) => {
  const amount = parseFloat(expense.amount) || 0;
  let splitDetails = {};

  if (expense.splits) {
    if (expense.splits instanceof Map) {
      splitDetails = Object.fromEntries(expense.splits);
    } else if (typeof expense.splits === "object") {
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
    ? String(expense.splitAmong).split(",")
    : [];

  if (splitAmong.length > 0) {
    const perPerson = parseFloat((amount / splitAmong.length).toFixed(2));
    return splitAmong.reduce((acc, person) => ({ ...acc, [person]: perPerson }), {});
  }

  if (members.length > 0) {
    const perPerson = parseFloat((amount / members.length).toFixed(2));
    return members.reduce((acc, person) => ({ ...acc, [person]: perPerson }), {});
  }

  return { [expense.paidBy || "Unknown"]: amount };
};

const simplifySettlements = (rows) => {
  const debtors = rows
    .filter((row) => row.netBalance < 0)
    .map((row) => ({ person: row.person, amount: -row.netBalance }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = rows
    .filter((row) => row.netBalance > 0)
    .map((row) => ({ person: row.person, amount: row.netBalance }))
    .sort((a, b) => b.amount - a.amount);

  const result = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      result.push({ from: debtor.person, to: creditor.person, amount: parseFloat(amount.toFixed(2)) });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0) debtorIndex += 1;
    if (creditor.amount <= 0) creditorIndex += 1;
  }

  return result;
};

const buildSettlementHistory = (settlements) =>
  settlements.flatMap((settlement) =>
    (settlement.paymentHistory || []).map((entry) => ({
      settlementId: settlement._id,
      paidBy: settlement.debtor,
      paidTo: settlement.creditor,
      paidAmount: entry.amount,
      remainingAmount: settlement.remainingAmount,
      paymentStatus: settlement.paymentStatus,
      paymentDate: entry.date,
      note: entry.note || '',
    }))
  );

const buildSettlementSummary = async (groupId) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  const settlements = await Settlement.find({ groupId });
  const balances = {};

  const ensurePerson = (person) => {
    if (!person) return;
    if (!balances[person]) {
      balances[person] = {
        person,
        totalPaid: 0,
        totalShare: 0,
        amountToReceive: 0,
        amountToPay: 0,
        netBalance: 0,
        status: 'Settled'
      };
    }
  };

  group.members.forEach((member) => ensurePerson(member));

  settlements.forEach((settlement) => {
    const amount = parseFloat(settlement.totalAmount) || 0;
    const paidAmount = parseFloat(settlement.paidAmount) || 0;
    const remainingAmount = parseFloat(settlement.remainingAmount) || 0;

    ensurePerson(settlement.creditor);
    ensurePerson(settlement.debtor);

    balances[settlement.creditor].totalPaid += paidAmount;
    balances[settlement.creditor].totalShare += amount;
    balances[settlement.creditor].amountToReceive += remainingAmount;

    balances[settlement.debtor].totalShare += amount;
    balances[settlement.debtor].amountToPay += remainingAmount;
  });

  const rows = Object.values(balances).map((row) => {
    const netBalance = parseFloat((row.amountToReceive - row.amountToPay).toFixed(2));
    const status = netBalance > 0 ? 'Receive' : netBalance < 0 ? 'Pay' : 'Settled';
    return { ...row, netBalance, status };
  });

  const totals = {
    totalPaid: parseFloat(settlements.reduce((sum, settlement) => sum + (parseFloat(settlement.paidAmount) || 0), 0).toFixed(2)),
    totalShare: parseFloat(settlements.reduce((sum, settlement) => sum + (parseFloat(settlement.totalAmount) || 0), 0).toFixed(2)),
    totalReceivable: parseFloat(settlements.reduce((sum, settlement) => sum + (parseFloat(settlement.remainingAmount) || 0), 0).toFixed(2)),
    totalOwes: parseFloat(settlements.reduce((sum, settlement) => sum + (parseFloat(settlement.remainingAmount) || 0), 0).toFixed(2)),
    netBalance: parseFloat(rows.reduce((sum, row) => sum + row.netBalance, 0).toFixed(2)),
  };

  const simplifiedTransactions = simplifySettlements(rows);
  const payers = rows.filter((row) => row.amountToPay > 0);
  const receivers = rows.filter((row) => row.amountToReceive > 0);
  const history = buildSettlementHistory(settlements.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));

  return {
    summary: {
      rows,
      totals,
      payers,
      receivers,
      simplifiedTransactions,
    },
    history,
  };
};

// Add a new expense with splits
router.post("/add", async (req, res) => {
  try {
    const { splits, paidBy, groupId, amount, splitAmong, splitType, ...rest } = req.body;

    let splitsObj = {};

    if (splitType === 'equal' || !splits) {
      const people = Array.isArray(splitAmong) ? splitAmong : (splitAmong ? String(splitAmong).split(',') : []);
      const num = people.length || 1;
      const perPerson = parseFloat(amount || 0) / num;
      people.forEach((p) => {
        const personName = String(p).trim();
        splitsObj[personName] = parseFloat(perPerson.toFixed(2));
      });
    } else {
      splitsObj = { ...(splits || {}) };
    }

    const newExpense = new Expense({
      ...rest,
      paidBy: String(paidBy).trim(),
      groupId,
      amount: parseFloat(amount || 0),
      splitAmong: Array.isArray(splitAmong) ? splitAmong.map(p => String(p).trim()) : (splitAmong ? String(splitAmong).split(',').map(p => p.trim()) : []),
      splitType: splitType || 'equal',
      splits: new Map(Object.entries(splitsObj || {}))
    });

    await newExpense.save();

    await Group.findByIdAndUpdate(groupId, { $inc: { totalExpense: parseFloat(amount) || 0 } });

    // Handle settlements and activity logs, but don't fail if they error
    try {
      console.log('creating settlements for expense', newExpense._id, 'groupId', groupId, 'splitsObj', splitsObj);
      for (const [person, amt] of Object.entries(splitsObj)) {
        const owe = parseFloat(amt) || 0;
        const cleanPerson = String(person).trim();
        const cleanPaidBy = String(paidBy).trim();
        console.log('settlement candidate', cleanPerson, 'amt', amt, 'paidBy', cleanPaidBy, 'owe', owe);
        if (cleanPerson !== cleanPaidBy && owe > 0) {
          const settlement = new Settlement({
            groupId,
            debtor: cleanPerson,
            creditor: cleanPaidBy,
            amount: owe,
            totalAmount: owe,
            paidAmount: 0,
            remainingAmount: owe,
            status: 'Pending',
            paymentHistory: [],
            note: rest.note || ''
          });
          await settlement.save();
        }
      }

      const group = await Group.findById(groupId);
      await ActivityLog.create({
        action: 'Expense recorded',
        detail: `${newExpense.description} of ₹${newExpense.amount} added to ${group?.groupName || 'a group'}.`,
        entity: 'expense',
        actor: paidBy
      });
    } catch (logError) {
      console.log('Error creating settlement/activity log:', logError);
      // Don't fail the response, the expense was saved
    }

    res.json({
      success: true,
      message: "Expense Added Successfully"
    });
  } catch (error) {
    console.log('Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: "Error Adding Expense"
    });
  }
});

// Get settlements for a group (all records)
router.get("/settlements/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const settlements = await Settlement.find({ groupId }).sort({ createdAt: -1 });
    res.json(settlements);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error Fetching Settlements",
    });
  }
});

// Debug: List all settlements by person pair with details
router.get("/settlements-debug/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const settlements = await Settlement.find({ groupId }).sort({ createdAt: -1 });
    
    const grouped = {};
    settlements.forEach((s) => {
      const key = `${s.debtor} -> ${s.creditor}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push({
        id: s._id,
        totalAmount: s.totalAmount,
        paidAmount: s.paidAmount,
        remainingAmount: s.remainingAmount,
        status: s.status,
        settled: s.settled,
        createdAt: s.createdAt,
      });
    });
    
    res.json({
      success: true,
      totalCount: settlements.length,
      byPair: grouped,
      allSettlements: settlements.map((s) => ({
        debtor: s.debtor,
        creditor: s.creditor,
        totalAmount: s.totalAmount,
        paidAmount: s.paidAmount,
        remainingAmount: s.remainingAmount,
        status: s.status,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error Fetching Settlement Debug",
    });
  }
});

router.get("/settlements-summary/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { summary } = await buildSettlementSummary(groupId);

    res.json({
      success: true,
      ...summary,
      settlementsCount: summary.rows.length
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error Fetching Settlement Summary",
    });
  }
});

router.get("/settlements/history/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const settlements = await Settlement.find({ groupId }).sort({ updatedAt: -1, createdAt: -1 });

    const history = settlements.flatMap((settlement) =>
      (settlement.paymentHistory || []).map((entry) => ({
        settlementId: settlement._id,
        paidBy: settlement.debtor,
        paidTo: settlement.creditor,
        paidAmount: entry.amount,
        remainingAmount: settlement.remainingAmount,
        paymentStatus: settlement.paymentStatus,
        paymentDate: entry.date,
        note: entry.note || '',
      }))
    );

    res.json({ success: true, history });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error Fetching Payment History" });
  }
});

router.post("/settlements/settle-transaction", async (req, res) => {
  try {
    const { groupId, from, to, amount } = req.body;
    const settleAmount = parseFloat(amount) || 0;
    
    // Clean up names
    const cleanFrom = String(from).trim();
    const cleanTo = String(to).trim();

    if (!groupId || !cleanFrom || !cleanTo || settleAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid settlement payment request." });
    }

    console.log(`[SETTLE] Searching for settlements: groupId=${groupId}, from=${cleanFrom}, to=${cleanTo}, amount=${settleAmount}`);

    const settlements = await Settlement.find({ groupId, debtor: cleanFrom, creditor: cleanTo, remainingAmount: { $gt: 0 } }).sort({ createdAt: 1 });
    console.log(`[SETTLE] Found ${settlements.length} matching settlements`);

    const totalRemaining = settlements.reduce((sum, settlement) => sum + (parseFloat(settlement.remainingAmount) || 0), 0);

    if (totalRemaining <= 0) {
      // Debug: show all settlements for this pair to understand why none were found
      const allSettlements = await Settlement.find({ groupId, debtor: cleanFrom, creditor: cleanTo });
      console.log(`[SETTLE] Debug - All settlements for ${cleanFrom}->${cleanTo}: ${allSettlements.length} records`);
      allSettlements.forEach((s, i) => {
        console.log(`  [${i}] remainingAmount=${s.remainingAmount}, status=${s.status}, settled=${s.settled}`);
      });

      return res.status(400).json({ 
        success: false, 
        message: "No outstanding settlement found for this payment.",
        debug: {
          from: cleanFrom,
          to: cleanTo,
          groupId,
          totalRemaining,
          allSettlementsCount: allSettlements.length
        }
      });
    }

    const paymentAmount = parseFloat(Math.min(settleAmount, totalRemaining).toFixed(2));
    let balance = paymentAmount;
    const updatedSettlements = [];

    for (const settlement of settlements) {
      if (balance <= 0) break;

      const remainingAmount = Math.max(0, parseFloat(settlement.remainingAmount) || 0);
      const payment = parseFloat(Math.min(balance, remainingAmount).toFixed(2));
      if (payment <= 0) continue;

      const currentPaid = parseFloat(settlement.paidAmount) || 0;
      settlement.paidAmount = parseFloat((currentPaid + payment).toFixed(2));
      settlement.remainingAmount = parseFloat(Math.max(0, remainingAmount - payment).toFixed(2));
      settlement.status = settlement.remainingAmount === 0 ? 'Settled' : 'Partially Paid';
      settlement.paymentStatus = settlement.remainingAmount === 0 ? 'Settled' : 'Pending';

      if (settlement.remainingAmount === 0) {
        settlement.settled = true;
        settlement.settledAt = new Date();
      }

      settlement.paymentHistory = [
        ...(settlement.paymentHistory || []),
        {
          amount: payment,
          date: new Date(),
          note: `Payment from ${cleanFrom} to ${cleanTo}`
        }
      ];

      await settlement.save();
      updatedSettlements.push(settlement);
      balance -= payment;
    }

    const { summary, history } = await buildSettlementSummary(groupId);

    res.json({
      success: true,
      message: `${cleanFrom} paid ₹${paymentAmount} to ${cleanTo}`,
      settlements: updatedSettlements,
      paidAmount: paymentAmount,
      summary,
      history,
    });
  } catch (error) {
    console.log('[SETTLE] Error:', error);
    res.status(500).json({ success: false, message: "Error settling transaction." });
  }
});

// Mark a settlement as settled
router.post("/settlements/:id/settle", async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentStatus, transactionId, note } = req.body;
    const settlement = await Settlement.findById(id);

    if (!settlement) {
      return res.status(404).json({ success: false, message: "Settlement not found" });
    }

    if (paymentMethod) settlement.paymentMethod = paymentMethod;
    if (transactionId) settlement.transactionId = transactionId;
    if (paymentStatus) settlement.paymentStatus = paymentStatus;
    if (note) settlement.note = note;

    const paidAmount = settlement.totalAmount || settlement.amount || 0;
    settlement.paidAmount = paidAmount;
    settlement.remainingAmount = 0;
    settlement.status = 'Settled';
    settlement.settled = true;
    settlement.settledAt = new Date();
    settlement.paymentHistory = [
      ...settlement.paymentHistory,
      {
        amount: paidAmount,
        date: new Date(),
        note: note || 'Settled in full'
      }
    ];

    const updatedSettlement = await settlement.save();
    await ActivityLog.create({
      action: 'Settlement completed',
      detail: `Settlement ${settlement._id} from ${settlement.debtor} to ${settlement.creditor} was settled.`,
      entity: 'settlement',
      actor: settlement.creditor
    });
    res.json({ success: true, message: "Settlement settled", settlement: updatedSettlement });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error settling settlement",
    });
  }
});

// Mark all unsettled debtor settlements as settled for a group
router.post("/settlements/settle-by-debtor", async (req, res) => {
  try {
    const { groupId, debtor, paymentMethod, paymentStatus, transactionId, note } = req.body;
    const settlements = await Settlement.find({ groupId, debtor, settled: false });

    if (!settlements.length) {
      return res.status(404).json({ success: false, message: "No unsettled settlement found for this debtor" });
    }

    const updated = await Promise.all(
      settlements.map(async (settlement) => {
        settlement.paymentMethod = paymentMethod || settlement.paymentMethod;
        settlement.transactionId = transactionId || settlement.transactionId;
        settlement.paymentStatus = paymentStatus || settlement.paymentStatus;
        settlement.note = note || settlement.note;
        settlement.paidAmount = settlement.totalAmount || settlement.amount || 0;
        settlement.remainingAmount = 0;
        settlement.status = 'Settled';
        settlement.settled = true;
        settlement.settledAt = new Date();
        settlement.paymentHistory = [
          ...settlement.paymentHistory,
          {
            amount: settlement.paidAmount,
            date: new Date(),
            note: note || 'Settled in full'
          }
        ];
        return settlement.save();
      })
    );

    res.json({ success: true, message: "Debtor payments settled", settlements: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error settling debtor payments",
    });
  }
});

// Clear all expenses and settlements for a group
router.delete("/clear/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    await Expense.deleteMany({ groupId });
    await Settlement.deleteMany({ groupId });
    res.json({ success: true, message: "Cleared group expenses and settlements" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error clearing group data",
    });
  }
});

// Get expenses for a group
router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId });
    res.json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error Fetching Expenses",
    });
  }
});

module.exports = router;
