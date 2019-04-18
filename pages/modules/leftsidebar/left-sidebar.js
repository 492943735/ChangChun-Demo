var letfBarApp = angular.module("sidebar.left", []);

letfBarApp.factory("LeftService", ["$http","$q", "CommonPath", function($http, $q, CommonPath) {
	var accessModel = {
		accessUIData : {
			frequencyShow : false
		},
		modelData : angular.copy(accessData)
	};
	var locationModel = {
			locationUIData : {
				locationSettingShow : false
			},
			locationData : generateLocationMarkData()
		};
    var defaultData = [{
		minVal : "",
		maxVal : "",
		colorVal : "#ce0404",
		checked : true,
		showColorDig : false
	}, {
		minVal : "",
		maxVal : "",
		colorVal : "#cdce02",
		checked : true,
		showColorDig : false
	}, {
		minVal : "",
		maxVal : "",
		colorVal : "#016802",
		checked : true,
		showColorDig : false
	}, {
		minVal : "",
		maxVal : "",
		colorVal : "#3ac841",
		checked : true,
		showColorDig : false
	}, {
		minVal : "",
		maxVal : "",
		colorVal : "#63f17b",
		checked : true,
		showColorDig : false
	}];
	var thresholdData = {
		activation : "AVG RSRP",
		unit : "dBm",
		rangeType : "1",
		colorList : [],
		showDialog : false
	};
	var thresholdDataCopy = {
			activation : "AVG RSRP",
			unit : "dBm",
			rangeType : "1",
			colorList : [],
			showDialog : false
	};
	function setThreshold(mapModel) {
		for (var i = 0; i < mapModel.icaAreas.length; i++) {
			var item = mapModel.icaAreas[i];
			if (item.active) {
				thresholdData.activation = item.label;
				thresholdData.unit = item.data.unit;
				thresholdDataCopy.activation = angular.copy(item.label);
				thresholdDataCopy.unit = angular.copy(item.data.unit);
			}
		}
		if (mapModel.gisMap.thresholdData != null) {
			var mapThresholds = mapModel.gisMap.thresholdData;
			thresholdData.rangeType = mapThresholds.rangeType;
			thresholdData.colorList = mapThresholds.colorList;
			thresholdData.cellInfos = mapThresholds.cellInfos;
			thresholdDataCopy.rangeType = angular.copy(mapThresholds.rangeType);
			thresholdDataCopy.colorList = angular.copy(mapThresholds.colorList);
			thresholdDataCopy.cellInfos = angular.copy(mapThresholds.cellInfos);
		}else{
			thresholdData.rangeType = "1";
			thresholdData.colorList = defaultData;
			thresholdData.cellInfos = [];
			thresholdDataCopy.rangeType = "1";
			thresholdDataCopy.colorList = angular.copy(defaultData);
			thresholdDataCopy.cellInfos = [];
		}
	}
	
	function resetThresholdDataCopy(mapModel){
		if (mapModel.gisMap.thresholdData != null) {
			var mapThresholds = mapModel.gisMap.thresholdData;
			thresholdDataCopy.rangeType = angular.copy(mapThresholds.rangeType);
			thresholdDataCopy.colorList = angular.copy(mapThresholds.colorList);
			thresholdDataCopy.cellInfos = angular.copy(mapThresholds.cellInfos);
		}else{
			thresholdDataCopy.rangeType = "1";
			thresholdDataCopy.colorList = angular.copy(defaultData);
			thresholdDataCopy.cellInfos = [];
		}
	}

	function saveDiyModelColor(modelColorParams, mapModel){
		setThreshold(mapModel);
	}
	
	function handlerPreviewEvent(mapModel, preThresholdData, activeTab){
		if(!mapModel.gisMap.isPreViewState){
			mapModel.gisMap.thresholdDataCopy = angular.copy(mapModel.gisMap.thresholdData);
		}
		mapModel.gisMap.thresholdData = {
				rangeType : preThresholdData.rangeType,
				colorList : preThresholdData.colorList
		};
		setThreshold(mapModel);
		mapModel.gisMap.refreshCell();
		mapModel.gisMap.setModeldata(activeTab);
		
		mapModel.gisMap.isPreViewState = true;
	}
	
	/*
	name : //名称
    iconUrl : //初始化图标
    highLighticonUrl : //高亮图标
    typeImageNoActivedPress : //标签按下未激活图标
    typeImageActivedPress : //标签按下激活图标
    showIconUrl : //当前显示图标
    isActived : //标签是否激活
    relationShowSwitch : //按钮是否显示
	 */	
	var btns = [
	{
		name : Constant.LOCATION,
		iconUrl : CommonPath.imgBasePath + IMAGES.locationOff,
		highLighticonUrl : CommonPath.imgBasePath + IMAGES.locationOff,
		typeImageNoActivedPress : CommonPath.imgBasePath + IMAGES.locationOn,
		typeImageActivedPress : CommonPath.imgBasePath + IMAGES.locationOn,
		showIconUrl : CommonPath.imgBasePath + IMAGES.locationOff,
		isActived : false,
		relationShowSwitch : true
	},
	{
		name : Constant.THRESHOLD,
		iconUrl : CommonPath.imgBasePath + IMAGES.Threshold,
		highLighticonUrl : CommonPath.imgBasePath + IMAGES.Threshold,
		typeImageNoActivedPress : CommonPath.imgBasePath + IMAGES.ThresholdLight,
		typeImageActivedPress : CommonPath.imgBasePath + IMAGES.ThresholdLight,
		showIconUrl : CommonPath.imgBasePath + IMAGES.Threshold,
		isActived : false,
		relationShowSwitch : true
	}, {
		name : Constant.MAPZOOMINCREASE,
		iconUrl : CommonPath.imgBasePath + IMAGES.zoomIn,
		highLighticonUrl : CommonPath.imgBasePath + IMAGES.zoomIn,
		typeImageNoActivedPress : CommonPath.imgBasePath + IMAGES.zoomInLight,
		typeImageActivedPress : CommonPath.imgBasePath + IMAGES.zoomInLight,
		showIconUrl : CommonPath.imgBasePath + IMAGES.zoomIn,
		isActived : false,
		relationShowSwitch : true
	}, {
		name : Constant.MAPZOOMDECREASE,
		iconUrl : CommonPath.imgBasePath + IMAGES.zoomOut,
		highLighticonUrl : CommonPath.imgBasePath + IMAGES.zoomOut,
		typeImageNoActivedPress : CommonPath.imgBasePath + IMAGES.zoomOutLight,
		typeImageActivedPress : CommonPath.imgBasePath + IMAGES.zoomOutLight,
		showIconUrl : CommonPath.imgBasePath + IMAGES.zoomOut,
		isActived : false,
		relationShowSwitch : true
	}, {
		name : Constant.DOUBLEWIN,
		iconUrl : CommonPath.imgBasePath + IMAGES.doubleScreenLeft,
		highLighticonUrl : CommonPath.imgBasePath + IMAGES.doubleScreenClose,
		typeImageNoActivedPress : CommonPath.imgBasePath + IMAGES.doubleScreenLeftPress,
		typeImageActivedPress : CommonPath.imgBasePath + IMAGES.doubleScreenClosePress,
		showIconUrl : CommonPath.imgBasePath + IMAGES.doubleScreenLeft,
		isActived : false,
		relationShowSwitch : true
	}, {
		name : Constant.LOCKSCREEN,
		iconUrl : CommonPath.imgBasePath + IMAGES.openLockScreen,
		highLighticonUrl : CommonPath.imgBasePath + IMAGES.lockScreen,
		typeImageNoActivedPress : CommonPath.imgBasePath + IMAGES.lockScreenLight,
		typeImageActivedPress : CommonPath.imgBasePath + IMAGES.openLockScreenLight,
		showIconUrl : CommonPath.imgBasePath + IMAGES.openLockScreen,
		isActived : false,
		relationShowSwitch : true
	}];
	updateLocationBtn();
	
	function updateLocationBtn(){
		findBtn(Constant.LOCATION).relationShowSwitch = !(locationModel.locationData.length == 0);
	}
	
	function findBtn(btnName){
		for(var i=0; i<btns.length;i++){
			if(btns[i].name == btnName){
				return btns[i];
			}
		}
	}
	
	//显示锁屏
	function showLockBtn() {
		for(var i=0; i<btns.length;i++){
			var bIndex = i;
			if(btns[bIndex].name == Constant.LOCKSCREEN){
				btns[bIndex].relationShowSwitch = true;
				btns[bIndex].isActived = false;
				btns[bIndex].showIconUrl = btns[bIndex].iconUrl;
			}
		}
	} 
	
	//隐藏锁屏
	function hideLockBtn() {
		for(var i=0; i<btns.length;i++){
			var bIndex = i;
			if(btns[bIndex].name == Constant.LOCKSCREEN){
				btns[bIndex].relationShowSwitch = false;
				btns[bIndex].isActived = false;
				btns[bIndex].showIconUrl = btns[bIndex].iconUrl;
			}
		}
	} 
	
	function exitPreview(mapModel, activeTab){
		recoverThresholdData(mapModel, activeTab);
		setThreshold(mapModel);
		mapModel.gisMap.refreshCell();
		mapModel.gisMap.setModeldata(activeTab);
		clearPreviewState(mapModel);
	}
	
	function recoverThresholdData(mapModel, activeTab){
		mapModel.gisMap.thresholdData = angular.copy(mapModel.gisMap.thresholdDataCopy);
	}
	
	function clearPreviewState(mapModel){
		mapModel.gisMap.clearPreviewState();
	}
	
	function closeDouWin(){
		for(var i=0; i<btns.length;i++){
			var bIndex = i;
			if(btns[bIndex].name == Constant.DOUBLEWIN){
				btns[bIndex].isActived = false;
				btns[bIndex].showIconUrl = btns[bIndex].iconUrl;
			}
			if(btns[bIndex].name == Constant.LOCKSCREEN){
				btns[bIndex].relationShowSwitch = false;
				btns[bIndex].isActived = false;
				btns[bIndex].showIconUrl = btns[bIndex].iconUrl;
			}
		}
	}
	function resetHomePage(isDoubleScreen){
		if(!isDoubleScreen){
			$("#topHomePage").css("display", "block");
		}else{
			$("#topHomePage").css("display", "none");
		}
	}
	
	function setAccessData(mapModel){
		accessModel.modelData = angular.copy(mapModel.gisMap.accessData);
	}
	
	function setLocationData(mapModel){
		locationModel.locationData = angular.copy(mapModel.gisMap.locationData);
	}
	
	//判断图标：
	function getIconCurrents(o){
		return o;
	};
	
	function queryLoactionMarkInfoDatas(){
		//读取locationmark：
		var cfg_location_urls = "data/location_mark_info.csv";
		var locationMarkValue =[];
		var responseData = {};
		responseData.data =[];
		Papa.parse(cfg_location_urls,{
			download: true,
			complete: function (results) {
				iconCurrents = [];
				locationMarkValue = results.data;
				var category =[];
				var arrss = [];
				for(var i = 1;i<locationMarkValue.length-1;i++){
					var m = locationMarkValue[i][3];
					if($.inArray(m,category) == -1){
						category.push(m);
					}
					var n = locationMarkValue[i][4];
					if($.inArray(n,arrss) == -1){
						arrss.push(n);
					}
				}
				
				for(var i = 0;i<category.length;i++){
				    var obj = {
						"visual_level": "8",
						"mark_name": category[i],
						"legend_size": "35",
						"location_mark": "2"+i,
				    };
				    var arr = [];
					for(var j = 1;j<locationMarkValue.length-1;j++){
						if(locationMarkValue[j][3] == category[i]){
							var oobbj ={};
							oobbj.mark_name = locationMarkValue[j][0];
							oobbj.id = j;
							oobbj.ypos = locationMarkValue[j][2];
							oobbj.xpos = locationMarkValue[j][1];
							oobbj.legend_size = 30;
							oobbj.visual_level = 7;
							arr.push(oobbj);
						}
					}
					obj.markDatas = arr;
					responseData.data.push(obj);
					iconCurrents.push({"catogery":category[i],"icons":arrss[i]});
				}
				getIconCurrents(iconCurrents);
				locationMarkConfig.markInfo = responseData.data;
			}
		});
	}
	queryLoactionMarkInfoDatas();
	return {
		thresholdData : thresholdData,
		thresholdDataCopy : thresholdDataCopy,
		setThreshold : setThreshold,
		currentColorList : {},
		resetThresholdDataCopy : resetThresholdDataCopy,
		saveDiyModelColor : saveDiyModelColor,
		handlerPreviewEvent : handlerPreviewEvent,
		btns : btns,
		showLockBtn: showLockBtn,
		hideLockBtn: hideLockBtn,
		exitPreview : exitPreview,
		clearPreviewState : clearPreviewState,
		closeDouWin : closeDouWin,
		resetHomePage : resetHomePage,
		recoverThresholdData : recoverThresholdData,
		accessModel : accessModel,
		setAccessData : setAccessData,
		locationModel: locationModel,
		setLocationData : setLocationData,
		findBtn : findBtn,
		getIconCurrents : getIconCurrents,
		updateLocationBtn : updateLocationBtn
	};
}]);