var mainApp = angular.module("workbench");

mainApp.directive("tabItem", ["TabService", "storyLineService", "gisMapService", "CommonPath", "$timeout", "LeftService", "playBackService", "MenubarService",
    function(TabService, storyLineService, gisMapService, CommonPath, $timeout, LeftService, playBackService, MenubarService)
{
	function linkFunc(scope,elem) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.IMAGES = IMAGES;
		scope.dragOver = false; 
		
		scope.activeTab = function(event) {
			if(scope.item.active) {
				return;
			}
			
			//故事线 -> DIY
			if(isEqualIgnoreCase(scope.item.text, I18N_KEY.DIY)) {
				TabService.recoveryDiyLabelStatus();
				TabService.activeTab(scope.index);
				TabService.recoveryDiyData();
				LeftService.setThreshold(gisMapService.getActivedMapModel());
				gisMapService.addActiveMapLocationMark();
				LeftService.setLocationData(gisMapService.getActivedMapModel());
				LeftService.updateLocationBtn();
			}
			// DIY -> 故事线, 故事线 -> 故事线
			else {
				// 1. 如果是双屏变为单屏
				switchToSingleScreen();
				LeftService.resetHomePage(gisMapService.mapData.isDoubleScreen);
				// 2. DIY切换到 故事线前备份DIY数据
				TabService.copyDiyData();
				//DIV切换到故事线，删除DIV中的多边形
				gisMapService.removeAllPolygon(null);
				// 3. 激活当前故事线
				TabService.activeTab(scope.index);
				// 4. 重置VVIP数据为初始值
				gisMapService.mapData.activedMap.vvipDataModel.data = "";
				// 5. 设置左侧栏频段和阈值为故事线的
				TabService.mapWorkBeachRefreshFlag = "fromStoryLine";
				storyLineService.initEditData(function(){
					TabService.mapWorkBeachRefreshFlag = "fromStoryLine";
					var mapModel = gisMapService.mapData.activedMap;
					var newVal = {
						time: mapModel.time
					};
					var oldVal = {
						time: "1970-01-01"	
					};
				}, false);
				// 6. 弹出公告栏弹窗
				storyLineService.loadScenarioData();
				LeftService.clearPreviewState(gisMapService.getActivedMapModel());
			}
		};
		
		/**
		 * 如果是双屏退出双屏, 切换到单屏
		 */
		function switchToSingleScreen() {
			if(gisMapService.mapData.isDoubleScreen) {
				LeftService.closeDouWin();
				gisMapService.mapData.isDoubleScreen = false;
				gisMapService.mapData.wholeMap.isLock = false;
				gisMapService.mapData.wholeMap.isPolygonLock = false;
				gisMapService.syncLeftAndRightWithMainMap();
				var mapModel = gisMapService.mapData.activedMap;
	            playBackService.setTime(mapModel);
				TabService.updateContentIcaStatus();
				TabService.getCombineIndicators();
				MenubarService.findMenuItem(Constant.SAVE).show = true;
				$("#gisWholeMapId").css("width", "100%");
				fusiongis.Map.refreshMaps([gisMapService.mapData.wholeMap.renderToId]);
			}
		}
		
		scope.isDiy = function() {
			return isEqualIgnoreCase(scope.item.text, I18N_KEY.DIY);
		};
		
		scope.allowDrag = function() {
			return !scope.isDiy();
		};
		
		scope.accept = function() {
			return !scope.isDiy();
		};
		
		scope.dragover = function(event, ui, dragIndex) {
			if(dragIndex != scope.index) {
				scope.dragOver = true;
			}
		};
		
		scope.dragout = function() {
			scope.dragOver = false;
		};
		
		scope.drop = function(dragIndex) {
			scope.dragOver = false;
			TabService.swapTab(scope.index, dragIndex);
		};
	}
	
	return {
		restrict: "EA",
		replace: false,
		scope: {
			item: "=",
			index: "=",
			isbefore: "="
		},
		link: linkFunc,
		template:'<div ng-click="activeTab($event)"'+
		    'ng-class="{new_DIYicon: item.active,  new_screen1: !item.active, \'new_screen-left\': isbefore, \'drag-over\': dragOver}"'+
		     'droppable on-drop="drop($dragModel)" drag-over="dragover(event, ui, $dragModel)" drag-out="dragout()" accept="accept()" drop-opts="{layer: \'layer3\', hoverClass: false}">'+   
		    	'<div ng-class="{new_DIYicon: item.active,  new_screen1: !item.active, \'new_screen-left\': isbefore}"'+
		    		'draggable drag-enable="allowDrag()" drag-model="index" drag-opts="{layer: \'layer3\'}">'+
		    		'<img ng-if="item.active" ng-src="{{imgBasePath + IMAGES.workBench_tabSelected}}" id="tab-item{{$index}}_item"/>'+                                             
		    		'<h1 id="tab-item_h1{{$index}}" class="stroyTabItem">'+
		    		  '<span class="contentTabTxt" ng-if="isDiy()">{{item.text | translate}}</span>'+  
		    		   '<span class="contentTabTxt" ng-if="!isDiy()" uib-tooltip="{{item.text | translate}}">{{item.text | translate}}</span>'+ 
		    		'</h1>'+
		    	'</div>'+
		    '</div>'
	};
}]);