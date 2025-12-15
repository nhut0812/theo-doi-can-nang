// ====== KHỞI TẠO DÃY NGÀY ======
const dates = Array.from({length:DAYS}, (_,i)=>{ 
  const d = new Date(START_DATE); 
  d.setDate(d.getDate()+i); 
  return d; 
});

// ====== DỮ LIỆU TOÀN CỤC ======
let data = {};
let tmp = {};

// ====== TÍNH TOÁN CHÍNH ======
function recompute(){
  // Build aligned arrays
  const weights = dates.map(d => {
    const w = data[fmtDate(d)];
    return (typeof w==="number" && w>0)? w : null;
  });
  const bmi = weights.map(w => w==null ? null : w/((HEIGHT_CM/100)**2));
  
  // progress%
  const progress = weights.map(w => {
    if(w==null) return null;
    if(GOAL_WEIGHT < START_WEIGHT){ // giảm cân
      const p = (START_WEIGHT - w) / (START_WEIGHT - GOAL_WEIGHT);
      return clamp(p,0,1);
    } else { // tăng cân
      const p = (w - START_WEIGHT) / (GOAL_WEIGHT - START_WEIGHT);
      return clamp(p,0,1);
    }
  });
  
  // 7-day avg
  const avg7 = movingAvg(weights, 7);

  // 7-day rate (kg/tuần) - tính từ 7 ngày gần nhất
  let rate7 = null;
  for(let i=7;i<weights.length;i++){
    const a = weights[i-7], b = weights[i];
    if(a!=null && b!=null) rate7 = (b - a)/7*7; // (b-a) trong 7 ngày = kg/tuần
  }

  // Trung bình 7 ngày gần nhất (hiển thị)
  const lastAvg = lastNonNull(avg7);
  document.getElementById("avg7Label").textContent = lastAvg? lastAvg.value.toFixed(1) : "—";

  // Metrics gần nhất
  const lastW = lastNonNull(weights);
  const lastB = lastNonNull(bmi);
  const lastP = lastNonNull(progress);

  const latestWeight = document.getElementById("latestWeight");
  const latestBMI = document.getElementById("latestBMI");
  const progressValue = document.getElementById("progressValue");
  const remainValue = document.getElementById("remainValue");
  const rate7El = document.getElementById("rate7");
  const etaValue = document.getElementById("etaValue");

  latestWeight.textContent = lastW? lastW.value.toFixed(1)+" kg" : "—";
  latestBMI.textContent = lastB? lastB.value.toFixed(1) : "—";
  progressValue.textContent = lastP? Math.round(lastP.value*100)+"%" : "—";
  remainValue.textContent = lastW? Math.abs(lastW.value - GOAL_WEIGHT).toFixed(1)+" kg":"—";
  rate7El.textContent = (rate7==null? "—" : rate7.toFixed(2));

  // === Dự ĐOÁN THÔNG MINH ===
  etaValue.innerHTML = calculateSmartETA(weights);

  // === THỐNG KÊ & PHÂN TÍCH ===
  calculateStatistics(weights);
  calculateAchievements(weights);
  calculateMonthlySummary(weights);

  // === CẢNH BÁO THÔNG MINH ===
  const alertBox = document.getElementById("gainAlert");
  alertBox.style.display = "none";

  let upCount = 0, downCount = 0;
  for (let i = weights.length - 1; i >= 1; i--) {
    if (weights[i] == null || weights[i - 1] == null) continue;
    const diff = weights[i] - weights[i - 1];
    if (diff > 0.1) upCount++;
    else if (diff < -0.1) downCount++;
    else break;
    if (upCount >= 3 || downCount >= 3) break;
  }

  if (upCount >= 3) {
    alertBox.textContent =
      "⚠️ Bạn đang tăng cân 3 ngày liên tiếp. Hãy kiểm tra lại khẩu phần tinh bột, ăn nhạt hơn và tăng vận động nhẹ 💪";
    alertBox.style.display = "block";
  } else if (downCount >= 3) {
    alertBox.textContent =
      "🎉 Bạn giảm liên tục 3 ngày rồi! Duy trì nhịp độ, nhớ ăn đủ đạm và ngủ ngon để giữ sức khỏe ❤️";
    alertBox.style.display = "block";
  }

  // Render lịch
  renderCalendar();

  // Vẽ biểu đồ mượt + đường mục tiêu
  drawChart(weights, avg7);
}

