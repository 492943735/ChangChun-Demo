angular.module("workbench").factory("indicatorService", [function() {
	//基字体大小
	var fontSizeRoot = $("html").css("font-size").replace(/[^\d.]/g, '');//全部范围匹配不是任意数字字符
	
	return {
		fontSizeRoot: fontSizeRoot
	};
}]);