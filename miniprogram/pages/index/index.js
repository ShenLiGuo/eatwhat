const { CAT_ORDER, dishImgUrl } = require('../../utils/dishes');
const { sendPush } = require('../../utils/wxpusher');
const app = getApp();

const FB_BG = {
  '荤菜': 'linear-gradient(135deg,#FFF0E6,#FFDFC9)',
  '素菜': 'linear-gradient(135deg,#E8F5E9,#CDE8D0)',
  '海鲜': 'linear-gradient(135deg,#E3F2FD,#C5E3FC)',
  '凉菜': 'linear-gradient(135deg,#FFFDE7,#FFF9C4)',
  '汤煲': 'linear-gradient(135deg,#FFF3E0,#FFE4C4)'
};

Page({
  data: {
    cats: CAT_ORDER,
    activeCat: '全部',
    activeFilter: 'all',
    search: '',
    filteredDishes: [],
    cartTotal: 0
  },

  onShow() { this.refresh(); },

  refresh() {
    const cart = app.globalData.cart;
    let list = app.globalData.dishes.map(d => ({
      ...d,
      imgUrl: dishImgUrl(d),
      imgErr: false,
      fbBg: FB_BG[d.c] || FB_BG['荤菜'],
      qty: (cart[d.n] || {}).qty || 0
    }));
    this.setData({ filteredDishes: this.applyFilters(list) });
    this.updateCartBadge();
  },

  applyFilters(list) {
    const { search, activeCat, activeFilter } = this.data;
    if (search) list = list.filter(d => d.n.includes(search));
    if (activeCat !== '全部') list = list.filter(d => d.c === activeCat);
    if (activeFilter === 'reheat') list = list.filter(d => d.r);
    if (activeFilter === 'sichuan') list = list.filter(d => d.cs === '川菜');
    if (activeFilter === 'canton') list = list.filter(d => d.cs === '粤菜');
    return list;
  },

  onSearch(e) { this.setData({ search: e.detail.value }); this.refresh(); },
  setCat(e) { this.setData({ activeCat: e.currentTarget.dataset.cat }); this.refresh(); },
  setFilter(e) { this.setData({ activeFilter: e.currentTarget.dataset.f }); this.refresh(); },

  onImgErr(e) {
    const idx = e.currentTarget.dataset.index;
    const list = this.data.filteredDishes;
    if (list[idx]) { list[idx].imgErr = true; this.setData({ filteredDishes: list }); }
  },

  changeQty(e) {
    const { name, delta } = e.currentTarget.dataset;
    const cart = app.globalData.cart;
    if (!cart[name]) cart[name] = { qty: 0, portion: 'tonight' };
    cart[name].qty += delta;
    if (cart[name].qty <= 0) delete cart[name];
    app.saveCart();
    this.refresh();
  },

  updateCartBadge() {
    const total = Object.values(app.globalData.cart).reduce((s, v) => s + v.qty, 0);
    this.setData({ cartTotal: total });
    if (total > 0) wx.setTabBarBadge({ index: 0, text: String(total) });
    else wx.removeTabBarBadge({ index: 0 });
  },

  showCart() {
    const cart = app.globalData.cart;
    const entries = Object.entries(cart).filter(([, v]) => v.qty > 0);
    if (entries.length === 0) return;

    const tonight = entries.filter(([, v]) => v.portion === 'tonight');
    const tomorrow = entries.filter(([, v]) => v.portion === 'tomorrow');
    const total = entries.reduce((s, [, v]) => s + v.qty, 0);
    const that = this;

    wx.showActionSheet({
      itemList: ['📨 完成并推送', '📋 复制清单', '🗑 清空购物车'],
      success(res) {
        if (res.tapIndex === 0) {
          wx.showLoading({ title: '推送中...', mask: true });
          sendPush(cart, function(result) {
            wx.hideLoading();
            if (result.ok) {
              app.globalData.cart = {};
              app.saveCart();
              that.refresh();
              wx.showToast({ title: '已推送', icon: 'success' });
            } else {
              wx.showModal({
                title: '推送失败',
                content: result.msg + '\n\n请检查：\n① 开发者工具→详情→本地设置→不校验域名\n② 小程序后台已添加wxpusher域名',
                showCancel: false
              });
            }
          });
        } else if (res.tapIndex === 1) {
          let text = '🍳 点菜清单\n';
          if (tonight.length > 0) { text += '\n🍽️今晚：\n'; tonight.forEach(([n, v]) => { text += n + ' ×' + v.qty + '\n'; }); }
          if (tomorrow.length > 0) { text += '\n🍱明午：\n'; tomorrow.forEach(([n, v]) => { text += n + ' ×' + v.qty + '\n'; }); }
          text += '\n共 ' + total + ' 道菜';
          wx.setClipboardData({ data: text, success: () => wx.showToast({ title: '已复制', icon: 'success' }) });
        } else if (res.tapIndex === 2) {
          wx.showModal({
            title: '清空购物车',
            content: '确定清空所有已选菜品？',
            success(r) { if (r.confirm) { app.globalData.cart = {}; app.saveCart(); that.refresh(); } }
          });
        }
      }
    });
  }
});
