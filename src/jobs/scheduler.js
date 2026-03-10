const cron = require('node-cron');  // npm install node-cron
const { resetBrokenStreaks } = require('./streakReset');

function startScheduler() {
  if (process.env.NODE_ENV === 'test') return; // skip in tests
  // Run at midnight UTC every day
  cron.schedule('0 0 * * *', async () => {
    console.log('Running midnight streak reset...');
    await resetBrokenStreaks();
  });

  // Run at 8 PM UTC every day (streak reminder)
  cron.schedule('0 20 * * *', async () => {
    console.log('Sending streak reminders...');
    // Query users with streaks who haven't posted today
    // Send notification via Socket.io or email
  });

  console.log('Scheduler started');
}

module.exports = { startScheduler };
