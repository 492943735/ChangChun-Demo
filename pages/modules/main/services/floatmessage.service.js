angular.module("main").factory("FloatmessageService", ["$interpolate", "$http","$filter", "loadingInterceptor", "$timeout", "CommonPath","$translate","$compile",
   function($interpolate, $http, $filter, loadingInterceptor, $timeout, CommonPath, $translate,$compile) {
	var cellTpl = "";
	var polygonTpl = "";
	var hvc_lvc_Tpl = "";
	var echartsPieId = ""; 
	
	//DEMO:存小区信息
	var currentCellsDatas = [];
	//存放高低价值/流量用户：
	var cfg_window_data =[];
	//当前tab页名称：
	var currentTab= "";
	var rootCauseText ="";
	var solutionText ="";
	var FilterOnOffArr = [];
	var controlLebelArrs =[];
	var exportWhichTable = "";
	// biaoji
	var single_cell_flag = false;
	var combine_cell_flag = false;
	var withPie_flag = false;
	var noPie_flag = false;
	var location_flag=false;
	var coverageBoolean = false;
	var capacityBoolean = false;
	var fupBoolean = false;
	var planningUrlValue = [];
	var workbenchTabUsers = [];	
	var	workbenchTabExperience = [];
	var	workbenchTabCapacity = [];
	var	workbenchTabTerminal = [];
	var	workbenchTabDataVolume = [];
	//规划请求参数对象：
	var postParam ={};
	//小区弹窗后台数据格式======：
	var tabData = {
	  // 原版本的
	   CellName:{name:"i18n.map.cell.name"},
	   CellId:{name:"i18n.map.cell.id"},
	   Location:{name:"i18n.map.cell.location"},
	   Longitude:{name:"i18n.map.cell.longitude"},
	   Latitude:{name:"i18n.map.cell.latitude"},
	  //改成DEMO版本的：
	   CellImageSrc:"images/ic_cell.png",
	   LocationImageSrc:"images/ic_location.png"
	};
	
	function getAlertHtml(data) {
			cellTpl = '<div class="cellBox">'+
						'<div id="float_message_container_cell" class="floatMessageBox">'+
							'<ul class="cell_info_ul">'+
								'<li class="cell_info_ul_active">基础信息</li>'+
								'<li>网络信息</li>'+
								'<li>业务信息</li>'+
								'<div class="clear"></div>'+
							'</ul>'+
							'<ul class="mes_margin" id="float_message_container_mes_margin">'+
								'<li>'+
									'<span class="mes_margin_title">小区看护人</span>'+
									'<span class="mes_margin_content">'+data.CommunityPeople+'</span>'+
								'</li>'+
								'<li>'+
									'<span class="mes_margin_title">网络看护人</span>'+
									'<span class="mes_margin_content">'+data.NetworkPeople+'</span>'+
								'</li>'+
								'<li>'+
									'<span class="mes_margin_title">社区名称</span>'+
									'<span class="mes_margin_content">'+data.name+'</span>'+
								'</li>'+
								'<li>'+
									'<span class="mes_margin_title">类型</span>'+
									'<span class="mes_margin_content">'+data.type+'</span>'+
								'</li>'+
								'<li>'+
									'<span class="mes_margin_title">人口</span>'+
									'<span class="mes_margin_content">'+data.population+'</span>'+
								'</li>'+
								'<li>'+
									'<span class="mes_margin_title">户数</span>'+
									'<span class="mes_margin_content">'+data.households+'</span>'+
								'</li>'+
								'<li>'+
									'<span class="mes_margin_title">楼栋数</span>'+
									'<span class="mes_margin_content">'+data.numberBulid+'</span>'+
								'</li>'+
								'<li>'+
									'<span class="mes_margin_title">地址</span>'+
									'<span class="mes_margin_content">'+data.dress+'</span>'+
								'</li>'+
							'</ul>'+
							'<div class="cell_info_bottom_btn">'+
								'<button class="cell_info_btn">地推派单</button>'+
								'<button class="cell_info_btn">短信预热</button>'+
								'<button class="cell_info_btn">委托关注</button>'+
								'<button class="cell_info_btn cell_info_btn_export" id="exportCellForm">数据导出</button>'+
							'</div>'+
					'</div>'+
                 '</div>';
		return $interpolate(cellTpl)(data);
	}
	
	//TODO 导出弹窗数据
	function exportCellInfo(){
		var resultdata=[];
		var sdr_data_export_url="data/sdr_export_popInfo.csv";
		Papa.parse(sdr_data_export_url, {
			download: true,
			complete: function (results) {
				resultdata=results.data;
				var arrData = resultdata;
				const BOM = '\uFEFF'; 
				var filename = 'popInfoExport.csv';
				const csv = arrayToCsv(resultdata);
				filename = filename || 'popInfoExport.csv';
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
		});
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
	
	
	//Filter导出表：
	function exportFilterFun(){
		if (currentTab == "FUP") {
			var resultdata=[];
			var sdr_data_export_url= exportWhichTable +".csv";
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
						link.download = exportWhichTable + ".xls";
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						}
					});
		}else if (currentTab == "Capacity") {
				  var resultdata=[];
					var sdr_data_export_url= exportWhichTable +".csv";
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
						link.download = exportWhichTable + ".xls";
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						}
					});
		}else{
				  var resultdata=[];
				  var sdr_data_export_url= exportWhichTable +".csv";
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
						link.download = exportWhichTable + ".xls";
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						}
					});
		}
	}
	//export Fup single Cell
	function exportFupCell(){
	   var resultdata=[];
	   var sdr_data_export_url="fup_single_cell_export.csv";
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
			link.download = sdr_data_export_url.split(".")[0] + ".xls";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			}
		});
	}
	//规划请求：
	function planningGo(){
		$.ajax({
			type: 'POST',
			url: "/cwr-user-web/rest/api/InsightManager/SendInsightData",
			data: JSON.stringify(postParam), 
			contentType: "application/json; charset=utf-8",
			dataType:"json",
			async:false,
			success: function(data){
				alert("Success");
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				alert("Fail");
			}
		});
	}
    //规划请求:
    function smal_send(){
		var params = postParam;
		var form =$("<form action="+planningUrlValue[0]+" method='post'>" +
			"<input type='hidden' name='params' value=''/> " +
			"</form> ");
		$("#SMAL").remove();//如果已存在iframe则将其移除
		$("body").append("<iframe id='SMAL' name='SMAL' style='display: none'></iframe>");//载入iframe
		(function(){
		$("#SMAL").contents().find('body').html(form);//将form表单塞入iframe;
		$("#SMAL").contents().find("form input[name='params']").val(params);//赋值给iframe中表单的文本框中
		$("#SMAL").contents().find('form').submit();//提交数据
		alert("Success");
		}());
    }
	
	//解析HVC/LVC数据
	function getHVCLVCAlertHtml(data,isPolygon) {
		coverageBoolean = false;
	    capacityBoolean = false;
	    fupBoolean = false;
		//DEMO加入：
		var story_tab_button = '';
		exportWhichTable = "";
			if(currentTab == "DIY"){
				story_tab_button ='';
				exportWhichTable = "";
			}else if(currentTab == "Coverage"){
				for(var i=0;i<FilterOnOffArr.length;i++){
					if(FilterOnOffArr[i].leibie == "Coverage"){
						if(0 == Number(FilterOnOffArr[i].filterFlag)){
							story_tab_button ='';
							exportWhichTable = "";
						}else{
							story_tab_button = '<div style="margin-right:2.3rem;" align="right">'+
									   '<div id="coverageFilter" style="font-size:1.4rem;background:#00FFFF;width:10rem;height:2.5rem;color:black;text-align:center;line-height:2.5rem; overflow:hidden;cursor:pointer;">Filtering<div/>'+
							'</div>';
							if(isPolygon == true){
								exportWhichTable = FilterOnOffArr[i].filterFile;
							}else{
								exportWhichTable = FilterOnOffArr[i].filterFile_single;
							}
							coverageBoolean = true;
						}
						break;
					}
				}
			}else if(currentTab == "Capacity"){
				for(var i=0;i<FilterOnOffArr.length;i++){
					if(FilterOnOffArr[i].leibie == "Capacity"){
						if(0 == Number(FilterOnOffArr[i].filterFlag)){
							story_tab_button ='<div style="margin-right:2.3rem;" align="right">'+
									   '<div id="clcDiv" style="font-size:1.4rem;background:#00FFFF;width:10rem;height:2.5rem;color:black;text-align:center;line-height:2.5rem; overflow:hidden;cursor:pointer;">规划<div/>'+
							'</div>';
							exportWhichTable = "";
						}else{
							story_tab_button = '<div style="margin-right:2.3rem;">'+
												 '<div id="capacityFilter" style="font-size:1.4rem;background:#00FFFF;width:10rem;height:2.5rem;color:black;text-align:center;line-height:2.5rem; overflow:hidden;cursor:pointer;float:right;">Filtering'+
												 '</div>'+
												 '<div id="clcDiv" style="font-size:1.4rem;background:#00FFFF;border:0.07rem solid #00FFFF;width:10rem;height:2.5rem;color:black;text-align:center;line-height:2.5rem; overflow:hidden;cursor:pointer;margin-right:1rem;float:right;">Planning'+
												 '</div>'+
											  '</div>';
							if(isPolygon == true){
								exportWhichTable = FilterOnOffArr[i].filterFile;
							}else{
								exportWhichTable = FilterOnOffArr[i].filterFile_single;
							}
							capacityBoolean = true;
						}
						break;
					}
				}
			}else if(currentTab == "FUP"){
				for(var i=0;i<FilterOnOffArr.length;i++){
					if(FilterOnOffArr[i].leibie == "FUP"){
						if(0 == Number(FilterOnOffArr[i].filterFlag)){
							story_tab_button ='';
							exportWhichTable = "";
						}else{
							story_tab_button = '<div style="margin-right:2.3rem;" align="right">'+
									   '<div id="fupFilter" style="font-size:1.4rem;background:#00FFFF;width:10rem;height:2.5rem;color:black;text-align:center;line-height:2.5rem; overflow:hidden;cursor:pointer;">Filtering<div/>'+
							'</div>';
							if(isPolygon == true){
								exportWhichTable = FilterOnOffArr[i].filterFile;
							}else{
								exportWhichTable = FilterOnOffArr[i].filterFile_single;
							}
							fupBoolean = true;
						}
						break;
					}
				}
			}
		var the_popup_title = isPolygon==true?"Selected Area":data.CellNameTxt+data.CellIdTxt;
		var marginBot = isPolygon==true?'<div style="font-size:1.3rem;font-weight:bold;margin-left:14rem;margin-bottom:1.4rem;" align="left">':'<div style="font-size:1.3rem;font-weight:bold;margin-left:14rem;margin-bottom:2.1rem;" align="left">';
		
		hvc_lvc_Tpl = '<div  class="cellBox">'+
						'<div id="float_message_container_cell" class="floatMessageBoxPie">'+
							'<div class="mes_margin_hdv" id="float_message_container_mes_margin">'+
								'<span class="{{flowPowWinTitleClass}}"><font style="font-size:1.6rem;font-weight:bold">'+the_popup_title+'</font></span><br>'+
								'<div id="echartsPie{{divid}}" class="{{echartsPieClass}}" style="float:left;margin-top:2rem; margin-left:10rem;"></div>'+
								'<div class="flowWinGrid" style="float:left;margin-top:3.5rem;">'+
									'<form name="filterForm">'+
										'<table border="1" class="flowWinGridTable">'+
											'<tbody>'+
												'<tr>'+
													'<td class="causeSpan">{{"i18n.map.cell.rsrp" | translate}}</td>'+
													'<td class="{{rsrpClass}}">{{RSRP}}dbm</td>'+
												'</tr>'+
												'<tr>'+
													'<td class="causeSpan">{{"i18n.map.cell.prb" | translate}}</td>'+
													'<td class="{{prbClass}}">{{PRB}}%</td>'+
												'</tr>'+
											'</tbody>'+
										'</table>'+
									'</form>'+
								'</div>'+
								'<div style="clear:both;"></div>'+
								'<div style="font-size:1.3rem;color:#C1CDC1;margin-left:10.5rem;" align="left">Root Cause:</div>'+
								'<div style="font-size:1.3rem;font-weight:bold;margin-left:14rem;" align="left">'+rootCauseText+
								'</div>'+
								'<div style="font-size:1.3rem;color:#C1CDC1;margin-left:10.5rem;" align="left">Solution:</div>'+
								marginBot+solutionText+'</div>'+
								story_tab_button+
							'</div>'+
						'</div>'+
					'</div>';
		
		return $interpolate(hvc_lvc_Tpl)(data);
	}
	
	function getPolygonAlertHtml(data) {
		if(currentTab == "DIY" ){
			polygonTpl = '<div  class="cellBox">'+
								'<div id="float_message_container_polygon" class="{{styleClass}}">'+
									'<div class="mes_margin_polygon" id="float_message_container_mes_margin">'+
										'<span>'+
											'<span class="msg_img_span_cell">'+
											'<img src="{{CellImageSrc}}" id= float_message_container_one_img/>'+
											'</span>'+
											'<span>'+
												'<span id="float_message_container_one_msg1" class="msg_detail_margin_src">{{CellNum | translate}}</span><span class="msg_detail ">{{CellNumTxt}}</span>'+
												'<br><br>'+
											'</span>'+
										'</span>'+
										'<span id="float_message_container_indicator">'+
											'<span class="msg_img_span">'+
												'<img src="{{DetailImageSrc}}" id= float_message_container_one_img_ind/>'+
											'</span>'+
											'<span>'+
												'<span id="float_message_container_one_msg6" class="msg_detail_margin_src">{{Target | translate}}</span><br>'+
												'<span class="msg_detail_text">{{TargetTxt}}</span> <span class="msg_detail_unit">{{TargetUnitTxt}}</span><br>'+
											'</span>'+
										'</span>'+
										'<div style="margin-right:0.4rem;" align="right">'+
									   '<div id="clcDiyDiv" style="font-size:1.2rem;background:#00FFFF;width:7rem;height:1.6rem;color:black;text-align:center;line-height:1.6rem; overflow:hidden;cursor:pointer;">规划<div/>'+
							           '</div>'+
									'</div>'+
								'</div>'+
							'</div>';
		}else{
			polygonTpl = '<div  class="cellBox">'+
						'<div id="float_message_container_polygon" class="{{styleClass}}">'+
							'<div class="mes_margin_polygon" id="float_message_container_mes_margin">'+
								'<span>'+
									'<span class="msg_img_span_cell">'+
									'<img src="{{CellImageSrc}}" id= float_message_container_one_img/>'+
									'</span>'+
									'<span>'+
										'<span id="float_message_container_one_msg1" class="msg_detail_margin_src">{{CellNum | translate}}</span><span class="msg_detail ">{{CellNumTxt}}</span>'+
										'<br><br>'+
									'</span>'+
								'</span>'+
								'<span id="float_message_container_indicator">'+
									'<span class="msg_img_span">'+
										'<img src="{{DetailImageSrc}}" id= float_message_container_one_img_ind/>'+
									'</span>'+
									'<span>'+
										'<span id="float_message_container_one_msg6" class="msg_detail_margin_src">{{Target | translate}}</span><br>'+
										'<span class="msg_detail_text">{{TargetTxt}}</span> <span class="msg_detail_unit">{{TargetUnitTxt}}</span><br>'+
									'</span>'+
								'</span>'+
							'</div>'+
						'</div>'+
					'</div>';
		}
		return $interpolate(polygonTpl)(data);
	}
	function getSiteResourceDefaultHtml(data) {
		
			//代码需要修改
			site_resource_Tpl_default='<div  class="cellBox">'+
			'<div id="float_message_container_cell" class="floatMessageBox setResource">'+
			'<div class="mes_margin mesResource" id="float_message_container_mes_margin" >'+
			'<div class="titleResource"  uib-tooltip="{{obj.siteTitle | translate}}">{{obj.siteTitle | translate}}</div>'+			
			'<div class="tabBodyResource"  ng-scrollbar>'+
			'<table class="resorcetable1" cellspacing="0">'+
			'<tr >'+
			'<td class="msg_loc_text " uib-tooltip="{{obj.keyIndicators | translate}}">{{obj.keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.Users}}">{{obj.Users}}</td>'+			
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.Proportion}}">{{obj.Proportion}}</td> '+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[0].keyIndicators | translate}}">{{obj.colum[0].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[0].Users}}"><span>{{obj.colum[0].Users}}</span></td>'+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[0].Proportion}}"><span>{{obj.colum[0].Proportion}}</span></td>'+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[1].keyIndicators | translate}}">{{obj.colum[1].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[1].Users}}"><span>{{obj.colum[1].Users}}</span></td>'+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[1].Proportion}}"><span>{{obj.colum[1].Proportion}}</span></td>'+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[2].keyIndicators | translate}}">{{obj.colum[2].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[2].Users}}"><span>{{obj.colum[2].Users}}</span></td>'+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[2].Proportion}}"><span>{{obj.colum[2].Proportion}}</span></td>'+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[3].keyIndicators | translate}}">{{obj.colum[3].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[3].Users}}"><span>{{obj.colum[3].Users}}</span></td>'+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[3].Proportion}}"><span>{{obj.colum[3].Proportion}}</span></td>'+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[4].keyIndicators | translate}}">{{obj.colum[4].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[4].Users}}"><span>{{obj.colum[4].Users}}</span></td>'+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[4].Proportion}}"><span>{{obj.colum[4].Proportion}}</span></td>'+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[5].keyIndicators | translate}}">{{obj.colum[5].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[5].Users}}"><span>{{obj.colum[5].Users}}</span></td>'+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[5].Proportion}}"><span>{{obj.colum[5].Proportion}}</span></td>'+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[6].keyIndicators | translate}}">{{obj.colum[6].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[6].Users}}"><span>{{obj.colum[6].Users}}</span></td>'+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[6].Proportion}}"><span>{{obj.colum[6].Proportion}}</span></td>'+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[7].keyIndicators | translate}}">{{obj.colum[7].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[7].Users}}"><span>{{obj.colum[7].Users}}</span></td>'+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[7].Proportion}}"><span>{{obj.colum[7].Proportion}}</span></td>'+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[8].keyIndicators | translate}}">{{obj.colum[8].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[8].Users}}"><span>{{obj.colum[8].Users}}</span></td> '+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[8].Proportion}}"><span>{{obj.colum[8].Proportion}}</span></td>'+
			'</tr>'+
			'<tr >'+
			'<td class="msg_loc_text" uib-tooltip="{{obj.colum[9].keyIndicators | translate}}">{{obj.colum[9].keyIndicators | translate}}</td>'+
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[9].Users}}"><span>{{obj.colum[9].Users}}</span></td>'+		
			'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.colum[9].Proportion}}"><span>{{obj.colum[9].Proportion}}</span></td>'+
			'</tr>'+
			'</table>'+
			'</div>'+
			'</div>'+
			''+
			'</div>'+
		'</div>';

		var $dom = $(site_resource_Tpl_default).appendTo("body");
		var scope = angular.element($dom).scope();
		scope.obj = data;
		
		return $compile(angular.element($dom))(scope)[0];
	}
	
	function getSiteResourceHtml(data) {

		site_resource_Tpl='<div  class="cellBox">'+
	'<div id="float_message_container_cell" class="floatMessageBox setResource">'+
	'<div class="mes_margin mesResource" id="float_message_container_mes_margin" >'+
	'<div class="titleResource"  uib-tooltip="{{obj.siteTitle | translate}}">{{obj.siteTitle | translate}}</div>'+
	'<div class="tipResource" uib-tooltip="{{obj.layerName | translate}}:{{obj.layerNameTxt}}">{{obj.layerName | translate}}:{{obj.layerNameTxt}}</div>'+
	'<div class="tabBodyResource"  ng-scrollbar>'+
	'<table class="resorcetable" cellspacing="0">'+
	'<tr >'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.RRU | translate}}">{{obj.RRU | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.RRUTxt}}">{{obj.RRUTxt}}</td>'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.carrier | translate}}">{{obj.carrier | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.carrierTxt}}">{{obj.carrierTxt}}</td>'+
	'</tr>'+
	'<tr >'+
	'<td class="msg_loc_text" uib-tooltip="{{obj.cascadeRRU | translate}}">{{obj.cascadeRRU | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.cascadeRRUTxt}}">{{obj.cascadeRRUTxt}}</td>'+
	'<td class="msg_loc_text" uib-tooltip="{{obj.bbsRemainResource | translate}}">{{obj.bbsRemainResource | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.bbsRemainResourceTxt}}">{{obj.bbsRemainResourceTxt}}</td>'+
	'</tr>'+
	'<tr >'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.RRUType | translate}}">{{obj.RRUType | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.RRUTypeTxt}}">{{obj.RRUTypeTxt}}</td>'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.RBNum | translate}}">{{obj.RBNum | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.RBNumTxt}}">{{obj.RBNumTxt}}</td>'+
	'</tr>'+
	'<tr >'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.band | translate}}">{{obj.band | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.bandTxt}}"><span>{{obj.bandTxt}}</span></td>'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.errorBand | translate}}">{{obj.errorBand | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.errorBandTxt}}"><span>{{obj.errorBandTxt}}</span></td>'+
	'</tr>'+
	'<tr >'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.bandwidth | translate}}">{{obj.bandwidth | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.bandwidth}}"><span>{{obj.bandwidthTxt}}</span></td>'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.supporting | translate}}">{{obj.supporting | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.supportingTxt}}"><span>{{obj.supportingTxt}}</span></td>'+
	'</tr>'+
	'<tr >'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.transLight | translate}}">{{obj.transLight | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.transLightTxt}}"><span>{{obj.transLightTxt}}</span></td>'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.antennaProperyty | translate}}">{{obj.antennaProperyty | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.antennaProperytyTxt}}">{{obj.antennaProperytyTxt}}</td>'+
	'</tr>'+
	'<tr >'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.RRUPower | translate}}">{{obj.RRUPower | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.RRUPowerTxt}}">{{obj.RRUPowerTxt}}</td>'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.antennaType | translate}}">{{obj.antennaType | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.antennaTypeTxt}}">{{obj.antennaTypeTxt}}</td>'+
	'</tr>'+
	'<tr >'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.antennaTypePort | translate}}">{{obj.antennaTypePort | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.antennaTypePortTxt}}">{{obj.antennaTypePortTxt}}</td>'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.masterBoardConfiguration | translate}}">{{obj.masterBoardConfiguration | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.masterBoardConfigurationTxt}}">{{obj.masterBoardConfigurationTxt}}</td>'+
	'</tr>'+
	'<tr class="last_tr_border">'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.w2100 | translate}}">{{obj.w2100 | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.w2100Txt}}">{{obj.w2100Txt}}</td>'+
	'<td class="msg_loc_text " uib-tooltip="{{obj.g1800 | translate}}">{{obj.g1800 | translate}}</td>'+
	'<td class="msg_loc_text tdValue" uib-tooltip="{{obj.g1800Txt}}">{{obj.g1800Txt}}</td>'+
	'</tr>'+
	'</table>'+
	'</div>'+
	'</div>'+
	''+
	'</div>'+
