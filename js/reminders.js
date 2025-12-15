// ====== NHẮC NHỞ & THÔNG BÁO ======

function loadReminder() {
  const saved = localStorage.getItem(REMINDER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function saveReminder(time) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify({time, enabled: true}));
}

function disableReminder() {
  localStorage.removeItem(REMINDER_KEY);
}

// Check reminder every minute
function checkReminder() {
  const reminder = loadReminder();
  if (!reminder || !reminder.enabled) return;
  
  const now = new Date();
  const [hours, minutes] = reminder.time.split(':');
  const reminderTime = new Date(now);
  reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const lastNotified = localStorage.getItem("lastReminderNotified");
  const today = now.toISOString().slice(0, 10);
  
  // Check if it's reminder time and hasn't notified today
  if (Math.abs(now - reminderTime) < 60000 && lastNotified !== today) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ Nhắc nhở cân nặng!", {
        body: `Đã đến giờ cân nhé! (${reminder.time})`,
        icon: "icon-192.png",
        requireInteraction: true
      });
      localStorage.setItem("lastReminderNotified", today);
    }
  }
}

// ====== MILESTONE CELEBRATION ======
function celebrateMilestone(totalLoss) {
  const milestones = [1, 5, 10, 15, 20, 25, 30];
  const lastCelebrated = parseFloat(localStorage.getItem("lastCelebratedMilestone") || "0");
  
  for (const milestone of milestones) {
    if (totalLoss >= milestone && lastCelebrated < milestone) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`🎉 Chúc mừng! Bạn đã giảm ${milestone}kg!`, {
          body: "Thành tích tuyệt vời! Tiếp tục phấn đấu! 💪🏆",
          icon: "icon-192.png",
          requireInteraction: true
        });
      }
      localStorage.setItem("lastCelebratedMilestone", milestone.toString());
      
      // Show confetti or animation (simple version)
      alert(`🎉🎊 CHÚC MỪNG! 🎊🎉\n\nBạn đã giảm được ${milestone}kg!\n\nThành tích tuyệt vời! Tiếp tục phấn đấu! 💪🏆`);
      break;
    }
  }
}

// ====== SETUP NOTIFICATION HANDLERS ======
function setupNotifications() {
  // Enable notification button
  document.getElementById("enableNotifyBtn").addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ thông báo.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("⚠️ Bạn chưa cho phép thông báo.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem("lastNotificationDate");

    if (lastShown !== today) {
      new Notification("📊 Nhập cân nặng hôm nay nhé!", {
        body: "Giữ thói quen tốt giúp bạn đạt mục tiêu nhanh hơn 💪",
        icon: "icon-192.png"
      });
      localStorage.setItem("lastNotificationDate", today);
    } else {
      alert("✅ Bạn đã bật thông báo hôm nay rồi!");
    }
  });

  // Set reminder button
  document.getElementById("setReminderBtn").addEventListener("click", () => {
    const reminder = loadReminder();
    
    if (reminder && reminder.enabled) {
      const disable = confirm(`Nhắc nhở đang bật lúc ${reminder.time}.\nBạn muốn tắt nhắc nhở?`);
      if (disable) {
        disableReminder();
        alert("✅ Đã tắt nhắc nhở!");
        document.getElementById("setReminderBtn").textContent = "⏰ Đặt nhắc nhở";
        document.getElementById("setReminderBtn").style.background = "";
        document.getElementById("setReminderBtn").style.color = "";
      }
    } else {
      const time = prompt("Đặt giờ nhắc nhở (VD: 08:00, 19:30):", "08:00");
      if (time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        if ("Notification" in window) {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              saveReminder(time);
              alert(`✅ Đã đặt nhắc nhở lúc ${time} mỗi ngày!`);
              document.getElementById("setReminderBtn").textContent = `⏰ ${time}`;
              document.getElementById("setReminderBtn").style.background = "var(--ok)";
              document.getElementById("setReminderBtn").style.color = "#fff";
            } else {
              alert("⚠️ Cần cho phép thông báo để dùng nhắc nhở!");
            }
          });
        } else {
          alert("⚠️ Trình duyệt không hỗ trợ thông báo!");
        }
      } else if (time !== null) {
        alert("⚠️ Định dạng giờ không hợp lệ! VD: 08:00");
      }
    }
  });

  // Update button text on load
  const reminder = loadReminder();
  if (reminder && reminder.enabled) {
    document.getElementById("setReminderBtn").textContent = `⏰ ${reminder.time}`;
    document.getElementById("setReminderBtn").style.background = "var(--ok)";
    document.getElementById("setReminderBtn").style.color = "#fff";
  }

  // Check every minute
  setInterval(checkReminder, 60000);
}
