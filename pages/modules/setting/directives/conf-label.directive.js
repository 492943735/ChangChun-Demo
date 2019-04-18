var settingApp = angular.module("setting");

settingApp.directive("confLabel" ,["SettingService", "labelService", "TabService", "CommonPath", "$translate", "tipWindow",
    function(SettingService, labelService, TabService, CommonPath, $translate, tipWindow)
{
	function linkFunc(scope) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.IMAGES = IMAGES;
		
		scope.getIconUrl = function() {
			var label = scope.label;
			
			if(label.iconUrl === "base64") {
				return label.iconData;
			}
			else{
				return CommonPath.imgLightBasePath + label.iconUrl;
			}
			
		};
		
		scope.click = function(event) {
			if (scope.canDelete) {
				if(scope.label.base) {
					return;
				}else{
					deleteConfirm(event);
				}
			}
			else{
				if(scope.label.type === LabelType.APP && !scope.label.selected) {
					var intAppNum = 0;
					var appLabels = SettingService.getAppLabels();
					
					for (var i = 0; i < appLabels.length ; i++) {
						var appItem = appLabels[i];
						if(appItem.selected){
							intAppNum++;
						}
					}

					if (intAppNum >= Constant.MAX_APP_LABEL_SHOW) {
						tipWindow.show(true, true, false, "i18n.setting.app.group.max.selected.rule");
						return;
					}
				}
				
				scope.label.selected = !scope.label.selected;
			}
		};
		
		scope.updateLabel = function(event){
			if(scope.label.base ) {
				return;
			}
			
			if(scope.canDelete) {
				deleteConfirm(event);
				return;
			}
			
			if(permissionMap.updatePermission){
				SettingService.imgDialog.addFlag = false;
				SettingService.imgDialog.label = angular.copy(scope.label);
				SettingService.imgDialog.showImgBox = true;
				SettingService.imgDialog.modelId = scope.label.text;
				SettingService.imgDialog.oldLabelName = scope.label.text;
				SettingService.changedImg.index = scope.index;
				SettingService.changedImg.type = scope.label.type;
				SettingService.changedImg.imgUrl = scope.label.iconUrl;
				event.stopPropagation();
				
				labelService.setLabelGroupType(scope.label.type);
			}
		};
		
		function deleteConfirm(event) {
			event.stopPropagation();
			var tipMsg = $translate.instant("i18n.setting.label.delete.tip.message");
			//提示框确认回调
			var sureCallback = function() {
				var requestData = {labelName: scope.label.text};

				labelService.deleteLabel(requestData).then(function() {
					SettingService.refreshData();
					TabService.refreshData();
				});
			};
			
			tipWindow.show(true, true, true, tipMsg, sureCallback, true);
		};
	}
	
	return {
		restrict: "E",
		replace: true,
		scope:{
			label: "=",
			index: "=",
			canDelete: "="
		},
		link: linkFunc,
		template: '<li style="display: inline-flex;" id="scene_confLabel{{$index}}">'+
		'<div class="all_one" ng-class="{scene_label_unselected: !label.selected}"'+
		   'ng-click="click($event)" ng-dblclick="updateLabel($event);">'+ 
			'<img ng-src="{{getIconUrl()}}" id="scene_confLabel_changeImg{{$index}}" ng-class="{labelIconUnselected:!label.selected,labelIconSelected:label.selected}">'+
			'<span class="ng-binding" id="scene_confLabel_label.text{{$index}}" uib-tooltip="{{label.label | translate}}">{{label.label | translate}}</span>'+
			'<span ng-if="canDelete && !label.base" class="removeLabel"></span>'+
		'</div>'+
		'<img ng-show="!canDelete"  ng-click="click()"  class="seetingLabel_MiniIcon" ng-src="{{label.selected ?  imgBasePath+IMAGES.checked : imgBasePath + IMAGES.checkbox}}" />'+
	'</li>'
	};
}]);