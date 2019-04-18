angular.module("setting").factory("indicatorQueryService", ["$http", "labelI18nService",  function($http, labelI18nService) {
	
	function ajaxPostForm(url, param, sucCallback, errorCallback) {
		if(typeof param !== "string") {
			param = JSON.stringify(param);
		}
		
		$.ajax({
			type : "post",
			url: url,
			beforeSend: function(req) {
				if(_csrf_header && _csrf){
					req.setRequestHeader(_csrf_header, _csrf);
				}
			},
			data: {
				condition: param
			},
			contentType : "application/x-www-form-urlencoded",
			success: function(data) {
				console.debug(data);
				sucCallback(data);
			},
			error: function(errorData) {
				console.error(errorData);
				errorCallback(errorData);
			}
		});
	}
	
	function getRequestInfo(templateId) {
		return $http.post("diy/getRequestInfo.action", {
			templateId: templateId
		});
	}
	

	function queryIndicators(templateId, locale, sucCallback) {
		getRequestInfo(templateId).then(function(reqInfo) {
			var url = requestContext + "/plat/service/v1/" + locale + "/dimkqi/query.action";
			url = url.replace("HDI_UI", "WEBCOMMON");
			ajaxPostForm(url, reqInfo.data, function(data) {
				var resultPrefix = locale + "v1";
				
				if(data.indexOf(resultPrefix) === 0) {
					data = data.substring(resultPrefix.length);
				}
				
				var jsonResult = JSON.parse(data);
				console.debug("queryIndicators success, result --> " + jsonResult);
				var kqis = JSON.parse(jsonResult.result).kqis;
				sucCallback(kqis);
			});
		});
	}
	
	function queryUserIndicators(callback) {
		queryIndicators(Constant.USER_QUERY_TEMPLATE_ID, localLanguage, function(indicators) {
			var userIndis = [];
			
			for(var index in indicators) {
				var indi = indicators[index];
				if(indi.checked) {
					userIndis.push({
						id: indi.id,
						label: indi.text,
					});
				}
			}
			
			callback(userIndis);
		});
	}
	
	function queryAppIndicators(callback) {
		queryIndicators(Constant.APP_QUERY_TEMPLATE_ID, localLanguage, function(indicators) {
			var appIndis = [];
			
			for(var index in indicators) {
				var indi = indicators[index];
				if(indi.checked) {
					appIndis.push({
						id: indi.id,
						label: indi.text,
					});
				}
			}
			
			callback(appIndis);
		});
	}
	
	function queryKqiIndicators(callback) {
		queryKqiIndicators2(localLanguage, callback);
		
		if("en_US" !== localLanguage) {
			queryKqiIndicators2("en_US");
		}
	}
	
	function queryKqiIndicators2(locale, callback) {
		queryIndicators(Constant.QUALITY_QUERY_TEMPLATE_ID, locale, function(indicators) {
			var kqiIndis = [];
			
			for(var index in indicators) {
				var indi = indicators[index];
				if(!indi.checked) {
					kqiIndis.push({
						id: indi.id,
						label: indi.text,
					});
					
					labelI18nService.setLocaleName(indi.id, indi.text, locale);
				}
			}
			
			if(callback) {
				callback(kqiIndis);
			}
		});
	}
	
	return {
		queryUserIndicators: queryUserIndicators,
		queryAppIndicators: queryAppIndicators,
		queryKqiIndicators: queryKqiIndicators
	};
}]);