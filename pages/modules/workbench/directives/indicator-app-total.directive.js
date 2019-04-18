angular.module("workbench").directive("indicatorAppTotal", [function() {
	var linkFunc = function(scope, elem, attr) {
		
	};
	
	return {
		restrict: "E",
		replace: false,
		scope: {
			ica: "="
		},
		controller: "indicatorController",
		link: linkFunc,
		template: '<div class="totalBox" ng-class="{totalBox_unselect: ica.unable, totalBox_selected: ica.inRightSidebar}"'+
		'ng-click="labelClick(event)" draggable drag-enable="allowDrag()" drag-model="ica"'+
		'drag-start="dragStart(event, ui)" drag-stop="dragStop(event, ui, $dragModel)">'+
		'<span class="totalTitle" ng-class="{totalBox_unselect: ica.unable}">全部</span>'+
		'<div class="totalBody">'+
		'<span class="totalNum">{{ica.data.data}}</span>'+
			'<span class="totalUnit">{{ica.data.unit}}</span>'+
		'</div>'+
		'</div>'
	};
}]);