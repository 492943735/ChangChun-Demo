angular.module("main").directive("playback",["$compile",
		"$interval", "CommonPath", "$timeout", "gisMapService", "TabService", "playBackService", "RightSidebarService",
		function($compile, $interval, CommonPath, $timeout,gisMapService, TabService, playBackService, RightSidebarService) {
		function linkFunc(scope, elem, attr) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.IMAGES = IMAGES;
		scope.playback_visible = false;
		scope.playBackState = playBackService.playBackState;//播放前状态控制（默认显示：true）
		scope.pauseOrContinue = playBackService.pauseOrContinue;//暂停和继续播放按钮切换控制（默认显示暂停按钮：true）
		scope.hoursData = playBackService.getHoursData();
		scope.timeListShow = false;
		
		/**
		 * 改变时间展示模板的呈现值
		 */
		scope.getTimeTxt = function() {
			var queryTime = gisMapService.getActivedMapModel().queryTime;
			var timeData = {text: "00:00", dst: ""};
			
			if(queryTime) {
				var hourText = queryTime.hour;
				timeData.text = hourText.substring(0, 5);
				
				if(hourText.length > 5) {
					timeData.dst = hourText.substring(5, hourText.length);
				}
			}
			return timeData;
		};
		scope.playBackVisible = function() {
			scope.playback_visible = !scope.playback_visible;
		};
		
		//播放按钮是否显示控制方法
		scope.isShowPlayBackBtn = function() {
			if(gisMapService.mapData.isDoubleScreen) {
				return false;
			}
			
			var icas = RightSidebarService.getIcaAreas();
			
			return (icas.length != 0 && surpportPlayBack == 'true');
		}
		
		var lastSelectDay = "";
		
		//时间控件初始化方法
		function datePickerFun(controll) {
			controll.datepicker({
				dateFormat: "yy-mm-dd",
				maxDate: maxDate.replaceAll('\/','-'),
				minDate: minDate.replaceAll('\/','-'),
				defaultDate: maxDate.replaceAll('\/','-'),
				onSelect: function(date) {
					if (scope.playBackState.hour) {
						scope.timeListShow = false;
						if(lastSelectDay != date) {
							lastSelectDay = date;
							var dayStr = $("#playBack_dateTimeInput").val();
							playBackService.refreshHoursData(dayStr);
						}
						return;
					}
					
					if (!gisMapService.mapData.activedMap.isLock) {
						scope.$apply(function() {
							gisMapService.mapData.activedMap.time = date;
						});
					} else {
						$timeout(function() {
							controll.datepicker("setDate", gisMapService.mapData.activedMap.time);
						});
					}
				},
				beforeShow: function(inputElem, inst) {//给inst对象中创建一个回调函数
					if (!scope.playBackState.hour) {
						return;
					}
					
					//显示时间控件之前,获取当前可选的小时
					playBackService.refreshHoursData(gisMapService.mapData.activedMap.time);
					
					if(!inst.myGenerateHtml) {
						inst.myGenerateHtml = myGenerateHtml;
					}
					
					adjustTimePickerPosition();
				},
				onClose: function() {
					if (scope.playBackState.hour) {
						lastSelectDay = "";
						scope.timeListShow = false;
						playBackService.setTime(gisMapService.mapData.activedMap);
					}
					$("#playBack_dateTimeInput").trigger("blur");
				}
			});
			
			$timeout(function() {
				controll.datepicker("setDate", maxDate);
				scope.showTime = controll.val();
			}, 500);
		}
		
		/**
		 * 调整时间选择器的位置
		 */
		function adjustTimePickerPosition() {
			var interval = setInterval(function(){
				$("#ui-datepicker-div").css("visibility","hidden");
				if($(".timeBody").length > 0 ) {
					var body = $("body");
					var dateBody = $("#ui-datepicker-div");
					var dateBodyTop = dateBody.offset().top;
					var bodyHeight = body.outerHeight();
					var dateBodyHeight = dateBody.outerHeight();
					var playBackTop = $(".new_playback_trend").offset().top;
					var offsetHeight = playBackTop - dateBodyTop;
					
					if(offsetHeight > 0) {
						dateBody.css("top",playBackTop - dateBodyHeight);
					};
					
					if(dateBodyTop > (bodyHeight - dateBodyHeight)) {
						dateBody.css("top",playBackTop - dateBodyHeight);
					}
					dateBody.css("visibility","visible");
					clearInterval(interval);
				}
			},2);
			interval; 
		}
		
		//回调函数添加timepicker的dom
		function myGenerateHtml() {
			if (!scope.playBackState.hour) {
				return;
			}
			
			$timeout(function() {
				if($("#ui-datepicker-div").find(".timeBody").length < 1) {
					var html = "<time-picker time-list-show='timeListShow' on-sure='sureCallback(selHour)' hours='hoursData.hours' " +
						"max='hoursData.maxHour' min='hoursData.minHour' used-hour='hoursData.selectedHour'></time-picker>";
					var newDom = $compile(html)(scope);
					$("#ui-datepicker-div").append(newDom);
				}
			}, 10);
		};
		
		/**
		 * Timepicker OK button click call back function.
		 */
		scope.sureCallback = function(selHour) {
			if (!gisMapService.mapData.activedMap.isLock) {
				scope.hoursData.selectedHour = selHour;
				gisMapService.mapData.activedMap.time = $("#playBack_dateTimeInput").val() + "#"+ selHour;
			}
			
			$("#playBack_dateTimeInput").datepicker("hide");
		};
		
		//初始化时间控件：
		datePickerFun($("#playBack_dateInput"));//datepicker
		datePickerFun($("#playBack_dateTimeInput"));//datetimepicker

		scope.getDate = function(param) {
			var controll = $("#playBack_dateInput");
			
			if(scope.playBackState.hour) {
				controll = $("#playBack_dateTimeInput");
				var day = new Date(controll.datepicker("getDate").getTime());
				day.setDate(day.getDate() + param);
				return day;
			}
			else {
				var day = new Date(controll.datepicker("getDate").getTime());
				day.setDate(day.getDate() + param);
				return day;
			}
		};

		/**
		 * 前一天
		 */
		scope.beforDate = function() {
			if (!gisMapService.mapData.activedMap.isLock) {
				var controll = $("#playBack_dateInput");
				
				if (scope.playBackState.hour) {
					controll = $("#playBack_dateTimeInput");
					controll.datepicker("setDate", scope.getDate(-1));
					gisMapService.mapData.activedMap.time = controll.val();
				}
				else {
					controll.datepicker("setDate", scope.getDate(-1));
					gisMapService.mapData.activedMap.time = controll.val();
				}
			}

		};

		/**
		 * 后一天
		 */
		scope.nextDate = function() {
			if (!gisMapService.mapData.activedMap.isLock) {
				var controll = $("#playBack_dateInput");
				
				if(scope.playBackState.hour) {
					controll = $("#playBack_dateTimeInput");
					controll.datepicker("setDate", scope.getDate(1));
					gisMapService.mapData.activedMap.time = controll.val();
				}
				else
				{
					controll.datepicker("setDate", scope.getDate(1));
					gisMapService.mapData.activedMap.time = controll.val();
				}
			}
		};

		// 回放功能全局变量定义
		var timePos = 0;//回放进度游标
		var width = 0;//进度条长度
		var responseMonitor = {}; //请求响应状态检视器函数控制。
		var timeOutDetecting = {}; //超时检测检测器函数控制。
		var result = null;//当前选择日期的小时信息

		/**
		 * 开始回放按钮点击动作
		 */
		scope.startPlayBack = function() {
			//屏蔽loading状态
			Constant.playBackRuning = true;
			//将停止状态置为false。
			gisMapService.mapData.activedMap.gisMap.playBackStopState = false;
			//将暂停状态置为false。
			gisMapService.mapData.activedMap.gisMap.playBackPauseState = false;
			//请求当天包含的小时数
			var responseData={"data":{"state":"0","errMsg":null,"data":{"minHour":"00:00","hours":[{"utc":1512104400,"hour":"00:00"},{"utc":1512108000,"hour":"01:00"},{"utc":1512111600,"hour":"02:00"},{"utc":1512115200,"hour":"03:00"},{"utc":1512118800,"hour":"04:00"},{"utc":1512122400,"hour":"05:00"},{"utc":1512126000,"hour":"06:00"},{"utc":1512129600,"hour":"07:00"},{"utc":1512133200,"hour":"08:00"},{"utc":1512136800,"hour":"09:00"},{"utc":1512140400,"hour":"10:00"},{"utc":1512144000,"hour":"11:00"},{"utc":1512147600,"hour":"12:00"},{"utc":1512151200,"hour":"13:00"},{"utc":1512154800,"hour":"14:00"},{"utc":1512158400,"hour":"15:00"},{"utc":1512162000,"hour":"16:00"},{"utc":1512165600,"hour":"17:00"},{"utc":1512169200,"hour":"18:00"},{"utc":1512172800,"hour":"19:00"},{"utc":1512176400,"hour":"20:00"},{"utc":1512180000,"hour":"21:00"},{"utc":1512183600,"hour":"22:00"},{"utc":1512187200,"hour":"23:00"}],"maxHour":"00:00","startRefreshTime":3072231,"isHourInterval":true}},"status":200,"config":{"method":"POST","transformRequest":[null],"transformResponse":[null],"jsonpCallbackParam":"callback","url":"/HDI_UI/workbench/queryDayHours.action","data":{"day":"2017-12-01"},"headers":{"Accept":"application/json, text/plain, */*","X-CSRF-TOKEN":"24b0e347-d265-4bb3-86d1-8e40776beb6e","Content-Type":"application/json;charset=utf-8"}},"statusText":"OK"}
				var paramHoursInDay = responseData.data;
				//获取当前日期的小时信息并初始化进度条和小时数组下标
				timePos = 0;
				width = 0;
				result = paramHoursInDay.data.hours;
				$(".play_back_readOnly .date").text(gisMapService.mapData.activedMap.time);
				//切换日期框为回放框并重置Dom控制条件。
				scope.playBackState.state = false;
				scope.pauseOrContinue.state = true;
				//增加遮罩
				playBackService.playBackCover.state = true;
				//清除弹窗和图层信息，并新建空白图层
				gisMapService.mapData.activedMap.gisMap.clearPlayBackLayer();
				//插入RSRX栅格回放分支
				if(isRSRXIca()){
					startRSRX();
					return;
				}
				
				//将响应状态置为未响应
				gisMapService.mapData.activedMap.gisMap.playBackReponseState = false;
				//1.开启请求响应监视器
				playBackResponseMonitor();
				//请求回放数据渲染地图
				refreshPlayBack();		
		};

		/**
		 * 暂停按钮点击动作
		 */
		scope.pausePlayBack = function() {
			if(isRSRXIca()){
				pauseRSRX();
				return;
			}
			//更改暂停状态位为true，通知地图，标志已暂停。
			gisMapService.mapData.activedMap.gisMap.playBackPauseState = true;
			//此时回放已经暂停，不需要监视响应。将响应监控关闭掉。
			clearInterval(responseMonitor);
			//切换暂停按钮为继续播放按钮
			scope.pauseOrContinue.state = false;
		};

		/**
		 * 继续播放按钮点击动作
		 */
		scope.continuePlayBack = function() {
			if(isRSRXIca()){
				continueRSRX();
				return;
			}
			//切换继续播放按钮为暂停按钮
			scope.pauseOrContinue.state = true;
			//刷新暂停状态为未暂停状态。
			gisMapService.mapData.activedMap.gisMap.playBackPauseState = false;
			//重新启动响应监视器
			gisMapService.mapData.activedMap.gisMap.playBackReponseState = false;
			playBackResponseMonitor();
			//下发请求
			refreshPlayBack();
		};
		/**
		 * 停止按钮点击动作
		 */
		scope.stopPlayBack = function(){
			if(isRSRXIca()){
				stopRSRX();
				return;
			}
			//将停止状态置为true。
			gisMapService.mapData.activedMap.gisMap.playBackStopState = true;
			//将loading状态重置
			Constant.playBackRuning = false;
			//将回放控件内时间显示框，进度条还原为初始状态
			$(".time").text('00:00');
			$(".play_back_readOnly .running_line .running_line_base")
			.css("width", 0);
			//清空所有回放信息
			timePos = 0;
			width = 0;
			result = null;
			gisMapService.mapData.activedMap.gisMap.currentRequestDataTime = null;
			gisMapService.mapData.activedMap.gisMap.playBackReponseState = false;
			gisMapService.mapData.activedMap.gisMap.playBackPauseState = false;
			
			//结束响应监视器和超时检测
			clearInterval(responseMonitor);
			clearTimeout(timeOutDetecting);
			
			//清空小区图层
			gisMapService.mapData.activedMap.gisMap.refreshCell();
			
			//切换回放组件为日期选择组件
			scope.playBackState.state = true;
			scope.pauseOrContinue.state = true;
			
			//将遮罩取消掉
			playBackService.playBackCover.state = false;
			
			//重新请求一次天粒度信息
			gisMapService.refreshMapData(TabService.getActiveTab());
		};
		
		/**
		 *@Title 回放主控制器
		 *@Important！ 判断当前播放的时间下标是否越界，如果越界，则说明播放已经完毕，此时结束回放，清空地图图层，并返回初始状态。
		 *@Important！ 每次发送请求前都要判断下是否为暂停状态，如果为暂停状态，则不再发送请求。
		 *@Description 1.开启请求响应监视器
		 *@Description 2.为GIS设置当前查询时间
		 *@Description 3.开启超时检测
		 *@Description 4.下发请求
		 */
		function refreshPlayBack() {
			//一、判断是否为停止状态，如果是停止状态则直接退出
			if(gisMapService.mapData.activedMap.gisMap.playBackStopState){
				return;
			}
			//二、判断是否为暂停状态，如果为暂停状态则直接退出
			if(gisMapService.mapData.activedMap.gisMap.playBackPauseState){
				return;
			}
			//三、判断当前播放的时间下标是否越界,越界说明已播放完毕，此时还原为初始状态，调用停止方法。
			if(timePos >= result.length){
				scope.stopPlayBack();
				return;
			}
			
			//四、以上条件均得到满足时说明可以回放，此时开始执行回放动作。
			//2.为GIS设置当前查询时间
			gisMapService.mapData.activedMap.gisMap.currentRequestDataTime = result[timePos].utc;
			//3.开启超时检测
			playBackTimeOutDetecting(result[timePos].utc);
			//4.下发请求
			var queryTime = {
					interval : 3600, // 设置小时粒度查询
					startTime : result[timePos].utc, // 设置起始时间
					endTime : result[timePos].utc + 3600 // 设置结束时间
			}
			gisMapService.mapData.activedMap.gisMap.drawCellByBackendEx(queryTime);
		}
		
		/**
		 *@Title 请求响应监视器
		 *@Description 开启回放请求响应监视器
		 */	
		function playBackResponseMonitor(){
			//获取通用配置中的等待时长，如果没配置或者为空，则使用默认等待时长
			var waitTime = 3000;
			if (playBackWaitTime){
				waitTime = parseInt(playBackWaitTime);
			}
			
			responseMonitor = setInterval(function(){
				//响应状态为true，标志请求已响应，1.结束监控 2.结束超时检测 3.刷新DOM中小时数及进度条 4.下发下一次请求。
				if (!gisMapService.mapData.activedMap.gisMap.playBackReponseState){
					return;
				}
				
				//跳出监控
				//clearInterval(responseMonitor);
				//将响应状态置为未响应
				gisMapService.mapData.activedMap.gisMap.playBackReponseState =false;
				
				//跳出超时检测
				clearTimeout(timeOutDetecting);
				
				//如果不是暂停状态则刷新DOM中的时间及进度条。
				if(!gisMapService.mapData.activedMap.gisMap.playBackPauseState){
					width += 90 / (result.length);
					$(".play_back_readOnly .running_line .running_line_base")
						.css("width", width + "%");
					$(".time").text(result[timePos].hour);
				}
				
				//否则则说明是暂停状态下的响应，此时该响应并没有给用户呈现，将时间下标-1，使得继续播放时该时间点的数据能够继续被请求
				else{
					subPlayBackTime();
					return;
				}
				
				//等待【等待时长】时间后，判断用户是否点击了暂停：1.如果点击了暂停，则不再发送下一次请求。2.如果没有暂停，则下发下一次请求。
				setTimeout(function(){
					//如果是暂停或者是停止状态，则直接退出，否则开始下一次请求
					if (gisMapService.mapData.activedMap.gisMap.playBackPauseState || gisMapService.mapData.activedMap.gisMap.playBackStopState) {
						return;
					} else {
						addPlayBackTime();
						refreshPlayBack();
					}
				}, waitTime);
				return;
			},500)
		}
		/**
		 *@Title 回放增加播放进度下标
		 */	
		function addPlayBackTime() {
			timePos++;
		}
		
		/**
		 *@Title 回放减少回放进度下标
		 */	
		function subPlayBackTime() {
			timePos--;
		}
		
		/**
		 *@Title 回放超时检测
		 *@Description 开启回放超时检测
		 */	
		function playBackTimeOutDetecting(startTimeOfRequest){
			//获取通用配置中的超时时长，如果没配置或者为空，则使用默认超时时长
			var OverTime = 10000;
			if (playBackOverTime){
				OverTime = parseInt(playBackOverTime);
			}
			//等待超时时长时间后：1.首先检测当前状态是否是暂停状态，如果是暂停状态则直接退出；
			//2.如果不是暂停状态则检测传入时间与当前GIS_MAP中的时间是否相等，如果相等，则说明超时了，此时：1.更改进度条长度但不显示在DOM中 2.启动下一次请求。
			timeOutDetecting = setTimeout(function(){
				if(gisMapService.mapData.activedMap.gisMap.playBackPauseState){
					clearInterval(responseMonitor);
					return;
				}
				 if(startTimeOfRequest == gisMapService.mapData.activedMap.gisMap.currentRequestDataTime){
					 clearInterval(responseMonitor);
					 width += 90 / (result.length);
					 gisMapService.mapData.activedMap.gisMap.playBackReponseState = false;
					 playBackResponseMonitor();
					 addPlayBackTime();
					 refreshPlayBack();
				 }
			}, OverTime);
		}
		
		/**
		 * 添加时间变更监听事件
		 */
		
		scope.$watch(function() {
			var mapModel = gisMapService.mapData.activedMap;
			var accessType = "";
			try{
				for(var i =0;i<mapModel.gisMap.accessData.length;i++){
					var accessItem = mapModel.gisMap.accessData[i];
					if(accessItem.checked){
						accessType = accessItem.accessVal;
					}
				}
			}catch(e){
				
			}
			
			return {
				time: mapModel.time,
				accessType : accessType
			};
		},
		function(newVal, oldVal) {
			if(TabService.mapWorkBeachRefreshFlag == "fromStoryLine"){
				TabService.mapWorkBeachRefreshFlag = null;
				return;
			}
			if(angular.equals(newVal, oldVal)) {
				return;
			}
			if(new Date().getTime() - pageStartTime.getTime() < 5000){
				return;
			}
			playBackService.refreshData(newVal, oldVal);
		}, true);
		
		
		var playRSRXInterval = [];
		/**
		 *@Title 判断当前选择是否为RSRX指标且开关打开
		 */	
		function isRSRXIca(){
			var icas = RightSidebarService.getIcaAreas();
			
			for(var i = 0; i< icas.length ; i++){
				if(icas[i].active){
					if((Constant.LABEL_RSRP === icas[i].text || Constant.LABEL_RSRQ === icas[i].text) 
							&& renderDiscoveryIndicatorByCell !== 'true'){
						return true;
					}
				}
			}
			return false;
		}
		
		/**
		 *@Title 开始回放RSRX栅格
		 */	
		function startRSRX(){
			var RSRXInterval = 10000;
			if (PBackRSRXInterval){
				RSRXInterval = parseInt(PBackRSRXInterval);
			}
			
			playRSRXInterval = setInterval(function(){
				if (gisMapService.mapData.activedMap.gisMap.playBackPauseState) {
					clearInterval(playRSRXInterval);
					return;
				}else if (timePos >= result.length){
					clearInterval(playRSRXInterval);
					//将loading状态重置
					Constant.playBackRuning = false;
					//将回放控件内时间显示框，进度条还原为初始状态
					$(".time").text('00:00');
					$(".play_back_readOnly .running_line .running_line_base")
					.css("width", 0);
					//清空所有回放信息
					timePos = 0;
					width = 0;
					result = null;
					//清空小区图层
					gisMapService.mapData.activedMap.gisMap.refreshCell();
					
					//切换回放组件为日期选择组件
					scope.$apply(function(){
						scope.playBackState.state = true;
						scope.pauseOrContinue.state = true;
					});
					
					//将遮罩取消掉
					playBackService.playBackCover.state = false;
					
					//重新请求一次天粒度信息
					gisMapService.refreshMapData(TabService.getActiveTab());
					return;
				}

				width += 90 / (result.length);
				$(".play_back_readOnly .running_line .running_line_base")
					.css("width", width + "%");
				$(".time").text(result[timePos].hour);

				var queryTime = {
						interval : 3600, // 设置小时粒度查询
						startTime : result[timePos].utc, // 设置起始时间
						endTime : result[timePos].utc + 3600 // 设置结束时间
				}
				gisMapService.mapData.activedMap.gisMap.drawCellByBackendEx(queryTime);
				timePos++;
			}, RSRXInterval);
		}
		
		
		/**
		 *@Title 暂停回放RSRX栅格
		 */
		function pauseRSRX(){
			//更改暂停状态位为true，通知地图，标志已暂停。
			gisMapService.mapData.activedMap.gisMap.playBackPauseState = true;
			//终止请求
			clearInterval(playRSRXInterval);
			//切换暂停按钮为继续播放按钮
				scope.pauseOrContinue.state = false;
		}
		
		/**
		 *@Title 继续回放RSRX栅格
		 */
		function continueRSRX(){
			//切换继续播放按钮为暂停按钮
				scope.pauseOrContinue.state = true;
			//刷新暂停状态为未暂停状态。
			gisMapService.mapData.activedMap.gisMap.playBackPauseState = false;
			//重新开始发起请求
			startRSRX();
		}
		
		/**
		 *@Title 停止回放RSRX栅格
		 */
		function stopRSRX(){
			//将loading状态重置
			Constant.playBackRuning = false;
			//将回放控件内时间显示框，进度条还原为初始状态
			$(".time").text('00:00');
			$(".play_back_readOnly .running_line .running_line_base")
			.css("width", 0);
			//清空所有回放信息
			timePos = 0;
			width = 0;
			result = null;
			//清空小区图层
			gisMapService.mapData.activedMap.gisMap.refreshCell();
			
			//切换回放组件为日期选择组件
				scope.playBackState.state = true;
				scope.pauseOrContinue.state = true;
			//将遮罩取消掉
			playBackService.playBackCover.state = false;
			
			//重新请求一次天粒度信息
			gisMapService.refreshMapData(TabService.getActiveTab());
		}
	}

	return {
		restrict : "E",
		replace : true,
		scope : {

		},
		link : linkFunc,
		template :'<div class="page playBackRoot">'+ 
		'<div class="page new_playback" id="main_new_playback" ng-class="{new_playback_show:playback_visible,new_playback_hide:!playback_visible}">'+
		'<img class="img" ng-src="{{imgBasePath + IMAGES.workBench_timeBg}}"  id="main_new_playback_img">'+
		'<div class="new_playback_trend" id="line_day" ng-hide="isPlay">'+
			'<div class = "beforPlayBack" id="main_new_playback_time" ng-show="playBackState.state && !playBackState.hour">'+
				'<div class="date_select" ng-class="{date_select_with_button: isShowPlayBackBtn()}">'+
					'<span class="new_time_before timeBlock" ng-click="beforDate();" id="main_new_playback_timeBlock">'+
				    	'<img ng-src="{{imgBasePath + IMAGES.workBench_timeBefore}}" class="timeBlock_img" id="time-before_img">'+
					'</span>'+
					'<input id="playBack_dateInput" type="text" class="new_line_day_input timeBlock" readonly="readonly"/> '+
					'<span class="new_time_next timeBlock" ng-click="nextDate();" id="main_new_playback_nextDate">'+
				    	'<img ng-src="{{imgBasePath + IMAGES.workBench_timeNext}}" class="timeBlock_img" id="time-next_img">'+
					'</span>'+
				'</div>'+
				'<div class="play_back_button" ng-show="isShowPlayBackBtn()">'+
					'<span class="play_back_start timeBlock" ng-click="startPlayBack()" id="main_new_playback_start">'+
				    	'<img ng-src="{{imgBasePath + IMAGES.workBench_playBack_start}}" class="operate_img" id="playBack-start_img">'+
					'</span>'+
				'</div>'+
			'</div>'+
			'<div class="play_back_runing" ng-show="!playBackState.state && !playBackState.hour">'+
				'<div class="play_back_readOnly">'+
				'<div class="date"></div>'+
				'<div class="time">00:00</div>'+	
				'<div class="running_line">'+	
				'<hr class = running_line_base>'+	 
				'<hr class = running_line_render>'+		
				'</div>'+		
				'</div>'+	
				'<div class="play_back_pause timeBlock" ng-click="pausePlayBack()" id="main_new_play_back_pause" ng-show="pauseOrContinue.state">'+
			    ' <img ng-src="{{imgBasePath + IMAGES.workBench_playBack_pause}}" class="operate_img" id="playBack-pause_img">'+
				'</div>'+
				 '<div class="play_back_continue timeBlock" ng-click="continuePlayBack()" id="main_new_play_back_continue" ng-show="!pauseOrContinue.state">'+  
				'<img ng-src="{{imgBasePath + IMAGES.workBench_playBack_start}}" class="operate_img" id="playBack-start_img">'+
				'</div>'+
					
				'<div class="play_back_stop timeBlock" ng-click="stopPlayBack()" id="main_new_play_back_stop">'+
				'<img ng-src="{{imgBasePath + IMAGES.workBench_playBack_stop}}" class="operate_img" id="playBack-stop_img">'+
				'</div>'+
			'</div>'+	
				
			'<div class = "beforPlayBack"  ng-show="playBackState.hour">'+
			'<div class="dateTime_select">'+
			'<span class="new_time_before timeBlock" ng-click="beforDate();" id="main_new_playback_timeBlock">'+	
			'<img ng-src="{{imgBasePath + IMAGES.workBench_timeBefore}}" class="timeBlock_img" id="time-before_img">'+		
				'</span> '+    	
			'<input id="playBack_dateTimeInput" type="text" class="new_line_day_input timeBlock" readonly="readonly"'+		
			'ng-click="dateTime()" />'+		
			'<span class="new_time_next timeBlock" ng-click="nextDate();" id="main_new_playback_nextDate">'+		 
			'<img ng-src="{{imgBasePath + IMAGES.workBench_timeNext}}" class="timeBlock_img" id="time-next_img">'+		
				'</span>'+    	
				'</div>'+	
			'<div class="play_back_button dateTimeTxt" ng-show="playBackState.hour">'+	
				'<span class="dateTimeShow timeBlock" id="timePickerUi">'+
				'<span style="position: relative;">{{getTimeTxt().text}}'+	
	             '<span style="font-size: 1rem;position: absolute;bottom: -1rem;left: 0;width: 100%;line-height: normal;">'+       
				'{{getTimeTxt().dst}}'+			
					'</span>'+			
					'</span>'+		
					'</span>'+	
	                '</div>'+
				
	                '</div>'+
	          '</div>'+
	      '</div>'+
	'<div class="playbackVisible" ng-click="playBackVisible();" id="playbackVisible"> '+                                                                    
			'<a><img class="playbackVisible_img" id="btn_stop"'+
			'ng-src="{{playback_visible ? imgBasePath + IMAGES.workBench_timeHideBar : imgBasePath + IMAGES.workBench_timeShowBar}}" ></a>'+
	'</div>'+
'</div>'
	};
} ]);