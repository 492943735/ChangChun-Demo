angular.module("common").directive("tipModel", ["tipWindow", "CommonPath", "$translate", function(tipWindow, CommonPath, $translate) {
	function linkFunc(scope, elem, attr) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.IMAGES = IMAGES;
		scope.tipAllModelData = tipWindow.getTipWindow();
		
		//提示框确认按钮点击后的事件
		scope.tipSure = function($event) {
			if (scope.tipAllModelData.sureCallback) {
				scope.tipAllModelData.sureCallback();
			}
			tipWindow.hide();
			stopPropagation($event);
		};
		//提示框否认按钮点击后的事件
		scope.tipCancel = function($event) {
			tipWindow.hide();
			stopPropagation($event);
		};
		
		scope.licenseData = angular.copy(licenseData);
        if(licenseData.isHaveUserLicense && licenseData.licenseNumIllegal && licenseData.userLicenseNum < licenseData.hdiServiceUserNum){
			var tipMsg = $translate.instant("i18n.license.large");
			tipWindow.show(true, true, false, tipMsg, null,false,false,true);
		}
	}
	
	return {
		restrict: "E",
		replace: true,
		scope: {
		},
		link: linkFunc,
		template: "<div class='tipModel' ng-show='tipAllModelData.show'>"+
	"<div class='tipBox'>"+
		"<p class='tipTitle'>"+
			"<span class='tipTitleMsg'>{{tipAllModelData.title | translate}}</span>"+
		"</p>"+
		"<p class='tipMessage'>"+
			"<span ng-class='{warningIcon:tipAllModelData.warningState}'>"+
				"<img class='warningImg' ng-src='{{imgBasePath + IMAGES.ic_warning}}' />"+
			"</span>"+
			"<span class='tipImportant'>{{tipAllModelData.data | translate}}</span>"+
			"<input class='tipModelInput' ng-show='tipAllModelData.inputs'>"+
		"</p>"+
		"<div class='btnBox'>"+
			"<button ng-show='tipAllModelData.btnOk' class='btn_sure' ng-click='tipSure($event)'>{{"+"'i18n.dialog.confirm'"+" | translate}}</button>"+
			"<button ng-show='tipAllModelData.btnNo' class='btn_no' ng-click='tipCancel($event)'>{{"+"'i18n.dialog.cancel'"+" | translate}}</button>"+
		"</div>"+
	"</div>"+
"</div>"
	};
}]);