(async () => {
  try {
    const data = {
      fullName: 'Test User Local',
      email: `testuser+copilot_${Date.now()}@example.com`,
      password: 'Password123!'
    };

    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    console.log('Status:', res.status);
    const text = await res.text();
    try {
      console.log('Body JSON:', JSON.parse(text));
    } catch (e) {
      console.log('Body text:', text);
    }
  } catch (err) {
    console.error('Request failed:', err.message);
  }
})();
