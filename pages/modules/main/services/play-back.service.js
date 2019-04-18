angular.module("main").factory("playBackService", ["$q", "$http", "$interval", "$timeout", "gisMapService", "LeftService",
    "TabService", "MenubarService", "loadingInterceptor", "tipWindow", "storyLineService", "labelService",
    function($q, $http, $interval, $timeout, gisMapService, LeftService, TabService, MenubarService, loadingInterceptor,
    		tipWindow, storyLineService)
{
	var playBackState = {state : true, hour: true};//播放前状态控制（默认显示：true）
	var pauseOrContinue = {state :true};//暂停和继续播放按钮切换控制（默认显示暂停按钮：true）
	var playBackCover = {state : false};//回放遮罩控制
	var hoursData = {hours: [], maxHour: null, minHour: null, selectedHour: null};
	var utcHours = [];
	var maxDayTime = maxDate;
	
		
		var responseData={"data":{"state":"0","errMsg":null,"data":{"minHour":"00:00","hours":[{"utc":1512104400,"hour":"00:00"},{"utc":1512108000,"hour":"01:00"},{"utc":1512111600,"hour":"02:00"},{"utc":1512115200,"hour":"03:00"},{"utc":1512118800,"hour":"04:00"},{"utc":1512122400,"hour":"05:00"},{"utc":1512126000,"hour":"06:00"},{"utc":1512129600,"hour":"07:00"},{"utc":1512133200,"hour":"08:00"},{"utc":1512136800,"hour":"09:00"},{"utc":1512140400,"hour":"10:00"},{"utc":1512144000,"hour":"11:00"},{"utc":1512147600,"hour":"12:00"},{"utc":1512151200,"hour":"13:00"},{"utc":1512154800,"hour":"14:00"},{"utc":1512158400,"hour":"15:00"},{"utc":1512162000,"hour":"16:00"},{"utc":1512165600,"hour":"17:00"},{"utc":1512169200,"hour":"18:00"},{"utc":1512172800,"hour":"19:00"},{"utc":1512176400,"hour":"20:00"},{"utc":1512180000,"hour":"21:00"},{"utc":1512183600,"hour":"22:00"},{"utc":1512187200,"hour":"23:00"}],"maxHour":"00:00","startRefreshTime":3072231,"isHourInterval":true}},"status":200,"config":{"method":"POST","transformRequest":[null],"transformResponse":[null],"jsonpCallbackParam":"callback","url":"/HDI_UI/workbench/queryDayHours.action","data":{"day":"2017-12-01"},"headers":{"Accept":"application/json, text/plain, */*","X-CSRF-TOKEN":"24b0e347-d265-4bb3-86d1-8e40776beb6e","Content-Type":"application/json;charset=utf-8"}},"statusText":"OK"};		
		var resHourData = responseData.data.data;
		utcHours = resHourData.hours;
		
		for(var index in utcHours) {
			hoursData.hours.push(utcHours[index]);
		}
		
		hoursData.maxHour = resHourData.maxHour;
		hoursData.minHour = resHourData.minHour;
		hoursData.selectedHour = hoursData.maxHour;
		playBackState.hour = resHourData.isHourInterval;
		changeQueryTime2();
		TabService.init();
		if(playBackState.hour && hourIntervalAutoRefresh) {
			var startRefreshTime = resHourData.startRefreshTime + 1000; //整点延迟一秒
			$timeout(autoRefreshHourInterval, startRefreshTime);
		}
	
	
	/**
	 * 查询一天有多少个小时
	 */
	function queryHoursInDay(dayStr) {
		if(dayStr === undefined) {
			dayStr = gisMapService.mapData.activedMap.time;
		}
return;
	}
	
	/**
	 * 刷新小时数据,总小时个数,可选最大最小值
	 */
	function refreshHoursData(dayStr) {
		if(dayStr === undefined) {
			dayStr = gisMapService.mapData.activedMap.time;
		}
		var responseData={"data":{"state":"0","errMsg":null,"data":{"minHour":"00:00","hours":[{"utc":1512104400,"hour":"00:00"},{"utc":1512108000,"hour":"01:00"},{"utc":1512111600,"hour":"02:00"},{"utc":1512115200,"hour":"03:00"},{"utc":1512118800,"hour":"04:00"},{"utc":1512122400,"hour":"05:00"},{"utc":1512126000,"hour":"06:00"},{"utc":1512129600,"hour":"07:00"},{"utc":1512133200,"hour":"08:00"},{"utc":1512136800,"hour":"09:00"},{"utc":1512140400,"hour":"10:00"},{"utc":1512144000,"hour":"11:00"},{"utc":1512147600,"hour":"12:00"},{"utc":1512151200,"hour":"13:00"},{"utc":1512154800,"hour":"14:00"},{"utc":1512158400,"hour":"15:00"},{"utc":1512162000,"hour":"16:00"},{"utc":1512165600,"hour":"17:00"},{"utc":1512169200,"hour":"18:00"},{"utc":1512172800,"hour":"19:00"},{"utc":1512176400,"hour":"20:00"},{"utc":1512180000,"hour":"21:00"},{"utc":1512183600,"hour":"22:00"},{"utc":1512187200,"hour":"23:00"}],"maxHour":"00:00","startRefreshTime":3072231,"isHourInterval":true}},"status":200,"config":{"method":"POST","transformRequest":[null],"transformResponse":[null],"jsonpCallbackParam":"callback","url":"/HDI_UI/workbench/queryDayHours.action","data":{"day":"2017-12-01"},"headers":{"Accept":"application/json, text/plain, */*","X-CSRF-TOKEN":"24b0e347-d265-4bb3-86d1-8e40776beb6e","Content-Type":"application/json;charset=utf-8"}},"statusText":"OK"};
		
			var resHourData = responseData.data.data;
			utcHours = resHourData.hours;
			hoursData.hours.splice(0, hoursData.hours.length);
			
			for(var index in utcHours) {
				hoursData.hours.push(utcHours[index]);
			}
			
			hoursData.maxHour = resHourData.maxHour;
			hoursData.minHour = resHourData.minHour;
			playBackState.hour = resHourData.isHourInterval;
			
			setSelectedHourText(hoursData.selectedHour);
			var selItem = getHourItem(hoursData.selectedHour);
			var maxItem = getHourItem(hoursData.maxHour);
			
			if(selItem.utc > maxItem.utc) {
				hoursData.selectedHour = hoursData.maxHour;
			}
		
	}
	
	function getHoursData() {
		return hoursData;
	}
	
	function setSelectedHourText(selHourText) {
		if(selHourText == null || !playBackState.hour) {
			return;
		}
		
		var hourText = selHourText;
		var selItem = getHourItem(selHourText);
		
		if(selItem == null) {
			//入夏令时和出夏令时天和其他天切换时选中的小时item需要做处理
			if(selHourText.indexOf("DST") != -1) {
				hourText = selHourText.substring(0, 5);
			}
			else {
				hourText = selHourText + "(DST)";
			}
		}
		
		hoursData.selectedHour = hourText;
	}
	
	/**
	 * 设置时间控件时间
	 */
	function setTime(mapModel) {
		var hour = mapModel.queryTime ? mapModel.queryTime.hour : null;
		var dayStr = mapModel.time;
		var hourTime = null;
		
		if(dayStr.indexOf("#") != -1){
			hourTime = dayStr.split("#")[1];
			dayStr = dayStr.split("#")[0];
		}
		
		$("#playBack_dateInput").datepicker("setDate", dayStr);
        $("#playBack_dateTimeInput").datepicker("setDate", dayStr);
		
        var hourText = null;
        
        if(hourTime){
        	hourText = hourTime;
		}
        else if(hour) {
			hourText = hour;
		}
        
        setSelectedHourText(hourText);
	}
	
	/**
	 * 改变小时时间，同时更新到map上
	 */
	function changeQueryTime() {
		var mapModel = gisMapService.getActivedMapModel();
		var timePos = hoursData.selectedHour;
		mapModel.queryTime = {
			interval: 3600, // 设置小时粒度查询
			startTime: utcHours[timePos].utc, // 设置起始时间
			endTime: utcHours[timePos].utc + 3600, // 设置结束时间
			hour: hoursData.selectedHour
		};
		
		if(!playBackState.hour) {
			delete mapModel.queryTime;
		}
	}
	
	/**
	 * 改变小时时间，同时更新到map上
	 */
	function changeQueryTime2() {
		var mapModel = gisMapService.getActivedMapModel();
		var hourText = null;
		if(mapModel.time.indexOf("#") == -1){
			hourText = hoursData.selectedHour;
		}
		else{
			hourText = mapModel.time.split("#")[1];
		}
		
		var hourItem = getHourItem(hourText);
		mapModel.queryTime = {
			interval: 3600, // 设置小时粒度查询
			startTime: hourItem.utc, // 设置起始时间
			endTime: hourItem.utc + 3600, // 设置结束时间
			hour: hourText
		};
		
		if(!playBackState.hour) {
			delete mapModel.queryTime;
		}
	}
	
	function getHourItem(hourText) {
		for(var index in utcHours) {
			if(utcHours[index].hour === hourText) {
				return utcHours[index];
			}
		}
	}
	
	/**
	 * 时间改变时刷新数据
	 */
	function refreshData(newVal, oldVal) {
		var dayChanged = false;
		if(dayChanged) {
			var newDay = newVal.time.split("#")[0];
			
			refreshHoursData(newDay).then(function() {
				changeQueryTime2();
				refreshTabData();
			});
		}
		else {
			changeQueryTime2();
			refreshTabData();
		}
	}
	
	/**
	 * 刷新tab数据
	 */
	function refreshTabData() {
		TabService.loadData(function() {
			TabService.updateContentIcaStatus();
			TabService.getCombineIndicators();
			var mapModel = gisMapService.getActivedMapModel();
			var thresholdData = mapModel.gisMap.thresholdData;
			var copyThresholdModel = {
				thresholdDataCopy : angular.copy(mapModel.gisMap.thresholdDataCopy),
				isPreViewState : angular.copy(mapModel.gisMap.isPreViewState)
			};
			gisMapService.refreshMapData(TabService.getActiveTab());
			mapModel.gisMap.thresholdDataCopy = copyThresholdModel.thresholdDataCopy;
			mapModel.gisMap.isPreViewState = copyThresholdModel.isPreViewState;
		});
	}
	
	/**
	 * 获取日期控件可选择的最大天时间和最小天时间
	 */
	function refreshDayTime() {
		var deferred = $q.defer();
		
		$http.post("workbench/refreshDayTime.action").then(function(response) {
			var maxDateStr = response.data.data.maxDate;
			var minDateStr = response.data.data.minDate;
			maxDayTime = maxDateStr;
			
			deferred.resolve(maxDateStr, minDateStr);
		});
		
		return deferred.promise;
	}
	
	/**
	 * 自动刷新小时粒度
	 */
	function autoRefreshHourInterval() {
		refreshHourInterval();
		
		$interval(function() {
			refreshHourInterval();
		}, 3600 * 1000);
	}
	
	function refreshHourInterval() {
		if(canAutoRefresh()) {
			refreshDayTime().then(function(maxDateStr, minDateStr) {
				$('#playBack_dateTimeInput').datepicker('option', 'maxDate', maxDateStr); 
				$('#playBack_dateTimeInput').datepicker('option', 'minDate', minDateStr); 
				$("#playBack_dateTimeInput").datepicker("setDate", maxDateStr);
				
				return refreshHoursData(maxDateStr);
			}).then(function() {
				hoursData.selectedHour = hoursData.maxHour;
				gisMapService.mapData.activedMap.time = $("#playBack_dateTimeInput").val() + "#"+ hoursData.selectedHour;
			});
		}
	}
	
	/**
	 * 是否能够自动刷新
	 */
	function canAutoRefresh() {
		//只有小时粒度才能自动刷新
		if(!playBackState.hour) {
			console.debug("[auto refresh disable]: time interval is not hour.");
			return false;
		}
		
		//页面正在loading不自动刷新
		if(loadingInterceptor.isLoading()) {
			console.debug("[auto refresh disable]: page is loading.");
			return false;
		}
		
		//时间控件选择时间弹窗
		if($("#ui-datepicker-div").css("display") === "block") {
			console.debug("[auto refresh disable]: play back window is pop.");
			return false;
		}
		
		//当前选择的时间不是时间控件最大时间,跳过刷新
		if(!isMaxTimeSelected()) {
			console.debug("[auto refresh disable]: selected time is not the max canselect in playback.");
			return false;
		}
		
		//双屏
		if(gisMapService.mapData.isDoubleScreen) {
			console.debug("[auto refresh disable]: double map screen now.");
			return false;
		}
		
		//位置标识
		if(LeftService.findBtn(Constant.LOCATION).isActived) {
			console.debug("[auto refresh disable]: mark window is pop.");
			return false;
		}
		
		//频段
		if(LeftService.findBtn(Constant.BANDWIDTH).isActived) {
			console.debug("[auto refresh disable]: bandWidth window is pop.");
			return false;
		}
		
		//阈值弹窗
		if(LeftService.findBtn(Constant.THRESHOLD).isActived) {
			console.debug("[auto refresh disable]: threshold window is pop.");
			return false;
		}
		
		//阈值弹窗配置界面
		if(LeftService.thresholdDataCopy.showDialog) {
			console.debug("[auto refresh disable]: threshold edit window is visiable.");
			return false;
		}
		
		//DIY setting
		if(MenubarService.findMenuItem(Constant.SAVE).isActive) {
			console.debug("[auto refresh disable]: diy setting window is visiable.");
			return false;
		}
		
		//故事线保存、更新弹窗
		if(MenubarService.saveImg.isActive) {
			console.debug("[auto refresh disable]: storyline save/update window is visiable.");
			return false;
		}
		
		//故事线open列表
		if(MenubarService.openImg.isActive) {
			console.debug("[auto refresh disable]: storyline open/list window is visiable.");
			return false;
		}
		
		//故事线公告栏弹窗
		if(storyLineService.getScenarioData().showflag) {
			console.debug("[auto refresh disable]: storyline scenario window is visiable.");
			return false;
		}
		
		//提示信息弹窗
		if(tipWindow.getTipWindow().show) {
			console.debug("[auto refresh disable]: tip window is visiable.");
			return false;
		}
		
		//地图上有小区弹窗或者多边形弹窗不自动刷新
		if(fusiongis && fusiongis.Popup.getPopups().length !== 0) {
			console.debug("[auto refresh disable]: map cell/polygon popWindow is visiable.");
			return false;
		}
		
		return true;
	}
	
	function isMaxTimeSelected() {
		var time = $("#playBack_dateTimeInput").val() + "#"+ hoursData.selectedHour;
		var maxTime = maxDayTime + "#"+ hoursData.maxHour;
		
		return time === maxTime;
	}

	return {
		playBackCover :playBackCover,
		playBackState : playBackState,
		pauseOrContinue : pauseOrContinue,
		queryHoursInDay: queryHoursInDay,
		getHoursData: getHoursData,
		refreshHoursData: refreshHoursData,
		refreshData: refreshData,
		setTime: setTime
		
	};
}]);
