angular.module("main").factory("MenubarService", ["gisMapService", "CommonPath", function(gisMapService, CommonPath) {
	var imgBasePath = CommonPath.imgBasePath;
	var imgLightBasePath = CommonPath.imgLightBasePath;
	var isGoogolMap = gisMapService.mapType;
	var resetAllList = [];//reset所有模块对象
	
	var openImg = {
		isActive: false,
		hover: false,
		iconUrl : imgBasePath + IMAGES.openStory,
		activeIconUrl: imgLightBasePath + IMAGES.openStory_light,
	}
	
	var saveImg = {
		isActive: false,
		hover: false,
		iconUrl : imgBasePath + IMAGES.topSaveIcon_dark, 
		activeIconUrl: imgLightBasePath + IMAGES.topSaveIcon,
		popUrl: ""
	};
	
	var menusData = [
         {
        	 name : "setting",
        	 isActive: false,
        	 hover: false,
        	 iconUrl : imgBasePath + IMAGES.topSettingIcon_dark,
        	 activeIconUrl: imgLightBasePath + IMAGES.topSettingIcon,
        	 popUrl: "",
        	 show:"true"
         },
		{
			name : "refresh",
			isActive: false,
			hover: false,
			iconUrl : imgBasePath + IMAGES.topRefreshIcon_dark,
			activeIconUrl: imgLightBasePath + IMAGES.topRefreshIcon,
			popUrl: "",
       	 	show:"true"
		},
		{
			name : "export",
			isActive: false,
			hover: false,
			iconUrl : imgBasePath + IMAGES.topDeriveIcon_dark,
			activeIconUrl: imgLightBasePath + IMAGES.topDeriveIcon,
			popUrl: "export.html",
       	 	show:"true"
		},{
			name : "save",
			isActive: false,
			hover: false,
			iconUrl : imgBasePath + IMAGES.topSaveIcon_dark, 
			activeIconUrl: imgLightBasePath + IMAGES.topSaveIcon,
			popUrl: "save.html",
       	 	show:"true"
		},{
			name : "tableau",
			isActive: false,
			hover: false,
			iconUrl : imgBasePath + IMAGES.tableAuIcon_dark,
			activeIconUrl: imgLightBasePath + IMAGES.tableAuIcon,
			popUrl: "tableau.html",
       	 	        show:"true"
		},{
			name : "memutop",
			isActive: false,
			hover: false,
			iconUrl : imgBasePath + IMAGES.menuTop_dark,
			activeIconUrl: imgLightBasePath + IMAGES.menuTop,
			popUrl: "",
       	 	show:"true"
		},{
			name : "brush",
			isActive: false,
			hover: false,
			iconUrl : imgBasePath + IMAGES.brush_dark,
			activeIconUrl: imgLightBasePath + IMAGES.brush,
			popUrl: "",
       	 	show:"true"
		},{
			name : "draw",
			isActive: false,
			hover: false,
			iconUrl : imgBasePath + IMAGES.topDrawIcon_dark,
			activeIconUrl: imgLightBasePath + IMAGES.topDrawIcon,
			popUrl: "polygon.html",
       	 	show:"true"
		},
		/*add 增加seach*/
		{
			name : "seach",
			isActive: false,
			hover: false,
			iconUrl : imgBasePath + IMAGES.seach_dark,
			activeIconUrl: imgLightBasePath + IMAGES.seach,
			popUrl: "search.html",
       	 	show:"true"
		}
		
	];
	function findMenuItem(itemName) {
		for (var i=0; i<menusData.length; i++) {
			var mIndex = i;
			if(menusData[mIndex].name == itemName) {
				return  menusData[mIndex];
			}
		}
	}
	
	function setSettingBarStatus(active) {
		menusData[0].isActive = active;
	}
	
	function settingBarIsActive() {
		return menusData[0].isActive;
	}
	
	//改变reset点击态
	function setResetActive() {
		menusData[1].isActive = false;
	}
	
	//获取reset的点击态
	function getResetActive() {
		return menusData[1].isActive;
	}
	
	//全局reset方法
	function resetAll() {
		for(var i in resetAllList){
			resetAllList[i].reset();
		}
	}
	
	//各模块调用并传入reset方法
	function registerResetFunc(resetAllItem) {
		resetAllList.push(resetAllItem);
	}
	function settingClick(){
		return menusData[0].isActive;
	}
	return {
		openImg: openImg,
		saveImg: saveImg,
		findMenuItem: findMenuItem,
		menusData: menusData,
		setSettingBarStatus: setSettingBarStatus,
		settingBarIsActive: settingBarIsActive,
		setResetActive: setResetActive,
		getResetActive: getResetActive,
		resetAll: resetAll,
		settingClick:settingClick,
		registerResetFunc: registerResetFunc
	};
}]);