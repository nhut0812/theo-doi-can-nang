// ====== BIẾN TOÀN CỤC CHO LỊCH ======
let currentCalendarDate = new Date();

// ====== VẼ LỊCH THÁNG ======
function renderCalendar(yearMonth) {
  if (yearMonth) currentCalendarDate = yearMonth;
  
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  // Update header
  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  document.getElementById("calendarMonth").textContent = `${monthNames[month]}, ${year}`;
  
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  // Build calendar grid
  const calendarView = document.getElementById("calendarView");
  calendarView.innerHTML = "";
  
  // Create day headers
  const dayHeaders = document.createElement("div");
  dayHeaders.className = "calendar-grid";
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  dayNames.forEach(name => {
    const header = document.createElement("div");
    header.className = "calendar-day-header";
    header.textContent = name;
    dayHeaders.appendChild(header);
  });
  calendarView.appendChild(dayHeaders);
  
  // Create calendar grid
  const grid = document.createElement("div");
  grid.className = "calendar-grid";
  
  // Fill previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const cell = createDayCell(year, month - 1, day, true);
    grid.appendChild(cell);
  }
  
  // Fill current month days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = (year === today.getFullYear() && 
                     month === today.getMonth() && 
                     day === today.getDate());
    const cell = createDayCell(year, month, day, false, isToday);
    grid.appendChild(cell);
  }
  
  // Fill next month days
  const remainingCells = 42 - grid.children.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const cell = createDayCell(year, month + 1, day, true);
    grid.appendChild(cell);
  }
  
  calendarView.appendChild(grid);
}

function createDayCell(year, month, day, otherMonth, isToday) {
  const cell = document.createElement("div");
  cell.className = "calendar-day";
  
  if (otherMonth) {
    cell.classList.add("other-month");
  }
  if (isToday) {
    cell.classList.add("today");
  }
  
  const date = new Date(year, month, day);
  const dateStr = fmtDate(date);
  const weight = data[dateStr];
  
  if (weight) {
    cell.classList.add("has-data");
  }
  
  // Day number
  const dayNum = document.createElement("div");
  dayNum.className = "day-number";
  dayNum.textContent = day;
  cell.appendChild(dayNum);
  
  // Weight data
  if (weight) {
    const weightDiv = document.createElement("div");
    weightDiv.className = "day-weight";
    weightDiv.textContent = weight.toFixed(1) + " kg";
    cell.appendChild(weightDiv);
    
    // BMI
    const bmi = weight / ((HEIGHT_CM / 100) ** 2);
    const bmiDiv = document.createElement("div");
    bmiDiv.className = "day-bmi";
    bmiDiv.textContent = "BMI: " + bmi.toFixed(1);
    cell.appendChild(bmiDiv);
    
    // Progress
    let prog = null;
    if (GOAL_WEIGHT < START_WEIGHT) {
      prog = (START_WEIGHT - weight) / (START_WEIGHT - GOAL_WEIGHT);
    } else {
      prog = (weight - START_WEIGHT) / (GOAL_WEIGHT - START_WEIGHT);
    }
    prog = clamp(prog, 0, 1);
    
    const progDiv = document.createElement("div");
    progDiv.className = "day-progress";
    progDiv.textContent = Math.round(prog * 100) + "%";
    if (prog >= 0.8) progDiv.style.color = "var(--ok)";
    else if (prog >= 0.4) progDiv.style.color = "var(--warn)";
    else progDiv.style.color = "var(--bad)";
    cell.appendChild(progDiv);
  }
  
  // Click to edit
  cell.onclick = () => {
    const val = prompt("Nhập cân nặng (kg) cho ngày " + dateStr, weight ? weight.toFixed(1) : "");
    if (val === null) return;
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      data[dateStr] = Math.round(num * 10) / 10;
    } else {
      delete data[dateStr];
    }
    saveData(data);
    recompute();
  };
  
  return cell;
}

