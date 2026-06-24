const { FLAVORS, dishImgUrl } = require('../../utils/dishes');
const app = getApp();

Page({
  data: {
    flavors: FLAVORS.map(f => ({ ...f, active: false })),
    selFlavors: [],
    count: 2,
    rolling: false,
    results: []
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },
  },

  toggleFlavor(e) {
    const k = e.currentTarget.dataset.k;
    let sel = [...this.data.selFlavors];
    const idx = sel.indexOf(k);
    if (idx >= 0) sel.splice(idx, 1); else sel.push(k);
    const flavors = this.data.flavors.map(f => ({ ...f, active: sel.includes(f.k) }));
    this.setData({ selFlavors: sel, flavors });
  },

  changeCount(e) {
    const d = e.currentTarget.dataset.d;
    const count = Math.max(1, Math.min(5, this.data.count + d));
    this.setData({ count });
  },

  roll() {
    let pool = [...app.globalData.dishes];
    if (this.data.selFlavors.length > 0) {
      pool = pool.filter(d => d.f.some(f => this.data.selFlavors.includes(f)));
    }
    if (pool.length === 0) { wx.showToast({ title: '无匹配菜品', icon: 'none' }); return; }

    const n = Math.min(this.data.count, pool.length);
    this.setData({ rolling: true });

    let ticks = 0;
    const iv = setInterval(() => {
      ticks++;
      if (ticks >= 12) {
        clearInterval(iv);
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const results = shuffled.slice(0, n).map(d => ({ ...d, imgUrl: dishImgUrl(d) }));
        this.setData({ rolling: false, results });
      }
    }, 100);
  },

  addToCart() {
    const cart = app.globalData.cart;
    this.data.results.forEach(d => {
      if (!cart[d.n]) cart[d.n] = { qty: 0, portion: 'tonight' };
      cart[d.n].qty += 1;
    });
    app.saveCart();
    wx.showToast({ title: '已添加 ' + this.data.results.length + ' 道菜', icon: 'success' });
  }
});
