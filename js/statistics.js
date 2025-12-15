// ====== THỐNG KÊ & PHÂN TÍCH ======

// ====== STREAK TRACKING ======
function calculateStatistics(weights) {
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  // Đếm từ cuối về đầu để tìm streak hiện tại
  for (let i = weights.length - 1; i >= 0; i--) {
    if (weights[i] != null) {
      if (currentStreak === 0 || i === weights.length - 1 || weights[i + 1] != null) {
        currentStreak++;
      }
    } else {
      break;
    }
  }
  
  // Tìm streak dài nhất
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] != null) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  document.getElementById("currentStreak").textContent = currentStreak + " ngày";
  
  // Tìm tuần giảm cân tốt nhất
  let bestWeekLoss = 0;
  let bestWeekDate = "";
  
  for (let i = 7; i < weights.length; i++) {
    if (weights[i] != null && weights[i - 7] != null) {
      const weekLoss = weights[i - 7] - weights[i]; // Số dương = giảm cân
      if (weekLoss > bestWeekLoss) {
        bestWeekLoss = weekLoss;
        bestWeekDate = fmtDate(dates[i]);
      }
    }
  }
  
  const bestWeekEl = document.getElementById("bestWeek");
  if (bestWeekLoss > 0) {
    bestWeekEl.textContent = `-${bestWeekLoss.toFixed(1)} kg`;
    bestWeekEl.title = `Tuần kết thúc: ${bestWeekDate}`;
  } else {
    bestWeekEl.textContent = "—";
  }
}

// ====== ACHIEVEMENT BADGES ======
function calculateAchievements(weights) {
  const badges = [];
  const totalLoss = START_WEIGHT - (lastNonNull(weights)?.value || START_WEIGHT);
  
  // Check for milestone celebration
  if (typeof celebrateMilestone === 'function') {
    celebrateMilestone(totalLoss);
  }
  
  // Milestone badges
  if (totalLoss >= 1) badges.push({icon: "🎯", text: "Giảm 1kg", class: "bronze"});
  if (totalLoss >= 5) badges.push({icon: "🏅", text: "Giảm 5kg", class: "silver"});
  if (totalLoss >= 10) badges.push({icon: "🏆", text: "Giảm 10kg", class: "gold"});
  if (totalLoss >= 15) badges.push({icon: "👑", text: "Giảm 15kg", class: "gold"});
  if (totalLoss >= 20) badges.push({icon: "💎", text: "Giảm 20kg", class: "gold"});
  
  // Streak badges
  const streak = parseInt(document.getElementById("currentStreak").textContent);
  if (streak >= 7) badges.push({icon: "🔥", text: "7 ngày streak", class: "bronze"});
  if (streak >= 30) badges.push({icon: "🔥🔥", text: "30 ngày streak", class: "silver"});
  if (streak >= 100) badges.push({icon: "🔥🔥🔥", text: "100 ngày streak", class: "gold"});
  
  // Render badges
  const container = document.getElementById("achievementBadges");
  container.innerHTML = "";
  
  if (badges.length === 0) {
    container.innerHTML = '<small style="color:var(--muted);">Chưa có huy hiệu. Tiếp tục phấn đấu! 💪</small>';
  } else {
    badges.forEach(badge => {
      const div = document.createElement("div");
      div.className = `badge-item ${badge.class}`;
      div.innerHTML = `<span>${badge.icon}</span><span>${badge.text}</span>`;
      container.appendChild(div);
    });
  }
}

// ====== MONTHLY SUMMARY ======
function calculateMonthlySummary(weights) {
  const monthlyData = {};
  
  // Group by month
  weights.forEach((w, i) => {
    if (w != null) {
      const date = dates[i];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {weights: [], month: date.getMonth(), year: date.getFullYear()};
      }
      monthlyData[monthKey].weights.push(w);
    }
  });
  
  // Calculate stats for each month
  const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
  const container = document.getElementById("monthlySummary");
  container.innerHTML = "";
  
  const sortedMonths = Object.keys(monthlyData).sort().reverse().slice(0, 6); // Last 6 months
  
  if (sortedMonths.length === 0) {
    container.innerHTML = '<small style="color:var(--muted);">Chưa có dữ liệu tháng</small>';
    return;
  }
  
  sortedMonths.forEach(key => {
    const m = monthlyData[key];
    const avg = m.weights.reduce((a, b) => a + b, 0) / m.weights.length;
    const change = m.weights[0] - m.weights[m.weights.length - 1];
    
    const div = document.createElement("div");
    div.className = "month-stat";
    div.innerHTML = `
      <div class="month-name">${monthNames[m.month]} ${m.year}</div>
      <div class="month-value">${change >= 0 ? '-' : '+'}${Math.abs(change).toFixed(1)} kg</div>
      <small style="color:var(--muted);">TB: ${avg.toFixed(1)} kg</small>
    `;
    container.appendChild(div);
  });
}
