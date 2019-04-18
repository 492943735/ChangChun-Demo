var mainApp = angular.module("main",
	["common", "setting", "workbench", "sidebar.left", "sidebar.right"]
);
mainApp.controller("MainController",
	["$scope", "$timeout", "$interval", "$http", "MenubarService", "gisMapService", "TabService", "loadingInterceptor",
	 "settingService", "labelService", "RightSidebarService", "storyLineService", "homePageService","CommonPath","LeftService",  MainController]
);

function MainController($scope, $timeout, $interval, $http, MenubarService, gisMapService, TabService,
	loadingInterceptor, settingService, labelService, RightSidebarService, storyLineService, homePageService,CommonPath, LeftService)
{
	$scope.imgBasePath = CommonPath.imgBasePath;
	$scope.IMAGES = IMAGES;
	$scope.mapData = gisMapService.mapData;
	$scope.settingMenuBarVisiable = false;
	$scope.loadingInterceptor = loadingInterceptor;
	$scope.tabService = TabService;
	$scope.storyLineService = storyLineService;
	$scope.workBenchVisiable = true;
	$scope.saveImg = MenubarService.saveImg;
	$scope.openImg = MenubarService.openImg;
	$scope.homePageService = homePageService;
	$scope.accessModel = LeftService.accessModel;
	$scope.locationModel = LeftService.locationModel;
	$scope.settingClick =  MenubarService.settingClick();
	$timeout(function() {
		gisMapService.initGisModel();
	}, 1000);
	
	$scope.settingBarIsActive = function() {
		return MenubarService.settingBarIsActive();
	};
	
	$scope.$watch($scope.settingBarIsActive, function(newVal, oldVal) {
		if(newVal !== oldVal && newVal) {
				settingService.loadData();
		}
	});
	
	$("body").click(function() {
		$("#playBack_dateInput").blur();
		changeLoadTime();
	});
}