'</div>';

		var $dom = $(site_resource_Tpl).appendTo("body");
		var scope = angular.element($dom).scope();
		scope.obj = data;
		
		return $compile(angular.element($dom))(scope)[0];
	}
		
	//筛选多边形内小区判别方法
	function choosePolygonCell(cellPoint, pointsArray) {
		var x = cellPoint.X;  
	    var y = cellPoint.Y;  
	  
	    var isum, icount, index;  
	    var dLon1 = 0, dLon2 = 0, dLat1 = 0, dLat2 = 0, dLon;  
	  
	    if (pointsArray.length < 3)  
	    {  
	        return false;  
	    }  
	  
	    isum = 0;  
	    icount = pointsArray.length;  
	  
        for (index = 0; index < icount - 1; index++)  
        {  
            if (index == icount - 1)  
            {  
                dLon1 = pointsArray[index][0];  
                dLat1 = pointsArray[index][1];  
                dLon2 = pointsArray[0][0];  
                dLat2 = pointsArray[0][1];  
            }  
            else  
            {  
                dLon1 = pointsArray[index][0];  
                dLat1 = pointsArray[index][1];  
                dLon2 = pointsArray[index + 1][0];  
                dLat2 = pointsArray[index + 1][1];  
            }  
  
            if (((y >= dLat1) && (y < dLat2)) || ((y >= dLat2) && (y < dLat1)))  
            {  
                if (Math.abs(dLat1 - dLat2) > 0)  
                {  
                    dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - y)) / (dLat1 - dLat2);  
                    if (dLon < x)  
                        isum++;  
                }  
            }  
        };  
	  
	    if ((isum % 2) != 0)  
	    {  
	        return true;  
	    }  
	    else  
	    {  
	        return false;  
	    }  
	};
	
	
	//配置多边形小区
	function polygonClick(_paramObj, mapModel, mapData) {
		var isPolygon = true;
		var isPost = {state:false};
		var renderToId = mapModel.renderToId;
		var postData = mapModel.gisMap.getQueryParams();
		postData = getpolygonParams(postData, mapModel, isPost, mapData, _paramObj.cellTotals);
		var getTargetKey, getTargetValue, getTargetUnit;//接收后台的数据
		if(isPost.state == true) {
			//存放筛选出的用户小区数据：
			var allCells = postData; 
			//存放高低价值/流量用户：
			var cfg = cfg_window_data;
			//当前激活的标签：
			var current_tab = mapModel.icaAreas;
			var responseData = {
				"state": "0",   //请求状态 0(请求成功)，1(请求失败)
				"errMsg": null,    //错误信息
				"data": {    //返回数据
					"indicatorName": postData.INDICATORNAME,    //指标名称
					"indicatorValue": postData.INDICATORVAL,    //指标数值
					"indicatorUnit": postData.INDICATORUNIT,    //指标单位
					"totalSize": "1",    //数量
					"indicatorId": "HDI_METADATA_GRP_VIDEO_DOWNLOAD_THROUGHPUT"    //指标ID
				}
			}; 
				
			var data = responseData.data;
			//vvip单用户特殊处理
			if (data.indicatorName === "" && data.indicatorUnit === "" ) 
			{
				data.indicatorName = $translate.instant("i18n.map.cell.userNum");
				data.indicatorUnit = $translate.instant("i18n.location.vvipSingle.unit");
			}
			
			getTargetKey = data.indicatorName;
			getTargetValue = data.indicatorValue;
			getTargetUnit = data.indicatorUnit;
			
			//弹框配置
			var obj = new Object();
			obj.CellImageSrc = "images/ic_cell.png";
			obj.CellNum = '小区数量:';
			obj.CellNumTxt = postData.cellNum;
			obj.DetailImageSrc = getDetailImageUrl(mapModel.icaAreas);
			obj.Target = getTargetKey;
			//danwei zishiying
			if(getTargetUnit == "SUB"){
				getTargetValue = Number(getTargetValue);
				var num_str = ("" + getTargetValue).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");  
				getTargetValue = num_str;
			}else if(getTargetUnit == "MB" && Number(getTargetValue) >1024){
				getTargetUnit="GB";
				getTargetValue = Number(getTargetValue/1024).toFixed(2);
				if(getTargetUnit == "GB" && Number(getTargetValue) >1024){
					getTargetUnit="TB";
				    getTargetValue = Number(getTargetValue/1024).toFixed(2);
				}
			}else if(getTargetUnit == "MB" && Number(getTargetValue) < 1){
				getTargetUnit ="KB";
				getTargetValue = Number(getTargetValue*1024).toFixed(2);
			}else if(getTargetUnit == "Kbps" && Number(getTargetValue) >1024){
				getTargetUnit="Mbps";
				getTargetValue = Number(getTargetValue/1024).toFixed(2);
				if(getTargetUnit == "Mbps" && Number(getTargetValue) >1024){
					getTargetUnit="Gbps";
				    getTargetValue = Number(getTargetValue/1024).toFixed(2);
				}
			}else if(getTargetUnit == "ms" && Number(getTargetValue) >=1000){
				getTargetUnit="s";
				getTargetValue = Number(getTargetValue/1000).toFixed(2);
				if(getTargetUnit == "s" && Number(getTargetValue) >=60){
					getTargetUnit="min";
				    getTargetValue = Number(getTargetValue/60).toFixed(2);
				}
			}
			
			obj.TargetTxt = getTargetValue;
			obj.TargetUnitTxt = getTargetUnit;
			obj.styleClass = 'floatMessageBoxPolygon';
			obj.renderToId = renderToId;
			var isShowPie = isShowPieInPopWin(mapModel,_paramObj);
			//数据填充到Dom
			if(isShowPie){
				obj.flowPowWinTitleClass = 'flowPowWinTitlePolygon';
				obj.echartsPieClass = 'echartsPiePolygon';
				drawPieInfoWinofPolygon(data, obj, _paramObj, isPolygon, postData);
			}else{
				single_cell_flag = false;
				combine_cell_flag = true;
				withPie_flag = false;
				noPie_flag = false;
				location_flag=false;
				
				if(currentTab == "DIY"	){
					//针对Capacity读取规划地址：
					var cfg_planning_url = "data/planning_address_url.csv";
					planningUrlValue =[];
					Papa.parse(cfg_planning_url,{
						download: true,
						complete: function (results) {
							var plan_value = results.data;
						    for(var i =1;i<plan_value.length-1;i++){
								planningUrlValue.push(plan_value[i][0]);
							}
							//读取workbench控制台页签和数据：
						    var control_lebels_url = "data/cfg_control_lebel.csv";
						    workbenchTabUsers = [];
							workbenchTabExperience = [];
							workbenchTabCapacity = [];
							workbenchTabTerminal = [];
							workbenchTabDataVolume = [];
							
							//请求参数集：
							postParam ={};
						    Papa.parse(control_lebels_url,{
								download: true,
								complete: function (results) {
									var workbench_value = results.data;
									for(var j =1;j<workbench_value.length-1;j++){
										if(workbench_value[j][10] == "gztUers" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.name = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabUsers.push(objs);
										}else if(workbench_value[j][10] == "gzExperience" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.name = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabExperience.push(objs);
										}else if(workbench_value[j][10] == "gzCapacity" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.gztKqiname = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabCapacity.push(objs);
										}else if(workbench_value[j][10] == "gzTerminal" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.name = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabTerminal.push(objs);
										}else if(workbench_value[j][10] == "gzDataVolume" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.gztKqiname = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabDataVolume.push(objs);
										}
									}
									//获取多边形内经纬度：
									var polygonObjs =[];
									for(var k =0;k< polygonLatLngs.length;k++){
										var obbj = {};
										obbj.lat = polygonLatLngs[k][1]+"";
										obbj.lng = polygonLatLngs[k][0]+"";
										polygonObjs.push(obbj);
									}
									
									//规划post请求参数封装，参照文档是否封装成这样？
									postParam = {
									    "tenantId":"2018GC",
									   "userName":"jinan01",
									   "clientId": "cwx506019",
									   "token": "c@235110",
										"gzExperience":workbenchTabExperience,
										"gzCapacity":workbenchTabCapacity,
										"gzTerminal":workbenchTabTerminal,
										"gzDataVolume":workbenchTabDataVolume,
									   "gztUers": workbenchTabUsers,
									 "fileName":"smartinsight2plan_101_DIY_20180719150503.csv",
									   "polygonNext": polygonObjs
									}
									//弹出窗口
									popWindow(_paramObj.e.coordinate, renderToId, getPolygonAlertHtml(obj), isPolygon);
									var clcDiv = document.getElementById("clcDiyDiv");
									clcDiv.onclick = planningGo;
								}
						    });
						}
					});	
				}else{
					popWindow(_paramObj.e.coordinate, renderToId, getPolygonAlertHtml(obj), isPolygon);
				}
			}
		}
	};
	
	
	//获取小区或者多边形上的指标/app/user对应图标的url
	function getDetailImageUrl(icaAreas) {
		var imgBasePath = CommonPath.imgBasePath;
		//var imgLightBasePath = CommonPath.imgLightBasePath;		
		var imgLightBasePath = "images/imageLight/";
		var icaAreasLen = icaAreas.length;
		var iconUrl;
		for(var i = 0; i <= icaAreasLen - 1; i++){
			if(icaAreas[i].active == true){
				iconUrl = icaAreas[i].iconUrl;
				if(iconUrl === "base64") {
					return icaAreas[i].iconData;
				}
				else{
					return imgLightBasePath + icaAreas[i].iconUrl;
				}
			}
		}
		
	}
	
	//获取是否在弹窗中显示饼图
	function isShowPieInPopWin(mapModel,_paramObj)
	{
		//DIY不显示饼图：
		if(_paramObj.activedTab == "DIY"){
			return false;
		}
		var cellDataLen = mapModel.icaAreas.length;
		var cellDetails = mapModel.icaAreas;
		if(cellDataLen < 3){
			return false;
		}
		var isYoutube = cellDetails[1].text;
		var isYoutubeIndi = "";
		for(var i=0;i<controlLebelArrs.length;i++){
			if(controlLebelArrs[i].labelName == isYoutube){
				if(controlLebelArrs[i].storyType != "DIY"){
					isYoutubeIndi = controlLebelArrs[i].indicator;
				    break;
				}
			}
		}
		if(isYoutubeIndi !="HDI_METADATA_GRP_NETWORK_TRAFFIC_YOUTUBE"){
			return false;
		}

		if(cellDetails[0].type === LabelType.USER){
			//DEMO:
			var isHighLow = cellDetails[0].text;
		    var isHighLowIndi = "";
			for(var i=0;i<controlLebelArrs.length;i++){
				if(controlLebelArrs[i].labelName == isHighLow){
					if(controlLebelArrs[i].storyType != "DIY"){
						isHighLowIndi = controlLebelArrs[i].indicator;
						break;
					}
				}
			}
			if(isHighLowIndi !="HDI_METADATA_GRP_SUBS_NUM_ROAMING_HV" && isHighLowIndi !="HDI_METADATA_GRP_SUBS_NUM_ROAMING_LV"){
				return false;
		    }
		}else{
			    return false;
		}
		return true;
	}

	//计算饼图每块的百分比
	function getPiePercent(data, name){
		var dataSum = 0;
		var legendData = [];
		for(var i = 0; i < data.length; i++){
			dataSum += parseFloat(data[i].value);
		}
		for(var i = 0; i < data.length; i++){
			var key = data[i].name;
			legendData[key] = data[i].value + "%";
			if(dataSum == 0){
				legendData[key] = 0 + '%';
			}
		}
		return legendData;
	}
	
	//绘制饼图
	function drawPie(data){
		var fontFlag = 14;
		var itemwid = 24;
		var	itemhei = 14;
		var screenHeight = window.screen.height;
		var screenWidth = window.screen.width;
		if (screenWidth >= 3000){
			fontFlag = 40;
			itemwid = 70;
			itemhei = 47;
			
			var legendData = getPiePercent(data);
			var pieChart = document.getElementById("echartsPie" + echartsPieId);
			var echart = echarts.init(pieChart);
			var option = {
				color: [ '#24ad17', '#b46c18', '#b2261b', '#18739d' ],
				legend: {
					orient: 'vertical',
					itemWidth: itemwid,
					itemHeight: itemhei,
					width: 500,
					height: 500,
					textStyle:{
						color:'#a2bebe',
						fontSize: fontFlag
					},
					x: '50%',
					y:'2%',
					formatter: function(name){
						return name + ": " + legendData[name];
					},
					selectedMode : false,
					data:data
				},
				series : [{
					type:'pie',
					radius : '72%',
					center:['20%','45%'],
					itemStyle : {
						normal : {
							label:{
								show:false
							},
							labelLine : {
								show : false
							}
						},
						emphasis : {
							label:{
								show:false
							},
							labelLine : {
								show : false
							}
						}
					},
				data:data
				}]
			};
			echart.setOption(option);
		}else{
			var legendData = getPiePercent(data);
			var pieChart = document.getElementById("echartsPie" + echartsPieId);
			var echart = echarts.init(pieChart);
			var option = {
				color: [ '#24ad17', '#b46c18', '#b2261b', '#18739d' ],
				legend: {
					orient: 'vertical',
					textStyle:{
						color:'#a2bebe',
						fontSize: fontFlag
					},
					x: '50%',
					y:'2%',
					formatter: function(name){
						return name + ": " + legendData[name];
					},
					selectedMode : false,
					data:data
				},
				series : [{
					type:'pie',
					radius : '72%',
					center:['20%','45%'],
					itemStyle : {
						normal : {
							label:{
								show:false
							},
							labelLine : {
								show : false
							}
						},
						emphasis : {
							label:{
								show:false
							},
							labelLine : {
								show : false
							}
						}
					},
				data:data
				}]
			};
			echart.setOption(option);
		}
	}
	
	//获取小区弹窗信息
	function cellWinInfoRequest(_paramObj, mapModel, isPolygon){
		var renderToId = mapModel.renderToId;
		var _queryParam = mapModel.gisMap.getQueryParams();
		_queryParam.polygon.cellIds.push(_paramObj.data.cellId);
		var obj = new Object();
		//普通小区弹框配置
		if (_paramObj.data.INDICATORNAME == "") {
			obj.lastState = false;
		}else{
			obj.lastState = true;
		}
		obj.CellNameTxt = _paramObj.data.cellName;
		obj.CellIdTxt = '('+ _paramObj.data.cellId+')'; 
		obj.renderToId = renderToId;
		obj.flowPowWinTitleClass = 'flowPowWinTitle';
		obj.echartsPieClass = 'echartsPie';
		//DEMO:
		var data = {};
		drawPieInfoWinofPolygon(data, obj, _paramObj, isPolygon, null);
	}
	//绘制包含饼图的弹窗
	function drawPieInfoWinofPolygon(data, obj, _paramObj, isPolygon, postData)
	{
		rootCauseText ="";
	    solutionText ="";
		//读取story表，取rootCause和solution的值：
		var currentTableValue =[];
		
				var cfg_value = cfg_story_lebel_data_zh;
				for(var i = 1;i<cfg_value.length-1;i++){
					var oobj = {};
					oobj.cellId = cfg_value[i][0];
					oobj.tc = cfg_value[i][9];
					currentTableValue.push(oobj);
				}
				var hh=0,hl=0,lh=0,ll=0,rsrp=0,prb=0;
				//如果是点击单个小区：
				if(isPolygon == false){
					var cid = _paramObj.data.cellId;
					var tc_flag ="";
					for(var i=0;i<currentTableValue.length;i++){
						if(currentTableValue[i].cellId == cid){
							tc_flag = currentTableValue[i].tc;
							break;
						}
					}
					for(var i=0;i<cfg_window_data.length;i++){
						if(cfg_window_data[i].TC == tc_flag){
							hh = cfg_window_data[i].HH;
							hl = cfg_window_data[i].HL;
							lh = cfg_window_data[i].LH;
							ll = cfg_window_data[i].LL;
							obj.RSRP = cfg_window_data[i].RSRP;
							obj.PRB = cfg_window_data[i].PRB;
							rootCauseText = cfg_window_data[i].rootCause;
	                        solutionText = cfg_window_data[i].solution;
							break;
						}
					}
				}else{
				//如果是多边形选取的多个小区：
				   var choosedCellArr = postData.polygon.cellIds;
				   var tc_flag_a ="";
				   var tc_flag_b ="";
				   var tc_flag_c ="";
				   var tc_flag_d ="";
				   var tc_flag_e ="";
				   var tc_flag_f ="";
				   var tc_flag ="";
				   if(choosedCellArr.length>0){
					   for(var i=0;i<choosedCellArr.length;i++){
						   var currentId = choosedCellArr[i];
						   for(var k=0;k<currentTableValue.length;k++){
								if(currentId == currentTableValue[k].cellId){
									switch(currentTableValue[k].tc){
										case "A" : tc_flag_a += "A";
										break;
										case "B" : tc_flag_b += "B";
										break;
										case "C" : tc_flag_c += "C";
										break;
										case "D" : tc_flag_d += "D";
										break;
										case "E" : tc_flag_e += "E";
										break;
										case "F" : tc_flag_f += "F";
										break;
									}
									break;
								}
						   }
					   }
					   var cnumbers = [tc_flag_a.length, tc_flag_b.length, tc_flag_c.length, tc_flag_d.length, tc_flag_e.length, tc_flag_f.length];
					   var maxInNumbers = Math.max.apply(Math, cnumbers);
					   switch(maxInNumbers){
							case tc_flag_a.length : tc_flag = "A";
							break;
							case tc_flag_b.length : tc_flag = "B";
							break;
							case tc_flag_c.length : tc_flag = "C";
							break;
							case tc_flag_d.length : tc_flag = "D";
							break;
							case tc_flag_e.length : tc_flag = "E";
							break;
							case tc_flag_f.length : tc_flag = "F";
							break;
					   }
					   for(var i=0;i<cfg_window_data.length;i++){
							if(cfg_window_data[i].TC == tc_flag){
								hh = cfg_window_data[i].HH;
								hl = cfg_window_data[i].HL;
								lh = cfg_window_data[i].LH;
								ll = cfg_window_data[i].LL;
								obj.RSRP = cfg_window_data[i].RSRP;
								obj.PRB = cfg_window_data[i].PRB;
								rootCauseText = cfg_window_data[i].rootCause;
								solutionText = cfg_window_data[i].solution;
								break;
							}
					   }
				   }
				}
				var rsrpThre = -105;
				var prbThre = 80;
				//若RSRP小于阈值，则显示为红色
				if(obj.RSRP != '--' && parseFloat(obj.RSRP) < parseFloat(rsrpThre)){
					obj.rsrpClass = 'causeDetailRedSpan';
				}else{
					obj.rsrpClass = 'causeDetailSpan';
				}
				//若PRB大于阈值，则显示为红色
				if(obj.PRB != '--' && parseFloat(obj.PRB) > parseFloat(prbThre)){
					obj.prbClass = 'causeDetailRedSpan';
				}else{
					obj.prbClass = 'causeDetailSpan';
				}			
				var pieData = [
					{icon:'roundRect',name:'HH',value:hh},
					{icon:'roundRect',name:'HL',value:hl},
					{icon:'roundRect',name:'LH',value:lh},
					{icon:'roundRect',name:'LL',value:ll}
					];	
				echartsPieId = _paramObj.mapId;
				obj.divid = echartsPieId;
				single_cell_flag = false;
				combine_cell_flag = false;
				withPie_flag = true;
				noPie_flag = false;
				location_flag=false;
				if("Capacity" == currentTab){
					//针对Capacity读取规划地址：
					var cfg_planning_url = "data/planning_address_url.csv";
					planningUrlValue =[];
					Papa.parse(cfg_planning_url,{
						download: true,
						complete: function (results) {
							var plan_value = results.data;
						    for(var i =1;i<plan_value.length-1;i++){
								planningUrlValue.push(plan_value[i][0]);
							}
							//读取workbench控制台页签和数据：
						    var control_lebels_url = "data/cfg_control_lebel.csv";
						    workbenchTabUsers = [];						
							workbenchTabExperience = [];
							workbenchTabCapacity = [];
							workbenchTabTerminal = [];
							workbenchTabDataVolume = [];
							
							//请求参数集：
							postParam ={};
						    Papa.parse(control_lebels_url,{
								download: true,
								complete: function (results) {
									var workbench_value = results.data;
									for(var j =1;j<workbench_value.length-1;j++){
										if(workbench_value[j][10] == "gztUers" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.name = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabUsers.push(objs);
										}else if(workbench_value[j][10] == "gzExperience" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.name = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabExperience.push(objs);
										}else if(workbench_value[j][10] == "gzCapacity" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.gztKqiname = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabCapacity.push(objs);
										}else if(workbench_value[j][10] == "gzTerminal" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.name = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabTerminal.push(objs);
										}else if(workbench_value[j][10] == "gzDataVolume" && workbench_value[j][3] == "DIY"){
											var objs ={};
										    objs.gztKqiname = workbench_value[j][0];
											objs.value = workbench_value[j][6]+(workbench_value[j][7]==undefined?"":workbench_value[j][7]);
										    workbenchTabDataVolume.push(objs);
										}
									}
									//获取多边形内经纬度：
									var polygonObjs =[];
									for(var k =0;k< polygonLatLngs.length;k++){
										var obbj = {};
										obbj.lat = polygonLatLngs[k][1]+"";
										obbj.lng = polygonLatLngs[k][0]+"";
										polygonObjs.push(obbj);
									}
									
									//规划post请求参数封装，参照文档是否封装成这样？
									postParam = {
									    "tenantId":"2018GC",
									   "userName":"jinan01",
									   "clientId": "cwx506019",
									   "token": "c@235110",
										"gzExperience":workbenchTabExperience,
										"gzCapacity":workbenchTabCapacity,
										"gzTerminal":workbenchTabTerminal,
										"gzDataVolume":workbenchTabDataVolume,
									   "gztUers": workbenchTabUsers,
									 "fileName":"smartinsight2plan_101_DIY_20180719150503.csv",
									   "polygonNext": polygonObjs
									}
									
									//弹出窗口
									popWindow(_paramObj.e.coordinate, obj.renderToId, getHVCLVCAlertHtml(obj,isPolygon));
									//绘制饼图
									drawPie(pieData);
									var clcDiv = document.getElementById("clcDiv");
									clcDiv.onclick = planningGo;
									//Filter导出表在这里：	
									if(coverageBoolean){
										var clickGo = document.getElementById("coverageFilter");
										clickGo.onclick = exportFilterFun;
									}
									if(capacityBoolean){
										var clickGo = document.getElementById("capacityFilter");
										clickGo.onclick = exportFilterFun;
									}
									if(fupBoolean){
										var clickGo = document.getElementById("fupFilter");
										clickGo.onclick = exportFilterFun;
									}				
								}
						    });
						}
					});	
				}
				else{
					//弹出窗口
					popWindow(_paramObj.e.coordinate, obj.renderToId, getHVCLVCAlertHtml(obj,isPolygon));
					//绘制饼图
					drawPie(pieData);
					//Filter导出表在这里：
					if(coverageBoolean){
						var clickGo = document.getElementById("coverageFilter");
						clickGo.onclick = exportFilterFun;
					}
					if(capacityBoolean){
						var clickGo = document.getElementById("capacityFilter");
						clickGo.onclick = exportFilterFun;
					}
					if(fupBoolean){
						var clickGo = document.getElementById("fupFilter");
						clickGo.onclick = exportFilterFun;
					}
				}
	}
	
	//多边形参数获取
    function getpolygonParams(params, mapModel, isPost, mapData,theCellTotals){
    	var postData = mapModel.gisMap.getQueryParams();
		//DEMO版本:
    	var sendCellData = theCellTotals;
		var allCellData =[];
		for(var i =0;i<sendCellData.length;i++){
			var sendCellDataItem = sendCellData[i].cellInfo;
			for(var j =0;j<sendCellDataItem.length;j++){
				var cellObjs = {};
				cellObjs.XPOS = sendCellDataItem[j].coordinates[0];
				cellObjs.YPOS = sendCellDataItem[j].coordinates[1];
				cellObjs.CELLID = sendCellDataItem[j].cellId;			                                 
			    cellObjs.INDICATORNAME = sendCellDataItem[j].INDICATORNAME;	
                cellObjs.INDICATORVAL = sendCellDataItem[j].INDICATORVAL;	
                cellObjs.INDICATORUNIT = sendCellDataItem[j].INDICATORUNIT;					
				allCellData.push(cellObjs);
			}
		}
		//DEMO加入（获取多边形内经纬度）：
		polygonLatLngs = [];
		polygonLatLngs = mapModel.gisMap.polygonData;
		var pointsArray = mapModel.gisMap.polygonData;
		var allCellDataLength = allCellData.length;
		var cellPoint = {};//某一小区的经纬
		var polygonCellArray = [];//多边形小区的ID集合
		var lonMax = 0;//多边形最大最小经纬度
		var lonMin = 0;
		var latMax = 0;
		var latMin = 0;
		//统计多边形内小区指标总数：
		var indiNum =0;
		var indiNum_total=0;
		var indiName ="";
		var indiUnit ="";
		var count_num=0;
		
		//获取多边形内的小区
		for (var i = 0;i < allCellDataLength;i++) {
			var index = i;
			var item = allCellData[index];
			cellPoint.X = item.XPOS;
			cellPoint.Y = item.YPOS;
			if (choosePolygonCell(cellPoint, pointsArray) == true) {
				polygonCellArray.push(item.CELLID);
				indiNum_total += Number(item.INDICATORVAL);
				indiName = item.INDICATORNAME;
				indiUnit = item.INDICATORUNIT;
				count_num++;
			}
			indiNum=indiNum_total/count_num;
		};
		if (polygonCellArray.length > 300) {//多边形小区大于300
			var lonArray = new Array();
			var latArray = new Array();
			var arrayLength = pointsArray.length;
			
			for (var i = 0;i < arrayLength;i++) {//提取多边形经度数组，纬度数组
				var index = i;
				var item = pointsArray[index];
				lonArray.push(item[0]);
				latArray.push(item[1]);
			}
			
			lonMax = lonArray.sort(sortNumber)[arrayLength - 1];
			latMax = latArray.sort(sortNumber)[arrayLength - 1];
			lonMin = lonArray.sort(sortNumber)[0];
			latMin = latArray.sort(sortNumber)[0];
			postData.polygon.latAndLng = { 
				 minLng : new String(lonMin),
				 minLat : new String(latMin),
				 maxLng : new String(lonMax),
               maxLat : new String(latMax)
              };
			postData.polygon.type = "byCellLatAndLng";
			postData.polygon.cellIds =  polygonCellArray;
			isPost.state = true;
		}
		else if (polygonCellArray.length > 0 && polygonCellArray.length <= 300) {//多边形小区小于300
			postData.polygon.type = "byCellIDs";
			postData.polygon.cellIds =  polygonCellArray;
			isPost.state = true;
		}
		else {
			isPost.state = false;
		}
		postData.cellNum = polygonCellArray.length;
		//DEMO加入：
		postData.INDICATORNAME = indiName;
		indiNum = indiUnit == "SUB"?indiNum:(indiNum.toFixed(2));
		postData.INDICATORVAL = indiNum;
		postData.INDICATORUNIT = indiUnit;
		return postData;
	};
	
	function resoureAreaSiteClick(_paramObj, mapModel, tabDatas) {
		var isPolygon = false;
		var obj = new Object();
		var renderToId = mapModel.renderToId;
		if(_paramObj.ishowPopuWindow == 2){
			obj.siteDetailTxt = _paramObj.siteInfo.detail_info;
			popWindow(_paramObj.pixLonLat, renderToId, getSiteResourceDefaultHtml(obj), isPolygon, false);
			return;
		}
		//弹框数据配置
		obj.keyIndicators=_paramObj.keyIndicators;
		obj.Users=_paramObj.Users;
		obj.Proportion=_paramObj.Proportion;
		obj.colum=_paramObj.siteInfo;
		obj.siteTitle="COST CENTER:"+_paramObj.title;
		
		
		popWindow(_paramObj.e.coordinate, renderToId, getSiteResourceDefaultHtml(obj), isPolygon, false);
		
	};
	
	function resoureSiteClick(_paramObj, mapModel, tabDatas) {
		var isPolygon = false;
		single_cell_flag = false;
		combine_cell_flag = false;
		withPie_flag = false;
		noPie_flag = false;
		location_flag=true;
		var obj = new Object();
		var renderToId = mapModel.renderToId;
		if(_paramObj.ishowPopuWindow == 2){
			obj.siteDetailTxt = _paramObj.siteInfo.detail_info;
			return;
		}
		//弹框数据配置
		obj.layerNameTxt = _paramObj.data.mark_name;
		obj.layerName = "i18n.map.site.layerName";
		obj.siteTitle = "i18n.map.site.title";
		obj.RRU = "i18n.map.site.RRU";
		obj.RRUTxt = _paramObj.siteInfo.rru;
		obj.carrier = "i18n.map.site.carrier";
		obj.carrierTxt = _paramObj.siteInfo.carrier;
		obj.cascadeRRU = "i18n.map.site.cascadeRRU";
		obj.cascadeRRUTxt = _paramObj.siteInfo.cascad_rru;
		obj.bbsRemainResource = "i18n.map.site.bbsRemainResource";
		obj.bbsRemainResourceTxt = _paramObj.siteInfo.bbs;
		obj.RRUType = "i18n.map.site.RRUType";
		obj.RRUTypeTxt = _paramObj.siteInfo.rru_type;
		obj.RBNum = "i18n.map.site.RBNum";
		obj.RBNumTxt = _paramObj.siteInfo.rb_num;
		obj.band = "i18n.map.site.band";
		obj.bandTxt = _paramObj.siteInfo.band;
		obj.errorBand = "i18n.map.site.errorBand";
		obj.errorBandTxt = _paramObj.siteInfo.inter_band_info;
		obj.bandwidth = "i18n.map.site.bandwidth";
		obj.bandwidthTxt = "✔";
		obj.supporting = "i18n.map.site.supporting";
		obj.supportingTxt = "✔";
		if(_paramObj.siteInfo.matching_license === undefined){
			obj.supportingTxt = ""
		}
		if(_paramObj.siteInfo.matching_license === 1){
			obj.supportingTxt = "✘";
		}
		
		obj.transLight = "i18n.map.site.transLight";
		obj.transLightTxt = "✔";
		if(_paramObj.siteInfo.transmission === undefined){
			obj.transLightTxt = ""
		}
		if(_paramObj.siteInfo.transmission === 1){
			obj.transLightTxt = "✘";
		}
		
		obj.antennaProperyty = "i18n.map.site.antennaProperyty";
		obj.antennaProperytyTxt = "✔";		
		if(_paramObj.siteInfo.antenna === undefined){
			obj.antennaProperytyTxt = ""
		}
		if(_paramObj.siteInfo.antenna === 1){
			obj.antennaProperytyTxt = "✘";
		}		
		
		obj.RRUPower = "i18n.map.site.RRUPower";
		obj.RRUPowerTxt = "✔";
		
		if(_paramObj.siteInfo.power === undefined){
			obj.RRUPowerTxt = ""
		}
		if(_paramObj.siteInfo.power === 1){
			obj.RRUPowerTxt = "✘";
		}
		
		obj.antennaType = "i18n.map.site.antennaType";
		obj.antennaTypeTxt = _paramObj.siteInfo.antenna_type;
		obj.antennaTypePort = "i18n.map.site.antennaTypePort";
		obj.antennaTypePortTxt = _paramObj.siteInfo.antenna_port_usage;
		obj.masterBoardConfiguration = "i18n.map.site.masterBoardConfiguration";
		obj.masterBoardConfigurationTxt = _paramObj.siteInfo.master_board_cfg;
		obj.w2100 = "i18n.map.site.w2100";
		obj.w2100Txt = _paramObj.siteInfo.w2100_band;
		obj.g1800 = "i18n.map.site.g1800";
		obj.g1800Txt = _paramObj.siteInfo.g1800_band;
	};

	//配置普通小区
	function cellClick(_paramObj, mapModel, tabDatas) {
		var isPolygon = false;
		var obj = new Object();
		var renderToId = mapModel.renderToId;
		
		//普通小区弹框配置
		if (_paramObj.data.INDICATORNAME == "") {
			obj.lastState = false;
		}
		else{
			obj.lastState = true;
		}
		
		obj.CellName = tabDatas.CellName.name;
		obj.CellId = tabDatas.CellId.name;
		obj.Location = tabDatas.Location.name;
		obj.Longitude = tabDatas.Longitude.name;
		obj.Latitude = tabDatas.Latitude.name;
		obj.CellImageSrc = tabDatas.CellImageSrc;
		obj.LocationImageSrc = tabDatas.LocationImageSrc;	
		obj.DetailImageSrc = getDetailImageUrl(mapModel.icaAreas);		
 		obj.Target = _paramObj.data.INDICATORNAME;
		
		//弹框数据配置
		obj.CellNameTxt = _paramObj.data.cellName;
		obj.CellIdTxt = _paramObj.data.cellId; 
		obj.LongitudeTxt = _paramObj.data.coordinates[0];
		obj.LatitudeTxt = _paramObj.data.coordinates[1];
		var a = _paramObj.data.INDICATORUNIT;
		var b = Number(_paramObj.data.INDICATORVAL);
		var theValue = a=="SUB"?b:b.toFixed(2);
		var getTargetUnit = _paramObj.data.INDICATORUNIT;
		var getTargetValue = theValue;
		//danwei zishiying
		if(getTargetUnit == "SUB"){
			getTargetValue = Number(getTargetValue);
			var num_str = ("" + getTargetValue).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");  
			getTargetValue = num_str;
		}else if(getTargetUnit == "MB" && Number(getTargetValue) >1024){
			getTargetUnit="GB";
			getTargetValue = Number(getTargetValue/1024).toFixed(2);
			if(getTargetUnit == "GB" && Number(getTargetValue) >1024){
				getTargetUnit="TB";
				getTargetValue = Number(getTargetValue/1024).toFixed(2);
			}
		}else if(getTargetUnit == "MB" && Number(getTargetValue) < 1){
			getTargetUnit ="KB";
			getTargetValue = Number(getTargetValue*1024).toFixed(2);
		}else if(getTargetUnit == "Kbps" && Number(getTargetValue) >1024){
			getTargetUnit="Mbps";
			getTargetValue = Number(getTargetValue/1024).toFixed(2);
			if(getTargetUnit == "Mbps" && Number(getTargetValue) >1024){
				getTargetUnit="Gbps";
				getTargetValue = Number(getTargetValue/1024).toFixed(2);
			}
		}else if(getTargetUnit == "ms" && Number(getTargetValue) >=1000){
			getTargetUnit="s";
			getTargetValue = Number(getTargetValue/1000).toFixed(2);
			if(getTargetUnit == "s" && Number(getTargetValue) >=60){
				getTargetUnit="min";
				getTargetValue = Number(getTargetValue/60).toFixed(2);
			}
		}
		
		obj.TargetTxt = getTargetValue;
		obj.TargetUnitTxt = getTargetUnit;
		obj.alertId = new Date().getTime();
		var isShowPie = isShowPieInPopWin(mapModel,_paramObj);		
		//数据填充到Dom
		if(isShowPie){
			cellWinInfoRequest(_paramObj, mapModel, isPolygon);
		}else{
			single_cell_flag = true;
			combine_cell_flag = false;
			withPie_flag = false;
			noPie_flag = false;
			location_flag=false;
			popWindow(_paramObj.e.coordinate, renderToId, getAlertHtml(_paramObj.data.index), isPolygon, obj.lastState);
			//TODO 导出弹框数据
			var clcDiv = document.getElementById("exportCellForm");
			clcDiv.onclick = exportCellInfo;
		}

	};
	
	//排序并取最大最小经纬度
	function sortNumber(a,b) {//排序规则
		return a - b;
	}
	
	//弹窗调整
	function popWindow(_featureCenter, renderToId, alertContent, isPolygon, state) {
		//gis 点击后弹框调用 
		fusiongis.Popup.addPopup({
			position : ol.proj.toLonLat(
					[ Number(_featureCenter[0]),
					  Number(_featureCenter[1])]),
					  content : alertContent,
					  mapId : renderToId
		});
		//管控小区弹框位置  start 
		var alertDiv = $("#ol-popupContainer-id"+renderToId);
		$(alertDiv).removeClass("ol-popupContainer-class");
		var ool_left = 0;
		var ool_top = 0;
		
		$(".ol-overlay-container").css("height",0);
		if(withPie_flag == true){
		    var screenWidth = window.screen.width;
			if(screenWidth>=3000){
			   $(".ol-overlay-container").css("top",$('.ol-overlay-container').position().top - 410);
			}else{
			   $(".ol-overlay-container").css("top",$('.ol-overlay-container').position().top - 140);
			}
		}
		if(single_cell_flag == true){
		    var screenWidth = window.screen.width;
			if(screenWidth>=3000){
			   $(".ol-overlay-container").css("top",$('.ol-overlay-container').position().top - 240);
			}else{
			   $(".ol-overlay-container").css("top",$('.ol-overlay-container').position().top - 85);
			}
		}
		if(combine_cell_flag == true){
		    var screenWidth = window.screen.width;
			if(screenWidth>=3000){
			   $(".ol-overlay-container").css("top",$('.ol-overlay-container').position().top - 180);
			}else{
			   $(".ol-overlay-container").css("top",$('.ol-overlay-container').position().top - 60);
			}
		}
		if(location_flag == true){
		    var screenWidth = window.screen.width;
			if(screenWidth>=3000){
			   $(".ol-overlay-container").css("top",$('.ol-overlay-container').position().top - 190);
			}else{
			   $(".ol-overlay-container").css("top",$('.ol-overlay-container').position().top - 60);
			}
		}
		
		var closeDiv = $(".cellBox").parents("#ol-popupContent-id").siblings(".ol-popupClose-class");
		var ool_left2 = 0;
		var ool_top2 = 0;
		if(!isPolygon){//多边形弹窗调整与小区弹窗调整
			//原产品化APP的：
			$(alertDiv).css({"left":"-2.25rem","top":"-8.563333rem","position":"absolute"});
			//原产品化APP的：
			closeDiv.css({"right":"1.833333rem","top":"0.75rem"});
			//DEMO改的：
		}else if(isPolygon){
			//原产品化APP的：
			$(alertDiv).css({"left":"-2.25rem","top":"-5.563333rem","position":"absolute"});
			//原产品化APP的：
			closeDiv.css({"right":"1.833333rem","top":"0.75rem"});
			//DEMO改的：
		}
		if(!state){//最后的指标信息是否存在
			$(".lastLablePopup").css("display","none");
		}else{
			$(".lastLablePopup").css("display","initial");
		}
		//管控小区弹框位置  end
	}
	
	//地图点击弹窗
	function popMapWindow(_paramObj, mapModel, mapData){
		single_cell_flag = false;
	    combine_cell_flag = false;
	    withPie_flag = false;
	    noPie_flag = false;
		location_flag=false;
	    FilterOnOffArr =[];
		controlLebelArrs =[];
		exportWhichTable = "";
		coverageBoolean = false;
	    capacityBoolean = false;
	    fupBoolean = false;
		//DEMO加入：
		cfg_window_data =[];
		if(_paramObj.activedTab != undefined){
			currentTab = _paramObj.activedTab;
		}
		currentCellsDatas = _paramObj.cellTotals;
		var cfg_window_lebel_url = "data/cfg_window_lebel.csv";
		var cfg_ctrl_lebel_url = "data/cfg_control_lebel.csv";
		Papa.parse(cfg_window_lebel_url,{
			download: true,
			complete: function (results) {
				FilterOnOffArr =[];
				var cfg_value = results.data;
				for(var i = 1;i<cfg_value.length-1;i++){
					var oobj = {};
					oobj.TC = cfg_value[i][0];
					oobj.HH = cfg_value[i][1];
					oobj.HL = cfg_value[i][2];
					oobj.LH = cfg_value[i][3];
					oobj.LL = cfg_value[i][4];
					oobj.RSRP = cfg_value[i][5];
					oobj.PRB = cfg_value[i][6];
					oobj.rootCause = cfg_value[i][8];
					oobj.solution = cfg_value[i][9];
					cfg_window_data.push(oobj);
					
					var oobbj = {};
					oobbj.leibie = cfg_value[i][10];
					oobbj.filterFlag = cfg_value[i][11];
					oobbj.filterFile = cfg_value[i][12];
					oobbj.filterFile_single = cfg_value[i][13];
					FilterOnOffArr.push(oobbj);
				}
				
				Papa.parse(cfg_ctrl_lebel_url,{
					download: true,
					complete: function (resultss) {
						controlLebelArrs =[];
						var ccg_value = resultss.data;
						for(var k = 1;k<ccg_value.length-1;k++){
							var ooobj = {};
							ooobj.labelName = ccg_value[k][0];
							ooobj.storyType = ccg_value[k][3];
							ooobj.indicator = ccg_value[k][8];
							controlLebelArrs.push(ooobj);
						}
						
						var _featureCenter = fusiongis.OlUtil.transform(_paramObj.e.coordinate, "EPSG:3857", "EPSG:4326");
						var pointsArray = mapModel.gisMap.polygonData;//多边形经纬数组
						var alertContent =  '';
						var tabDatas = tabData;
						var polygonLength = {length:"1"};
						var cellPoint = {X: _featureCenter[0], Y: _featureCenter[1]};
						
						if (backendCellRender !== "true") {
							//小区前端绘图
							//判断是否多边形点击
							if (_paramObj.data.type === "pologonClick" || (pointsArray.length > 0 && choosePolygonCell(cellPoint, pointsArray) == true)) {//是多边形
								polygonClick(_paramObj, mapModel, mapData);
							}else if(_paramObj.layerType == "ICON"){
							
								resoureSiteClick(_paramObj, mapModel, tabDatas);
							}else if(_paramObj.layerType == "ICON_AREA"){
							
								resoureAreaSiteClick(_paramObj, mapModel, tabDatas);
							}else {//是小区
								cellClick(_paramObj, mapModel, tabDatas);
							}
						} else {
							//小区后端制图
							if(_paramObj.layerType == "ICON"){
								resoureSiteClick(_paramObj, mapModel, tabDatas);
							}else if (_paramObj.layerType == "POLYGON" || !_paramObj.featureId || (_paramObj.featureId && _paramObj.featureId.indexOf("tempPolygon") !== -1)  || (_paramObj.data && _paramObj.data.id && _paramObj.data.id.indexOf("tempPolygon") !== -1)) {
								//点击多边形弹窗
								if ((pointsArray.length === 0 || choosePolygonCell(cellPoint, pointsArray) !== true)) {
									return;
								}
								
								var pointsData = pointsArray.join("-");
								var pointsParam = pointsData.replace(/,/g," ").replace(/-/g,",");
								
								$timeout(function() {
									loadingInterceptor.increaseLoadingCount();
								});
								fusiongis.OriginalAjax.postJSON({
									url: fusiongis.Constant.GisRootUrl + '/mapRender/contains',
									data: JSON.stringify({
										"polygon": "POLYGON((" + pointsParam + "))",
										"imgToken": mapModel.gisMap.backendCellImageToken
									}),
									success: function (result) {
										$timeout(function() {
											loadingInterceptor.decreaseLoadingCount();
										});
										if (!!!result) {
											return;
										}
										var responseData = JSON.parse(result);
										var status = responseData.status;
										
										var cellInfos = [];
										var datas = responseData.data;
										for (var i = 0; i < datas.length; i++) {
											cellInfos.push({
												CELLID : datas[i].id,
												XPOS : datas[i].centerPoint[0],
												YPOS : datas[i].centerPoint[1]
											})
										}
										mapModel.gisMap.currentCellData = cellInfos;
										polygonClick(_paramObj, mapModel);
									},
									failure: function (result) {
										$timeout(function() {
											loadingInterceptor.decreaseLoadingCount();
										});
									}
								});	
					
							} else  {
								
								// 点击小区弹窗
								var queryParam = mapModel.gisMap.getQueryParams();
								queryParam.polygon.type = "byCellIDs";
								queryParam.polygon.cellIds = [_paramObj.geoId];
								
								$http({
									method : 'POST',
									url : "/cellRender/queryCellInfos.action",
									dataType : "json",
									data : {params : JSON.stringify(queryParam)},
									async : true,
									cache : false,
									contentType : "application/json;charset=utf-8"
								}).then(function success(responseData) {
									var datas = responseData.data.data;
									var cellItem = datas[0];
									
									if (datas.length !== 1 && _paramObj.geoId !== cellItem.CELLID) {
									}
									//vvip单用户特殊处理
									if (cellItem.INDICATORNAME === "" && cellItem.INDICATORUNIT === "" ) {
										cellItem.INDICATORNAME = $translate.instant("i18n.map.cell.userNum");
										cellItem.INDICATORUNIT = $translate.instant("i18n.location.vvipSingle.unit");
									}
									cellItem.CELLNAME = cellItem.CELLNAME.replace(cellItem.CELLID, "");
									_paramObj.data = {
										id : cellItem.CELLID,
										cellName : cellItem.CELLNAME,
										INDICATORVAL : cellItem.INDICATORVAL,
										INDICATORNAME : cellItem.INDICATORNAME,
										INDICATORUNIT : cellItem.INDICATORUNIT,
										coordinate : [cellItem.XPOS, cellItem.YPOS]
									}
									
									cellClick(_paramObj, mapModel, tabDatas);
								});
							}
						}	
					}
				});
			}
		});
	}
	
	return {
		getAlertHtml: getAlertHtml,
		getPolygonAlertHtml: getPolygonAlertHtml,
		popMapWindow : popMapWindow,
		resoureSiteClick:resoureSiteClick,
		getpolygonParams : getpolygonParams
	};
}]);