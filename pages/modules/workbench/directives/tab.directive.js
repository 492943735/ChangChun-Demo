var mainApp = angular.module("workbench");

mainApp.directive("tab", ["TabService", "CommonPath", "MenubarService", "playBackService", function(TabService, CommonPath, MenubarService, playBackService) {
	var linkFunc = function(scope) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.IMAGES = IMAGES;
		scope.playBackCover = playBackService.playBackCover;
		//当tabService中的tab页签数据改变时，scope中的tabs需要更新
		scope.$watch(function() {
			return TabService.getTabs();
		}, function(newVal, oldVal) {
			scope.tabs = newVal;
		});

		/**
		 * 获取当前激活tab页签的index
		 */
		scope.getActiveTabIndex = function() {
			if(TabService.getActiveTab()) {
				var activeTab = TabService.getActiveTab();
				return scope.tabs.indexOf(activeTab);
			}

		};
	};

	return {
		restrict: "EA",
		replace: true,
		scope: {
			workbenchHide: "="
		},
		link: linkFunc,
		template: '<div style="width: 100%; height: 100%" id="workbench_tab">' +
			'<div class="new_tab_menu_bor" id="workbench_tab_new_tab_menu_bor">' +
			'<img src="{{imgBasePath + IMAGES.mapborder}}" id="workbench_tab_new_tab_menu_bor_img"/>' +
			'</div>' +
			'<div class="benchTop" id="workbench_tab_benchTop">' +
			'<div class="new_tab_menu" id="workbench_tab_benchTop_new_tab_menu">' +
			'<div class="footer_top_menu" id="workbench_tab_benchTop_footer_top_menu">' +
			'<div ng-repeat="tab in tabs" id="workbench_tab_benchTop_footer_top_menu_tabs">' +
			'<tab-item item="tab.item" index="$index" isbefore="$index < getActiveTabIndex()"></tab-item>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'<div class="new_tab_menu_right_box" id="workbench_tab_benchTop_right_box"">' +
			'<div class="playBackCover" ng-show = "playBackCover.state"></div>' +
			'<playback></playback>' +
			'<div class="trapezoidBox">' +
			'<div class="trapezoid trapezoidRight"></div>' +
			'</div>' +
			'</div>' +
			'</div>' +

			'<tab-content active-tab="tabs[getActiveTabIndex()]" ></tab-content>' +
			'</div>'
	};
}]);