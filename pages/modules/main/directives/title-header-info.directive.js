var mainApp = angular.module("main");

mainApp.directive("titleHeaderInfo", ["RightSidebarService","gisMapService", function(RightSidebarService, gisMapService) {
	var titleFunc = function(scope, element) {
		scope.mapData = gisMapService.mapData;
		scope.mapModel = gisMapService.getActivedMapModel();
		scope.getTitle = function() { 
			return RightSidebarService.getMapTitle();
		};
		//标题增加查询时间
	    scope.getDay = function(){
	    	if(scope.mapModel.icaAreas.length){
	    		if(null != scope.mapModel.gisMap){
	    			return scope.mapModel.gisMap.getDay();
		    	}else{
		    		return scope.mapModel.time;
		    	}
	    	}
	    	
	    };
	    scope.getHour = function(){
	    	if(scope.mapModel.icaAreas.length){
	    		return scope.mapModel.queryTime.hour;
	    	}
	    };
	};
	return {
		restrict : "E",
		replace : true,
		scope : {},
		link : titleFunc,
		template :'<div id="title">'+
		'<div class="titleLogo"></div>'+
		'<div id="title_input" class="title_input_width" ng-keyup="getEnterValue($event)" ng-show="!mapData.isDoubleScreen">'+
			'<span class="mainTitle" uib-tooltip="{{getTitle()}}">{{getTitle()}}</span>'+
		'</div>'+
		'<div class="singleScreenTitle" ng-show="!mapData.isDoubleScreen">'+
			'<div class="singleScreenTitleBg">'+
				'{{getDay()}}<span>&nbsp;&nbsp;{{getHour()}}</span>'+
			'</div>'+
		'</div>'+
		'</div>'
	};
} ]);