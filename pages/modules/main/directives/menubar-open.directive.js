var mainApp = angular.module("main");

mainApp.directive("menubarOpen", ["MenubarService", "storyLineService",
    function(MenubarService, storyLineService) {
	var linkFunc = function(scope, elem, attr) {
		scope.openImg = MenubarService.openImg;
		
		scope.openClick = function() {
			scope.openImg.isActive = !scope.openImg.isActive;
			
			if(scope.openImg.isActive) {
				storyLineService.loadUserAllStoryLine();
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
		template : '<div class="openStoryTab" id="open_story_tab">'+
		'<img class="openStoryTabImg" id="open_story_tab_img" ng-src="{{openImg.isActive ? openImg.activeIconUrl : openImg.iconUrl}}" ng-click="openClick()"/>'+
		'</div>'
	};
}]);