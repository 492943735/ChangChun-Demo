angular.module("sidebar.right").directive("indicatorArea", ["TabService", "CommonPath", "gisMapService", "RightSidebarService", "LeftService","$timeout", "MenubarService","playBackService",
    function(TabService, CommonPath, gisMapService, RightSidebarService, LeftService, $timeout, MenubarService, playBackService)
{
	var linkFunc = function(scope, elem, attr) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.imgLightBasePath = CommonPath.imgLightBasePath;
		scope.IMAGES = IMAGES;
		scope.mapType = gisMapService.mapType;
		scope.isUser = scope.ica.type === LabelType.USER;
		scope.img = scope.imgBasePath + IMAGES.rightFloatLabel;
		scope.imgActive = scope.imgBasePath + IMAGES.rightFloatLabel_active;
		scope.lastSelectVvip = "";
		scope.eventEnable = RightSidebarService.eventEnable;
		scope.saveImg = MenubarService.saveImg.isActive;
		scope.isDiyTabActived = TabService.isDiyTabActived();
		scope.vvipDataModel = gisMapService.getActivedMapModel().vvipDataModel;
		scope.right_SideBar_Visible = true;
		scope.working = TabService.showWorking;
		scope.showDaytime = TabService.showDaytime;
		scope.dataWork = scope.showDaytime+"_"+scope.working;
		scope.ica.data.data = scope.ica.data[scope.dataWork];
		scope.$watch(function() {//监听白天黑夜的状态改变，然后进行右侧标签数值的改变
			return {
				showDaytime: TabService.showDaytime,
				working:TabService.showWorking
				};
			}, function(newVal, oldVal) {
			if(newVal == oldVal) {
				return;
			}
			if(newVal != oldVal&&newVal){
				scope.dataWork = newVal.showDaytime+"_"+newVal.working;
				scope.ica.data.data = scope.ica.data[scope.dataWork];
			}
		}, true);
		$timeout(function() {
			elem.find(".select_vvip_id").select2({minimumResultsForSearch: 10});
			if (scope.lastSelectVvip != '') {
				scope.mapModel.vvipDataModel.data = scope.lastSelectVvip;
			}
		});
		scope.rightSideBarVisible = function() {
			scope.right_SideBar_Visible = !scope.right_SideBar_Visible;
		};
		scope.isVVIP = function() {	
			return RightSidebarService.isVVIP(scope.ica, scope.mapModel);
		}
		
		scope.vvipData = function(val) {
			
			if(arguments.length > 0) { //setter
				if(val === scope.ica.text) {
					scope.mapModel.vvipDataModel.data = "";
				}
				else {
					scope.mapModel.vvipDataModel.data = val;
				}
			}
			else { //getter
				return scope.mapModel.vvipDataModel.data;
			}
		};
		
		scope.vvipChange = function() {
			scope.lastSelectVvip = scope.mapModel.vvipDataModel.data;
			var mapModel = gisMapService.getActivedMapModel();
			mapModel.gisMap.refreshCell();
			mapModel.gisMap.setModeldata();
		};
		
		scope.allowDrag = function() {
			return scope.mapModel.renderToId === gisMapService.mapData.activedMap.renderToId
				&& scope.eventEnable.dragLabel && TabService.isDiyTabActived();
		};
		
		scope.activeMap = function(){
			if (scope.mapModel.renderToId != gisMapService.mapData.activedMap.renderToId) {
				gisMapService.mapData.activedMap = scope.mapModel;
	            TabService.updateContentIcaStatus();
	            TabService.getCombineIndicators();
	            LeftService.setThreshold(scope.mapModel);
	            LeftService.setAccessData(scope.mapModel);
	            playBackService.setTime(scope.mapModel);
			}
		};
		
		scope.active = function() {
			if (!scope.eventEnable.clickLabel || !TabService.isDiyTabActived()){
				return;
			}
			
			scope.activeMap();
			
			if (scope.mapModel.isLock || scope.ica.active) {
				return;
			}
			
			for (var i = 0; i < scope.mapModel.icaAreas.length; i++){
				if (scope.mapModel.icaAreas[i].text !== scope.ica.text){
					scope.mapModel.icaAreas[i].active = false;
				}
				else {
					scope.mapModel.icaAreas[i].active = true;
				}
			}
			
			scope.mapModel.gisMap.getThresholdData(function() {
				scope.mapModel.gisMap.refreshCell();
				scope.mapModel.gisMap.setModeldata();
			},TabService.getThreshold);
		};
		
		/**
		 * 获取显示的label text
		 */
		scope.getLabelText = function() {
			var vvipName = scope.mapModel.vvipDataModel.data;
			//判断是vvip 单用户，保存单用户的名称
			if(scope.ica.type === LabelType.USER && vvipName && vvipName != "") {
				return scope.vvipDataModel.allVvipDatas[vvipName];
			}
			//如果是故事线，需要判断是vvip单用户,则需要特殊处理显示数据
			if((!scope.isDiyTabActived) && scope.ica.type === LabelType.USER 
					&& scope.ica.vvipSingleUser != null) {
				   return scope.ica.vvipSingleUser;
			}
			if(Constant.TOTAL_TRAFFIC === scope.ica.text) {
				return "i18n.label.totalTraffic";
			}
			
			return scope.ica.label;
		}
		
		/**
		 * 获取指标图标url
		 */
		scope.getLabelIconUrl = function() {
			var ica = scope.ica;
			if(ica.iconUrl === "base64") {
				return ica.iconData;
			}
			else {
				return scope.imgLightBasePath + ica.iconUrl;
			}
		};
		
	};
	
	return {
		restrict: "E",
		replace: false,
		scope: {
			ica: "=",
			last: "=",
			mapModel : "=",
			vvipname : "=",
			icaIndex: "=index"
		},
		link: linkFunc,
		template: '<div class="rightSideBarItem" ng-click="activeMap();" id="rightsidebar_indicator{{$index}}"'+
		'draggable drag-enable="allowDrag()" drag-model="ica" drag-opts="{layer: \'layer2\'}">'+
		'<div class="rightSideBarChild" ng-class="{right_sideBar_show:right_SideBar_Visible,right_sideBar_hide:!right_SideBar_Visible}">'+
		'<img class="rightSideBarBigBg" ng-src="{{ica.active ? imgBasePath + IMAGES.rightLabel_bg_light : imgBasePath + IMAGES.rightLabel_bg}}">'+
		'<div ng-class="{true:\'rightsidebar_zbbox2\', false:\'rightsidebar_zbbox2_ng\'}[mapType]" id="rightsidebar_indicator_zbbox2{{$index}}">'+
			'<h1 ng-click="active()" class="drag_handle" ng-class="{rightsidebar_textColor : !ica.active ,rightsidebar_textColor_active : ica.active}">{{ica.data.data}}</span><span ng-if="isVVIP() && isDiyTabActived && !saveImg" class="vvipIcon"></span></h1> '+
			'<div ng-if="isVVIP() && isDiyTabActived && !saveImg" class="vvipgroup" >'+
				'<select id="select_vvip_id" class="select_vvip_id"  ng-disabled="mapModel.isLock" ng-model="vvipData" ng-change="vvipChange()" ng-model-options="{getterSetter: true}">'+
					'<option ng-value="vvipname" ng-repeat="vvipname in vvipDataModel.vvipExpandData track by $index" >{{vvipDataModel.allVvipDatas[vvipname]}}</option>'+
				'</select>'+
			'</div> '+
			'<div class="rightsidebar_zbbox2_biaoqian drag_handle"  ng-click="active()" id="indicator_rightsidebar_zbbox2_biaoqian{{$index}}">'+
				'<div class="rightsidebar_zbbox2_beijing" id="indicator_rightsidebar_zbbox2_beijing{{$index}}">'+
					'<img ng-src="{{ica.active ? imgBasePath + IMAGES.rightFloatLabelLine : imgBasePath + IMAGES.rightFloatLabelLine_dark}}" id="indicator_rightsidebar_zbbox2_beijingImg{{$index}}"/>'+
				'</div>'+
				'<h2 id="indicator_rightsidebar_zbbox2_label{{$index}}" uib-tooltip="{{getLabelText() | translate}}" ng-class="{rightsidebar_textColor : !ica.active ,rightsidebar_textColor_active : ica.active}">{{getLabelText() | translate}}</h2>'+
			'</div>'+
		'</div>'+
		'<div class="new_rightsidebar_label" id="indicator_new_rightsidebar_label{{$index}}">'+
			'<div class="imgbox" id="indicator_new_rightsidebar_imgbox{{$index}}">'+
				'<div class="imgbox_inner drag_handle" ng-click="active()">'+
		           '<img class="img_app" ng-src="{{getLabelIconUrl()}}" ng-class="{labelIconUnselected:!ica.active,labelIconSelected:ica.active}" />'+
	            '</div>'+
			'</div>'+
			'<div class="{{isUser?\'line1\' : \'line2\'}}" ng-show="!last" id="indicator_new_rightsidebar_line{{$index}}">'+
				'<a>'+
					'<img ng-src="{{isUser ? imgBasePath + IMAGES.rightFloatLabel_line : imgBasePath + IMAGES.rightFloatLabel_line}}"  id="indicator_new_rightsidebar_img{{$index}}"/>'+
				'</a>'+
			'</div>'+
		'</div>'+
	'</div>'+
	/*新加收回按钮*/
	'<div class="rightSideBarVisible" id="rightSideBarVisible" ng-click="rightSideBarVisible()">'+
	'	<a>'+
			'<img ng-src="{{right_SideBar_Visible?imgBasePath + IMAGES.rightLabelLine_light_btn:imgBasePath + IMAGES.rightLabelLine_btn}}"/>'+
	'	</a>'+
	'</div>'+
	'</div>'
	};
}]);