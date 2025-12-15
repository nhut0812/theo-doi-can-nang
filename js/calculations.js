// ====== TÍNH TOÁN BMI, SPEED, ETA ======

// ====== DỰ ĐOÁN THÔNG MINH ======
function calculateSmartETA(weights) {
  const lastW = lastNonNull(weights);
  if (!lastW) return "—";
  
  const currentWeight = lastW.value;
  const remaining = Math.abs(currentWeight - GOAL_WEIGHT);
  const isLosing = GOAL_WEIGHT < START_WEIGHT;
  
  // Không cần dự đoán nếu đã đạt mục tiêu
  if (remaining < 0.5) {
    return "🎉 Đã đạt mục tiêu!";
  }
  
  // Lấy dữ liệu gần nhất
  const recentWeights = [];
  for (let i = weights.length - 1; i >= 0 && recentWeights.length < 30; i--) {
    if (weights[i] != null) {
      recentWeights.unshift({index: i, value: weights[i]});
    }
  }
  
  if (recentWeights.length < 7) {
    return "📊 Cần thêm dữ liệu (tối thiểu 7 ngày)";
  }
  
  // Tính tốc độ ở các mốc thời gian khác nhau
  const rates = [];
  
  // Tốc độ 3 ngày (rất ngắn hạn - phát hiện xu hướng mới)
  if (recentWeights.length >= 3) {
    const w3 = recentWeights[recentWeights.length - 3].value;
    const wNow = currentWeight;
    const days3 = recentWeights[recentWeights.length - 1].index - recentWeights[recentWeights.length - 3].index;
    if (days3 > 0) {
      rates.push({period: 3, rate: (wNow - w3) / days3, weight: 3});
    }
  }
  
  // Tốc độ 7 ngày (ngắn hạn)
  if (recentWeights.length >= 7) {
    const w7 = recentWeights[recentWeights.length - 7].value;
    const wNow = currentWeight;
    const days7 = recentWeights[recentWeights.length - 1].index - recentWeights[recentWeights.length - 7].index;
    if (days7 > 0) {
      rates.push({period: 7, rate: (wNow - w7) / days7, weight: 2});
    }
  }
  
  // Tốc độ 14 ngày (trung hạn - ổn định hơn)
  if (recentWeights.length >= 14) {
    const w14 = recentWeights[recentWeights.length - 14].value;
    const wNow = currentWeight;
    const days14 = recentWeights[recentWeights.length - 1].index - recentWeights[recentWeights.length - 14].index;
    if (days14 > 0) {
      rates.push({period: 14, rate: (wNow - w14) / days14, weight: 1});
    }
  }
  
  if (rates.length === 0) {
    return "📊 Chưa đủ dữ liệu để dự đoán";
  }
  
  // Tính tốc độ trọng số (ưu tiên dữ liệu gần)
  let weightedRate = 0;
  let totalWeight = 0;
  rates.forEach(r => {
    weightedRate += r.rate * r.weight;
    totalWeight += r.weight;
  });
  weightedRate /= totalWeight;
  
  // Kiểm tra hướng di chuyển
  const correctDirection = (isLosing && weightedRate < 0) || (!isLosing && weightedRate > 0);
  
  // Tính toán số ngày cần thiết (dùng cho cả trường hợp đúng và sai hướng)
  const dailyRate = Math.abs(weightedRate);
  
  if (!correctDirection) {
    // Đang đi sai hướng hoặc plateau - NHƯNG VẪN CHO ĐỘNG LỰC
    if (Math.abs(weightedRate) < 0.02) { // < 0.02 kg/ngày = plateau
      // Dùng tốc độ mục tiêu hợp lý: 0.5kg/tuần = 0.071kg/ngày
      const targetDailyRate = 0.071;
      const daysNeeded = Math.round(remaining / targetDailyRate);
      const from = dates[lastW.index] || new Date();
      const etaDate = new Date(from);
      etaDate.setDate(etaDate.getDate() + daysNeeded);
      
      return `<div style="font-size:28px;font-weight:900;color:#f59e0b;margin:8px 0;">⚖️ ${daysNeeded} ngày</div>` +
             `<div style="font-size:15px;font-weight:600;margin-bottom:8px;color:#f59e0b;">Nếu vượt qua Plateau: ${fmtDate(etaDate)}</div>` +
             `<small style="color:var(--muted);line-height:1.6;">` +
             `⚠️ Cân nặng đang dừng lại!<br>` +
             `💡 Cần: Thay đổi chế độ ăn/tập với tốc độ 0.5kg/tuần` +
             `</small>`;
    } else {
      // Đang đi sai hướng - tính với tốc độ lý tưởng
      const wrongDir = isLosing ? "tăng" : "giảm";
      const targetDailyRate = 0.071; // 0.5kg/tuần
      const daysNeeded = Math.round(remaining / targetDailyRate);
      const from = dates[lastW.index] || new Date();
      const etaDate = new Date(from);
      etaDate.setDate(etaDate.getDate() + daysNeeded);
      
      return `<div style="font-size:28px;font-weight:900;color:#ef4444;margin:8px 0;">⚠️ ${daysNeeded} ngày</div>` +
             `<div style="font-size:15px;font-weight:600;margin-bottom:8px;color:#ef4444;">Nếu điều chỉnh ngay: ${fmtDate(etaDate)}</div>` +
             `<small style="color:var(--muted);line-height:1.6;">` +
             `❌ Đang ${wrongDir} cân (ngược mục tiêu!)<br>` +
             `💪 Cần: Quay về đúng hướng với 0.5kg/tuần` +
             `</small>`;
    }
  }
  
  // Phát hiện xu hướng gia tốc/chậm dần
  let trend = "";
  if (rates.length >= 2) {
    const shortRate = Math.abs(rates[0].rate); // 3 ngày
    const longRate = Math.abs(rates[rates.length - 1].rate); // 14 ngày
    const ratio = shortRate / longRate;
    
    if (ratio > 1.3) {
      trend = " 📈 Đang nhanh lên";
    } else if (ratio < 0.7) {
      trend = " 📉 Đang chậm lại";
    }
  }
  
  // Dự đoán số ngày cần thiết
  const daysNeeded = Math.round(remaining / dailyRate);
  
  // Tính ngày dự kiến
  const from = dates[lastW.index] || new Date();
  const etaDate = new Date(from);
  etaDate.setDate(etaDate.getDate() + daysNeeded);
  
  // Tính kịch bản lạc quan (tốc độ tăng 20%) và thận trọng (giảm 20%)
  const optimisticDays = Math.round(remaining / (dailyRate * 1.2));
  const conservativeDays = Math.round(remaining / (dailyRate * 0.8));
  
  const optimisticDate = new Date(from);
  optimisticDate.setDate(optimisticDate.getDate() + optimisticDays);
  
  const conservativeDate = new Date(from);
  conservativeDate.setDate(conservativeDate.getDate() + conservativeDays);
  
  // Format kết quả với SỐ NGÀY nổi bật
  let result = `<div style="font-size:32px;font-weight:900;color:var(--accent);margin:8px 0;">${daysNeeded} ngày</div>`;
  result += `<div style="font-size:16px;font-weight:600;margin-bottom:8px;">${fmtDate(etaDate)}${trend}</div>`;
  result += `<small style="color:var(--muted);line-height:1.6;">`;
  result += `📊 Tốc độ: <strong>${(dailyRate * 7).toFixed(2)} kg/tuần</strong><br>`;
  result += `🎯 Dự đoán: ${optimisticDays}-${conservativeDays} ngày`;
  result += `</small>`;
  
  return result;
}
