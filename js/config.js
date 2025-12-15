// ====== CẤU HÌNH CÁ NHÂN ======
const HEIGHT_CM = 170;
const START_WEIGHT = 109.7;
const START_DATE = new Date("2025-09-29");
const DAYS = 365;

// Mục tiêu có thể thay đổi
let GOAL_WEIGHT = 63.6;
let TARGET_BMI = GOAL_WEIGHT / ((HEIGHT_CM/100)**2);

// ====== LƯU TRỮ ======
const KEY = "weight-tracker-170cm-2025";
const KEY_TMP = "weight-tracker-tmp";
const KEY_GOAL = "weight-tracker-goal";
const KEY_GIST = "weight-tracker:gist";
const REMINDER_KEY = "weight-tracker-reminder";
