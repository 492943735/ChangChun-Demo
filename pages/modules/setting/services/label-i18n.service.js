angular.module("setting").factory("labelI18nService", ["$http", function($http) {
	var zhNameMap = {};
	var enNameMap = {};
	
	function getNameMap(locale) {
		return "zh_CN" === locale ? zhNameMap : enNameMap;
	}
	
	function setLocaleName(key, label, locale) {
		if(!locale) {
			locale = localLanguage;
		}
		
		getNameMap(locale)[key] = label;
	}
	
	function getLocaleName(key, locale) {
		return getNameMap(locale)[key];
	}
	
	/**
	 * 区分两标签的唯一标示
	 */
	function getLabelItemKey(labelItem) {
		var type = labelItem.type;
		
		if(LabelType.KQI === type) {
			return labelItem.indicator;
		}
		else if(LabelType.APP === type) {
			return labelItem.dimension;
		}
		else if(!labelItem.base) {
			return labelItem.dimension + "_" + labelItem.indicator;
		}
		else {
			return labelItem.text;
		}
	}
	
	function localeLabelItem(labelItem, locale) {
		if(!locale) {
			locale = localLanguage;
		}
		
		var key = getLabelItemKey(labelItem);
		
		if(!key) {
			return;
		}
		
		var i18nName = getNameMap(locale)[key];
		
		if(i18nName != null) {
			labelItem.label = i18nName;
		}
		
	}
	
	function localeLabelItems(labelItems, locale) {
		for(var i in labelItems) {
			localeLabelItem(labelItems[i], locale);
		}
	}
	
	return {
		setLocaleName: setLocaleName,
		getLocaleName: getLocaleName,
		localeLabelItem: localeLabelItem,
		localeLabelItems: localeLabelItems
	}
}]);