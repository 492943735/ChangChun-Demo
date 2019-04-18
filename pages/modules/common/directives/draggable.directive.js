angular.module("common").service("DNDService", function() {
	var dragModel = null;
	
	function setDragModel(model) {
		dragModel = angular.copy(model);
	}
	
	function getDragModel() {
		return dragModel;
	}
	
	return {
		setDragModel: setDragModel,
		getDragModel: getDragModel
	}
})
.directive("draggable", ["DNDService", function(DNDService) {
	var linkFunc = function(scope, elem, attr) {
		var layer = "default";
		if(scope.dragOpts && scope.dragOpts.layer) {
			layer = scope.dragOpts.layer;
		}
		
		$(elem).draggable({
			appendTo: "body",   
			delay: 200,  //当鼠标点下后，延迟指定时间后才开始激活拖拽动作（单位：毫秒）。此选项可以用来防止不想要的拖累元素时的误点击。默认值  0
			distance: 2,  //当鼠标点下后，只有移动指定像素后才开始激活拖拽动作。默认值  1
			handle: elem.find(".drag_handle"),
			helper: function() {
				var elemCopy = angular.copy(elem);
				var jqElem = $(elemCopy);
				
				if(jqElem.hasClass("rightSideBarItem")) {
					var childs = jqElem.find(".new_rightsidebar_label").children();
					if(childs[1]) {
						$(childs[1]).remove();
					}
				}
				
				var widthText = "width:" + elem.outerWidth() + "px!important;";
				var heightText = "height:" + elem.outerHeight() + "px!important;";
				jqElem.css("cssText", widthText + heightText);
				
				if (!jqElem.hasClass("totalBox")) {
					jqElem.css("margin", "0");
				}
				
				return elemCopy;
			},
			opacity: 0.75,
			scope: layer, //设置元素只允许拖拽到具有相同scope值的元素。默认值  "default"
			zIndex: 10000, //拖动时，helper元素的css z-index值。
			create: function(event, ui) {
				
		    },
		    start: function(event, ui) {
				scope.$apply(function() {
					DNDService.setDragModel(scope.dragModel);
					scope.dragStart({event: event, ui: ui});
				});
		    },
		    drag: function(event, ui) {
		    	
		    },
		    stop: function(event, ui) {
		    	scope.$apply(function() {
					scope.dragStop({event: event, ui: ui, $dragModel: DNDService.getDragModel()});
				});
		    }
		});
		
		scope.$watch("dragEnable", function(newVal, oldVal) {
			$(elem).draggable("option", "disabled", !scope.dragEnable);
			
			if(!newVal) {
				$(elem).css("opacity", "inherit");
			}
		});
	};
	
	return {
		restrict: "A",
		scope: {
			dragEnable: "=",
			dragModel: "=",
			dragStart: "&",
			dragStop: "&",
			dragOpts: "="
		},
		link: linkFunc
	};
}]);