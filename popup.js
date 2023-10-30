document.addEventListener('DOMContentLoaded', function() {
  var workButton = document.getElementById('workButton');
  var resetButton = document.getElementById('resetButton');
  var homeTime = document.getElementById('homeTime');
  var homeTimeCountDown = document.getElementById('homeTimeCountDown');
  /** 打卡時間 */
  var startTime = document.getElementById('startTime');
  /**工作時數 */
  var workTime = document.getElementById('workTime');
  /** 捕時數 */
  var extraWorkTime = document.getElementById('extraWorkTime');

  // 取得儲存的設定
  chrome.storage.sync.get(['startTime', 'workTime', 'extraWorkTime'], function(data) {
    if (data.startTime) {
      startTime.value = data.startTime;
      let getHour = ((startTime.value).split('.')[0]).split(':');
      homeTime.textContent = `下班時間 ${Number(getHour[0]) + Number(workTime.value) + Number(extraWorkTime.value)}  : ${getHour[1]} : ${getHour[2]}`;
      updateHomeTime();
    }
    if (data.workTime) {
      workTime.value = data.workTime;
    }
  });

  // 開始計算工時和下班時間
  workButton.addEventListener('click', function() {
    let getHour = ((startTime.value).split('.')[0]).split(':');
    homeTime.textContent = `下班時間 ${Number(getHour[0]) + Number(workTime.value) + Number(extraWorkTime.value)} : ${getHour[1]} : ${getHour[2]}`;
    updateHomeTime();

    // 儲存使用者的設定
    chrome.storage.sync.set({
      'startTime': startTime.value,
      'workTime': workTime.value,
      'extraWorkTime': extraWorkTime.value
    });
  });

  // init
  resetButton.addEventListener('click', function() {
    startTime.value = '';
    workTime.value = '9';
    extraWorkTime.value = '0';
    // 清除儲存的設定
    chrome.storage.sync.remove(['startTime', 'workTime', 'extraWorkTime']);
  });

  // update 時間
  function updateHomeTime() {
    let now = new Date();
    let currentHours = now.getHours();
    let currentMinutes = now.getMinutes();
    let currentSeconds = now.getSeconds();

    let getHour = ((startTime.value).split('.')[0]).split(':');
    let endHours = Number(getHour[0]) + Number(workTime.value) + Number(extraWorkTime.value);
    let endMinutes = Number(getHour[1]);
    let endSeconds = Number(getHour[2]);

    if (currentHours < endHours || (currentHours === endHours && currentMinutes < endMinutes) || (currentHours === endHours && currentMinutes === endMinutes && currentSeconds <= endSeconds)) {
      let diffHrs = endHours - currentHours;
      let diffMins = endMinutes - currentMinutes;
      let diffSecs = endSeconds - currentSeconds;

      if (diffSecs < 0) {
        diffMins--;
        diffSecs += 60;
      }

      if (diffMins < 0) {
        diffHrs--;
        diffMins += 60;
      }

      homeTimeCountDown.textContent = `還剩下 ${diffHrs} 小時 ${diffMins} 分鐘 ${diffSecs} 秒`;
      homeTime.textContent = `下班時間 ${Number(getHour[0]) + Number(workTime.value) + Number(extraWorkTime.value)} : ${getHour[1]} : ${getHour[2]}`;

      // 每秒更新倒數時間
      setTimeout(updateHomeTime, 1000);
    } else {
      homeTimeCountDown.textContent = `已經下班了！`;
    }
  }
});