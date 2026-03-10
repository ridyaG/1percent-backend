// src/modules/streaks/streakHelpers.js

function calculateNewStreak(user, today = new Date()) {
  const todayStr = today.toISOString().split('T')[0];
  const lastDateStr = user.lastPostDate
    ? user.lastPostDate.toISOString().split('T')[0]
    : null;

  // Already posted today — no change
  if (lastDateStr === todayStr) {
    return user.currentStreak;
  }

  // First post ever
  if (!lastDateStr) {
    return 1;
  }

  // Check if last post was yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDateStr === yesterdayStr) {
    return user.currentStreak + 1; // consecutive
  }

  return 1; // streak broken, restart
}

module.exports = { calculateNewStreak };