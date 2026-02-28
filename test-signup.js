async function test() {
  const res = await fetch('http://localhost:3000/api/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@test.com', name: 'Test' }),
    headers: { 'Content-Type': 'application/json' }
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}
test();
