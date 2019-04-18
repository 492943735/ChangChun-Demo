var mainApp = angular.module("setting");

mainApp.directive("chooseImgMould", ["SettingService", "labelService", "TabService", "CommonPath", "$translate", "$timeout", "tipWindow", "labelI18nService",
	function(SettingService, labelService, TabService, CommonPath, $translate, $timeout, tipWindow, labelI18nService)
{
	var linkFunc = function(scope, elem, attr) { 
		scope.imgBasePath = CommonPath.imgBasePath;
		scope.imgLightBasePath = CommonPath.imgLightBasePath;
		scope.IMAGES = IMAGES;
		scope.error = {};
		scope.imgDialog = SettingService.imgDialog;
		scope.labelService = labelService;
		scope.config = labelService.config;
		scope.info = labelService.config.modelInfo;
		scope.chooseTitleTxt = "";
		
		scope.$watch(function() {
			return {
				isBoxShow: scope.imgDialog.showImgBox,
				indicator: scope.info.indicator,
				dimension: scope.info.dimension
			};
		}, function(newVal, oldVal) {
			if(newVal == oldVal) {
				return;
			}
			
			if(newVal.isBoxShow) {
				scope.error.add = "";
			}
			
			if(newVal.isBoxShow == oldVal.isBoxShow) {
				return;
			}
			
		}, true);
		
		scope.getUploadTips = function() {
			return isChromeBrowser() ? " " : "";
		};
		
		scope.translateDimLabel = function() {
			var label = scope.imgDialog.label;
			if(!label) {
				return "";
			}
			
			if(label.type === LabelType.USER) {
				return $translate.instant("i18n.setting.upload.dimension.user");
			}
			else if(label.type === LabelType.APP) {
				return $translate.instant("i18n.setting.upload.dimension.app");
			}
			else {
				return "";
			}
		};
		
		scope.translateIndicatorLabel = function() {
			var label = scope.imgDialog.label;
			if(!label) {
				return "";
			}
			
			if(label.type === LabelType.KQI) {
				return $translate.instant("i18n.setting.upload.indicator.kqi");
			}
			else {
				return $translate.instant("i18n.setting.upload.indicator");
			}
		};
		
		scope.dimensionChanged = function() {
			var label = scope.imgDialog.label;
			
			if(label.type !== LabelType.USER) {
				return;
			}
			
			$timeout(function() {
				$("#Indicator_select").change();
			}, 100);
		};
		
		/**
		 * 获取预览图片url
		 */
		scope.getPreviewImgUrl = function() {
			var label = scope.imgDialog.label;
			
			if (label == null) {
				return "";
			}
			
			//设置弹窗title
			scope.chooseTitleTxt = "i18n.setting.group." + label.type;
			if(label.type === LabelType.KQI) {
				scope.chooseTitleTxt = "i18n.setting.group.kqi";
			}
			
			if (label.iconUrl === "base64") {
				return label.iconData;
			}
			
			var type = label.type;
			var imageKey = "";
			
			if(type === LabelType.KQI) {
				imageKey = scope.info.indicator;
			}
			else if(type === LabelType.APP) {
				imageKey = scope.info.indicator + "_" + scope.info.dimension.appId;
			}
			else if(label.base) {
				imageKey = scope.info.text;
			}
			else {
				imageKey = getCustomerUserLabelKey(label);
			}
			
			if(IMAGE_PATH[imageKey]) {
				return IMAGE_PATH[imageKey];
			}
			else {
				return scope.imgLightBasePath + getDefaultLabelIcon(label);
			}
		};
		
		/**
		 * 设置user类型自定义标签的默认logo
		 */
		function getCustomerUserLabelKey(label) {
			var dim = scope.info.dimension;
			
			if (dim.catId === Constant.VVIP_GROUP_CATID) { 
				return Constant.VVIP_GROUP;
			}
			else if(dim.catId === Constant.HIGH_LOW_VALUE_CATID) {
				if(dim.id === Constant.HIGHVALUE_ID) {
					return Constant.HIGH_VALUE;
				}
				else if(dim.id === Constant.LOWVALUE_ID) {
					return Constant.LOW_VALUE;
				}
			}
		}
		
		/**
		 * 获取标签的的默认logo
		 */
		function getDefaultLabelIcon(label) {
			var labelType = label.type;
			var labelIcon = label.iconUrl;
			
			if (labelType === LabelType.USER) {
				labelIcon = IMAGES.label_user_default;
			}
			else if (labelType === LabelType.APP) {
				labelIcon = IMAGES.label_psVolume;
			}
			else //KQI
			{
				labelIcon = IMAGES.label_index_default;
			}
			
			return labelIcon;
		}
		
		/**
		 * 点击取消按钮触发事件
		 */
		scope.cancel = function(){
			scope.imgDialog.showImgBox = false;
			SettingService.changedImg.imgUrl = "";
		};
		
		/**
		 * 纬度下拉框是否显示
		 */
		scope.dimensionSelectVisiable = function() {
			return scope.imgDialog.label && scope.imgDialog.label.type !== LabelType.KQI && !scope.imgDialog.label.base;
		};

		function fixLabelName(label) {
			if (scope.config.nowType === LabelType.KQI){
				var indis = scope.labelService.getIndicators();
				
				for (var i in indis) {
					if (indis[i].id === scope.info.indicator) {
						label.idVal = indis[i].id;
						label.name = indis[i].label;
						break;
					}
				}
			}
			else if (scope.config.nowType === LabelType.USER && scope.imgDialog.label.base) {
				label.idVal = SettingService.imgDialog.label.text;
				label.name = SettingService.imgDialog.label.label;
			}
			else{
				label.idVal = scope.info.dimension.name;
				label.name = scope.info.dimension.name;
			}
		}
		
		function fixLabelIconUrl(label) {
			var imgUrl = scope.getPreviewImgUrl();
			
			if(imgUrl.indexOf("data:image") === 0) {
				label.iconUrl = imgUrl;
			}
			else {
				label.iconUrl = imgUrl.substring(scope.imgLightBasePath.length, imgUrl.length);
			}
		}
		
		/**
		 * 点击保存按钮触发事件
		 */
		scope.confirm = function() {
			var label = {
			    belongModule: scope.config.nowType,
			    iconUrl: scope.imgDialog.label.iconUrl,
			    iconData : scope.imgDialog.label.iconData,
			    dimension: (typeof scope.info.dimension === "object") ? angular.toJson(scope.info.dimension) : scope.info.dimension,
			    indicator: scope.info.indicator
			};
			
			var oldLabelName = scope.imgDialog.label.text; //获取更新前旧的标签ID
			fixLabelName(label);
			fixLabelIconUrl(label);
			
			if (scope.config.nowType === LabelType.APP) {
				label.dimension = scope.info.dimension.appId;
			}
			
			function confirmCallBack(data, needRefreshWorkbench) {
				if (data.data.state === "0") {
					scope.imgDialog.showImgBox = false;
					SettingService.refreshData();
					
					if (needRefreshWorkbench) {
						TabService.refreshData();
					}
				}
				else {
					scope.error.add = data.data.errMsg;
				}
			}
			
			label.name = labelI18nService.getLocaleName(label.indicator, "en_US");
			if (SettingService.imgDialog.addFlag) {//add
				labelService.addLabel({
					label: angular.toJson(label)
				}).then(confirmCallBack);
			}
			else {//update
				if (scope.config.nowType === LabelType.USER && scope.imgDialog.label.base) {
					label.dimension = SettingService.imgDialog.label.dimension;
				}
				
				labelService.updateLabel({
					label: angular.toJson(label),
					oldLabelName: oldLabelName
				}).then(function(data) {
					confirmCallBack(data, true);
				});
			}
		};
		
		/**
		 * 当用户选择自定义的图片后触发事件，检查上传图片的大小和是否是非法文件
		 */
		scope.imageUpload = function(event){
			scope.$apply(function() {
			var file = event.target.files[0];

			if (!/image\/\w+/.test(file.type)) { //匹配 image/(数字，字母，下划线)一次或多次
			tipWindow.show(true, true, false, $translate.instant("i18n.setting.upload.image.rule"));
			}else if (file.size > (1024*1024*3)) {
				tipWindow.show(true, true, false, $translate.instant("i18n.setting.upload.image.rule"));
			}else{
				var reader = new FileReader();
				reader.onload = function(event){
					scope.$apply(function() {
						scope.imgDialog.label.iconUrl = 'base64';
						scope.imgDialog.label.iconData = event.target.result;
						$("#imageFile").val("");
					});
				};
				reader.readAsDataURL(file);
			}
				$('#imageFile').val('');
			});
		};
		var lastVisitTime = +new Date();
		scope.singleCilck = function(event){
			var currentVisitTime = +new Date();
			if(currentVisitTime -lastVisitTime  < 300){
				lastVisitTime = currentVisitTime;
				event.preventDefault();
				return false;
			}else{
				lastVisitTime = currentVisitTime;
			}
		};
		
		$("#Dimension_Select").select2({minimumResultsForSearch:4});
		$("#Indicator_select").select2({minimumResultsForSearch:4});
	};

	return {
		restrict : "E",
		replace : true,
		scope : {
		},
		link : linkFunc,
		template : '<div class="modelColorBg" id="chooseImg_root" ng-show="imgDialog.showImgBox">'+
	'<div class="row colorChoose_context" id="chooseImg_colorChoose_contex">'+
		'<div class="text-center img_listBox" id="chooseImg_listBox">'+
			'<div class="chooseImgTitle" id="chooseImgTitle">'+
				'<span id="chooseImgTitleTxt" class="chooseImgTitleTxt">{{chooseTitleTxt | translate}}</span>'+
			'</div>'+
			'<div class="clearfix selectListBox">'+
				'<div class="previewImg clearfix" id="chooseImg_root_previewImg" style="float: right;">'+
					'<span id="chooseImg_root_previewImg_span" class="visiteChooseImg">'+
						'<img id="previewImg" alt="Icon" ng-src="{{getPreviewImgUrl()}}">'+
						'<input id="imageFile" class="fileUpload" name="imageFile" type="file" ondblclick="return false;"'+
						'onclick="angular.element(this).scope().singleCilck(event);" title="{{getUploadTips()}}"'+
						'accept="image/gif,image/jpeg,image/jpg,image/png,image/svg,image/bmp,image/psd,image/tif" onchange="angular.element(this).scope().imageUpload(event)" />'+
						'<span id="penIcon" class="penIcon" alt="penIcon" ng-src="{{imgBasePath + IMAGES.ic_image_edit}}"></span>'+
					'</span>'+
					'<h1 class="previewImg_px">68脳68</h1>'+
				'</div>'+
				'<div class="selectList clearfix"  style="float: left;">'+
					'<div style="text-align: right; margin: 0 0 2rem 0;" ng-show="dimensionSelectVisiable()">'+
						'<span class="icon_lable">{{translateDimLabel()}}锛�</span>'+
						'<select id="Dimension_Select" class="Dimension" ng-model="info.dimension" ng-change="dimensionChanged()">'+
							'<option ng-value="dim" ng-repeat="dim in config.dimensions">{{dim.name | translate}}</option>'+
						'</select>'+
						'<span ng-bind="error.dimension" style="color: red;"></span>'+
					'</div>'+
					'<div style="text-align: right; margin: 0 0 2rem 0;" ng-show="!imgDialog.label.base">'+
						'<span class="icon_lable">{{translateIndicatorLabel()}}锛�</span>'+
						'<select id="Indicator_select" class="Indicator" ng-model="info.indicator">'+
							'<option ng-value="ica.id" ng-repeat="ica in labelService.getIndicators()">{{ ica.label | translate}}</option>'+
						'</select>'+
						'<span ng-bind="error.indicator" style="color: red;"></span>'+
					'</div>'+
				'</div>'+
			'</div>'+
				'<span style="color: red;">{{error.add | translate}}</span>'+
			'<div class="colorChoose-btn" id="chooseImg_root_colorChoose-btn">'+
				'<input class="btnSubmit" type="button" value=" {{ \'i18n.dialog.preservation\' | translate}}" ng-click="confirm();" id="chooseImg_root_colorChoose-btn_Confirm" />'+
				'<input class="btnModel" type="button" value="{{ \'i18n.dialog.cancel\' | translate}}" ng-click="cancel();" id="cancel_btn2" />'+
			'</div>'+
		'</div>'+
	'</div>'+
'</div>'

	};
}]);