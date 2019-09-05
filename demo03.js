    
    exports={index: function (req, res) {
        var first = req.query.first;
        //预约大厅配置
        var defaultHref = config.defaultHref;
        var areaCode = config.areaCode;
        var hallSeq = config.hallSeq;
        var areaAndHall = config.areaAndHall;
        var busAndHallandUnit = config.busAndHallandUnit;
        var orderVal = [defaultHref, areaCode, hallSeq, areaAndHall, busAndHallandUnit]
        var orderModel = null; //配置哪一种预约模式
        var orderOptionVal = null; //配置当前预约模式的参数值
        for (var i = 0; i < orderVal.length; i++) {
            (function (e) {
                if (orderVal[e]) {
                    orderOptionVal = orderVal[e];
                    orderModel = e;
                }
            })(i)
        }
        if (orderModel == null) {
            orderModel = 0;
        }
        var href = '/UnifiedReporting/order/orderUnit';
        //拼接预约模式的参数
        var orderFunc = {
            0: function () {
                href = href;
                return href;
            },
            1: function () {
                href = href + '?areaCode=' + orderOptionVal;
                return href;
            },
            2: function () {
                href = href + '?hallSeq=' + orderOptionVal;
                return href;
            },
            3: function () {
                var parmArr = orderOptionVal.split("/");
                href = href + '?hallSeq=' + parmArr[0] + '&unitSeq=' + parmArr[1];
                return href;
            },
            4: function () {
                var parmArr = orderOptionVal.split("/");
                href = href + '?businnessname=' + parmArr[0] + '&hallSeq=' + parmArr[1] + '&unitSeq=' + parmArr[2];
                return href;
            }
        }
        orderFunc[orderModel]();

        affairs_model.outUserInfoQuery({
            userCode: req.session.info.userCode
        }).done(function (userInfo) {
            var userInfo = JSON.parse(userInfo).status == 200 ? JSON.parse(userInfo) : "error";
            if(userInfo!='error'){
                var flag = false;
                if(userInfo.data.userInfo.isReal == 1 && userInfo.data.userType == 2 ){
                   flag =true;
                }
                affairs_model.getControlProgressList({
                    userCode: req.session.info.userCode,
                    controlStatus: "all",
                    cardType:flag == true ?userInfo.data.userInfo.paperType:'',//企业证件类型
                    cardId:flag == true ?userInfo.data.userInfo.paperCode:'',//统一社会信用代码、组织机构代码等等
                }).getControlProgressList({
                    userCode: req.session.info.userCode,
                    controlStatus: "end",
                    cardType:flag == true ?userInfo.data.userInfo.paperType:'',
                    cardId:flag == true ?userInfo.data.userInfo.paperCode:'',
                }).getControlProgressList({
                    userCode: req.session.info.userCode,
                    controlStatus: "draft",
                    cardType:flag == true ?userInfo.data.userInfo.paperType:'',
                    cardId:flag == true ?userInfo.data.userInfo.paperCode:'',
                }).getControlProgressList({
                    userCode: req.session.info.userCode,
                    controlStatus: 'apply',
                    pageRowNum: '5',
                    cardType:flag == true ?userInfo.data.userInfo.paperType:'',
                    cardId:flag == true ?userInfo.data.userInfo.paperCode:'',
                }).done(function (alldata, enddata, draftdata, dataing) {
                    var alldata = JSON.parse(alldata).status == 200 ? JSON.parse(alldata) : "error";
                    var enddata = JSON.parse(enddata).status == 200 ? JSON.parse(enddata) : "error";
                    var draftdata = JSON.parse(draftdata).status == 200 ? JSON.parse(draftdata) : "error";
                    var dataing = JSON.parse(dataing).status == 200 ? JSON.parse(dataing) : "error";
                
                    req.session.user = userInfo.data.userInfo;
                    var accessToken = config.area == 'base'?req.session.info.accessToken:'';
                    if (dataing != "error") {
                        for (var i = 0, count = dataing.data.dataList.length; i < count; i++) {
                            var data = dataing.data.dataList[i];
                            data.user_code = req.session.info.userCode;
                            data.applyDate = data.beginDate ? baseMethod.method.date(data.beginDate) : data.announceFinishTime;
                            data.operateBtns = baseMethod.method.operateBtn(data.approveStatus, data, "", "", req.session.info.userCode,'',accessToken);
                            data.approveDesc = baseMethod.method.approveDesc(data.approveStatus, data);
                            data.approveStatusDesc = baseMethod.method.statusName(data.approveStatus, data);
                        }
                        res.render('pc/affairs/index', {
                            title: '我的事务首页',
                            current: 'affairs',
                            childNodes: {
                                first_curr: 'index',
                                first: first
                            },
                            data: {
                                alldata: alldata.data.pageObj.totalRow,
                                enddata: enddata.data.pageObj.totalRow,
                                draftdata: draftdata.data.pageObj.totalRow,
                                dataing: dataing.data,
                                config_area: config.area
                            },
                            userInfo: {
                                userCode: req.session.info.userCode, //用户账号
                                userType: req.session.info.userType, //用户类型 1 个人用户 2 单位用户
                                data: userInfo.data.userInfo //用户信息
                            },
                            terminal: req.session.terminal, //终端机进入页面隐藏头尾
                            orderHref: href,
                            modules: MyAffairs.getArea(userInfo.data.userInfo.uType)
                        });
                    } else {
                        console.log("获取某个用户办件进度信息接口报错");
                        console.log(JSON.parse(dataing));
                    }
                })
            }
        })
    }
}