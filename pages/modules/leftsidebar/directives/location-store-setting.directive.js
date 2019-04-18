var leftModule = angular.module("sidebar.left");

leftModule.directive("locationStoreSetting", ["LeftService", "CommonPath", "$translate", "tipWindow", "$http", "gisMapService","$timeout",
	function(LeftService, CommonPath, $translate, tipWindow, $http, gisMapService, $timeout)
{
	var linkFunc = function(scope, elem, attr) { 
		scope.locationModel = LeftService.locationModel;//获取门店定位数据
		
		scope.currentSelectMark = LeftService.locationModel.locationData[0].locationMark;
		
		scope.currentImgData = requestContext + "/locationmark/handleimg.action?locationMark=" + 
		LeftService.locationModel.locationData[0].locationMark + "&mathRandom=" + Math.random();
		/**
		 * 点击取消按钮触发事件
		 */
		scope.cancel = function(){
			scope.locationModel.locationUIData.locationSettingShow = false;
		};
		
		scope.imageUpload = function($event){
			scope.$apply(function(){
				var file = $event.target.files[0];
				if (!/image\/\w+/.test(file.type)) { //匹配 image/(数字，字母，下划线)一次或多次
					tipWindow.show(true, true, false, $translate.instant("i18n.setting.upload.image.rule"));
				}else if (file.size > (1024*1024*3)) {
					tipWindow.show(true, true, false, $translate.instant("i18n.setting.upload.image.rule"));
				}else{
					var reader = new FileReader();
					reader.onload = function(event){
						scope.$apply(function() {
							scope.currentImgData = event.target.result;
						});
					};
					reader.readAsDataURL(file);
				}
				$('#locationImageFile').val('');
			});
		};
		
		scope.saveMarkImg = function(){
			if(scope.currentImgData.indexOf("data:image") != -1){
				var legendSize = "";
				for(var i = 0;i<LeftService.locationModel.locationData.length;i++){
					var item = LeftService.locationModel.locationData[i];
					if(item.locationMark == scope.currentSelectMark){
						legendSize = item.legendSize;
					}
				}
				$http({
					method : 'POST',
					url : "/locationmark/uploadimg.action",
					dataType : "json",
					data : {
						locationMark : scope.currentSelectMark,
						imgData : scope.currentImgData,
						legendSize : legendSize
					},
					async : true,
					cache : false,
					contentType : "application/json;charset=utf-8"
				}).then(function success(responseData) {
					if(responseData.data.state == '0'){
						var mapModel = gisMapService.getActivedMapModel();
						for(var i = 0;i<mapModel.gisMap.locationData.length;i++){
							var item = mapModel.gisMap.locationData[i];
							if(scope.currentSelectMark == item.locationMark && item.checked){
								gisMapService.addActiveMapLocationMark();
							}
						}
						for(var i = 0;i<LeftService.locationModel.locationData.length;i++){
							var item = LeftService.locationModel.locationData[i];
							if(item.locationMark == scope.currentSelectMark){
								item.markImage = requestContext + "/locationmark/handleimg.action?locationMark=" + item.locationMark + "&mathRandom=" + Math.random();
								
							}
						}
						
					}
				});
			}
			scope.cancel();
		};
		
		$("#locationMarkVal").select2({minimumResultsForSearch:4});
		
		
		$timeout(function(){
			$("#locationMarkVal").select2("val", scope.currentSelectMark);
		}, 200);
		$("#locationMarkVal").on("select2:close", function(){
			scope.$apply(function() {
				scope.currentSelectMark = $("#locationMarkVal").select2("data")[0].id;
				scope.currentImgData = requestContext + "/locationmark/handleimg.action?locationMark=" + scope.currentSelectMark;
			});
		});
	};
	return {
		restrict : "E",
		replace : true,
		scope : {
		},
		link : linkFunc,
		template : '<div class="modelColorBg" id="chooseImg_root" style="z-index: 9999!important;">'+
	'<div class="row colorChoose_context_location" id="chooseImg_colorChoose_contex">'+
		'<div class="text-center img_listBox_location" id="chooseImg_listBox">'+
			'<span class="locationClose" ng-click="cancel()">X</span>'+
			'<div class="chooseImgTitle" id="chooseImgTitle">'+
				'<span id="chooseImgTitleTxt" class="chooseImgTitleTxt">{{"i18n.location.title" | translate}}</span>'+
			'</div>'+
			'<div class="clearfix selectListBox">'+
				'<div class="locationSelectList clearfix"  style="float: left;">'+
					'<div style="text-align: left; margin: 0 0 2rem 0;padding-left: 8%;">'+
						'<span class="icon_lable settingSelectBox">{{\'i18n.location.mark.title\' | translate}} : </span>'+
						'<select id="locationMarkVal" class="Dimension">'+
							'<option value="{{locationItem.locationMark}}" ng-repeat="locationItem in locationModel.locationData">{{locationItem.markName}}</option>'+
						'</select>'+
					'</div>'+
					'<div style="text-align: left; margin: 0 0 2rem 0;padding-left: 8%;">'+
						'<span class="icon_lable settingSelectBox">{{\'i18n.location.icon.title\' | translate}} : </span>'+
						'<div class="previewImg previewLocationImg clearfix" id="chooseImg_root_previewImg">'+
							'<span id="chooseImg_root_previewImg_span" class="visiteChooseImg">'+
							    '<img alt="Icon" ng-src="{{currentImgData}}" class="location_mark_type_img">'+
								'<input id="locationImageFile" class="fileUpload" name="imageFile" type="file" ondblclick="return false;"accept="image/gif,image/jpeg,image/jpg,image/png,image/svg,image/bmp,image/psd,image/tif" onchange="angular.element(this).scope().imageUpload(event);" />'+
								'<span id="penIcon" class="penIcon" alt="penIcon" ng-src="{{imgBasePath + IMAGES.ic_image_edit}}"></span>'+
							'</span>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div>'+
			'<div class="colorChoose-btn" id="chooseImg_root_colorChoose-btn">'+
				'<input class="btnSubmit" type="button" value=" {{ \'i18n.dialog.preservation\' | translate}}" ng-click="saveMarkImg();" id="chooseImg_root_colorChoose-btn_Confirm" />'+
				'<input class="btnModel" type="button" value="{{ \'i18n.dialog.cancel\' | translate}}" ng-click="cancel();" id="cancel_btn2" />'+
			'</div>'+
		'</div>'+
	'</div>'+
'</div>'

	};
}]);