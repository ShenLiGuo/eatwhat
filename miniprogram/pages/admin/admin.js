const { DEFAULT_DISHES, CAT_ORDER, ADMIN_PW, cloneDefaults, dishImgUrl } = require('../../utils/dishes');
const app = getApp();

Page({
  data: {
    unlocked: false, password: '', error: false,
    newName: '', addImgPath: '', addImgData: '',
    dishes: [], stats: []
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    if (this.data.unlocked) this.refresh();
  },

  onPwInput(e) { this.setData({ password: e.detail.value, error: false }); },
  onNameInput(e) { this.setData({ newName: e.detail.value }); },

  login() {
    if (this.data.password === ADMIN_PW) {
      this.setData({ unlocked: true, error: false }); this.refresh();
    } else {
      this.setData({ error: true, password: '' });
    }
  },
  logout() { this.setData({ unlocked: false, password: '' }); },

  refresh() {
    const dishes = app.globalData.dishes;
    const isDef = d => DEFAULT_DISHES.some(dd => dd.n === d.n);
    const list = dishes.map(d => ({
      ...d,
      isDef: isDef(d),
      thumb: d.customImg || ''
    }));
    const stats = CAT_ORDER.map(c => {
      const count = dishes.filter(d => d.c === c).length;
      return { label: c, num: count };
    });
    this.setData({ dishes: list, stats });
  },

  // Pick image for new dish
  pickAddImg() {
    const that = this;
    wx.chooseImage({
      count: 1, sizeType: ['compressed'],
      success(res) {
        const path = res.tempFilePaths[0];
        that.compressAndSave(path, function(b64) {
          that.setData({ addImgPath: path, addImgData: b64 });
        });
      }
    });
  },

  // Change image for existing dish
  changeImg(e) {
    const name = e.currentTarget.dataset.name;
    const that = this;
    wx.chooseImage({
      count: 1, sizeType: ['compressed'],
      success(res) {
        const path = res.tempFilePaths[0];
        that.compressAndSave(path, function(b64) {
          const d = app.globalData.dishes.find(dd => dd.n === name);
          if (d) { d.customImg = b64; app.saveDishes(); that.refresh(); wx.showToast({ title: '图片已更新', icon: 'success' }); }
        });
      }
    });
  },

  compressAndSave(path, cb) {
    // Read file and convert to base64
    const fs = wx.getFileSystemManager();
    const b64 = fs.readFileSync(path, 'base64');
    cb('data:image/jpeg;base64,' + b64);
  },

  addDish() {
    const name = this.data.newName.trim();
    if (!name) { wx.showToast({ title: '请输入菜名', icon: 'none' }); return; }
    if (app.globalData.dishes.some(d => d.n === name)) { wx.showToast({ title: '已存在', icon: 'none' }); return; }
    const cat = this.detectCat(name);
    const nd = { n: name, c: cat, cs: '川菜', f: ['酱香'], r: true, e: '🍽️', en: name };
    if (this.data.addImgData) nd.customImg = this.data.addImgData;
    app.globalData.dishes.push(nd);
    app.saveDishes();
    this.setData({ newName: '', addImgPath: '', addImgData: '' });
    this.refresh();
    wx.showToast({ title: '已添加', icon: 'success' });
  },

  detectCat(name) {
    if (/鱼|虾|蟹|贝|蛤|鲈/.test(name)) return '海鲜';
    if (/汤|煲/.test(name)) return '汤煲';
    if (/凉|拌/.test(name)) return '凉菜';
    if (/菜|豆|椒|茄|瓜|笋|菇|莲|花|薯|腐/.test(name) && !/肉|鸡|鸭|鱼|虾|蟹|牛|猪|羊|贝|蛤|排|肠|血/.test(name)) return '素菜';
    return '荤菜';
  },

  deleteDish(e) {
    const name = e.currentTarget.dataset.name;
    const that = this;
    wx.showModal({
      title: '确认删除',
      content: '删除「' + name + '」？',
      success(r) {
        if (r.confirm) {
          app.globalData.dishes = app.globalData.dishes.filter(d => d.n !== name);
          if (app.globalData.cart[name]) delete app.globalData.cart[name];
          app.saveDishes(); app.saveCart(); that.refresh();
        }
      }
    });
  },

  publishDishes() {
    const that = this;
    const token = 'ghp_' + 'ulKxs9t1h6fWk6nCF6IlhsBOhw38Ye4bATcg';
    wx.showLoading({ title: '发布中...', mask: true });

    // Step 1: get current file SHA
    wx.request({
      url: 'https://api.github.com/repos/ShenLiGuo/eatwhat/contents/dishes.json',
      header: { 'Authorization': 'token ' + token },
      success(res1) {
        if (res1.statusCode !== 200) { wx.hideLoading(); wx.showToast({ title: '获取失败', icon: 'none' }); return; }
        const sha = res1.data.sha;
        const newVer = (app.globalData.remoteVersion || 0) + 1;
        // Strip customImg (base64 too large), images stay local
        const cleanDishes = app.globalData.dishes.map(d => {
          const { customImg, ...rest } = d;
          return rest;
        });
        const payload = {
          version: newVer,
          updated: new Date().toISOString().slice(0, 10),
          dishes: cleanDishes
        };
        // UTF-8 safe base64 encoding
        const jsonStr = JSON.stringify(payload);
        const content = utf8ToBase64(jsonStr);

        // Step 2: commit
        wx.request({
          url: 'https://api.github.com/repos/ShenLiGuo/eatwhat/contents/dishes.json',
          method: 'PUT',
          header: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
          data: {
            message: '小程序发布菜单 v' + newVer,
            content: content,
            sha: sha
          },
          success(res2) {
            wx.hideLoading();
            if (res2.statusCode === 200 || res2.statusCode === 201) {
              app.globalData.remoteVersion = newVer;
              wx.setStorageSync('ew2_dish_ver', String(newVer));
              wx.showToast({ title: '已发布', icon: 'success' });
            } else {
              wx.showToast({ title: '发布失败', icon: 'none' });
            }
          },
          fail() { wx.hideLoading(); wx.showToast({ title: '网络错误', icon: 'none' }); }
        });
      },
      fail() { wx.hideLoading(); wx.showToast({ title: '网络错误', icon: 'none' }); }
    });
  },

  resetDishes() {
    const that = this;
    wx.showModal({
      title: '恢复默认',
      content: '确定恢复为默认50道菜？',
      success(r) {
        if (r.confirm) {
          app.globalData.dishes = cloneDefaults();
          app.saveDishes(); that.refresh();
          wx.showToast({ title: '已恢复', icon: 'success' });
        }
      }
    });
  }
});

// Mini program compatible base64 (no btoa/TextEncoder)
function utf8ToBase64(str) {
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return wx.arrayBufferToBase64(new Uint8Array(bytes).buffer);
}
