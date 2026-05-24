(async () => {
  try {
    const expense = {
      description: 'Automated Test Equal Split',
      amount: 5000,
      paidBy: 'Alice',
      splitAmong: ['Alice','Bob','Carol','Dave','Eve'],
      splitType: 'equal',
      groupId: '123'
    };

    const postRes = await fetch('http://localhost:5000/api/expenses/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });

    const postJson = await postRes.json().catch(() => ({ status: 'no-json' }));
    console.log('---POST RESPONSE---');
    console.log(postJson);

    const settlementsRes = await fetch('http://localhost:5000/api/expenses/settlements/123');
    const settlements = await settlementsRes.json();
    console.log('---SETTLEMENTS---');
    console.log(JSON.stringify(settlements, null, 2));
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
})();
