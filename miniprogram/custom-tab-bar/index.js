Component({
  data: { selected: 0, cartCount: 0 },
  methods: {
    switchTab(e) {
      const { index, path } = e.currentTarget.dataset;
      if (this.data.selected === index) return;
      wx.switchTab({ url: path });
    }
  }
});
