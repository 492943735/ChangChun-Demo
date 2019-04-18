var mainApp = angular.module("main");

mainApp.directive("menubarSave", ["MenubarService", "storyFilterService", "TabService", "RightSidebarService", "storyLineService", "SettingService","$translate", "tipWindow",
    function(MenubarService, storyFilterService, TabService, RightSidebarService, storyLineService, SettingService, $translate, tipWindow)
{
	var linkFunc = function(scope, elem, attr) {
		scope.saveImg = MenubarService.saveImg;
		
		/**
		 * 点击保存故事线菜单
		 */
		scope.saveClick = function() {
			var activedTab = TabService.getActiveTab();
			
			if(isEqualIgnoreCase(activedTab.item.text, I18N_KEY.DIY)) { //save story line
				if (0 === RightSidebarService.getIcaAreas().length) {
					tipWindow.show(true, true, false, $translate.instant("i18n.save.storyLine.selectIndicator"));
					return;
				}
				
				scope.saveImg.isActive = !scope.saveImg.isActive;
				RightSidebarService.eventEnable.dragLabel = false;
				RightSidebarService.eventEnable.clickLabel = false;
				storyLineService.storyData.isEdit = false;
				storyLineService.initSaveData();
				storyFilterService.setColsData();
			}
			else {
				storyLineService.hasEditAuth(activedTab.item.text, function(canEdit) {
					if(canEdit) { // 是否可以编辑故事线
						scope.saveImg.isActive = !scope.saveImg.isActive;
						storyLineService.storyData.isEdit = true;
						storyLineService.copyStoryData();
					}
					else { //提示没有编辑故事线权限的消息
						tipWindow.show(true, true, false, "i18n.story.message.noEditAuthority", null, true);
					}
				});
			}
		};
	};

	return {
		restrict : "E",
		replace : true,
		scope : {
			menu : "="
		},
		link : linkFunc,
		template : '<div class="rightTopTap" id="main_rightTopTap">'+
		'<img id="main_rightTopTap_saveImg" ng-src="{{saveImg.isActive ? saveImg.activeIconUrl : saveImg.iconUrl}}" ng-click="saveClick()"/>'+
		'</div>'
	};
}]);