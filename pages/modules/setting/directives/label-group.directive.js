var settingApp = angular.module("setting");

settingApp.directive("labelGroup", ["CommonPath", "SettingService", "labelService", function(CommonPath, SettingService, labelService) {
	function linkFunc(scope) {
		scope.IMAGES = IMAGES;
		scope.permissionMap = permissionMap;
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.canDelete = false;
		
		scope.changeVisable = function() {
			scope.$emit("sceneGroupStatusChange", scope.group);
		};
		
		scope.setlable = function(){
			SettingService.imgDialog.addFlag = true;
			SettingService.imgDialog.showImgBox =true;
			var labelType = scope.group.type;
			var labelIcon = null;
			
			if (labelType === LabelType.USER) {
				labelIcon = IMAGES.label_user_default;
			}
			else if (labelType === LabelType.APP) {
				labelIcon = IMAGES.label_psVolume;
			}
			else //KQI
			{
				labelIcon = IMAGES.label_index_default;
			}
			
			SettingService.imgDialog.label = {
				base: false,
				iconData: null,
				iconUrl: labelIcon,
				type: labelType
			};
			
			labelService.setLabelGroupType(labelType);
		};
		
		/**
		 * 是否显示增加按钮
		 */
		scope.showAddIcon = function() {
			if(!scope.permissionMap.addPermission) {
				return false;
			}
			
			if(scope.group.type === LabelType.APP && scope.group.labels.length >= 20) {
				return false;
			}
			else if(scope.group.labels.length >= 100) {
				return false;
			}
			
			return true;
		};
		
		scope.delIconClick = function() {
			scope.group.canDelete = !scope.group.canDelete;
		};
	} 
	
	return {
		restrict: "E",
		replace: true,
		scope: {
			group: "="
		},
		link: linkFunc,
		template: "<fieldset class='user' id='sceneGroup{{$index}}'>"+
	"<legend ng-click='changeVisable()' id='group_title_click'>"+
		"<span class='legendTitle'>"+
			"<span class='{{group.show ? \'set_cut\' : \'set_add\'}}'>"+
				"<img ng-src='{{group.show ? imgBasePath + IMAGES.jian_icon : imgBasePath + IMAGES.jia_icon}}'/>"+
			"</span>"+
			"<span uib-tooltip='{{group.title | translate }}'>{{group.title | translate }}</span>"+
		"</span>"+
	"</legend>"+
	"<ul class='content groupLabel' ng-if='group.show' ng-scrollbar id='group_show_div'>"+
		"<conf-label ng-repeat='label in group.labels' label='label' index='$index' can-delete='group.canDelete'></conf-label>"+
		"<li style='display: inline-flex;' ng-if='permissionMap.deletePermission || permissionMap.addPermission'>"+
			"<div ng-if='permissionMap.deletePermission' ng-click='delIconClick();' ng-class='{seetingGroupSelected: group.canDelete, seetingGroupNoSelect: !group.canDelete, seetingGroupBtnBg: !showAddIcon()}' class='all_one seetingGropBtn glyphicon glyphicon-minus addIcon diydellabel ' ></div>"+
			"<div class='all_one seetingGropBtn glyphicon glyphicon-plus addIcon diysetlable' ng-class='{seetingGroupBtnBg: !permissionMap.deletePermission}' ng-if='showAddIcon()' ng-click='setlable();' ></div>"+
		"</li>"+
	"</ul>"+
"</fieldset>"
	};
}]);