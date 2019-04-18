angular.module("workbench").factory("TabService", ["$http", "$filter", "$timeout", "RightSidebarService", "gisMapService", "LeftService", "labelI18nService", "indicatorQueryService",
	function($http, $filter, $timeout, RightSidebarService, gisMapService, LeftService, labelI18nService, indicatorQueryService) {
		var tabData = {
			tabs: [],
			workBenchVisiable: true
		};
		var showWorking = 'Working'; //工作日与非工作日
		var showDaytime = 'day'; //白天黑夜
		var communityData = [];
		var	arrShowCommunity = []; //先点击工作台传给右侧上方搜索数据
		var communityLabelData=[];//保存没有点击标签前的筛选数据
		var communityScreenId=[];//存储点选后的id
		var lastActivedTabText = I18N_KEY.DIY; //最后一次激活的tab的text,默认DIY激活
		var diyBackData = {};
		var initWorkbenchData = [];
		var oldThresholdData = [];
		/**
		 * 初始化
		 */
		function init() {
			//初始化数据
			$.workbenchData.setData();
			CommunityDataFun();
			getThresholdData();
			var i = setInterval(function() { //为保证数据加载完成启动定时器
				if($.workbenchData.userType.arr[0]) {
					clearInterval(i);
					getWorkbenchUserData();
					loadData(function() {
						updateRightSidebarData(getActiveTab());
					});
				}
			}, 200);
		}

		/**
		 * 初始化获取tab页签数据
		 */
		function loadData(callback) {

			$timeout(function() {
				var dayStr = gisMapService.mapData.activedMap.time;
				var accessData = gisMapService.getActiveMapAccessData();
				if(null != gisMapService.mapData.activedMap.gisMap) {
					dayStr = "2017-11-17";
				}
				tabData.tabs = initWorkbenchData;
				localeLabelItem(tabData.tabs);
				recoveryActivedTab();
				if(callback) {
					callback();
				}
			});

		}
		  	
		function getWorkbenchUserData() {
			var itemsArray = ["DIY"];
			var item = {
				"text": itemsArray[0],
				"active": false,
				"order": 0
			};
			var totalData = {};
			totalData.item = item;
			totalData.content = $.workbenchData.userType.data.shows;
			if(initWorkbenchData.length == 1) {
				initWorkbenchData[0] = totalData;
			} else {
				initWorkbenchData.push(totalData);
			}
		}

		function localeLabelItem(tabs) {
			for(var i in tabs) {
				var tab = tabs[i];
				var allIcas = getAllIcas(tab);
				labelI18nService.localeLabelItems(allIcas);
			}
		}

		/**
		 * 恢复DIY控制台保存的标签选中状态和选中标签中的激活状态
		 */
		function recoveryDiyLabelStatus() {
			if(!diyBackData.icaAreas) {
				return;
			}

			var tab = getDiyTab();
			var allIcas = getAllIcas(tab);

			for(var i in allIcas) {
				var ica = getLabelInArray(diyBackData.icaAreas, allIcas[i]);

				if(ica) {
					allIcas[i].inRightSidebar = true;
					allIcas[i].active = ica.active;
				} else {
					allIcas[i].inRightSidebar = false;
				}
			}
		}

		/**
		 * 获取标签数组中该标签
		 * @param labelArray 标签数组
		 * @param label 标签 
		 */
		function getLabelInArray(labelArray, label) {
			for(var index in labelArray) {
				if(label.text === labelArray[index].text) {
					return labelArray[index];
				}
			}

			return null;
		}
		/**
		 * 恢复DIY保存的VVIP, 频段, 阈值
		 */
		function recoveryDiyData() {
			if(diyBackData.vvipDataModel) {
				gisMapService.mapData.activedMap.vvipDataModel = diyBackData.vvipDataModel;
			}

			if(diyBackData.accessData) {
				gisMapService.mapData.activedMap.gisMap.accessData = angular.copy(diyBackData.accessData);
				LeftService.setAccessData(gisMapService.mapData.activedMap);
			}

			gisMapService.mapData.activedMap.gisMap.isPreViewState = angular.copy(diyBackData.isPreViewState);
			gisMapService.mapData.activedMap.gisMap.thresholdDataCopy = angular.copy(diyBackData.thresholdCopy);
			//给左侧栏设置阈值
			gisMapService.setActiveMapThresholdDatas(diyBackData.threshold, getDiyTab(), true);
			//恢复DIV中的多边形
			gisMapService.mapData.activedMap.gisMap.setPolygonData(diyBackData.polygonData);
			//mark
			gisMapService.mapData.activedMap.gisMap.locationData = angular.copy(diyBackData.locationData);
		}

		/**
		 * 激活上一次用户激活的tab
		 */
		function recoveryActivedTab() {
			if(!lastActivedTabText) {
				return;
			}

			for(var index = 0; index < tabData.tabs.length; index++) {
				if(isEqualIgnoreCase(lastActivedTabText, tabData.tabs[index].item.text)) {
					tabData.tabs[index].item.active = true;
					return;
				}
			}

			//lastActivedTabText有值, 但是控制台上显示的没有此故事线, 有两种情况1.该故事线在open列表中被隐藏, 2.该故事线被删除
			//如果lastActivedTabText中的值在控制台上没有,需要默认激活DIY
			recoveryDiyLabelStatus();
			activeTab(0);
			recoveryDiyData();
		}

		/**
		 * 更据标签名字过滤标签
		 */
		function filterByName(icaName) {
			var icas = getAllIcasInActivedTab();

			for(var i in icas) {
				if(icaName === icas[i].label) {
					return icas[i];
				}
			}
		}

		/**
		 * 刷新控制台数据，同时更新右侧栏数据, setting中删除标签,修改标签图片,标签状态从选中变成不选中需要调用此方法
		 */
		function refreshData(noRefreshThreshold) {
			loadData(function() {
				RightSidebarService.refreshData(gisMapService.mapData.wholeMap, filterByName);
				if(gisMapService.mapData.isDoubleScreen) {
					RightSidebarService.refreshData(gisMapService.mapData.rightMap, filterByName);
				}
				getCombineIndicators();
				if(gisMapService.mapData.isDoubleScreen) {
					if(noRefreshThreshold && noRefreshThreshold == "noRefreshThreshold") {
						gisMapService.mapData.wholeMap.gisMap.refreshCell();
						gisMapService.mapData.rightMap.gisMap.refreshCell();
						gisMapService.mapData.wholeMap.gisMap.setModeldata(undefined, gisMapService.mapData.rightMap);
					} else {
						gisMapService.mapData.wholeMap.gisMap.getThresholdData(function() {
							gisMapService.mapData.rightMap.gisMap.getThresholdData(function() {
								gisMapService.mapData.wholeMap.gisMap.refreshCell();
								gisMapService.mapData.rightMap.gisMap.refreshCell();
								gisMapService.mapData.wholeMap.gisMap.setModeldata(undefined, gisMapService.mapData.rightMap);
							},getThresholdData);
						},getThresholdData);
					}
				} else {
					if(getActiveTab().item.text == "DIY") {
						if(noRefreshThreshold && noRefreshThreshold == "noRefreshThreshold") {
							gisMapService.mapData.wholeMap.gisMap.refreshCell();
							gisMapService.mapData.wholeMap.gisMap.setModeldata();
						} else {
							gisMapService.mapData.wholeMap.gisMap.getThresholdData(function() {
								gisMapService.mapData.wholeMap.gisMap.refreshCell();
								gisMapService.mapData.wholeMap.gisMap.setModeldata();
							},getThresholdData);
						}
					} else {
						gisMapService.mapData.wholeMap.gisMap.refreshCell();
						gisMapService.mapData.wholeMap.gisMap.setModeldata();
					}
				}
			});
		}

		/**
		 * 获取控制台显示的tab数组
		 */
		function getTabs() {
			return tabData.tabs;
		}

		/**
		 * 获取当前激活的页签
		 */
		function getActiveTab() {
			var tabs = tabData.tabs;
			for(var i = 0; i < tabs.length; i++) {
				if(tabs[i].item.active === true) {
					return tabs[i];
				}
			}
			var diy = getDiyTab();

			if(diy) {
				diy.item.active = true;
				return diy;
			}
		}

		/**
		 * 获取DIY页签
		 */
		function getDiyTab() {
			return $filter("filter")(tabData.tabs, {
				item: {
					text: I18N_KEY.DIY
				}
			})[0];
		}

		/**
		 * 判断当前是否DIY页签为激活状态
		 */
		function isDiyTabActived() {
			return getActiveTab() === getDiyTab();
		}

		/**
		 * 交换控制台上两tab页签的顺序
		 * @param index 放入的tab页签的index
		 * @param targetIndex 拖动的页签的index
		 */
		function swapTab(index, targetIndex) {
			if(index === targetIndex) {
				return;
			}

			var tab = tabData.tabs[index];
			tabData.tabs[index] = tabData.tabs[targetIndex];
			tabData.tabs[targetIndex] = tab;

			$http.post("storyLine/swapStoryLine.action", {
				tabname1: tabData.tabs[index].item.text,
				tabname2: tabData.tabs[targetIndex].item.text
			}).then(function(data) {
			});
		}

		/**
		 * 激活控制台上某一个tab页签
		 * @param tabIndex 将要激活的tab页签的index
		 */
		function activeTab(tabIndex) {
			var tabs = tabData.tabs;

			for(var i = 0; i < tabs.length; i++) {
				if(i === tabIndex) {
					tabs[i].item.active = true;
					lastActivedTabText = tabs[i].item.text;
					gisMapService.setActivedTabText(lastActivedTabText);
					updateRightSidebarData(tabs[i]);
				} else {
					tabs[i].item.active = false;
				}
			}
			updateContentIcaStatus();
			getCombineIndicators();
		}

		/**
		 * 从DIY切换到其他故事线前，备份DIY数据
		 */
		function copyDiyData() {
			if(isEqualIgnoreCase(lastActivedTabText, I18N_KEY.DIY)) { //从DIY切换到故事线
				var mapModel = gisMapService.getActivedMapModel();
				diyBackData.icaAreas = angular.copy(RightSidebarService.getIcaAreas());
				diyBackData.vvipDataModel = angular.copy(mapModel.vvipDataModel);
				// 获取阈值信息
				diyBackData.threshold = angular.copy(mapModel.gisMap.thresholdData);
				diyBackData.thresholdCopy = angular.copy(mapModel.gisMap.thresholdDataCopy);
				diyBackData.isPreViewState = angular.copy(mapModel.gisMap.isPreViewState);
				diyBackData.accessData = angular.copy(mapModel.gisMap.accessData);
				//备份DIV中的多边形
				diyBackData.polygonData = angular.copy(mapModel.gisMap.polygonData);
				diyBackData.locationData = angular.copy(mapModel.gisMap.locationData);
			}
		}

		/**
		 * 过滤出当前tab页签的选中的标签显示在右侧栏中
		 * @param tab tab页签
		 */
		function updateRightSidebarData(tab) {

			var activeIcas = null;
			for(var i in tab.content) {
				activeIcas = $filter("filter")(tab.content[i].data, {
					inRightSidebar: true
				});
			}
			for(var i = 1; i < $.workbenchData.userType.arr.length; i++) {
				if(tab.content[$.workbenchData.userType.arr[i]]) {
					var data = tab.content[$.workbenchData.userType.arr[i]].data;
					data = $filter("filter")(data, {
						inRightSidebar: true
					})
					activeIcas = activeIcas.concat(data);
				}
			}
			RightSidebarService.clearAllIcaAreas();
			var activedIca = null;

			for(var i = 0; i < activeIcas.length; i++) {
				RightSidebarService.pushIca(activeIcas[i]);

				if(activeIcas[i].active) {
					activedIca = activeIcas[i];
				}
				//设置vvip单用户
				if(activeIcas[i].vvipSingleUser && activeIcas[i].msisdn) {

					gisMapService.mapData.activedMap.vvipDataModel.allVvipDatas[activeIcas[i].msisdn] = activeIcas[i].vvipSingleUser;
					gisMapService.mapData.activedMap.vvipDataModel.data = activeIcas[i].msisdn;
				}
			}

			if(activedIca) {
				RightSidebarService.setActivedIcaArea(activedIca);
			}
		}

		/**
		 * 获取激活tab上的某类型的标签
		 */
		function getIcasInActivedTabByType(type) {
			var allIcas = getAllIcasInActivedTab();
			return $filter("filter")(allIcas, {
				type: type
			});
		}

		/**
		 * 获取当前激活页签中所有的标签，返回标签数组
		 */
		function getAllIcasInActivedTab() {
			var tab = getActiveTab();

			return getAllIcas(tab);
		}

		/**
		 * 获取tab页签中所有的标签，返回标签数组
		 */
		function getAllIcas(tab) {
			var allIcas = null;
			for(var i in tab.content) {
				allIcas = tab.content[i].data;
				break;
			}
			for(var i = 1; i < $.workbenchData.userType.arr.length; i++) {
				if(tab.content[$.workbenchData.userType.arr[i]]) {
					var data = tab.content[$.workbenchData.userType.arr[i]].data;
					allIcas = allIcas.concat(data);
				}
			}
			return allIcas;
		}

		/**
		 * 更新激活tab页签中标签的选中状态,应该在右侧栏标签发生添加，删除和替换时调用
		 */
		function updateContentIcaStatus() {
			var allIcas = getAllIcasInActivedTab();

			for(var i in allIcas) {
				allIcas[i].inRightSidebar = RightSidebarService.contains(allIcas[i]);
			}
		}

		/**
		 * 更具标签名称获取当前激活tab中的标签
		 */
		function getIcaByName(icaName) {
			var allIcas = getAllIcasInActivedTab();

			for(var i in allIcas) {
				if(allIcas[i].text === icaName) {
					return allIcas[i];
				}
			}
		}

		/**
		 * 在当前激活的tab页签中，交换两标签的顺序
		 * @param ica 拖动的标签
		 * @param targetIca 放入的标签
		 */
		function swapIca(ica, targetIca) {
			if(ica.type !== targetIca.type) {
				return;
			}

			var type = ica.type;
			var tab = getActiveTab();
			for(var i in tab.content) {
				if(tab.content[i].data[0].type == targetIca.type) {
					swapIca0(ica, targetIca, tab.content[i].data);
				}
			}

			//交换数组中两元素的顺序
			function swapIca0(ica1, ica2, targetIcas) {
				var i = null;
				var j = null;
				for(var k = 0; k < targetIcas.length; k++) {
					if(targetIcas[k].text == ica1.text) {
						i = k;
					}
					if(targetIcas[k].text == ica2.text) {
						j = k;
					}
				}
				targetIcas[i] = ica2;
				targetIcas[j] = ica1;
			}
		}
		/**
		 * 标签组的位置更换
		 * @param {Object} dragModel 拖动的标签
		 * @param {Object} that 放入的标签 qzq
		 */
		function swapIcas(dragModel, that) {
			if(!dragModel.name) return;
			var tab = getActiveTab();
			var index = null;
			for(var i = 0; i < tabData.tabs.length; i++) {
				if(tab.item.text == tabData.tabs[i].item.text) {
					index = i;
				}
			}
			var i = $.workbenchData.userType.arr.indexOf(dragModel.name);
			var j = $.workbenchData.userType.arr.indexOf(that.itms.name);
			/**替换名字**/
			var nameA = $.workbenchData.userType.name[i];
			var nameB = $.workbenchData.userType.name[j];
			$.workbenchData.userType.name[i] = nameB;
			$.workbenchData.userType.name[j] = nameA;
			/**替换图片**/
			var imgA = $.workbenchData.userType.conerImg[i];
			var imgB = $.workbenchData.userType.conerImg[j];
			$.workbenchData.userType.conerImg[i] = imgB;
			$.workbenchData.userType.conerImg[j] = imgA;
			/**替换是否显示,真对setting之后的值**/
			var imgA = $.workbenchData.userType.ifShow[i];
			var imgB = $.workbenchData.userType.ifShow[j];
			$.workbenchData.userType.ifShow[i] = imgB;
			$.workbenchData.userType.ifShow[j] = imgA;
			/**替换数据**/
			var dataA = tabData.tabs[index].content[dragModel.name];
			var dataB = tabData.tabs[index].content[that.itms.name];
			tabData.tabs[index].content[dragModel.name] = dataB;
			tabData.tabs[index].content[that.itms.name] = dataA;

		}

		function vvipExpandData(icaName, callback) {
			$http({
				method: 'POST',
				url: 'workbench/getVvipNames.action',
				data: {
					vvipGroupName: icaName
				}
			}).then(function(responseData) {
				callback(responseData.data.data);
			});
		}

		/**
		 * 获取选中的标签
		 */
		function getCombineIndicators() {
			var url = "data/CFG_INDICATOR_CATEGORY.csv";
			var url1 = "data/CFG_LABEL_STATUS.csv";
			var cfg_data = [];
			var cfg_status = [];
			Papa.parse(url, {
				download: true,
				complete: function(results) {
					cfg_data = results.data;
					Papa.parse(url1, {
						download: true,
						complete: function(results) {
							cfg_status = results.data;

							//未选中时为空值
							var userIca = "";
							var appIca = "";
							var qualityIca = "";
							var app = "";
							var user = "";
							var quality = "";
							var icaAreas = RightSidebarService.getIcaAreas();

							var allIcas = getAllIcasInActivedTab();
							var selectedIndicators = [];
							if(icaAreas.length == 0) {
								for(var i in allIcas) {
									allIcas[i].unable = false;
								}
								return;
							}
							for(var index in icaAreas) {
								if(icaAreas[index].type === LabelType.USER) {
									userIca = icaAreas[index];
									user = userIca.indicator;
								} else if(icaAreas[index].type === LabelType.APP) {
									appIca = icaAreas[index];
									app = appIca.indicator;
								} else {
									qualityIca = icaAreas[index];
									quality = qualityIca.indicator;
								}
							}

							var selectAbleIndicators = [];
							var selectUnableIndicators = [];

							selectedIndicators.push(user == "" ? null : user);
							selectedIndicators.push(app == "" ? null : app);
							selectedIndicators.push(quality == "" ? null : quality);
							var combineIndicators = "";
							if(user == "" && app == "" && quality != "") {
								combineIndicators = quality;
							} else if(user != "" && app == "" && quality == "") {
								combineIndicators = user;
							} else if(user == "" && app != "" && quality == "") {
								combineIndicators = app;
							} else if(user == "" && app != "" && quality != "") {
								//选中app标签和质量标签
								combineIndicators = app + "_" + quality;
							} else if(user != "" && app == "" && quality != "") {
								//选中用户标签和质量标签
								combineIndicators = user + "_" + quality;
							} else if(user != "" && app != "" && quality == "") {
								//选中用户标签和app标签
								combineIndicators = user + "_" + app;
							} else if(user == "" && app != "" && quality == "") {
								//选中用户标签，app标签和质量标签，可以替换同类标签
								combineIndicators = user + "_" + app + "_" + quality;
							}
							var selected = selectedIndicators;
							for(var k = 2; k < cfg_data.length; k++) {
								if(cfg_data[k][1] && combineIndicators.indexOf(cfg_data[k][1]) >= 0) {
									combineIndicators = combineIndicators.replace(cfg_data[k][1], cfg_data[k][0]);
								}
							}
							var selecteAble = []; //可选的标签
							var selecteUnable = []; //灰化的标签
							for(var i = 2; i < cfg_status.length; i++) {
								if(combineIndicators == cfg_status[i][0]) {
									if(cfg_status[i][2] == "1") {
										for(var j = 2; j < cfg_data.length; j++) {
											if(cfg_status[i][1] == cfg_data[j][0]) {
												selecteAble.push(cfg_data[j][1]);
											}
										}
									} else if(cfg_status[i][2] == "0") {
										for(var j = 2; j < cfg_data.length; j++) {
											if(cfg_status[i][1] == cfg_data[j][0]) {
												selecteUnable.push(cfg_data[j][1]);
											}
										}
									}
								}
							}
							for(var m in allIcas) {
								for(var n in selecteAble) {
									if(selecteAble[n] === allIcas[m].indicator) {
										allIcas[m].unable = false;
									}
								}
								for(var j in selected) {
									if(selected[j] === allIcas[m].indicator) {
										allIcas[m].unable = false;
									}
								}
								for(var k in selecteUnable) {
									if(selecteUnable[k] === allIcas[m].indicator) {
										allIcas[m].unable = true;
									}
								}
							}
						}
					});
				}
			});
		}
		/**
		 *@name getThresholdData 获取阈值数据
		 */
		function getThresholdData() {
			Papa.parse('data/cfg_kqi_threshold.csv', {
				download: true,
				complete: function(results) {
					thresholdDataCallBack(results);
				}
			});
		}
		/**
		 * @name 处理阈值数据并保存到oldThresholdData中
		 * @param {Object} results
		 */
		function thresholdDataCallBack(results) {
			var data = results.data;
			for(var i = 1; i < data.length; i++) {
				if(data[i][0]) {
					var arr = [];
					for(var j = 1;j<data[i].length;j+=2){
						data[i][j] = data[i][j].replace(/[\[\]()]/g,"");
						var arr1 = data[i][j].split(",");
						arr.unshift({
							"minVal":arr1[0],
							"maxVal":arr1[1],
							"colorVal":data[i][j+1],
							"minIndicatorVal":arr1[0],
							"maxIndicatorVal":arr1[1]
						});
					}
					oldThresholdData.push({
						"activation":data[i][0],
						"colorList":arr
					})
				}
			}
		}
		/**
		 * @name 获取当前选中的标签的阈值
		 * @param {Object} name 当前点击目标页签的名字（或者id之类的唯一标识）
		 */
		function getThreshold(name){
			for(var k=0; k<oldThresholdData.length; k++){
				if(oldThresholdData[k].activation == name){
					var thresholdDataNum = oldThresholdData[k];
					return thresholdDataNum;
				}
			}
		}
		/**
		 * @name setThreshold 改变读取的原值
		 * @param {Object} name 当前点击目标页签的名字（或者id之类的唯一标识）
		 * @param {Object} data 新值
		 */
		function setThreshold(name,data){
			for(var k=0; k<oldThresholdData.length; k++){
				if(oldThresholdData[k].activation == name){
					oldThresholdData[k].colorList = data;
				}
			}
		}
		function setLastActivedTabText(activeTabText) {
			lastActivedTabText = activeTabText;
		}

		function existStory(storyName) {
			for(var index in tabData.tabs) {
				var tab = tabData.tabs[index];

				if(tab.item.text === storyName) {
					return true;
				}
			}

			return false;
		}
		/**
		 * @name CommunityDataFun 获取社区打点数据
		 */
		function CommunityDataFun(){
			Papa.parse('data/communityUser.csv',{
				download: true,
				complete: function (results) {
					CommunityDataCallback(results.data);
					communityLabelDataCallBack(results.data);
				}
			});
		}
		function CommunityDataCallback(results){
			for (var i = 0;i<results.length;i++) {
				if(results[i][0]){
					communityData.push(results[i]);
				}
			}
		}
		/*没有点击标签前的数据筛选
		 * @results 读取csv后的数据	
		 * */
	
		function communityLabelDataCallBack(results){
			var temp = [],tempData=[]; 
			//去重
		    for(var i = 1; i < results.length-1; i++){
		        if(temp.indexOf(results[i][0]) == -1){
		            temp.push(results[i][0]);
		            tempData.push(results[i]);
		        }
		    }
   			for(var a=0; a<tempData.length; a++){
   				var corrdPoint = [];
   				for(s=0;s<tempData[a].length;s++){
   					if((s>=2 &&s<12) && tempData[a][s] !=""){
   						corrdPoint.push([tempData[a][s].split(",")[0]*1,tempData[a][s].split(",")[1]*1]);
   					}
   				}
   				var leg={
							"CommunityCenter":tempData[a][1],
							"corrdPoint":corrdPoint,
							"communityColor":"rgba(255,255,255,0.3)",
							"name":tempData[a][14],
							"CommunityID":tempData[a][0],
							"checked":true,
							"popIsShow":false
						}
   				communityLabelData.push(leg);
			}
		}
		return {
			init: init,
			tabData: tabData,
			loadData: loadData,
			refreshData: refreshData,
			getTabs: getTabs,
			getActiveTab: getActiveTab,
			getDiyTab: getDiyTab,
			isDiyTabActived: isDiyTabActived,
			swapTab: swapTab,
			activeTab: activeTab,
			copyDiyData: copyDiyData,
			recoveryDiyLabelStatus: recoveryDiyLabelStatus,
			recoveryDiyData: recoveryDiyData,
			updateContentIcaStatus: updateContentIcaStatus,
			getIcaByName: getIcaByName,
			swapIca: swapIca,
			swapIcas: swapIcas,
			getAllIcasInActivedTab: getAllIcasInActivedTab,
			getCombineIndicators: getCombineIndicators,
			vvipExpandData: vvipExpandData,
			filterByName: filterByName,
			getIcasInActivedTabByType: getIcasInActivedTabByType,
			setLastActivedTabText: setLastActivedTabText,
			existStory: existStory,
			mapWorkBeachRefreshFlag: null,
			getWorkbenchUserData: getWorkbenchUserData,
			updateRightSidebarData:updateRightSidebarData,
			showWorking: showWorking,
			showDaytime: showDaytime,
			communityData: communityData,
			communityLabelData:communityLabelData,
			communityScreenId:communityScreenId,
			oldThresholdData:oldThresholdData,
			arrShowCommunity:arrShowCommunity,
			getThreshold:getThreshold,
			setThreshold:setThreshold
		};
	}
]);