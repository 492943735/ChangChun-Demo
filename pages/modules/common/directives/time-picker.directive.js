angular.module("common").directive("timePicker", ["$timeout", function($timeout) {
	var linkFunc = function(scope, elem, attr) {
		function getHourItem(hourText) {
			var index = getHourItemIndex(hourText);
			
			return scope.hourItems[index];
		}
		
		function getHourItemIndex(hourText) {
			var hourItems = scope.hourItems;
			
			for(var i = 0; i < hourItems.length; i++) {
				if(hourItems[i].hour === hourText) {
					return i;
				}
			}
		}
		
		/**
		 * 当前小时是否能够选择
		 */
		scope.canSelect = function(item) {
			var maxItem = getHourItem(scope.max);
			var minItem = getHourItem(scope.min);
			return true;
		};
		
		/**
		 * 改变选中状态
		 */
		scope.timeSelected = function(item) {
			if(scope.canSelect(item)) {
				scope.usedHour = item.hour;
			}
		};
		
		/**
		 * 打开小时粒度选择框
		 */
		scope.timeClickOpen = function() {
			scope.timeListShow = !scope.timeListShow;
			
			$timeout(function() {
				var timeBody = $(".timeShowBox");
				var timeBodyHeight = timeBody.outerHeight()
				timeBody.css("top","-" + (timeBodyHeight - 1) + "px");
			}, 10);
		}
		
		/**
		 * 切换到上一个小时
		 */
		scope.preHour = function() {
			var maxIndex = getHourItemIndex(scope.max);
			var selIndex = getHourItemIndex(scope.usedHour);
			
			if (selIndex < maxIndex) {
				var preItem = scope.hourItems[selIndex + 1];
				scope.usedHour = preItem.hour;
			}
		};
		
		/**
		 * 切换到下一个小时
		 */
		scope.nextHour = function() {
			var minIndex = getHourItemIndex(scope.min);
			var selIndex = getHourItemIndex(scope.usedHour);
			
			if (selIndex > minIndex) {
				var nextItem = scope.hourItems[selIndex - 1];
				scope.usedHour = nextItem.hour;
			}
		};
		
		/**
		 * 点击ok按钮触发事件
		 */
		scope.submitHour = function() {
			scope.timeListShow = false;
			if(scope.onSure) {
				scope.onSure({selHour: scope.usedHour});
			}
		}
		
		scope.getItemText = function(item) {
			var text = item.hour.substring(0, 2);
			
			if(text.indexOf("0") == 0) {
				text = text.substring(1, 2);
			}
			
			return text;
		};
		
		scope.selItemText = function() {
			var selItem = getHourItem(scope.usedHour);
			
			return selItem.hour.substring(0, 2);
		};
		
		/**
		 * 关闭小时粒度选择框
		 */
		$("#ui-datepicker-div").on("click", function(event) {
            var evt = event.srcElement ? event.srcElement : event.target;
            if(evt.id != "timepickHour") {
                scope.timeListShow = false;
            }
        })
	};
	
	return {
		restrict: "E",
		replace: false,
		scope: {
			hourItems: "=hours",
			min: "=",
			max: "=",
			usedHour: "=",
			timeListShow: "=",
			onSure: "&"
		},
		link: linkFunc,
		template: "<div class='timeBody'>"+
	"<span class='timeTitle'>Time</span>"+
	"<div class='timeInput'>"+
		"<ul class='timeShowBox' ng-show='timeListShow'>"+
			"<li class='timeStyle' ng-click='timeSelected(item)' ng-repeat='item in hourItems' ng-class='{timeSlected: item.hour == usedHour, timeSelectedDisable: !canSelect(item), canTimeStyle: canSelect(item)}'>"+
				"{{getItemText(item)}}"+
			"</li>"+
		"</ul>"+
		"<span class='timePickClick'>"+
			"<div class='timePickInput'>"+
				"<span class='timepickHour' id='timepickHour' ng-click='timeClickOpen()'>{{selItemText()}}</span>"+
				"<span class='timepickMs'>:00:00</span>"+
			"</div>"+
		"</span>"+
		"<div class='timeBtnChange'>"+
			"<span class='timePickPrevious' ng-click='preHour()'></span>"+
			"<span class='timePickNext' ng-click='nextHour()'></span>"+
		"</div>"+
	"</div>"+
	"<div class='timeSubmitBox'>"+
		"<button class='timeSubmitBtn' ng-click='submitHour()'>OK</button>"+
	"</div>"+
"</div>"
	}
}]);