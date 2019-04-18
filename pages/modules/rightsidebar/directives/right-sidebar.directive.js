var rightSidebar = angular.module("sidebar.right");

rightSidebar.directive("rightSidebar", [function() {
	var linkFunc = function(scope, elem, attr) {
	};
	
	return {
		restrict: "E",
		replace: true,
		scope: {
			mapModel : "="
		},
		link: linkFunc,//添加了ng-if='($index == mapModel.icaAreas.length-1)?true:false' 用来判断显示最后一个点击的标签
		template: "<div class='rightsidebar zhujian' id='rightsidebar_zhujian'>"+
	"<indicator-area ng-repeat='ica in mapModel.icaAreas' ng-if='($index == mapModel.icaAreas.length-1)?true:false' ica='ica' last='$last' index='$index' map-model='mapModel'></indicator-area>"+
"</div>"
	};
}]);