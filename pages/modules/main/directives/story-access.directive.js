var storyAccessApp = angular.module("main");

storyAccessApp.directive("storyAccess", [ "CommonPath", "LeftService",
		function(CommonPath, LeftService) {
			var linkFunc = function(scope, elem, attr) {
				scope.accessModel = LeftService.accessModel;
				//展开树形list
				scope.frequencyVisbel = function(AccessItem) {
					AccessItem.listShow = !AccessItem.listShow;
				}
			};

			return {
				restrict : "E",
				replace : true,
				scope : {},
				link : linkFunc,
				template : '<div>'+
				'<ul class="parent">'+
				'<li ng-repeat="AccessItem in accessModel.modelData" class="parentLi">'+
				'<span class="inputImg" ng-class="{inputImgChecked : AccessItem.checked}">'+
					'<i ng-show="AccessItem.checked" class="glyphicon glyphicon-ok storyAccessIcon"></i>'+	
					'</span>'+
					'<span ng-click="frequencyVisbel(AccessItem)" class="openLine">'+
						'<span class="checkBoxTxt storyAccessTxt" ng-class="{checkBoxTxtChecked : AccessItem.checked}" uib-tooltip="{{AccessItem.access}}">'+
							'{{'+AccessItem.access+'}}'+
						'</span>'+
						'<span ng-class="{storyTreeIconOpen: AccessItem.listShow, storyTreeIcon: !AccessItem.listShow}"></span>'+
					'</span>'+
					'<ul class="childerBox" ng-if="AccessItem.listShow && AccessItem.data">'+
						'<li ng-repeat="freItem in AccessItem.data" class="childerLi">'+
							'<span class="inputImg" ng-class="{inputImgChecked : freItem.checked}">'+
								'<i ng-show="freItem.checked" class="glyphicon glyphicon-ok storyAccessIcon"></i>'+
							'</span>'+
							'<span class="checkBoxTxt" ng-class="{checkBoxTxtChecked : freItem.checked}" uib-tooltip="{{freItem.frequency}}&nbsp;MHz">'+
								'{{'+freItem.frequency+'}}'+'&nbsp;'+MHz+
							'</span>'+
						'</li>'+
					'</ul>'+
				'</li>'+
			'</ul>'+
		'</div>'
			};
		} ]);