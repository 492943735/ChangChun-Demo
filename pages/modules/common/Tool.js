/**
 * Get bounds of a dom element.
 * 
 * @param elem
 */
function getBounds(elem) {
	var offset = elem.offset();
	var w = elem.width();
	var h = elem.height();

	return {
		top : offset.top,
		left : offset.left,
		width : w,
		height : h
	};
}

/**
 * whether mouse is in a DOM element.
 * 
 * @param elem
 *            target DOM element
 * @param event
 *            mouse event
 * @returns {Boolean}
 */
function isMouseIn(elem, event) {
	var mouseX = event.clientX;
	var mouseY = event.clientY;

	return isMouseIn2(elem, mouseX, mouseY);
}

/**
 * whether mouse is in a DOM element.
 * 
 * @param elem
 *            target DOM element
 * @param mouseX
 *            the mouse x position relative to browser window.
 * @param mouseY
 *            the mouse y position relative to browser window.
 * @returns {Boolean}
 */
function isMouseIn2(elem, mouseX, mouseY) {
	var x = mouseX;
	var y = mouseY;
	var bounds = getBounds(elem);
	var top = bounds.top;
	var left = bounds.left;
	var w = bounds.width;
	var h = bounds.height;

	// mouse x position and y position whether in a dom element.
	return x > left && x < left + w && y > top && y < top + h;
}

function getMaxMinLngLat(pointsArray) {
	if(pointsArray.length == 0){
		return {
			minLng : "",
			minLat : "",
			maxLng : "",
			maxLat : ""
		};
	}
	
	var sortRule = function(a,b) {
		return a - b;
	};
	var lonArray = new Array();
	var latArray = new Array();
	var arrayLength = pointsArray.length;

	for (var i = 0; i < arrayLength; i++) {
		var index = i;
		var item = pointsArray[index];
		lonArray.push(item[0]);
		latArray.push(item[1]);
	}

	var lonMax = lonArray.sort(sortRule)[arrayLength - 1];
	var latMax = latArray.sort(sortRule)[arrayLength - 1];
	var lonMin = lonArray.sort(sortRule)[0];
	var latMin = latArray.sort(sortRule)[0];
	return {
		minLng : new String(lonMin),
		minLat : new String(latMin),
		maxLng : new String(lonMax),
		maxLat : new String(latMax)
	};
}

/**
 * Stop mouse event bubble to parent dom element.
 * @param event
 */
function stopPropagation(event) {
	if(event.stopPropagation) {
		event.stopPropagation();
	}
	else {
		event.cancelBubble = true;
	}
}

function checkIcaAreasIsSame(newVal, oldVal){
	if(newVal.length != oldVal.length) {
		return false;
	}
	for(var index in newVal) {
		if(newVal[index].text !== oldVal[index].text) {
			return false;
		}else{
			if(newVal[index].active !== oldVal[index].active){
				return false;
			}
		}
	}
	return true;
}

/**
 * whether is chrome browser.
 */
function isChromeBrowser() {
	return navigator.userAgent.indexOf("Chrome") > 0;
}

function setCookie(name, value, expires, path, domain, secure) {
	document.cookie = name + "=" + escape(value) +
		((expires) ? "; expires=" + expires : "") +
		((path) ? "; path=" + path : "") +
		((domain) ? "; domain=" + domain : "") +
		((secure) ? "; secure" : "");
}

/**
 * Chnage load cookie time.
 */
function changeLoadTime() {
	var myDate = new Date();
	setCookie("timeNum", myDate.getTime(), "", "/");
}


/**
 * 检测百分比阈值合法性
 * @param index
 * @param thresholdData
 * @returns
 */
function checkThresholdDataCombinationTool(index, thresholdData){
	if(thresholdData.rangeType == "0"){
		if(index != thresholdData.colorList.length - 1){
			var item = thresholdData.colorList[index];
			if(!item.minIndicatorVal || !item.maxIndicatorVal){
				return false;
			}
			if(item.minIndicatorVal == item.maxIndicatorVal){
				return false;
			}
		}
	}
	return true;
}

/**
 * 转译特殊字符, '<' => '&lt', '>' => '&gt'
 */
function parseSpecificChar(val) {
	val = val.replace(/</g, "&lt;");
	val = val.replace(/>/g, "&gt;");
	
	return val;
}

/**
 * 替换特殊字符
 */
function formatSpecificChar(val){ 
	val = val.replace(/&lt;/g, "<");	
	val = val.replace(/&gt;/g, ">");
	
	return val;	
}

