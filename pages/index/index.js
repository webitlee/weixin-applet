//index.js
Page({
  data: {
    //艺术家人数
    artist : 0,
    //作品数量
    production : 0,
    //搜索框关键字
    keyword : '',
    //是否显示扫描动画
    pictureScan : false,
    //显示选择图片的url
    pictureScanUrl : '',
    //扫描动画背景
    animationBg : {},
    //扫描动画前景
    animationFg : {},
    //获取页面初始化内容接口
    onLoadUrl: 'https://www.yidaochn.com/applet/finder/getCount',
    //图片上传接口
    uploadPictureUrl: 'https://www.yidaochn.com/applet/finder/searchByImg',
    //关键字搜索
    searchKeywordUrl: 'https://www.yidaochn.com/applet/finder/searchByName',
    //当前页面url
    thisPageUrl: '/pages/index/index',
    //拍品列表页
    nextPageUrl : '/pages/list/list',
  },
  onShareAppMessage: function () {
    return {
      title: '找书画',
      desc: '书画溯源查询平台',
      path: '/pages/index/index'
    }
  },
  //监听页面加载
  onLoad: function () {
    wx.request({
      url: this.data.onLoadUrl,
      success : (res) => {
        var data = res.data.data;
        this.setData({
          artist : data.artist_count,
          production : data.work_count
        })
      }
    })
  },
  onPullDownRefresh : function(){
    wx.redirectTo({
      url: this.data.thisPageUrl
    })
  },
  //监听页面显示
  onShow : function(){

  },
  //选择作品图片
  pictureScan : function() {
    wx.chooseImage({
      count : 1,
      sizeType : ["compressed"],
      success: (res) => {
        this.setData({
          pictureScanUrl : res.tempFilePaths[0]
        })
        this.setData({ pictureScan: true });
        this.animationScan();
        this.uploadFiles(this.data.uploadPictureUrl, this.data.pictureScanUrl);
      },
    })
  },
  //文件上传
  uploadFiles : function(url, filePath){
    wx.uploadFile({
       'url' : url,
       'filePath' : filePath,
       'name' : 'picture',
       'success' : (res) => {
          var data = JSON.parse(res.data);
          setTimeout(() => {
            if(data.error){
              wx.showModal({
                title: '错误',
                content: data.message,
                showCancel : false,
                success : () => {
                  wx.redirectTo({
                    url: this.data.thisPageUrl,
                  })
                }
              })
            }else{
              if(!data.data.artworks.length){
                wx.showModal({
                  title: '警告',
                  content: '未找到相似的内容',
                  showCancel : false,
                  success : () => {
                    wx.redirectTo({
                      url: this.data.thisPageUrl
                    })
                    return;
                  }
                })
              }
              this.setData({ pictureScan: false });
              //将搜索类型及关键字放入本地存储
              // wx.setStorageSync('type', 'picture');
              // wx.setStorageSync('responseData', data.data.artworks);
              var artworks = data.data.artworks;
              for(var i = 0; i < artworks.length; i++){
                artworks[i].columns.url = '';
              }
              var dat = JSON.stringify(artworks);
              wx.navigateTo({
                url: this.data.nextPageUrl + '?type=picture&data=' + dat,
              })
            }
          }, 2000)
          
       },
       'fail' : () => {
         wx.showModal({
           title: '错误',
           content: '网络故障，请稍后重试',
           showCancel : false,
            success : () => {
              wx.redirectTo({
                url: this.data.thisPageUrl
              })
            }
         })
       }
    })
  },
  //图搜图扫描动画
  animationScan : function(){
    var animation1 = wx.createAnimation({
      duration: 500
    });
    animation1.opacity(1).step();
    this.setData({ animationBg: animation1.export() });
    var animation2 = wx.createAnimation({
      duration: 1000
    })
    animation2.top('670rpx').step();
    this.setData({ animationFg: animation2.export() });
    var i = 0;
    this.animationLineScan(i, animation2);
  },
  animationLineScan : function(num, animationObj){
    var i = num;
    i++;
    if (i % 2) {
      animationObj.top('0rpx').step();
    }else{
      animationObj.top('670rpx').step();
    }
    this.setData({ animationFg: animationObj.export() });
    setTimeout(() => {
      this.animationLineScan(i, animationObj);
    }, 1000);
  },
  //按关键字搜索结果
  searching : function(){

    var keyword = this.data.keyword;
    if(!keyword){
      wx.showModal({
        title: '警告',
        content: '搜索关键字不能为空',
        showCancel : false
      })
      return;
    }
    wx.showLoading({
      title: '搜索中',
      mask : true
    })
    wx.request({
      url: this.data.searchKeywordUrl,
      data : {
        'name': keyword 
      },
      success : (res) =>{
        if(res.data.data.error){
          wx.showModal({
            title: '错误',
            content: res.data.data.message,
            showCancel : false
          })
          return;
        }
        if (res.data.data.works.length){
          // wx.setStorageSync('type', 'keyword');
          // wx.setStorageSync('responseData', res.data.data.works);
          this.setData({ keyword : ''});
          wx.navigateTo({
            url: this.data.nextPageUrl + '?type=keyword&data=' + JSON.stringify(res.data.data.works)
          })
          return;
        }
        wx.showModal({
          title: '警告',
          content: '未找到匹配的内容，请换个关键字试试',
          showCancel : false
        })
      },
      fail : () =>{
        wx.showModal({
          title: '错误',
          content: '出错啦，请稍后重试',
          showCancel : false
        })
      },
      complete(){
        wx.hideLoading();
      }
    })
  },
  //获取输入框关键字
  setKeyword : function(e){
    this.setData({keyword : e.detail.value});
  },
})
