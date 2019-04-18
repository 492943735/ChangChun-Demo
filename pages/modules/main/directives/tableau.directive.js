var mainApp = angular.module("main");

mainApp.directive("tableau", [ "CommonPath", "tableauService", 
    function(CommonPath, tableauService)
{
	var linkFunc = function(scope, elem, attr) {
		scope.tableauURL = tableauService.tableauURL;
		scope.tableCloseButtionClick = function(){
			$("#tableauID").css("display", "none");
			$("#tableauIframe").src="";
			tableauService.tableauURL.data="";
		};
	};
	
	return {
		restrict : "E",
		replace : true,
		scope : {},
		link : linkFunc,
		template : '<div class="tableUiBox" id = "tableauID">'+
		'<div class="tableUiBody">'+
		'<input type="button" value="X" class="tableClose" ng-click="tableCloseButtionClick()"/>'+
		'<iframe  class = "tableau" id= "tableauIframe" ng-src= "{{tableauURL.data | trusted}}" >'+	
		'</iframe>'+	
		'</div>'+	
		'</div>'
	
	};
} ]);