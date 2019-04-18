angular.module("main").factory("storyLineService", ["$q", "$http", "RightSidebarService", "TabService",
    "MenubarService", "LeftService", "gisMapService", "SettingService", "tipWindow","$rootScope", "loadingInterceptor",
    function($q, $http, RightSidebarService, TabService, MenubarService, LeftService, gisMapService, SettingService, tipWindow, $rootScope, loadingInterceptor)
{
	var storyData = {storyLine: {}, oldStoryName: "", isEdit: false, copyData: null};
	var openData = {storyList: []};
	var scenarioData = {data: null, showflag: false};
	var deleteStoryBtn = {actived: false};
	
	/**
	 * 初始化save故事线模板数据
	 */
	function initSaveData() {
		var storyLine = storyData.storyLine;
		// 获取频段信息
		var accessData = gisMapService.getActivedMapModel().gisMap.accessData;
		// 获取阈值信息
		var thresholdData = gisMapService.getActiveMapThresholdDatas(); 
		
		storyLine.storyBase = {
				storyName: "", 
				authType: 1, 
				bandSatus: accessData, 
				thresholdSatus: thresholdData,
				renderDiscoveryIndicatorByCell : renderDiscoveryIndicatorByCell
				};
		storyLine.summary = {title: "", conclusion: "", suggestion: ""};
		storyLine.filters = [];
		storyLine.storyLabelStatus = {};
		storyLine.special = false;
		//多边形
		storyLine.polygon = JSON.stringify(gisMapService.getActivedMapModel().gisMap.polygonData);
		storyLine.locationMark = JSON.stringify(gisMapService.getActivedMapModel().gisMap.locationData);
	}
	
	/**
	 * 初始化edit故事线模板数据
	 */
	function initEditData(callBack, needRefreshMap) {
		var storyLine = storyData.storyLine;
		var activeTab = TabService.getActiveTab();
		storyLine.filters = [];
		storyLine.storyLabelStatus = {};
		storyData.oldStoryName = activeTab.item.text;
		var storyName=activeTab.item.text;
		var storyLineData={"summary":{"storyName":storyName,"title":storyName,"conclusion":"{CellInfo}cells:The traffic load is very high, busy hour PRB Utilization exceeded 80%.","suggestion":"Expand the capacity. The high value (&gt;=20KD)users experience bad Youtube quality(Video Download Throughput&lt;3Mbps ) due to the heavy traffic load.","canExport":false},"filters":[],"storyLabelStatus":{"storyName":storyName,"userLabel":"High Value","appLabel":"YouTube","kqiLabel":"HDI_METADATA_GRP_VIDEO_DOWNLOAD_THROUGHPUT","activeLabel":"HDI_METADATA_GRP_VIDEO_DOWNLOAD_THROUGHPUT","userLabels":"All Users,High Value,Low Value,WifiRouter,SmartPhone,Roaming,VoLTE","appLabels":"YouTube,Instagram,Facebook,WhatsApp,SnapChat,Twitter,Total Traffic","kqiLabels":"HDI_METADATA_GRP_VIDEO_DOWNLOAD_THROUGHPUT,HDI_METADATA_GRP_DOWNLOAD_THROUGHPUT,HDI_METADATA_GRP_DOWNLINK_RTT_DELAY,HDI_METADATA_PRB_UTILIZATION,HDI_METADATA_GRP_DOWNLINK_LOSS_PACKET_RATE,HDI_METADATA_GRP_RSRP,HDI_METADATA_GRP_UPLINK_LOSS_PACKET_RATE,HDI_METADATA_GRP_RSRQ,HDI_METADATA_GRP_VOLTE_CONNECTION_RATE,HDI_METADATA_GRP_VOLTE_CONNECTION_DELAY,HDI_METADATA_GRP_VOLTE_CALL_DROP_RATE,HDI_METADATA_GRP_VOLTE_MOS,HDI_METADATA_GRP_VOLTE_TRAFFIC"},"storyBase":{"storyName":"Capacity","authType":0,"bandSatus":"[{\"bandWidthNum\":800,\"checked\":true},{\"bandWidthNum\":1800,\"checked\":true},{\"bandWidthNum\":2100,\"checked\":true},{\"bandWidthNum\":2600,\"checked\":true}]","thresholdSatus":"{\"rangeType\":\"1\",\"colorList\":[{\"minVal\":\"0\",\"maxVal\":\"999999999\",\"colorVal\":\"#ce0404\",\"checked\":true,\"showColorDig\":false},{\"minVal\":\"999999999\",\"maxVal\":\"999999999999999\",\"colorVal\":\"#853882\",\"checked\":true,\"showColorDig\":false}]}","createdUserId":"6","order":0,"selected":false,"renderDiscoveryIndicatorByCell":"false","myStory":false},"special":true};	

			storyLine.storyBase = storyLineData.storyBase;
			storyLine.summary = storyLineData.summary;
			storyLine.special = storyLineData.special;
			var mapModel = gisMapService.getActivedMapModel();
			var storyLineAccessData = angular.fromJson(storyLine.storyBase.bandSatus);
			try{
				for(var i = 0;i<storyLineAccessData.length;i++){
					var accessItem = storyLineAccessData[i];
					if(accessItem.access == null){
						throw new Error("old bandWidthData error");
					}
				}
				mapModel.gisMap.accessData = storyLineAccessData;
			}catch(e){
				mapModel.gisMap.accessData = angular.copy(accessData);
			}
			LeftService.setAccessData(mapModel);
			
			formatSummaryInfo(storyLine.summary);
			//设置故事线保存的多边形
			var polygon = angular.fromJson(storyLineData.polygon);
			gisMapService.addActiveMapLocationMark();
			LeftService.setLocationData(mapModel);
			LeftService.updateLocationBtn();
			
			//给左侧栏设置阈值
			gisMapService.setActiveMapThresholdDatas(angular.fromJson(storyLine.storyBase.thresholdSatus), activeTab, true);
			if(callBack){
				
				callBack();
			}
		//});
	}
	
	/**
	 * 替换转译后的字符为正确的字符
	 */
	function formatSummaryInfo(summary) {
		summary.conclusion = formatSpecificChar(summary.conclusion);
		summary.suggestion = formatSpecificChar(summary.suggestion);
	}
	
	/**
	 * 添加故事线
	 */
	function addStoryLine() {
		// 1.设置labelStatus信息
		var selectedLabels = RightSidebarService.getIcaAreas();
		var labelStatus = storyData.storyLine.storyLabelStatus;
		//判断是否是vvip单用户
		var  hasVvip = RightSidebarService.hasVvipIca();
		var vvipData = gisMapService.getActivedMapModel().vvipDataModel;
		// 1.1获取右侧栏有哪些签，激活签
		for(var index in selectedLabels) {
			var label = selectedLabels[index];
			if(label.type === LabelType.USER) {
				labelStatus.userLabel = label.text;
				//如果是vvip单用户，拼接单用户名称
				if(hasVvip && vvipData.data && vvipData.data != "") {
					labelStatus.userLabel = label.text + "&" + vvipData.allVvipDatas[vvipData.data];
			    }
			}
			else if(label.type === LabelType.APP) {
				labelStatus.appLabel = label.text;
			}
			else {
				labelStatus.kqiLabel = label.text;
			}
			
			if(label.active) {
				labelStatus.activeLabel = label.text;
			}
		}
		
		// 1.2获取控制台上有哪些标签
		var userLabels = TabService.getIcasInActivedTabByType(LabelType.USER);
		var appLabels = TabService.getIcasInActivedTabByType(LabelType.APP);
		var kqiLabels = TabService.getIcasInActivedTabByType(LabelType.KQI);
		labelStatus.userLabels = getLabelsIdStr(userLabels);
		labelStatus.appLabels = getLabelsIdStr(appLabels);
		labelStatus.kqiLabels = getLabelsIdStr(kqiLabels);
		
		//summary
		var summary = storyData.storyLine.summary;
		summary.conclusion = parseSpecificChar(summary.conclusion);
		summary.suggestion = parseSpecificChar(summary.suggestion);
		return $http.post("storyLine/addStoryLine.action", {
			params: angular.toJson(storyData.storyLine)
		});
	}
	
	/**
	 * 编辑故事线模板
	 */
	function editStoryLine() {
		// 获取频段信息
		var accessData = gisMapService.getActivedMapModel().gisMap.accessData;
		// 获取阈值信息
		var thresholdData = gisMapService.getActiveMapThresholdDatas(); 
		var storyBase = storyData.storyLine.storyBase;
		storyBase.bandSatus = accessData;
		storyBase.thresholdSatus = thresholdData;
		
		//summary
		var summary = storyData.storyLine.summary;
		summary.conclusion = parseSpecificChar(summary.conclusion);
		summary.suggestion = parseSpecificChar(summary.suggestion);
		//多边形
		storyData.storyLine.polygon = JSON.stringify(gisMapService.getActivedMapModel().gisMap.polygonData);
		storyData.storyLine.locationMark = JSON.stringify(gisMapService.getActivedMapModel().gisMap.locationData);
		return $http.post("storyLine/updateStoryLine.action", {
			storyLine: angular.toJson(storyData.storyLine),
			oldStoryName: storyData.oldStoryName
		});
	}
	
	function getLabelsIdStr(labels) {
		var idStr = "";
		
		for(var index in labels) {
			idStr = idStr + "'" + labels[index].text + "',"
		}
		
		if(idStr.indexOf(",") != -1) {
			idStr = idStr.substring(0, idStr.length - 1);
		}
		
		return idStr;
	}
	
	/**
	 * 更新故事线名称
	 */
	function updateStoryLineName(storyLineName, oldName) {
		if(storyLineName === oldName) {
			return;
		}
		
		$http({
			method : 'post',
			url : 'storyLine/renameStoryLine.action',
			data : {newname : storyLineName, oldname : oldName}
		});	
	}
	
	/**
	 * 查询当前用户下所有故事线
	 */
	function loadUserAllStoryLine() {
		var response={"data":{"state":"0","errMsg":null,"data":[{"storyBase":{"storyName":"10.26","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"11","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"1120vvip","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"1120vvip02","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"123xptest","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"1vvip","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"22","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"2GALL接入网3标签","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"2gnone","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"2gpartial","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"3","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"33","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"3G","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"3G+双标签","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"3各标签带位置","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"3标签地理化","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"4","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"4Gpartial","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"5559","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"C29deguo001","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"LTE","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"Test Polygon","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"VvipGroup","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"XXXXXXXXXXXX","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"c29003deguo","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":2,"selected":true,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"c29deguo002","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":1,"selected":true,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"chibang","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"eeee","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"gg","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"ggg","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"gh","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"hh","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"hmlvvip","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"hmlvvip01","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"lt","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"special1","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"terst","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"test","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"test1111","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"vvip1","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"vvip1116","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"vvip1117","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"weizhibiaoshi","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"xp1","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"xpvvip","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"xupei001geren","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"xupei001gonggong","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"位置标识1","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"故事线01","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"故事线hml","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"故事线阈值","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"无接入网选择","authType":1,"bandSatus":null,"thresholdSatus":null,"createdUserId":"16","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":true,"belongMyStory":true},{"storyBase":{"storyName":"55555","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"17","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":false,"belongMyStory":false},{"storyBase":{"storyName":"Capacity","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"6","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":false,"belongMyStory":false},{"storyBase":{"storyName":"Coverage","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"6","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":false,"belongMyStory":false},{"storyBase":{"storyName":"FUP","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"6","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":false,"belongMyStory":false},{"storyBase":{"storyName":"baifenbi1","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"17","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":false,"belongMyStory":false},{"storyBase":{"storyName":"jj","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"ly","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":false,"belongMyStory":false},{"storyBase":{"storyName":"绝对阈值预览保存故事线","authType":0,"bandSatus":null,"thresholdSatus":null,"createdUserId":"17","order":-1,"selected":false,"renderDiscoveryIndicatorByCell":null,"myStory":false},"canDelete":false,"belongMyStory":false}]},"status":200,"config":{"method":"POST","transformRequest":[null],"transformResponse":[null],"jsonpCallbackParam":"callback","url":"/HDI_UI/storyLine/getUserAllStory.action","headers":{"Accept":"application/json, text/plain, */*","X-CSRF-TOKEN":"2e26d608-6d2b-47db-ab17-978b6e42fd54"}},"statusText":"OK"};
		var storyList = response.data.data;
			
			for (var j = 0; j < storyList.length; j++){
				var storyBase = storyList[j].storyBase;
				storyBase.selected = TabService.existStory(storyBase.storyName);
			}
			
			openData.storyList = storyList;
	}
	
	/**
	 * 保存要显示的故事线
	 */
	function saveUserShowStory() {
		var data = openData.storyList;
		
		for (var i = openData.storyList.length -1 ; i >= 0; --i) {
			if (!openData.storyList[i].storyBase.selected) {
				openData.storyList.splice(i, 1);
			}
		}
		
		return $http.post("storyLine/saveUserShowStory.action", {data : JSON.stringify(data)});
	}
	
	/**
	 * 是否显示故事线模板保存/编辑界面
	 */
	function isShowUI() {
		return MenubarService.saveImg.isActive;
	}
	
	/**
	 * 隐藏故事线添加、编译界面
	 */
	function hideUI() {
		RightSidebarService.eventEnable.dragLabel = true;
		RightSidebarService.eventEnable.clickLabel = true
		MenubarService.saveImg.isActive = false;
	}
	
	/**
	 * 是否是编辑故事线状态
	 */
	function isEdit() {
		return storyData.isEdit;
	}
	
	/**
	 * 显示编辑界面
	 */
	function showEditUI(storyName) {
		initEditData(function(){
			
		}, true);
	}
	
	/**
	 * 在open列表中删除故事线
	 */
	function deleteCreatedUserStory(index, storyLine, selecteMap) {
		var data = JSON.stringify(storyLine.storyBase);
		
		$http.post("storyLine/deleteStoryLine.action", {data : data}).then(function(response) {
			if(response.data.state === "0") {
				for (var i = 0; i < selecteMap.length; ++i) {
					// 只有删除的故事线时控制台显示的故事线才需要刷新控制台，否则不需要。
					if (selecteMap[i].storyName === openData.storyList[index].storyBase.storyName) {
						selecteMap.splice(i, 1);
						TabService.refreshData();
						break;
					}
				}
				openData.storyList.splice(index, 1);				
			} else {
				var errMsg = response.data.errMsg;
				tipWindow.show(true, true, false, errMsg, null);
			}
		});
	}
	
	/**
	 * 获取公告栏显示信息
	 */
	function loadScenarioData() {
		var resultdata=[];
			var resultdata=cfg_business_lebel_data;
			if(!TabService.isDiyTabActived()) {	
			var storyName = TabService.getActiveTab().item.text;
			var mapModel = gisMapService.getActivedMapModel();
			var queryParams = mapModel.gisMap.getQueryParams();
				for(var i=0;i<resultdata.length;i++){
					if(storyName==resultdata[i][0]){
						if (resultdata[i][3] == "1") {
							var flag = true;
						}else{
							var flag = false;
						}
						scenarioData.data ={
												"storyName":resultdata[i][0],
												"title":resultdata[i][0],
												"conclusion":resultdata[i][1],
												"suggestion":resultdata[i][2],
												"canExport":flag
											};
											
						break;
					}
				}

				if(scenarioData.data.conclusion!=""){
				    var alertWatch = $rootScope.$watch(function() {
						return loadingInterceptor.getloadingCount();
					}, function(newVal, oldVal) {						
							scenarioData.showflag = true;
							alertWatch();
						
					});
				}
			
				}
		
	}
	
	function getScenarioData() {
		return scenarioData;
	}
	
	/**
	 * 是否有编辑故事线的权限
	 */
	function hasEditAuth(storyName, callback) {
		$http.post("storyLine/hasEditStoryLineAuth.action", {storyName: storyName}).then(function(response) {
			callback(response.data.data);
		});
	}
	
	/**
	 * 保存故事线阈值
	 */
	function saveStoryThreshold(threshold){
		var deferred = $q.defer();
		$http({
			method : 'POST',
			url : "/storyLine/updateThreshold.action",
			dataType : "json",
			data : {
				storyName : TabService.getActiveTab().item.text,
				threshold : JSON.stringify(threshold),
				renderDiscoveryIndicatorByCell : renderDiscoveryIndicatorByCell
			},
			async : true,
			cache : false,
			contentType : "application/json;charset=utf-8"
		}).then(function success(responseData) {
			deferred.resolve();
		});
		return deferred.promise;
	}
	
	/**
	 * 进入故事线编辑界面需要copy故事线信息，在cancel时还原
	 */
	function copyStoryData() {
		storyData.copyData = angular.copy(storyData.storyLine);
	}
	
	/**
	 * 点击cancel按钮时还原故事线数据
	 */
	function recoveryStoryData() {
		storyData.storyLine.storyBase = storyData.copyData.storyBase;
		storyData.storyLine.summary = storyData.copyData.summary;
	}
	
	return {
		storyData: storyData,
		openData: openData,
		initSaveData: initSaveData,
		initEditData: initEditData,
		isShowUI: isShowUI,
		isEdit: isEdit,
		showEditUI: showEditUI,
		hideUI: hideUI,
		addStoryLine: addStoryLine,
		editStoryLine: editStoryLine,
		loadUserAllStoryLine: loadUserAllStoryLine,
		saveUserShowStory: saveUserShowStory,
		updateStoryLineName: updateStoryLineName,
		deleteStoryBtn: deleteStoryBtn,
		deleteCreatedUserStory: deleteCreatedUserStory,
		getScenarioData: getScenarioData,
		loadScenarioData: loadScenarioData,
		hasEditAuth: hasEditAuth,
		saveStoryThreshold : saveStoryThreshold,
		copyStoryData: copyStoryData,
		recoveryStoryData: recoveryStoryData
	};
}]);