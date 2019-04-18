var leftSidebarApp = angular.module("sidebar.left");

leftSidebarApp.directive("leftSidebar", [ "$timeout", "gisMapService",
		"TabService", "CommonPath", "LeftService","$translate","MenubarService","$document", "tipWindow", "playBackService",
		function($timeout, gisMapService, TabService, CommonPath, LeftService, $translate, MenubarService, $document, tipWindow, playBackService) {
			var linkFunc = function(scope, elem, attr) {
				scope.imgBasePath = CommonPath.imgBasePath;
				scope.mapData = gisMapService.mapData;
				scope.btns = LeftService.btns;
				scope.thresholdData = LeftService.thresholdData;//将阈值数据复制到scope下
				scope.ThresholdSettingImage = CommonPath.imgBasePath + IMAGES.ThresholdSetUpBtn;//这块是阈值的设置按钮的背景图片的设置
				
				//设置按钮的点击事件，点击之后改变之前的状态让设置页面显示
				scope.ThresholdSetUp = function(){
					if(gisMapService.getActivedMapModel().isLock){
						var tipMsg = $translate.instant("i18n.threshold.map.lock");
						tipWindow.show(true, true, false, tipMsg, null);
                		return;
                	}
					LeftService.thresholdDataCopy.showDialog = true;// 打开阈值设置页面
					scope.btns[1].isActived = false;//将阈值窗口关闭
				};
				scope.associated = false;
				scope.getThresholdItemShowVal = function(item, index){
					if(scope.thresholdData.rangeType == "1"){
						var str = item.minVal+"<= X";
						str += "<";
						if(index == scope.thresholdData.colorList.length - 1){
							str += "=";
						}
						str += " " + item.maxVal;
						return str;
					}else{
						if(item.minIndicatorVal == item.maxIndicatorVal){
							return "X = " + item.minIndicatorVal;
						}
						var str = item.minIndicatorVal+"<= X";
						str += "<";
						if(index == scope.thresholdData.colorList.length - 1){
							str += "=";
						}
						str += " " + item.maxIndicatorVal;
						return str;
					}
				};
				scope.checkThresholdDataCombination = function(index){
					return checkThresholdDataCombinationTool(index, scope.thresholdData);
				};
				scope.checkShowThreshold = function(){
					var activeMapModel = gisMapService.getActivedMapModel();
					if(activeMapModel.gisMap.thresholdData == null){
						return false;
					}
					if(activeMapModel.gisMap.thresholdData.rangeType == "0" && 
							!scope.checkHasCellInfos(activeMapModel)){
						return false;
					}
					return true;
				};
				scope.checkShowPercentThresholdNotConfig = function(){
					var activeMapModel = gisMapService.getActivedMapModel();
					if(activeMapModel.gisMap.thresholdData == null){
						return false;
					}
					return activeMapModel.gisMap.thresholdData.rangeType == "0" && 
					!scope.checkHasCellInfos(activeMapModel);
				};
				scope.checkThresholdNotConfig = function(){
					var activeMapModel = gisMapService.getActivedMapModel();
					return activeMapModel.gisMap.thresholdData == null;
				};
				scope.lastBtnClickTime = new Date().getTime();
                scope.btnClick = function(btn,type){
                	if(btn.name == Constant.DOUBLEWIN){
                		if(btn.showIconUrl == CommonPath.imgBasePath + IMAGES.doubleScreenRight){
                    		btn.typeImageActivedPress = CommonPath.imgBasePath + IMAGES.doubleScreenRightPress;
    					}else{
    						btn.typeImageActivedPress = CommonPath.imgBasePath + IMAGES.doubleScreenLeftPress;
    					}
                	}
                	var showUrl = btn.showIconUrl;
					if(type == Constant.EVENT_TYPE_MOUSE_LEAVE){
						if(!btn.isPress){
							return;
						}
						type = Constant.EVENT_TYPE_MOUSE_UP;
					}
					if(type == Constant.EVENT_TYPE_MOUSE_UP){
						btn.isActived = !btn.isActived;
						btn.isPress = false;
					}else{
						btn.isPress = true;
					}
					if(btn.isActived){
						if(type == Constant.EVENT_TYPE_MOUSE_UP){
							showUrl = btn.highLighticonUrl;
						}else{
							showUrl = btn.typeImageActivedPress;
						}
					}else{
						if(type == Constant.EVENT_TYPE_MOUSE_DOWN){
							showUrl = btn.typeImageNoActivedPress;
						}else{
							showUrl = btn.iconUrl;
						}
					}
					btn.showIconUrl = showUrl;
					if(type == Constant.EVENT_TYPE_MOUSE_UP){
						scope.lastBtnClickTime = new Date().getTime();
						switch (btn.name) {
							case Constant.MAPZOOMINCREASE:
								gisMapService.changeZoom(1,TabService);
								break;
							case Constant.MAPZOOMDECREASE:
								gisMapService.changeZoom(-1,TabService);
								break;
							case Constant.LOCATION:
								for(var i=0; i<scope.btns.length;i++){
									var bIndex = i;
									if(scope.btns[bIndex].name == Constant.BANDWIDTH || scope.btns[bIndex].name == Constant.THRESHOLD){
										scope.btns[bIndex].isActived = false;
									}
								};
								break;
							case Constant.BANDWIDTH:
								for(var i=0; i<scope.btns.length;i++){
									var bIndex = i;
									if(scope.btns[bIndex].name == Constant.LOCATION || scope.btns[bIndex].name == Constant.THRESHOLD){
										scope.btns[bIndex].isActived = false;
									}
								};
								var activeMapModel = gisMapService.getActivedMapModel();
								if(activeMapModel.gisMap.accessData.length == 1){
									scope.bandWidthSetUp();
								}
								break;
							case Constant.THRESHOLD://阈值的点击事件  ,无指标不弹出
								for(var i=0; i<scope.btns.length;i++){
									var bIndex = i;
									if(scope.btns[bIndex].name == Constant.LOCATION || scope.btns[bIndex].name == Constant.BANDWIDTH){
										scope.btns[bIndex].isActived = false;
									}
								};
								var activeMapModel = gisMapService.getActivedMapModel();
								if(activeMapModel.icaAreas.length  == 0){
									btn.isActived = false;
									var tipMsg = $translate.instant("i18n.save.storyLine.selectIndicator");
			    					tipWindow.show(true, true, false, tipMsg, null);
									return;
								}
								if(null != activeMapModel.gisMap.thresholdData){
									LeftService.currentColorList = {
											currentRenderToId : activeMapModel.renderToId,
											colorList : angular.copy(activeMapModel.gisMap.thresholdData.colorList)
									};
								}
								break;
							case Constant.DOUBLEWIN:
								gisMapService.mapData.isDoubleScreen = btn.isActived;
								if(!gisMapService.mapData.isDoubleScreen){
									MenubarService.findMenuItem(Constant.SAVE).show = true;
									for(var i=0; i<scope.btns.length;i++){
										var bIndex = i;
										if(scope.btns[bIndex].name == Constant.LOCKSCREEN){
											scope.btns[bIndex].relationShowSwitch = false;
											scope.btns[bIndex].isActived = gisMapService.mapData.isDoubleScreen;
											scope.btns[bIndex].showIconUrl = scope.btns[bIndex].iconUrl;
										}
									};
									gisMapService.mapData.wholeMap.isLock = false;
									gisMapService.mapData.wholeMap.isPolygonLock = false;
								}
								if(gisMapService.mapData.isDoubleScreen){
									MenubarService.findMenuItem(Constant.SAVE).show = false;
									
									if (gisMapService.pologonNeedClear()) {
										for(var i=0; i<scope.btns.length;i++){
											var bIndex = i;
											if(scope.btns[bIndex].name == Constant.LOCKSCREEN){
												scope.btns[bIndex].relationShowSwitch = true;
											}
										};
									};
									$("#gisWholeMapId").css("width", "50%");
								}else{
									$("#gisWholeMapId").css("width", "100%");
								}
								$timeout(function(){
									if(!scope.associated){
										fusiongis.Map.mapAssociate({
											isAssociate: true,
											mapIds: [gisMapService.mapData.wholeMap.renderToId,gisMapService.mapData.rightMap.renderToId]
										});
										scope.associated = !scope.associated;
									}
									fusiongis.Map.refreshMaps([gisMapService.mapData.wholeMap.renderToId]);
									gisMapService.mapData.isMutiScreenRefresh = true;
								},100);
								console.log(LeftService);
								LeftService.resetHomePage(gisMapService.mapData.isDoubleScreen);
								gisMapService.syncLeftAndRightWithMainMap();
								var mapModel = gisMapService.mapData.activedMap;
					            playBackService.setTime(mapModel);
								TabService.updateContentIcaStatus();
								TabService.getCombineIndicators();
								break;
							case Constant.LOCKSCREEN:
								if(gisMapService.mapData.wholeMap.icaAreas.length == 0) {
									btn.isActived = false;
									btn.showIconUrl = btn.iconUrl;
									tipWindow.show(true, true, false, "i18n.save.storyLine.selectIndicator");
									return;
								}
								
								gisMapService.mapData.wholeMap.isLock = btn.isActived;
								gisMapService.mapData.rightMap.gisMap.setModeldata();
								break;		
						}
					}
                };
                
                scope.bandWidthSetUp = function() {
						for(var i=0; i<scope.btns.length;i++){
							var bIndex = i;
							if(scope.btns[bIndex].name == Constant.BANDWIDTH){
								scope.btns[bIndex].isActived = false;
							}
						};
					LeftService.accessModel.accessUIData.frequencyShow = true;
					for(var i=0;i<LeftService.accessModel.modelData.length;i++) {
						LeftService.accessModel.modelData[i].multiSelected = false;
					};
					for(var i=0;i<LeftService.accessModel.modelData.length;i++){
						var showIndex = i;
						if(LeftService.accessModel.modelData[showIndex].checked){
							LeftService.accessModel.modelData[showIndex].multiSelected = true;
							$timeout(function() {
								$(".frequency_models").css("margin-left",LeftService.accessModel.modelData[showIndex].left);
							},200); 
							return;
						}
						//3个制式都没有触发return ，则选中2G
						if(i == LeftService.accessModel.modelData.length) {
							LeftService.accessModel.modelData[0].multiSelected = true;
						}
					}
				};
                
                scope.checkHasCellInfos = function(activeMapModel){
                	for(var i = 0;i<activeMapModel.gisMap.thresholdData.colorList.length;i++){
                		var item = activeMapModel.gisMap.thresholdData.colorList[i];
                		if(!item.minIndicatorVal || !item.maxIndicatorVal){
                			return false;
                		}
                	}
                	return true;
                };
                
                scope.getThresholdTitle = function() {
                	var title = scope.thresholdData.activation;
                	
                	if(Constant.TOTAL_TRAFFIC === title) {
                		return $translate.instant("i18n.label.totalTraffic");
                	}
                	else {
                		return $translate.instant(title);
                	}
                };
                
                scope.getTitleUnit = function (){
                	var mapModel = gisMapService.getActivedMapModel();
					for(var i = 0;i<mapModel.icaAreas.length;i++){
						var item = mapModel.icaAreas[i];
						if(item.active && item.type == LabelType.APP){
							return " (MB)";
						}
					}
					if(scope.thresholdData.unit){
						if(scope.thresholdData.unit == "Mbps" || scope.thresholdData.unit == "Gbps" || scope.thresholdData.unit == "Tbps" ){
							return " (Kbps)";
						}
						return " (" + $translate.instant(scope.thresholdData.unit) + ")";
					}else{
						return "";
					}
				};
				
                scope.thresholdItemChecked = function(index){
                	//改变点击的下标的checked属性的状态
                	if(gisMapService.getActivedMapModel().isLock){
                		return;
                	}
                	scope.thresholdData.colorList[index].checked = !scope.thresholdData.colorList[index].checked;
        			var checkedNull = 0;
        			for(var i = 0; i < scope.thresholdData.colorList.length;i++){
        				if(!checkThresholdDataCombinationTool(i, scope.thresholdData)){
        					checkedNull ++ ;
        				}else{
        					var checkState = scope.thresholdData.colorList[i].checked;
            				if(!checkState){
            					checkedNull ++ ;
            				}
        				}
        				if (checkedNull == scope.thresholdData.colorList.length) {
        					scope.thresholdData.colorList[index].checked = !scope.thresholdData.colorList[index].checked;
        					var tipMsg = $translate.instant("i18n.threshold.uiwarning");
        					tipWindow.show(true, true, false, tipMsg, null);
        					return;
        				}
        			}
        			//阈值点击改变打点数据
        			var mapModel = gisMapService.getActivedMapModel();
					var communityName = mapModel.icaAreas[mapModel.icaAreas.length-1].text;
	 				gisMapService.communityDataShow(communityName,TabService);
                };
                
                scope.reset = function(){
                	var mapModel = gisMapService.getActivedMapModel();
                	mapModel.gisMap.thresholdData = null;
                };
                MenubarService.registerResetFunc(scope);
                
                
                scope.$watch(function() {
                	
                	var btnsIsActive = function(){
                		for(var i=0; i<scope.btns.length;i++){
    						var bIndex = i;
    						if(scope.btns[bIndex].name == Constant.THRESHOLD){
    							return scope.btns[bIndex].isActived;
    						}
    					};
                	} 
            		return {
            			btnsIsActive : btnsIsActive()
            		}; 
            	}, function(newVal, oldVal) {
            		if (!newVal.btnsIsActive) {
            			var activeMapModel = gisMapService.getActivedMapModel();
            			if(activeMapModel.gisMap != null &&activeMapModel.gisMap.thresholdData != null){
            				if(LeftService.currentColorList.currentRenderToId != activeMapModel.renderToId){
            					return;
            				}
            				var colorList = activeMapModel.gisMap.thresholdData.colorList;
            				for(var i =0;i < colorList.length;i++){
                				var item1 = colorList[i];
                				var item2 = LeftService.currentColorList.colorList[i];
                				if(item1.checked != item2.checked){
                					gisMapService.refreshMapData();
                					return;
                				}
                			}
            			}
            		}
            	}, true);
                
                scope.$watch(function() {
                	var btnsIsActive = function(){
                		for(var i=0; i<scope.btns.length;i++){
							var bIndex = i;
							if(scope.btns[bIndex].name == Constant.BANDWIDTH){
								return scope.btns[bIndex].isActived;
							}
						}
					};
            		return {
            			btnsIsActive : btnsIsActive()
            		}; 
            	}, function(newVal, oldVal) {
            		if (!newVal.btnsIsActive) {
            			if(!LeftService.accessModel.accessUIData.frequencyShow){
            				var mapModel = gisMapService.getActivedMapModel();
            				if(null != mapModel.gisMap){
            					mapModel.gisMap.accessData = angular.copy(LeftService.accessModel.modelData);
            				}
            			}
            		}
            	}, true);
                
                scope.$watch(function() {
                	var btnsIsActive = function(){
                		for(var i=0; i<scope.btns.length;i++){
							var bIndex = i;
							if(scope.btns[bIndex].name == Constant.LOCATION){
								return scope.btns[bIndex].isActived;
							}
						}
					}();
            		return {
            			btnsIsActive : btnsIsActive
            		}; 
            	}, function(newVal, oldVal) {
            		if (!newVal.btnsIsActive) {
            			var mapModel = gisMapService.getActivedMapModel();
        				if(null != mapModel.gisMap){
        					var locationSame = checkLocationSame(mapModel.gisMap.locationData, LeftService.locationModel.locationData);
        					if(!locationSame){
        						mapModel.gisMap.locationData = angular.copy(LeftService.locationModel.locationData);
        						gisMapService.addActiveMapLocationMark();
        					}
        				}
            			
            		}
            	}, true);
                
                
                $document[0].onclick = function(event) {
                	if(new Date().getTime() - scope.lastBtnClickTime < 200){
                		return;
                	}
                	var tipModelElem = $(".tipModel");
                	var inTipModelDialog = tipModelElem.length !==0 && isMouseIn(tipModelElem, event);
                	
                	if(inTipModelDialog) {
                		return;
                	}
                	
                	var bandWidthBtn = $(".bar_btn");
                	
                	var locationWindowElem = bandWidthBtn.find(".location_pop");
                	var inLocationBtn = isMouseIn($(bandWidthBtn[0]), event);
                	var inLocationWindow = locationWindowElem.length !==0 && isMouseIn(locationWindowElem, event);
                	if(!inLocationBtn && !inLocationWindow) {
                		scope.$apply(function() {
                			for(var i=0; i<scope.btns.length;i++){
    							var bIndex = i;
    							if(scope.btns[bIndex].name == Constant.LOCATION){
    								scope.btns[bIndex].isActived = false;
    							}
    						}
                		});
                	}
                	
                	var bandWidthWindowElem = bandWidthBtn.find(".bandWidthColor_pop");
                	var inBandWidthBtn = isMouseIn($(bandWidthBtn[1]), event);
                	var inBandWidthWindow = bandWidthWindowElem.length !==0 && isMouseIn(bandWidthWindowElem, event);
                	if(!inBandWidthBtn && !inBandWidthWindow) {
                		scope.$apply(function() {
                			for(var i=0; i<scope.btns.length;i++){
    							var bIndex = i;
    							if(scope.btns[bIndex].name == Constant.BANDWIDTH){
    								scope.btns[bIndex].isActived = false;
    							}
    						}
                		});
                	}
                	
                	//阈值点击事件的处理
                	var  thresholdWindowElem = bandWidthBtn.find("#thresholdColorPopDiv");//找到弹框中的最外层的元素
                	var  inthresholdBtn = isMouseIn($(bandWidthBtn[2]), event);//判断是不是点击的频段check box 这块因为isMouseIn中用的jq中的方法offset所以必须转换成jq查找方法即必须穿jq对象进去
                	var  inthresholdWindow = thresholdWindowElem.length !== 0 && isMouseIn(thresholdWindowElem,event); //根据阈值的元素长度和是不是点击的阈值弹框给定变量的真假
                	//根据上面的是不是点击阈值弹框和阈值的弹框中check box元素的情况判断，如果为真
                	if(!inthresholdWindow && !inthresholdBtn) {
                		//调用$apply将阈值的变化传播出去
                		scope.$apply(function() {
                			for(var i=0; i<scope.btns.length;i++){
    							var bIndex = i;
    							if(scope.btns[bIndex].name == Constant.THRESHOLD){
    								scope.btns[bIndex].isActived = false;
    							}
    						}
                		});
                	}
                };
                
                scope.barBtnShow = function(btn) {
                	if(btn.name === Constant.DOUBLEWIN) {
                		return btn.relationShowSwitch && TabService.isDiyTabActived();
                	}
                	
                	if(btn.name === Constant.LOCKSCREEN) {
                		var map = gisMapService.mapData.wholeMap.gisMap;
                		
                		if (map) {                			
                			var rasterFlag = map.isRenderRSRXByRaster();
                			
                			if (gisMapService.mapData.isDoubleScreen && !rasterFlag) {
                				// 双屏不是栅格制图时，显示锁屏按钮
                				btn.relationShowSwitch = true;
                			}
                		}
                	}
                	
                	return btn.relationShowSwitch;
                };
			};
			

			return {
				restrict : "E",
				replace : true,
				scope : {},
				link : linkFunc,
				template : '<div class="new_leftsidebar" id="leftsidebar_new_leftsidebar">'+
				'<div ng-repeat="btn in btns" btn="btn"'+
				'id="leftsidebar_new_leftsidebar_bar-button">'+
				'<div class="bar_btn" id="leftsidebar_new_barButton" ng-class="{leftSideBar_separate : btn.name == \'Threshold\'}"'+
					'ng-show="barBtnShow(btn)">'+
					'<a><img ondragstart="return false;" ng-src="{{btn.showIconUrl}}"'+
						'id="leftsidebar_new_icon" ng-mousedown="btnClick(btn,0);"'+
						'ng-mouseup="btnClick(btn,1);" ng-mouseleave="btnClick(btn,2);" /></a>'+
					'<div ng-if="btn.isActived && btn.name == \'location\'">'+
						'<div class="new_bandWidthColor_pop windowMd location_pop">'+
							'<location-store></location-store>'+
						'</div>'+
					'</div>'+
					'<div ng-if="btn.isActived && btn.name == \'bandWidth\'">'+
						'<div class="new_bandWidthColor_pop windowMd bandWidthColor_pop">'+
							'<access-type></access-type>'+
						'</div>'+
					'</div>'+
					'<!-- Threshold Module Start -->'+
					'<div ng-if="btn.isActived && btn.name == \'Threshold\'">'+
						'<div class="thresholdColorPop windowMd" id="thresholdColorPopDiv">'+
							'<h4 class="widthColorTxt ThresholdTitleText">'+
								'<span uib-tooltip="{{getThresholdTitle()}}{{getTitleUnit()}}">{{getThresholdTitle()}}{{getTitleUnit()}}</span>'+
								'<span ng-click="ThresholdSetUp();" class="thresholdSetUp">'+
									'<img ng-src="{{ThresholdSettingImage}}">'+ 
								'</span>'+ 
							'</h4>'+
							'<div ng-if="checkShowThreshold()" class="leftSidebarScroll Threshold_leftSidebarScroll" ng-scrollbar>'+
								'<div ng-repeat="item in thresholdData.colorList" ng-show="checkThresholdDataCombination($index);">'+ 
									'<div class="Threshold_row" ng-click="thresholdItemChecked($index, $event)" >'+ 
										'<input type="checkbox" name="chooseWidth" class="chooseWidth" /> '+
										'<span class="inputImg" ng-style = "{backgroundColor:\'{{item.colorVal}}\'}">'+
											'<i ng-show="item.checked" class="fa fa-check"></i>'+
										'</span>'+
										'<span class="checkBoxTxt Threshold_checkBoxTxt" ng-class="{checkBoxTxtNotChecked : !item.checked}"uib-tooltip="{{getThresholdItemShowVal(item,$index);}}">{{getThresholdItemShowVal(item,$index);}}</span>'+
									'</div>'+
								'</div>'+
							'</div>'+
							'<div ng-if="checkThresholdNotConfig()" class="leftSideBar_notConfigThresholdData">'+
								'<span>{{"i18n.null.threshole" | translate }}</span>'+
							'</div>'+
							'<div ng-if="checkShowPercentThresholdNotConfig()" class="leftSideBar_threshodData_nocells">'+
								'<div>{{"i18n.threshold.nodatas" | translate }}</div>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>'
			};
		} ]);