var mainApp = angular.module("main");
mainApp.directive("settingHtml", ["CommonPath", "$http", "$timeout", "settingService", "MenubarService","TabService", function(CommonPath, $http, $timeout, settingService, MenubarService,TabService) {
	var linkFunc = function(scope, elem, attr) {
		scope.settingDatas = settingService.settingDatas;
		scope.newUser = false; //新建用户组弹框的状态位
		scope.newQuota = false; //新建用户标签的弹框的状态位
		scope.quotaList = null;
		scope.groupList = null;
		scope.$watch(function() {
			return {
				settingShow: scope.settingDatas.showImgBox,
				data: scope.settingDatas.data
			};
		}, function(newVal, oldVal) {
			if(newVal == oldVal) {
				return;
			}
		}, true);
		/**
		 * @name newUserClick 打开新建用户的点击事件
		 */
		scope.newUserClick = function() {
			scope.newUser = true;
			scope.groupList = scope.settingDatas.data.hides;
			scope.inputFileChange();
		};
		/**
		 * @name closeNewUser 关闭新建用户的点击事件
		 */
		scope.closeNewUser = function() {
			scope.newUser = false;
		};

		/**
		 * @name newQuotaClick 打开新建指标的点击事件
		 */
		scope.newQuotaClick = function(data) {
			var j = 0
			for(var i = 0;i<data.data.length;i++){
				if(data.data[i].selected){
					j++
				}
			}
			if(j== data.data.length){
				return;
			}
			scope.newQuota = true;
			scope.quotaList = data;
		};
		/**
		 * @name closeQuotaClick 关闭新建指标的点击事件
		 */
		scope.closeQuotaClick = function() {
			scope.newQuota = false;
		};
		/**
		 * @name settingClose 点击取消setting页面事件，不保存改变直接关闭页面
		 */
		scope.settingClose = function() {
			scope.settingDatas.showImgBox = false;
			MenubarService.menusData[0].isActive = false;
		};
		/**
		 * @name settingHold setting保存按钮的点击事件
		 */
		scope.settingHold = function(){
			scope.settingClose();
			var obj = {
				"shows":{},
				"hides":{}
			};
			for(var i = 0;i<scope.settingDatas.data.shows.length;i++){
					obj.shows[scope.settingDatas.data.shows[i].name] = scope.settingDatas.data.shows[i];
			}
			for(var i = 0;i<scope.settingDatas.data.hides.length;i++){
					obj.hides[scope.settingDatas.data.hides[i].name] = scope.settingDatas.data.hides[i];
			}
			$.workbenchData.userType.data  = obj;
			for(var i = 0;i<$.workbenchData.userType.arr.length;i++){
				if($.workbenchData.userType.data.shows[$.workbenchData.userType.arr[i]]){
					$.workbenchData.userType.ifShow[i] = true;
				}else{
					$.workbenchData.userType.ifShow[i] = false;
				}
			}
			settingService.leftRightClick = false;
			TabService.getWorkbenchUserData();
			TabService.loadData(function() {
					TabService.updateRightSidebarData(TabService.getActiveTab());
			});
		};
		/**
		 * @name checkedClick 点击改变是不是显示到工作台的状态是不是选中
		 * @param {Object} data 当前点击的目标，并找到数据进行更改
		 */
		scope.checkedClick = function(data) {
			data.checked = !data.checked;
			//双层循环进行数据的筛选，判断是不是改变的对应的标签
			for(var i = 0; i < scope.settingDatas.data.shows.length; i++) {
				if(scope.settingDatas.data.shows[i].data[0].type == data.type) {
					for(var j = 0; j < scope.settingDatas.data.shows[i].data.length; j++) {
						if(scope.settingDatas.data.shows[i].data[j].text == data.text) {
							scope.settingDatas.data.shows[i].data[j] = data;
							break;
						}
					};
					break;
				}
			}
		};
		/**
		 * @name deleteGroupClick 删除组
		 * @param {Object} data 当前点击的目标
		 */
		scope.deleteGroupClick = function(data) {
			if(scope.settingDatas.data.shows.length == 1){
				return;
			}
			for(var i = 0;i<data.data.length;i++){
				data.data[i].checked = false;
			}
			data.ifShow = false;
			scope.settingDatas.data.hides.push(data);
			var arr = [];
			for(var i = 0; i < scope.settingDatas.data.shows.length; i++){
				if(scope.settingDatas.data.shows[i].name != data.name){
					arr.push(scope.settingDatas.data.shows[i]);
				}
			}
			scope.settingDatas.data.shows = arr;
		};
		/**
		 * @name deleteQuotaClick 删除指标
		 * @param {Object} data 当前点击的目标
		 */
		scope.deleteQuotaClick = function(data){
			data.selected = !data.selected;
			data.checked = true;
			scope.checkedClick(data);
		};
		/**
		 * @name labelShowClick 标签组的点击展开或者关闭事件
		 * @param {Object} data 当前点击的标签组
		 */
		scope.labelShowClick = function(data){
			for(var i = 0; i < scope.settingDatas.data.shows.length; i++){
				if(scope.settingDatas.data.shows[i].name == data.name){
					data.lableShow = !data.lableShow;
					scope.settingDatas.data.shows[i] = data;
				}else{
					scope.settingDatas.data.shows[i].lableShow = false;
				}
			}
		};
		/**
		 * @name holdQuotaClick 指标的保存功能
		 */
		scope.holdQuotaClick = function(){
			for(var i = 0; i < scope.quotaList.data.length; i++){
				if(scope.quotaList.data[i].text == $("#QuotaList").val()){
					scope.quotaList.data[i].selected = true;
				}
			}
			for(var i = 0; i < scope.settingDatas.data.shows.length; i++){
				if(scope.settingDatas.data.shows[i].name == scope.quotaList.data[i].type){
					scope.settingDatas.data.shows[i].data = scope.quotaList.data;
				}
			}
			scope.closeQuotaClick();
		};
		/**
		 * @name inputFileChange 上传图片的事件
		 */
		scope.inputFileChange = function(){
			$("#fileField").change(function(){
				$("#imgSrcText").val($("#fileField").val());
			});
		};
		/**
		 * @name 新建分组的保存
		 */
		scope.groupListClick = function(){
			var arr = [];
			for(var i = 0;i<scope.groupList.length;i++){
				if($("#GroupList").val() == scope.groupList[i].name){
					scope.groupList[i].ifShow = true;
					scope.settingDatas.data.shows.push(scope.groupList[i]);
				}else{
					arr.push(scope.groupList[i]);
				}
			}
			scope.settingDatas.data.hides = arr;
			scope.closeNewUser();
		}
	};

	return {
		restrict: "AE",
		replace: true,
		scope: {},
		link: linkFunc,
		template: '<div class = "setting_box" ng-show="settingDatas.showImgBox">' +
			'<div class="new_label_layer" ng-show="newQuota">' +
			'<div class="new_label_popwindow">' +
			'<p class="popwindow_title">新建指标</p>' +
			'<div class="new_label_message">' +
			'<span class="grop_name">指标标签:</span>' +
			'<div class="grop_select">' +
			'<div class="grop_label_text">' +
			'{{quotaList.userName}}' +
			'</div>' +
			'</div>' +
			'<div class="clear"></div>' +
			'</div>' +
			'<div class="new_label_message">' +
			'<span class="grop_name">指标:</span>' +
			'<div class="grop_select">' +
			'<label class="lblSelect">' +
			'<select  class="new_select" id="QuotaList" >' +
			'<option ng-repeat="itmes in quotaList.data" ng-if = "!itmes.selected" value="{{itmes.text}}">{{itmes.text}}</option>' +
			'</select>' +
			'<i class="fa fa-caret-down"></i>' +
			'</label>' +
			'</div>' +
			'<div class="clear"></div>' +
			'</div>' +
			'<div class="grop_btn">' +
			'<button class="grop_btn_sure" ng-click="holdQuotaClick()">保存</button>' +
			'<button class="grop_btn_no" ng-click="closeQuotaClick()">取消</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'<div class="new_grop_layer" ng-show="newUser">' +
			'<div class="new_grop_popwindow">' +
			'<p class="popwindow_title">新建分组</p>' +
			'<div class="new_grop_message"><span class="grop_name">组名:</span><div class="grop_select"><label for="" class="lblSelect">' +
			'<select name="" id = "GroupList" class="new_select"><option ng-repeat = "itmes in groupList" value="{{itmes.name}}" >{{itmes.userName}}</option></select>' +
			'<i class="fa fa-caret-down"></i></label></div><div class="clear"></div></div>' +
			'<div class="new_grop_message">' +
			'<span class="grop_name">标签组图片:</span>' +
			'<div class="grop_select img_file">' +
			'<input type="text" name="imgSrcText" id="imgSrcText" class="imgSrcText">' +
			'<input type="file" name="fileField" class="fileField" id="fileField"/>' +
			'</div>' +
			'<div class="clear"></div>' +
			'</div>' +
			'<div class="grop_btn">' +
			'<button class="grop_btn_sure" ng-click = "groupListClick()">保存</button>' +
			'<button class="grop_btn_no" ng-click="closeNewUser()">取消</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'<div class="setting_container">' +
			'<ul class="setting_tab_title">' +
			'<li class="diy_title selectEffect">DIY</li>' +
			'<li>导出和弹窗</li>' +
			'<li class="new_group" ng-click="newUserClick()">' +
			'<i class="fa fa-folder-open-o"></i>新建分组' +
			'</li>' +
			'<div class="clear"></div>' +
			'</ul>' +
			'<ul class="setting_tab_content" ng-repeat= "itmes in settingDatas.data.shows">' +
			'<li class="tab_content_list">' +
			'<div class="tab_content_item">' +
			'<p class="tab_content_title"  ng-click = "labelShowClick(itmes)">{{itmes.userName}}<i class="fa fa-angle-down"></i></p>' +
			'<p class="tab_content_tool">' +
			'<span><i class="fa fa-edit"></i>编辑完成</span>' +
			'<span ng-click = "deleteGroupClick(itmes)"><i class="fa fa-trash-o"></i>删除分组</span>' +
			'</p>' +
			'<div class="clear"></div>' +
			'</div>' +
			'<ul class="new_label"ng-if = itmes.lableShow>' +
			'<li class="new_label_item" ng-repeat="itme in itmes.data" ng-click = "checkedClick(itme)" ng-if = "itme.selected">' +
			'<span class="new_label_title">{{itme.text}}</span>' +
			'<div class="close_btn" ng-click = "deleteQuotaClick(itme)"><img src="images/close.png" alt="" /></div>' +
			'<div class="new_label_mask" ng-show = "itme.checked">' +
			'<div class="right_bottom_conner">' +
			'<img src="images/right_bottom_check.png" alt="" />' +
			'</div>' +
			'</div>' +
			'</li>' +
			'<li class="new_label_item" ng-click="newQuotaClick(itmes)">' +
			'<img src="images/label_plus.png" alt="" class="new_label_add"/>' +
			'</li>' +
			'<div class="clear"></div>' +
			'</ul>' +
			'</li>' +
			'</ul>' +
			'<div class="setting_btn">' +
			'<button class="setting_cancle" ng-click = "settingClose()">取消</button>' +
			'<button class="setting_save setting_btn_select" ng-click = "settingHold()">保存</button>' +
			'</div>' +
			'</div>' +
			'</div>'
	};
}]);