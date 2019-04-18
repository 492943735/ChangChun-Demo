var mainApp = angular.module("workbench");
mainApp.directive("storyScenario", ["$http","storyLineService","TabService","gisMapService","$translate","tipWindow",
    function($http,storyLineService, TabService,gisMapService,$translate,tipWindow) {
		var linkFunc = function(scope,elem,attr){
			scope.$watch(function() {
				return storyLineService.getScenarioData();
			}, function(newVal, oldVal) {
				if(newVal !== oldVal && newVal.showflag) {
					scope.scenarioData = newVal;
					var summary = scope.scenarioData.data;
					
					summary.conclusion = formatSpecificChar(summary.conclusion);
					summary.suggestion = formatSpecificChar(summary.suggestion);
				}
			}, true);
			
			/**
			 * 故事线导出
			 */
			scope.exportData= function(){
	
				scope.scenarioData.showflag = false;
				var mapModel = gisMapService.getActivedMapModel();
				var queryParams = mapModel.gisMap.getQueryParams();
				
				$("#params").attr("value", JSON.stringify(queryParams));
			  var storyData = storyLineService.getScenarioData();
			   if (storyData.data.title == "FUP") {
				  var resultdata=[];
					var sdr_data_export_url="data/sdr_export_fup.csv";
					Papa.parse(sdr_data_export_url, {
						download: true,
						complete: function (results) {
						resultdata=results.data;
						var ShowLabel = ["Time","CellName(ID)","Longitude","Latitude","IMSI","MSISDN","User Traffic(MB)"];
						var arrData = resultdata;
						var excel = '<table>';
						// 设置数据
						for (var i = 0; i < arrData.length; i++) {
							var row = "<tr>";

							for ( var index in arrData[i]) {
								var value = arrData[i][index] === "." ? "" : arrData[i][index];
								row += '<td>' + value + '</td>';
							}

							excel += row + "</tr>";
						}

						excel += "</table>";

						var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
						excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
						excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel';
						excelFile += '; charset=UTF-8">';
						excelFile += "<head>";
						excelFile += "<!--[if gte mso 9]>";
						excelFile += "<xml>";
						excelFile += "<x:ExcelWorkbook>";
						excelFile += "<x:ExcelWorksheets>";
						excelFile += "<x:ExcelWorksheet>";
						excelFile += "<x:Name>";
						excelFile += "{worksheet}";
						excelFile += "</x:Name>";
						excelFile += "<x:WorksheetOptions>";
						excelFile += "<x:DisplayGridlines/>";
						excelFile += "</x:WorksheetOptions>";
						excelFile += "</x:ExcelWorksheet>";
						excelFile += "</x:ExcelWorksheets>";
						excelFile += "</x:ExcelWorkbook>";
						excelFile += "</xml>";
						excelFile += "<![endif]-->";
						excelFile += "</head>";
						excelFile += "<body>";
						excelFile += excel;
						excelFile += "</body>";
						excelFile += "</html>";

						var uri = 'data:application/vnd.ms-excel;charset=utf-8,'
								+ encodeURIComponent(excelFile);

						var link = document.createElement("a");
						link.href = uri;

						link.style = "visibility:hidden";
						link.download = "ExportFile" + ".xls";

						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						}
					});
			  }else if (storyData.data.title == "Capacity") {
				  var resultdata=[];
					var sdr_data_export_url="sdr_export_cap.csv";
					Papa.parse(sdr_data_export_url, {
						download: true,
						complete: function (results) {
						resultdata=results.data;
						var ShowLabel = ["Time","CellName(ID)","Longitude","Latitude","IMSI","MSISDN","User Traffic(MB)"];
						var arrData = resultdata;
						var excel = '<table>';
						// 设置数据
						for (var i = 0; i < arrData.length; i++) {
							var row = "<tr>";

							for ( var index in arrData[i]) {
								var value = arrData[i][index] === "." ? "" : arrData[i][index];
								row += '<td>' + value + '</td>';
							}

							excel += row + "</tr>";
						}

						excel += "</table>";

						var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
						excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
						excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel';
						excelFile += '; charset=UTF-8">';
						excelFile += "<head>";
						excelFile += "<!--[if gte mso 9]>";
						excelFile += "<xml>";
						excelFile += "<x:ExcelWorkbook>";
						excelFile += "<x:ExcelWorksheets>";
						excelFile += "<x:ExcelWorksheet>";
						excelFile += "<x:Name>";
						excelFile += "{worksheet}";
						excelFile += "</x:Name>";
						excelFile += "<x:WorksheetOptions>";
						excelFile += "<x:DisplayGridlines/>";
						excelFile += "</x:WorksheetOptions>";
						excelFile += "</x:ExcelWorksheet>";
						excelFile += "</x:ExcelWorksheets>";
						excelFile += "</x:ExcelWorkbook>";
						excelFile += "</xml>";
						excelFile += "<![endif]-->";
						excelFile += "</head>";
						excelFile += "<body>";
						excelFile += excel;
						excelFile += "</body>";
						excelFile += "</html>";

						var uri = 'data:application/vnd.ms-excel;charset=utf-8,'
								+ encodeURIComponent(excelFile);

						var link = document.createElement("a");
						link.href = uri;

						link.style = "visibility:hidden";
						link.download = "ExportFile" + ".xls";

						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						}
					});
			  }else {
				  var resultdata=[];
					var sdr_data_export_url="sdr_export_cov.csv";
					Papa.parse(sdr_data_export_url, {
						download: true,
						complete: function (results) {
						resultdata=results.data;
						var ShowLabel = ["Time","CellName(ID)","Longitude","Latitude","IMSI","MSISDN","User Traffic(MB)"];
						var arrData = resultdata;
						var excel = '<table>';
						// 设置数据
						for (var i = 0; i < arrData.length; i++) {
							var row = "<tr>";

							for ( var index in arrData[i]) {
								var value = arrData[i][index] === "." ? "" : arrData[i][index];
								row += '<td>' + value + '</td>';
							}

							excel += row + "</tr>";
						}

						excel += "</table>";

						var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
						excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
						excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel';
						excelFile += '; charset=UTF-8">';
						excelFile += "<head>";
						excelFile += "<!--[if gte mso 9]>";
						excelFile += "<xml>";
						excelFile += "<x:ExcelWorkbook>";
						excelFile += "<x:ExcelWorksheets>";
						excelFile += "<x:ExcelWorksheet>";
						excelFile += "<x:Name>";
						excelFile += "{worksheet}";
						excelFile += "</x:Name>";
						excelFile += "<x:WorksheetOptions>";
						excelFile += "<x:DisplayGridlines/>";
						excelFile += "</x:WorksheetOptions>";
						excelFile += "</x:ExcelWorksheet>";
						excelFile += "</x:ExcelWorksheets>";
						excelFile += "</x:ExcelWorkbook>";
						excelFile += "</xml>";
						excelFile += "<![endif]-->";
						excelFile += "</head>";
						excelFile += "<body>";
						excelFile += excel;
						excelFile += "</body>";
						excelFile += "</html>";

						var uri = 'data:application/vnd.ms-excel;charset=utf-8,'
								+ encodeURIComponent(excelFile);

						var link = document.createElement("a");
						link.href = uri;

						link.style = "visibility:hidden";
						link.download = "ExportFile" + ".xls";

						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						}
					});
			  }
			} ;
				
			 /**
			 * 故事线关闭
			 */
		     scope.closeScenario= function(){
		    	 scope.scenarioData.showflag = false;
		     };
		};
    return{
		restrict : "E",
		replace: true,
		scope : {
		},
		link : linkFunc,
		template : '<div class="tipModel scenario_bg" ng-show="scenarioData.showflag">'+
						'<div class="tipBox scenario_tipBox">'+
							'<p class="tipTitle">'+
								'<span class="tipTitleMsg" uib-tooltip="{{scenarioData.data.title}}">{{scenarioData.data.title}}</span>'+
							'</p>'+
							'<div class="scenario_tipMessage" ng-if="scenarioData.showflag" ng-scrollbar>'+
								'<div>'+
									'<span class="scenario_title">{{\'i18n.story.summary.conclusion\' | translate}}:</span>'+
									'<p class="scenario_txt">{{scenarioData.data.conclusion}}</p>'+
								'</div>'+
								'<div>'+
									'<span class="scenario_title">{{\'i18n.story.summary.suggestion\' | translate}}:</span>'+
									'<p class="scenario_txt">{{scenarioData.data.suggestion}}</p>'+
								'</div>'+
							'</div>'+
							'<div class="scenarioBtnBox scenario_btnBox ">'+
							'	<button class="btn_sure"  ng-if="scenarioData.data.canExport"  ng-click="exportData()"> {{\'i18n.story.summary.scenario.export\' | translate}}</button>'+
							'	<button class="btn_no" ng-click="closeScenario()">{{\'i18n.story.summary.scenario.close\' | translate}}</button>'+
							'</div>'+
						'</div>'+
					'</div>'


    };
}]);