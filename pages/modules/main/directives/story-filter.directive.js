var mainApp = angular.module("main");

mainApp.directive("storyFilter", ["RightSidebarService", "storyFilterService",  function(RightSidebarService, storyFilterService) {
	var linkFunc = function(scope,elem,attr){
		scope.data = storyFilterService.getFilterData();
		
		scope.addClick = function(filters) { //用户输入val做校验
			if(filters.length < 10) {
				var filter = {col: scope.data.cols[0].indicator, op: ">", val: "10", relation: "AND"};
				filters.push(filter);
			}
		};
		
		scope.isLastFilter = function(index) {
			return index === scope.data.filters.length - 1;
		}
		
		scope.deleteClick = function(filters, index) {
			if(scope.isLastFilter(index)) {
				filters.splice(index, 1);
			}
		};
	};
	
	return{
		restrict : "E",
		replace : true,
		scope : {
			menu : "="
		},
		link : linkFunc,
		template :'<div class="filterBox" id="main_filterBox_root">'+ 
	'<div class="filter-body">'+
		'<form name="filterForm" novalidate="novalidate">'+
			'<table border="1">'+
				'<thead>'+
					'<tr>'+
						'<td class="tablekey">{{"'+i18n.story.filter.field+'" | translate}}</td>'+
						'<td class="tablecount">{{"'+i18n.story.filter.operater+'" | translate}}</td>'+
						'<td class="tablevalue">{{"'+i18n.story.filter.value+'" | translate}}</td>'+
						'<td class="tableimpact">{{"'+i18n.story.filter.relation+'" | translate}}</td>'+
						'<td class="tableopereat">'+
							'<button class="btnModel" ng-click="addClick(data.filters)" ng-class="{btn_gray: data.filters.length>=10}">+</button>'+
						'</td>'+
					'</tr>'+
				'</thead >'+
				'<tbody>'+
					'<tr ng-repeat="filter in data.filters">'+
						'<td>'+
							'<select class="tableSelect" ng-model="filter.col">'+
								'<option ng-repeat="col in data.cols track by $index" value="{{col.indicator}}">{{'+col.label+'}}</option>'+
							'</select>'+
						'</td>'+
						'<td>'+
							'<select class="tableSelect countSelect" ng-model="filter.op">'+
								'<option ng-repeat="op in data.ops" value="{{op}}">{{'+op+'}}</option>'+
							'</select>'+
						'</td>'+
						'<td>'+
							'<input class="tableInput" type="text" ng-model="filter.val" number-check'+
								'placeholder="{{"'+i18n.story.filter.value.tips+'" | translate}}" />'+
						'</td>'+
						'<td>'+
							'<select class="tableSelect countSelect" ng-model="filter.relation">'+
								'<option ng-repeat="relation in data.relations" value="{{relation}}">{{'+relation+'}}</option>'+
							'</select>'+
						'</td>'+
						'<td>'+
							'<button class="btnModel" ng-click="deleteClick(data.filters, $index)" ng-class="{btn_gray: !isLastFilter($index)}">-</button>'+
						'</td>'+
					'</tr>'+
				'</tbody>'+
			'</table>'+
		'</form>'+
	'</div>'+
'</div>'
	};
}]);
