async function testCron() {
  try {
    console.log('Testing /api/cron/ask...');
    const resAsk = await fetch('http://localhost:3000/api/cron/ask');
    const textAsk = await resAsk.text();
    console.log('Status Ask:', resAsk.status);
    console.log('Response Ask:', textAsk);

    console.log('\n---');

    console.log('Testing /api/cron/send...');
    const resSend = await fetch('http://localhost:3000/api/cron/send');
    const textSend = await resSend.text();
    console.log('Status Send:', resSend.status);
    console.log('Response Send:', textSend);

  } catch (error) {
    console.error('Fetch Error:', error);
  }
}
testCron();
