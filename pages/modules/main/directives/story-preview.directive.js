var mainApp = angular.module("main");

mainApp.directive("storyPreview", ["CommonPath", "gisMapService", "LeftService",
    function(CommonPath, gisMapService, LeftService)
{
	var linkFunc = function(scope, elem, attr) {
		scope.mapModel = gisMapService.getActivedMapModel();
		//获取阈值数据
		scope.thresholdData = scope.mapModel.gisMap.thresholdData;
		scope.allAccess = true;//是否为全制式
		scope.notConfigThresholdData = function() {
			return scope.thresholdData == null || scope.thresholdData.colorList.length == 0;
		}
		scope.getThresholdItemShowVal = function(item, index){
			var str = item.minVal;
			if(scope.thresholdData.rangeType == "0"){
				str += "%";
			}
			str += " <= X <";
			if(index == scope.thresholdData.colorList.length - 1){
				str += "=";
			}
			str += " " + item.maxVal;
			if(scope.thresholdData.rangeType == "0"){
				str += "%";
			}
			return str;
		};
	};
	
	return {
		restrict: "E",
		replace: true,
		scope: {},
		link: linkFunc,
		template: '<div class="preview-template clearfix">'+
	'<div class="previewBand previewSmallWindow" id = "preview-band">'+
		'<h4 class="BandTitle"><span class="normal_font">{{"i18n.band.title" | translate }}</span></h4>'+
		'<div class = "bandBorder">'+
			'<div id="storyAccess" class="previewBandScroll storyAccess" ng-scrollbar>'+
				'<story-access></story-access>'+
			'</div>'+
		'</div>'+
	'</div>'+
	
	'<div class="previewThreshold previewSmallWindow" id = "preview-threshold">'+
		'<h4 class="ThresholeTitle"><span class="normal_font">{{"i18n.band.threshole" | translate }}</span></h4>'+
		'<div class = "thresholdBorder">'+
			'<div ng-if="!notConfigThresholdData()" class="previewBandScroll" ng-scrollbar>'+
				'<div ng-repeat="item in thresholdData.colorList"> '+
					'<div class="Threshold_row"> '+
						'<label class="cursorWidth"> '+
							'<input type="checkbox" name="chooseWidth" class="chooseWidth" /> '+
							'<span class="inputImg" ng-style = "{backgroundColor:\'{{item.colorVal}}\'}">'+
								'<i ng-show="item.checked" class="glyphicon glyphicon-ok thresholdCheckedColor"></i>'+
							'</span>'+
						'</label> '+
						'<span class="checkBoxTxt Threshold_checkBoxTxt preview_checkBoxTxt" ng-class="{thresholdNotCheckedTxt : !item.checked}" \'uib-tooltip="{{getThresholdItemShowVal(item,$index);}}">'+
							'{{getThresholdItemShowVal(item,$index);}}'+
						'</span>'+
					'</div>'+
				'</div>'+
			'</div>'+
			'<div ng-if="notConfigThresholdData()" class="notConfigThresholdData">'+
				'<span>{{"i18n.null.threshole" | translate }}</span>'+
			'</div>'+
		'</div>'+
	'</div>'+
	
	'<div class="previewIndicator previewSmallWindow" id = "preview-indicator">'+
		'<right-sidebar map-model="mapModel" class = "indicatorLabel"></right-sidebar>'+
	'</div>'+
'</div>'
	};
}]);
