var mainApp = angular.module("workbench");

mainApp.directive("workBench", ["CommonPath","RightSidebarService", "TabService", "MenubarService", "gisMapService", 
 function(CommonPath,RightSidebarService, TabService, MenubarService, gisMapService) {
	function linkFunc(scope, elem, attr) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.IMAGES = IMAGES;
		scope.tabData = TabService.tabData;
		scope.work = "Working";//工作日 Working 非工作日 Rest
		scope.day = "day";//白天 day 黑夜 night
		scope.workings = true;
		scope.nights=true;//
		/**
		 * 控制台改变隐藏和显示
		 */
		scope.changeVisiable = function() {
			scope.tabData.workBenchVisiable = !scope.tabData.workBenchVisiable;
		};
		/**
		 * 工作日与非工作日的点击事件
		 */
		scope.changeLinght = function(num){
			if(num){
				scope.work = "Rest";
				scope.workings = false;
			}else{
				scope.work = "Working";
				scope.workings = true;
			}
			scope.workingDatas();
			TabService.showWorking = scope.work;
			
			//社区数据切换
			var mapModel = gisMapService.getActivedMapModel();
			if(mapModel.icaAreas.length>0){
				var communityName = mapModel.icaAreas[mapModel.icaAreas.length-1].text;
	 			gisMapService.communityDataShow(communityName,TabService);			
			}
		}
		/**
		 * 白天与黑夜的点击事件
		 */
		scope.changeWorking = function(num){
			if(num){
				scope.day = "night";
				scope.nights = false;
			}else{
				scope.day = "day";
				scope.nights = true;
			}
			scope.workingDatas();
			TabService.showDaytime = scope.day;
			
			//社区数据切换
			var mapModel = gisMapService.getActivedMapModel();
			if(mapModel.icaAreas.length>0){
				var communityName = mapModel.icaAreas[mapModel.icaAreas.length-1].text;
	 			gisMapService.communityDataShow(communityName,TabService);		
			}
		};
		/**
		 * 根据当前的状态进行数据的筛选
		 */
		scope.workingDatas = function(){
			var str = scope.day+"_"+scope.work;
			for(var i = 0;i<scope.tabData.tabs.length;i++){
				for(var k in scope.tabData.tabs[i].content){
					for(var j = 0;j<scope.tabData.tabs[i].content[k].data.length;j++){
						scope.tabData.tabs[i].content[k].data[j].data.data = scope.tabData.tabs[i].content[k].data[j].data[str];
					}
				}
			}
		};
		scope.reset = function() {
			RightSidebarService.clearAllIcaAreas();
			var  items = TabService.getAllIcasInActivedTab();
			for(var i in items){
				var item = items[i];
				item.unable = false;
			}
			TabService.updateContentIcaStatus();
		};
		MenubarService.registerResetFunc(scope);
	}
	
	return {
		restrict: "E",
		replace: true,
		scope: {
			
		},
		link: linkFunc,
		template: '<div id="workbench_new_workbench" class="new_workbench zhujian" class="new_workbench">'+
    '<div class="tabbox" id="workbench_new_workbench_tabbox">'+                     
        '<tab workbench-hide="!tabData.workBenchVisiable"></tab>'+
		'<div class="new_hidebtn" id="workbench_new_workbench_new_hidebtn"> '+
		   '<img ng-src="{{tabData.workBenchVisiable ? imgBasePath + IMAGES.workBench_trapezoid_hideIcon : imgBasePath + IMAGES.workBench_trapezoid_showIcon}}"'+ 
	    	'ng-click="changeVisiable()" id="workbench_new_workbench_new_changeVisiable"/>'+	
		'</div>'+
		'<ul class="time_control"> '+
		  '<li class="chalk_switch">'+
		  	  '<div class="chalk_switch_1" ng-class="{switch_state:nights}" ng-click = "changeWorking(0)" ><img src="{{nights?imgBasePath+ IMAGES.workBench_daytime_light:imgBasePath+ IMAGES.workBench_daytime}}"></div>'+
		  	  '<div class="chalk_switch_2" ng-class="{switch_state:!nights}" ng-click = "changeWorking(1)"><img src="{{nights?imgBasePath+ IMAGES.workBench_night:imgBasePath+ IMAGES.workBench_night_light}}"></div>'+
		  '</li>'+/*白昼切换*/
		  '<li class="workday_switch">'+
		  	  '<div class="chalk_switch_1" ng-class="{switch_state:workings}" ng-click = "changeLinght(0)"><img ng-src="{{workings?imgBasePath+ IMAGES.workbench_working_day_light:imgBasePath+ IMAGES.workbench_working_day}}"></div>'+
		  	  '<div class="chalk_switch_2" ng-class="{switch_state:!workings}" ng-click = "changeLinght(1)"><img src="{{workings?imgBasePath+ IMAGES.workBench_nonworking_day:imgBasePath+ IMAGES.workBench_nonworking_day_light}}"></div>'+
		  '</li>'+/*工作日与非工作日切换*/
		'</ul>'+
   '</div>'+
'</div>'
	};
}]);