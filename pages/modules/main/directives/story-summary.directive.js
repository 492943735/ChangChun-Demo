angular.module("main").directive("storySummary", [ function() {
	var linkFunc = function(scope, elem, attr) {
		//输入正则匹配
        scope.onTitleKeyUp = function() {
        	if(scope.summary.title) {
        		var pattern = new RegExp("[!'\"<>&#;$|?＇＂＆＃；]","g");
    			scope.summary.title = scope.summary.title.replace(pattern, "");
        	}
		};
		
		scope.onConclusionKeyUp = function() {
			scope.summary.conclusion = replaceIllegalChar(scope.summary.conclusion);
	    };
		
		scope.onSuggestionKeyUp = function() {
			scope.summary.suggestion = replaceIllegalChar(scope.summary.suggestion);
		};
		
		function replaceIllegalChar(val) {
			var pattern0 = new RegExp("[!'\"&#;$|?＇＂＆＃；]", "g");
			val = val.replace(pattern0, "");
			
			return val;
		}
		//使文本框无滚动条，自由撑开高度
		autosize(document.querySelectorAll('textarea'));
	};

	return {
		restrict: "E",
		replace: true,
		scope: {
			summary: "="
		},
		link: linkFunc,
		template: '<div class="summary_main">'+
	'<div class="titlePlay">'+
		'<label for="titleName" class="col-md-3" id="main_quality_TipsName"><span class="normal_font">{{"i18n.story.summary.title" | translate }}:</span></label>'+
		'<input id="titlecontent" class="titlecontent" name="title" type="text" ng-model="summary.title" ng-keyup="onTitleKeyUp()"  maxlength="48" />'+	 
	'</div>'+
	'<div class="conclusionPlay">'+
		'<label for="conclusionContent" class="col-md-3" id="main_quality_TipsName"><span class="normal_font">{{"i18n.story.summary.conclusion" | translate }}:</span></label>'+
		'<textarea name="conclusion" ng-model="summary.conclusion" ng-keyup="onConclusionKeyUp()" maxlength="200"></textarea>'+
	'</div>'+
	'<div class="suggestionPlay">'+
		'<label for="suggestionContent" class="col-md-3" id="main_quality_TipsName"><span class="normal_font">{{"i18n.story.summary.suggestion" | translate }}:</span></label>'+
		'<textarea name="suggestion" ng-model="summary.suggestion" ng-keyup="onSuggestionKeyUp()"  maxlength="200"></textarea>'+
	'</div>'+
'</div>'
	};
}]);