var letfBarApp = angular.module("sidebar.left");

letfBarApp.directive("homePage", [ "$timeout", "gisMapService",
		"TabService", "CommonPath", "LeftService","SettingService","$translate","MenubarService","$document",
		function($timeout, gisMapService, TabService, CommonPath, LeftService, SettingService, $translate, MenubarService, $document) {
			var linkFunc  = function(scope, elem, attr){
				scope.skipTopPage = function(){	
					
                    $("#top_menu")[0].contentWindow.initTopMenuPage();					
					readMenuUrlData();				
					$("#top_menu").css("display", "block");						
				};
				
			//获取菜单链接url   
				var cfg_menu_url_data=[];
				function readMenuUrlData(){
					$("#top_menu")[0].contentWindow.clearLi();
						cfg_menu_url_data=menu_url_info_data_zh;
						var num=0;
					for(var i=1;i<cfg_menu_url_data.length;i++){
						if(cfg_menu_url_data[i][0]){
						var style = "display:block; position:absolute;z-index:1;width:100%;height:100%;top: 1%;"												
							var style1 = "display:block; position:absolute;z-index:999;width:100%;height:100%;top: 1%;"
							num++;
							var iframe = document.createElement('iframe'); 
							iframe.src=cfg_menu_url_data[i][2]; 
							if(cfg_menu_url_data[i][1] == 1){
								iframe.style =style1;
							}else{
								iframe.style =style;
							}							
							iframe.id='top_iframe'+i ;														
							document.body.append(iframe);	
							if(cfg_menu_url_data[i][1] == 2){
								$("#top_menu")[0].contentWindow.createLi(i,cfg_menu_url_data[i][0]);
							}
							
								
						}
						
					}
					$("#iframeNum").val(num);
	
	}
		function activeTab() {
					if(TabService.isDiyTabActived()){
						MenubarService.resetAll();//reset
						MenubarService.setResetActive();//reset结束
					}
				}
			};
			
			var homepageTemplate = function (){
				if ("true" === topHomePageSwitch){
					return '<div id="topHomePage" class="homePageBox" ng-click="skipTopPage()">'+
					'<div class="toppage"></div>'+ 
					'</div>';
				}
				
				return '<div></div>';
			};
			
			return {
				restrict : "E",
				replace : true,
				scope : {},
				link : linkFunc,
				template : homepageTemplate
			};
		} ]);