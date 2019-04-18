var common = angular.module("common", ["ui.bootstrap", "pascalprecht.translate", "widget.scrollbar", "dnd", "toaster"]);

/**
 * Common模块配置信息，添加$http拦截和处理国际化的配置
 */
common.config(["$httpProvider", "$translateProvider", "$uibTooltipProvider", "scrollbarConfigProvider",
    function($httpProvider, $translateProvider, $uibTooltipProvider, scrollbarConfigProvider)
{
    $httpProvider.interceptors.push("HttpRequestInterceptor");
    $httpProvider.interceptors.push("loadingInterceptor");
    if(_csrf_header == ''){
    	_csrf_header = 'testHeader';
    	_csrf = 'testHeaderContent';
    }
    $httpProvider.defaults.headers.common[_csrf_header] = _csrf;
    
    $translateProvider.useStaticFilesLoader({
        prefix: "../pages/i18n/",
        suffix: ".js"
    }).preferredLanguage(localLanguage);
    //配置tool-tip
    $uibTooltipProvider.options({
        animation: true,
        appendToBody: true,
        placement: "auto right",
        popupCloseDelay: 100,
        popupDelay: 100
    });
    
    //设置滚动条的默认配置
    scrollbarConfigProvider.setDefaultConfig({
    	scrollbar: {
            width: 6, //scrollbar width
            hoverWidth: 6, //scrollbar width when the mouse hover on it
            color: '#15363e' //scrollbar background color
        },
        scrollbarContainer: {
            width: 8, //scrollbarContainer width
            color: '#141a21' // scrollbarContainer background
        }
    });
}]);

/**
 * 拦截所有由$http发出的请求,在请求前面加上basePath
 */
common.factory("HttpRequestInterceptor", ["$q", "CommonPath", function($q, CommonPath) {
    return {
        request: function (config) {
            var url = config.url;
            
            //在模板的请求url上加上tplBasePath
            if(url.indexOf(".tpl.html") != -1) {
                config.url = CommonPath.tplBasePath + "/" + url;
            }
            else if(url.indexOf(".action") != -1) {
                config.url = CommonPath.basePath + "/" + url;
            }
            
            return config || $q.when(config);
        }
    };
}]);

common.filter('trusted', ['$sce', function ($sce) {
	return function(url) {
	return $sce.trustAsResourceUrl(url);
	};
	}]);
/**
 * Intercept all http request and response.
 */
common.factory("loadingInterceptor", ["$q", "$rootScope", function($q, $rootScope) {
    var loadingCount = 0;
    function noIntercept(config){
        var actionUrl= config.url;
        var noInterceptArray = ["workbench/swapIca.action", "workbench/icasLegalCombine.action", "workbench/queryDayHours.action"];

        for (var i = 0; i < noInterceptArray.length; i++) {
            if (actionUrl && actionUrl.indexOf(noInterceptArray[i]) !== -1 || Constant.playBackRuning) {
                return false;
            }
        };
        return true;
    }
    return {
        request: function(config) {
            if (noIntercept(config)){
                loadingCount++;
            }
            
            return config || $q.when(config);
        },
        response: function(response) {
            if (noIntercept(response.config) && loadingCount > 0){
                loadingCount--;
            }
            
            return response || $q.when(response);
        },
        responseError: function(response) {
            if (noIntercept(response.config) && loadingCount > 0){
                loadingCount--;
            }
            
            return $q.reject(response);
        },
        getloadingCount: function() {
            return loadingCount;
        },
        increaseLoadingCount : function(){
            if(!Constant.playBackRuning) {
            	loadingCount++;
            }
        },
        decreaseLoadingCount : function(){
            if(!Constant.playBackRuning && loadingCount > 0) {
            	loadingCount--;
            }
        },
        isLoading: function() {
        	return loadingCount !== 0;
        }
    };
}]);

/**
 * 获取basePath的服务,返回指令模板的根路径，图片的根路径
 */
common.factory("CommonPath", ["$location", function($location) {
	var requestContext="../";
    var basePath = requestContext;
    var tplBasePath = "../modules";
    var imgBasePath = "images/";
    var imgLightBasePath = "images/imageLight/";
    
    return {
        basePath: basePath,
        tplBasePath: tplBasePath,
        imgBasePath: imgBasePath,
        imgLightBasePath: imgLightBasePath
    };
}]);
