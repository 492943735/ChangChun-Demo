var mainApp = angular.module("main");

mainApp.directive("menubarOpenMould", ["MenubarService", "storyLineService", "CommonPath", "$translate", "SettingService", "TabService", "tipWindow",
    function(MenubarService, storyLineService, CommonPath, $translate, SettingService, TabService, tipWindow)
{
	var linkFunc = function(scope, elem, attr) {
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.IMAGES = IMAGES;
		scope.openImg = MenubarService.openImg;
		scope.openData = storyLineService.openData;
		scope.deleteStoryBtnIsActived = storyLineService.deleteStoryBtn.actived;
		scope.selectNum = 0;
		scope.isDelete = false;
		scope.selectMap = [];
		
		for (var pos = 0, selectedIndex = 0; pos < scope.openData.storyList.length; ++pos ) {
			
			if (scope.openData.storyList[pos].storyBase.selected) {
				scope.selectMap[scope.selectNum] = {};
				scope.selectMap[scope.selectNum++].storyName = scope.openData.storyList[pos].storyBase.storyName;
			}
		}
		
		scope.showStory = function() {
			
		}
		
		scope.click = function(index, storyLine) {
			// 删除按钮被激活
			if(scope.deleteStoryBtnIsActived && storyLine.canDelete) {
				var tipMsg = $translate.instant("i18n.storyDelete.warning");
				
				var sureCallback = function() {
					scope.isDelete = true;
					
					// 如果删除的时选中标签，则算中计数器需要--
					if (scope.openData.storyList[index].storyBase.selected) {
						scope.deleteOrderNum();
					}
					
					storyLineService.deleteCreatedUserStory(index, storyLine, scope.selectMap);
				}
				
				tipWindow.show(true, true, true, tipMsg, sureCallback, true);
			}
			// 选中，去选中
			else if(!scope.deleteStoryBtnIsActived) {
				scope.selectedFunction(index);
				var checkedNum = 0;
				for(var i = 0; i < scope.openData.storyList.length; i++) {
					if(scope.openData.storyList[i].storyBase.selected) {
						checkedNum++;
					}
				}
				if(checkedNum > maxStoryLineShowNum) {
					var tipMsg = $translate.instant("i18n.storySelected.warning", {maxStoryLineShowNum: maxStoryLineShowNum});
					tipWindow.show(true, true, false, tipMsg, null);
					scope.selectedFunction(index);
					return;
				}
			}
		}
		
		scope.selectedFunction = function(index) {
			scope.openData.storyList[index].storyBase.selected = !scope.openData.storyList[index].storyBase.selected;

			if (scope.openData.storyList[index].storyBase.selected) {
				scope.openData.storyList[index].storyBase.order = ++scope.selectNum;
			} else {
				scope.openData.storyList[index].storyBase.order = -1;
				scope.deleteOrderNum();
			}
		}
		
		// 当取消选择时，需要将该标签后面的标签排列序号前移
		scope.deleteOrderNum = function() {
			--scope.selectNum;
			
			for (var i = 0; i < scope.openData.storyList.length; ++i){
				if (scope.openData.storyList[i].storyBase.selected 
						&& scope.openData.storyList[i].storyBase.order > scope.selectNum) {
					--scope.openData.storyList[i].storyBase.order;
				}
			}
		}
		
		/**
		 * 双击时不打开故事线编辑界面
		 */
		scope.showEditStory = function(storyName) {
			//storyLineService.showEditUI(storyName);
		};
		
		scope.deleteStoryBtn = function() {
		    scope.deleteStoryBtnIsActived = !scope.deleteStoryBtnIsActived;
		}
		
		scope.saveStory = function() {
			storyLineService.saveUserShowStory().then(function() {
				TabService.refreshData("noRefreshThreshold");
			});
			scope.deleteStoryBtnIsActived = false;
			scope.openImg.isActive = false;
		}
		
		scope.cancelClick = function() {
			scope.deleteStoryBtnIsActived = false;
			scope.openImg.isActive = false;
			
			if (scope.isDelete) {
				TabService.refreshData();
			}
		};
	};
		
	return {
		restrict : "E",
		replace : true,
		scope : {
			menu : "="
		},
		link : linkFunc,
		template : '<div class="open_story_main">'+
		'<div class="open_story_title">{{"i18n.story.title" | translate }}</div>'+
		'<div class="open_story_body">'+	
			'<div class="open_story_content">'+	
			'<div class="openStoryScroll" ng-scrollbar>'+		
				'<label ng-repeat="storyLine in openData.storyList" class="storyLabel" ng-class="{storyLabelSelected : storyLine.storyBase.selected}"'+		
				'ng-click="click($index, storyLine)" ng-dblclick="showEditStory(storyLine.storyBase.storyName)">'+		    
					'<span class="storyLineText" uib-tooltip="{{storyLine.storyBase.storyName}}">{{storyLine.storyBase.storyName}}</span>'+		
					'<img ng-if="!deleteStoryBtnIsActived"  class="storyLineCheckBox" ng-src="{{storyLine.storyBase.selected?  imgBasePath+IMAGES.checked : imgBasePath + IMAGES.checkbox}}" />'+		
					'<span ng-if="deleteStoryBtnIsActived && storyLine.canDelete" class="removeLabel"></span>'+		
					'</label>'+	
						
					'<div class="all_one seetingGropBtn glyphicon glyphicon-minus addIcon diydellabel storyLabel storyDelete" '+	
					'ng-class="{deleteStoryBtnActived : deleteStoryBtnIsActived}" ng-click="deleteStoryBtn()" >'+		
					'</div>'+	
					'</div>'+
				'</div>'+
			'</div>'+
			'<div class="open_story_foot">'+
		'<input class="btn_sure" type="button" value=" {{\'i18n.dialog.preservation\' | translate}}" ng-click="saveStory()"/>'+		
			'<input class="btn_no" type="button" value="{{\'i18n.dialog.cancel\' | translate}}" ng-click="cancelClick()"/>'+	
		'</div>'+	
		'</div>'
	};
}]);