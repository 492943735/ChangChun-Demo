angular.module("main").factory("tableauService", ["$q", "$http", "tipWindow",
    function($q, $http,tipWindow)
{
	var tableauData = [];
	var tableauURL = {
			data:''
	};

	function getTableauURL(){
		$http({
			method : 'POST',
			url : 'tableau/getTableauURL.action',
		}).then(function(result){
			var code = result.data.data.stateCode;
			if("-1"=== code){
			}else{
				tableauURL.data = 	result.data.data.tableAuUrl;
			}
		});
	}
	
	return {
		tableauURL:tableauURL,
		getTableauURL: getTableauURL
	};
}]);