/**
 * 判断两字符串是否相等，不区分大小写
 */
function isEqualIgnoreCase(str1, str2) {
	if(typeof(str1) !== "string" || typeof(str2) !== "string") {
		return false;
	}
	
	return str1.toUpperCase() === str2.toUpperCase();
}

function resetAccessData(accessData){
	for(var i = 0;i<accessData.length;i++){
		var accessItem = accessData[i];
		accessItem.checked =  i == 0;
		accessItem.checkedType = "i18n.access.all";
		accessItem.multiSelected = false;
		accessItem.listShow = false;
		if(accessItem.data.length == 0){
			accessItem.checkedType = "i18n.access.none";
		}
        for(var j = 0;j<accessItem.data.length;j++){
        	var frequencyItem = accessItem.data[j];
        	frequencyItem.checked = true;
        }
	}
}

function accessDataSame(oldData, newData){
	var isSame = true;
	isSame = accessSame(oldData, newData);
	if(isSame){
		for(var i = 0 ; i < oldData.length;i++){
			var oldItem = oldData[i];
			var newItem = newData[i];
			for(var j = 0 ; j < oldItem.data.length ; j++){
				var frequencyOldItem = oldItem.data[j];
				var frequencyNewItem = newItem.data[j];
				if(frequencyOldItem.checked != frequencyNewItem.checked){
					return false;
				}
			}
		}
	}
	return isSame;
}

function accessSame(oldData, newData){
	var isSame = true;
	for(var i = 0 ; i < oldData.length;i++){
		var oldItem = oldData[i];
		var newItem = newData[i];
		if(oldItem.checked !=  newItem.checked){
			return false;
		}
	}
	return isSame;
}

function generateLocationMarkData(){
	var imagePath = requestContext + "../pages/images/";
	var result = [];
	var mathRandom = Math.random();
	for(var i =0;i<locationMarkConfig.markInfo.length;i++){
		var item = locationMarkConfig.markInfo[i];
		var itemCopy = locationMarkConfigCopy.markInfo[i];
		var obj = {
			markName : item.mark_name,
			locationMark : item.location_mark,
			visualLevel : item.visual_level,
			checked : false,
			legendSize : item.legend_size,
			markImage :imagePath+itemCopy.markDatas,
			parentId :item.parentId,
			popWindow:item.popWindow
		};
		result.push(obj);
	}
	return result;
}

function filterStoryLocationMark(storyLocationMark){
	var baseResult = generateLocationMarkData();
	if(null == storyLocationMark || undefined == storyLocationMark){
		return angular.toJson(baseResult);
	}
	
	var storyMark = angular.fromJson(storyLocationMark);
	var newStoryMark = [];
	storyMark.forEach(function(value, index, array){
		var find = false;
		for(var i = 0;i<baseResult.length;i++){
			var baseItem = baseResult[i];
			if(baseItem.locationMark == value.locationMark){
				find = true;
			}
		}
		if(find){
			newStoryMark.push(value);
		}
	});
	return angular.toJson(newStoryMark);
}

function resetLocationMarkData(locationMarkData){
	for(var i =0;i<locationMarkData.length;i++){
		var item = locationMarkData[i];
		item.checked = false;
	}
}

function findLocationMarkDataIcon(locationMark){
	for(var i =0;i<locationMarkConfig.markInfo.length;i++){
		var item = locationMarkConfig.markInfo[i];
		if(item.location_mark == locationMark){
			return item.markDatas;
		}
	}
}

function checkLocationSame(locationNew, locationOld){
	for(var i =0;i<locationNew.length;i++){
		if(locationNew[i].checked != locationOld[i].checked){
			return false;
		}
	}
	return true;
}

function isNotNull(str){
	if(str === null || str === "null" || str === "" || str === undefined) {
		return false;
	}else {
		return true;
	}
}

function getLayerzIndex(locationMark, mapLayerCategory){

	var locationMarkLayerConfig =[
{"mapLayerId": "null", "mapLayerCat": "1", "mapLayerOrder": "0"},
{"mapLayerId": "null", "mapLayerCat": "0", "mapLayerOrder": "1"},
{"mapLayerId": "2", "mapLayerCat": "2", "mapLayerOrder": "2"},
{"mapLayerId": "1", "mapLayerCat": "2", "mapLayerOrder": "3"},
{"mapLayerId": "3", "mapLayerCat": "2", "mapLayerOrder": "4"},
{"mapLayerId": "4", "mapLayerCat": "2", "mapLayerOrder": "5"},
];
	for(var i =0;i<locationMarkLayerConfig.length;i++){
		var item = locationMarkLayerConfig[i];
		if(isNotNull(mapLayerCategory)){
			if(item.mapLayerCat == mapLayerCategory){
				return item.mapLayerOrder;
			}
		} 
		if(item.mapLayerId == locationMark){
			return item.mapLayerOrder;
		}
	}
}

