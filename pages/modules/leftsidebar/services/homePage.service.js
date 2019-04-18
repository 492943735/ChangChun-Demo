angular.module("sidebar.left").factory("homePageService", ["$http", "$filter", "RightSidebarService", "gisMapService", "storyLineService", "TabService","CommonPath",
    function($http, $filter, RightSidebarService, gisMapService,storyLineService,TabService,CommonPath)
{
	
	//top页面切换diy页签中的标签
	function setTopDataOfDIY(labelId) {		
		var params = {
			story : "DIY",
			labels : [labelId]
		};
		params = JSON.stringify(params);
		commonTopSwitchTabs(params);
	}

	function switchStory(item,index){
		if(item.active) {
			return;
		}
		
		if(isEqualIgnoreCase(item.text, I18N_KEY.DIY)) { //故事线 -> DIY
			TabService.recoveryDiyLabelStatus();
			TabService.activeTab(index);
			TabService.recoveryDiyData();
		}
		else {// DIY -> 故事线， 故事线 -> 故事线
			// 2. DIY切换到 故事线前备份DIY数据
			TabService.copyDiyData();
			// 3. 激活当前故事线
			TabService.activeTab(index);
			// 4. 重置VVIP数据为初始值
			gisMapService.mapData.activedMap.vvipDataModel.data = "";
			// 5. 设置左侧栏频段和阈值为故事线的
			storyLineService.initEditData(function(){
				
			}, true);
			// 6. 弹出公告栏弹窗
			storyLineService.loadScenarioData();
		}
	}
	//top 页面中切换故事线
	function setTopDataOfStory(storyTabName) {
		$("#top_iframe").css("display", "none");
		var tabs = TabService.tabData.tabs;
		
		for(var index = 0; index < tabs.length; index++) {
			if(isEqualIgnoreCase(storyTabName, tabs[index].item.text)) {
				switchStory(tabs[index].item, index);
				break;
			}
		}
	}
	
	function switchKQINameToID(labelName) {
	  for (var name in Constant.KQI_NAME_TO_ID){
	      if(name === labelName){
	    	  return Constant.KQI_NAME_TO_ID[name];
	      }
	  }
	  return labelName;
	}
	
	function commonTopSwitchTabs(tabsAndStory){
		var params = JSON.parse(tabsAndStory);
		$("#top_iframe").css("display", "none");
		if(params){
			var story = params.story;
			var labels  = params.labels;
			setTopDataOfStory(story);			
			if(labels){
				labels.forEach(function(labelId,index){
					var id = switchKQINameToID(labelId);
					var ica = TabService.getIcaByName(id);
					if(ica) {
						RightSidebarService.pushIca(ica);
						TabService.getCombineIndicators();
						TabService.updateContentIcaStatus();
				 		gisMapService.getActivedMapModel().gisMap.getThresholdData(function(){
							gisMapService.refreshMapData(TabService.getActiveTab());
						},TabService.getThreshold);
					}
				});
			}
		}
	}
	
	return {
		setTopDataOfDIY: setTopDataOfDIY,
		setTopDataOfStory: setTopDataOfStory,
		commonTopSwitchTabs: commonTopSwitchTabs
	};
}]);