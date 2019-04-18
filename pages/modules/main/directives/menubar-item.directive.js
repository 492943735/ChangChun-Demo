var mainApp = angular.module("main");

mainApp.directive("menubarItem", [ "TabService","CommonPath", "$http", "$timeout", "gisMapService", "RightSidebarService",
   "SettingService","$translate", "MenubarService", "FloatmessageService", "TabService", "loadingInterceptor", "tipWindow", "LeftService", "tableauService", "storyLineService"
,function(TabService,CommonPath, $http, $timeout, gisMapService, RightSidebarService, SettingService, $translate,
    MenubarService, FloatmessageService, TabService, loadingInterceptor, tipWindow, LeftService, tableauService, storyLineService)
{
	
		if(gisMapService.getActivedMapModel().icaAreas.length>0){
			var dataArr=TabService.arrShowCommunity;
		}else{
			var dataArr=TabService.communityLabelData;
		}
	var linkFunc = function(scope, elem, attr) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.imgLightBasePath = CommonPath.imgLightBasePath;
		scope.IMAGES = IMAGES;
		scope.icaAreas = RightSidebarService.getIcaAreas();
		scope.setTipAllModelType = tipWindow.show;//调取tip
		//tableau集成
		scope.isVisiable = function() {
			if(scope.menu.name === "refresh") {
				return  false;
			}
			else if(scope.menu.name === "setting") {
				return  true;
			}
			else if(scope.menu.name === "export") {	
				
				return  true;
			}
			else if(scope.menu.name === "save") {	
				
				return  false;
			}else if(scope.menu.name === "seach") {	
				
				return  true;
			}else if(scope.menu.name === "memutop") {	
				
				return  false;
			}else if(scope.menu.name === "brush"){
				
				return  true;
			}
			else if(scope.menu.name === "tableau"){
				return  false;
			}
			
			return true;
		};
		
//		鼠标悬浮事件  --移入 
		scope.mouseIn = function() {
			if(!scope.menu.isActive) {
				scope.menu.hover = true;
			}
		}
//		鼠标悬浮事件  --移出
		scope.mouseOut = function() {
				scope.menu.hover = false;
		}
		
		function supportSetting() {
			//锁屏不支持diy setting
			if(gisMapService.mapData.isDoubleScreen == true && gisMapService.mapData.wholeMap.isLock) {
				return false;
			}
			
			return true;
		}
		
		scope.isDoubleWin2 = function() {
			return scope.menu.name === "draw" && gisMapService.mapData.isDoubleScreen == true
			   && gisMapService.mapData.activedMap.renderToId == gisMapService.mapData.rightMap.renderToId;
		}
		
		scope.menuIconClick = function(name) {
			if (scope.menu.name === "draw" && gisMapService.mapData.isDoubleScreen == true
					   && gisMapService.mapData.activedMap.renderToId == gisMapService.mapData.rightMap.renderToId) {
				tipWindow.show(true, true, false, "i18n.threshold.drawwarning");
				return;
			}
			scope.menu.isActive = !scope.menu.isActive;
			$timeout(function() {
				$(elem).find(".tooltip-inner").addClass("deriver_background");
				$(elem).find(".tooltip-arrow").css("border", "none");
			}, 100);
			
			if(name && name === "tableau"){
				scope.getTableauURL();
			}
				
			if(scope.menu.name=="brush"){
				scope.menu.isActive = !scope.menu.isActive;
				if(!gisMapService.mapData.activedMap.isLock){
					MenubarService.resetAll();//reset
				}
				MenubarService.setResetActive();//reset结束
				gisMapService.drawRegion([]);
			}
			if(name && name === "setting"){
				MenubarService.menusData[0].isActiv = true;
			}
		};
		
		scope.openStory = function() {
			var openImg = MenubarService.openImg;
			openImg.isActive = !openImg.isActive;
			
			if(openImg.isActive) {
				storyLineService.loadUserAllStoryLine();
			}
		}

		scope.saveStory = function() {
			var saveImg = MenubarService.saveImg;
			var activedTab = TabService.getActiveTab();
			
			if(isEqualIgnoreCase(activedTab.item.text, I18N_KEY.DIY)) { //save story line
				if (0 === RightSidebarService.getIcaAreas().length) {
					tipWindow.show(true, true, false, $translate.instant("i18n.save.storyLine.selectIndicator"));
					return;
				}
				saveImg.isActive = !saveImg.isActive;
				RightSidebarService.eventEnable.dragLabel = false;
				RightSidebarService.eventEnable.clickLabel = false;
				storyLineService.storyData.isEdit = false;
				storyLineService.initSaveData();
			}
			else {
				storyLineService.hasEditAuth(activedTab.item.text, function(canEdit) {
					if(canEdit) { // 是否可以编辑故事线
						saveImg.isActive = !saveImg.isActive;
						storyLineService.storyData.isEdit = true;
						storyLineService.copyStoryData();
					}
					else { //提示没有编辑故事线权限的消息
						tipWindow.show(true, true, false, "i18n.story.message.noEditAuthority", null, true);
					}
				});
			}
		}
		
		//绘制多边形
		scope.drawPolygon = function(){
			scope.menu.isActive = false;
			if(gisMapService.canDrawPologon()){
				if(gisMapService.pologonNeedClear()){
					tipWindow.show(true, true, true, "i18n.draw.tips", function(){
						scope.removePolygon();
						gisMapService.drawPolygon();
					});
				}
				else{
					gisMapService.drawPolygon();
				} 
			}
		};
		
		//清除多边形
		scope.removePolygon = function(){
			scope.menu.isActive = false;
			gisMapService.removeAllPolygon(function() {
				gisMapService.mapData.wholeMap.isPolygonLock = false;
			});
		};
		/*展示多边形*/
		scope.showPolygon= function(){
			scope.menu.isActive = true;
			if(angular.element("#polygonShowBox").is(':hidden')){
				angular.element("#polygonShowBox").show();
				angular.element("#polygonShowBoxicon").show();
			}else{
				angular.element("#polygonShowBox").hide();
				angular.element("#polygonShowBoxicon").hide();
			}	
		}
		scope.showPolygonList = function(index,e){
			// TODO 绘制多边形
			scope.menu.isActive = false;
			var data=angular.element(e.target).attr("ment");
			if(data!=undefined){
				var arrDataMap=[];
				for(var i=0;i<data.split("@").length;i++){
					arrDataMap.push([
						data.split("@")[i].split(",")[0]*1,data.split("@")[i].split(",")[1]*1
					])
				}
				if(gisMapService.canDrawPologon()){
					if(gisMapService.pologonNeedClear()){
						tipWindow.show(true, true, true, "i18n.dataDraw.tips", function(){
							scope.removePolygon();
							gisMapService.dataDrawPlaygon(arrDataMap);
							gisMapService.syncLeftAndRightWithMainMap();
						});
					}
					else{
						gisMapService.dataDrawPlaygon(arrDataMap);
						gisMapService.syncLeftAndRightWithMainMap();
					} 
				}
			}
		}
	
		//根据传递过来的配置url获取请求TableauServer的URL。
		scope.getTableauURL = function(){
			scope.menu.isActive = false;
			$("#tableauID").css("display", "block");
			$timeout(function() {
				$(".tableUiBody").css('width', viewWidth+"%");
				$(".tableUiBody").css('height', viewHeight+"%");
				$timeout(function() {
					var viewHeightScren = $(".tableUiBody").outerHeight();
					$(".tableUiBody").css('margin-top', viewHeightScren/-2) + "px";
				},0);
			},0);
			tableauService.getTableauURL();
		};
		
		//同步导出方法
		function synExport(params){
			getLabels(function(labels) {
				$http({
					method : 'POST',
					url : 'export/sendDataToServer.action',
					data : JSON.stringify(params)
				}).then(function(result) { // 正确请求成功时处理
					$("#exportUuid").attr("value", result.data.uuid);
					$("#exportRequestTime").attr("value", result.data.requestTime);
					$("#exportFileName").attr("value", RightSidebarService.getMapTitle());
					$("#exportLables").attr("value", JSON.stringify(labels));
					$("#exportTime").attr("value", gisMapService.mapData.activedMap.time);
					$("#exportForm").submit();
					loadingInterceptor.decreaseLoadingCount();
				});
			});
		}

		function getLabels(callback) {
			var mapModel = gisMapService.getActivedMapModel();
			var params = mapModel.gisMap.getQueryParams();
			params.polygon.cellIds = [];
			
			if (mapModel.bindMapModel && mapModel.bindMapModel.isLock && mapModel.gisMap.polygonData.length != 0) {
				mapModel.gisMap.getCurrentLayerCellIds(function() {
					params.polygon.cellIds = mapModel.gisMap.backendCellIds;
					params.polygon.type = params.polygon.cellIds > 300 ? "byCellLatAndLng" : "byCellIDs";
					callback(params);
				});
			}
			else {
				callback(params);
			}
		}
		
		function checkIfRaster(){
			var mapModel = gisMapService.getActivedMapModel();
			var params = mapModel.gisMap.getQueryParams();
			return gisMapService.getActivedMapModel().gisMap.isRenderRSRXByRaster(params);
		}
		
		function arrayToCsv(data, args) {
			args = args || {};
		    var columnDelimiter = args.columnDelimiter || ',';
		    var lineDelimiter = args.lineDelimiter || '\n';

			return data.reduce(function(csv, row){
			    var rowContent = Array.isArray(row)
			      ? row.reduce(function(rowTemp, col) {
			          var ret = rowTemp ? rowTemp + columnDelimiter : rowTemp;
			          if (col) {
			            var formatedCol = col.replace(/"/g, '"');
			            ret += formatedCol;
			          }
			          return ret;
			        }, '')
			      : row;
			    return (csv ? csv + lineDelimiter : '') + rowContent;
			  }, '');
		}
		
		scope.exportData = function(type) {
			var params=gisMapService.getQueryParams();
			var path = window.location.href;
			var pathStr = path.toString();
			var arr=pathStr.split(".");
			var endStr = arr[0];
			var resultdata=[];
			var sdr_data_export_url="data/sdr_export_fup.csv";
			Papa.parse(sdr_data_export_url, {
				download: true,
				complete: function (results) {
				resultdata=results.data;
				
				var ShowLabel = ["Time","CellName(ID)","Longitude","Latitude","IMSI","MSISDN","User Traffic(MB)"];
				var arrData = resultdata;
					if ("xls" == type) {
						var excel = '<table border=1>';

						var flag=" <tr height=18 style='height:13.5pt'>";
						flag+="<td height=18 width=72 style='height:13.5pt;width:54pt' align=left";
						flag+=" valign=top><span style='mso-ignore:vglayout;";
						flag+=" position:absolute;z-index:1;margin-left:0px;margin-top:0px;width:841px;";
						flag+=" height:471px'><img width=841 height=471 src="
						flag+= endStr
						flag+= "/image001.png alt=123.PNG ";
						flag+="  v:shapes='图片_x0020_1'></span></td></tr>";
						
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
						
						//兼容ie写法
						if (navigator.msSaveOrOpenBlob) {
							var BOM = '\uFEFF'; 
							var filename = 'export.xlsx';
							var blob = new Blob([BOM + excel], {type: "text/xlsx"});
						    navigator.msSaveOrOpenBlob(blob, filename);
						//其它浏览器写法
						}else{
							var uri = 'data:application/vnd.ms-excel;charset=utf-8,'
									+ encodeURIComponent(excelFile);
	
							var link = document.createElement("a");
							link.href = uri;
	
							link.style = "visibility:hidden";
							link.download = "ExportFile" + ".xlsx";
	
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
						}
					}else{
						const BOM = '\uFEFF'; 
						var filename = 'export.csv';
						
						const csv = arrayToCsv(resultdata);
						filename = filename || 'export.csv';
						
						//兼容ie写法
					    if (navigator.msSaveOrOpenBlob) { 
					    	var blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
					    	navigator.msSaveOrOpenBlob(blob, filename);
					   	//其它浏览器写法
					  	} else {
						    var uri = encodeURI('data:text/csv;charset=utf-8,' + BOM + csv);
						    var downloadLink = document.createElement('a');
						    downloadLink.href = uri;
						    downloadLink.download = filename;
						    document.body.appendChild(downloadLink);
						    downloadLink.click();
						    document.body.removeChild(downloadLink);
					  	}
					}
				}			
			});
		};
		scope.$watch("menu.isActive", function() {
			var popScope = angular.element(elem.find(".tooltip")).scope();
			if(popScope) {
				popScope.$watch("isOpen", function(newVal, oldVal) {
					if(newVal === oldVal) {
						return;
					}
					//当弹出框关闭时，改变菜单按钮的状态
					if(!newVal && scope.menu.isActive) {
						scope.menu.isActive = false;
					}
				});
			}
		});
	};
	return {
		restrict : "AE",
		replace : true,
		scope : {
			menu : "="
		},
		link : linkFunc,
		template : '<div class="rightTopTap" ng-show="isVisiable()" id="main_rightTopTap{{$index}}">'+
		'<img ng-show="!isDoubleWin2() && menu.show"  ng-src="{{menu.isActive ? menu.activeIconUrl : menu.iconUrl}}" ng-mouseenter="mouseIn()"'+	 
		'ng-mouseleave="mouseOut()"	ng-class="{menuNomer: menu.hover, menuLight: menu.isActive}"'+	
		'ng-click="menuIconClick(menu.name)" uib-tooltip-template="\'{{menu.popUrl}}\'" tooltip-append-to-body="false"'+	
		'tooltip-placement="bottom" tooltip-trigger="\'outsideClick\'" tooltip-is-open="menu.isActive" />'+			
		'<img ng-src="{{menu.iconUrl}}" ng-click="menuIconClick(menu.name)" ng-if="isDoubleWin2()"/>'+ 
	'</div>'
	 
	};
}]);