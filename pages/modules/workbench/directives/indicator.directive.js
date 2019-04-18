var mainApp = angular.module("workbench");

mainApp.directive("indicator", ["TabService", function(TabService) {
	var linkFunc = function(scope, elem, attr) {
		
	};
	
	return {
		restrict: "EA",
		replace: false,
		scope: {
			ica: "="
		},
		controller: "indicatorController",
		link: linkFunc,
		template: '<div id="workbench_tab_quality_boxx{{$index}}"  ng-show = "ica.checked" class="new_kqi col-md-5" ng-class="{selected: ica.inRightSidebar}"'+
					'ng-click="labelClick(event)"'+   
					'draggable drag-enable="allowDrag()" drag-model="ica"'+
					'drag-start="dragStart(event, ui)" drag-stop="dragStop(event, ui, $dragModel)">'+
					'<div class="new_tab_quality_box" id="workbench_tab_quality_boxx1{{$index}}"'+
						'droppable on-drop="onDrop(event, ui, $dragModel)" accept="accept(dragElem)">'+
						'<h1 id="workbench_tab_quality_h1{{$index}}">'+
							'<span ng-class="{unSelect: ica.unable}" uib-tooltip="{{ica.label | translate}}">{{ica.label | translate}}</span>'+
						'</h1>'+
						'<div class="flow_data" ng-class="{unSelect: ica.unable}">'+
							'{{ica.data.data}}'+
							'<span style="font-size: 1rem;" ng-show="ica.data.data !=\'--\'">{{ica.data.unit}}</span>'+
						'</div>'+
					'</div>'+
				'</div>'

	};
}]);