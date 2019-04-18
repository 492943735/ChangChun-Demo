var settingApp = angular.module("setting", []);

settingApp.factory("SettingService", ["$http", "$filter", "TabService", "labelI18nService",
function($http, $filter, TabService, labelI18nService) {
	var visibility = false;
	var tempSaveOrUpdate = "save";
	var userLables = [];
	var appLabels = [];
	var qualityLabels = [];
	var expandGroup = null; //当前展开的标签组
	var sceneData = {diy: []};
	var imgDialog = {
		addFlag: true,
		showImgBox: false,
		imgList: [],
		modelId : "",
		oldLabelName: "",
		label: null
	};
	var changedImg = {
		index : 0,
		type : "user",
		hander : "",
		isUploadFile : false,
		imgUrl : ""
	};
	var oldRequestParams = null;
	
	/**
	 * 初始化数据
	 */
	function loadData() {
		getLabels(function(labels) {
			userLables = getIcas(labels, LabelType.USER);
			appLabels = getIcas(labels, LabelType.APP);
			qualityLabels = getIcas(labels, LabelType.KQI);
			sceneData.diy.splice(0, sceneData.diy.length);
			
			var userGroup = {labels: userLables, show: false, title: "i18n.setting.group.user", type: LabelType.USER};
			var appGroup = {labels: appLabels, show: false, title: "i18n.setting.group.app", type: LabelType.APP};
			var kqiGroup = {labels: qualityLabels, show: false, title: "i18n.setting.group.kqi", type: LabelType.KQI};
			sceneData.diy.push(userGroup);
			sceneData.diy.push(appGroup);
			sceneData.diy.push(kqiGroup);
			setActivedLabelGroup(sceneData.diy[0]);
			//备份原来标签的选中状态
			oldRequestParams = getRequestParams();
		});
	}
	
	/**
	 * 增加、修改、删除时
	 * 刷新setting标签数据
	 */
	function refreshData() {
		var labelsCopy = angular.copy(userLables.concat(appLabels).concat(qualityLabels));
		getLabels(function(labels) {
			userLables = getIcas(labels, LabelType.USER);
			appLabels = getIcas(labels, LabelType.APP);
			qualityLabels = getIcas(labels, LabelType.KQI);
			sceneData.diy.splice(0, sceneData.diy.length);
			
			var userGroup = {labels: userLables, show: false, canDelete: false, title: "i18n.setting.group.user", type: LabelType.USER};
			var appGroup = {labels: appLabels, show: false, canDelete: false, title: "i18n.setting.group.app", type: LabelType.APP};
			var kqiGroup = {labels: qualityLabels, show: false, canDelete: false, title: "i18n.setting.group.kqi", type: LabelType.KQI};
			sceneData.diy.push(userGroup);
			sceneData.diy.push(appGroup);
			sceneData.diy.push(kqiGroup);
			
			//设置当前展开的标签组
			for(var i in sceneData.diy) {
				if(sceneData.diy[i].title === expandGroup.title) {
					sceneData.diy[i].canDelete = expandGroup.canDelete;
					setActivedLabelGroup(sceneData.diy[i]);
				}
			}
			//增加、修改、删除标签刷新时，要保持以前的选中状态不变
			for(var index in labels) {
				var label = labels[index];
				var copyLabel = getCopyLbaelById(labelsCopy, label.text);
				
				if(copyLabel) {
					label.selected = copyLabel.selected;
				}
			}
			
			//备份原来标签的选中状态
			oldRequestParams = getRequestParams();
		});
	}
	
	function getLabels(callback) {
		$http.post("diy/selectDiyModelList.action").then(function(data) {
			var resData = data.data;
			if(resData.state == "0") { 
				labelI18nService.localeLabelItems(resData.data);
				callback(resData.data);
			}
		});
	}
	
	function getCopyLbaelById(labelsCopy, labelId) {
		for(var index in labelsCopy) {
			var label = labelsCopy[index];
			
			if(label.text === labelId) {
				return label;
			}
		}
	}
	
	function getIcas(icas, type) {
		var newicas = [];
		
		for (var i = 0; i < icas.length; i++) {
			if (type === icas[i].type) {
				newicas.push(icas[i]);
			}
		}
		
		return newicas;
	}
	
	/**
	 * 更新指标的状态，包括选中的和未选中的(当DIY场景设置保存时)
	 */
	function updataDiySelectedIca() {
		var requestParams = getRequestParams();
		
		if(angular.equals(requestParams, oldRequestParams)) {
			return true;
		}
		
		$http.post("diy/updataDiySelectedIcas.action",requestParams).then(function(data) {
			TabService.refreshData();
		});
		return true;
	}
	
	function getRequestParams() {
		var requestParams = {
			selectedStr : "",	
			unselectedStr : ""
		};
		
		contactIdStr(requestParams, userLables);
		contactIdStr(requestParams, appLabels);
		contactIdStr(requestParams, qualityLabels);
		
		return requestParams;
	}
	
	function contactIdStr(requestParams,group){
		for (var i = 0;i<group.length;i++){
			var item = group[i];
			if (item.selected){
				requestParams.selectedStr += item.text+","; 
			}else{
				requestParams.unselectedStr += item.text+","; 
			}
		}
	}
	
	/**
	 * 设置展开的标签组
	 */
	function setActivedLabelGroup(labelGroup) {
		expandGroup = labelGroup;
		expandGroup.show = true;
	}
	
	function getAppLabels() {
		return appLabels;
	}
	
	return {
		diySceneGroups: sceneData.diy,
		updataDiySelectedIca: updataDiySelectedIca,
		visibility: visibility,
	    tempSaveOrUpdate: tempSaveOrUpdate,
		imgDialog : imgDialog,
		changedImg : changedImg,
		refreshData: refreshData,
		loadData: loadData,
		setActivedLabelGroup : setActivedLabelGroup,
		getAppLabels: getAppLabels
	};
}]);