// ====== EVENT HANDLERS ======
function setupEventHandlers() {
  // Lắng nghe thay đổi cân nặng mục tiêu
  document.getElementById("goalWeightInput").addEventListener("change", (e) => {
    const val = parseFloat(e.target.value);
    if(!isNaN(val) && val > 0) {
      GOAL_WEIGHT = Math.round(val * 10) / 10;
      TARGET_BMI = GOAL_WEIGHT / ((HEIGHT_CM/100)**2);
      document.getElementById("bmiGoalLabel").textContent = TARGET_BMI.toFixed(1);
      saveGoalWeight(GOAL_WEIGHT);
      recompute();
    }
  });

  // Giữ giá trị nhập tạm
  document.getElementById("weightInput").addEventListener("input", (e) => { 
    tmp.weightInput = e.target.value; 
    saveTmp(tmp); 
  });

  // Save button
  document.getElementById("saveBtn").onclick = async () => {
    const d = document.getElementById("dateInput").value;
    const w = parseFloat(document.getElementById("weightInput").value);
    if(!d || isNaN(w) || w<=0){ 
      alert("⚠️ Vui lòng nhập ngày và cân nặng hợp lệ."); 
      return; 
    }
    const dd = new Date(d);
    if(dd < START_DATE || dd > dates[dates.length-1]){
      alert("⚠️ Ngày nằm ngoài phạm vi theo dõi."); 
      return;
    }

    data[d] = Math.round(w*10)/10;
    saveData(data);
    tmp.weightInput = ""; 
    saveTmp(tmp);
    document.getElementById("weightInput").value="";
    recompute();

    alert("✅ Đã lưu cân nặng!");
    await syncToGist();
  };

  // Clear button
  document.getElementById("clearBtn").onclick = () => {
    const d = document.getElementById("dateInput").value;
    if(!d){ alert("Chưa chọn ngày."); return; }
    delete data[d];
    saveData(data);
    recompute();
  };

  // Export button
  document.getElementById("exportBtn").onclick = () => {
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "can-nang-data.json";
    a.click();
  };

  // Import button
  document.getElementById("importBtn").onclick = () => document.getElementById("importFile").click();
  document.getElementById("importFile").onchange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const obj = JSON.parse(reader.result);
        data = obj && typeof obj==="object" ? obj : {};
        saveData(data);
        recompute();
        alert("Nhập dữ liệu thành công!");
      }catch(err){ alert("File không hợp lệ."); }
    };
    reader.readAsText(file);
  };

  // Reset button
  document.getElementById("resetBtn").onclick = () => {
    if(confirm("Xoá toàn bộ dữ liệu đã lưu trên máy này?")){
      localStorage.removeItem(KEY);
      localStorage.removeItem(KEY_TMP);
      data={}; tmp={};
      recompute();
    }
  };
}

// ====== GIST SYNC BUTTONS ======
function setupGistButtons() {
  const wrap = document.querySelector("#exportBtn").parentNode;

  // Nút đồng bộ lên GitHub
  const btnSync = document.createElement("button");
  btnSync.textContent = "⬆️ Đồng bộ lên GitHub";
  btnSync.className = "ghost";
  btnSync.onclick = syncToGist;
  wrap.appendChild(btnSync);

  // Nút tải dữ liệu từ GitHub
  const btnLoad = document.createElement("button");
  btnLoad.textContent = "⬇️ Tải từ GitHub";
  btnLoad.className = "ghost";
  btnLoad.onclick = loadFromGist;
  wrap.appendChild(btnLoad);
}

// ====== KHỞI ĐỘNG ỨNG DỤNG ======
function initApp() {
  // Tải cân nặng mục tiêu đã lưu
  GOAL_WEIGHT = loadGoalWeight();
  TARGET_BMI = GOAL_WEIGHT / ((HEIGHT_CM/100)**2);

  // Hiển thị thông tin ban đầu
  document.getElementById("startLabel").textContent = fmtDate(START_DATE);
  document.getElementById("bmiGoalLabel").textContent = TARGET_BMI.toFixed(1);
  document.getElementById("goalWeightInput").value = GOAL_WEIGHT.toFixed(1);

  // Điền ngày mặc định = hôm nay (nếu nằm trong phạm vi)
  const today = new Date(); 
  today.setHours(0,0,0,0);
  let defaultDate = today;
  if(today < START_DATE) defaultDate = START_DATE;
  if(today > dates[dates.length-1]) defaultDate = dates[dates.length-1];
  document.getElementById("dateInput").value = fmtDate(defaultDate);

  // Tải dữ liệu
  data = loadData();
  tmp = loadTmp();

  // Nếu có giá trị nhập tạm, hiển thị lại
  if(tmp.weightInput){ 
    document.getElementById("weightInput").value = tmp.weightInput; 
  }

  // Setup các handlers
  setupEventHandlers();
  setupCalendarNavigation();
  setupNotifications();
  setupGistButtons();

  // Tính toán lần đầu
  recompute();

  // Tự động tải dữ liệu từ Gist
  loadFromGist();
}

// ====== CHẠY KHI DOM READY ======
window.addEventListener("DOMContentLoaded", initApp);
