let balance = parseFloat(localStorage.getItem('balance')) || 1000;
let betHistory = JSON.parse(localStorage.getItem('betHistory')) || [];

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('balance').textContent = `Stake Coins: ${balance.toFixed(2)}`;
  checkBalance();
});

function showResult(message, colorClass, isPersistent = false) {
  const resultText = document.getElementById('resultText');
  const resultDiv = document.getElementById('result');
  resultText.textContent = message;
  resultText.className = `font-medium ${colorClass}`;
  resultDiv.classList.remove('hidden');
  resultDiv.classList.add('show');
  if (!isPersistent) {
    setTimeout(() => {
      resultDiv.classList.add('hidden');
      resultDiv.classList.remove('show');
    }, 10000);
  }
}

function updateHistory(game) {
  const historyList = document.getElementById('betHistory');
  if (historyList) {
    historyList.innerHTML = '';
    betHistory.filter(bet => bet.game === game).slice(-5).forEach(bet => {
      const li = document.createElement('li');
      li.textContent = `${bet.game}: Cược ${bet.amount} - ${bet.result}`;
      historyList.appendChild(li);
    });
    localStorage.setItem('betHistory', JSON.stringify(betHistory));
  }
}

function checkBalance() {
  const addBalanceBtn = document.getElementById('addBalanceBtn');
  if (addBalanceBtn) {
    addBalanceBtn.classList.toggle('hidden', balance > 0);
  }
}

function openBalanceModal() {
  document.getElementById('balanceModal').classList.remove('hidden');
}

function closeBalanceModal() {
  document.getElementById('balanceModal').classList.add('hidden');
  document.getElementById('newBalance').value = '';
}

function updateBalance() {
  const newBalance = parseFloat(document.getElementById('newBalance').value);
  if (isNaN(newBalance) || newBalance <= 0) {
    showResult('Vui lòng nhập số dư hợp lệ (số dương).', 'text-yellow-500');
    return;
  }
  balance = newBalance;
  document.getElementById('balance').textContent = `Stake Coins: ${balance.toFixed(2)}`;
  localStorage.setItem('balance', balance);
  closeBalanceModal();
  checkBalance();
}

function validateBet(amount, game) {
  if (isNaN(amount) || amount <= 0) {
    showResult('Vui lòng nhập số tiền cược hợp lệ (số dương).', 'text-yellow-500');
    return false;
  }
  if (amount > balance && (!window.slotsState || window.slotsState.freeSpins === 0)) {
    showResult('Số dư không đủ để đặt cược.', 'text-yellow-500');
    return false;
  }
  if (!window.slotsState || window.slotsState.freeSpins === 0) {
    balance -= amount;
    document.getElementById('balance').textContent = `Stake Coins: ${balance.toFixed(2)}`;
    localStorage.setItem('balance', balance);
  }
  checkBalance();
  return true;
}

