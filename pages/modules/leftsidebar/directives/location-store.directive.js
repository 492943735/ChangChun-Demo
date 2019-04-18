var accessApp = angular.module("sidebar.left");

accessApp.directive("locationStore", [ "gisMapService", "CommonPath", "LeftService", "$timeout","MenubarService",
		function(gisMapService, CommonPath, LeftService, $timeout, MenubarService) {
			var linkFunc = function(scope, elem, attr) {
				scope.btns = LeftService.btns;
				scope.allLocationImage = CommonPath.imgBasePath + IMAGES.ThresholdSetUpBtn;//定位门店按钮的背景图片
				scope.locationModel = LeftService.locationModel;//获取门店定位数据
				if(scope.locationModel.locationData.length > 1){
					scope.locationModel.locationData.pop();
				}
				scope.locationModel.locationData[0].markImage="../pages/images/RegularChain.png";
				//勾选门店定位
				scope.LocationItemChecked = function(index) {
					scope.locationModel.locationData[index].checked = !scope.locationModel.locationData[index].checked;
				};
				
				//打开门店定位设置界面
				scope.locationSetUp = function($event) {
					$event.stopPropagation(); 
					for(var i=0; i<scope.btns.length;i++){
						var bIndex = i;
						if(scope.btns[bIndex].name == Constant.LOCATION){
							scope.btns[bIndex].isActived = false;
						}
					}
					LeftService.locationModel.locationUIData.locationSettingShow = false;
				};
				
				scope.reset = function(){
					resetLocationMarkData(scope.locationModel.locationData);
				};
				MenubarService.registerResetFunc(scope);
				
			};
			

			return {
				restrict : "E",
				replace : true,
				scope : {},
				link : linkFunc,
				template : '<div class="accessBoxRuler">'+
				'<h4 class="widthColorTxt">'+
				'<span uib-tooltip="{{\'i18n.location.title\' | translate }}" class="btnTitleUi">{{"i18n.location.title" | translate }}</span>'+
			'</h4>'+
			'<div class="leftSidebarScroll" ng-scrollbar>'+
				'<div ng-repeat="LocationItem in locationModel.locationData">'+
					'<div class="rowMHZ" ng-click="LocationItemChecked($index)" >'+
						'<input type="checkbox" name="chooseWidth" class="chooseWidth"/> '+
						'<span class="inputImg" ng-class="{inputImgChecked : LocationItem.checked}">'+
							'<i ng-show="LocationItem.checked" class="fa fa-check"></i>'+
						'</span>'+
						'<span class="checkBoxTxt" ng-class="{checkBoxTxtChecked : LocationItem.checked}" uib-tooltip="{{LocationItem.markName}}">'+
							'<img class="locationIcon" ng-src="{{LocationItem.markImage}}">'+
							'{{LocationItem.markName}}'+
						'</span>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>'
			};
		} ]);