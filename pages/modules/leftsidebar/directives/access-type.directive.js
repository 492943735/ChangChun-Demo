var accessApp = angular.module("sidebar.left");

accessApp.directive("accessType", [ "gisMapService", "CommonPath", "LeftService", "$timeout","MenubarService",
		function(gisMapService, CommonPath, LeftService, $timeout, MenubarService) {
			var linkFunc = function(scope, elem, attr) {
				scope.btns = LeftService.btns;
				scope.allAccessImage = CommonPath.imgBasePath + IMAGES.ThresholdSetUpBtn;//制式设置按钮的背景图片
				scope.accessModel = LeftService.accessModel;//获取制式数据
					for(var i=0;i<scope.accessModel.modelData.length;i++) {
					if(scope.accessModel.modelData[i].access=="4G"){
						scope.accessModel.modelData[i].checked = true;
						scope.accessModel.modelData[i].multiSelected = true;
					}else{
						scope.accessModel.modelData[i].checked = false;
						scope.accessModel.modelData[i].multiSelected = false;
					}
				}
				
				//改变制式
				scope.AccessItemChecked = function(index) {
					if(gisMapService.getActivedMapModel().isLock){
                		return;
                	}
					for(var i = 0;i < scope.accessModel.modelData.length; i++) {
						if(index == i) {
							scope.accessModel.modelData[index].checked = !scope.accessModel.modelData[index].checked;
						}else{
							scope.accessModel.modelData[i].checked = false;
						}
					};
        			
				};
				
				//打开频段设置界面
				scope.bandWidthSetUp = function($event) {
					$event.stopPropagation(); 
					for(var i=0; i<scope.btns.length;i++){
						var bIndex = i;
						if(scope.btns[bIndex].name == Constant.BANDWIDTH){
							scope.btns[bIndex].isActived = false;
						}
					}
					
					LeftService.accessModel.accessUIData.frequencyShow = true;
					for(var i=0;i<scope.accessModel.modelData.length;i++) {
						scope.accessModel.modelData[i].multiSelected = false;
					};
					for(var i=0;i<scope.accessModel.modelData.length;i++){
						var showIndex = i;
						if(scope.accessModel.modelData[showIndex].checked){
							scope.accessModel.modelData[showIndex].multiSelected = true;
							return;
						}
						//3个制式都没有触发return ，则选中2G
						if(i == scope.accessModel.modelData.length) {
							scope.accessModel.modelData[2].multiSelected = true;
						}
					}
				};
				
				scope.reset = function(){
					resetAccessData(scope.accessModel.modelData);
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
				'<span uib-tooltip="{{\'i18n.access.title\' | translate }}" class="btnTitleUi">{{"i18n.access.title" | translate }}</span>'+
				'<span ng-click="bandWidthSetUp($event);" class="bandWidthSetUp">'+
				'	<img ng-src="{{allAccessImage}}">'+
				'</span>'+ 
			'</h4>'+
		'<div class="leftSidebarScroll" ng-scrollbar>'+
				'<div ng-repeat="AccessItem in accessModel.modelData">'+
				'<div class="rowMHZ" ng-click="AccessItemChecked($index)" >'+
					'<input type="checkbox" name="chooseWidth" class="chooseWidth"/> '+
					'<span class="inputImg" ng-class="{inputImgChecked : AccessItem.checked}">'+
					'<i ng-show="AccessItem.checked" class="glyphicon glyphicon-ok"></i>'+
					'</span>'+
					'<span class="checkBoxTxt" ng-class="{checkBoxTxtChecked : AccessItem.checked}" uib-tooltip="{{AccessItem.access}}">'+
					'{{AccessItem.access}}'+
					'<span>({{AccessItem.checkedType | translate}})</span>'+
					'</span>'+
				'	</div>'+
			'	</div>'+
		'	</div>'+
		'</div>'
			};
		} ]);