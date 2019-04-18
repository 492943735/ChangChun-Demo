var mainApp = angular.module("workbench");

mainApp.directive("indicatorApp", ["TabService", function(TabService) {
	var linkFunc = function(scope, elem, attr) {
		/**
		 * 拖动的标签放入此标签的触发事件
		 */
		scope.onDropApp = function(event, ui, dragModel) {
			scope.onDrop(event, ui, dragModel);
			scope.$emit("swapAppLabel");
		};
	};
	
	return {
		restrict: "EA",
		replace: false,
		scope: {
			ica: "="
		},
		controller: "indicatorController",
		link: linkFunc,
		template: '<div id="workbench_indicator-allowDrag{{$index}}" class="facebook applicationItem"'+
						'ng-class="{selected: ica.inRightSidebar}" ng-style="{\'border-color\': ica.color}"'+
						'ng-click="labelClick(event)"'+
						'draggable drag-enable="allowDrag()" drag-model="ica"'+
						'drag-start="dragStart(event, ui)" drag-stop="dragStop(event, ui, $dragModel)">'+
						'<div droppable on-drop="onDropApp(event, ui, $dragModel)" accept="accept(dragElem)">'+
							'<h1 id="workbench_indicator-allowDrag_h1{{$index}}">'+
								'<img ng-src="{{getLabelIconUrl()}}"  id="workbench_indicator-allowDrag_img{{$index}}" ng-class="{labelIconUnselected:!ica.inRightSidebar,labelIconSelected:ica.inRightSidebar}"/>'+
								'<span uib-tooltip="{{ica.label | translate}}" ng-class="{unSelect: ica.unable}">{{ica.label | translate}}</span>'+
							'</h1>'+
							'<div class="flow_data flow_data_app" id="workbench_indicator-allowDrag_unit{{$index}}" ng-class="{unSelect: ica.unable}">'+
							'{{ica.data.data}}'+	
							'<span style="font-size: 1rem;">{{ica.data.unit}}</span>'+	
							'</div>'+
						'</div>'+
					'</div>'
	};
}]);