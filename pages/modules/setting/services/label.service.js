angular.module("setting").factory("labelService", ["$http", "SettingService", "$timeout", "indicatorQueryService",
function($http, SettingService, $timeout, indicatorQueryService) {
	var config = {
		data: {},
		dimensions: [],
		userIndicators: [],
		appIndicators: [],
		kqiIndicators: [],
		nowType: LabelType.USER,
		modelInfo: {dimension: null, indicator: null}
	};
	
	function init() {
		$http.post("diy/getLabelConfig.action").then(function(data) {
			config.data = data.data;
		});
		
		initUserIndicators();
		initAppIndicators();
		initKqiIndicators();
	}
	
	/**
	 * 获取其他app中的用户数
	 */
	function getOtherUserIndicators(userIndicators) {
		var other = [];
		
		for(var i in userIndicators) {
			if(userIndicators[i].id !== Constant.SUBS_NUM) {
				other.push(userIndicators[i]);
			}
		}
		
		return other;
	}
	
	/**
	 * 设置当前标签组的类型
	 */
	function setLabelGroupType(type) {
		var isAdd = SettingService.imgDialog.addFlag;
		config.nowType = type;
		
		if (type === LabelType.USER) {
			config.dimensions = angular.copy(config.data.userLabels);
			var others = getOtherUserIndicators(config.userIndicators);
			for(var i in others) {
				config.dimensions.push({id: others[i].id, name: others[i].label});
			}
			config.modelInfo.dimension = config.dimensions[0];
			
			if(config.userIndicators[0]) {
				config.modelInfo.indicator = config.userIndicators[0].id;
			}
		}
		else if (type === LabelType.APP) {
			config.dimensions = config.data.appLabels;
			config.modelInfo.dimension = config.dimensions[0];
			if(config.appIndicators[0]) {
				config.modelInfo.indicator = config.appIndicators[0].id;
			}
		}
		else if (type === LabelType.KQI) {
			config.dimensions = []; //"kqi/kpi 没有纬度!"
			config.modelInfo.dimension = null;
			if(config.kqiIndicators[0]) {
				config.modelInfo.indicator = config.kqiIndicators[0].id;
			}
		}
		
		if (!isAdd) { //更新label时，select需要选中正确的数据
			var dimStr = SettingService.imgDialog.label.dimension;
			setDimension(dimStr, type);
			config.modelInfo.indicator = SettingService.imgDialog.label.indicator;
		}
		
		//通知select2框架代码已经更新，需要重载
		$timeout(function() {
			$("#Dimension_Select").change();
			$("#Indicator_select").change();
		});
	};
	
	function setDimension(dimStr, type) {
		var dims = config.dimensions;
		
		if (type === LabelType.APP) {
			for(var i in dims) {
				if(dims[i].appId.toString() == dimStr) {
					config.modelInfo.dimension = dims[i];
					break;
				}
			}
		}
		else if(type === LabelType.USER && !SettingService.imgDialog.label.base) {
			for(var j in dims) {
				if(angular.toJson(dims[j]) === dimStr) {
					config.modelInfo.dimension = dims[j];
					break;
				}
			}
		}
	}
	
	/**
	 * 初始化可选的应用指标列表
	 */
	function initAppIndicators() {
		indicatorQueryService.queryAppIndicators(function(appIndicators) {
			$timeout(function() {
				config.appIndicators = appIndicators;
			});
		});
	}
	
	/**
	 * 初始化可选的KQI指标列表
	 */
	function initKqiIndicators(callback) {
		indicatorQueryService.queryKqiIndicators(function(kqiIndicators) {
			$timeout(function() {
				config.kqiIndicators = kqiIndicators;
				if(callback) {
					callback();
				}
			});
		});
	}
	
	/**
	 * 当选择的user纬度值改变时需要重新设置指标列表
	 */
	function initUserIndicators() {
		indicatorQueryService.queryUserIndicators(function(userIndicators) {
			$timeout(function() {
				config.userIndicators = userIndicators;
			});
		});
	}
	
	/**
	 * 获取可选的用户指标列表
	 */
	function getIndicators() {
		var type = config.nowType;
		
		if(type === LabelType.USER) {
			var others = getOtherUserIndicators(config.userIndicators);
			if(others.length === 0) {
				return config.userIndicators;
			}
			
			var userIndi = [];
			
			for(var i in others) {
				if(config.modelInfo.dimension && others[i].id === config.modelInfo.dimension.id) {
					userIndi.push(others[i]);
					return userIndi;
				}
			}
			
			var configUserIndi = config.userIndicators;
			
			for(var m in configUserIndi) {
				for(var n in others) {
					if(others[n].id !== configUserIndi[m].id) {
						userIndi.push(configUserIndi[m]);
					}
				}
			}
			
			return userIndi;
		}
		else if(type === LabelType.APP) {
			return config.appIndicators;
		}
		else if(type === LabelType.KQI) {
			return config.kqiIndicators;
		}
	}
	
	function addLabel(data) {
		return $http.post("diy/addLabel.action", data);
	}
	
	/**
	 * 更新label图片，纬度和指标，需要重新加载控制台数据
	 */
	function updateLabel(data) {
		return $http.post("diy/updateLabel.action", data);
	}
	
	function deleteLabel(data) {
		return $http.post("diy/deleteLabel.action", data);
	}
	
	return {
		config: config,
		init: init,
		setLabelGroupType: setLabelGroupType,
		addLabel: addLabel,
		updateLabel: updateLabel,
		deleteLabel: deleteLabel,
		getIndicators: getIndicators
	};
}]);