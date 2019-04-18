var mainApp = angular.module("main");

mainApp.directive("menubarSaveMould", ["MenubarService", "TabService", "storyLineService", "RightSidebarService","gisMapService",
    function(MenubarService, TabService, storyLineService, RightSidebarService, gisMapService)
{
	var linkFunc = function(scope, elem, attr) {
		scope.saveImg = MenubarService.saveImg;
		scope.storyLine = storyLineService.storyData.storyLine;
		scope.activeIndex = 0;
		scope.error = "";
		scope.menuTitles = [
            {text:"Preview", status: true, i18n:"i18n.story.template.preview"},
            {text:"Summary", status: false, i18n:"i18n.story.template.summary"}
        ];
		
		/**
		 * 点击切换设置界面
		 */
		scope.activeClick = function(index){
			for(var i = 0; i < scope.menuTitles.length; i++){
				scope.menuTitles[i].status = false;
			};
			
			scope.menuTitles[index].status = true;
			scope.activeIndex = index;
		};
		
		/**
		 * 获取title
		 */
		scope.getTemplateTitle = function() {
			if (storyLineService.isEdit()) {
				return  "i18n.story.template.setting.title"; 
		    }
			else {
				return	"i18n.story.template.save.title";
			}
		}
		
		/**
		 * 退出保存故事线界面
		 */
		scope.cancelClick = function() {
			//只有故事线编辑时点击cancel还原原来的值
			if(storyLineService.isEdit()) {
				storyLineService.recoveryStoryData();
			}
			storyLineService.hideUI();
		};
		
		/**
		 * 模板名称输入框keyup
		 */
        scope.onTemplateKeyUp = function(){
        	var storyName = scope.storyLine.storyBase.storyName;
        	
        	if(storyName) {
        		var pattern = new RegExp("[!'\"<>&#;$|?＇＂＆＃；]", "g")
        		scope.storyLine.storyBase.storyName = storyName.replace(pattern, "");
        	}
		};
		
		/**
		 * 点击保存按钮
		 */
		scope.saveClick = function() {
			var storyName = scope.storyLine.storyBase.storyName;
			var isEdit = storyLineService.isEdit();
			
			if(!storyName || storyName.trim() === "") {
				scope.error = "i18n.story.message.nameNotAllowedEmpty";
				elem.find("#saveStoryLineName").focus();
				return;
			}
			else if(isEqualIgnoreCase(storyName, I18N_KEY.DIY)) {
				scope.error = "i18n.story.storyname.exist";
				elem.find("#saveStoryLineName").focus();
				return;
			}
			
			if(isEdit) {
				storyLineService.editStoryLine().then(saveCallback);
			}
			else {
				storyLineService.addStoryLine().then(saveCallback);
			}
			
			function saveCallback(response) {
				if(response.data.state === "0") { //success
					if(!isEqualIgnoreCase(TabService.getActiveTab().item.text, I18N_KEY.DIY)){
						gisMapService.getActivedMapModel().gisMap.clearPreviewState();
					}
					storyLineService.hideUI();
					
					if(isEdit) {
						storyLineService.storyData.oldStoryName = storyName;
						TabService.setLastActivedTabText(storyName);
						TabService.refreshData();
					}
				}
				else {
					scope.error = response.data.errMsg;
					elem.find("#saveStoryLineName").focus();
				}
			}
		};
	};
		
	return {
		restrict : "E",
		replace : false,
		scope : {
		},
		link : linkFunc,
		template: '<div class="save_story_main">'+
		   ' <div class="save_story_title">{{getTemplateTitle() | translate}}</div>'+
			'<div class="save_story_body">'+
				'<div class="save_story_content">'+
					'<div class="save_story_tab">'+
						'<span ng-repeat="menuTitle in menuTitles" ng-click="activeClick($index)" ng-class="{menuActive: menuTitle.status}">{{menuTitle.i18n|translate}}</span>'+
					'</div>'+
					'<div class="save_story_tab_box" ng-scrollbar>'+
						'<story-preview ng-if="activeIndex === 0"></story-preview>'+
						'<story-summary ng-if="activeIndex === 1" summary="storyLine.summary"></story-summary>'+
						'<story-filter ng-if="activeIndex === 2"></story-filter>'+
					'</div>'+
				'</div>'+
				'<div class="save_story_content_foot">'+
					'<span>{{"i18n.story.template.name" | translate}}:</span>'+
					'<input id="saveStoryLineName" type="text" ng-model="storyLine.storyBase.storyName" ng-readonly="storyLine.special" ng-keyup="onTemplateKeyUp()" maxlength="32"/>'+
					'<label class="story_auth"><input type="radio" name="authType" ng-value="1" ng-model="storyLine.storyBase.authType"/>'+
						'<span class="normal_font">{{"i18n.story.template.private" | translate}}</span>'+
					'</label>'+
					'<label class="story_auth"><input type="radio" name="authType" ng-value="0" ng-model="storyLine.storyBase.authType"/>'+
						'<span class="normal_font">{{"i18n.story.template.public" | translate}}</span>'+
					'</label>'+
			'	</div>'+
				'<div class="error_tips">{{error | translate}}</div>'+
			'</div>'+
			'<div class="save_story_foot">'+
			'	<input class="btn_sure" type="button" value=" {{\'i18n.dialog.preservation\' | translate}}" ng-click="saveClick()"/>'+
			'	<input class="btn_no" type="button" value="{{\'i18n.dialog.cancel\' | translate}}" ng-click="cancelClick()"/>'+
			'</div>'+
		'</div>'
	};
}]);