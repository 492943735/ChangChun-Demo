var frequencyModelApp = angular.module("sidebar.left");

frequencyModelApp.directive("frequencyModel", ["gisMapService", 
	function(gisMapService) {
		var linkFunc = function(scope, elem, attr) {
			scope.frequencyDataChecked = function(dataItem, $event) {
				$event.stopPropagation(); 
				if(gisMapService.getActivedMapModel().isLock){
            		return;
            	}
				dataItem.checked = !dataItem.checked;
			}
		};
		
	
		return {
			restrict : "E",
			replace : false,
			scope : {
				frequencyItem: "="
			},
			link : linkFunc,
			template : '<div class="row frequencyRow" ng-scrollbar>'+
			'<div ng-repeat="dataItem in frequencyItem" class="col-sm-6 frequencyTd" ng-click="frequencyDataChecked(dataItem, $event)">'+
			'<span class="frequencyFrom">'+
				'<input type="checkbox" name="chooseWidth" class="frequencyChooseWidth"/>'+ 
				'<span class="inputImg" ng-class="{inputImgChecked : dataItem.checked}">'+
					'<i ng-show="dataItem.checked" class="glyphicon glyphicon-ok frequencyGlyphicon"></i>'+
				'</span>'+
				'<span class="checkBoxTxt" ng-class="{checkBoxTxtChecked : dataItem.checked}" uib-tooltip="{{dataItem.frequency}}&nbsp;MHz">{{dataItem.frequency}}&nbsp;MHz</span>'+
			'</span>'+
		'</div>'+
	'</div>'
		};
} ]);