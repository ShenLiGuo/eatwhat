const { CAT_ORDER, FLAVORS, dishImgUrl } = require('../../utils/dishes');
const { sendPush } = require('../../utils/wxpusher');
const app = getApp();

Page({
  data: {
    cats: CAT_ORDER,
    activeCat: '全部',
    activeFilter: 'all',
    search: '',
    dishes: [],
    filteredDishes: [],
    cartTotal: 0
  },

  onShow() {
    this.loadData();
    this.renderList();
    this.updateCartBadge();
  },

  loadData() {
    this.setData({ dishes: app.globalData.dishes });
  },

  renderList() {
    const { dishes, search, activeCat, activeFilter } = this.data;
    let list = [...dishes];
    if (search) list = list.filter(d => d.n.includes(search));
    if (activeCat !== '全部') list = list.filter(d => d.c === activeCat);
    if (activeFilter === 'reheat') list = list.filter(d => d.r);
    if (activeFilter === 'sichuan') list = list.filter(d => d.cs === '川菜');
    if (activeFilter === 'canton') list = list.filter(d => d.cs === '粤菜');
    const cart = app.globalData.cart;
    list = list.map(d => ({ ...d, imgUrl: dishImgUrl(d), qty: (cart[d.n] || {}).qty || 0 }));
    this.setData({ filteredDishes: list });
  },

  onSearch(e) { this.setData({ search: e.detail.value }); this.renderList(); },

  setCat(e) { this.setData({ activeCat: e.currentTarget.dataset.cat }); this.renderList(); },
  setFilter(e) { this.setData({ activeFilter: e.currentTarget.dataset.f }); this.renderList(); },

  changeQty(e) {
    const { name, delta } = e.currentTarget.dataset;
    const cart = app.globalData.cart;
    if (!cart[name]) cart[name] = { qty: 0, portion: 'tonight' };
    cart[name].qty += delta;
    if (cart[name].qty <= 0) delete cart[name];
    app.saveCart();
    this.renderList();
    this.updateCartBadge();
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
    let items = '';
    entries.forEach(([n, v]) => {
      items += n + ' ×' + v.qty + ' [' + (v.portion === 'tonight' ? '今晚' : '明午') + ']\n';
    });
    let summary = '共 ' + total + ' 道菜';
    if (tonight.length > 0) summary += ' · 🍽️今晚' + tonight.reduce((s, [, v]) => s + v.qty, 0) + '道';
    if (tomorrow.length > 0) summary += ' · 🍱明午' + tomorrow.reduce((s, [, v]) => s + v.qty, 0) + '道';

    wx.showActionSheet({
      itemList: ['📨 完成并推送', '📋 复制清单', '🗑 清空购物车'],
      success(res) {
        if (res.tapIndex === 0) {
          wx.showLoading({ title: '推送中...' });
          sendPush(cart, (result) => {
            wx.hideLoading();
            if (result.ok) {
              wx.showToast({ title: '已推送到微信', icon: 'success' });
              // Clear cart after successful push
              app.globalData.cart = {};
              app.saveCart();
              this.renderList();
              this.updateCartBadge();
            } else {
              wx.showToast({ title: result.msg, icon: 'none' });
            }
          }.bind(this));
        } else if (res.tapIndex === 1) {
          // Copy
          let text = '🍳 点菜清单\n';
          if (tonight.length > 0) { text += '\n🍽️今晚：\n'; tonight.forEach(([n, v]) => { text += n + ' ×' + v.qty + '\n'; }); }
          if (tomorrow.length > 0) { text += '\n🍱明午：\n'; tomorrow.forEach(([n, v]) => { text += n + ' ×' + v.qty + '\n'; }); }
          text += '\n共 ' + total + ' 道菜';
          wx.setClipboardData({ data: text, success() { wx.showToast({ title: '已复制', icon: 'success' }); } });
        } else if (res.tapIndex === 2) {
          wx.showModal({
            title: '清空购物车',
            content: '确定清空所有已选菜品？',
            success(r) {
              if (r.confirm) {
                app.globalData.cart = {};
                app.saveCart();
                this.renderList();
                this.updateCartBadge();
              }
            }.bind(this)
          });
        }
      }.bind(this)
    });
  }
});
