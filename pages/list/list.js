// pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //当前页面url
    thisPageUrl : '/pages/list/list',
    //作品列表数据
    lists : [],
    //作品详情页面url
    nextPageUrl : '/pages/detail/detail',
    //滚动条位置
    scrollTop : 0,
    //是否显示返回顶部按钮
    showReturnTop : false,
    //可使用窗口高度
    windowHeight : 0,
    //参数字符串
    arguments : ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取可使用窗口高度
    this.setData({ windowHeight: wx.getSystemInfoSync().windowHeight});
    //获取地址栏参数
    var searchType = options.type;
    var data = JSON.parse(options.data);
    this.setData({arguments : '?type=' + searchType + '&data=' + options.data});
    //从本地存储中取出数据
    // var searchType = wx.getStorageSync('type');
    // var data = wx.getStorageSync('responseData');
    if(searchType === 'picture'){
      var lists = [];
      for(var i = 0, len = data.length; i < len; i++){
        var column = data[i].columns;
        var obj = {};
        obj.title = column.name;
        obj.artist = column.artist;
        obj.id = column.id;
        if(column.source === 2){
          obj.source = column.mechanismName;
        }else if(column.source === 3){
          obj.source = '拍卖公司';
        }else{
          obj.source = '艺术家本人';
        }
        obj.viewCount = column.view_count;
        if(column.is_auth){
          obj.auth = true;
          obj.url = 'https://www.yidaochn.com/applet/finder/detail_auth?id=' + column.id;
        }else{
          obj.auth = false;
          obj.url = 'https://www.yidaochn.com/applet/finder/detail?id=' + column.id;
        }
        obj.picture = 'http://res.yidaochn.com/' + column.thumb_pic_id + '@1e_1c_0o_0l_200h_150w_90q.src';
        lists.push(obj);
      }
      this.setData({'lists' : lists});
      return;
    }
    if(searchType === 'keyword'){
      var lists = [];
      for(var i = 0, len = data.length; i < len; i++){
        var column = data[i];
        var obj = {};
        obj.title = column.name;
        obj.artist = column.artist.columns.name;
        obj.id = column.id;
        if(column.source == 2){
          obj.source = column.mechanismName;
        }else if(column.source === 3){
          obj.source = '拍卖公司';
        }else{
          obj.source = '艺术家本人';
        }
        obj.viewCount = column.view_count;
        if(column.is_auth){
          obj.auth = true;
          obj.url = 'https://www.yidaochn.com/applet/finder/detail_auth?id=' + column.id;
        }else{
          obj.auth = false;
          obj.url = 'https://www.yidaochn.com/applet/finder/detail?id=' + column.id;
        }
        obj.picture = 'http://res.yidaochn.com/' + column.thumb_pic_id + '@1e_1c_0o_0l_200h_150w_90q.src';
        lists.push(obj);
      }
      this.setData({'lists' : lists});
      return;
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.redirectTo({
      url: this.data.thisPageUrl + this.data.arguments
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '找作品-找书画',
      desc: '书画溯源查询平台',
      path: '/pages/list/list' + this.data.arguments
    }
  },
  //跳转到作品详情页面
  detailPage : function(e){
    var flag = e.currentTarget.dataset.isauth;
    var id = e.currentTarget.dataset.id;
    // wx.setStorageSync('isAuth', flag);
    // wx.setStorageSync('id', id);
    wx.navigateTo({
      url: this.data.nextPageUrl + '?isauth=' + flag + '&id=' + id
    })
  },
  //返回顶部
  returnTop : function(){
    this.setData({scrollTop : 0});
  },
  //滚动条滚动事件
  onscroll : function(e){
    var scrollTop = e.detail.scrollTop;
    if(scrollTop > this.data.windowHeight){
      this.setData({showReturnTop : true});
    }else{
      this.setData({showReturnTop : false});
    }
  }
})