function drawRouletteWheel(angle) {
  const canvas = document.getElementById('rouletteWheel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const radius = canvas.width / 2;
  const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const colors = ['#00ff00', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000', '#ff0000', '#000000'];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(angle * Math.PI / 180);
  for (let i = 0; i < 37; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, (i * 2 * Math.PI / 37), ((i + 1) * 2 * Math.PI / 37));
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.save();
    ctx.rotate((i * 2 * Math.PI / 37) + (Math.PI / 37));
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Poppins';
    ctx.fillText(numbers[i], radius - 20, 0);
    ctx.restore();
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(radius, radius, 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffd700';
  ctx.fill();
}

function playRoulette() {
  if (window.rouletteState && window.rouletteState.spinning) return;
  const bet = parseFloat(document.getElementById('rouletteBet').value);
  const type = document.getElementById('rouletteType').value;
  let choice;
  if (type === 'number') {
    choice = parseInt(document.getElementById('rouletteNumber').value);
    if (isNaN(choice) || choice < 0 || choice > 36) {
      showResult('Vui lòng chọn số từ 0 đến 36.', 'text-yellow-500');
      return;
    }
  } else if (type === 'color') {
    choice = document.getElementById('rouletteColor').value;
  } else {
    choice = document.getElementById('rouletteEvenOdd').value;
  }
  if (!validateBet(bet, 'Roulette')) return;

  window.rouletteState.spinning = true;
  const rouletteBtn = document.getElementById('rouletteBtn');
  rouletteBtn.disabled = true;
  let angle = 0;
  const spinTime = 3000;
  const startTime = Date.now();
  const targetNumber = Math.floor(Math.random() * 37);
  const targetAngle = (targetNumber * 360 / 37) + (Math.random() * 360 / 37);
  const spins = 3 + Math.random() * 2;

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / spinTime, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    angle = easeOut * (spins * 360 + targetAngle);
    drawRouletteWheel(angle);
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      window.rouletteState.spinning = false;
      rouletteBtn.disabled = false;
      const canvas = document.getElementById('rouletteWheel');
      canvas.classList.add('roulette');
      setTimeout(() => canvas.classList.remove('roulette'), 300);
      const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
      const colors = ['green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'];
      const resultNumber = numbers[targetNumber];
      const resultColor = colors[targetNumber];
      const isEven = resultNumber % 2 === 0 && resultNumber !== 0;
      let winnings = 0;
      let resultMessage;
      if (type === 'number' && choice === resultNumber) {
        winnings = bet * 36;
        balance += winnings;
        resultMessage = `Bạn thắng! Kết quả: ${resultNumber} (${resultColor}). Nhận ${winnings.toFixed(2)} Stake Coins.`;
        showResult(resultMessage, 'text-white', true);
      } else if (type === 'color' && choice === resultColor) {
        winnings = bet * 2;
        balance += winnings;
        resultMessage = `Bạn thắng! Kết quả: ${resultNumber} (${resultColor}). Nhận ${winnings.toFixed(2)} Stake Coins.`;
        showResult(resultMessage, 'text-white', true);
      } else if (type === 'evenOdd' && ((choice === 'even' && isEven) || (choice === 'odd' && !isEven && resultNumber !== 0))) {
        winnings = bet * 2;
        balance += winnings;
        resultMessage = `Bạn thắng! Kết quả: ${resultNumber} (${resultColor}). Nhận ${winnings.toFixed(2)} Stake Coins.`;
        showResult(resultMessage, 'text-white', true);
      } else {
        resultMessage = `Bạn thua! Kết quả: ${resultNumber} (${resultColor}).`;
        showResult(resultMessage, 'text-red-500', true);
      }
      document.getElementById('balance').textContent = `Stake Coins: ${balance.toFixed(2)}`;
      betHistory.push({ game: 'Roulette', amount: bet.toFixed(2), result: resultMessage });
      updateHistory('Roulette');
      localStorage.setItem('balance', balance);
      checkBalance();
    }
  }
  requestAnimationFrame(animate);
}

function startMines() {
  const bet = parseFloat(document.getElementById('minesBet').value);
  const mineCount = parseInt(document.getElementById('minesCount').value);

  if (isNaN(mineCount) || mineCount < 1 || mineCount > 24) {
    showResult('Vui lòng nhập số mìn hợp lệ (1-24).', 'text-yellow-500');
    return;
  }
  if (!validateBet(bet, 'Mines')) return;

  window.minesState = { active: true, bet, mines: [], opened: 0 };
  const minesStartBtn = document.getElementById('minesStartBtn');
  const minesCashoutBtn = document.getElementById('minesCashoutBtn');
  minesStartBtn.classList.add('hidden');
  minesCashoutBtn.classList.remove('hidden');
  document.getElementById('minesMultiplier').classList.remove('hidden');
  document.getElementById('minesMultiplier').textContent = `Hệ số nhân: 1.00x`;

  for (let i = 1; i <= 25; i++) {
    const cell = document.getElementById(`mine${i}`);
    cell.textContent = i;
    cell.classList.remove('revealed', 'mine');
    cell.onclick = () => revealCell(i);
  }
}

function revealCell(cellId) {
  if (!window.minesState.active) return;
  const cell = document.getElementById(`mine${cellId}`);
  if (cell.classList.contains('revealed')) return;

  if (window.minesState.mines.length === 0) {
    const mineCount = parseInt(document.getElementById('minesCount').value);
    let available = Array.from({ length: 25 }, (_, i) => i + 1).filter(i => i !== cellId);
    window.minesState.mines = [];
    for (let i = 0; i < mineCount; i++) {
      const index = Math.floor(Math.random() * available.length);
      window.minesState.mines.push(available[index]);
      available.splice(index, 1);
    }
  }

  cell.classList.add('revealed');
  if (window.minesState.mines.includes(cellId)) {
    cell.classList.add('mine');
    cell.textContent = '💣';
    showResult(`Bạn thua! Trúng mìn tại ô ${cellId}.`, 'text-red-500');
    betHistory.push({ game: 'Mines', amount: window.minesState.bet.toFixed(2), result: `Trúng mìn tại ô ${cellId}` });
    resetMines();
  } else {
    cell.textContent = '💎';
    window.minesState.opened++;
    const multiplier = Math.pow(1.1, window.minesState.opened).toFixed(2);
    document.getElementById('minesMultiplier').textContent = `Hệ số nhân: ${multiplier}x`;
  }
  updateHistory('Mines');
  checkBalance();
}

function cashoutMines() {
  if (!window.minesState.active) return;
  const multiplier = Math.pow(1.1, window.minesState.opened).toFixed(2);
  const winnings = window.minesState.bet * multiplier;
  balance += winnings;
  document.getElementById('balance').textContent = `Stake Coins: ${balance.toFixed(2)}`;
  showResult(`Bạn rút tiền! Hệ số nhân: ${multiplier}x. Nhận ${winnings.toFixed(2)} Stake Coins.`, 'text-white');
  betHistory.push({ game: 'Mines', amount: window.minesState.bet.toFixed(2), result: `Rút tiền: ${winnings.toFixed(2)}` });
  resetMines();
  localStorage.setItem('balance', balance);
  updateHistory('Mines');
  checkBalance();
}

function resetMines() {
  window.minesState = { active: false, bet: 0, mines: [], opened: 0 };
  document.getElementById('minesStartBtn').classList.remove('hidden');
  document.getElementById('minesCashoutBtn').classList.add('hidden');
  document.getElementById('minesMultiplier').classList.add('hidden');
  for (let i = 1; i <= 25; i++) {
    const cell = document.getElementById(`mine${i}`);
    cell.textContent = i;
    cell.classList.remove('revealed', 'mine');
    cell.onclick = null;
  }
}

function playSlots() {
  const bet = window.slotsState.freeSpins > 0 ? window.slotsState.freeSpinBet : parseFloat(document.getElementById('slotsBet').value);
  if (window.slotsState.freeSpins === 0 && !validateBet(bet, 'Slots')) return;

  const slotsBtn = document.getElementById('slotsBtn');
  slotsBtn.disabled = true;
  slotsBtn.textContent = window.slotsState.freeSpins > 0 ? `Vòng quay miễn phí: ${window.slotsState.freeSpins} lượt` : 'Quay';
  const reels = Array.from({ length: 15 }, (_, i) => document.getElementById(`slot${i + 1}`));
  reels.forEach(reel => reel.classList.add('spinning'));

  setTimeout(() => {
    const symbols = ['🍒', '🍋', '🔔', '⭐', '💎', '🌌'];
    const weights = [0.3, 0.3, 0.2, 0.1, 0.05, 0.05];
    const result = Array.from({ length: 15 }, () => {
      const rand = Math.random();
      let sum = 0;
      for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (rand <= sum) return symbols[i];
      }
      return symbols[symbols.length - 1];
    });

    reels.forEach((reel, i) => {
      reel.textContent = result[i];
      reel.classList.remove('spinning');
      reel.classList.remove('winning', 'scatter');
      if (result[i] === '🌌') reel.classList.add('scatter');
    });

    const paylines = [
      [0, 1, 2, 3, 4], // Row 1
      [5, 6, 7, 8, 9], // Row 2
      [10, 11, 12, 13, 14], // Row 3
      [0, 6, 12, 8, 4], // Diagonal \
      [10, 6, 2, 8, 14], // Diagonal /
      [0, 5, 10, 6, 2], // Zigzag top
      [5, 10, 14, 9, 4], // Zigzag bottom
      [2, 6, 10, 11, 12], // Middle zigzag
      [0, 1, 7, 13, 14], // V-shape
      [10, 11, 7, 3, 4] // Inverted V
    ];

    let totalWinnings = 0;
    let winningLines = [];
    paylines.slice(0, 2).forEach((line, index) => {
      const lineSymbols = line.map(i => result[i]);
      const firstSymbol = lineSymbols[0];
      if (firstSymbol === '🌌') return;
      const count = lineSymbols.filter(s => s === firstSymbol).length;
      let multiplier = 0;
      if (count >= 3) {
        if (count === 3) {
          multiplier = firstSymbol === '🍒' || firstSymbol === '🍋' ? 1.5 :
                       firstSymbol === '🔔' ? 2 :
                       firstSymbol === '⭐' ? 3 : 5;
        } else if (count === 4) {
          multiplier = firstSymbol === '🍒' || firstSymbol === '🍋' ? 3 :
                       firstSymbol === '🔔' ? 5 :
                       firstSymbol === '⭐' ? 7 : 10;
        } else if (count === 5) {
          multiplier = firstSymbol === '🍒' || firstSymbol === '🍋' ? 7 :
                       firstSymbol === '🔔' ? 10 :
                       firstSymbol === '⭐' ? 15 : 30;
        }
        totalWinnings += bet * multiplier;
        winningLines.push(index + 1);
        line.forEach(i => reels[i].classList.add('winning'));
        setTimeout(() => line.forEach(i => reels[i].classList.remove('winning')), 1000);
      }
    });

    const scatterCount = result.filter(s => s === '🌌').length;
    let freeSpinsAwarded = 0;
    if (scatterCount >= 3) {
      freeSpinsAwarded = scatterCount === 3 ? 5 : scatterCount === 4 ? 10 : 15;
      window.slotsState.freeSpins += freeSpinsAwarded;
      window.slotsState.freeSpinBet = bet;
      console.log('Scatter sound effect!');
    }

    let resultMessage;
    if (window.slotsState.freeSpins > 0) {
      window.slotsState.freeSpins--;
      if (totalWinnings > 0) {
        balance += totalWinnings;
        resultMessage = `Vòng quay miễn phí: ${window.slotsState.freeSpins} lượt còn lại. Thắng: Dòng ${winningLines.join(', ')}. Nhận ${totalWinnings.toFixed(2)} Stake Coins.`;
        showResult(resultMessage, 'text-white', true);
      } else {
        resultMessage = `Vòng quay miễn phí: ${window.slotsState.freeSpins} lượt còn lại. Không thắng.`;
        showResult(resultMessage, 'text-red-500', true);
      }
      if (freeSpinsAwarded > 0) {
        resultMessage = `Thắng ${freeSpinsAwarded} vòng quay miễn phí! ${resultMessage}`;
        showResult(resultMessage, 'text-white', true);
      }
      betHistory.push({ game: 'Slots', amount: bet.toFixed(2), result: resultMessage });
    } else {
      if (totalWinnings > 0) {
        balance += totalWinnings;
        resultMessage = `Bạn thắng! Dòng thắng: ${winningLines.join(', ')}. Nhận ${totalWinnings.toFixed(2)} Stake Coins.`;
        showResult(resultMessage, 'text-white', true);
      } else {
        resultMessage = `Bạn thua! Kết quả: Không có dòng thắng.`;
        showResult(resultMessage, 'text-red-500', true);
      }
      if (freeSpinsAwarded > 0) {
        resultMessage = `Thắng ${freeSpinsAwarded} vòng quay miễn phí! ${resultMessage}`;
        showResult(resultMessage, 'text-white', true);
      }
      betHistory.push({ game: 'Slots', amount: bet.toFixed(2), result: resultMessage });
    }

    document.getElementById('balance').textContent = `Stake Coins: ${balance.toFixed(2)}`;
    updateHistory('Slots');
    localStorage.setItem('balance', balance);
    slotsBtn.disabled = false;
    slotsBtn.textContent = window.slotsState.freeSpins > 0 ? `Vòng quay miễn phí: ${window.slotsState.freeSpins} lượt` : 'Quay';
    if (window.slotsState.freeSpins > 0) {
      setTimeout(playSlots, 1000);
    }
    checkBalance();
  }, 800);
}
