const APP_TOKEN = 'AT_mWuqNMxKmPtxGkA4FE4hWfXHNwNvV6RX';
const ADMIN_UID = 'UID_xhuwqaNXh5uktmMbN6WH0zfuLL01';

function sendPush(cart, cb) {
  const entries = Object.entries(cart).filter(([, v]) => v.qty > 0);
  if (entries.length === 0) { cb && cb({ ok: false, msg: '购物车为空' }); return; }

  const tonight = entries.filter(([, v]) => v.portion === 'tonight');
  const tomorrow = entries.filter(([, v]) => v.portion === 'tomorrow');
  const total = entries.reduce((s, [, v]) => s + v.qty, 0);

  let html = '<h3>🍳 点菜清单 · 二人食</h3>';
  if (tonight.length > 0) html += '<p><b>🍽️ 今晚吃：</b><br>' + tonight.map(([n, v]) => n + ' ×' + v.qty).join('<br>') + '</p>';
  if (tomorrow.length > 0) html += '<p><b>🍱 明午带饭：</b><br>' + tomorrow.map(([n, v]) => n + ' ×' + v.qty).join('<br>') + '</p>';
  html += '<hr><b>共 ' + total + ' 道菜</b>';

  let summary = '今晚：' + (tonight.map(([n]) => n).join('、') || '无');
  if (tomorrow.length > 0) summary += ' | 明午：' + tomorrow.map(([n]) => n).join('、');

  wx.request({
    url: 'https://wxpusher.zjiecode.com/api/send/message',
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    data: {
      appToken: APP_TOKEN,
      content: html,
      summary: summary,
      contentType: 2,
      uids: [ADMIN_UID]
    },
    success(res) {
      if (res.data && res.data.code === 1000) cb && cb({ ok: true });
      else cb && cb({ ok: false, msg: res.data && res.data.msg || '推送失败' });
    },
    fail(err) {
      cb && cb({ ok: false, msg: err.errMsg || '网络错误' });
    }
  });
}

module.exports = { sendPush };
