$.workbenchData = {
	userType: {
		arr: [],
		name:[],
		data:[],
		conerImg:[],
		ifShow:[]
	}, //工作台数据中分类的整理
	itemsArray: ["DIY"], //故事线标签组的分类，目前只有DIY组
	/**
	 * @name setData 获取数据
	 * @param {Object} null
	 */
	setData: function() { //请求数据
		Papa.parse("data/cfg_control_lebel.csv", {
			download: true,
			complete: function(results) { //调用回调函数进行数据的处理
				$.workbenchData.setDataCallBack(results.data);
			}
		})
	},
	/**
	 * @name setDataCallBack 进行数据的初步处理
	 * @param {Object} data
	 */
	setDataCallBack: function(data) {
		var obj = {},
			arr = [];
		for(var i = 1; i < data.length; i++) {
			if(!data[i][0]) continue;
			var objData = {
				"text": data[i][0],
				"selected": true,
				"label": data[i][0],
				"data": {
					"data": data[i][6].replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,"),
					"unit": "",
					"day_Working":data[i][11].replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,"),
					"day_Rest":data[i][12].replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,"),
					"night_Working":data[i][13].replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,"),
					"night_Rest":data[i][14].replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,"),
				},
				"iconUrl": data[i][2],
				"type": data[i][1],
				"inRightSidebar": data[i][5] == "FALSE" ? false : true,
				"active": false,
				"color": null,
				"createdUser": null,
				"base": true,
				"iconData": null,
				"dimension": "{\"DAY\":\"SDR_CWR_ALL_USER_CELL_1DAY\",\"HOUR\":\"SDR_CWR_ALL_USER_CELL_HOUR\"}",
				"indicator": data[i][8],
				"vvipSingleUser": null,
				"msisdn": null,
				"ifExist":data[i][16] == "FALSE" ? false : true,//是否存在
				"checked":data[i][17] == "FALSE" ? false : true,//是否选中
			}
			if(!obj[data[i][1]]) {
				obj[data[i][1]] = {};
				obj[data[i][1]].data = [objData];
				obj[data[i][1]].name = data[i][1];
				obj[data[i][1]].userName = data[i][10];
				obj[data[i][1]].ifShow = false;
				obj[data[i][1]].img = data[i][15];
				this.userType.arr.push(data[i][1]);
				this.userType.name.push(data[i][10]);
				this.userType.conerImg.push(data[i][15]);
			} else {
				obj[data[i][1]].data.push(objData);
			}
		}
		this.userType.data = obj;
		var obj = {
			"shows":{},
			"hides":{},
		}
		for(var i = 0;i<this.userType.arr.length;i++){
			if(i<4){
				this.userType.ifShow.push(true);
				this.userType.data[this.userType.arr[i]].ifShow = true;
				obj.shows[this.userType.arr[i]] = this.userType.data[this.userType.arr[i]];
			}else{
				this.userType.ifShow.push(false);
				this.userType.data[this.userType.arr[i]].ifShow = false;
				obj.hides[this.userType.arr[i]] = this.userType.data[this.userType.arr[i]];
			}
		}
		this.userType.data = obj;
		return this.userType;
	},
};

