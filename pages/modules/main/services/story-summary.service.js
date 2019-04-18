angular.module("main").factory("storySummaryService", ["$http","TabService", function($http, TabService) {
	
	var summarydata = {
		title: "",
		conclusion: "",	 
		suggestion: "" 
	};
	var  storyName = TabService.getActiveTab.text;
	function getSummaryData() {
		$http.post("storeLine/getSummaryInfo.action", storyName).then(function(data) {
			 summarydata = data.data;
		});
	} 
	
	function getStorySummarydatas() {
		return summarydata;
	}
	
	return {
		getStorySummarydatas: getStorySummarydatas
	}; 
}]);