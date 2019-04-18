angular.module("common").factory("tipWindow", ["$http", "$filter", function($http, $filter, TabService) {
	
	/*参数介绍
	show: false, 窗口是否显示
	btnOk: true, 确认按钮是否显示
	btnNo: true, 取消按钮是否显示
	data: "", 提示信息
	sureCallback: null , 点击确认后的回调函数
	warningState: false, 严重警告标识是否显示
	title:"i18n.tip.title"自定义提示框title，不填则使用默认的
	inputs:是否显示输入框
	*/
	//全局提示框显示变量配置
	var tipAllModelData = {
			show: false, 
			btnOk: true, 
			btnNo: true, 
			data: "", 
			sureCallback: null , 
			warningState: false, 
			title:"i18n.tip.title",
			inputs:true
	};
	
	//弹框数据获取
	function getTipWindow() {
		return tipAllModelData;
	};
	
	/*参数介绍
	show: false, 窗口是否显示
	btnOk: true, 确认按钮是否显示
	btnNo: true, 取消按钮是否显示
	data: "", 提示信息
	sureCallback: null , 点击确认后的回调函数
	warningState: false, 严重警告标识是否显示
	title:"i18n.tip.title"自定义提示框title，不填则使用默认的
	*/
	//调用弹窗
	function show(type, btnOk, btnNo, data, sureCallback, warningState, title,inputs) {
		tipAllModelData.show = type;
		tipAllModelData.btnOk = btnOk;
		tipAllModelData.btnNo = btnNo;
		tipAllModelData.data = data;
		tipAllModelData.sureCallback = sureCallback;
		tipAllModelData.warningState = warningState;
		if (title != null) {
			tipAllModelData.title = title;
		};
		tipAllModelData.inputs=inputs;
	};
	
	/*参数介绍
	show: false, 窗口是否显示
	btnOk: true, 确认按钮是否显示
	btnNo: true, 取消按钮是否显示
	data: "", 提示信息
	sureCallback: null , 点击确认后的回调函数
	warningState: false, 严重警告标识是否显示
	title:"i18n.tip.title"自定义提示框title，不填则使用默认的
	*/
	//隐藏弹窗
	function hide() {
		tipAllModelData.show = false;
		tipAllModelData.btnOk = true;
		tipAllModelData.btnNo = true;
		tipAllModelData.data = "";
		tipAllModelData.sureCallback = null;
		tipAllModelData.warningState = false;
		tipAllModelData.title = "i18n.tip.title";
		tipAllModelData.inputs=true;
	};
	
	return {
		getTipWindow: getTipWindow,
		show: show,
		hide: hide
	}
}]);