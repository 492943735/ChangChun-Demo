angular.module("common").directive("numberCheck", [function() {
	return {
		restrict: "A",
		require: "?ngModel",
		link: function(scope, elem, attr, ngModelCtrl) {
			if(!ngModelCtrl) {
				return;
			}
			
			elem.bind('keydown', function () {
	            scope.$apply(function() {
	            	ngModelCtrl.$render();
	            });
	        });
			
			function parseViewValue(viewValue) { //view --> model
				var numData = Number(viewValue); 
				if(isNaN(numData)) {
					ngModelCtrl.$setValidity("numberCheck", false);
					return undefined;
				}
				else {
					ngModelCtrl.$setValidity("numberCheck", true);
					return numData;
				}
			}
			
			function formatModelValue(modelValue) {
				return modelValue;
			}
			ngModelCtrl.$formatters.push(formatModelValue);
			ngModelCtrl.$parsers.unshift(parseViewValue);
		}
	}
}]);