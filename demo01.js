// 技能人才竞赛配套奖励 --start
$(function () {
    $('body input[name="GZDWTYSHXYDM"]').blur(function () { //输送类统一社会信用代码
        var credNum = $('body input[name="GZDWTYSHXYDM"]').val();
        var SFZH = $('body input[name="SFZH"]').val();
        var ret = judgeTYXYDM(credNum);
        if (ret) {
            if (SFZH) {
                var dataResult = checkEnterprise(SFZH, credNum)
                if (+dataResult.validate != 1) {
                    promptAlert(dataResult.tips)
                }
            }
        }
    })

})

function judgeTYXYDM(credNum) { //校验统一信用代码
    var ret = false;
    if (credNum.length == 18) {
        var reg = /^([0-9ABCDEFGHJKLMNPQRTUWXY]{2})([0-9]{6})([0-9A-Z]{8})([0-9|X]{1})([0-9ABCDEFGHJKLMNPQRTUWXY]{1})$/;
        if (reg.test(credNum)) {
            var str = '0123456789ABCDEFGHJKLMNPQRTUWXY';
            var ws = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];
            var sum = 0;
            for (var i = 0; i < 17; i++) {
                sum += str.indexOf(credNum.charAt(i)) * ws[i];
            }
            var c18 = 31 - (sum % 31);
            if (c18 == 31) {
                c18 = '0';
            }

            if (str.charAt(c18) == credNum.charAt(17)) {
                ret = true;
            }
        }
    }
    return ret;
}
function PGetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.parent.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
function checkEnterprise(custCardId, credNum) { //判断企业单位是否是黄埔区
    var result = "";
    $.ajax({
        url: '/CommonServiceSpecial/api/talent/checkEnterprise.v',
        dataType: 'json',
        type: 'GET',
        data: {
            approveSeq: PGetQueryString("approveSeq"),
            typeId: PGetQueryString("typeId") || "",
            custCardId: custCardId,
            creCode: credNum
        },
        async: false,
        success: function (data) {
            console.log("判断企业单位是否是黄埔区:", data);
            result = data.data
        },
        error: function (data) {
            console.log(data);
            ret = false
        }
    });
    return result;
}
function getBeforeNYear(startdate, beforeYear) {
    var expriedYear = parseInt(startdate.substring(0, 4)) - beforeYear;
    var expriedMonth = startdate.substring(4, 6);
    var expriedDay = startdate.substring(6);
    //考虑二月份场景，若N年后的二月份日期大于该年的二月份的最后一天，则取该年二月份最后一天
    if (expriedMonth == '02' || expriedMonth == 2) {
        var monthEndDate = new Date(expriedYear, expriedMonth, 0).getDate();
        if (parseInt(expriedDay) > monthEndDate) {//为月底时间
            //取两年后的二月份最后一天
            expriedDay = monthEndDate;
        }
    }
    return expriedYear + expriedMonth + expriedDay;
}
function isSubFormFullWith() {
    //证书日期判断是否超过一年
    var now = new Date();
    var time1 = now.getFullYear() + "-" + ((now.getMonth() + 1) < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();//当前时间
    var time2 = $('input[name=RYZSHFRQ]').val();//选择时间

    var beforeYear = getBeforeNYear(time1, 1)
    if (time2 > time1 || time2 < beforeYear) {
        $('input[name=RYZSHFRQ]').addClass('error-field')
        promptAlert("学员需在拿到证书一年内提交补贴申请", null, null, null, 2);
    } else {
        $('input[name=RYZSHFRQ]').removeClass('error-field')
    }

    //输送类统一社会信用代码

    var SFZH = $('body input[name="SFZH"]').val();
    if (credNum) {
        var ret = judgeTYXYDM(credNum);
        if (ret) {
            var dataResult = checkEnterprise(SFZH, credNum)
            if (+dataResult.validate != 1) {
                promptAlert(dataResult.tips)
                return false;
            }
        }
    }

    //校验工作单位
    var GZDW = $('body input[name="GZDW"]').val();
    if (SFZH && GZDW) {
        $.ajax({
            url: '/CommonServiceSpecial/api/talent/checkEnterpriseSocial.v',
            type: 'post',
            dataType: 'json',
            data: {
                cardNum: SFZH,//身份证号码
                enterpriseName: GZDW
            },
            success: function (data) {
                if (data.status == '200') {
                    if (data.data.validate != '1') {
                        promptAlert(data.data.tips);
                        return false;
                    }
                } else {
                    promptAlert(data.desc);
                }

            }
        })
    }

    return true;
}
// 技能人才竞赛配套奖励 --end