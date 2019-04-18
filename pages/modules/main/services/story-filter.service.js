angular.module("main").factory("storyFilterService", ["$http", "TabService", function($http, TabService)
{
	var cols= [];
	var ops = [">", ">=", "<", "<=", "=", "ISNOTNULL"];
	var relations = ["AND"];
	var userFilters = [];
	var data = {cols: cols, ops: ops, relations: relations, filters: userFilters}
	
	function getFilterData() {
		return data;
	}
	
	function setColsData() {
		var icas = TabService.getIcasInActivedTabByType(LabelType.KQI);
		cols.splice(0, icas);
		
		for(var i = 0; i < icas.length; i++) {
			cols.push(icas[i]);
		}
		
		userFilters.splice(0, userFilters.length);
	}
	
	return {
		setColsData: setColsData,
		getFilterData: getFilterData
	};
}]);