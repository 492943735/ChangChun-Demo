var mainApp = angular.module("main");

mainApp.directive("map", [ "CommonPath", "RightSidebarService", "TabService", "LeftService", "MenubarService", "gisMapService", "SettingService", "$translate", "tipWindow", "playBackService",
 function(CommonPath, RightSidebarService, TabService, LeftService, MenubarService, gisMapService, SettingService, $translate, tipWindow, playBackService) {
    var linkFunction = function(scope, elem, attr) {
        scope.activeMap = function() {
        	if(scope.mapData.activedMap.renderToId == scope.mapModel.renderToId){
        		return;
        	}
            scope.mapData.activedMap = scope.mapModel;
            TabService.updateContentIcaStatus();
            TabService.getCombineIndicators();
            LeftService.setThreshold(scope.mapModel);
            LeftService.setAccessData(scope.mapModel);
            LeftService.setLocationData(scope.mapModel);
            playBackService.setTime(scope.mapModel);
        };
        
        scope.playBackState = playBackService.playBackState;
        scope.getDay = function(){
        	if(null != scope.mapModel.gisMap){
        		return scope.mapModel.gisMap.getDay();
        	}else{
        		return scope.mapModel.time;
        	}
        };
        
        scope.getTitle = function() { 
			return RightSidebarService.getMapTitle(scope.mapModel.icaAreas);
		};
        
        scope.isShowActiveMapBorder = function() {
            return scope.mapData.isDoubleScreen && scope.mapModel.renderToId === scope.mapData.activedMap.renderToId;
        };
        
        //拖动控制台指标到地图响应事件
        scope.onDrop = function(event, ui, dragModel) {
        	if(!(scope.mapData.activedMap.renderToId == scope.mapModel.renderToId)){
            	return;
        	}
        	if(scope.mapModel.isLock) {
        		return;
        	}
        	if(dragModel.userName){
        		return;
        	}
            var workbench = $(".new_workbench");
            var icaName = dragModel.text;
            var ica = TabService.getIcaByName(icaName);
            
            for(var i = 0;i<scope.mapModel.icaAreas.length;i++){
        		var item = scope.mapModel.icaAreas[i];
        		if(item.text == ica.text && item.active){
        			return;
        		}
        	}
            
            if (!isMouseIn(workbench, event)) {
            	//判断是vvip用户组，则需要添加下拉框对应的单用户
                if(ica.type === LabelType.USER) {
    				var dimension =JSON.parse(ica.dimension);
    				if(dimension.catId != undefined && dimension.catId === Constant.VVIP_GROUP_CATID) {
    					TabService.vvipExpandData(ica.text, function(vvipInfos) {
    		    			var vvipData =[];
    			    		for(var i = 0; i < vvipInfos.length; i ++) {
    			    			gisMapService.getActivedMapModel().vvipDataModel.allVvipDatas[vvipInfos[i].encrypt_msisdn]= vvipInfos[i].name;
    						    vvipData[i] = vvipInfos[i].encrypt_msisdn;
    			    		}
    			    		//添加用户组名称在下拉框
    			    		gisMapService.getActivedMapModel().vvipDataModel.allVvipDatas[ica.text]= ica.text;
    			    		//拼接vvip用户组名称
    						vvipData.splice(0, 0, ica.text);
    						gisMapService.getActivedMapModel().vvipDataModel.vvipExpandData = vvipData;	
    				    });	
    			    }
    			}
                RightSidebarService.pushIca(ica);
                TabService.getCombineIndicators();
                //根据点击的标签进行阈值的更新
                scope.mapModel.gisMap.getThresholdData(function(){
                	scope.mapModel.gisMap.refreshCell();
                	scope.mapModel.gisMap.setModeldata();
                },TabService.getThreshold);
            	TabService.updateContentIcaStatus();
            	console.log(LeftService.thresholdData);
            	if(ica.type === LabelType.USER) {
        			var dimension =JSON.parse(ica.dimension);
        			if(dimension.catId != undefined && dimension.catId === Constant.VVIP_GROUP_CATID) {	
        				gisMapService.getActivedMapModel().vvipDataModel.data="";
        			}
        		}
            }
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
        };
        
        scope.$watch(function() {
    		return {
    			isErrorRequest :  scope.mapModel.isErrorRequest
    		}; 
    	},function(newVal, oldVal){
    		if(newVal.isErrorRequest){
    			var errMsg = $translate.instant("i18n.labelIca.deleted");
    			tipWindow.show(true, true, false, errMsg, function() {
    				gisMapService.getActivedMapModel().isErrorRequest = false;
    			});
    		}
    	},true);
        
        scope.accept = function(dragElem) {
            return !scope.mapModel.isLock || scope.mapData.activedMap.renderToId == scope.mapModel.renderToId;
        };
        
        scope.reset = function(){
        	if(scope.mapModel.isLock || gisMapService.mapData.activedMap.renderToId != scope.mapModel.renderToId){
        		return;
        	}
        	scope.mapModel.gisMap.reset();
        };
        MenubarService.registerResetFunc(scope);
    };
    
    return {
        restrict : "EA",
        replace : false,
        scope : {
            mapModel : "=",
            mapData: "="
        },
        link: linkFunction,
        template : '<div style="position: relative;" class="gisInfoDiv">'+
    	'<div ng-class="{doubleScreenFuzzy: !isShowActiveMapBorder()}" ng-show="mapData.isDoubleScreen"></div>'+

    	'<div id="{{mapModel.renderToId}}" class="gisInfoDiv" ng-click="activeMap()"'+
    		'droppable on-drop="onDrop(event, ui, $dragModel)" accept="accept(dragElem)">'+
    	'<div class="activeBorderLeft activeBorder doubleScreenTitleShow" ng-show="isShowActiveMapBorder();"></div>'+
    	   '<div ng-show="mapModel.needSmallTitle" class="doubleScreenTitle doubleScreenTitleShow">'+ 
    	    '<div class="doubleScreenTitleRow" ng-class="{doubleScreenTitleLigth:isShowActiveMapBorder()}">'+	
    	    	'	<span class="doubleWinTitleBg">'+
    		   '{{getDay()}}'+ 		
    		    '<span ng-show="playBackState.hour">&nbsp;&nbsp;{{mapModel.queryTime.hour}}</span>'+		
    	    	'</span>'+	
    	    '</div>'+
    	    '<div class="doubleScreenTitleRow" ng-class="{doubleScreenTitleLigth:isShowActiveMapBorder()}">'+	
    	    	'<span class="mainTitle" uib-tooltip="{{getTitle()}}">{{getTitle()}}</span>'+	
        	'</div>'+	
    		'</div>'+
    	'<div class="activeBorderRight activeBorder doubleScreenTitleShow" ng-show="isShowActiveMapBorder();"></div>'+	
    	'</div>'+
    	
    	'<right-sidebar map-model="mapModel"></right-sidebar>'+
    '</div>'
    };
} ]);