function checkTotalLocationNumIlegal(mapModel){
	if(maxLocationMarkNum <= 0){
		return true;
	}
	var defaultParams = mapModel.params;
	var maxShowLevel = Number(defaultParams.mapMaxZoom);
	var minShowLevel = Number(defaultParams.mapMinZoom);
	var extent = mapModel.gisMap.getMapExtent();
	var mapZoom = mapModel.gisMap.currentZoom;
	var total = 0;
	for(var i = 0;i<mapModel.gisMap.locationData.length;i++){
		var item = mapModel.gisMap.locationData[i];
		var visualLevel = Number(item.visualLevel);
		if(visualLevel < minShowLevel || visualLevel > maxShowLevel || mapZoom < visualLevel){
			continue;
		}
		if(item.checked){
			var markDatas = findLocationMarkDataIcon(item.locationMark);
			for(var j = 0;j<markDatas.length;j++){
				var markDataItem = markDatas[j];
				if(markItemInExtent(extent, markDataItem)){
					total++;
				}
			}
		}
	}
	return maxLocationMarkNum > total;
}

function markItemInExtent(extent, markDataItem){
	var itemXpos = Number(markDataItem.xpos);
	var itemYpos = Number(markDataItem.ypos);
	return itemXpos > extent[0] && itemXpos < extent[2]
	&& itemYpos > extent[1] && itemYpos < extent[3];
}

function changeFiveMinUserIndicator(mapModel, icas){
	var indicator = icas.indicator;
	if(mapModel.gisMap.queryInterval == "300"){
		if (Constant.SUBS_NUM == indicator
                || Constant.SUBS_NUM_ROAMING == indicator)
        {
			indicator = Constant.FIVE_MIN_INDACTOR;
        }
        if (Constant.SUBS_NUM_VOLTE == indicator)
        {
        	indicator = Constant.FIVE_MIN_VOLTE_INDACTOR;
        }
	}
	return indicator;
}

function unableIcasByFiveMin(data, queryInterval){
	if(queryInterval == "300"){
		for(var i in data){
			var tabItemContent = data[i].content;
			var qualityIcas = tabItemContent.qualityIcas;
			for(var j in qualityIcas){
				var qualityItem = qualityIcas[j];
				unableIcas(queryInterval, qualityItem);
			}
		}
	}
}

function unableIcas(queryInterval, icas){
	if(queryInterval == "300"){
		var indicator = icas.indicator;
		if(indicator == "HDI_METADATA_GRP_DOWNLOAD_THROUGHPUT" ||
				indicator == "HDI_METADATA_PRB_UTILIZATION"||
				indicator == "HDI_METADATA_GRP_RSRP"||
				indicator == "HDI_METADATA_GRP_RSRQ"){
			icas.unable = true;
		}
	}
}

// 时间日期格式化
function dateFormatByFmtstr(formatStr, date){
	var regModel = {
		"M+" : date.getMonth() + 1, //月份   
		"d+" : date.getDate(), //日   
		"h+" : date.getHours(), //小时   
		"m+" : date.getMinutes(), //分   
		"s+" : date.getSeconds(), //秒   
		"q+" : Math.floor((date.getMonth() + 3) / 3), //季度   
		"S" : date.getMilliseconds() //毫秒   
	};
	if(/(y+)/.test(formatStr))
	{
		formatStr = formatStr.replace(RegExp.$1, (date.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	}
	for(var regKey in regModel)
	{
		if (new RegExp("(" + regKey + ")").test(formatStr))
		{
			formatStr = formatStr.replace(RegExp.$1, (RegExp.$1.length == 1) ? (regModel[regKey])
					: (("00" + regModel[regKey]).substr(("" + regModel[regKey]).length)));
		}
	}
	return formatStr;
}

//格式化默认阈值颜色
function formatThresholdColor(color){
	var colorArry = color.split(",");
	if(colorArry[2] == "255"){
		colorArry[2] = "254";
	}else{
		colorArry[2] = Number(colorArry[2]) + 1;
	}
	return colorArry.toString();
}

//获取区域选中的数据
function getRegionalData() {}

//缓存区域数据
var postRegionalPublic = getRegionalData();

//图层中是否有区域图层
fcObjectList = false;
fcObjectListLast = false;