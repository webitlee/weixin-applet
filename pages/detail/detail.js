// pages/detail/detail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //当前页面url
    thisPageUrl : '/pages/detail/detail',
    //是否认证
    isAuth : true,
    //作品id
    id : 0,
    //艺术家描述高度
    artistDescription : 0,
    //艺术家描述是否显示折叠按钮
    artistFold : false,
    //艺术家描述折叠状态
    artistIsFold : true,
    //简介高度
    introduction : 0,
    //简介是否显示折叠按钮
    introductionFold : false,
    //简介折叠状态
    introductionIsFold : true,
    //屏幕宽度
    screenWidth : 0,
    //是否有其他认证资料
    otherAuthentication : false,
    //页面数据
    responseData : {},
    //已认证页面url
    authUrl: 'https://www.yidaochn.com/applet/finder/detail_auth',
    //未认证页面url
    noAuthUrl: 'https://www.yidaochn.com/applet/finder/detail',
    //大图认证点左右偏移
    left1 : 0,
    left2 : 0,
    left3 : 0,
    top1 : 0,
    top2 : 0,
    top3 : 0,
    //是否显示认证点
    isShow1 : false,
    isShow2 : false,
    isShow3 : false,
    //认证点宽度,单位rpx
    pointWidth : 40,
    //认证点高度,单位rpx
    pointHeight : 65,
    //大图显示区域总宽度,单位rpx
    imageWidth : 710,
    //大图显示区域总高度,单位rpx
    imageHeight : 710,
    //大图实际宽度,单位px
    thumbWidth : 0,
    //大图实际高度，单位px
    thumbHeight : 0,
    //认证微观认证点左右偏移
    mLeft1 : 0,
    mLeft2 : 0,
    mLeft3 : 0,
    mTop1 : 0,
    mTop2 : 0,
    mTop3 : 0,
    //认证微观认证点宽,单位rpx
    mWidth : 200,
    //认证微观认证点高,单位prx
    mHeight : 200,
    //微观认证认证点url
    mUrls : []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取屏幕高度
    this.getScreenWidth();
    //格式化响应数据
    this.getResponseData(options);
    //设置认证微观认证点
    this.micro();
    setTimeout(() => {
      //确定艺术家描述是否需要折叠
      this.setArtistDescription();
      //确定简介是否需要折叠
      this.setIntroduction();
      //设置大图认证点位置
      this.authPosition();
      //用户相册授权
      this.useAlbum();
    }, 500)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.redirectTo({
      url: this.data.thisPageUrl + '?isauth=' + this.data.isAuth + '&id=' + this.data.id
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.responseData.name + '(' + this.data.responseData.author + ')-找书画',
      desc: '书画溯源查询平台',
      path: this.data.thisPageUrl + '?isauth=' + this.data.isAuth + '&id=' + this.data.id
    }
  },
  //获取屏幕宽度
  getScreenWidth : function(){
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    this.setData({'screenWidth' : screenWidth});
  },
  //设置艺术家描述是否折叠
  setArtistDescription : function(){
    var flag = wx.canIUse('createSelectorQuery');
    if(flag){
      wx.createSelectorQuery().select('#artist-description').boundingClientRect((rects) => {
        //console.log(rects);
        this.setData({ artistDescription: rects.height });
        var foldHeight = 50 * 3 * this.data.screenWidth / 750;
        if (parseInt(foldHeight) < this.data.artistDescription) {
          this.setData({ artistFold: true });
        }
      }).exec();
      return;
    }
    this.setData({ artistFold: false });
  },
  //设置简介是否折叠
  setIntroduction : function(){
    var flag1 = this.data.isAuth;
    var flag2 = wx.canIUse('createSelectorQuery');
    if (flag1 && flag2){
      wx.createSelectorQuery().select('#production-introduction').boundingClientRect((rects) => {
        //console.log(rects);
        this.setData({ introduction: rects.height });
        var foldHeight = 50 * 3 * this.data.screenWidth / 750;
        if (parseInt(foldHeight) < this.data.introduction) {
          this.setData({ introductionFold: true });
        }
      }).exec();
      return;
    }
    this.setData({ introductionFold: false });
  },
  //展开折叠事件
  spreadOrFold : function(e){
    if (e.target.id === 'introduction'){
      if (e.currentTarget.dataset.isfold) {
        this.setData({ introductionIsFold: false });
        return;
      }
      this.setData({ introductionIsFold: true });
      return;
    }
    if(e.target.id === 'description'){
      if (e.currentTarget.dataset.isfold) {
        this.setData({ artistIsFold: false });
        return;
      }
      this.setData({ artistIsFold: true });
    }
  },
  //图片预览
  previewImage : function(e){
    //console.log(e);
    var urls = JSON.parse(e.currentTarget.dataset.src);
    wx.previewImage({
      urls: urls,
    })
  },
  //证书下载
  download : function(e){ 
    wx.showLoading({
      title: '加载中',
      mask : true
    })
    var url = e.currentTarget.dataset.src;
    wx.downloadFile({
      url : url,
      success : (res) => {
        console.log(res.tempFilePath);
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success : () =>{
            wx.showModal({
              title: '下载成功',
              content: '证书已保存至您的相册',
              showCancel: false
            })
          },
          fail : () => {
            wx.showModal({
              title: '错误',
              content: '证书下载失败,请稍后重试',
              showCancel: false
            })
          },
          complete(){
            wx.hideLoading();
          }
        })
        
      },
      fail : () =>{
        wx.showModal({
          title: '错误',
          content: '证书下载失败,请稍后重试',
          showCancel :false
        })
      },
      complete(){
        wx.hideLoading();
      }
    })
  },
  //视频播放
  play : function(){
    var context = wx.createVideoContext("video");
    context.requestFullScreen();
  },
  //进入退出全屏事件
  fullScreen : function(e){
    console.log(e);
  },
  //格式化响应数据
  getResponseData : function(options){
    //从缓存中获取页面认证状态,及作品id
    // var flag = wx.getStorageSync('isAuth');
    // this.setData({isAuth : flag});
    // var id = wx.getStorageSync('id');
    var isAuth = options.isauth;
    if(isAuth === 'true'){
      var flag = true;
    }else{
      var flag = false;
    }
    var id = options.id;
    this.setData({ 
      isAuth: flag,
      id : id
       });
    if(flag){
      wx.request({
        url: this.data.authUrl,
        data : {
          id : id
        },
        success : (res) =>{
          var data = res.data.data;
          //console.log(data);
          var fmtData = {};
          fmtData.picture = data.auth.columns.photo_id;
          fmtData.number = data.auth.columns.number;
          fmtData.source = data.auth.columns.name;
          fmtData.name = data.detail.columns.name;
          fmtData.author = data.detail.columns.author;
          fmtData.width = data.detail.columns.width;
          fmtData.height = data.detail.columns.height;
          fmtData.thumb = data.detail.columns.thumb_pic_id;
          if (data.detail.columns.material === 1) {
            fmtData.material = '宣纸';
          } else if (data.detail.columns.material === 2) {
            fmtData.material = '绢本';
          } else if (data.detail.columns.material === 3) {
            fmtData.material = '亚麻';
          } else if (data.detail.columns.material === 4) {
            fmtData.material = '其它';
          } else if (data.detail.columns.material === 5) {
            fmtData.material = '卡纸';
          }
          if(data.detail.columns.subject){
            fmtData.subject = data.detail.columns.subject;
          }else{
            fmtData.subject = null;
          }
          if (data.detail.columns.note) {
            var  introduction = this.formatStr(data.detail.columns.note);
            fmtData.introduction =introduction;
          } else {
            fmtData.introduction = null;
          }
          if (data.auth.columns.certificate){
            fmtData.authentication = data.auth.columns.certificate;
          }else{
            fmtData.authentication = null;
          }
          if (data.video) {
            this.setData({ otherAuthentication: true });
            fmtData.video = {
              poster: data.video.columns.thumb_pic_id,
              url: data.video.columns.video_res_id
            }
          }
          if (data.detail.columns.photo_res_id) {
            this.setData({ otherAuthentication: true });
            fmtData.photo = data.detail.columns.photo_res_id;
          } else {
            fmtData.photo = null;
          }
          if (data.detail.columns.certified_res_id) {
            this.setData({ otherAuthentication: true });
            fmtData.certified = data.detail.columns.certified_res_id;
          } else {
            fmtData.certified = null;
          }
          fmtData.authOrg = {
            province: data.auth.columns.province,
            count: data.auth.columns.workCount,
            name : data.auth.columns.name
          }
          if(data.auth.columns.avatar_id){
            fmtData.authOrg.src = data.auth.columns.avatar_id;
          }else{
            fmtData.authOrg.src = null;
          }
          fmtData.artist = {};
          if(data.detail.columns.authorProvince){
            fmtData.artist.province = data.detail.columns.authorProvince;
          }else{
            fmtData.artist.province = '';
          }
          fmtData.artist.count = data.detail.columns.authorWorkCount;
          fmtData.artist.src = data.detail.columns.authorAvatarId;
          if (data.titles.length) {
            fmtData.artist.name = data.detail.columns.author + '，' + data.titles[0].columns.title;
          }else{
            fmtData.artist.name = data.detail.columns.author;
          }
          fmtData.detailNote = null;
          if(data.profile.columns.note){
            var profile = data.profile.columns.note;
            profile = this.formatStr(profile);
            fmtData.profile = profile;
          }else{
            fmtData.profile = null;
          }
          this.setData({ responseData: fmtData });
        },
        fail: () => {
          wx.showModal({
            title: '错误',
            content: '网络故障，请稍后重试',
            showCancel: false
          })
        }
      })
      return;
    }
    wx.request({
      url: this.data.noAuthUrl,
      data : {
        id : id
      },
      success : (res) =>{
        var data = res.data.data;
        //console.log(data);
        var fmtData = {};
        fmtData.picture = data.detail.columns.thumb_pic_id;
        if(data.detail.columns.source === 4){
          fmtData.avatar = 'avatar-' + data.profile.columns.avatar_id;
        }else{
          fmtData.avatar = data.profile.columns.avatar_id;
        }
        fmtData.author = data.detail.columns.author;
        fmtData.name = data.detail.columns.name;
        if(data.titles.length){
          fmtData.title = data.titles[0].columns.title;
        }
        fmtData.width = data.detail.columns.width;
        fmtData.height = data.detail.columns.height;
        if(data.detail.columns.className){
          fmtData.type = data.detail.columns.className;
        }else{
          fmtData.type = null;
        }
        if (data.detail.columns.material === 1){
          fmtData.material = '宣纸';
        }else if(data.detail.columns.material === 2){
          fmtData.material = '绢本';
        }else if(data.detail.columns.material === 3){
          fmtData.material = '亚麻';
        }else if(data.detail.columns.material === 4){
          fmtData.material = '其它';
        }else if(data.detail.columns.material === 5){
          fmtData.material = '卡纸';
        }
        if(data.detail.columns.fmt_ytd){
          fmtData.time = data.detail.columns.fmt_ytd;
        }else{
          fmtData.time = null;
        }
        fmtData.viewCount = data.statistics.columns.view_count;
        if(data.detail.columns.source === 1 || data.detail.columns.source === 5){
          fmtData.source = '艺术家本人';
        }else if(data.detail.columns.source === 2){
          fmtData.source = data.profile.columns.mechanismName;
        }else if(data.detail.columns.source === 3){
          fmtData.source = data.profile.columns.auctionName;
        }else if(data.detail.columns.source === 4){
          fmtData.source = '藏家';
        }
        if (data.detail.columns.note) {
          fmtData.detailNote = data.detail.columns.note;
        } else {
          fmtData.detailNote = null;
        }
        if (data.profile.columns.note) {
          var profile = data.profile.columns.note;
          profile = this.formatStr(profile);
          fmtData.profile = profile;
        } else {
          fmtData.profile = null;
        }
        if(data.video){
          this.setData({ otherAuthentication : true});
          fmtData.video = {
            poster : data.video.columns.thumb_pic_id,
            url : data.video.columns.video_res_id
          }
        }
        if (data.detail.columns.photo_res_id){
          this.setData({ otherAuthentication: true });
          fmtData.photo = data.detail.columns.photo_res_id;
        }else{
          fmtData.photo = null;
        }
        if (data.detail.columns.certified_res_id){
          this.setData({ otherAuthentication: true });
          fmtData.certified = data.detail.columns.certified_res_id;
        }else{
          fmtData.certified = null;
        }
        this.setData({ responseData : fmtData});
      },
      fail : () =>{
        wx.showModal({
          title: '错误',
          content: '网络故障，请稍后重试',
          showCancel : false
        })
      }
    })
  },
  //格式化字符串将<br/>改为\n
  formatStr : function(str){
    var result = str.replace(/<br\/>/ig, '\n');
    result = result.replace(/&nbsp;/ig, ' ');
    return result;
  },
  //计算大图认证点位置
  authPosition : function(){
    var id = this.data.id;
    var flag = this.data.isAuth;
    if(flag){
      wx.request({
        url: this.data.authUrl,
        data: {
          id: id
        },
        success: (res) => {
          var data = res.data.data;
          var thumbWidth = data.thumbnail.columns.width;
          var thumbHeight = data.thumbnail.columns.height;
          var arr = [];
          for (var i = 0; i < data.dots.length; i++) {
            var column = data.dots[i].columns;
            var obj = {};
            var ratio = ['x5', 'x15', 'x40'];
            for (var j = 0; j < ratio.length; j++) {
              if (!column[ratio[j]]) {
                obj[ratio[j]] = null;
              } else {
                obj[ratio[j]] = {
                  photo_id: column[ratio[j]].columns.photo_id,
                  offset_top: column[ratio[j]].columns.offset_top,
                  offset_left: column[ratio[j]].columns.offset_left
                }
              }
            }
            arr.push(obj);
          }
          if (thumbWidth <= thumbHeight) {
            var realHeight = this.data.imageHeight * this.data.screenWidth / 750;
            var realWidth = realHeight * thumbWidth / thumbHeight;
            var marginTop = (750 - this.data.imageHeight) / 2 * this.data.screenWidth / 750;
            var marginLeft = (750 - this.data.imageWidth) / 2 * this.data.screenWidth / 750 + (this.data.imageWidth * this.data.screenWidth / 750 - realWidth) / 2;
          } else {
            var realWidth = this.data.imageWidth * this.data.screenWidth / 750;
            var realHeight = realWidth * thumbHeight / thumbWidth;
            var marginLeft = (750 - this.data.imageWidth) / 2 * this.data.screenWidth / 750;
            var marginTop = (750 - this.data.imageHeight) / 2 * this.data.screenWidth / 750 + (this.data.imageHeight * this.data.screenWidth / 750 - realHeight) / 2;
          }
          var ratioX = realWidth / thumbWidth;
          var ratioY = realHeight / thumbHeight;
          var pointWidth = this.data.pointWidth * this.data.screenWidth / 750;
          var pointHeight = this.data.pointHeight * this.data.screenWidth / 750;
          for (var i = 0; i < arr.length; i++) {
            var left = arr[i].x15.offset_left;
            var top = arr[i].x15.offset_top;
            var keyLeft = 'left' + (i + 1);
            var keyTop = 'top' + (i + 1);
            var keyShow = 'isShow' + (i + 1);
            var setData = {};
            setData[keyLeft] = left * ratioX + marginLeft - pointWidth / 2 + 'px';
            setData[keyTop] = top * ratioY + marginTop - pointHeight + 'px';
            setData[keyShow] = true;
            this.setData(setData);
          }
        },
        fail: () => {
          wx.showModal({
            title: '错误',
            content: '网络故障，请稍后重试',
            showCancel: false
          })
        }
      })
    }
  },
  //认证微观
  micro : function(){
    var id = this.data.id;
    var flag = this.data.isAuth;
    if(flag){
      wx.request({
        url: this.data.authUrl,
        data: {
          id: id
        },
        success: (res) => {
          var data = res.data.data;
          var thumbWidth = data.thumbnail.columns.width;
          var thumbHeight = data.thumbnail.columns.height;
          this.setData({
            thumbWidth: thumbWidth + 'px',
            thumbHeight: thumbHeight + 'px'
          })
          var arr = [];
          for (var i = 0; i < data.dots.length; i++) {
            var column = data.dots[i].columns;
            var obj = {};
            var ratio = ['x5', 'x15', 'x40'];
            for (var j = 0; j < ratio.length; j++) {
              if (!column[ratio[j]]) {
                obj[ratio[j]] = null;
              } else {
                obj[ratio[j]] = {
                  photo_id: column[ratio[j]].columns.photo_id,
                  offset_top: column[ratio[j]].columns.offset_top,
                  offset_left: column[ratio[j]].columns.offset_left
                }
              }
            }
            arr.push(obj);
          }
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].x5) {
              var x5 = arr[i].x5.photo_id;
            } else {
              var x5 = null;
            }
            var x15 = arr[i].x15.photo_id;
            var x40 = arr[i].x40.photo_id;
            var left = arr[i].x15.offset_left;
            var top = arr[i].x15.offset_top;
            var keyLeft = 'mLeft' + (i + 1);
            var keyTop = 'mTop' + (i + 1);
            var setData = {};
            setData[keyLeft] = -(left - this.data.mWidth * this.data.screenWidth / 750 / 2) + 'px';
            setData[keyTop] = -(top - this.data.mHeight * this.data.screenWidth / 750 / 2) + 'px';
            var urls = this.data.mUrls;
            urls.push([x5, x15, x40]);
            setData.mUrls = urls;
            this.setData(setData);
            console.log(this.data.mUrls);
          }
        },
        fail: () => {
          wx.showModal({
            title: '错误',
            content: '网络故障，请稍后重试',
            showCancel: false
          })
        }
      })
    }
  },
  //询问调用相册权限
  useAlbum : function(){
    wx.getSetting({
      success(res){
        if (!res.authSetting['scope.writePhotosAlbum']){
          wx.authorize({
            scope: 'scope.writePhotosAlbum'
          })
        }
      }
    })
  }
})