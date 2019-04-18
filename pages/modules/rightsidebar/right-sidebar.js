var rightSidebar = angular.module("sidebar.right", []);

rightSidebar.factory("RightSidebarService", ["$translate", "gisMapService", function($translate, gisMapService) {
	var eventEnable = {dragLabel: true, clickLabel: true };
	var icaSortOrder = {};
	icaSortOrder[LabelType.USER] = 1;
	icaSortOrder[LabelType.APP] = 2;
	icaSortOrder[LabelType.KQI] = 3;
	function getIca(ica) {
		var mapModel = gisMapService.getActivedMapModel();
		var icaAreas = mapModel.icaAreas;
		
		for(var index in icaAreas) {
			if(icaAreas[index].type === ica.type && icaAreas[index].text === ica.text) {
				return icaAreas[index];
			}
		}
		
		return null;
	}
	
	function contains(ica) {
		return getIca(ica) != null;
	}
	
	function getIcaAreas() {
		var mapModel = gisMapService.getActivedMapModel();
		if(mapModel){
			return mapModel.icaAreas;
		}else{ 
			return [];
		}
	}
	
	function clearAllIcaAreas() {
		var mapModel = gisMapService.getActivedMapModel();
		if(mapModel){
			mapModel.icaAreas.splice(0, mapModel.icaAreas.length);
		}
	}
	
	function pushIca(ica) {
		var sameType = false;
		var mapModel = gisMapService.getActivedMapModel();
		if (contains(ica) || mapModel.isLock) {
			return;
		}
		ica.inRightSidebar = true;//使拖到右上角的图片标签在控制台保持选中
		ica = angular.copy(ica);
		var arr = [],j = 0;//用来显示最后一个值
		for (var i = 0; i < mapModel.icaAreas.length; i++) {
			mapModel.icaAreas[i].active = false;
			if(mapModel.icaAreas[i].type == ica.type) {
				ica.active = mapModel.icaAreas[i].active;
				mapModel.icaAreas[i] = ica;
				sameType = true;
				j = i;
			}else{
				arr.push(mapModel.icaAreas[i]);
			}
		}
		if(sameType){
			mapModel.icaAreas[j].active = true;
			arr.push(mapModel.icaAreas[j]);
		}
		mapModel.icaAreas = arr;//用来显示最后一个值
		if (!sameType) {
			mapModel.icaAreas.push(ica);
			resetActivedIcaArea(mapModel.icaAreas);
		}
	}
	
	/**
	 * 当右侧栏标签个数改变时需要重新设置排序后的最后一个标签激活
	 * @param allIcaAreas 右侧栏的标签数组
	 */
	function resetActivedIcaArea(allIcaAreas) {
		for(var i = 0; i < allIcaAreas.length; i++) {
			var item = allIcaAreas[i];
			if (i != allIcaAreas.length - 1){
				item.active = false;
			}
			else {
				item.active = true;
			}
		}
	}
	
	function removeIca(ica) {
		var mapModel = gisMapService.getActivedMapModel();
		if(mapModel.isLock){
			return;
		}
		
		for (var i = 0; i < mapModel.icaAreas.length; i++) {
			if (mapModel.icaAreas[i].text == ica.text) {
				mapModel.icaAreas.splice(i, 1);
				resetActivedIcaArea(mapModel.icaAreas);
				break;
			}
		}
	}
	
	/**
	 * 设置激活的浮标
	 */
	function setActivedIcaArea(ica) {
		var icas = getIcaAreas();
		
		for(var index in icas) {
			icas[index].active = icas[index].text === ica.text;
		}
	}
	
	function compare(ica1, ica2) {
		var order1 = icaSortOrder[ica1.type];
		var order2 = icaSortOrder[ica2.type];
		
		if (order1 && order2) {
			if (order1 > order2) {
				return 1;
			}
			else if (order1 == order2) {
				return 0;
			}
			else {
				return -1;
			}
		}
		else {
			return 0;
		}
	}
	
	function refreshData(mapModel, getTabContentIca) {
		var rightIcas = mapModel.icaAreas;
		
		for(var i = rightIcas.length - 1;  i >= 0; i--) {
			var icaName = rightIcas[i].label;
			var ica = getTabContentIca(icaName);
			
			if(ica) {
				if(gisMapService.getActivedMapModel().renderToId == mapModel.renderToId) {
					ica.inRightSidebar = true;
					var icaCopy = angular.copy(ica);
					icaCopy.active = rightIcas[i].active;
					rightIcas[i] = icaCopy;
				}
			}
			else {
				rightIcas.splice(i, 1);
				resetActivedIcaArea(rightIcas);
			}
		}
	}
	/**
	 * 更具右侧栏的标签组合，返回地图的title
	 * @likai 你想多了，人家让直接显示最后一个，所以我把之前都删了。。。
	 */
	function getMapTitle(icaAreasParams) {
		var icaAreas = icaAreasParams ? icaAreasParams : getIcaAreas();
		var title = "";
		if(icaAreas.length){
			title = icaAreas[icaAreas.length-1].text;
		}
		return title;
	}
	
	/**
	 * 显示title时总流量标签需要做特殊处理
	 */
	function initTotalLabelParams(params, appIcon) {
		if(params.APP_LABEL && appIcon.text === Constant.TOTAL_TRAFFIC) {
			params.APP_LABEL = "";
		}
	}
	
	function hasVvipIca() {
		var icaAreas = getIcaAreas();
		
		for(var index in icaAreas) {
			var ica = icaAreas[index];
			if(ica.type === LabelType.USER) {
				var dimension =JSON.parse(ica.dimension);
				if(dimension.catId != undefined && dimension.catId === Constant.VVIP_GROUP_CATID) {
					return true;
				}
			}
		}
		
		return false;
	}
	
	function isVVIP(ica, mapModel) {	
	    //判断vvip group标签属性
		var vvip = false;
		if(ica.type === LabelType.USER) {
			var dimension =JSON.parse(ica.dimension);
			if(dimension.catId != undefined && dimension.catId === Constant.VVIP_GROUP_CATID) {
				vvip = true;
			}
			if(!vvip) {
				mapModel.vvipDataModel.data = "";
			}
		}
		return vvip;
	}
	
	return {
		getIcaAreas: getIcaAreas,
		pushIca: pushIca,
		removeIca: removeIca,
		contains: contains,
		setActivedIcaArea: setActivedIcaArea,
		clearAllIcaAreas: clearAllIcaAreas,
		refreshData: refreshData,
		getMapTitle: getMapTitle,
		eventEnable: eventEnable,
		isVVIP: isVVIP,
		hasVvipIca: hasVvipIca
	};
}]);