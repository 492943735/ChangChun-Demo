var mainApp = angular.module("workbench");

mainApp.directive("tabContent", ["settingService","RightSidebarService", "CommonPath", "indicatorService", "TabService", "gisMapService", "$timeout",
    function(settingService,RightSidebarService, CommonPath, indicatorService, TabService, gisMapService, $timeout)
{
	var linkFunc = function(scope, elem, attr) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.IMAGES = IMAGES;
		scope.USERTYPE = $.workbenchData.userType.name;
		scope.conerImg = $.workbenchData.userType.conerImg;
		scope.ifShow = $.workbenchData.userType.ifShow;
		scope.content = TabService.tabData;
		scope.leftRinghtStart = {//左右滑动标签开始的状态位以及图片路径
			"left":{
				"img":IMAGES.workBench_left_arrow,
				"canClick":0,
				"data":[IMAGES.workBench_left_arrow,IMAGES.workBench_left_arrow_light]
			},
			"right":{
				"img":IMAGES.workBench_right_arrow,
				"canClick":0,
				"data":[IMAGES.workBench_right_arrow,IMAGES.workBench_right_arrow_light],
			},
			"index":0,//刚开始默认从第一个开始
		}
		scope.leftRightClick = angular.copy(scope.leftRinghtStart);//将初始化的状态进行复制，用来操作
		scope.leftClicks = settingService.leftRightClick;
		scope.$watch(function() {//监听是不是进行了setting设置，如果进行了设置，那么就要将左右切换按钮回归到初始化状态
			return {
				leftClicks: settingService.leftRightClick,
				};
			}, function(newVal, oldVal) {
			if(newVal == oldVal) {
				return;
			}
			if(newVal != oldVal){
				//将左右切换按钮回归到初始化状态
				scope.leftRightClick = angular.copy(scope.leftRinghtStart);
				//重新更新数据，根据setting过后的数据进行改变
				var arr = [];
				for(var i = 0;i<$.workbenchData.userType.ifShow.length;i++){
					if($.workbenchData.userType.ifShow[i]){
						arr.push($.workbenchData.userType.ifShow[i]);
					}
				}
				for(var i = arr.length;i<10;i++){
						arr.push(false);
				}
				scope.ifShow = arr;
				settingService.leftRightClick = true;
				scope.lfetClickStart();
			}
		}, true);
		/**
		 * @name lfetClickStart 根据数据的length对左右点击的状态进行改变（再每次初始化的时候）
		 */
		scope.lfetClickStart = function(){
			if(scope.ifShowLength()>3){
					scope.leftRightClick.right.img = IMAGES.workBench_right_arrow_light;
					scope.leftRightClick.right.canClick = 1;
				}
		};
		var i = setInterval(function(){//初始化的时候可能存在数据未加载完成，启动定时器令数据加载完成后进行赋值
			if($.workbenchData.userType.arr[0]){
				clearInterval(i);
				scope.lfetClickStart();
			}
		},200);
		scope.ifShowLength = function(){//判断是不大于三个框要显示，因为存在位置调换的可能，所以只能进行轮询
			for(var i = scope.leftRightClick.index,j = 0;i<scope.ifShow.length;i++){
				scope.ifShow[i]?j++:"";
			}
			return j;
		};
		scope.leftClick = function(){//左边按钮的点击事件
			if(scope.leftRightClick.left.canClick){
				scope.leftRightClick.index--;
				if(scope.leftRightClick.index>0){
					scope.leftRightClick.left.canClick = 1;
				}else{
					scope.leftRightClick.left.canClick = 0;
				}
				scope.leftRightClick.left.img = scope.leftRightClick.left.data[scope.leftRightClick.left.canClick];
				scope.ifShow[scope.leftRightClick.index] = true;
				if(scope.ifShowLength()>3){
					scope.leftRightClick.right.canClick = 1;
					scope.leftRightClick.right.img = scope.leftRightClick.right.data[scope.leftRightClick.right.canClick];
				}
			}
		};
		scope.rightClick = function(){//右侧标签的点击事件
			if(scope.leftRightClick.right.canClick){
				if(scope.ifShowLength()>4){
					scope.leftRightClick.right.canClick = 1;
				}else{
					scope.leftRightClick.right.canClick = 0;
				}
				scope.leftRightClick.right.img = scope.leftRightClick.right.data[scope.leftRightClick.right.canClick];
				scope.ifShow[scope.leftRightClick.index] = false;
				scope.leftRightClick.index++;
				if(scope.leftRightClick.index>0){
					scope.leftRightClick.left.canClick = 1;
					scope.leftRightClick.left.img = scope.leftRightClick.left.data[scope.leftRightClick.left.canClick];	
				}
			}
		};
		/**
		 * 拖动右侧栏指标到控制台放下的事件
		 */
		scope.dropOnTabContent = function(event, ui, dragModel) {
			if(gisMapService.mapData.activedMap.isLock) {
        		return;
        	}
			
			var icaName = dragModel.text;
            var ica = TabService.getIcaByName(icaName);
            
            $timeout(function() {
            	RightSidebarService.removeIca(ica);
    			
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
    			gisMapService.mapData.activedMap.gisMap.getThresholdData(function(){
    				gisMapService.refreshMapData(TabService.getActiveTab());
    			},TabService.getThreshold);
    			
    			//改变数据
    			var mapModel = gisMapService.getActivedMapModel();
				if(mapModel.icaAreas.length>0){
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
            });
		};
	};
	
	return {
		restrict : "EA",
		replace : true,
		scope : {
			activeTab : "="
		},
		controller: "indicatorController",
		link : linkFunc,
		template :
	'<div class="tab_con" style="overflow: hidden;" id="workbench_tab_con">'+
		'<div class="workbench_arrow workbench_left_arrow"><img src="{{imgBasePath + leftRightClick.left.img}}" ng-click = "leftClick()"/></div>'+
		'<div id="workbench_new_tab_con1" class="new_tab_con1" droppable on-drop="dropOnTabContent(event, ui, $dragModel)"'+
		'drop-opts="{layer: \'layer2\'}">'+
			'<div id = "console_display_boxx{{$index}}"class="console_display" ng-repeat = "itms in activeTab.content track by $index" itms= "itms" ng-show = "ifShow[$index]">'+
				'<div  draggable drag-enable="allowDrag(1)" drag-model="itms" drag-start="dragStart(event, ui)" drag-stop="dragStop(event, ui, $dragModel)" class="dragShow">'+
					'<div droppable on-drop="onDropStop(event, ui, $dragModel,this)"  class="dragShow">'+
						'<div class="workbenth_item_title">{{itms.userName}}</div>'+
						'<div class="new_tab_users" ng-scrollbar>'+
							'<indicator ng-repeat="ica in itms.data track by $index" ica="ica" >'+
							'</indicator>'+
						'</div>'+
						'<div class="top_left_corner"><img src="{{imgBasePath + conerImg[$index]}}"/></div>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>'+
		'<div class="workbench_arrow workbench_right_arrow" ng-click = "rightClick()"><img src="{{imgBasePath + leftRightClick.right.img}}"/></div>'+
	'</div>'
	};
}]);