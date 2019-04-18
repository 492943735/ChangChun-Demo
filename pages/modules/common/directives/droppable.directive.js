angular.module("common").directive("droppable", ["DNDService", function(DNDService) {
	var linkFunc = function(scope, elem, attr) {
		var layer = "default";
		var hoverClass = "drop-hover";
		
		if(scope.dropOpts && scope.dropOpts.layer) {
			layer = scope.dropOpts.layer;
		}
		
		if(scope.dropOpts && (scope.dropOpts.hoverClass === false || scope.dropOpts.hoverClass)) {
			hoverClass = scope.dropOpts.hoverClass;
		}
		
		$(elem).droppable({
			accept: function(locals) {
				var accVal = scope.accept({dragElem: locals.context});
				
				if(typeof accVal === "boolean") {
					return accVal;
				}
				
				return true;
			},
			hoverClass: hoverClass,
			scope: layer, //设置元素只允许具有相同scope值拖拽元素激活此拖放元素。默认值  "default"
			tolerance: "pointer", 
		    create: function(event, ui) {
		    },
		    activate: function(event, ui) {
		    },
		    deactivate: function(event, ui) {
		    },
		    over: function(event, ui) {
		    	scope.$apply(function() {
		    		var dragModel = DNDService.getDragModel();
		    		scope.dragOver({event: event, ui: ui, $dragModel: dragModel});
		    	});
		    },
		    out: function(event, ui) {
		    	scope.$apply(function() {
		    		var dragModel = DNDService.getDragModel();
		    		scope.dragOut({event: event, ui: ui, $dragModel: dragModel});
		    	});
		    },
		    drop: function(event, ui) {
		    	scope.$apply(function() {
		    		var dragModel = DNDService.getDragModel();
		    		scope.onDrop({event: event, ui: ui, $dragModel: dragModel});
		    	});
		    }
		});
	};
	
	return {
		restrict: "A",
		scope: {
			onDrop: "&",
			dragOver: "&",
			dragOut: "&",
			accept: "&",
			dropOpts: "="
		},
		link: linkFunc
	};
}]);