# Theo dõi Cân Nặng - Premium

Ứng dụng theo dõi cân nặng với giao diện đẹp, tính năng thống kê, dự đoán thông minh và đồng bộ GitHub Gist.

## 📁 Cấu trúc Project

```
theo-doi-can-nang/
│
├── index.html              # File HTML gốc (monolithic)
├── index-new.html          # File HTML mới (modular)
│
├── css/
│   └── styles.css          # Tất cả CSS styles
│
├── js/
│   ├── config.js           # Configuration & Constants
│   ├── utils.js            # Utility functions & Storage
│   ├── calculations.js     # BMI, Speed, Smart ETA calculations
│   ├── statistics.js       # Streak, Achievements, Monthly summary
│   ├── calendar.js         # Calendar rendering & Chart drawing
│   ├── reminders.js        # Notifications & Reminders
│   └── app.js              # Main application logic
│
├── manifest.json           # PWA manifest
├── icon-192.png            # App icon
└── README.md               # This file
```

## 🗂️ Chi tiết các file JavaScript

### `config.js`
- Các hằng số cấu hình: HEIGHT_CM, START_WEIGHT, START_DATE, DAYS
- Biến toàn cục: GOAL_WEIGHT, TARGET_BMI
- Storage keys: KEY, KEY_TMP, KEY_GOAL, KEY_GIST, REMINDER_KEY

### `utils.js`
- `loadData()`, `saveData()` - LocalStorage cho dữ liệu cân nặng
- `loadGoalWeight()`, `saveGoalWeight()` - Lưu mục tiêu
- `loadTmp()`, `saveTmp()` - Lưu giá trị nhập tạm
- `fmtDate()`, `clamp()`, `movingAvg()`, `lastNonNull()` - Hàm tiện ích
- `loadGistInfo()`, `saveGistInfo()`, `askGistInfo()` - GitHub Gist
- `syncToGist()`, `loadFromGist()` - Đồng bộ 2 chiều

### `calculations.js`
- `calculateSmartETA()` - Dự đoán thông minh với phân tích 3/7/14 ngày
  - Phát hiện plateau
  - Phát hiện đi sai hướng
  - Tính toán kịch bản lạc quan/thận trọng
  - Hiển thị số ngày + ngày cụ thể

### `statistics.js`
- `calculateStatistics()` - Tính streak hiện tại, streak tối đa, tuần tốt nhất
- `calculateAchievements()` - Huy hiệu milestone (1kg, 5kg, 10kg...) và streak (7, 30, 100 ngày)
- `calculateMonthlySummary()` - Tổng kết 6 tháng gần nhất

### `calendar.js`
- `renderCalendar()` - Vẽ lịch tháng với navigation
- `createDayCell()` - Tạo ô ngày với weight, BMI, progress
- `drawChart()` - Vẽ biểu đồ Canvas với đường mượt (Catmull-Rom)
- `setupCalendarNavigation()` - Handlers cho prev/next/today

### `reminders.js`
- `loadReminder()`, `saveReminder()`, `disableReminder()` - Quản lý reminder
- `checkReminder()` - Kiểm tra mỗi phút, gửi notification
- `celebrateMilestone()` - Thông báo khi đạt milestone (1kg, 5kg, 10kg...)
- `setupNotifications()` - Setup tất cả notification handlers

### `app.js`
- `recompute()` - Hàm tính toán chính, được gọi khi có thay đổi dữ liệu
- `setupEventHandlers()` - Setup tất cả event listeners (save, clear, export, import, reset)
- `setupGistButtons()` - Thêm buttons đồng bộ GitHub
- `initApp()` - Khởi tạo ứng dụng khi DOM ready

## 🚀 Cách sử dụng

### Phiên bản cũ (1 file)
```html
Mở file: index.html
```

### Phiên bản mới (modular)
```html
Mở file: index-new.html
```

## 🔄 Migration từ index.html sang index-new.html

Dữ liệu được lưu trong localStorage nên **không cần migration**. Chỉ cần:

1. Đổi tên file cũ: `index.html` → `index-old.html`
2. Đổi tên file mới: `index-new.html` → `index.html`
3. Mở lại trình duyệt, dữ liệu vẫn còn nguyên!

## ✨ Tính năng

- ✅ Theo dõi cân nặng hàng ngày
- ✅ Tính BMI, tốc độ giảm cân (7 ngày)
- ✅ Dự đoán thông minh ngày đạt mục tiêu
- ✅ Lịch tháng với navigation
- ✅ Biểu đồ xu hướng mượt mà
- ✅ Streak tracking (ngày liên tục)
- ✅ Best week analysis
- ✅ Achievement badges
- ✅ Monthly summary
- ✅ Daily reminders
- ✅ Milestone celebrations
- ✅ Đồng bộ GitHub Gist
- ✅ PWA support
- ✅ Responsive design

## 🛠️ Phát triển

### Thêm tính năng mới

1. **Thêm CSS**: Sửa `css/styles.css`
2. **Thêm config**: Sửa `js/config.js`
3. **Thêm calculation**: Sửa `js/calculations.js`
4. **Thêm statistics**: Sửa `js/statistics.js`
5. **Thêm UI interaction**: Sửa `js/app.js`

### Debug

Mở Developer Console (F12) để xem errors. Tất cả functions đều global scope nên có thể test trực tiếp:

```javascript
// Test trong console
console.log(data);              // Xem dữ liệu
console.log(GOAL_WEIGHT);       // Xem mục tiêu
recompute();                    // Tính lại
```

## 📝 License

Personal project - Free to use

## 👨‍💻 Author

Created with ❤️ for weight tracking
