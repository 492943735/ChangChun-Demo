var mainApp = angular.module("main");
var SELECT= new Array(),numSelect=0;//保存展示多边形的数据

/*上方页签切换的选项卡*/
mainApp.controller("myCtrls",["$scope","gisMapService","TabService",function($scope,gisMapService,TabService) {
		$scope.pageSwitch = function(index){
			if(gisMapService.getActivedMapModel().icaAreas.length>0){
				$scope.Community=TabService.arrShowCommunity;
			}else{
				$scope.Community=TabService.communityLabelData;
			}
			if(index==2){
				angular.element(angular.element(".searchItem")[0]).removeClass("selectIndex");
				angular.element(angular.element(".searchItem")[1]).addClass("selectIndex");
				angular.element("#cityType").css({"display":"none"});
				angular.element("#AreaClick").css({"display":"block"});
				var str="";
				for(var i=0;i<$scope.Community.length;i++){
					if(!$scope.Community[i].checked){
						str+=($scope.Community[i].name+",");
					}
				}
				str=str.slice(0,str.length-1);
				angular.element(".area_text").val(str);
				angular.element(".area_text").attr("title",str);
			}else{
				angular.element(angular.element(".searchItem")[1]).removeClass("selectIndex");
				angular.element(angular.element(".searchItem")[0]).addClass("selectIndex");
				angular.element("#cityType").css({"display":"block"});
				angular.element("#AreaClick").css({"display":"none"});
			}
		}
}]);
/*社区选项逻辑 */
mainApp.controller("myCtrl",["$scope","gisMapService","TabService","MenubarService",function($scope,gisMapService,TabService,MenubarService) {
		
		if(gisMapService.getActivedMapModel().icaAreas.length>0){
			$scope.Community=TabService.arrShowCommunity;
		}else{
			$scope.Community=TabService.communityLabelData;
		}
		/*
		 下拉框展示还是隐藏
		 * */
		$scope.showpanal=false;
		$scope.select_panel = function(){
			$scope.showpanal=!$scope.showpanal;
			if($scope.showpanal){
				angular.element(".seachId").css({"display":"none"});
			}
		}
		/*
		 * 复选框选择事件
		 * @index 选择的下拉的下标
		 * @e 目标事件
		 */
		$scope.select_p = function(index,e){
			var str="";
			$scope.Community[index].checked = !$scope.Community[index].checked;
			if($scope.Community[index].checked){
				if(TabService.communityScreenId.length >1){
					var arrCope=[];
					for(var a=0;a<TabService.communityScreenId.length;a++){
						TabService.communityScreenId.splice(TabService.communityScreenId.indexOf($scope.Community[index].CommunityID),1)
						break;
					}
				}else{
					TabService.communityScreenId=[];
				}
			}else{
				TabService.communityScreenId.push($scope.Community[index].CommunityID)
			}
			/*去重*/
			var tempData= [];
		    for(var l = 0; l < TabService.communityScreenId.length; l++) {
		      if(tempData.indexOf(TabService.communityScreenId[l]) == -1){
           		 tempData.push(TabService.communityScreenId[l]);
       		  }
		    }
			TabService.communityScreenId=tempData;
			
			for(var i=0;i<$scope.Community.length;i++){
				if(!$scope.Community[i].checked){
					str+=($scope.Community[i].name+",");
				}
			}
			if(TabService.communityScreenId.length!=0){
					var selectPanelData=[];
					for(var ii=0;ii<$scope.Community.length;ii++){
						if(!$scope.Community[ii].checked){
							selectPanelData.push($scope.Community[ii]);
						}
					}
					gisMapService.drawRegion(selectPanelData);
			}else{
				//下方标签有选择但是一个都没选区域
				if(gisMapService.getActivedMapModel().icaAreas.length>0){
					var mapModel = gisMapService.getActivedMapModel();
					var communityName = mapModel.icaAreas[mapModel.icaAreas.length-1].text;
	 				gisMapService.communityDataShow(communityName,TabService);
				}else{//下方标签无选择
					var selectPanelData=[];
					for(var ii=0;ii<$scope.Community.length;ii++){
						if(!$scope.Community[ii].checked){
							selectPanelData.push($scope.Community[ii]);
						}
					}
					gisMapService.drawRegion(selectPanelData);
				}
			}
			str=str.slice(0,str.length-1);
			angular.element(".area_text").val(str);
			angular.element(".area_text").attr("title",str);
			$scope.$watch("$scope.Community[index].checked", function(ol,nv) {
				if(TabService.communityScreenId.length==0){
					$scope.Community=TabService.communityLabelData;
					MenubarService.menusData[8].isActive = true;
				}
			});
		}
		/*搜索框确定按钮事件
		 * 高亮小区
		 * 定位中心点
		 * */
		$scope.seachSumits = function(){
			for(var p=0;p<$scope.Community.length;p++){
				if(TabService.communityScreenId.length==0){
					$scope.Community[p].communityColor="rgba(255,255,255,0.3)";
				}
				
				if($scope.Community[p].name==angular.element("#seachId").val() && !$scope.Community[p].checked){
					fusiongis.Map.setMapCenter({
								coordinate:[$scope.Community[p].CommunityCenter.split(",")[0]*1,$scope.Community[p].CommunityCenter.split(",")[1]*1],//[67.06773,24.89452],
								mapId : "gisMapTotal",
					});
					$scope.Community[p].communityColor="#99ff99";
				}else{
					$scope.Community[p].communityColor="rgba(255,255,255,0.3)";
				}
			}
			//重新绘制小区
			var highLinght=[];
			for(var ps=0;ps<$scope.Community.length;ps++){
				if(!$scope.Community[ps].checked){
					highLinght.push($scope.Community[ps]);
				}
			}
			gisMapService.drawRegion(highLinght);	
		}
		/*
		 * 搜索框搜索的时候键盘弹起事件
		 */
		$scope.seachKeyUp= function(){
			var searchList=[];
			for(var dd=0;dd<$scope.Community.length;dd++){
				if($scope.Community[dd].name.indexOf(angular.element("#seachId").val())!=-1 && !$scope.Community[dd].checked){
					searchList.push($scope.Community[dd].name);
				}
			}
			if(angular.element("#seachId").val()==""){
				searchList=[];
				angular.element(".seachId").css({"display":"none"});
			}
			if(searchList.length!=0){
				angular.element(".seachId").css({"display":"block"});
			}
			$scope.searchList=searchList;
		}
		/*
		 * 搜索框下拉选项的点击事件
		 * */
		$scope.searchListClick=function(index,e){
			angular.element("#seachId").val(e.target.innerHTML.trim());
			angular.element(".seachId").css({"display":"none"});
		}
}]);
/*选择区域数据的读取*/ 
mainApp.controller("polygonsss", function($scope) {
	Papa.parse("data/showPolygon.csv",{
		download: true,
		complete: function (results) {
			 for(var a=0;a<results.data.length;a++){
			 	var legData=""
				for(var s=0;s<results.data[a].length;s++){
					if(a != 0 && a!= (results.data.length-1)){
						legData=(results.data[a][1]+"@"
						+results.data[a][2]+"@"+
						results.data[a][3]+"@"+
						results.data[a][4]+"@"+
						results.data[a][5]+"@"+
						results.data[a][6])
						var leg=({
							"name": results.data[a][0],
							"data":legData
						}); 
					}
				}
				if(a != 0 && a!= (results.data.length-1)){
					if(numSelect !=0 ){  //避免一直累加因为每次数据都会添加数组对象
						SELECT.push(leg);
						SELECT.pop();
					}else{
						SELECT.push(leg);
					}
				}
			}
			if(SELECT[0]==="undefined" ||SELECT[0]===undefined){
					SELECT=SELECT.splice(0,1);
			}
			numSelect=SELECT.length;
		}	
	});
	$scope.SELECT=SELECT;
});
mainApp.directive("menubar", ["CommonPath", "MenubarService", "gisMapService",
	function(CommonPath, MenubarService, gisMapService) {
		var linkFunc = function(scope, elem, attr) {
			scope.imgBasePath = CommonPath.imgBasePath;
			scope.IMAGES = IMAGES;
			scope.menus = MenubarService.menusData;
			/**
			 * 是否是单屏
			 */
			scope.isSingleScreen = function() {
				return !gisMapService.mapData.isDoubleScreen;
			};
		};

		return {
			restrict: "E",
			replace: true,
			scope: {},
			link: linkFunc,
			template: '<div id="rightTopTab">' +
				'<div class="head-small-tip" id="rightTopTab_img">' +
				'	<menubar-item ng-repeat="menu in menus" menu="menu"></menubar-item>' +
				'	</div>' +
				'<script type="text/ng-template" id="export.html">' +
				'	<div class="icon_up"></div>' +
				'	<div id="export" class="exportMenu">' +
				'		<div class="exampleTanChuContent" id="alertContent">' +
				'		<button class="new_Example" ng-click="exportData(\'xls\')" id="Excel" uib-tooltip="{{\'Excel\' | translate}}" style=\'display:block\'>' +
				'			<img ng-src="{{imgLightBasePath + IMAGES.excel}}" class="new_ExampleImg_light" id="Excel_img_light">' +
				'			<img ng-src="{{imgBasePath + IMAGES.excel}}" class="new_ExampleImg" id="Excel_img">' +
				'			<span id="ExcelSpan">{{"Excel" | translate }}</span>' +
				'		</button>' +
				'		<button class="new_CSV" ng-click="exportData(\'csv\')" id="CSV" uib-tooltip="{{\'CSV\' | translate}}">' +
				'			<img ng-src="{{imgLightBasePath + IMAGES.csv}}" class="CSVImg_light" id="CSV_img_light">' +
				'			<img ng-src="{{imgBasePath + IMAGES.csv}}" class="CSVImg" id="CSV_img">' +
				'			<span id="CSVSpan">{{"CSV" | translate }}</span>' +
				'		</button>' +
				'	</div>' +
				'	</div>' +
				'   </script>' +
				'  <script type="text/ng-template" id="polygon.html">' +
				'	<div class="icon_up"></div>' +
				'	<div id="polygon" class="polygonMenu">' +
				'		<div id="polygonBox" class="polygon">' +
				'			<button class="polygon_button" ng-click="drawPolygon()" id="Draw_Polygon" uib-tooltip="{{\'i18n.DrawPolygon\' | translate}}">' +
				'				<img ng-src="{{imgLightBasePath + IMAGES.polygonDraw}}" class="polygon_img_light" id="Draw_Polygon_img_light">' +
				'				<img ng-src="{{imgBasePath + IMAGES.polygonDraw}}" class="polygon_img" id="Draw_Polygon_img">' +
				'				<span id="Draw_Polygon_span">{{"i18n.DrawPolygon" | translate }}</span>' +
				'			</button>' +
				'			<button class="polygon_button" ng-click="removePolygon()" id="Remove_all" uib-tooltip="{{\'i18n.CleanPolygon\' | translate}}">' +
				'				<img ng-src="{{imgLightBasePath + IMAGES.polygonRemove}}" class="polygon_img_light" id="Remove_Polygon_img_light">' +
				'				<img ng-src="{{imgBasePath + IMAGES.polygonRemove}}" class="polygon_img" id="Remove_all_img">' +
				'				<span id="Remove_all_span">{{"i18n.CleanPolygon" | translate }}</span>' +
				'			</button>' +
				/*增加的展示多边形开始*/
				'			<button class="polygon_button" ng-click="showPolygon()" id="show_Polygon" uib-tooltip="展示多边形">' +
				'				<img ng-src="{{imgLightBasePath + IMAGES.polygonShow}}" class="polygon_img_light">' +
				'				<img ng-src="{{imgBasePath + IMAGES.polygonShow}}" class="polygon_img">' +
				'				<span id="Remove_all_span">展示多边形</span>' +
				'			</button>' +
				/*增加的展示多边形结束*/
				'		</div>' +
				'	</div>' +
				 /*展示多边形的条件开始*/
				'		<div id="polygonShowBox" style="position:absolute;display:none" ng-controller="polygonsss">'  +
				'			<button class="polygon_button" ng-repeat="areaSelects in SELECT" ng-click="showPolygonList($index,$event)">' +
				'			  <span ment={{areaSelects.data}}> {{areaSelects.name}}</span>' +
				'			</button>' +
				'		</div>' +
				'	<div class="icon_up1" style="display:none" id="polygonShowBoxicon"></div>' +
				/*展示多边形的条件结束*/
				'   </script>' +
				'   <script type="text/ng-template" id="save.html">' +
				'	<div class="icon_up"></div>' +
				'	<div id="polygon" class="polygonMenu">' +
				'		<div id="polygonBox" class="polygon">' +
				'			<button class="polygon_button" ng-click="openStory()" id="open_story" uib-tooltip="{{\'i18n.openStory\' | translate}}">' +
				'				<img ng-src="{{imgLightBasePath + IMAGES.openStory}}" class="polygon_img_light" id="open_story_img_light">' +
				'				<img ng-src="{{imgBasePath + IMAGES.openStory}}" class="polygon_img" id="open_story_img">' +
				'				<span id="open_story_span">{{"i18n.openStory" | translate }}</span>' +
				'			</button>' +
				'			<button class="polygon_button" ng-click="saveStory()" id="save_story" uib-tooltip="{{\'i18n.saveStory\' | translate}}">' +
				'				<img ng-src="{{imgLightBasePath + IMAGES.saveStory}}" class="polygon_img_light" id="save_story_img_light"> ' +
				'				<img ng-src="{{imgBasePath + IMAGES.saveStory}}" class="polygon_img" id="save_story_img"> ' +
				'				<span id="save_story_span">{{"i18n.saveStory" | translate }}</span>' +
				'			</button>' +
				'		</div>' +
				'	</div>' +
				'    </script>' +
				/*增加search框的样式*/
				' <script type="text/ng-template" id="search.html">'+
				'	<div class="icon_up"></div>'+
				'	<div id="search">'+
				'		<ul id="searchBox" class="polygon"  ng-controller="myCtrls">'+
				'			<li class="searchItem selectIndex" uib-tooltip="{{\'i18n.searcha\' | translate}}" ng-click="pageSwitch(1)">'+		
				'				<span>{{"i18n.searcha" | translate }}</span>'+
				'			</li>'+
				'			<li class="searchItem" uib-tooltip="{{\'i18n.searchb\' | translate}}" ng-click="pageSwitch(2)">'+
				'				<span>{{"i18n.searchb" | translate }}</span>'+
				'			</li>'+
				'           <div style="clear:both"></div>'+
				'		</ul>'+
				'       <ul class="cityType" id="cityType" style="display:block">'+
				'			<li class="cityName">城市:</li>'+
				'           <li class="citySelect">'+
				'				<label class="lblSelect">'+					
				'					<select id="search_but" ng-model="myValue">'+
				'                  	 	<option value="" selected>长春</option>'+
				'               	</select>'+
				'					<i class="fa fa-caret-down"></i>'+
				'				</label>'+	
				'			</li>'+
				'       </ul>'+
				'  <ul class="AreaClick" ng-show="true" ng-controller="myCtrl" style="display:none" id="AreaClick">'+
				'     <li>'+
			'				<span class="AreaName">社区:</span>'+
			'				<div  class="AreaSelect">'+	
			'					<i class="fa fa-caret-down select_button"></i>'+
			'					<input placeholder="请选择社区" readonly="true" class="area_text" ng-click="select_panel()"/>'+
			'					<div class="area_list" ng-show="showpanal" ng-scrollbar>'+
			'         				<p ng-repeat="areaSelect in Community">'+
			'							<span class="inputImg" ng-click="select_p($index,$event)">'+
			'								<i class="fa fa-check" ng-show="!areaSelect.checked"></i>'+
			'							</span>'+
			'							<span class="area_list_name">{{areaSelect.name}}</span>'+
			'						</p>'+
			'					</div>'+
			'				</div>'+
			'				<div class="clear"></div>'+
			'	  </li>'+
			'	  <li>'+
			'			<span class="AreaName">搜索:</span>'+	
			'			<div class="fuzzyQuery">'+
			'				<input placeholder="搜索..." type="text" class="AreaSelect area_search" ng-KeyUp="seachKeyUp()" id="seachId"/>'+
			'					<div class="seachId">'+
			'         				<p ng-repeat="SelectNAme in searchList" ng-click="searchListClick($index,$event)"> {{SelectNAme}}'+
			'						</p>'+
			'					</div>'+
			'			</div>'+
			'			<input type="submit" class="search_submit" value="提交" ng-click="seachSumits()"/>'+
			'	  </li>'+
			'  </ul>'+
			'	</div>'+ 
			'    </script>'+
			'</div>'
		};
	}
]);