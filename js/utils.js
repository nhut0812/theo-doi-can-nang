// ====== LƯU TRỮ DỮ LIỆU ======
function loadData(){
  const raw = localStorage.getItem(KEY);
  if(!raw) return {};
  try { return JSON.parse(raw) || {}; } catch(e){ return {}; }
}

function saveData(data){ 
  localStorage.setItem(KEY, JSON.stringify(data)); 
}

// Lưu/tải cân nặng mục tiêu
function loadGoalWeight(){
  const saved = localStorage.getItem(KEY_GOAL);
  if(saved) {
    const val = parseFloat(saved);
    if(!isNaN(val) && val > 0) return val;
  }
  return 63.6; // mặc định
}

function saveGoalWeight(goal){
  localStorage.setItem(KEY_GOAL, goal.toString());
}

// giữ giá trị nhập tạm
function loadTmp(){ 
  try{ return JSON.parse(localStorage.getItem(KEY_TMP)||"{}"); } catch(e){return{}} 
}

function saveTmp(obj){ 
  localStorage.setItem(KEY_TMP, JSON.stringify(obj||{})); 
}

// ====== TIỆN ÍCH ======
function fmtDate(d){ 
  const z=(n)=>String(n).padStart(2,"0"); 
  return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); 
}

function clamp(x,a,b){ 
  return Math.max(a, Math.min(b,x)); 
}

function movingAvg(arr, window){
  const out = new Array(arr.length).fill(null);
  for(let i=0;i<arr.length;i++){
    let s=0,c=0;
    for(let j=Math.max(0,i-window+1);j<=i;j++){
      const v = arr[j];
      if(v!=null){ s+=v; c++; }
    }
    out[i]= c? s/c : null;
  }
  return out;
}

function lastNonNull(arr){
  for(let i=arr.length-1;i>=0;i--) if(arr[i]!=null) return {index:i, value:arr[i]};
  return null;
}

// ====== GIST UTILITIES ======
function loadGistInfo(){
  try { return JSON.parse(localStorage.getItem(KEY_GIST)||"{}"); }catch(e){return{};}
}

function saveGistInfo(o){ 
  localStorage.setItem(KEY_GIST, JSON.stringify(o)); 
}

async function askGistInfo(){
  const info = loadGistInfo();
  
  let gistId = prompt("Nhập Gist ID: 1f849577016aeb8150c4ffe2e43ddc1b", info.gistId || "");
  if(!gistId) return null;
  let token = prompt("Nhập GitHub Token: ", info.token || "");
  if(!token) return null;
  const obj = { gistId, token };
  saveGistInfo(obj);
  return obj;
}

async function syncToGist(){
  let { gistId, token } = loadGistInfo();
  if (!gistId || !token) {
    const got = await askGistInfo();
    if (!got) return alert("⚠️ Chưa nhập đủ thông tin Gist.");
    gistId = got.gistId;
    token = got.token;
  }

  try {
    const currentData = loadData();
    currentData._updatedAt = new Date().toISOString();
    saveData(currentData);

    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        "Authorization": "token " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: {
          "can-nang-data.json": {
            content: JSON.stringify(currentData, null, 2),
          },
        },
      }),
    });

    if (res.ok) {
      alert("✅ Đã đồng bộ dữ liệu lên GitHub Gist thành công!");
    } else {
      const text = await res.text();
      alert("⚠️ Lỗi đồng bộ Gist:\n" + text.slice(0, 200));
    }
  } catch (e) {
    alert("❌ Không thể đồng bộ Gist: " + e.message);
    console.error(e);
  }
}

async function loadFromGist() {
  let { gistId, token } = loadGistInfo();
  if (!gistId || !token) {
    const got = await askGistInfo();
    if (!got) return;
    gistId = got.gistId;
    token = got.token;
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: "token " + token },
    });
    const gist = await res.json();
    const content = gist.files["can-nang-data.json"]?.content;
    if (!content) {
      alert("⚠️ Không tìm thấy file can-nang-data.json trên Gist!");
      return;
    }

    const remote = JSON.parse(content);
    const local = loadData();

    const localTime = new Date(local._updatedAt || 0);
    const remoteTime = new Date(remote._updatedAt || 0);

    if (remoteTime > localTime) {
      saveData(remote);
      data = remote;
      recompute();
      alert("📥 Đã tải dữ liệu mới nhất từ GitHub Gist!");
    } else if (localTime > remoteTime) {
      alert("🆗 Dữ liệu trong máy mới hơn, giữ nguyên.");
    } else {
      alert("ℹ️ Dữ liệu đã đồng bộ, không có thay đổi.");
    }
  } catch (e) {
    alert("❌ Không thể tải dữ liệu từ Gist: " + e.message);
    console.error(e);
  }
}
