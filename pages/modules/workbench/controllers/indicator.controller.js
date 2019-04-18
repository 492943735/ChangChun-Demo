angular.module("workbench").controller("indicatorController", ["$scope", "TabService", "RightSidebarService","LeftService",
    "CommonPath", "gisMapService",
    function($scope, TabService, RightSidebarService,LeftService, CommonPath, gisMapService)
{	
	
	$scope.imgBasePath = CommonPath.imgBasePath;
	/**
	 * 判断该标签是否能够拖拽，只有DIY tab页签下的标签能够拖动
	 */
	$scope.allowDrag = function(data) {
		if(data){
			return true;
		}else{
			return TabService.isDiyTabActived() && $scope.ica && !$scope.ica.unable;
		}
	};
	
	/**
	 * 获取指标图标url
	 */
	$scope.getLabelIconUrl = function() {
		var ica = $scope.ica;
		
		if(ica.iconUrl === "base64") {
			return ica.iconData;
		}
		else{
			return CommonPath.imgLightBasePath + ica.iconUrl;
		}
	};
	
	/**
	 * 此标签开始拖动时触发的事件
	 */
	$scope.dragStart = function(event, ui) {
		if($scope.ica){
			$scope.ica.inRightSidebar = true;
		}
	};
	
	/**
	 * 此标签停止拖动时的触发事件
	 */
	$scope.dragStop = function(event, ui, dragIca) {
		//不要用$scope.ica,因为在drop的时候ica数组里面的顺序变了
		var ica = null;
		if(dragIca.text){
			ica = TabService.getIcaByName(dragIca.text);
		}else{
			ica = dragIca;
		}
		
		if(!RightSidebarService.contains(ica)) {
			ica.inRightSidebar = false;
		}
	};
	
	/**
	 * 判断当前标签是否可以接受拖动的标签放入，只有相同类型的标签才能互换顺序,Total Traffic标签不能互换顺序
	 */
	$scope.accept = function(dragElem) {
		var dragScope = angular.element(dragElem).scope();
		
		if($scope.ica){
			if(!dragScope || !dragScope.ica || dragScope.ica.text === Constant.TOTAL_TRAFFIC) {
				return false;
			}
			return dragScope.ica.type === $scope.ica.type;
		}else{
			return true;
		}
		
		
	};
	
	/**
	 * 拖动的标签放入此标签的触发事件
	 */
	$scope.onDrop = function(event, ui, dragIca) {
			var ica = TabService.getIcaByName(dragIca.text);
			TabService.swapIca(ica, $scope.ica);
	};
	
	$scope.onDropStop = function(event, ui, dragModel,that){
			//交换数组中两元素的顺序
			TabService.swapIcas(dragModel, that);
		};
	/**
	 * 点击标签时触发标签弹到地图或缩到控制台
	 */
	$scope.labelClick = function(event) {
		if (!$scope.allowDrag() || gisMapService.mapData.activedMap.isLock) {
			return;
		}
		var vvipFlag = false;
		if($scope.ica.type === LabelType.USER) {
			var dimension =JSON.parse($scope.ica.dimension);
			if(dimension.catId != undefined && dimension.catId === Constant.VVIP_GROUP_CATID) {
				gisMapService.getActivedMapModel().vvipDataModel.data="";
				vvipFlag = true;
		    }
		}
		
		if ($scope.ica.inRightSidebar) {
			RightSidebarService.removeIca($scope.ica);
			if(RightSidebarService.getIcaAreas().length === 0) { //判断右上角没有标签时
				var  allIcas = TabService.getAllIcasInActivedTab();
				for (var i in allIcas) {
					var index = i;
					allIcas[index].unable = false;
				}
			}else{ //右上角图标大于一个
				TabService.getCombineIndicators();
			}
			TabService.updateContentIcaStatus();
			
			//TODO 点击工作台显示社区
			var mapModel = gisMapService.getActivedMapModel();
			if(mapModel.icaAreas.length > 0){
				var communityName = mapModel.icaAreas[mapModel.icaAreas.length-1].text;
	 			gisMapService.communityDataShow(communityName,TabService);
			}else{
				var arrShow = [];
				for(var k=0; k<TabService.communityLabelData.length; k++){
					if(!TabService.communityLabelData[k].checked){
						arrShow.push(TabService.communityLabelData[k])
					}
				}
				gisMapService.drawRegion(arrShow);
			}
		}else{
			//点击标签到地图上	
			RightSidebarService.pushIca($scope.ica);
			//判断是vvip用户组，则需要添加下拉框对应的单用户
			if(vvipFlag) {
				TabService.vvipExpandData($scope.ica.text, function(vvipInfos) {
	    			var vvipData =[];
		    		for(var i = 0; i < vvipInfos.length; i ++) {
		    			gisMapService.getActivedMapModel().vvipDataModel.allVvipDatas[vvipInfos[i].encrypt_msisdn]= vvipInfos[i].name;
					    vvipData[i] = vvipInfos[i].encrypt_msisdn;
		    		}
		    		//添加用户组名称在下拉框
		    		gisMapService.getActivedMapModel().vvipDataModel.allVvipDatas[$scope.ica.text]= $scope.ica.text;
		    		//拼接vvip用户组名称
					vvipData.splice(0, 0, $scope.ica.text);
					gisMapService.getActivedMapModel().vvipDataModel.vvipExpandData = vvipData;
			    });	
			}
			TabService.getCombineIndicators();
			//根据选择的标签进行阈值的更新
			gisMapService.mapData.activedMap.gisMap.getThresholdData(function(){
                	gisMapService.mapData.activedMap.gisMap.refreshCell();
                	gisMapService.mapData.activedMap.gisMap.setModeldata();
                },TabService.getThreshold);
	 		TabService.updateContentIcaStatus();
			//TODO 点击工作台显示社区
			var communityName = this.ica.text;
	 		gisMapService.communityDataShow(communityName,TabService);
		}
		
		gisMapService.getActivedMapModel().gisMap.getThresholdData(function(){
			gisMapService.refreshMapData(TabService.getActiveTab());
		},TabService.getThreshold);
		
	};
	
}]);