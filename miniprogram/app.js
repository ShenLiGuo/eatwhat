const { cloneDefaults } = require('./utils/dishes');

App({
  globalData: {
    dishes: [],
    cart: {}       // { dishName: { qty, portion: 'tonight'|'tomorrow' } }
  },

  onLaunch() {
    this.loadDishes();
    this.loadCart();
  },

  loadDishes() {
    const saved = wx.getStorageSync('ew2_dishes');
    if (saved && Array.isArray(saved)) {
      this.globalData.dishes = saved;
    } else {
      this.globalData.dishes = cloneDefaults();
    }
    if (this.globalData.dishes.length === 0) {
      this.globalData.dishes = cloneDefaults();
    }
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
