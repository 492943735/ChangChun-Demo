var settingApp = angular.module("setting");

settingApp.directive("setting", ["SettingService", "MenubarService", "CommonPath",
    function(SettingService, MenubarService, CommonPath)
{
	function linkFunc(scope) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.SettingService = SettingService;
		scope.diySceneGroups = SettingService.diySceneGroups;
		
		scope.$on("sceneGroupStatusChange", function(event, sceneGroup) {
			for(var i = 0; i < scope.diySceneGroups.length; i++) {
				if(scope.diySceneGroups[i] == sceneGroup) {
					sceneGroup.show = !sceneGroup.show;
					
					if(sceneGroup.show) {
						SettingService.setActivedLabelGroup(sceneGroup);
					}
				}
				else {
					scope.diySceneGroups[i].show = false;
				}
			}
		});
		
		scope.save = function() {
			if(SettingService.updataDiySelectedIca()){
				MenubarService.setSettingBarStatus(false);
			}
		};
		
		scope.cancel = function() {
			MenubarService.setSettingBarStatus(false);
		};
		
		scope.alertConfigModule = function() {
			SettingService.visibility = true;
		};
	}
	
	return {
		restrict: "E",
		replace: true,
		scope: {
		},
		link: linkFunc,
		template: '<div class="new_set_all zhujian" id="new_set_all_sceneRoot">'+
	    '<div class="set_main" id="new_set_all_sceneRoot_set_main">'+
		'<choose-img-mould></choose-img-mould>'+
		'<div class="set_diy" id="new_set_all_sceneRoot_set_diy">'+
		'<p class="title" id="new_set_all_sceneRoot_title">{{"i18n.setting.title" | translate}}</p>'+	
		'<label-group  ng-repeat="group in diySceneGroups" group="group"></label-group>'+	
		'</div>'+
		'<div class="set_anniu" id="set_anniu_div">'+
		'<span class="tishi" id="tishi_span_two"></span>'+
		'<input class="btn_sure" type="button" value=" {{ \'i18n.dialog.preservation\' | translate}}" ng-click="save()" id="preser_vation_btn"/>'+	
		'<input class="btn_no" type="button" value="{{ \'i18n.dialog.cancel\' | translate}}" ng-click="cancel()" id="cancel_btn"/>'+	
			
		'</div>'+
		'<tip-model></tip-model>'+
		'</div>'+
 '</div>'
	};
}]);