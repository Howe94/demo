/**
 *自动填充用户默认数据
 */
function autoFillUserDate(subWeb) {
	var autoFillList = '[{"NAME":"广东省食品药品监督管理局政务服务中心"},{"ORG_CODE":"441881199209170218"},{"E_MAIL":"-1"},{"MOBILE_PHONE":"15521041848"},{"PAPER_TYPE":"50"},{"PAPER_CODE":"441881199209170218"},{"HANDLER_ID":"10"},{"CURRENCY_ID":"0"},{"DWMCBGX":"广东省食品药品监督管理局政务服务中心"},{"SBDW":"广东省食品药品监督管理局政务服务中心"}]';
	if(!isNull(autoFillList)) {
		autoFillList = $.parseJSON(autoFillList);
		for(var i = 0; i < autoFillList.length; i++) {
			var isNeedMap = autoFillList[i];
			for(var key in isNeedMap) {
				if(subWeb.getElementsByName(key).length > 0) {
					var htmlNOList = subWeb.getElementsByName(key).length;
					for(var j = 0; j < htmlNOList; j++) {
						if(isNull(subWeb.getElementsByName(key)[j].value)) {
							subWeb.getElementsByName(key)[j].value = isNeedMap[key];
						}
					}
				}
			}
		}
	}
}