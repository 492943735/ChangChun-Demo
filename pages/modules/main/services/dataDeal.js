angular.module("common").directive("dataDealService", ["dataDealService", "CommonPath",function(dataDeal, CommonPath) {
	var cfg_control_lebel_data=[];
var cfg_control_lebel_url="data/cfg_control_lebel.csv"
function getControlLabelData(){
	Papa.parse(cfg_control_lebel_url, {
						download: true,
						complete: function (results) {						
							cfg_control_lebel_data = results.data;							
							}							
						});
}
//cfg_business_lebel.csv
var cfg_business_lebel_data=[];
var  cfg_business_lebel_url="data/cfg_business_lebel.csv";
function getBusinessLebelData(){
	Papa.parse(cfg_business_lebel_url,{
		download: true,
		complete: function (results) {						
			cfg_business_lebel_data = results.data;							
			}						
	});
}
//cfg_kqi_threshold.csv
var cfg_kqi_threshold_data=[];
var  cfg_kqi_threshold_url="data/cfg_kqi_threshold.csv";
function getKqiThresholdData(){
	Papa.parse(cfg_kqi_threshold_url,{
		download: true,
		complete: function (results) {						
			cfg_kqi_threshold_data = results.data;							
			}						
	});
}
//cfg_story_lebel.csv
var cfg_story_lebel_data=[];
var  cfg_story_lebel_url="data/cfg_story_lebel.csv";
function getStoryLebelData(){
	Papa.parse(cfg_story_lebel_url,{
		download: true,
		complete: function (results) {						
			cfg_story_lebel_data = results.data;							
			}						
	});
}
//cfg_window_lebel.csv
var cfg_window_lebel_data=[];
var  cfg_window_lebel_url="data/cfg_window_lebel.csv";
function getWindowLebelData(){
	Papa.parse(cfg_window_lebel_url,{
		download: true,
		complete: function (results) {						
			cfg_window_lebel_data = results.data;							
			}						
	});
}
//sdr_data_kpi.csv
var sdr_data_kpi_data=[];
var  sdr_data_kpi_url="data/sdr_data_kpi.csv";
function getKpiData(){
	Papa.parse(sdr_data_kpi_url,{
		download: true,
		complete: function (results) {						
			sdr_data_kpi_data = results.data;							
			}						
	});
}
//sdr_data_kqi.csv
var sdr_data_kqi_data=[];
var  sdr_data_kqi_url="data/sdr_data_kqi.csv";
function getKqiData(){
	Papa.parse(sdr_data_kqi_url,{
		download: true,
		complete: function (results) {						
			sdr_data_kqi_data = results.data;							
			}						
	});
}
//sdr_data_user.csv
var sdr_data_user_data=[];
var  sdr_data_user_url="data/sdr_data_user.csv";
function getUsersData(){
	Papa.parse(sdr_data_user_url,{
		download: true,
		complete: function (results) {						
			sdr_data_user_data = results.data;							
			}						
	});
}
//sdr_export_fup.csv
var sdr_export_fup_data=[];
var  sdr_export_fup_url="data/sdr_export_fup.csv";
function getExportFupData(){
	Papa.parse(sdr_export_fup_url,{
		download: true,
		complete: function (results) {						
			sdr_export_fup_data = results.data;							
			}						
	});
}
//sdr_topn_network.csv
var sdr_topn_network_data=[];
var  sdr_topn_network_url="data/sdr_topn_network.csv";
function getTopnNetworkData(){
	Papa.parse(sdr_topn_network_url,{
		download: true,
		complete: function (results) {						
			sdr_topn_network_data = results.data;							
			}						
	});
}
//sdr_topn_service.csv
var sdr_topn_service_data=[];
var  sdr_topn_service_url="data/sdr_topn_service.csv";
function getTopnServiceData(){
	Papa.parse(sdr_topn_service_url,{
		download: true,
		complete: function (results) {						
			sdr_topn_service_data = results.data;							
			}						
	});
}
//sdr_topn_user.csv
var sdr_topn_user_data=[];
var  sdr_topn_user_url="data/sdr_topn_user.csv";
function getTopnUsersData(){
	Papa.parse(sdr_topn_user_url,{
		download: true,
		complete: function (results) {						
			sdr_topn_user_data = results.data;							
			}						
	});
}

//��ʼ��ʱ�����̨�����
function getInitWorkbenchData(){
		getControlLabelData();
		var initWorkbenchData=[];
		var itemsArray=["DIY"];
		//��ȡ����������
		for(var i=0;i<cfg_control_lebel_data.length;i++){
			if($.inArray(cfg_control_lebel_data[i][3],itemsArray)<0&&cfg_control_lebel_data[i][3]!=undefined){
				itemsArray.push(cfg_control_lebel_data[i][3]);
			}			
		}
		//������������ߵ��û���APP��ָ���������ͼƬ�Ȼ���Ϣ
		for(var j=0;j<itemsArray.length;j++){
			var totalData={};
			var item={
				"text":itemsArray[j],
				"active":false,
				"order":0
			};
			var userIcas=[];
			var appLeftIcas=[];	
			var appRightIcas=[];
			var qualityIcas=[];		
				
			for (var i=0;i<cfg_control_lebel_data.length;i++){
				if(cfg_control_lebel_data[i][3]==itemsArray[j]&&cfg_control_lebel_data[i][1]=="user"){
					var tempJson={
						"text":cfg_control_lebel_data[i][0],
						"selected":true,
						"label":cfg_control_lebel_data[i][0],
						"data":{"data":"2.240","unit":""},
						"iconUrl":cfg_control_lebel_data[i][2],
						"type":cfg_control_lebel_data[i][1],
						"inRightSidebar":cfg_control_lebel_data[i][4]=="FALSE"?false:true,
						"active":false,
						"color":null,
						"createdUser":null,
						"base":true,
						"iconData":null,
						"dimension":"{\"DAY\":\"SDR_CWR_ALL_USER_CELL_1DAY\",\"HOUR\":\"SDR_CWR_ALL_USER_CELL_HOUR\"}","indicator":"HDI_METADATA_GRP_SUBS_NUM","vvipSingleUser":null,
						"msisdn":null		
					};
					userIcas.push(tempJson);
				}
				
			}
			
			for (var i=0;i<cfg_control_lebel_data.length;i++){
				if(cfg_control_lebel_data[i][3]==itemsArray[j]&&cfg_control_lebel_data[i][1]=="app"&&cfg_control_lebel_data[i][4]=="FALSE"){
					var tempJson={
						"text":cfg_control_lebel_data[i][0],
						"selected":true,
						"label":cfg_control_lebel_data[i][0],
						"data":{"data":"2.240","unit":""},
						"iconUrl":cfg_control_lebel_data[i][2],
						"type":cfg_control_lebel_data[i][1],
						"inRightSidebar":false,
						"active":false,
						"color":null,
						"createdUser":null,
						"base":true,
						"iconData":null,
						"dimension":"{\"DAY\":\"SDR_CWR_ALL_USER_CELL_1DAY\",\"HOUR\":\"SDR_CWR_ALL_USER_CELL_HOUR\"}","indicator":"HDI_METADATA_GRP_SUBS_NUM","vvipSingleUser":null,
						"msisdn":null		
					};
					appLeftIcas.push(tempJson);
				}
				
			}
			for (var i=0;i<cfg_control_lebel_data.length;i++){
				if(cfg_control_lebel_data[i][3]==itemsArray[j]&&cfg_control_lebel_data[i][1]=="app"&&cfg_control_lebel_data[i][4]=="TRUE"){
				var tempJson={
						"text":cfg_control_lebel_data[i][0],
						"selected":true,
						"label":cfg_control_lebel_data[i][0],
						"data":{"data":"2.240","unit":""},
						"iconUrl":cfg_control_lebel_data[i][2],
						"type":cfg_control_lebel_data[i][1],
						"inRightSidebar":true,
						"active":false,
						"color":null,
						"createdUser":null,
						"base":true,
						"iconData":null,
						"dimension":"{\"DAY\":\"SDR_CWR_ALL_USER_CELL_1DAY\",\"HOUR\":\"SDR_CWR_ALL_USER_CELL_HOUR\"}","indicator":"HDI_METADATA_GRP_SUBS_NUM","vvipSingleUser":null,
						"msisdn":null		
					};
					appRightIcas.push(tempJson);
				}
				
			}
			for (var i=0;i<cfg_control_lebel_data.length;i++){
				if(cfg_control_lebel_data[i][3]==itemsArray[j]&&cfg_control_lebel_data[i][1]=="quality"){
				var	tempJson={
						"text":cfg_control_lebel_data[i][0],
						"selected":true,
						"label":cfg_control_lebel_data[i][0],
						"data":{"data":"2.240","unit":""},
						"iconUrl":cfg_control_lebel_data[i][2],
						"type":cfg_control_lebel_data[i][1],
						"inRightSidebar":false,
						"active":false,
						"color":null,
						"createdUser":null,
						"base":true,
						"iconData":null,
						"dimension":"{\"DAY\":\"SDR_CWR_ALL_USER_CELL_1DAY\",\"HOUR\":\"SDR_CWR_ALL_USER_CELL_HOUR\"}","indicator":"HDI_METADATA_GRP_SUBS_NUM","vvipSingleUser":null,
						"msisdn":null		
					};
					qualityIcas.push(tempJson);
				}
				
			}			
			var content={
				"userIcas":userIcas,
				"appLeftIcas":appLeftIcas,
				"appRightIcas":appRightIcas,
				"qualityIcas":qualityIcas,
				"totalTraffic":{"text":"Total Traffic","selected":false,"label":"Total Traffic","data":{"data":"--","unit":""},"iconUrl":"label_psVolume.png","type":"app","inRightSidebar":false,"active":false,"color":null,"createdUser":null,"base":false,"iconData":null,"dimension":"-2","indicator":"HDI_METADATA_GRP_NETWORK_TRAFFIC","vvipSingleUser":null,"msisdn":null}
			};
			totalData.item=item;
			totalData.content=content;
			initWorkbenchData.push(totalData);
		}
		
		return initWorkbenchData;
	}

}]);