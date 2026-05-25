import React, { useCallback, useEffect, useState } from 'react';
import api from '../api/api';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function ViewExpenses() {
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await api.get(`/expenses/${groupId}`);
      setExpenses(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchExpenses();
    }
  }, [groupId, fetchExpenses]);

  const totalAmount = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

  return (
    <div>
      <Navbar />

      <div className='container mt-5'>
        <div className='card p-4 shadow'>
          <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-3'>
            <div>
              <h2 className='m-0'>Expenses</h2>
              <p className='text-muted mb-0'>Group ID: {groupId || 'N/A'}</p>
            </div>
            <div className='d-flex gap-2'>
              <button className='btn btn-sm btn-primary' onClick={fetchExpenses} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link className='btn btn-sm btn-success' to='/add-expense'>Add Expense</Link>
            </div>
          </div>

          <div className='mb-3'>
            <p className='mb-1'>Total expenses recorded:</p>
            <h4 className='m-0'>₹{totalAmount.toFixed(2)}</h4>
          </div>

          {expenses.length === 0 && !loading ? (
            <div className='alert alert-light text-center'>No expenses found yet for this group.</div>
          ) : (
            <div className='table-responsive'>
              <table className='table table-hover mt-3'>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Paid By</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>{expense.description}</td>
                      <td>₹{expense.amount}</td>
                      <td>{expense.paidBy}</td>
                      <td>{expense.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewExpenses;
