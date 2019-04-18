angular.module("main").factory("settingService", [ "$http","$filter",  "$timeout", "CommonPath","MenubarService",
   function( $http, $filter,  $timeout, CommonPath,MenubarService) {
   	var settingDatas = {//用来传递的数据
		showImgBox: false,
		data : null//展示的数据
	};
	var data = null;
	var loadData = function(){
		settingDatas.showImgBox = MenubarService.settingClick();
		settingDatas.data = collatData();//展示的数据，需要先进行数据的处理
	};
	var leftRightClick = true;
	/**
	 * @name collatData 对数据的处理，需要将原有的数据格式改成setting需要的数据格式
	 */
	function collatData(){
		var obj = {
			"shows":[],
			"hides":[]
		};
		var data = angular.copy($.workbenchData.userType);
		for(var i in $.workbenchData.userType.data.shows){
			obj.shows.push($.workbenchData.userType.data.shows[i]);
		}
		for(var i in $.workbenchData.userType.data.hides){
			for(var j = 0;j<$.workbenchData.userType.data.hides[i].data.length;j++){
					$.workbenchData.userType.data.hides[i].data[j].selected = false;
				}
			obj.hides.push($.workbenchData.userType.data.hides[i]);
		}
		for(var i = 0;i<obj.shows.length;i++){
			if(i == 0){//setting中打开的是那个标签组，默认为第一个
				obj.shows[i].lableShow = true;
			}else{
				obj.shows[i].lableShow = false;
			}
		}
		return obj;
	}
	return {
		settingDatas:settingDatas,
		loadData:loadData,
		leftRightClick:leftRightClick
	};
}]);