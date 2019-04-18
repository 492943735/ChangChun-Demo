var leftSidebarApp = angular.module("sidebar.left");
leftSidebarApp.directive("chooseColorMould", [
		"$http",
		"LeftService",
		"CommonPath",
		"SettingService",
		"$translate","gisMapService","TabService", "$timeout","storyLineService", "tipWindow",
		function($http, LeftService,CommonPath,SettingService,$translate,gisMapService,TabService, $timeout,storyLineService, tipWindow) {
			var linkFunc = function(scope, elem, attr) {
				scope.colorList = [ "#ce0404", "#cdce02", "#016802", "#3ac841", "#63f17b", "#c4473e", "#c52a2f", "#aa39c9", "#853882", "#643d85", "#343f84",
						"#0305d1", "#0770a1", "#10aab0", "#ce8804", "#ca8632", "#7cb53a", "#c65c36"];//颜色弹出框所有值的列表
				var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]%<>/?~！@#￥……&*（）&|{}【】‘；：”“'。，、？a-zA-Z\u4e00-\u9fa5]","gm");
				var pattern2 = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]%<>/?~！@#￥……&*（）&|{}【】‘；：”“'。，、？a-zA-Z\u4e00-\u9fa5\\-]","gm");
				scope.thresholdPercent = "Percent";
				scope.thresholdNumber =  "Number";
				scope.hasThresholdPermission = permissionMap.thresholdPermission;
				scope.imgBasePath = CommonPath.imgBasePath;
				scope.IMAGES = IMAGES;
				scope.unit = "";
				scope.showColorDig = false;
				scope.color_set = null;
				function isNumber(val) {//检测是否是所有正负数，并且可以有小数部分    或 为0.xxxx形式的小数
					var numberPattern = /^(-?)([1-9]\d*(\.\d*[1-9])?)|(-?)(0\.\d*[1-9])|^(0?)$/;
					return numberPattern.test(val);
				}
				
				scope.colorSet = function(val, isMin, index, colorList) {//失去焦点事件
					if(isNaN(Number(val))) {//是不是数值，主要筛选掉.....
						showRuleTipMsg(isMin, colorList[index]);
					}
					else{
						if(!isNumber(val)) {//是否符合校验的正则
							showRuleTipMsg(isMin, colorList[index]);
						}
						else {
							for (var i = 0; i < colorList.length; ++i)
								{
									if ("" == colorList[i].maxVal || "" ==  colorList[i].minVal)
									{
										continue;
									}
									if (colorList[i].maxVal - colorList[i].minVal <= 0)
										{
											showAreaTipMsg(isMin, colorList[index]);
											break;
										}
								}
							
						}
					}
				};
				
				function showRuleTipMsg(isMin, setVal) {//非法字符弹框调用  
					var tipMsg = $translate.instant("i18n.threshold.warning");
					tipWindow.show(true, true, false, tipMsg, function() {
						clearInput(isMin, setVal);
					});
				}
				
				function showAreaTipMsg(isMin, setVal) {//上限值小于下限值弹框调用  
					var tipMsg = $translate.instant("i18n.threshold.area.warning");
					tipWindow.show(true, true, false, tipMsg, function() {
						clearInput(isMin, setVal);
					});
				}
				
				function clearInput(isMin, setVal) {//清除文本
					if(isMin) {
						setVal.minVal = "";
					}
					else {
						setVal.maxVal = "";
					}
				}
				
				scope.chooseColor = function(color_set){
					scope.color_set = color_set;
					scope.showColorDig  = !scope.showColorDig;
					color_set.showColorDig = !color_set.showColorDig;//每个色块对应的点击事件
				};
				
				scope.getThresholdTitle = function() {
                	var title = scope.colorDialog.activation;
                	
                	if(Constant.TOTAL_TRAFFIC === title) {
                		return $translate.instant("i18n.label.totalTraffic");
                	}
                	else {
                		return $translate.instant(title);
                	}
                };
				
				scope.getTitleUnit = function(){
					var mapModel = gisMapService.getActivedMapModel();
					for(var i = 0;i<mapModel.icaAreas.length;i++){
						var item = mapModel.icaAreas[i];
						if(item.active && item.type == "app"){
							scope.unit = "(MB)";
							return "(MB)";
						}
					}
					if(scope.colorDialog.unit){
						if(scope.colorDialog.unit == "Mbps" || scope.colorDialog.unit == "Gbps" || scope.colorDialog.unit == "Tbps" ){
							scope.unit = " (Kbps)";
							return " (Kbps)";
						}
						return " (" + $translate.instant(scope.colorDialog.unit) + ")";
					}else{
						scope.unit = "";
						return "";
					}
				};
				
				scope.imageContent = {
						iconVvipArrowLight : CommonPath.imgBasePath + IMAGES.IconVvipArrowLight,
						btnBg : CommonPath.imgBasePath + IMAGES.ThresholdBtn,
						btnBgActive : CommonPath.imgBasePath + IMAGES.ThresholdBtnActive,
						thredsholdBackground : CommonPath.imgBasePath + IMAGES.ThredsholdBackground
				};
				
				scope.getOneFreeColor = function(){
					for(var i = 0;i<scope.colorList.length;i++){
						var used = false;
						for(var j = 0;j< scope.colorDialog.colorList.length;j++){
							if(scope.colorList[i] == scope.colorDialog.colorList[j].colorVal){
								used = true;
							}
						}
						if(!used){
							return scope.colorList[i];
						}
					}
				};
				
				scope.addBtn = CommonPath.imgBasePath + IMAGES.ThresholdAddBtn;//这块是阈值设置页面最后面的加号图片的路径
				scope.minusBtn = CommonPath.imgBasePath + IMAGES.ThresholdMinusBtn;//这块是阈值设置页面最后面的减号图片的路径
				scope.addBtnClick = function (){//加号按钮，点击添加一行
					if(!scope.canAddThreshold()){
						return;
					}
					var thresholdLength = scope.colorDialog.colorList.length;//声明一个变量用来保存colorDialong。List的长度
					if(thresholdLength < 5){//每次点击判断是不是超过4条数据，如果没有就向数据中push一条，用来生成一行表格
						scope.colorDialog.colorList.push({
							minVal : scope.colorDialog.colorList[thresholdLength-1].maxVal,
							maxVal : "",
							minIndicatorVal: scope.colorDialog.colorList[thresholdLength-1].maxVal,
							maxIndicatorVal: "",
							colorVal : scope.getOneFreeColor(),
							checked : true,
							showColorDig : false
						});
						
					}
				};
				
				//每次浸入增加按钮都可点击
				scope.canAddThreshold = function(){
					return true;
				};
				
				/**
				 *  减号按钮的点击事件，如果是最后一行那么就什么都不干，如果不是救
				 * @param last 最后一个行
				 */
				scope.minusBtnClick = function(last){
					if(!last){
						return;
					}else{
						//将数据中的最后一个元素删除
						scope.colorDialog.colorList.length = scope.colorDialog.colorList.length - 1;
					}
				};
				
				scope.colorDialog = LeftService.thresholdDataCopy;//将阈值的数据赋值给设置页面
				scope.changeColor = function(color_set, color) {//颜色弹出框的点击事件
					color_set.colorVal = color;//将点击对象的数据中的颜色改为当前选择的数据
					color_set.showColorDig = false;//改变数据关闭颜色弹出框
				};
				
				/**
				 * 判断数据是否正常的函数，如果有错弹框提示
				 * @param arr 数据列表，用来判断整个数据是否有错
				 */
				function ifCorrectFun(arr){
					for(var i = 0;i<arr.length;i++){
						var item = arr[i];
						var isError = false;
						try{
							var min = Number(item.minVal);
							var max = Number(item.maxVal);
							if(isNaN(min) || isNaN(max) || item.minVal === ""|| item.maxVal === ""){
								var tipMsg = $translate.instant("i18n.threshold.warning");
		    					tipWindow.show(true, true, false, tipMsg, null);
								return false;
							}
							if(min >= max){
								var tipMsg = $translate.instant("i18n.threshold.warning.min2max");
		    					tipWindow.show(true, true, false, tipMsg, null);
								return false;
							}
							item.minVal = min + "";
							item.maxVal = max + "";
						}catch(e){
							return false;
						}
					}
					if(scope.colorDialog.rangeType == "0"){
						var percentCount = 0;
						for(var i = 0;i<arr.length;i++){
							var item = arr[i];
							var min = Number(item.minVal);
							var max = Number(item.maxVal);
							if(min>=0){
								percentCount++ ;
							}
							if(max>=0){
								percentCount++ ;
							}							
						}
						if(percentCount != arr.length*2){
							return false;
						}
					}
					return true;
				}
				
				scope.getThresHoldObj = function(needStr){
					var obj = {
						rangeType : scope.colorDialog.rangeType
					}
					var colorList = [];
					for(var i = 0;i<scope.colorDialog.colorList.length;i++){
						var item = scope.colorDialog.colorList[i];
						colorList.push({
							minVal : item.minVal,
							maxVal : item.maxVal,
							colorVal : item.colorVal
						});
					}
					obj.colorList = colorList;
					if(needStr){
						return JSON.stringify(obj);
					}else{
						return obj;
					}
					
				};
				//TODO:
				/**
				 * 保存按钮的点击事件，调用ifCorrectFun()
				 */
				scope.save = function(){
					var setUpData = scope.colorDialog.colorList;
					var ifCorrect = ifCorrectFun(setUpData);
					scope.showColorDig = false;
					if(ifCorrect){
						var mapModel = gisMapService.getActivedMapModel();
						mapModel.gisMap.thresholdData.colorList = setUpData;
						mapModel.gisMap.clearPreviewState();
						if(TabService.getActiveTab().item.text == "DIY"){
							scope.diySave();
						}else{
							scope.storySave();
						}
						LeftService.thresholdDataCopy.showDialog = false;
						TabService.setThreshold(LeftService.thresholdDataCopy.activation,LeftService.thresholdDataCopy.colorList);
						//改变阈值社区打点数据改变						
						var communityName = mapModel.icaAreas[mapModel.icaAreas.length-1].text;
			 			gisMapService.communityDataShow(communityName,TabService);
						
					}
				};
				
				scope.storySave = function(){
					var mapModel = gisMapService.getActivedMapModel();
					var threshold = scope.getThresHoldObj(false);
					for(var i in threshold.colorList){
						var item = threshold.colorList[i];
						item.checked = true;
						item.showColorDig = false;
					}
					var activedTab = TabService.getActiveTab();
					var deferred = storyLineService.saveStoryThreshold(threshold);
					deferred.then(function(){
						mapModel.gisMap.thresholdData = threshold;
						LeftService.setThreshold(mapModel);
						gisMapService.refreshMapData(activedTab);
					});
				};
				
				scope.diySave = function(){
					var userLabel = "--";
					var appLabel = "--";
					var kqikpiLabel = "--";
					var activeLabel = "--";
					var mapModel = gisMapService.getActivedMapModel();
					for (var i = 0; i < mapModel.icaAreas.length; i++) {
						var item = mapModel.icaAreas[i];
						if(item.type == "user"){
							userLabel = item.text;
						}else if(item.type == "app"){
							appLabel = item.dimension;
						}else if(item.type == "quality"){
							kqikpiLabel = item.text;
						}
						if(item.active){
							activeLabel = item.text;
						}
					}
					var modelColorParams = {
							userLabel : userLabel,
							appLabel : appLabel,
							kqikpiLabel : kqikpiLabel,
							activeLabel : activeLabel,
							threshold : scope.getThresHoldObj(true),
							renderDiscoveryIndicatorByCell : renderDiscoveryIndicatorByCell
					};
					
					LeftService.saveDiyModelColor(modelColorParams, mapModel);
				};
				
				scope.cancel = function(){//取消按钮的点击事件
					LeftService.thresholdDataCopy.showDialog = false;
					scope.showColorDig = false;
					LeftService.resetThresholdDataCopy(gisMapService.getActivedMapModel());
				};
				
				scope.restore = function(){
					var mapModel = gisMapService.getActivedMapModel();
					var thresholdCopy = angular.copy(mapModel.gisMap.thresholdDataCopy);
					LeftService.exitPreview(mapModel, TabService.getActiveTab());
					LeftService.thresholdDataCopy.showDialog = false;
				};
				
				scope.restoreShow = function(){
					var mapModel = gisMapService.getActivedMapModel();
            		if(null == mapModel.gisMap){
            			return false;
            		}
            		return mapModel.gisMap.isPreViewState;
				};
				
				/**
				 * 预览按钮的点击事件,调用ifCorrectFun()
				 */
				scope.preView = function(){
					var setUpData = scope.colorDialog.colorList;
					var ifCorrect = ifCorrectFun(setUpData);
					if(ifCorrect){
						for(var index in scope.colorDialog.colorList){
							var item = scope.colorDialog.colorList[index];
							item.checked = true;
						} 
						var mapModel = gisMapService.getActivedMapModel();
						LeftService.thresholdDataCopy.showDialog = false;
						var activedTab = TabService.getActiveTab();
						LeftService.handlerPreviewEvent(mapModel, scope.colorDialog, activedTab);
					}
				};
				
				/**
				 * 每行的Begin值的改变的事件，根据正则验证使每行的值只能是数字，并将当前的值复制到上一行的最大值处
				 * @param color_set 挡墙行的数据
				 * @param index 当前行的下标
				 */
				scope.onInputMinChange = function(color_set, index){
					if(scope.colorDialog.rangeType == "0"){
						color_set.minVal = color_set.minVal.replace(pattern2,"");
					}else{
						color_set.minVal = color_set.minVal.replace(pattern,"");
					}
					var min = Number(color_set.minVal);
					if(isNaN(min)){
						return;
					}
					if(scope.colorDialog.rangeType == "0"){
					}
					if(index > 0){
						scope.colorDialog.colorList[index-1].maxVal = color_set.minVal;
					}
					color_set.minIndicatorVal = color_set.minVal.replace(pattern2,"");
				};
				
				/**
				 * 每行的End值的改变的事件，根据正则验证使每行的值只能是数字，并将当前的值复制到下一行的最小值处
				 * @param color_set 当前行的数据
				 * @param index 当前行的下标
				 */
				scope.onInputMaxChange = function(color_set, index){
					if(scope.colorDialog.rangeType == "0"){
						color_set.maxVal = color_set.maxVal.replace(pattern2,"");
						color_set.minIndicatorVal = color_set.minVal.replace(pattern2,"");
						color_set.maxIndicatorVal = color_set.maxVal.replace(pattern2,"");
					}else{
						color_set.maxVal = color_set.maxVal.replace(pattern,"");
						color_set.minIndicatorVal = color_set.minVal.replace(pattern,"");
						color_set.maxIndicatorVal = color_set.maxVal.replace(pattern,"");
					}
					var max = Number(color_set.maxVal);
					if(isNaN(max)){
						return;
					}
					//限制阈值配置的最大值为100
					if(index < scope.colorDialog.colorList.length - 1) {
						scope.colorDialog.colorList[index + 1].minVal = color_set.maxVal;
					}
				};
				
				scope.$watch("colorDialog.showDialog", function(newVal, oldVal) {
					if(newVal != oldVal && newVal) {
						if(renderDiscoveryIndicatorByCell !== 'true'){
							var mapModel = gisMapService.getActivedMapModel();
							if(mapModel.icaAreas.length == 1 && (mapModel.icaAreas[0].indicator == Constant.LABEL_RSRP
									|| mapModel.icaAreas[0].indicator == Constant.LABEL_RSRQ)){
								$("#scene_rangeTypeBox_select option[value='0']").remove();
							}else{
								if($("#scene_rangeTypeBox_select option").length == 1){
								   $("#scene_rangeTypeBox_select").prepend("<option value='0'>"+scope.thresholdPercent+"</option>");
								}
							}
						}
						$("#scene_rangeTypeBox_select").select2({minimumResultsForSearch:-1});
						$("#scene_rangeTypeBox_select").select2("val", scope.colorDialog.rangeType);
						
						$("#scene_rangeTypeBox_select").on("select2:close", function(){
							$timeout(function(){
								var selectType = $("#scene_rangeTypeBox_select").select2("data")[0].id;
								if(selectType != scope.colorDialog.rangeType){
									scope.colorDialog.rangeType = selectType;
									for(var i = 0;i< scope.colorDialog.colorList.length;i++){
										var item = scope.colorDialog.colorList[i];
										item.minVal = "";
										item.maxVal = "";
									}
								}
							});
						});
					}
				});
			};
			return {
				restrict : "E",
				replace : true,
				scope : {},
				link : linkFunc,
				template : '<div class="modelColorBg2" id="colorChooseContent"'+
					'ng-show="colorDialog.showDialog">'+
				'<div class="row colorChoose_context2" id="colorChooseContent_row">'+
					'<div class="text-center thresholdSetUpBackground"'+
						'id="colorChooseContent_row1">'+
						'<div class="thresholdSetUpBackgroundTitle" id="colorChooseContent_table">'+
						'<span class="thresholdSetUpBackgroundTitle_Uib" uib-tooltip="{{getThresholdTitle()}}{{getTitleUnit()}}">{{getThresholdTitle()}}{{getTitleUnit()}}</span>'+	
							'<img class="thresholdClose" ng-src="{{imgBasePath + IMAGES.ic_colse}}" ng-click="cancel();">'+
						'</div>'+
						'<div class="threshold_content"'+
							'id="scene_colorChoose_box">'+
								'<div class="rangeType2" id="scene_rangeTypeBox">'+
									'<small id="scene_rangeTypeBox_unit">{{"i18n.threshold.thresholdType" |translate}}:</small>'+
									'<select><option>{{"i18n.threshold.number" |translate}}</option></select>'+	
								'</div>'+
								'<table class="table table-bordered table-responsive threshold_table_bordered"'+
								'id="threshold_table">'+
									'<tr id="scene_colorChoose_box_table_tr1">'+
									'<td id="scene_colorChoose_box_table_tr1_td" class="threshold_mid_column">{{" " |translate}}</td>'+	
									'<td id="scene_colorChoose_box_table_Min" class="threshold_large_column">{{"i18n.threshold.begin" |translate}}</td>'+		
									'<td id="scene_colorChoose_box_table_Max" class="threshold_large_column">{{"i18n.threshold.end" |translate}}</td>'+	
									'<td id="scene_colorChoose_box_table_Color" class="threshold_small_column">{{"i18n.threshold.color" |translate}}</td>'+	
									'<td class="threshold_td_noborder" ng-class="{threshold_color_dig_minus : !canAddThreshold()}" id="scene_colorChoose_box_table_Color" ng-click="addBtnClick()">'+
									'<img class="threshold_small_img" ng-src=\'{{addBtn}}\' ng-class="{addOpacity:colorDialog.colorList.length>4}">'+	
									'</td>'+		
									'</tr>'+	
									'<tr ng-repeat="color_set in colorDialog.colorList"'+
									'id="scene_colorChoose_box_color_set">'+
									'<td id="color_set.rangeName{{$index}}" class="threshold_mid_column">{{"i18n.threshold.rangeName" |translate}}{{$index+1}}</td>'+	
									'<td id="color_set.minVal{{$index}}" class="threshold_large_column">'+
									'<input ng-blur="colorSet(color_set.minVal, true, $index, colorDialog.colorList)" autoComplete="off" class="threshold_input" type="text" ng-maxlength="15" maxlength="15" ng-model="color_set.minVal"'+
									'id="color_set.minVal_input{{$index}}"'+	
									'ng-change="onInputMinChange(color_set,$index);"'+		
									'uib-tooltip="{{color_set.minVal}}"><span class="thresholdSetUpTdSpan"'+		
									'id="colorDialog.rangeType1.value{{$index}}" ng-show="colorDialog.rangeType == \'0\'">{{unit}}'+		
									'</span></td>'+		
									'<td id="color_set.maxVal{{$index}}" class="threshold_large_column"><input ng-blur="colorSet(color_set.maxVal, false, $index, colorDialog.colorList)" autoComplete="off" class="threshold_input" type="text" ng-maxlength="15" maxlength="15"'+	
									'ng-model="color_set.maxVal" id="color_set.maxVal_input{{$index}}"'+	
									'ng-change="onInputMaxChange(color_set,$index);"'+		
									'uib-tooltip="{{color_set.maxVal}}"><span class="thresholdSetUpTdSpan"'+		
									'id="colorDialog.rangeType2.value{{$index}}" ng-show="colorDialog.rangeType == \'0\'">'+		
									'{{unit}}'+
									'</span></td>'+		
									'<td id="color_set{{$index}}" class="threshold_small_column">'+		
									'<div id="color_block{{$index}}" class="color_block2"'+	
									'tooltip-placement="right"'+	
									'ng-style="{backgroundColor: color_set.colorVal}"'+			
									'ng-click="chooseColor(color_set);">'+			
									'<span><img ng-src="{{imageContent.iconVvipArrowLight}}"></span>'+			
									'</div>'+			
									'</td>'+			
									'<td class="threshold_td_noborder" ng-class="{threshold_color_dig_minus : !$last}" ng-click="minusBtnClick($last)" ng-if="$index!=0 && $index!=1">'+		
									'<img class="threshold_small_img" ng-src=\'{{minusBtn}}\'>'+	
									'</td>'+	
									'</tr>'+		
									'</table>'+	
									'<div class="colorChoose-btn2" id="scene_colorChoose-btn">'+
								'<input class="threshold_btn_no" type="button" value="{{\'i18n.threshold.cancel\' | translate}}" ng-click="cancel();" id="scene_colorChoose-btn_cancel"/>'+
							'<input class="threshold_btn_sure" type="button" value="{{\'i18n.threshold.save\' | translate}}" ng-click="save();"  ng-show="hasThresholdPermission" id="scene_colorChoose-btn_cancel"/>'+
							'</div>'+	
							'</div>'+		
						  '<div class="color_box2" id="color_color_box" ng-show = showColorDig>'+
						  '<ul id="color_box_ul">'+
							'<li class="color_li2" ng-repeat="color in colorList" id="color_box_ul_li">'+
							'<div id="color_box_ul_li{{$index}}" class="color_block2" ng-style="{backgroundColor:color}" ng-click="changeColor(color_set, color)"></div>'+	
							'</li>'+		
							'</ul>'+			
							'</div>'+		
							'</div>'+
			   	 		'</div>'+
			   	 	'</div>'
			
			};
		} ]);