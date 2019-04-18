var frequencyApp = angular.module("sidebar.left");

frequencyApp.directive("frequency", [ "CommonPath", "LeftService","gisMapService","TabService",
		function(CommonPath, LeftService, gisMapService, TabService) {
			var linkFunc = function(scope, elem, attr) {
				scope.accessModel = LeftService.accessModel;
				//关闭频段操作框
				scope.frequencyClose = function($event) {
					LeftService.accessModel.accessUIData.frequencyShow = false;
					LeftService.setAccessData(gisMapService.getActivedMapModel());
					for(var i=0;i<scope.accessModel.modelData.length;i++) {
						scope.accessModel.modelData[i].multiSelected = false;
					}
					$event.stopPropagation(); 
				};
				
				//操作当前所选制式全部频段
				scope.frequencyAll = function($event) {
					$event.stopPropagation(); 
					if(gisMapService.getActivedMapModel().isLock){
                		return;
                	}
					var allSelect = true;
					for(var i = 0;i < scope.accessModel.modelData.length;i++) {
						if(scope.accessModel.modelData[i].multiSelected == true) {
							var FrequencyData = scope.accessModel.modelData[i].data;
							for(var i = 0;i < FrequencyData.length;i++) {
								if(FrequencyData[i].checked == false) {
									allSelect = false;
								}
							}
							if(!allSelect) {
								for(var i = 0;i < FrequencyData.length;i++) {
									FrequencyData[i].checked = true;
								}
							}else{
								for(var i = 0;i < FrequencyData.length;i++) {
									FrequencyData[i].checked = false;
								}
							}
						}
					};
				}
				
				//保存频段操作
				scope.frequencySave = function($event) {
					for(var i = 0;i < scope.accessModel.modelData.length;i++) {
						var AccessIndex = i;
						var checkedLive = false;
						var checkedDie = false;
						var frequency = scope.accessModel.modelData[i].data;
						for(var j = 0;j < frequency.length;j++) {
							if(frequency[j].checked) {
								checkedLive = true;
							}
							if(!frequency[j].checked) {
								checkedDie = true;
							}
						};
						if(checkedLive == true && checkedDie == true) {
							scope.accessModel.modelData[AccessIndex].checkedType = "i18n.access.partial";
						};
						if(checkedLive == true && checkedDie == false) {
							scope.accessModel.modelData[AccessIndex].checkedType = "i18n.access.all";
						};
						if(checkedLive == false && checkedDie == true) {
							scope.accessModel.modelData[AccessIndex].checkedType = "i18n.access.none";
						};
					}
					LeftService.accessModel.accessUIData.frequencyShow = false;
					gisMapService.changeActiveMapAccessData(TabService);
					$event.stopPropagation(); 
				}
			};
			

			return {
				restrict : "E",
				replace : true,
				scope : {},
				link : linkFunc,
				template : '<div class="frequencyModelColor" id="frequencyModel">'+
				'<div class="frequencyBox">'+
				'<span class="frequencyClose" ng-click="frequencyClose($event)">X</span>'+
				'<p class="frequencyTitle">{{"i18n.frequency.title" | translate }}</p>'+
				'<div class="frequencyBody">'+
					'<div class="frequency_accessBody">'+
						'<span  ng-repeat="accessItem in accessModel.modelData | filter:{\'checked\':true}" class="frequency_accessStyle" ng-class="{frequency_accessStyle_selected : accessItem.multiSelected}">{{accessItem.access}}</span>'+
					'</div>'+
					'<div class="frequency_canvas">'+
						'<span class="frequency_models">'+
							'<span ng-repeat="frequencyItem in accessModel.modelData | filter:{\'checked\':true}" class="frequency_model">'+
								'<frequency-model frequency-item="frequencyItem.data" ></frequency-model>'+
							'</span>'+
						'</span>'+
					'</div>'+
				'</div>'+
				'<div class="frequencyFooter">'+
					'<button class="btnInit frequencyAll btn_no" ng-click="frequencyAll($event)">{{"i18n.frequency.btn.all" | translate }}</button>'+
					'<button class="btnInit frequencySave btn_no" ng-click="frequencySave($event)">{{"i18n.frequency.btn.ok" | translate }}</button>'+
				'</div>'+
			'</div>'+
		'</div>'
			};
		} ]);