// ====== VẼ BIỂU ĐỒ MƯỢT (CANVAS THUẦN) ======
function drawChart(series, avg7){
  const canvas = document.getElementById("chart");
  const tip = document.getElementById("chartTip");
  const ctx = canvas.getContext("2d");
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const DPR = window.devicePixelRatio || 1;
  canvas.width = Math.floor(W*DPR);
  canvas.height = Math.floor(H*DPR);
  ctx.scale(DPR,DPR);

  ctx.clearRect(0,0,W,H);
  const pL=42,pR=12,pT=12,pB=28;
  const plotW=W-pL-pR, plotH=H-pT-pB;

  // bounds
  const vals = series.filter(v=>v!=null);
  const vals2 = avg7.filter(v=>v!=null);
  const all = vals.concat(vals2);
  if(all.length===0){
    ctx.fillStyle="#6b7280"; ctx.fillText("Chưa có dữ liệu để vẽ biểu đồ", pL, pT+16); return;
  }
  const minV = Math.min(...all), maxV = Math.max(...all);
  const pad = Math.max(1,(maxV-minV)*0.12);
  const yMin = Math.min(minV - pad, GOAL_WEIGHT - 1);
  const yMax = Math.max(maxV + pad, GOAL_WEIGHT + 1);

  // axes
  ctx.strokeStyle="#e5e7eb"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pL, pT); ctx.lineTo(pL, pT+plotH); ctx.lineTo(pL+plotW, pT+plotH); ctx.stroke();

  // y ticks
  ctx.fillStyle="#6b7280"; ctx.font="12px system-ui";
  const steps = 4;
  for(let i=0;i<=steps;i++){
    const t = yMin + (i/steps)*(yMax-yMin);
    const y = pT + plotH - (t - yMin)/(yMax-yMin)*plotH;
    ctx.beginPath(); ctx.moveTo(pL,y); ctx.lineTo(pL+plotW,y); ctx.strokeStyle="#f1f5f9"; ctx.stroke();
    ctx.fillText(t.toFixed(1), 4, y+4);
  }

  function xAt(i){ return pL + (i/(series.length-1))*plotW; }
  function yAt(v){ return pT + plotH - (v - yMin)/(yMax-yMin)*plotH; }

  // goal line
  ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--goal').trim() || "#9ca3af";
  ctx.setLineDash([6,6]); ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(pL, yAt(GOAL_WEIGHT)); ctx.lineTo(pL+plotW, yAt(GOAL_WEIGHT)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle="#6b7280"; ctx.fillText("Mục tiêu " + GOAL_WEIGHT.toFixed(1)+"kg", pL+6, yAt(GOAL_WEIGHT)-6);

  // smooth path helper (Catmull-Rom to Bezier)
  function smoothPath(points){
    if(points.length<2) return null;
    const path = [];
    for(let i=0;i<points.length-1;i++){
      const p0 = points[i-1] || points[i];
      const p1 = points[i];
      const p2 = points[i+1];
      const p3 = points[i+2] || p2;
      const cp1x = p1.x + (p2.x - p0.x)/6;
      const cp1y = p1.y + (p2.y - p0.y)/6;
      const cp2x = p2.x - (p3.x - p1.x)/6;
      const cp2y = p2.y - (p3.y - p1.y)/6;
      path.push({p1,cp1:{x:cp1x,y:cp1y},cp2:{x:cp2x,y:cp2y},p2});
    }
    return path;
  }

  // collect points (weight)
  const pts = [];
  for(let i=0;i<series.length;i++){
    const v = series[i];
    if(v==null) continue;
    pts.push({i, x:xAt(i), y:yAt(v), v});
  }
  // draw weight line
  if(pts.length){
    const path = smoothPath(pts);
    ctx.strokeStyle="#2563eb"; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    if(path){
      for(const seg of path){
        ctx.bezierCurveTo(seg.cp1.x, seg.cp1.y, seg.cp2.x, seg.cp2.y, seg.p2.x, seg.p2.y);
      }
    }
    ctx.stroke();
  }

  // avg7 line
  const ptsAvg = [];
  for(let i=0;i<avg7.length;i++){
    const v = avg7[i]; if(v==null) continue;
    ptsAvg.push({i, x:xAt(i), y:yAt(v), v});
  }
  if(ptsAvg.length){
    const path2 = smoothPath(ptsAvg);
    ctx.strokeStyle="#0ea5e9"; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(ptsAvg[0].x, ptsAvg[0].y);
    if(path2){
      for(const seg of path2){
        ctx.bezierCurveTo(seg.cp1.x, seg.cp1.y, seg.cp2.x, seg.cp2.y, seg.p2.x, seg.p2.y);
      }
    }
    ctx.stroke();
  }

  // x labels (first/mid/last)
  ctx.fillStyle="#6b7280";
  const first = fmtDate(dates[0]);
  const mid = fmtDate(dates[Math.floor(dates.length/2)]);
  const last = fmtDate(dates[dates.length-1]);
  ctx.fillText(first, pL, H-6);
  ctx.fillText(mid, pL+plotW/2-30, H-6);
  ctx.fillText(last, pL+plotW-80, H-6);

  // tooltip interactions
  function nearestPoint(mx){
    let best=null, bestDist=1e9;
    const arr = pts.length? pts: ptsAvg;
    for(const p of arr){
      const dx = Math.abs(p.x - mx);
      if(dx < bestDist){ best = p; bestDist = dx; }
    }
    return best;
  }

  function showTip(p){
    if(!p){ tip.style.display="none"; return; }
    tip.style.display="block";
    tip.style.left = p.x + "px";
    tip.style.top = p.y + "px";
    tip.textContent = fmtDate(dates[p.i]) + " • " + p.v.toFixed(1) + " kg";
  }

  function handleMove(evt){
    const rect = canvas.getBoundingClientRect();
    const x = (evt.touches? evt.touches[0].clientX: evt.clientX) - rect.left;
    showTip(nearestPoint(x));
  }
  canvas.onmousemove = handleMove;
  canvas.ontouchstart = handleMove;
  canvas.ontouchmove = handleMove;
  canvas.onmouseleave = ()=> tip.style.display="none";
}

// ====== CALENDAR NAVIGATION ======
function setupCalendarNavigation() {
  document.getElementById("prevMonth").onclick = () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
  };

  document.getElementById("nextMonth").onclick = () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
  };

  document.getElementById("todayBtn").onclick = () => {
    currentCalendarDate = new Date();
    renderCalendar();
  };
}
