const { cloneDefaults } = require('./utils/dishes');

const REMOTE_URL = 'https://shenliguo.github.io/eatwhat/dishes.json';

App({
  globalData: {
    dishes: [],
    cart: {},
    remoteVersion: 0
  },

  onLaunch() {
    this.loadCart();
    // Load local first, then fetch remote
    this.loadLocalDishes();
    this.syncFromRemote();
  },

  loadLocalDishes() {
    const saved = wx.getStorageSync('ew2_dishes');
    if (saved && Array.isArray(saved) && saved.length > 0) {
      this.globalData.dishes = saved;
    } else {
      this.globalData.dishes = cloneDefaults();
    }
    const ver = wx.getStorageSync('ew2_dish_ver') || '0';
    this.globalData.remoteVersion = parseInt(ver);
  },

  syncFromRemote() {
    const that = this;
    wx.request({
      url: REMOTE_URL,
      method: 'GET',
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.dishes) {
          const rv = res.data.version || 0;
          if (rv > that.globalData.remoteVersion) {
            that.globalData.dishes = res.data.dishes;
            that.globalData.remoteVersion = rv;
            wx.setStorageSync('ew2_dishes', res.data.dishes);
            wx.setStorageSync('ew2_dish_ver', String(rv));
            console.log('📡 已同步最新菜单 v' + rv);
            // Notify current page to refresh
            const pages = getCurrentPages();
            if (pages.length > 0 && pages[pages.length - 1].refresh) {
              pages[pages.length - 1].refresh();
            }
          }
        }
      },
      fail() { console.log('⚠️ 远程同步失败，使用本地缓存'); }
    });
  },

  saveDishes() {
    wx.setStorageSync('ew2_dishes', this.globalData.dishes);
  },

  loadCart() {
    const saved = wx.getStorageSync('ew2_cart');
    if (saved) {
      try { this.globalData.cart = JSON.parse(saved); } catch (e) { this.globalData.cart = {}; }
    }
  },

  saveCart() {
    wx.setStorageSync('ew2_cart', JSON.stringify(this.globalData.cart));
  }
});
