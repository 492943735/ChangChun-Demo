angular.module("main").factory("gisMapService", ["$http", "tipWindow", "$filter", "FloatmessageService", "CommonPath", "LeftService", "loadingInterceptor", "$timeout", "$translate",
	function($http, tipWindow, $filter, FloatmessageService, CommonPath, LeftService, loadingInterceptor, $timeout, $translate) {
		var imgBasePath = CommonPath.imgBasePath;
		//google地图是否配置
		var googleMap = userConfig.mainMap.mapType == Constant.GOOGLE_TYPE;
		//离线地图是否配置
		var isOfflineMap = userConfig.mainMap.mapType == Constant.OFFLINE_TYPE;
		var activedTabText = "DIY";
		var rsrpIndi = "";
		var rsrpUnit = "";
		var sendTypeOfRight = {};
		//存all小区
		var cellTotals = [];
		var readcsvData = {
			sdr_data_user: [],
			sdr_data_kqi: [],
			sdr_data_kpi: [],
			cfg_kqi_threshold: []
		};
		var sdr_data_user = [];
		var sdr_data_kqi = [];
		var sdr_data_kpi = [];
		var cfg_story_lebel = [];
		var cfg_kqi_threshold = [];
		var GisView = function(mapModel, afterMapCreateCallback) {
			var renderToId = mapModel.renderToId;
			var gisMapId = mapModel.gisMapId;
			var defaultParams = mapModel.params;
			var tabServiceCopy = null; //TODO： 保存tabService中的数据以及方法用来在gisMapService中调用，每次点击或者拖拽标签打点之后刷新数据
			this.polygonData = [];
			this.effectMapList = [];
			this.currentCellData = [];
			this.isDuringDraw = false;
			this.renderToId = renderToId;
			this.gisMapId = gisMapId;
			this.polygonActionEffectMap = [];
			this.imgToken = "";
			this.backendRenderCellCount = 0;
			this.backendCellLayerId = renderToId + "_service_polygon";
			this.backendCellImageToken = "";
			this.backendRasterLayerId = renderToId + "_backend_raster";
			this.rasterLayerId = renderToId + "_wms_raster";
			this.rasterLayerMapName = "";
			this.accessData = angular.copy(accessData);
			this.locationData = generateLocationMarkData();
			var me = this;

			this.thresholdData = null;
			this.thresholdDataCopy = null;
			this.isPreViewState = false;

			this.getDay = function() {
				var dayStr = mapModel.time;
				if (dayStr.indexOf("#") != -1) {
					dayStr = dayStr.split("#")[0];
				}
				return dayStr;
			};

			this.reset = function() {
				this.refreshCell();
				this.resetMarkLayer();
				resetAccessData(this.accessData);
				resetLocationMarkData(this.locationData);
				mapModel.icaAreas = [];
				fusiongis.Popup.removePopup(mapData.activedMap.gisMap.renderToId);
			};

			this.cellInfoIsNotEmpty = function() {
				if (this.currentCellData == null || this.currentCellData.length == 0) {
					return false;
				} else {
					return true;
				}
			};
			this.getMapCenter = function() {
				var zoom = fusiongis.Map.getZoom(this.renderToId);
				var center = fusiongis.Map.getCenter(this.renderToId);
				return {
					coordinate: center,
					zoom: zoom
				};
			};
			this.setMapCenter = function(params) {
				params.mapId = this.renderToId;
				fusiongis.Map.setMapCenter(params);
			};

			this.setPolygonData = function(polygonDataNew) {
				if (polygonDataNew.length >= 3) {

					this.clearCircle();
					this.polygonData = angular.copy(polygonDataNew);
					var layer = fusiongis.OlUtil.getLayer({
						mapId: renderToId,
						layerId: mapModel.pologonLayerId + '_' + renderToId
					});
					if (!layer) {
						fusiongis.Polygon.addLayer({
							mapId: renderToId,
							layerId: mapModel.pologonLayerId,
							defaultVisibleLevel: 3,
							datas: [{
								coordinates: this.polygonData,
								fillColor: 'rgba(255,255,255,0.3)',
								strokeColor: 'rgba(255,255,255,1)',
								strokeWidth: 2,
								label: '',
								id: mapModel.pologonLayerId + '_content'
							}]
						});
					}
					fusiongis.Polygon.setLayerData({
						mapId: renderToId,
						layerId: mapModel.pologonLayerId,
						datas: [{
							coordinates: this.polygonData,
							fillColor: 'rgba(255,255,255,0.3)',
							strokeColor: 'rgba(153,0,255,1)',
							strokeWidth: 2,
							label: '',
							id: mapModel.pologonLayerId + '_content'
						}]
					});
					var zIndexCell = fusiongis.BaseLayer.getLayerZIndex({
						"mapId": renderToId,
						"layerId": mapModel.gisMapId + "_cell"
					});
					var zIndexService = fusiongis.BaseLayer.getLayerZIndex({
						"mapId": renderToId,
						"layerId": mapModel.pologonLayerId
					});
					if (!zIndexCell) {
						zIndexCell = 100;
					}
					if (!zIndexService) {
						zIndexService = 100;
					}

					var zIndex = zIndexCell;
					if (zIndexService > zIndex) {
						zIndex = zIndexService;
					}

					zIndex += 1;
					fusiongis.BaseLayer.setLayerZIndex({
						"mapId": renderToId,
						"layerId": mapModel.pologonLayerId,
						"zIndex": zIndex
					});
					fusiongis.BaseLayer.registerClick({ //多边形图层注册点击事件
						mapId: mapModel.renderToId,
						layerId: mapModel.pologonLayerId,
						callbackfunc: function(_paramObj) {
							var _featureCenter = fusiongis.OlUtil.transform(_paramObj.e.coordinate, "EPSG:3857", "EPSG:4326");
							var cellPoint = {
								X: _featureCenter[0],
								Y: _featureCenter[1]
							};
							if (_paramObj.businessType !== fusiongis.Constant.BUSINESSTYPE.POLYGON) {
								//点击空白处， 清除弹出窗
								if (mapData.wholeMap.isLock == true && (mapData.wholeMap.renderToId == _paramObj.mapId)) {
									return;
								} else {
									fusiongis.Popup.removePopup(renderToId); //清除弹出窗
								}
								return;
							}
							if (mapModel.gisMap.polygonData.length > 0 && mapData.activedMap.gisMap.choosePolygonCell(cellPoint, mapModel.gisMap.polygonData) == true) {
								//DEMO:
								_paramObj.activedTab = activedTabText;
								_paramObj.cellTotals = cellTotals;
								FloatmessageService.popMapWindow(_paramObj, mapModel, mapData);
							}
						}
					});
				} else {
					this.clearCircle();
				}
			};

			this.removePopupWindow = function() {
				fusiongis.Popup.removePopup(this.renderToId);
			};

			this.defaultEventBind = function() {
				//为OSM地图配色
				if (userConfig.mainMap.mapType == Constant.OSM_TYPE) { //判断为OSM地图的时候
					var osmTools = { //配色算法和规定参数
						filterType: 'teal', //默认的几种配色方案之一
						mapId: renderToId, //fusiongis.Map.createMap 中设置的当前图层ID
						layerId: 'base_layer', //不用改变该值
						isCustom: true, //此处为 false 则使用 teal 配色，为true则使用下方 layerRenderEnd 的配色
						layerRenderEnd: function(context) { //传入的context 为 canvas 画布控制器
							var canvas = context.canvas;
							var width = canvas.width;
							var height = canvas.height;
							var imageData = context.getImageData(0, 0, width, height);
							var pix = imageData.data;
							var _rateR = 0.02;
							var _rateG = 0.215;
							var _rageB = 0.545;

							for (var i = 0, n = pix.length; i < n; i += 4) {
								var r = pix[i + 0];
								var g = pix[i + 1];
								var b = pix[i + 2];
								// CIE luminance for the RGB
								var v = _rateR * r + _rateG * g + _rageB * b;
								if (v === 0) { //map_backgroundColor
									pix[i + 0] = 28; // Red
									pix[i + 1] = 58; // Green
									pix[i + 2] = 68; // Blue
									pix[i + 3] = 255; // Alpha
								} else { //mapColor
									pix[i + 0] = 190 - v; // Red
									pix[i + 1] = 220 - v; // Green
									pix[i + 2] = 230 - v; // Blue
									pix[i + 3] = 255; // Alpha		            	
								}
							}
							context.putImageData(imageData, 0, 0);
						}
					};
					fusiongis.ImageFilter.setImageFilter(osmTools); //给OSM地图使用配色
				}

				if (this.renderToId === "gisMapTotal") {
					setInterval(function() {

						//如果地图自定义配置中没有配置相应的元素则不进行限制
						if (defaultParams.minMainMapLongitude === "" || defaultParams.maxMainMapLongitude === "" ||
							defaultParams.minMainMapLatitude === "" || defaultParams.maxMainMapLatitude === "") {

							return;

						}

						//获取自定义配置中主地图的最大最小经纬度
						var minLon = Number(defaultParams.minMainMapLongitude);
						var maxLon = Number(defaultParams.maxMainMapLongitude);
						var minLat = Number(defaultParams.minMainMapLatitude);
						var maxLat = Number(defaultParams.maxMainMapLatitude);

						var currentZoom = fusiongis.Map.getZoom("gisMapTotal");
						var extend = fusiongis.Map.getExtent("gisMapTotal", true);
						var center = fusiongis.Map.getCenter('gisMapTotal');
						var bound = [minLon, minLat, maxLon, maxLat];
						extend = fusiongis.OlUtil.transform(extend, "EPSG:3857", "EPSG:4326");
						bound = fusiongis.OlUtil.transform(bound, "EPSG:3857", "EPSG:4326");
						center = fusiongis.OlUtil.transform(center, "EPSG:3857", "EPSG:4326");

						var removeCenter = false;

						//当进行地图缩放的时候，当前视图的经度大于地图自定义配置中的经度范围
						//当超过范围时重新定位为经纬度配置的中心位置。
						if ((extend[2] - extend[0]) > (bound[2] - bound[0])) {
							center[0] = (bound[0] + bound[2]) / 2;
							removeCenter = true;
						}

						//当进行地图缩放的时候，当前视图的纬度大于地图自定义配置中的纬度范围
						//当超过范围时重新定位为经纬度配置的中心位置。
						if ((extend[3] - extend[1]) > (bound[3] - bound[1])) {
							center[1] = (bound[1] + bound[3]) / 2;
							removeCenter = true;
						}

						//当前视图的范围小于自定义配置的范围，如果这时超过范围则退到边界处
						if (!removeCenter) {

							if (extend[0] < bound[0]) {
								removeCenter = true;
								center[0] = center[0] + bound[0] - extend[0];
							}
							if (extend[1] < bound[1]) {
								removeCenter = true;
								center[1] = center[1] + bound[1] - extend[1];
							}
							if (extend[2] > bound[2]) {
								removeCenter = true;
								center[0] = center[0] + bound[2] - extend[2];
							}
							if (extend[3] > bound[3]) {
								removeCenter = true;
								center[1] = center[1] + bound[3] - extend[3];
							}
						}

						//如果有还在边界内返回，不重新定位
						if (!removeCenter) {
							return;
						}

						center = fusiongis.OlUtil.transform(center, "EPSG:4326", "EPSG:3857");
						fusiongis.Map.setMapCenter({
							coordinate: center,
							mapId: "gisMapTotal",
							zoom: currentZoom
						});

					}, 1000);
				}
				fusiongis.Cell.addCell({
					layerId: this.gisMapId + "_cell",
					datas: [],
					mapId: this.renderToId,
					noChangeRadius: true
				});

				//点击 map 小区事件弹出弹框  开始======================================================= 
				fusiongis.BaseLayer.registerClick({ //主屏图层注册点击事件
					mapId: renderToId,
					layerId: gisMapId + "_cell",
					callbackfunc: function(_paramObj) {
						if (_paramObj.mapId === "gisMapSmall") {
							var currentZoom = fusiongis.Map.getZoom("gisMapTotal");
							fusiongis.Map.setMapCenter({
								coordinate: _paramObj.pixLonLat,
								mapId: "gisMapTotal",
								zoom: currentZoom
							});
							return;
						}

						if (_paramObj.businessType !== fusiongis.Constant.BUSINESSTYPE.VECTOR_CELL) {
							//点击空白处， 清除弹出窗
							if (mapData.wholeMap.isLock == true && (mapData.wholeMap.renderToId == _paramObj.mapId)) {
								return;
							} else {
								fusiongis.Popup.removePopup(renderToId);
							}
							return;
						}
						//DEMO:
						_paramObj.activedTab = activedTabText;
						_paramObj.cellTotals = cellTotals;
						FloatmessageService.popMapWindow(_paramObj, mapModel, mapData);
					}
				});
				//小区点击弹窗展示结束===================================.

			}

			this.checkCellInBindModel = function(cellId) {
				for (var i = 0; i < mapModel.bindMapModel.gisMap.currentCellData.length; i++) {
					var cellItem = mapModel.bindMapModel.gisMap.currentCellData[i];
					if (cellItem.CELLID == cellId) {
						return true;
					}
				}
				return false;
			};
			this.getCellData = function() {
				var _cellObjs = [];
				var queryParam = this.getQueryParams();
				var CurrentActiveItem = queryParam.activeItem; //当前激活的页签
				var storyName = queryParam.storyName; //故事线选择
				var user = queryParam.requestLabs.user; //用户组选择
				var app = queryParam.requestLabs.app; //app选择
				var quality = queryParam.requestLabs.quality; //指标选择
				var accessData = queryParam.accessData; //频段
				var polygon = queryParam.polygon; //多边形
				var thresholds = queryParam.thresholds.colorList; //图例区间
				var currentCellData = [];
				//获取右侧当前激活的页签
				var new_ica = mapModel.icaAreas;
				var active_user = false;
				var active_app = false;
				var active_kqi = false;
				var active_value = ""; //当前激活页签
				for (var c = 0; c < new_ica.length; c++) {
					if (new_ica[c].type == "user" && new_ica[c].active == true) {
						active_user = true;
						active_value = user;
						break;
					} else if (new_ica[c].type == "app" && new_ica[c].active == true) {
						active_app = true;
						active_value = app;
						break;
					} else if (new_ica[c].type == "quality" && new_ica[c].active == true) {
						active_kqi = true;
						active_value = quality;
						break;
					}
				}
				var selectAccess = []; //频段
				var selectRat = "4G"; //制式
				for (var j = 0; j < accessData.length; j++) { //获取当前选中的制式，
					if (accessData[j].access == "4G") {
						selectAccess = accessData[j].data;
						selectRat = accessData[j].access;
					}
				}
				var sdr_data_user_thresholds = [] //经过图例筛选用户表的最终数据
				if (storyName == "DIY" && quality == "" && app == "" && user != "") { //只选user
					var sdr_data_user_access = []; //经过access筛选,得到制式和USER组匹配的数据
					var temp_user_access = [];
					var tmp_sdr_data_user_thresholds = [];
					if (user == "全网") {
						for (var i = 1; i < sdr_data_user.length; i++) {
							for (var j = 0; j < selectAccess.length; j++) {
								if (selectRat == sdr_data_user[i][3] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_user[i][4] && selectRat == sdr_data_user[i][3]) {
									sdr_data_user_access.push(sdr_data_user[i]);
								}
							}
						}

					} else {
						for (var i = 1; i < sdr_data_user.length; i++) {
							for (var j = 0; j < selectAccess.length; j++) {
								if (selectRat == sdr_data_user[i][3] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_user[i][4] && selectRat == sdr_data_user[i][3] && (sdr_data_user[i][10] == user || sdr_data_user[i][12] == user || sdr_data_user[i][13] == user)) {
									sdr_data_user_access.push(sdr_data_user[i]);
								}
							}
						}
					}
					for (var i = 0; i < sdr_data_user_access.length; i++) { //经过颜色阈值筛选
						for (var j = 0; j < thresholds.length; j++) {
							if (thresholds[j].checked == true && Number(thresholds[j].minIndicatorVal) <= Number(sdr_data_user_access[i][9]) && Number(thresholds[j].maxIndicatorVal) > Number(sdr_data_user_access[i][9])) {
								tmp_sdr_data_user_thresholds.push(sdr_data_user_access[i]);
							}
						}
					}
					for (var i = 0; i < tmp_sdr_data_user_thresholds.length; i++) {
						sdr_data_user_thresholds.push(tmp_sdr_data_user_thresholds[i]);

					}
					//只选USER
					var siteHongzhanArray = []; //宏站
					var siteShineiArray = []; //室内站
					for (var i = 0; i < sdr_data_user_thresholds.length; i++) {
						if (sdr_data_user_thresholds[i][8] == "1" && $.inArray(sdr_data_user_thresholds[i][14], siteHongzhanArray) < 0) {
							siteHongzhanArray.push(sdr_data_user_thresholds[i][14]);
						} else if (sdr_data_user_thresholds[i][8] == "2" && $.inArray(sdr_data_user_thresholds[i][14], siteShineiArray) < 0) {
							siteShineiArray.push(sdr_data_user_thresholds[i][14]);
						}
					}
					//生成宏站打三叶草的数据
					for (var i = 0; i < siteHongzhanArray.length; i++) {

						var cellInfoList = [];
						var coordinates = [];
						for (var m = 0; m < sdr_data_user_thresholds.length; m++) {
							if (siteHongzhanArray[i] == sdr_data_user_thresholds[m][14]) {

								coordinates = [parseFloat(sdr_data_user_thresholds[m][5]), parseFloat(sdr_data_user_thresholds[m][6])];
								var color;
								for (var j = 0; j < thresholds.length; j++) {
									if (Number(thresholds[j].minIndicatorVal) <= Number(sdr_data_user_thresholds[m][9]) && Number(thresholds[j].maxIndicatorVal) > Number(sdr_data_user_thresholds[m][9])) {
										color = thresholds[j].colorVal;
									}
								}
								cellInfoList.push({
									"cellId": sdr_data_user_thresholds[m][0], //小区ID
									"cellName": sdr_data_user_thresholds[m][1], //小区名称
									"belongSite": sdr_data_user_thresholds[m][14], //小区所属基站ID
									"cellType": "sector", //小区类型  sector：扇瓣  triangle：三角形小区  arrow：箭头小区
									"coordinates": coordinates, //坐标
									"radius": 100, //小区半径
									"angle": 75, //小区扇瓣角度
									"azimuth": sdr_data_user_thresholds[m][7], //小区方位角
									"strokeColor": "rgba(0,0,0,0.5)", //小区边框色
									"strokeWidth": 1, //小区边框宽度
									"fillColor": color, //小区填充色
									'highlight': { //小区高亮
										strokeColor: 'red',
										strokeWidth: 3
									},
									"id": sdr_data_user_thresholds[m][0],
									"INDICATORVAL": sdr_data_user_thresholds[m][9],
									"INDICATORNAME": CurrentActiveItem,
									"INDICATORUNIT": "SUB",
									"type": "cellClick"
								});
							}
						}
						var siteData = {
							"siteId": siteHongzhanArray[i], //基站ID
							"siteName": siteHongzhanArray[i], //基站名
							"coordinates": coordinates, //基站坐标
							"radius": 1, //基站半径
							"strokeColor": "rgba(0,0,0,1)", //基站边框颜色
							"strokeWidth": 0, //基站边框宽度
							"fillColor": "yellow", //基站填充色
							'highlight': { //基站高亮
								strokeColor: 'red',
								strokeWidth: 1
							},
							"INDICATORVAL": 81,
							"INDICATORNAME": "rootSite",
							"INDICATORUNIT": "人",
							"cellInfo": cellInfoList
						};
						_cellObjs.push(siteData);
					}
					//生成室内站打圆形
					for (var i = 0; i < siteShineiArray.length; i++) {
						var cellInfoList = [];
						var coordinates = [];
						for (var m = 0; m < sdr_data_user_thresholds.length; m++) {
							if (siteShineiArray[i] == sdr_data_user_thresholds[m][14]) {
								coordinates = [parseFloat(sdr_data_user_thresholds[m][5]), parseFloat(sdr_data_user_thresholds[m][6])];
								var color;
								for (var j = 0; j < thresholds.length; j++) {
									if (Number(thresholds[j].minIndicatorVal) <= Number(sdr_data_user_thresholds[m][9]) && Number(thresholds[j].maxIndicatorVal) > Number(sdr_data_user_thresholds[m][9])) {
										color = thresholds[j].colorVal;
									}
								}
								cellInfoList.push({
									"cellId": sdr_data_user_thresholds[m][0], //小区ID
									"cellName": sdr_data_user_thresholds[m][1], //小区名称
									"belongSite": sdr_data_user_thresholds[m][14], //小区所属基站ID
									"cellType": "sector", //小区类型  sector：扇瓣  triangle：三角形小区  arrow：箭头小区
									"coordinates": coordinates, //坐标
									"radius": 100, //小区半径
									"angle": 360, //小区扇瓣角度
									"azimuth": sdr_data_user_thresholds[m][7], //小区方位角
									"strokeColor": color, //小区边框色
									"strokeWidth": 4, //小区边框宽度
									"fillColor": "#00000000", //小区填充色
									'highlight': { //小区高亮
										strokeColor: 'red',
										strokeWidth: 3
									},
									"id": sdr_data_user_thresholds[m][0],
									"INDICATORVAL": sdr_data_user_thresholds[m][9],
									"INDICATORNAME": CurrentActiveItem,
									"INDICATORUNIT": "SUB",
								});
								break;
							}
						}
						var siteData = {
							"siteId": siteShineiArray[i], //基站ID
							"siteName": siteShineiArray[i], //基站名
							"coordinates": coordinates, //基站坐标
							"radius": 3, //基站半径
							"strokeColor": color, //基站边框颜色
							"strokeWidth": 1, //基站边框宽度
							"fillColor": color, //基站填充色
							'highlight': { //基站高亮
								strokeColor: 'red',
								strokeWidth: 3
							},
							"INDICATORVAL": 81,
							"INDICATORNAME": "rootSite",
							"INDICATORUNIT": "人",
							"cellInfo": cellInfoList
						};
						_cellObjs.push(siteData);

					}
				} else if (storyName == "DIY" && quality == "" && app != "") {
					var sdr_data_user_access = []; //经过access筛选,获取制式和app匹配的数据
					var tmp_sdr_data_user_thresholds = [];
					if (user == "") {
						if (app == "全部") {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7]) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}
							}
						} else {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7] && app == sdr_data_kqi[i][11]) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}
							}
						}
					} else {
						if (app == "全部" && user == "全网") {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7]) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}
							}
						} else if (app == "全部" && user != "全网") {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7] && (sdr_data_kqi[i][9] == user || sdr_data_kqi[i][10] == user || sdr_data_kqi[i][21] == user)) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}
							}
						} else if (app != "全部" && user == "全网") {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7] && app == sdr_data_kqi[i][11]) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}
							}
						} else {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7] && (sdr_data_kqi[i][9] == user || sdr_data_kqi[i][10] == user || sdr_data_kqi[i][21] == user) && app == sdr_data_kqi[i][11]) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}
							}
						}

					}
					for (var i = 0; i < sdr_data_user_access.length; i++) { //得到经过颜色阈值筛选的数据
						for (var j = 0; j < thresholds.length; j++) {
							if (thresholds[j].checked == true && Number(thresholds[j].minIndicatorVal) <= Number(sdr_data_user_access[i][13]) && Number(thresholds[j].maxIndicatorVal) > Number(sdr_data_user_access[i][13])) {
								tmp_sdr_data_user_thresholds.push(sdr_data_user_access[i]);
							}
						}
					}
					for (var i = 0; i < tmp_sdr_data_user_thresholds.length; i++) {
						sdr_data_user_thresholds.push(tmp_sdr_data_user_thresholds[i]);
					}
					//只选USER
					var siteHongzhanArray = []; //宏站
					var siteShineiArray = []; //室内站
					for (var i = 0; i < sdr_data_user_thresholds.length; i++) {
						if (sdr_data_user_thresholds[i][8] == "Outdoor" && $.inArray(sdr_data_user_thresholds[i][20], siteHongzhanArray) < 0) {
							siteHongzhanArray.push(sdr_data_user_thresholds[i][20]);
						} else if (sdr_data_user_thresholds[i][8] == "Indoor" && $.inArray(sdr_data_user_thresholds[i][20], siteShineiArray) < 0) {
							siteShineiArray.push(sdr_data_user_thresholds[i][20]);
						}
					}

					//生成宏站打三叶草的数据
					for (var i = 0; i < siteHongzhanArray.length; i++) {
						var cellInfoList = [];
						var coordinates = [];
						for (var m = 0; m < sdr_data_user_thresholds.length; m++) {
							if (siteHongzhanArray[i] == sdr_data_user_thresholds[m][20]) {
								coordinates = [parseFloat(sdr_data_user_thresholds[m][3]), parseFloat(sdr_data_user_thresholds[m][4])];
								var color;
								for (var j = 0; j < thresholds.length; j++) {
									if (Number(thresholds[j].minIndicatorVal) <= Number(sdr_data_user_thresholds[m][13]) && Number(thresholds[j].maxIndicatorVal) > Number(sdr_data_user_thresholds[m][13])) {
										color = thresholds[j].colorVal;
										break;
									}
								}
								cellInfoList.push({
									"cellId": sdr_data_user_thresholds[m][0], //小区ID
									"cellName": sdr_data_user_thresholds[m][1], //小区名称
									"belongSite": sdr_data_user_thresholds[m][20], //小区所属基站ID
									"cellType": "sector", //小区类型  sector：扇瓣  triangle：三角形小区  arrow：箭头小区
									"coordinates": coordinates, //坐标
									"radius": 100, //小区半径
									"angle": 75, //小区扇瓣角度
									"azimuth": sdr_data_user_thresholds[m][5], //小区方位角
									"strokeColor": "rgba(0,0,0,0.5)", //小区边框色
									"strokeWidth": 1, //小区边框宽度
									"fillColor": color, //小区填充色
									'highlight': { //小区高亮
										strokeColor: 'red',
										strokeWidth: 3
									},
									"id": sdr_data_user_thresholds[m][0],
									"INDICATORVAL": active_value == user ? parseInt(Math.random() * 100 + 1) : sdr_data_user_thresholds[m][13],
									"INDICATORNAME": CurrentActiveItem,
									"INDICATORUNIT": active_value == user ? "SUB" : "MB",
									"type": "cellClick"
								});
							}
						}
						var siteData = {
							"siteId": siteHongzhanArray[i], //基站ID
							"siteName": siteHongzhanArray[i], //基站名
							"coordinates": coordinates, //基站坐标
							"radius": 1, //基站半径
							"strokeColor": "rgba(0,0,0,1)", //基站边框颜色
							"strokeWidth": 1, //基站边框宽度
							"fillColor": "yellow", //基站填充色
							'highlight': { //基站高亮
								strokeColor: 'red',
								strokeWidth: 3
							},
							"INDICATORVAL": 81,
							"INDICATORNAME": "rootSite",
							"INDICATORUNIT": "人",
							"cellInfo": cellInfoList
						};
						_cellObjs.push(siteData);
					}
					//生成室内站打圆形
					for (var i = 0; i < siteShineiArray.length; i++) {
						var cellInfoList = [];
						var coordinates = []
						for (var m = 0; m < sdr_data_user_thresholds.length; m++) {
							if (siteShineiArray[i] == sdr_data_user_thresholds[m][20]) {
								coordinates = [parseFloat(sdr_data_user_thresholds[m][3]), parseFloat(sdr_data_user_thresholds[m][4])];
								var color;
								for (var j = 0; j < thresholds.length; j++) {
									var temp = Number(sdr_data_user_thresholds[m][13]);
									var min = Number(thresholds[j].minIndicatorVal);
									var max = Number(thresholds[j].maxIndicatorVal);
									if (min <= temp && max > temp) {
										color = thresholds[j].colorVal;
									}
								}
								cellInfoList.push({
									"cellId": sdr_data_user_thresholds[m][0], //小区ID
									"cellName": sdr_data_user_thresholds[m][1], //小区名称
									"belongSite": sdr_data_user_thresholds[m][20], //小区所属基站ID
									"cellType": "sector", //小区类型  sector：扇瓣  triangle：三角形小区  arrow：箭头小区
									"coordinates": coordinates, //坐标
									"radius": 100, //小区半径
									"angle": 360, //小区扇瓣角度
									"azimuth": sdr_data_user_thresholds[m][5], //小区方位角
									"strokeColor": color, //小区边框色
									"strokeWidth": 4, //小区边框宽度
									"fillColor": "#00000000", //小区填充色
									'highlight': { //小区高亮
										strokeColor: 'red',
										strokeWidth: 3
									},
									"INDICATORVAL": active_value == user ? parseInt(Math.random() * 100 + 1) : sdr_data_user_thresholds[m][13],
									"INDICATORNAME": CurrentActiveItem,
									"INDICATORUNIT": active_value == user ? "SUB" : "MB",
									"type": "cellClick"
								});
								break;

							}
						}
						var siteData = {
							"siteId": siteShineiArray[i], //基站ID
							"siteName": siteShineiArray[i], //基站名
							"coordinates": coordinates, //基站坐标
							"radius": 3, //基站半径
							"strokeColor": color, //基站边框颜色
							"strokeWidth": 1, //基站边框宽度
							"fillColor": color, //基站填充色
							'highlight': { //基站高亮
								strokeColor: 'red',
								strokeWidth: 1
							},
							"INDICATORVAL": 81,
							"INDICATORNAME": "rootSite",
							"INDICATORUNIT": "kbps",
							"cellInfo": cellInfoList
						};
						_cellObjs.push(siteData);

					}
				} else if (storyName == "DIY" && quality != "" && (quality != "平均RSRP" || quality != "RSRQ")) {
					var sdr_data_user_access = [];
					if (app != "" && user != "") {
						if (app == "全部" && user != "全网") {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7] && (sdr_data_kqi[i][9] == user || sdr_data_kqi[i][10] == user || sdr_data_kqi[i][21] == user)) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}

							}
						} else if (app == "全部" && user == "全网") {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7]) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}

							}
						} else if (app != "全部" && user == "全网") {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7] && sdr_data_kqi[i][11] && app == sdr_data_kqi[i][11]) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}

							}
						} else {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7] && (sdr_data_kqi[i][9] == user || sdr_data_kqi[i][10] == user || sdr_data_kqi[i][21] == user) && sdr_data_kqi[i][11] == app) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}

							}
						}

					} else if (app == "" && user != "") {
						if (user == "全网") {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7]) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}

							}
						} else {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7] && (sdr_data_kqi[i][9] == user || sdr_data_kqi[i][10] == user || sdr_data_kqi[i][21] == user)) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}

							}
						}

					} else if (app != "" && user == "") {
						if (app == "全部") {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7]) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}

							}
						} else {
							for (var i = 1; i < sdr_data_kqi.length; i++) {
								for (var j = 0; j < selectAccess.length; j++) {
									if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7] && sdr_data_kqi[i][11] == app) {
										sdr_data_user_access.push(sdr_data_kqi[i]);
									}
								}

							}
						}

					} else {
						for (var i = 1; i < sdr_data_kqi.length; i++) {
							for (var j = 0; j < selectAccess.length; j++) {
								if (selectRat == sdr_data_kqi[i][6] && selectAccess[j].checked == true && selectAccess[j].frequency == sdr_data_kqi[i][7]) {
									sdr_data_user_access.push(sdr_data_kqi[i]);
								}
							}

						}
					}
					var tmpColorList = [];
					var titleArray = [];
					if (sdr_data_kqi.length > 0) {
						titleArray = sdr_data_kqi[0];
					}

					var columnQuality = 13;
					var tmpUnit = "";
					//取第几列数据，以及单位
					for (var m = 0; m < titleArray.length; m++) {
						if (titleArray[m] == quality && active_value == quality) {
							columnQuality = m;
							for (var n = 1; n < cfg_kqi_threshold.length; n++) {
								if (cfg_kqi_threshold[n][0] == quality && cfg_kqi_threshold[n][6]) {
									tmpUnit = cfg_kqi_threshold[n][6];
									break;
								}
							}
						} else if (active_value == app) {
							for (var n = 1; n < cfg_kqi_threshold.length; n++) {
								if (cfg_kqi_threshold[n][0] == app && cfg_kqi_threshold[n][6]) {
									tmpUnit = cfg_kqi_threshold[n][6];
									break;
								}
							}
						} else if (active_value == user) {
							tmpUnit = "SUB";
						}
					}

					for (var i = 0; i < sdr_data_user_access.length; i++) {
						for (var j = 0; j < thresholds.length; j++) {
							if (sdr_data_user_access[i][columnQuality] && thresholds[j].checked == true && Number(thresholds[j].minIndicatorVal) <= Number(sdr_data_user_access[i][columnQuality]) && Number(thresholds[j].maxIndicatorVal) > Number(sdr_data_user_access[i][columnQuality])) {
								sdr_data_user_thresholds.push(sdr_data_user_access[i]);
								tmpColorList.push({
									"CGISAI": sdr_data_user_access[i][0],
									"COLOR": thresholds[j].colorVal
								});
							}
						}
					}

					var siteHongzhanArray = []; //宏站
					var siteShineiArray = []; //室内站
					for (var i = 0; i < sdr_data_user_thresholds.length; i++) {
						if (sdr_data_user_thresholds[i][8] == "Outdoor" && sdr_data_user_thresholds[i][20]) {
							siteHongzhanArray.push(sdr_data_user_thresholds[i][20]);
						} else if (sdr_data_user_thresholds[i][8] == "Indoor" && sdr_data_user_thresholds[i][20]) {
							siteShineiArray.push(sdr_data_user_thresholds[i][20]);
						}
					}

					//附加小区弹窗信息：
					var indicator_column = columnQuality;
					var indicator_unit = tmpUnit;

					//生成宏站打三叶草的数据
					for (var i = 0; i < siteHongzhanArray.length; i++) {
						var coordinates = [];
						var cellInfoList = [];
						for (var m = 0; m < sdr_data_user_thresholds.length; m++) {
							if (siteHongzhanArray[i] == sdr_data_user_thresholds[m][20]) {
								coordinates = [parseFloat(sdr_data_user_thresholds[m][3]), parseFloat(sdr_data_user_thresholds[m][4])];
								var color;
								for (var j = 0; j < tmpColorList.length; j++) {
									if (tmpColorList[j].CGISAI == sdr_data_user_thresholds[m][0]) {
										color = tmpColorList[j].COLOR;
										break;
									}
								}
								cellInfoList.push({
									"cellId": sdr_data_user_thresholds[m][0], //小区ID
									"cellName": sdr_data_user_thresholds[m][1], //小区名称
									"belongSite": sdr_data_user_thresholds[m][20], //小区所属基站ID
									"cellType": "sector", //小区类型  sector：扇瓣  triangle：三角形小区  arrow：箭头小区
									"coordinates": coordinates, //坐标
									"radius": 100, //小区半径
									"angle": 75, //小区扇瓣角度
									"azimuth": sdr_data_user_thresholds[m][5], //小区方位角
									"strokeColor": "rgba(0,0,0,0.5)", //小区边框色
									"strokeWidth": 1, //小区边框宽度
									"fillColor": color, //小区填充色
									'highlight': { //小区高亮
										strokeColor: 'red',
										strokeWidth: 3
									},
									"id": sdr_data_user_thresholds[m][0],
									"INDICATORVAL": active_value == user ? parseInt(Math.random() * 100 + 1) : sdr_data_user_thresholds[m][indicator_column],
									"INDICATORNAME": CurrentActiveItem,
									"INDICATORUNIT": indicator_unit,
									"type": "cellClick"
								});
							}
						}
						var siteData = {
							"siteId": siteHongzhanArray[i], //基站ID
							"siteName": siteHongzhanArray[i], //基站名
							"coordinates": coordinates, //基站坐标
							"radius": 1, //基站半径
							"strokeColor": "rgba(0,0,0,1)", //基站边框颜色
							"strokeWidth": 0, //基站边框宽度
							"fillColor": "yellow", //基站填充色
							'highlight': { //基站高亮
								strokeColor: 'red',
								strokeWidth: 1
							},
							"INDICATORVAL": 81,
							"INDICATORNAME": "rootSite",
							"INDICATORUNIT": "人",
							"cellInfo": cellInfoList
						};
						_cellObjs.push(siteData);
					}
					//生成室内站打圆形
					for (var i = 0; i < siteShineiArray.length; i++) {
						var cellInfoList = [];
						var coordinates = [];
						for (var m = 0; m < sdr_data_user_thresholds.length; m++) {
							if (siteShineiArray[i] == sdr_data_user_thresholds[m][20]) {
								var color;
								coordinates = [parseFloat(sdr_data_user_thresholds[m][3]), parseFloat(sdr_data_user_thresholds[m][4])];
								for (var j = 0; j < tmpColorList.length; j++) {
									if (tmpColorList[j].CGISAI == sdr_data_user_thresholds[m][0]) {
										color = tmpColorList[j].COLOR;
									}
								}
								cellInfoList.push({
									"cellId": sdr_data_user_thresholds[m][0], //小区ID
									"cellName": sdr_data_user_thresholds[m][1], //小区名称
									"belongSite": sdr_data_user_thresholds[m][20], //小区所属基站ID
									"cellType": "sector", //小区类型  sector：扇瓣  triangle：三角形小区  arrow：箭头小区
									"coordinates": coordinates, //坐标
									"radius": 100, //小区半径
									"angle": 360, //小区扇瓣角度
									"azimuth": sdr_data_user_thresholds[m][5], //小区方位角
									"strokeColor": color, //小区边框色
									"strokeWidth": 4, //小区边框宽度
									"fillColor": "#00000000", //小区填充色
									'highlight': { //小区高亮
										strokeColor: 'red',
										strokeWidth: 3
									},
									"id": sdr_data_user_thresholds[m][0],
									"INDICATORVAL": active_value == user ? parseInt(Math.random() * 100 + 1) : sdr_data_user_thresholds[m][indicator_column],
									"INDICATORNAME": CurrentActiveItem,
									"INDICATORUNIT": indicator_unit,
								});
								break;
							}
						}
						var siteData = {
							"siteId": siteShineiArray[i], //基站ID
							"siteName": siteShineiArray[i], //基站名
							"coordinates": coordinates, //基站坐标
							"radius": 3, //基站半径
							"strokeColor": color, //基站边框颜色
							"strokeWidth": 1, //基站边框宽度
							"fillColor": color, //基站填充色
							'highlight': { //基站高亮
								strokeColor: 'red',
								strokeWidth: 3
							},
							"INDICATORVAL": 81,
							"INDICATORNAME": "rootSite",
							"INDICATORUNIT": "kbps",
							"cellInfo": cellInfoList
						};
						_cellObjs.push(siteData);
					}
				} else if (storyName != "DIY") {
					for (var i = 1; i < cfg_story_lebel.length; i++) {
						if (storyName == cfg_story_lebel[i][5]) {
							sdr_data_user_thresholds.push(cfg_story_lebel[i]);
						}
					}
					var siteHongzhanArray = []; //宏站
					var siteShineiArray = []; //室内站
					for (var i = 0; i < sdr_data_user_thresholds.length; i++) {
						if (sdr_data_user_thresholds[i][3] == "Outdoor" && $.inArray(sdr_data_user_thresholds[i][6], siteHongzhanArray) < 0) {
							siteHongzhanArray.push(sdr_data_user_thresholds[i][6]);
						} else if (sdr_data_user_thresholds[i][3] == "Indoor" && $.inArray(sdr_data_user_thresholds[i][6], siteShineiArray) < 0) {
							siteShineiArray.push(sdr_data_user_thresholds[i][6]);
						}
					}
					//生成宏站打三叶草的数据
					for (var i = 0; i < siteHongzhanArray.length; i++) {

						var cellInfoList = [];
						var coordinates = [];
						for (var m = 0; m < sdr_data_user_thresholds.length; m++) {
							if (siteHongzhanArray[i] == sdr_data_user_thresholds[m][6]) {
								coordinates = [parseFloat(sdr_data_user_thresholds[m][1]), parseFloat(sdr_data_user_thresholds[m][2])];
								cellInfoList.push({
									"cellId": sdr_data_user_thresholds[m][0], //小区ID
									"cellName": sdr_data_user_thresholds[m][7], //小区名称
									"belongSite": sdr_data_user_thresholds[m][6], //小区所属基站ID
									"cellType": "sector", //小区类型  sector：扇瓣  triangle：三角形小区  arrow：箭头小区
									"coordinates": coordinates, //坐标
									"radius": 100, //小区半径
									"angle": 75, //小区扇瓣角度
									"azimuth": sdr_data_user_thresholds[m][4], //小区方位角
									"strokeColor": "rgba(0,0,0,0.5)", //小区边框色
									"strokeWidth": 1, //小区边框宽度
									"fillColor": "red", //小区填充色
									'highlight': { //小区高亮
										strokeColor: 'red',
										strokeWidth: 3
									},
									"id": sdr_data_user_thresholds[m][0],
									"INDICATORVAL": 81,
									"INDICATORNAME": CurrentActiveItem,
									"INDICATORUNIT": "Subs",
									"type": "cellClick"
								});
							}
						}
						var siteData = {
							"siteId": siteHongzhanArray[i], //基站ID
							"siteName": siteHongzhanArray[i], //基站名
							"coordinates": coordinates, //基站坐标
							"radius": 1, //基站半径
							"strokeColor": "rgba(0,0,0,1)", //基站边框颜色
							"strokeWidth": 0, //基站边框宽度
							"fillColor": "yellow", //基站填充色
							'highlight': { //基站高亮
								strokeColor: 'red',
								strokeWidth: 1
							},
							"INDICATORVAL": 81,
							"INDICATORNAME": "rootSite",
							"INDICATORUNIT": "人",
							"cellInfo": cellInfoList
						};
						_cellObjs.push(siteData);
					}
					//生成室内站打圆形
					for (var i = 0; i < siteShineiArray.length; i++) {
						var cellInfoList = [];
						var coordinates = [];

						for (var m = 0; m < sdr_data_user_thresholds.length; m++) {
							if (siteShineiArray[i] == sdr_data_user_thresholds[m][6]) {
								coordinates = [parseFloat(sdr_data_user_thresholds[m][1]), parseFloat(sdr_data_user_thresholds[m][2])];
								cellInfoList.push({
									"cellId": sdr_data_user_thresholds[m][0], //小区ID
									"cellName": sdr_data_user_thresholds[m][7], //小区名称
									"belongSite": sdr_data_user_thresholds[m][6], //小区所属基站ID
									"cellType": "sector", //小区类型  sector：扇瓣  triangle：三角形小区  arrow：箭头小区
									"coordinates": coordinates, //坐标
									"radius": 100, //小区半径
									"angle": 360, //小区扇瓣角度
									"azimuth": sdr_data_user_thresholds[m][4], //小区方位角
									"strokeColor": 'red', //小区边框色
									"strokeWidth": 4, //小区边框宽度
									"fillColor": "#00000000", //小区填充色
									'highlight': { //小区高亮
										strokeColor: 'red',
										strokeWidth: 3
									},
									"id": sdr_data_user_thresholds[m][0],
									"INDICATORVAL": 81,
									"INDICATORNAME": CurrentActiveItem,
									"INDICATORUNIT": "kbps",
								});
								break;
							}
						}
						var siteData = {
							"siteId": siteShineiArray[i], //基站ID
							"siteName": siteShineiArray[i], //基站名
							"coordinates": coordinates, //基站坐标
							"radius": 3, //基站半径
							"strokeColor": 'red', //基站边框颜色
							"strokeWidth": 1, //基站边框宽度
							"fillColor": 'red', //基站填充色
							'highlight': { //基站高亮
								strokeColor: 'red',
								strokeWidth: 3
							},
							"INDICATORVAL": 81,
							"INDICATORNAME": "rootSite",
							"INDICATORUNIT": "kbps",
							"cellInfo": cellInfoList
						};
						_cellObjs.push(siteData);

					}
				}

				//DEMO加入：封装小区信息
				this.currentCellData = _cellObjs;
				cellTotals = [];

				cellTotals = _cellObjs;

				var _paramObj = {
					layerId: this.gisMapId + "_cell",
					datas: _cellObjs,
					zindex: 1999,
					mapId: this.renderToId,
					//noChangeRadius : true
				};
				return _paramObj;
			};
			this.setSingleModelData = function(activeTab, associateMap) {
				rsrpIndi = "";
				rsrpUnit = "";
				//先判断是不是RSRP指标，是的话进行栅格渲染
				var queryParam = this.getQueryParams();
				if ("" === queryParam.activeItem) {
					// 右侧浮标没有选中任何标签就return;
					return;
				}
				// 先刷新小区数据
				if (this.isRenderRSRXByRaster(queryParam)) {
					// 激活的渲染标签是栅格(RSRP用栅格的方式渲染)
					//创建栅格图层
					var _mapId = this.renderToId;
					// url中不能携带#
					for (var i = 0; i < queryParam.thresholds.colorList.length; i++) {
						var tmpColor = queryParam.thresholds.colorList[i].colorVal;
						tmpColor.replace("#", "");
						queryParam.thresholds.colorList[i].colorVal = tmpColor;
					}

					var sdr_data_user_thresholds = [] //经过图例筛选用户表的最终数据	
					var accessData = queryParam.accessData; //频段
					var thresholds = queryParam.thresholds.colorList; //图例区间	

					var quality = queryParam.requestLabs.quality; //指标选择
					var tmpColorList = [];
					var titleArray = [];
					if (sdr_data_kpi.length > 0) {
						titleArray = sdr_data_kpi[0];
					}
					var columnKPIQuality = 3;
					for (var m = 0; m < titleArray.length; m++) {
						if (titleArray[m] == quality) {
							columnKPIQuality = m;
							break;
						}
					}
					for (var i = 1; i < sdr_data_kpi.length - 1; i++) {
						for (var j = 0; j < thresholds.length; j++) {
							if (thresholds[j].checked == true && thresholds[j].minIndicatorVal <= sdr_data_kpi[i][columnKPIQuality] && thresholds[j].maxIndicatorVal > sdr_data_kpi[i][columnKPIQuality]) {
								sdr_data_user_thresholds.push(sdr_data_kpi[i]);
							}
						}
					}
					var tmpPointDatas = [];
					for (var i = 0; i < sdr_data_user_thresholds.length; i++) {

						var color = thresholds[0].colorVal;
						for (var j = 0; j < thresholds.length; j++) {
							if (thresholds[j].minIndicatorVal <= Number(sdr_data_user_thresholds[i][columnKPIQuality]) && thresholds[j].maxIndicatorVal > Number(sdr_data_user_thresholds[i][columnKPIQuality])) {
								color = thresholds[j].colorVal;
								break;
							}
						}
						var tmpPointData = {
							id: "'" + i + "'",
							coordinate: [parseFloat(sdr_data_user_thresholds[i][1]) / 1000000, parseFloat(sdr_data_user_thresholds[i][2]) / 1000000],
							height: 50,
							width: 50,
							fillColor: color,
							strokeColor: color
						};
						tmpPointDatas.push(tmpPointData);
					}
					var allData = {
						mapId: _mapId,
						layerId: this.gisMapId + "_cell",
						datas: tmpPointDatas
					};
					fusiongis.Drag.addDrag({
						mapId: _mapId,
						featureId: "1",
						handleDownEvent: function(e) {},
						handleDragEvent: function(e) {

						},
						handleUpEvent: function(e) {}
					})
					fusiongis.UnChangePolygon.addLayer({
						mapId: _mapId,
						layerId: this.gisMapId + "_cell",
					});

					fusiongis.UnChangePolygon.setLayerData(allData);
					fusiongis.BaseLayer.registerClick({
						mapId: _mapId,
						layerId: this.gisMapId + "_cell",
						callbackfunc: function(result) {}
					});
				} else {
					if (mapModel.icaAreas.length >= 1) {
						var queryParam = this.getQueryParams(); //TODO:
						fusiongis.BsiteAndCell.addSiteAndCell(me.getCellData());
						me.refreshRightSideBarDataByWorkBeach(activeTab);
						if (associateMap) {
							associateMap.gisMap.setModeldata();
						}
						// popupCell
						fusiongis.BaseLayer.registerClick({
							mapId: this.renderToId,
							layerId: this.gisMapId + "_cell",
							callbackfunc: function(_paramObj) {
								if (_paramObj.mapId === "gisMapSmall") {
									var currentZoom = fusiongis.Map.getZoom("gisMapTotal");
									fusiongis.Map.setMapCenter({
										coordinate: _paramObj.pixLonLat,
										mapId: "gisMapTotal",
										zoom: currentZoom
									});
									return;
								}

								if (_paramObj.businessType !== fusiongis.Constant.BUSINESSTYPE.SITEANDCELL) {
									//点击空白处， 清除弹出窗
									if (mapData.wholeMap.isLock == true && (mapData.wholeMap.renderToId == _paramObj.mapId)) {
										return;
									} else {
										fusiongis.Popup.removePopup(renderToId);
									}
									return;
								}
								//DEMO:
								_paramObj.activedTab = activedTabText;
								_paramObj.cellTotals = cellTotals;
								if (_paramObj.data.INDICATORNAME == "rootSite") {
									return;
								}
								FloatmessageService.popMapWindow(_paramObj, mapModel, mapData);
							}
						});
					}
				}
			};

			this.setCellData = function(cellData) {
				try {
					this.currentCellData = cellData;
				} catch (e) {}
			};
			this.getQueryParams = function() {
				rsrpIndi = "";
				rsrpUnit = "";
				//  获取VVIP数据
				var vvipData = mapModel.vvipDataModel;
				var queryTime = null;

				if (mapModel.queryTime != null) {
					queryTime = angular.copy(mapModel.queryTime);
					delete queryTime.hour;
				}
				var queryParam = {
					storyName: activedTabText,
					activeItem: "",
					day: this.getDay(), //指定日期
					queryTime: queryTime,
					accessData: this.accessData,
					polygon: {
						type: "byCellLatAndLng", //byCellIDs|byCellLatAndLng
						cellIds: [],
						latAndLng: {
							minLat: "",
							minLng: "",
							maxLat: "",
							maxLng: ""
						}
					},
					thresholds: null,
					requestLabs: { // 地图上选定的标签
						user: "",
						msisdn: "",
						app: "",
						quality: ""
					},
					polygonPointsData: [], // 多边形顶点坐标
					lock: false, // 是否锁屏
					bindMapParam: null
				};
				if (this.thresholdData != null) {
					queryParam.thresholds = angular.copy(this.thresholdData);
				}
				for (var i = 0; i < mapModel.icaAreas.length; i++) {
					var item = mapModel.icaAreas[i];
					if (item.type === LabelType.USER) {
						//判断vvip group标签属性
						var dimension = JSON.parse(item.dimension);
						if (dimension.catId && dimension.catId === Constant.VVIP_GROUP_CATID) {
							//传单个用户的msisdn,游标上切换单用户时,走if分支
							if ("" != vvipData.data) {
								queryParam.requestLabs.msisdn = vvipData.data;
							} else {
								queryParam.requestLabs.msisdn = item.msisdn;
							}
							queryParam.requestLabs[item.type] = item.text;
						} else {
							queryParam.requestLabs[item.type] = item.text;
						}
					} else {
						queryParam.requestLabs[item.type] = item.text;
					}

					if (item.active) {
						rsrpIndi = item.indicator;
						rsrpUnit = item.data.unit;
						queryParam.activeItem = item.text;
					}
				}

				if (null != mapModel.bindMapModel) {
					queryParam.lock = mapModel.bindMapModel.isLock;
					if (queryParam.lock) {
						queryParam.polygon.latAndLng = getMaxMinLngLat(this.polygonData);
						for (var i = 0; i < this.polygonData.length; i++) {
							if (i != this.polygonData.length - 1) {
								var item = this.polygonData[i];
								queryParam.polygonPointsData.push({
									lng: new String(item[0]),
									lat: new String(item[1])
								});
							}
						}

						//如果是锁屏并且是第二个屏
						queryParam.bindMapParam = mapModel.bindMapModel.gisMap.getQueryParams();
					}
				}

				queryParam.renderDiscoveryIndicatorByCell = renderDiscoveryIndicatorByCell;
				return queryParam;
			};

			this.refreshRightSideBarData = function(responseData) {
				//当组合标签时,刷新地图后需要刷新右侧栏标签显示数据
				var rightIcas = mapModel.icaAreas;
				for (var i in rightIcas) {
					var indicator = rightIcas[i].indicator;
					var data2 = {
						data: "--",
						unit: ""
					};

					if (responseData[indicator]) {
						data2.data = responseData[indicator][0][indicator];
						data2.unit = rightIcas[i].data.unit;

						if (indicator == Constant.TRAFFIC) {
							data2.unit = responseData[indicator][0][Constant.TRAFFIC_UNIT];
						}

						if (rightIcas[i].type == "quality") {
							if (responseData.cgisaiInfo && responseData.cgisaiInfo.length > 0) {
								data2.unit = responseData.cgisaiInfo[0].INDICATORUNIT;
							}

							if (responseData[indicator][0][Constant.TRAFFIC_UNIT]) {
								data2.unit = responseData[indicator][0][Constant.TRAFFIC_UNIT];
							}
						}
					}
					rightIcas[i].data2 = data2;
					rightIcas[i].data = data2;
				}
			};

			this.refreshRightSideBarDataByWorkBeach = function(activeTab) {
				if (activeTab) {}
			};

			this.setCombinationModelData = function(associateMap) {
				if (mapModel.icaAreas.length >= 2) {
					var queryParam = this.getQueryParams();
					if (associateMap) {
						associateMap.gisMap.setModeldata();
					}
				}
			};
			this.setModeldata = function(activeTab, associateMap) {
				// 重绘小区时，删除弹窗信息
				fusiongis.Popup.removePopup(this.renderToId);
				if (backendCellRender !== "true") {
					this.setSingleModelData(activeTab, associateMap);
				}
			};

			this.getNoneFilterParams = function() {
				var queryParam = this.getQueryParams();
				/**
				 * 百分比阈值时不考虑频段,多边形,单vvip用户维度.
				 */
				queryParam.frequencys = null;
				queryParam.polygon.type = "noneFilter";
				queryParam.requestLabs.msisdn = "";
				queryParam.thresholds = angular.copy(this.thresholdData);
				return queryParam;
			};

			this.clearPreviewState = function() {
				this.thresholdDataCopy = null;
				this.isPreViewState = false;
			};

			//TODO 阈值配置
			this.getThresholdData = function(callBack, getThreshold) {
				this.clearPreviewState();
				if (mapModel.icaAreas.length == 0) {
					if (callBack) {
						callBack();
					}
					return;
				}
				var queryParam = this.getNoneFilterParams();
				var activeLabel = queryParam.activeItem; //激活标签
				var userData = [activeLabel];
				//调用回调函数进行数据的处理

				var thresholdData = {
					"userId": "6",
					"userLabel": userData,
					"appLabel": "",
					"kqikpiLabel": "",
					"activeLabel": activeLabel,
					"threshold": "{\"rangeType\":\"0\",\"colorList\":[{\"minVal\":\"0\",\"maxVal\":\"33\",\"colorVal\":\"#63f17b\"},{\"minVal\":\"33\",\"maxVal\":\"66\",\"colorVal\":\"#7cb53a\"},{\"minVal\":\"66\",\"maxVal\":\"100\",\"colorVal\":\"#016802\"}]}",
					"thresholdJson": {
						"rangeType": "0",
						"colorList": getThreshold(queryParam.activeItem).colorList
					},
					"defaultType": false,
					"cellInfos": null
				};
				me.thresholdData = null;
				if (null != thresholdData) {
					me.thresholdData = thresholdData.thresholdJson;
					for (var i = 0; i < me.thresholdData.colorList.length; i++) {
						var item = me.thresholdData.colorList[i];
						item.checked = true;
						item.showColorDig = false;
					}
				}
				//双屏阈值左边栏同步保护
				if (me.renderToId == mapData.activedMap.renderToId) {
					LeftService.setThreshold(mapModel);
				}
				if (callBack) {
					callBack();
				}

			};

			this.changeZoom = function(num, TabService) {
				var currentZoom = fusiongis.Map.getZoom(this.renderToId);
				var center = fusiongis.Map.getCenter(this.renderToId);
				var addNum = currentZoom + num;
				if (addNum < Number(defaultParams.mapMinZoom) || addNum > Number(defaultParams.mapMaxZoom)) {
					return;
				}
				fusiongis.Map.setMapCenter({
					coordinate: center,
					mapId: this.renderToId,
					zoom: addNum
				});

				//TODO 改变地图等级切换数字
				var mapModel = getActivedMapModel();
				if (mapModel.icaAreas.length > 0) {
					var communityName = mapModel.icaAreas[mapModel.icaAreas.length - 1].text;
					communityDataShow(communityName, TabService);
				}
			};

			this.serachCell = function(serachValue) {
				for (var i = 0; i < this.currentCellData.length; i++) {
					var cellItem = this.currentCellData[i];
					if (cellItem.cellName === serachValue) {
						fusiongis.Map.setMapCenter({
							coordinate: [Number(cellItem.coordinateX),
								Number(cellItem.coordinateY)
							],
							mapId: this.renderToId,
							zoom: 14
						});
						break;
					}
				}
			};
			this.sendTabFromRightBar = function(sendOfValue) {
				sendTypeOfRight = {};
				for (var i = 0; i < sendOfValue.length; i++) {
					if (sendOfValue[i].active == true) {
						sendTypeOfRight = sendOfValue[i].data;
					}
				}

			};
			this.refreshCell = function() {
				if (backendCellRender !== "true") {

					fusiongis.Highlight.removeHighlight({
						mapId: this.renderToId,
						layerId: this.gisMapId + "_cell"
					});
					this.currentCellData = [];
					//20181月11日 为了优化性能注掉了这句：fusiongis.BsiteAndCell.addSiteAndCell(me.getCellData());
				}
			};

			this.getCurrentLayerCellIds = function(callBackFunction) {
				$timeout(function() {
					loadingInterceptor.increaseLoadingCount();
				});

				mapModel.gisMap.backendCellIds = [];

				// 小区锁屏
				var pointsParam = "-180 90,-180 -90,180 -90,180 90,-180 90";
				var pointsArray = mapModel.gisMap.polygonData; //多边形经纬数组
				if (pointsArray.length > 3) {
					var pointsData = pointsArray.join("-");
					pointsParam = pointsData.replace(/,/g, " ").replace(/-/g, ",");
				}

				fusiongis.OriginalAjax.postJSON({
					url: fusiongis.Constant.GisRootUrl + '/mapRender/contains',
					data: JSON.stringify({
						"polygon": "POLYGON((" + pointsParam + "))",
						"imgToken": mapModel.gisMap.backendCellImageToken
					}),
					success: function(result) {
						mapModel.gisMap.backendCellIds = [];
						$timeout(function() {
							loadingInterceptor.decreaseLoadingCount();
						});

						if (!!!result) {
							if (callBackFunction) {
								callBackFunction();
							}
							return;
						}
						var responseData = JSON.parse(result);
						var status = responseData.status;

						var datas = responseData.data;
						if (datas) {
							for (var i = 0; i < datas.length; i++) {
								mapModel.gisMap.backendCellIds.push(datas[i].id);
							}
						}

						if (callBackFunction) {
							callBackFunction();
						}
					},
					failure: function(result) {
						$timeout(function() {
							loadingInterceptor.decreaseLoadingCount();
						});
						if (callBackFunction) {
							callBackFunction();
						}
					}
				});
			}

			// 判断RSRP指标是否用栅格渲染
			this.isRenderRSRXByRaster = function(queryParam) {
				var _queryParam = queryParam;
				if (!_queryParam) {
					_queryParam = this.getQueryParams();
				}
				//临时修改：
				return (rsrpIndi == "HDI_METADATA_GRP_RSRP") && renderDiscoveryIndicatorByCell !== 'true';
			};

			this.getSelectedLabelData = function(activeTab) {

				var queryParam = this.getQueryParams();
				if ("" === queryParam.activeItem) {
					// 右侧浮标没有选中任何标签
					return;
				}

				if (false) {
					// 单标签可以复用控制台的数据
					this.refreshRightSideBarDataByWorkBeach(activeTab);
				} else {
					var nnnn = {
						"HDI_METADATA_GRP_SUBS_NUM": "4255",
						"TIME": 1512460800,
						"USERKEY": "USER_LABEL_ID2-2,HOTAPP-342"
					};
					me.refreshRightSideBarData(nnnn);
				};
			}

			// 删除小区服务图层
			this.removeRasterLayer = function() {
				var _mapId = this.renderToId;
				var _layerId = this.rasterLayerId;
				var _rasterLayerMapName = this.rasterLayerMapName;
				this.rasterLayerMapName = "";

				if ("" === _rasterLayerMapName) {
					return;
				}
				fusiongis.BaseLayer.removeLayer({
					mapId: _mapId,
					layerIds: [_layerId]
				})
			}

			this.addRasterLayerCallback = function(layerInfos, associateMap) {

				if (layerInfos.status.code !== 1) {
					return;
				}
				// create the layer for grid
				this.rasterLayerMapName = layerInfos.data.mapName;
				var _url = fusiongis.Constant.GisRootUrl + '/offlineMap/customServer';
				var _mapId = this.renderToId;
				var _layerId = this.rasterLayerId;
				fusiongis.BaseLayer.removeLayer({
					mapId: _mapId,
					layerIds: [_layerId]
				})
				fusiongis.Wms.createWmsLayer({
					url: _url,
					mapId: _mapId,
					layerId: _layerId,
					singleTitle: true,
					params: {
						'LAYERS': [layerInfos.data.layers],
						'MAPNAME': layerInfos.data.mapName,
						'VERSION': '1.1.1'
					}
				});
				if (associateMap) {
					associateMap.gisMap.setModeldata();
				}
			};

			//某点是否在多边形内
			this.choosePolygonCell = function(cellPoint, pointsArray) {
				var x = cellPoint.X;
				var y = cellPoint.Y;

				var isum, icount, index;
				var dLon1 = 0,
					dLon2 = 0,
					dLat1 = 0,
					dLat2 = 0,
					dLon;

				if (pointsArray.length < 3) {
					return false;
				}

				isum = 0;
				icount = pointsArray.length;

				for (index = 0; index < icount - 1; index++) {
					if (index == icount - 1) {
						dLon1 = pointsArray[index][0];
						dLat1 = pointsArray[index][1];
						dLon2 = pointsArray[0][0];
						dLat2 = pointsArray[0][1];
					} else {
						dLon1 = pointsArray[index][0];
						dLat1 = pointsArray[index][1];
						dLon2 = pointsArray[index + 1][0];
						dLat2 = pointsArray[index + 1][1];
					}

					if (((y >= dLat1) && (y < dLat2)) || ((y >= dLat2) && (y < dLat1))) {
						if (Math.abs(dLat1 - dLat2) > 0) {
							dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - y)) / (dLat1 - dLat2);
							if (dLon < x)
								isum++;
						}
					}
				};

				if ((isum % 2) != 0) {
					return true;
				} else {
					return false;
				}
			};

			this.handleThreshold = function(thresholdData) {
				me.thresholdData = thresholdData;
				if (me.thresholdData) {
					for (var i = 0; i < me.thresholdData.colorList.length; i++) {
						var item = me.thresholdData.colorList[i];
						item.showColorDig = false;
					}
				}
				//双屏阈值左边栏同步保护
				if (me.renderToId == mapData.activedMap.renderToId) {
					LeftService.setThreshold(mapModel);
				}
			};

			this.handleGetImageTokenResult = function(renderParams, associateMap) {
				if (null != mapModel.gisMap.thresholdData) {
					for (var i in mapModel.gisMap.thresholdData.colorList) {
						var item = mapModel.gisMap.thresholdData.colorList[i];
						delete item.minIndicatorVal;
						delete item.maxIndicatorVal;
					}
				}

				if (renderParams == null) {
					console.error("Render params empty error!");
					return;
				}

				// 处理地图图层渲染
				var gisResponse = renderParams.gisResponse;

				if (gisResponse && gisResponse.status.code === 1) {
					var _mapId = this.renderToId;
					var _layerId = this.backendCellLayerId;
					var _data = gisResponse.data;
					var requestParam = {
						mapId: _mapId,
						layerId: _layerId,
						imgToken: _data.imgToken,
						imgTokenLabel: _data.imgTokenLabel,
						isShowLabel: true,
						legendInfo: _data.legendInfo,
						titleImgPath: fusiongis.Constant.GisResourceURL + 'legend/',
						businessType: "POLYGON",
						legendName: _data.legendInfo.legendName
					};

					me.backendCellImageToken = _data.imgToken;

					for (var i = 0; i < _data.legendInfo.legendList.length; i++) {
						me.backendRenderCellCount += _data.legendInfo.legendList[i].count;
					}

					// grid
					fusiongis.ServicePolygon.setLayerData(requestParam);

					// legend
					fusiongis.Legend.createLegend(requestParam);
					if (associateMap) {
						associateMap.gisMap.setModeldata();
					}
				} else {
					me.backendRenderCellCount = 0;
					me.backendCellImageToken = "";
					console.error("GetImgToken failed!!!");
				}

				if (me.backendRenderCellCount > 0) {
					this.handleThreshold(renderParams.thresholdJson);
				} else {
					if (null != mapModel.gisMap.thresholdData) {
						for (var i in mapModel.gisMap.thresholdData.colorList) {
							var item = mapModel.gisMap.thresholdData.colorList[i];
							delete item.minIndicatorVal;
							delete item.maxIndicatorVal;
						}
					}
				}
			}

			this.addIcon = function() {
				var letterMap = fusiongis.Map.getMapObj(this.renderToId);

				var draPan = letterMap.getInteractions().item(2); //Gis  给的数据必须选择第二个Array数据  ，可自行查看letterMap中的Array[2]
				draPan.setActive(false);
				var center = letterMap.getView().getCenter();
				fusiongis.Icon.addIcon({
					layerId: this.renderToId + "_icon",
					mapId: this.renderToId,
					imgPath: imgBasePath + '/',
					datas: [{
						coordinate: ol.proj.toLonLat(center),
						id: this.renderToId + "_icon_drag",
						imageName: 'guangbiao.png',
						selectImageName: 'guangbiao.png'
					}]
				});
				fusiongis.BaseLayer.setLayerZIndex({
					"mapId": this.renderToId,
					"layerId": this.renderToId + "_icon",
					"zIndex": 10
				});
			};

			this.addLocationMark = function(paramObj) {

				var maxShowLevel = Number(defaultParams.mapMaxZoom);
				fusiongis.Icon.addIcon({
					layerId: paramObj.layerId,
					mapId: this.renderToId,
					datas: paramObj.datas,
					imgPath: "images/",
					minShowLevel: Number(paramObj.minShowLevel),
					maxShowLevel: maxShowLevel
				});
				fusiongis.BaseLayer.setLayerZIndex({
					"mapId": this.renderToId,
					"layerId": paramObj.layerId,
					"zIndex": paramObj.zIndex
				});
				fusiongis.BaseLayer.registerClick({ //位置标识点击事件

					mapId: mapModel.gisMap.renderToId,
					layerId: paramObj.layerId,
					callbackfunc: function(_paramObj) {
						var cfg_location_urls = "data/location_mark_info.csv";

						var res = {};
						var result = location_mark_info_data_zh;
						for (var i = 1; i < result.length; i++) {
							if (Math.abs(result[i][1] - _paramObj.lonLat[0]) <= 0.001 && Math.abs(result[i][2] - _paramObj.lonLat[1]) <= 0.001) {
								res = {
									"res": {
										"rru": result[i][7],
										"carrier": result[i][8],
										"cascad_rru": result[i][9],
										"bbs": result[i][10],
										"rru_type": result[i][11],
										"rb_num": result[i][12],
										"band": result[i][13],
										"inter_band_info": result[i][14],
										"bandwidth": result[i][15],
										"matching_license": result[i][16],
										"transmission": result[i][17],
										"antenna": result[i][18],
										"power": result[i][19],

									},
									"stat": 1,
								};
							}
						}

						_paramObj.siteInfo = res.res;
						_paramObj.ishowPopuWindow = res.stat;
						FloatmessageService.popMapWindow(_paramObj, mapModel, mapData);

					}

				});

			};

			this.addSingleLocationMark = function(locationMarkItem) {
				fusiongis.BaseLayer.removeLayer({
					mapId: renderToId,
					layerIds: ["location" + "_" + locationMarkItem.locationMark]
				});
				var markDatas = findLocationMarkDataIcon(locationMarkItem.locationMark).markDatas;
				var mathRandom = Math.random();
				for (var j = 0; j < markDatas.length; j++) {
					var markDataItem = markDatas[j];
					markDataItem.coordinate = [47.961223 + Math.random() / 100, 29.327601 + Math.random() / 100];
					markDataItem.id = j + 1;
					markDataItem.imageName = "locationOn.png";
					markDataItem.selectImageName = markDataItem.imageName;
				}
				var paramObj = {
					datas: markDatas,
					layerId: "location" + "_" + locationMarkItem.locationMark,
					minShowLevel: locationMarkItem.visualLevel
				};
				this.addLocationMark(paramObj);
			};

			this.resetMarkLayer = function() {
				var renderToId = this.renderToId;
				this.locationData.forEach(function(value, index, array) {
					fusiongis.BaseLayer.removeLayer({
						mapId: renderToId,
						layerIds: ["location" + "_" + value.locationMark]
					});
				});
			};
			this.addDrag = function() {
				fusiongis.Drag.addDrag({
					mapId: this.renderToId,
					featureId: this.renderToId + "_icon_drag",
					handleDownEvent: function(e) {
						var lonlat = ol.proj.toLonLat(e.evt.coordinate);
						for (var i = 0; i < me.effectMapList.length; i++) {
							var effectMapId = me.effectMapList[i];
							fusiongis.Map.setMapCenter({
								mapId: effectMapId,
								coordinate: lonlat
							});
						}
					},
					handleDragEvent: function(e) {
						var lonlat = ol.proj.toLonLat(e.evt.coordinate);
						for (var i = 0; i < me.effectMapList.length; i++) {
							var effectMapId = me.effectMapList[i];
							fusiongis.Map.setMapCenter({
								mapId: effectMapId,
								coordinate: lonlat
							});
						}
					},
					handleUpEvent: function(e) {}
				});
			};
			this.addCenterChange = function(effectMap) {
				fusiongis.Events.onCenterChange({
					mapId: this.renderToId,
					id: this.renderToId + '_change',
					callbackfunc: function(e) {
						var layer = fusiongis.BaseLayer.getLayer({
							mapId: effectMap,
							layerId: effectMap + "_icon"
						});
						fusiongis.BaseLayer.clearFeatureOnLayer(layer);

						var resolution = fusiongis.Map.getMapObj("gisMapSmall").getView().getResolution();
						var extend = fusiongis.Map.getExtent("gisMapSmall", true);
						var imageLen = 50;

						var coordinate = e.lonLat;
						var center = fusiongis.OlUtil.transform(e.lonLat, "EPSG:4326", "EPSG:3857");
						extend = fusiongis.OlUtil.transform(extend, "EPSG:4326", "EPSG:3857");
						var bound = [center[0] - 25 * resolution, center[1] - 25 * resolution,
							center[0] + 25 * resolution, center[1] + 25 * resolution
						];

						var beyondFlag = false;
						//当前视图的范围小于自定义配置的范围，如果这时超过范围则退到边界处
						if (bound[0] < extend[0]) {
							beyondFlag = true;
							center[0] = center[0] + extend[0] - bound[0];
						}
						if (bound[1] < extend[1]) {
							beyondFlag = true;
							center[1] = center[1] + extend[1] - bound[1];
						}
						if (bound[2] > extend[2]) {
							beyondFlag = true;
							center[0] = center[0] + extend[2] - bound[2];
						}
						if (bound[3] > extend[3]) {
							beyondFlag = true;
							center[1] = center[1] + extend[3] - bound[3];
						}

						extend = fusiongis.OlUtil.transform(extend, "EPSG:3857", "EPSG:4326");
						bound = fusiongis.OlUtil.transform(bound, "EPSG:3857", "EPSG:4326");
						center = fusiongis.OlUtil.transform(center, "EPSG:3857", "EPSG:4326");
						if (beyondFlag) {
							coordinate = center;
						}

						fusiongis.Icon.addIcon({
							layerId: effectMap + "_icon",
							mapId: effectMap,
							imgPath: imgBasePath + '/',
							datas: [{
								coordinate: coordinate,
								id: effectMap + "_icon_drag",
								imageName: 'guangbiao.png',
								selectImageName: 'guangbiao.png'
							}]
						});
					}
				});
			};

			this.getMapExtent = function() {
				return fusiongis.Map.getExtent(this.renderToId, true);
			};

			//===============添加重画图层事件
			this.locationWatchCenterChange = function() {
				fusiongis.Events.onCenterChange({
					mapId: this.renderToId,
					id: '_location_watch',
					callbackfunc: function(e) {
						addActiveMapLocationMark(mapModel);
					}
				});
			};
			/*TODO 绘制区域*/
			this.huizhiquyu = function(data) {
				var layer = fusiongis.OlUtil.getLayer({
					mapId: renderToId,
					layerId: 'asd_' + renderToId
				});
				fusiongis.Highlight.removeHighlight({
					mapId: renderToId,
					layerId: "asd"
				});
				if (!!layer) {
					layer.getSource().clear(); //清除多边形
				}
				fusiongis.Polygon.addLayer({
					mapId: renderToId,
					layerId: "asd",
					defaultVisibleLevel: 3
				});
				var paramsd = {
					mapId: renderToId,
					layerId: "asd",
					datas: []
				};
				if (data.length > 0) {
					for (var i = 0; i < data.length; i++) {
						paramsd.datas.push({
							coordinates: data[i].corrdPoint,
							fillColor: data[i].communityColor,
							strokeColor: 'rgba(216,148,26,26)',
							strokeWidth: 2,
							fontStyle: 'normal',
							fontSize: '15px',
							fontFamily: 'Arial',
							label: data[i].communityNum,
							id: mapModel.pologonLayerId + '_content' + i,
							index: data[i]
						})
					}
				}
				fusiongis.Polygon.setLayerData(paramsd);
				if (data.length > 0 && data[0].hasOwnProperty("popIsShow")) {
					fusiongis.BaseLayer.registerClick({ //多边形图层注册点击事件
						mapId: mapModel.renderToId,
						layerId: "asd",
						callbackfunc: function(_paramObj) {
							var _featureCenter = fusiongis.OlUtil.transform(_paramObj.e.coordinate, "EPSG:3857", "EPSG:4326");
							var cellPoint = {
								X: _featureCenter[0],
								Y: _featureCenter[1]
							};
							if (_paramObj.businessType !== fusiongis.Constant.BUSINESSTYPE.POLYGON) {
								//点击空白处， 清除弹出窗
								if (mapData.wholeMap.isLock == true && (mapData.wholeMap.renderToId == _paramObj.mapId)) {
									return;
								} else {
									fusiongis.Popup.removePopup(renderToId); //清除弹出窗
								}
								return;
							}
							//展示当前社区信息
							if (getActivedMapModel().icaAreas.length > 0) {
								_paramObj.activedTab = activedTabText;
								_paramObj.cellTotals = cellTotals;
								FloatmessageService.popMapWindow(_paramObj, mapModel, mapData);
							}
						}
					});
				}
			}

			//此处调用多边形画图 ↓==============================================
			this.drawCircle = function() {
				var date = new Date();
				var layer = fusiongis.OlUtil.getLayer({
					mapId: renderToId,
					layerId: mapModel.pologonLayerId + '_' + renderToId
				});
				if (!layer) {
					fusiongis.Polygon.addLayer({
						mapId: renderToId,
						layerId: mapModel.pologonLayerId,
						defaultVisibleLevel: 3
					});
				}
				this.isDuringDraw = true;
				fusiongis.Geometry.drawGeometry({
					mapId: renderToId,
					type: fusiongis.Geometry.DrawTypes.Polygon,
					isOpen: true,
					showCloseIcon: false,
					fillColor: 'rgba(255,255,255,0.8)',
					strokeColor: '#3AC7FD',
					strokeWidth: 3,
					clickCallback: function(point) {
						fusiongis.Transform.transform({
							coordinate: point.coordinate,
							sourceProj: 'EPSG:3857',
							targetProj: 'EPSG:4326'
						});
					},
					endCallback: function(res) {
						tipWindow.show(true, true, true, "多边形名称：", null, false, "保存多边形", true);
						me.isDuringDraw = false;
						if (res.coordinates && res.coordinates.length == 4 &&
							res.coordinates[0][0] == res.coordinates[3][0] && res.coordinates[0][1] == res.coordinates[3][1] && res.coordinates[1][0] == res.coordinates[2][0] && res.coordinates[1][1] == res.coordinates[2][1]) {
							return;
						}
						fusiongis.Polygon.setLayerData({
							mapId: renderToId,
							layerId: mapModel.pologonLayerId,
							datas: [{
								coordinates: res.coordinates,
								fillColor: 'rgba(255,255,255,0.3)',
								strokeColor: 'rgba(153,0,255,255)',
								strokeWidth: 2,
								label: '',
								id: mapModel.pologonLayerId + '_content'
							}]
						});
						fusiongis.BaseLayer.registerClick({ //多边形图层注册点击事件
							mapId: mapModel.renderToId,
							layerId: mapModel.pologonLayerId,
							callbackfunc: function(_paramObj) {
								var _featureCenter = fusiongis.OlUtil.transform(_paramObj.e.coordinate, "EPSG:3857", "EPSG:4326");
								var cellPoint = {
									X: _featureCenter[0],
									Y: _featureCenter[1]
								};
								if (_paramObj.businessType !== fusiongis.Constant.BUSINESSTYPE.POLYGON) {
									//点击空白处， 清除弹出窗
									if (mapData.wholeMap.isLock == true && (mapData.wholeMap.renderToId == _paramObj.mapId)) {
										return;
									} else {
										fusiongis.Popup.removePopup(renderToId); //清除弹出窗
									}
									return;
								}
								if (mapModel.gisMap.polygonData.length > 0 && mapData.activedMap.gisMap.choosePolygonCell(cellPoint, mapModel.gisMap.polygonData) == true) {
									//DEMO:
									_paramObj.activedTab = activedTabText;
									_paramObj.cellTotals = cellTotals;
									FloatmessageService.popMapWindow(_paramObj, mapModel, mapData);
								}
							}
						});
						var zIndex = fusiongis.BaseLayer.getLayerZIndex({
							"mapId": renderToId,
							"layerId": mapModel.gisMapId + "_cell"
						});
						if (!zIndex) {
							zIndex = 100;
						}

						var zIndexCell = fusiongis.BaseLayer.getLayerZIndex({
							"mapId": renderToId,
							"layerId": mapModel.gisMapId + "_cell"
						});
						var zIndexService = fusiongis.BaseLayer.getLayerZIndex({
							"mapId": renderToId,
							"layerId": mapModel.pologonLayerId
						});
						if (!zIndexCell) {
							zIndexCell = 100;
						}
						if (!zIndexService) {
							zIndexService = 100;
						}

						var zIndex = zIndexCell;
						if (zIndexService > zIndex) {
							zIndex = zIndexService;
						}

						zIndex += 1;
						fusiongis.BaseLayer.setLayerZIndex({
							"mapId": renderToId,
							"layerId": mapModel.pologonLayerId,
							"zIndex": zIndex
						});
						me.polygonData = res.coordinates;

						if (me.polygonActionEffectMap.length > 0) {
							for (var i = 0; i < me.polygonActionEffectMap.length; i++) {
								var mapItem = me.polygonActionEffectMap[i];
								mapItem.gisMap.setPolygonData(me.polygonData);
								if (mapModel.isLock) {
									mapItem.gisMap.refreshCell();
									mapItem.gisMap.setModeldata();
								}
							}
						}
					}
				});
			};
			this.clearCircle = function(callBackFunction) {
				if (!this.isDuringDraw) {
					var layer = fusiongis.OlUtil.getLayer({
						mapId: renderToId,
						layerId: mapModel.pologonLayerId + '_' + renderToId
					});
					if (layer) {
						layer.getSource().clear();
						fusiongis.Overlay.removeAllPopup(layer.mapId);
					}

					var HLayer = fusiongis.Highlight.getHLayer({
						mapId: renderToId,
						layerId: mapModel.pologonLayerId
					});

					if (HLayer) {
						HLayer.getSource().clear();
						fusiongis.BaseLayer.removeLayer(HLayer);
					}
				} else {
					fusiongis.Geometry.clearGeometryDraw(renderToId);
				}
				this.polygonData = [];
				if (this.polygonActionEffectMap.length > 0) {
					for (var i = 0; i < this.polygonActionEffectMap.length; i++) {
						var mapItem = this.polygonActionEffectMap[i];
						mapItem.gisMap.clearCircle();
					}
				};

				if (callBackFunction) {
					callBackFunction()
				}
			};
			//此处调用多边形画图 ↑==============================================

			this.destroyMap = function() {
				fusiongis.Map.destroyCustomMap({
					mapId: this.renderToId
				});
			};

			this.removeMap = function() {
				fusiongis.Map.removeMap([this.renderToId]);
			};

			//配置地图
			this.map = fusiongis.Map.createMap({
				mapId: renderToId,
				minZoom: Number(defaultParams.mapMinZoom),
				maxZoom: Number(defaultParams.mapMaxZoom),
				mapType: defaultParams.mapType,
				center: [Number(defaultParams.mapLongitude), Number(defaultParams.mapLatitude)],
				defaultZoom: Number(defaultParams.mapZoom),
				key: defaultParams.mapUrlKey,
				productType: true,
				mapName: isOfflineMap ? 'kuwait_map' : '',
				initCallback: isOfflineMap ? afterMapCreateCallback : '',
				UI: isOfflineMap ? false : true,
				googleStyle: googleMap ? 'style' : '',
				isTempPolygonPriority: true
			});

			//不是离线地图时直接调用回调函数：必须放到 gisView 最后
			if (!isOfflineMap) {
				afterMapCreateCallback(this);
			}
		};

		var mapData = {
			isDoubleScreen: false,
			smallMap: {
				renderToId: "gisMapSmall",
				gisMapId: "smallScreenMap",
				params: userConfig.smallMap,
				gisMap: null,
				canModify: true,
				needSmallTitle: false,
				isLock: false,
				isPolygonLock: false,
				bindMapModel: null
			},
			wholeMap: {
				renderToId: "gisMapTotal",
				gisMapId: "wholeScreenMap",
				params: userConfig.mainMap,
				gisMap: null,
				icaAreas: [],
				vvipDataModel: {
					data: "",
					allVvipDatas: {},
					vvipExpandData: []
				},
				time: maxDate,
				queryTime: null,
				canModify: true,
				pologonLayerId: "tempPolygon1",
				needSmallTitle: false,
				isLock: false,
				isPolygonLock: false,
				bindMapModel: null,
				isErrorRequest: false
			},
			rightMap: {
				renderToId: "gisMapTotal3",
				gisMapId: "wholeScreenMap3",
				params: userConfig.mainMap,
				gisMap: null,
				icaAreas: [],
				vvipDataModel: {
					data: "",
					allVvipDatas: {},
					vvipExpandData: []
				},
				time: maxDate,
				queryTime: null,
				canModify: true,
				activedIconUrl: imgBasePath + IMAGES.doubleScreenRight,
				pologonLayerId: "tempPolygon3",
				needSmallTitle: true,
				isLock: false,
				isPolygonLock: true,
				bindMapModel: null,
				isErrorRequest: false
			},
			isMutiScreenRefresh: false,
			activedMap: null
		};

		function addZoomChange(rtMap) {
			var tabServiceCopy = rtMap.tabServiceCopy;
			fusiongis.Events.onZoomChange({
				mapId: rtMap.renderToId,
				featureId: rtMap.renderToId + "_zoom_change",
				callbackfunc: function() {
					//TODO 鼠标滚轮事件
					var tabSerViceCopys = angular.copy(rtMap.tabSerViceCopy);
					if (mapData.activedMap.icaAreas.length > 0) {
						var communityName = mapData.activedMap.icaAreas[mapData.activedMap.icaAreas.length - 1].text;
						communityDataShow(communityName, tabSerViceCopys);
					}
				}
			})
		};
		mapData.activedMap = mapData.wholeMap;

		function initGisModel() {
			// 1. create gis map and set map data
			var smap = mapData.smallMap;
			$("#" + smap.renderToId).html("");
			var smallMapCreated = false;
			createGisMapByModel(smap, function(smallMap) { //小地图的异步回调
				var slap = mapData.smallMap.gisMap;
				if (smallMap) {
					slap = smallMap;
				}
				slap.defaultEventBind();
				slap.addIcon();
				slap.addDrag();
				slap.effectMapList = [mapData.wholeMap.renderToId, mapData.wholeMap.renderToId, mapData.rightMap.renderToId];
				smallMapCreated = true;
			});

			var wholeMap = mapData.wholeMap;
			createGisMapByModel(wholeMap, function(wholeMap) { //主地图的异步回调
				var whMap = mapData.wholeMap.gisMap;
				if (wholeMap) {
					whMap = wholeMap;
				}
				whMap.defaultEventBind();
				whMap.polygonActionEffectMap.push(mapData.rightMap);
				interval;
				addZoomChange(whMap);
				var interval = setInterval(function() {
					if (smallMapCreated) {
						whMap.addCenterChange(mapData.smallMap.renderToId);
						whMap.locationWatchCenterChange();
						clearInterval(interval);
					}
				}, 10);
			});

			// 3. set actived gis map.
			var rightMap = mapData.rightMap;

			createGisMapByModel(rightMap, function(rightMap) { //右侧双屏异步回调
				var rtMap = mapData.rightMap.gisMap;
				if (rightMap) {
					rtMap = rightMap;
				}
				rtMap.defaultEventBind();
				mapData.rightMap.bindMapModel = mapData.wholeMap;
				interval;
				addZoomChange(rtMap);
				var interval = setInterval(function() {
					if (smallMapCreated) {
						rtMap.addCenterChange(mapData.smallMap.renderToId);
						rtMap.locationWatchCenterChange();
						clearInterval(interval);
					}
				}, 10);
			});
		}

		function createGisMapByModel(mapModel, afterMapCreateCallback) {

			sdr_data_user = sdr_data_user_data_zh;
			sdr_data_kqi = sdr_data_kqi_data_zh;
			sdr_data_kpi = sdr_data_kpi_data_zh;
			cfg_story_lebel = cfg_story_lebel_data_zh;
			cfg_kqi_threshold = cfg_kqi_threshold_data_zh;
			readcsvData.cfg_kqi_threshold = $.extend(true, [], cfg_kqi_threshold);
			readcsvData.sdr_data_user = $.extend(true, [], sdr_data_user);
			readcsvData.sdr_data_kqi = $.extend(true, [], sdr_data_kqi);
			readcsvData.sdr_data_kpi = $.extend(true, [], sdr_data_kpi);
			mapModel.gisMap = new GisView(mapModel, afterMapCreateCallback);
		}

		function changeZoom(num, TabService) {
			mapData.activedMap.gisMap.changeZoom(num, TabService);
		}

		//地图多边形↓========================
		function drawPolygon() {
			fusiongis.Popup.removePopup(mapData.activedMap.gisMap.renderToId);
			mapData.activedMap.gisMap.drawCircle();
		}

		function dataDrawPlaygon(data) {
			mapData.activedMap.gisMap.setPolygonData(data);
		}

		function removeAllPolygon(callBackFunction) {
			var isLock = mapData.isDoubleScreen && mapData.wholeMap.isLock;
			fusiongis.Popup.removePopup(mapData.activedMap.gisMap.renderToId);
			fusiongis.Popup.removePopup(mapData.wholeMap.renderToId);
			fusiongis.Popup.removePopup(mapData.rightMap.renderToId);
			mapData.wholeMap.gisMap.clearCircle();
			mapData.wholeMap.gisMap.clearCircle(callBackFunction);
			mapData.rightMap.gisMap.clearCircle();

			if (isLock) {
				mapData.rightMap.gisMap.refreshCell();
				mapData.rightMap.gisMap.setModeldata();
			}
		}

		function canDrawPologon() {
			return !mapData.activedMap.gisMap.isDuringDraw && !mapData.activedMap.isPolygonLock;
		}

		function pologonNeedClear() {
			return mapData.activedMap.gisMap.polygonData.length > 0;
		}
		//地图多边形↑========================

		function getActivedMapModel() {
			return mapData.activedMap;
		}

		function clearMap() {
			var mapItem = getActivedMapModel();
			if (mapItem && mapItem.gisMap) {
				mapItem.gisMap.refreshCell();
			}
		}

		function refreshMapData(activeTab) {
			if (getActivedMapModel().gisMap && getActivedMapModel().time) {
				getActivedMapModel().gisMap.refreshCell();
				getActivedMapModel().gisMap.setModeldata(activeTab);
				//方法报错注掉了	storyLineService.loadScenarioData();
			}
		}

		function canExport() {
			var flag = true;
			if (backendCellRender !== "true") {
				flag = mapData.activedMap.gisMap.cellInfoIsNotEmpty();
			} else {
				flag = (mapData.activedMap.gisMap.backendRenderCellCount > 0);
			}

			return {
				canExport: flag,
				activedGisMapId: mapData.activedMap.renderToId
			};
		}

		function syncLeftAndRightWithMainMap() {

			mapData.wholeMap.needSmallTitle = mapData.isDoubleScreen;
			if (mapData.isDoubleScreen) {
				mapData.wholeMap.gisMap.removePopupWindow();
				mapData.rightMap.gisMap.removePopupWindow();
				mapData.rightMap.time = mapData.wholeMap.time;
				mapData.rightMap.queryTime = angular.copy(mapData.wholeMap.queryTime);
				mapData.rightMap.gisMap.setPolygonData(mapData.wholeMap.gisMap.polygonData);
			} else {
				mapData.wholeMap.gisMap.removePopupWindow();
				mapData.activedMap = mapData.wholeMap;
				mapData.rightMap.icaAreas = [];
				mapData.rightMap.gisMap.refreshCell();
			}
		}

		function setActiveMapThresholdDatas(thresholdDatas, tab, needRefreshMap) {
			var mapModel = getActivedMapModel();
			mapModel.gisMap.thresholdData = thresholdDatas;
			LeftService.setThreshold(mapModel);

			if (needRefreshMap) {
				refreshMapData(tab);

			}
		}

		function getActiveMapThresholdDatas() {
			var mapModel = getActivedMapModel();
			var thresholdData = angular.copy(mapModel.gisMap.thresholdData);
			if (null != thresholdData && thresholdData.rangeType == "0") {
				for (var i in thresholdData.colorList) {
					var item = thresholdData.colorList[i];
					delete item.minIndicatorVal;
					delete item.maxIndicatorVal;
				}
			}
			return thresholdData;
		}

		function setActivedTabText(text) {
			activedTabText = text;
		}

		function changeActiveMapAccessData(TabService) {
			var mapModel = getActivedMapModel();
			if (mapModel.gisMap == null || mapModel.gisMap.accessData == null || LeftService.accessModel.modelData == null) {
				return;
			}
			var accessDataSameVal = accessDataSame(mapModel.gisMap.accessData, LeftService.accessModel.modelData);
			var accessSameVal = accessSame(mapModel.gisMap.accessData, LeftService.accessModel.modelData);
			mapModel.gisMap.accessData = angular.copy(LeftService.accessModel.modelData);
			if (!accessDataSameVal) {
				mapModel.gisMap.refreshCell();
				mapModel.gisMap.setModeldata();
			}
			if (!accessDataSameVal) {
				// 刷新地图数据前开启强制loading
				loadingInterceptor.forceShowLoading();
				TabService.loadData();
			}
		}

		function getActiveMapAccessType() {
			try {
				var mapModel = getActivedMapModel();
				for (var i = 0; i < mapModel.gisMap.accessData.length; i++) {
					var accessItem = mapModel.gisMap.accessData[i];
					if (accessItem.checked) {
						return accessItem.accessVal;
					}
				}
			} catch (e) {
				if (accessData.length != 0) {
					return accessData[0].accessVal;
				}
				return "";
			}
			return "";
		}

		function getActiveMapAccessData() {
			try {
				var mapModel = getActivedMapModel();
				return mapModel.gisMap.accessData;
			} catch (e) {
				return accessData;
			}
		}

		function showRSRPView(show) {
			var mapModel = getActivedMapModel();
			if (show) {

			} else {

			}
		}

		function addActiveMapLocationMark(mapModelParams) {

			if (locationMarkConfig.markInfo != null && locationMarkConfig.markInfo != undefined && locationMarkConfig.markInfo.length > 0) {
				var mapModel = getActivedMapModel();
				if (undefined != mapModelParams && null != mapModelParams) {
					mapModel = mapModelParams;
				}
				var renderToId = mapModel.gisMap.renderToId;
				for (var i = 0; i < mapModel.gisMap.locationData.length; i++) {
					var item = mapModel.gisMap.locationData[i];
					fusiongis.BaseLayer.removeLayer({
						mapId: renderToId,
						layerIds: ["location" + "_" + item.locationMark]
					});
				}
				if (!checkTotalLocationNumIlegal(mapModel)) {
					return;
				}
				var defaultParams = mapModel.params;
				var maxShowLevel = Number(defaultParams.mapMaxZoom);
				var minShowLevel = Number(defaultParams.mapMinZoom);
				var extent = mapModel.gisMap.getMapExtent();
				var mapZoom = mapModel.gisMap.currentZoom;
				var mapZoom = fusiongis.Map.getZoom(mapModel.gisMap.renderToId);
				for (var i = 0; i < mapModel.gisMap.locationData.length; i++) {
					var item = mapModel.gisMap.locationData[i];
					var polygonLayerData = findLocationMarkDataIcon(item.locationMark);
					if (item.checked) {
						if (item.markName == "Area") {

							var polygonLayerData1 = {
								"reigon": "HuaiYin",
								"value": [
									[116.7962, 36.698738],
									[116.7972, 36.700981],
									[116.8004, 36.706669],
									[116.8056, 36.711868],
									[116.8104, 36.715691],
									[116.8184, 36.719929],
									[116.8266, 36.723221],
									[116.8358, 36.725422],
									[116.8453, 36.728008],
									[116.8542, 36.72953],
									[116.8582, 36.731449],
									[116.8661, 36.736389],
									[116.8722, 36.739399],
									[116.877, 36.741051],
									[116.880461, 36.740601],
									[116.885294, 36.741161],
									[116.890765, 36.74225],
									[116.897215, 36.742559],
									[116.902059, 36.742331],
									[116.906917, 36.741054],
									[116.911786, 36.738989],
									[116.915368, 36.736652],
									[116.919258, 36.735367],
									[116.924432, 36.734616],
									[116.928649, 36.733072],
									[116.929954, 36.732031],
									[116.930628, 36.729936],
									[116.931323, 36.726265],
									[116.93104, 36.723375],
									[116.930463, 36.718383],
									[116.929595, 36.711026],
									[116.928104, 36.702089],
									[116.928477, 36.698416],
									[116.930441, 36.69633],
									[116.933062, 36.693461],
									[116.938921, 36.689828],
									[116.948325, 36.686483],
									[116.951262, 36.684141],
									[116.950972, 36.681776],
									[116.950043, 36.678882],
									[116.949752, 36.676517],
									[116.950767, 36.673111],
									[116.953083, 36.668928],
									[116.957045, 36.662393],
									[116.962918, 36.65771],
									[116.96712, 36.657215],
									[116.970982, 36.65803],
									[116.977091, 36.659649],
									[116.981921, 36.660472],
									[116.986428, 36.661292],
									[116.988368, 36.661043],
									[116.989361, 36.659213],
									[116.989085, 36.655798],
									[116.988869, 36.64792],
									[116.987023, 36.641344],
									[116.983846, 36.637645],
									[116.977393, 36.637599],
									[116.967343, 36.640939],
									[116.960563, 36.641153],
									[116.955382, 36.642429],
									[116.94986, 36.645014],
									[116.941771, 36.646531],
									[116.933711, 36.645948],
									[116.927587, 36.645379],
									[116.921779, 36.645337],
									[116.915659, 36.644505],
									[116.911811, 36.64264],
									[116.909589, 36.639999],
									[116.909323, 36.635796],
									[116.90814, 36.627912],
									[116.902418, 36.62157],
									[116.896645, 36.618903],
									[116.891489, 36.618341],
									[116.884709, 36.618555],
									[116.877883, 36.622181],
									[116.869141, 36.624218],
									[116.856861, 36.625443],
									[116.844904, 36.626669],
									[116.835539, 36.627127],
									[116.829737, 36.62656],
									[116.824603, 36.624423],
									[116.821746, 36.620989],
									[116.8196, 36.61557],
									[116.812, 36.619572],
									[116.8063, 36.62344],
									[116.8044, 36.62656],
									[116.8044, 36.628971],
									[116.8063, 36.63261],
									[116.8078, 36.635811],
									[116.8065, 36.639729],
									[116.8048, 36.641472],
									[116.8016, 36.644051],
									[116.7993, 36.648659],
									[116.7991, 36.65303],
									[116.8009, 36.65852],
									[116.8066, 36.667511],
									[116.8118, 36.678459],
									[116.8108, 36.683411],
									[116.8075, 36.688728],
									[116.801, 36.69558],
									[116.7962, 36.698738]
								]
							};
							var polygonLayerData2 = {
								"reigon": "LiXia",
								"value": [
									[117.006112, 36.661433],
									[117.009263, 36.666969],
									[117.013713, 36.671989],
									[117.018202, 36.674122],
									[117.024634, 36.675743],
									[117.033641, 36.677908],
									[117.039101, 36.679785],
									[117.045534, 36.681407],
									[117.050331, 36.684592],
									[117.055774, 36.687781],
									[117.057993, 36.690685],
									[117.060589, 36.689654],
									[117.06288, 36.687307],
									[117.064224, 36.683379],
									[117.064619, 36.678131],
									[117.064683, 36.673406],
									[117.065365, 36.670786],
									[117.067641, 36.66949],
									[117.074099, 36.669273],
									[117.079903, 36.669578],
									[117.083055, 36.675114],
									[117.085242, 36.68038],
									[117.091208, 36.692499],
									[117.095626, 36.699882],
									[117.102682, 36.703083],
									[117.108479, 36.703912],
									[117.113969, 36.703689],
									[117.123678, 36.701659],
									[117.130781, 36.701448],
									[117.137575, 36.700184],
									[117.143089, 36.698123],
									[117.147991, 36.693695],
									[117.15125, 36.691356],
									[117.155126, 36.691122],
									[117.159321, 36.691152],
									[117.162555, 36.69065],
									[117.166768, 36.689368],
									[117.170073, 36.683616],
									[117.172737, 36.677597],
									[117.173788, 36.671566],
									[117.175824, 36.66423],
									[117.175609, 36.656352],
									[117.173107, 36.650559],
									[117.169908, 36.648435],
									[117.165717, 36.648143],
									[117.16216, 36.648642],
									[117.158266, 36.650189],
									[117.156596, 36.654378],
									[117.154308, 36.656462],
									[117.150418, 36.657746],
									[117.14784, 36.657465],
									[117.143362, 36.654545],
									[117.139877, 36.649795],
									[117.137998, 36.645581],
									[117.136772, 36.640846],
									[117.136524, 36.635331],
									[117.136288, 36.629029],
									[117.136044, 36.623251],
									[117.135492, 36.616422],
									[117.133961, 36.610372],
									[117.12987, 36.60273],
									[117.127328, 36.599823],
									[117.12286, 36.596116],
									[117.119974, 36.594782],
									[117.115801, 36.593177],
									[117.110315, 36.593138],
									[117.102517, 36.59702],
									[117.097615, 36.601447],
									[117.094026, 36.604309],
									[117.089817, 36.605329],
									[117.086913, 36.605308],
									[117.079835, 36.603682],
									[117.074633, 36.606533],
									[117.068107, 36.611736],
									[117.064196, 36.614596],
									[117.057713, 36.616649],
									[117.054493, 36.616101],
									[117.051858, 36.62002],
									[117.047939, 36.623405],
									[117.045003, 36.625747],
									[117.041109, 36.627294],
									[117.036584, 36.627786],
									[117.029155, 36.628258],
									[117.021726, 36.628729],
									[117.014946, 36.628943],
									[117.006546, 36.62967],
									[117.002666, 36.630167],
									[117.001042, 36.630943],
									[117.000676, 36.634091],
									[117.000307, 36.637501],
									[117.003143, 36.64251],
									[117.004348, 36.648819],
									[117.005215, 36.656176],
									[117.006112, 36.661433]
								]
							};
							var polygonLayerData3 = {
								"reigon": "ZhangQiu",
								"value": [
									[117.3283, 37.071911],
									[117.3271, 37.06797],
									[117.3278, 37.059719],
									[117.3287, 37.05125],
									[117.3268, 37.04356],
									[117.3241, 37.039768],
									[117.318, 37.036869],
									[117.3116, 37.035229],
									[117.3102, 37.033619],
									[117.3116, 37.02766],
									[117.316, 37.01899],
									[117.3218, 37.01054],
									[117.3259, 37.00679],
									[117.3306, 37.005211],
									[117.3369, 37.00491],
									[117.3457, 37.00552],
									[117.3507, 37.004978],
									[117.3536, 37.003849],
									[117.3567, 37.002151],
									[117.3591, 36.999069],
									[117.3624, 36.992901],
									[117.3678, 36.983311],
									[117.3697, 36.973579],
									[117.3707, 36.963848],
									[117.3716, 36.958019],
									[117.3748, 36.95425],
									[117.3805, 36.951759],
									[117.3871, 36.950531],
									[117.3912, 36.949871],
									[117.3973, 36.949902],
									[117.4012, 36.950489],
									[117.4037, 36.95256],
									[117.4056, 36.956009],
									[117.4054, 36.96059],
									[117.4055, 36.962891],
									[117.4071, 36.96484],
									[117.4098, 36.966461],
									[117.4119, 36.966129],
									[117.4144, 36.96133],
									[117.4148, 36.95594],
									[117.4163, 36.95137],
									[117.4193, 36.950352],
									[117.4276, 36.95039],
									[117.4407, 36.95171],
									[117.4545, 36.954189],
									[117.4625, 36.95583],
									[117.4699, 36.958839],
									[117.4799, 36.963459],
									[117.4869, 36.965099],
									[117.4937, 36.965809],
									[117.5005, 36.968479],
									[117.5036, 36.972271],
									[117.5069, 36.975719],
									[117.5098, 36.977219],
									[117.5115, 36.97356],
									[117.5087, 36.969082],
									[117.5071, 36.963348],
									[117.509, 36.96106],
									[117.5132, 36.961311],
									[117.5198, 36.965229],
									[117.5221, 36.966499],
									[117.5241, 36.967892],
									[117.5265, 36.96904],
									[117.5298, 36.970089],
									[117.5359, 36.967468],
									[117.5401, 36.9645],
									[117.5479, 36.95916],
									[117.5536, 36.954941],
									[117.558, 36.951061],
									[117.5602, 36.945339],
									[117.5565, 36.940289],
									[117.5506, 36.937061],
									[117.5429, 36.936008],
									[117.5346, 36.93792],
									[117.5312, 36.938931],
									[117.5282, 36.93766],
									[117.529, 36.935261],
									[117.5369, 36.92762],
									[117.5508, 36.918159],
									[117.5619, 36.909149],
									[117.5674, 36.902531],
									[117.5706, 36.89212],
									[117.5701, 36.87952],
									[117.5706, 36.866341],
									[117.5732, 36.85799],
									[117.577, 36.849991],
									[117.5803, 36.845989],
									[117.584, 36.8428],
									[117.5869, 36.836849],
									[117.5869, 36.833641],
									[117.5871, 36.831242],
									[117.5895, 36.826439],
									[117.5912, 36.824841],
									[117.594, 36.823471],
									[117.6007, 36.82201],
									[117.6055, 36.820999],
									[117.6109, 36.819061],
									[117.6155, 36.815529],
									[117.6232, 36.809601],
									[117.6298, 36.803211],
									[117.6385, 36.799339],
									[117.6428, 36.79866],
									[117.6484, 36.797649],
									[117.6518, 36.795719],
									[117.6563, 36.791721],
									[117.663, 36.787842],
									[117.6687, 36.785339],
									[117.6743, 36.7794],
									[117.6787, 36.77219],
									[117.6796, 36.765209],
									[117.6808, 36.758911],
									[117.6848, 36.75457],
									[117.6933, 36.751499],
									[117.7022, 36.752892],
									[117.7106, 36.754181],
									[117.7208, 36.754429],
									[117.7288, 36.753071],
									[117.7358, 36.749889],
									[117.7396, 36.74588],
									[117.7394, 36.741531],
									[117.7346, 36.735329],
									[117.732, 36.730179],
									[117.733, 36.72353],
									[117.7334, 36.718719],
									[117.7254, 36.71207],
									[117.7178, 36.70734],
									[117.7135, 36.703442],
									[117.7115, 36.69931],
									[117.7126, 36.692902],
									[117.7132, 36.689442],
									[117.7035, 36.68692],
									[117.6985, 36.685188],
									[117.6953, 36.6814],
									[117.6936, 36.676819],
									[117.6927, 36.672691],
									[117.6915, 36.668221],
									[117.6887, 36.664539],
									[117.6861, 36.660179],
									[117.6857, 36.655949],
									[117.6867, 36.651371],
									[117.6886, 36.648739],
									[117.6937, 36.645199],
									[117.6994, 36.64304],
									[117.7034, 36.639729],
									[117.7055, 36.63435],
									[117.7043, 36.630569],
									[117.6995, 36.622421],
									[117.6955, 36.612671],
									[117.6951, 36.605919],
									[117.6968, 36.601559],
									[117.6985, 36.597561],
									[117.6994, 36.591492],
									[117.6983, 36.585419],
									[117.6952, 36.576931],
									[117.6936, 36.5704],
									[117.6937, 36.566051],
									[117.6954, 36.563869],
									[117.6991, 36.562279],
									[117.703, 36.56012],
									[117.7052, 36.560009],
									[117.7107, 36.558762],
									[117.7142, 36.553619],
									[117.7175, 36.54744],
									[117.7205, 36.544472],
									[117.7266, 36.5415],
									[117.7319, 36.537392],
									[117.734, 36.53373],
									[117.7361, 36.527779],
									[117.7366, 36.52346],
									[117.7322, 36.52433],
									[117.7218, 36.52317],
									[117.7158, 36.52177],
									[117.7096, 36.519459],
									[117.7032, 36.518082],
									[117.6968, 36.518169],
									[117.687, 36.519749],
									[117.6712, 36.523151],
									[117.6624, 36.525299],
									[117.6507, 36.531441],
									[117.6348, 36.541592],
									[117.6296, 36.545929],
									[117.6266, 36.549019],
									[117.6245, 36.550499],
									[117.6221, 36.550949],
									[117.6188, 36.550468],
									[117.6146, 36.54874],
									[117.6115, 36.546551],
									[117.6068, 36.54517],
									[117.599, 36.54285],
									[117.5912, 36.541901],
									[117.5853, 36.538792],
									[117.5823, 36.534771],
									[117.5798, 36.529949],
									[117.5722, 36.523281],
									[117.5593, 36.516239],
									[117.5484, 36.511509],
									[117.5409, 36.509762],
									[117.5347, 36.50779],
									[117.5276, 36.505348],
									[117.5181, 36.500271],
									[117.5117, 36.498409],
									[117.5089, 36.500118],
									[117.506, 36.50309],
									[117.503, 36.50639],
									[117.4997, 36.50856],
									[117.4973, 36.507061],
									[117.4951, 36.50441],
									[117.4919, 36.496151],
									[117.4898, 36.490528],
									[117.4864, 36.48811],
									[117.481, 36.487171],
									[117.4783, 36.486019],
									[117.4767, 36.48428],
									[117.476, 36.480511],
									[117.4749, 36.477058],
									[117.4733, 36.474541],
									[117.4701, 36.47234],
									[117.4641, 36.470139],
									[117.46, 36.46978],
									[117.4563, 36.469872],
									[117.45, 36.47076],
									[117.4421, 36.471519],
									[117.4338, 36.47171],
									[117.4274, 36.47076],
									[117.4203, 36.469238],
									[117.4099, 36.466671],
									[117.4022, 36.464001],
									[117.3963, 36.460072],
									[117.3939, 36.45628],
									[117.3932, 36.4533],
									[117.3941, 36.448719],
									[117.3949, 36.442421],
									[117.3946, 36.437771],
									[117.3923, 36.436562],
									[117.3888, 36.437469],
									[117.3863, 36.438251],
									[117.3829, 36.437778],
									[117.3792, 36.435921],
									[117.3745, 36.434639],
									[117.3712, 36.434231],
									[117.3686, 36.434811],
									[117.3648, 36.43745],
									[117.3617, 36.44339],
									[117.3558, 36.44989],
									[117.3518, 36.455711],
									[117.3481, 36.459011],
									[117.3424, 36.46402],
									[117.3375, 36.467091],
									[117.3344, 36.46764],
									[117.3306, 36.46751],
									[117.3249, 36.466209],
									[117.3182, 36.464569],
									[117.3124, 36.463619],
									[117.3066, 36.464619],
									[117.3002, 36.467819],
									[117.3017, 36.47226],
									[117.307, 36.482601],
									[117.3123, 36.494888],
									[117.3175, 36.502022],
									[117.3225, 36.509041],
									[117.323, 36.512131],
									[117.3204, 36.51498],
									[117.3157, 36.518848],
									[117.3132, 36.525028],
									[117.3129, 36.530521],
									[117.3156, 36.53569],
									[117.3222, 36.540081],
									[117.3236, 36.543751],
									[117.3214, 36.54776],
									[117.3212, 36.552559],
									[117.3234, 36.55624],
									[117.3292, 36.560169],
									[117.3367, 36.564911],
									[117.3458, 36.568279],
									[117.3497, 36.57151],
									[117.3505, 36.576321],
									[117.3499, 36.58263],
									[117.3494, 36.588921],
									[117.3502, 36.592018],
									[117.3534, 36.59663],
									[117.3568, 36.600769],
									[117.3551, 36.607399],
									[117.3529, 36.61277],
									[117.3514, 36.618481],
									[117.3525, 36.626171],
									[117.3553, 36.631802],
									[117.3599, 36.63549],
									[117.3655, 36.63987],
									[117.3689, 36.64563],
									[117.3686, 36.652031],
									[117.3667, 36.656261],
									[117.3648, 36.660599],
									[117.3653, 36.664051],
									[117.3674, 36.666458],
									[117.3663, 36.669659],
									[117.3634, 36.670448],
									[117.358, 36.67202],
									[117.3551, 36.674191],
									[117.3552, 36.677158],
									[117.3569, 36.68232],
									[117.3618, 36.687851],
									[117.3662, 36.69281],
									[117.3656, 36.697041],
									[117.3619, 36.700569],
									[117.3598, 36.705261],
									[117.3585, 36.709591],
									[117.3535, 36.713459],
									[117.3431, 36.716381],
									[117.3388, 36.719002],
									[117.3364, 36.723911],
									[117.3361, 36.728378],
									[117.3375, 36.733311],
									[117.3449, 36.744228],
									[117.3472, 36.749969],
									[117.3456, 36.753059],
									[117.3411, 36.756931],
									[117.3355, 36.760792],
									[117.3296, 36.766479],
									[117.3283, 36.77037],
									[117.3286, 36.774841],
									[117.328, 36.77713],
									[117.3237, 36.779049],
									[117.3155, 36.781288],
									[117.3115, 36.78334],
									[117.3104, 36.785622],
									[117.312, 36.787689],
									[117.3154, 36.791031],
									[117.3265, 36.80003],
									[117.3389, 36.809151],
									[117.3432, 36.81982],
									[117.3439, 36.826241],
									[117.3414, 36.834591],
									[117.336, 36.840519],
									[117.3304, 36.844158],
									[117.3242, 36.852032],
									[117.3177, 36.864128],
									[117.3152, 36.873169],
									[117.3147, 36.879051],
									[117.3134, 36.881081],
									[117.3059, 36.879341],
									[117.3018, 36.87743],
									[117.2975, 36.87484],
									[117.2912, 36.870369],
									[117.281, 36.863079],
									[117.2699, 36.856239],
									[117.2623, 36.853241],
									[117.2533, 36.85141],
									[117.2498, 36.852379],
									[117.2481, 36.8573],
									[117.2469, 36.8605],
									[117.2449, 36.862091],
									[117.2403, 36.86034],
									[117.2375, 36.858711],
									[117.2327, 36.85788],
									[117.2278, 36.858768],
									[117.2214, 36.85907],
									[117.2154, 36.859261],
									[117.2082, 36.861038],
									[117.2029, 36.86433],
									[117.2023, 36.86628],
									[117.2046, 36.86755],
									[117.2077, 36.869518],
									[117.2101, 36.872742],
									[117.2105, 36.876411],
									[117.21, 36.87915],
									[117.2066, 36.88406],
									[117.2003, 36.89101],
									[117.194, 36.894741],
									[117.1898, 36.8946],
									[117.1849, 36.89204],
									[117.1812, 36.89064],
									[117.18, 36.895908],
									[117.1784, 36.901279],
									[117.1785, 36.906429],
									[117.1801, 36.910568],
									[117.1829, 36.915279],
									[117.1862, 36.92012],
									[117.1889, 36.923981],
									[117.2035, 36.937092],
									[117.2149, 36.945511],
									[117.2255, 36.953239],
									[117.2343, 36.96096],
									[117.2387, 36.9673],
									[117.2404, 36.974339],
									[117.2422, 36.98138],
									[117.2414, 36.98983],
									[117.2391, 36.997211],
									[117.2389, 37.000648],
									[117.2383, 37.009121],
									[117.2364, 37.020908],
									[117.2363, 37.029709],
									[117.2374, 37.03513],
									[117.2408, 37.039188],
									[117.245, 37.043091],
									[117.251, 37.046131],
									[117.259, 37.049171],
									[117.2673, 37.051529],
									[117.276, 37.053711],
									[117.2834, 37.056759],
									[117.2882, 37.060631],
									[117.2958, 37.067661],
									[117.3006, 37.07193],
									[117.3037, 37.073898],
									[117.3079, 37.07518],
									[117.3149, 37.074539],
									[117.3229, 37.073212],
									[117.3283, 37.071911]
								]
							};
							var polygonLayerData4 = {
								"reigon": "JiYang",
								"value": [
									[116.8642, 36.9991],
									[116.873215, 36.998629],
									[116.881207, 36.998969],
									[116.891237, 37.003295],
									[116.898317, 37.012043],
									[116.899389, 37.019235],
									[116.902434, 37.024013],
									[116.906477, 37.028783],
									[116.910974, 37.02915],
									[116.923584, 37.031446],
									[116.926479, 37.031835],
									[116.929503, 37.034612],
									[116.9309, 37.040058],
									[116.9262, 37.047409],
									[116.9204, 37.057079],
									[116.9156, 37.068501],
									[116.9137, 37.081879],
									[116.9128, 37.093151],
									[116.9109, 37.098591],
									[116.9103, 37.100552],
									[116.9115, 37.102989],
									[116.9134, 37.10474],
									[116.9159, 37.105228],
									[116.9201, 37.104351],
									[116.9274, 37.103039],
									[116.9352, 37.104191],
									[116.9441, 37.106892],
									[116.947, 37.108799],
									[116.9502, 37.11187],
									[116.9535, 37.11388],
									[116.9575, 37.11499],
									[116.9617, 37.114811],
									[116.9684, 37.114651],
									[116.9733, 37.115608],
									[116.9786, 37.118629],
									[116.984, 37.123341],
									[116.9876, 37.127338],
									[116.9887, 37.12915],
									[116.9904, 37.130619],
									[116.9924, 37.130489],
									[116.9945, 37.12933],
									[116.9991, 37.125622],
									[117.0, 37.123699],
									[117.0033, 37.123421],
									[117.0113, 37.123371],
									[117.0185, 37.123791],
									[117.0209, 37.123909],
									[117.0366, 37.121521],
									[117.0492, 37.121159],
									[117.0581, 37.121349],
									[117.0688, 37.121429],
									[117.0792, 37.1222],
									[117.0868, 37.122379],
									[117.0962, 37.12405],
									[117.1034, 37.1264],
									[117.109, 37.1301],
									[117.1112, 37.13253],
									[117.1155, 37.13726],
									[117.1189, 37.141979],
									[117.1213, 37.145771],
									[117.1231, 37.147961],
									[117.128, 37.147999],
									[117.132, 37.146759],
									[117.136, 37.144279],
									[117.1397, 37.140518],
									[117.1437, 37.1362],
									[117.1484, 37.131771],
									[117.1528, 37.130192],
									[117.1565, 37.12965],
									[117.161, 37.130249],
									[117.1645, 37.131088],
									[117.1672, 37.13084],
									[117.1838, 37.131031],
									[117.1927, 37.133148],
									[117.2014, 37.135601],
									[117.2039, 37.13736],
									[117.2091, 37.144562],
									[117.2118, 37.150921],
									[117.214, 37.155418],
									[117.2159, 37.15855],
									[117.2183, 37.160431],
									[117.2211, 37.161861],
									[117.2255, 37.163429],
									[117.2355, 37.16671],
									[117.2452, 37.172272],
									[117.2509, 37.174782],
									[117.267, 37.178051],
									[117.2865, 37.18195],
									[117.2959, 37.184978],
									[117.3024, 37.18784],
									[117.3097, 37.191978],
									[117.3136, 37.195721],
									[117.3163, 37.197479],
									[117.3256, 37.205101],
									[117.3332, 37.211651],
									[117.3352, 37.21339],
									[117.338256, 37.214388],
									[117.340498, 37.213971],
									[117.342729, 37.212355],
									[117.343187, 37.208351],
									[117.34414, 37.203944],
									[117.344353, 37.200342],
									[117.344329, 37.197942],
									[117.345558, 37.196133],
									[117.348304, 37.196113],
									[117.352067, 37.197885],
									[117.354577, 37.199267],
									[117.356599, 37.201652],
									[117.355897, 37.206257],
									[117.35325, 37.215877],
									[117.351787, 37.219288],
									[117.351826, 37.223087],
									[117.353616, 37.227274],
									[117.362177, 37.234411],
									[117.388735, 37.241874],
									[117.3929, 37.235901],
									[117.391, 37.233021],
									[117.3885, 37.224411],
									[117.3889, 37.217319],
									[117.3926, 37.210011],
									[117.3988, 37.20351],
									[117.4029, 37.192532],
									[117.4061, 37.187969],
									[117.4091, 37.187351],
									[117.4111, 37.18811],
									[117.4172, 37.193859],
									[117.4215, 37.195492],
									[117.4247, 37.194359],
									[117.4273, 37.188068],
									[117.4293, 37.17593],
									[117.4322, 37.162102],
									[117.4388, 37.14872],
									[117.445, 37.140499],
									[117.4469, 37.132149],
									[117.4463, 37.12138],
									[117.4489, 37.114059],
									[117.4517, 37.107849],
									[117.4495, 37.103981],
									[117.4451, 37.099731],
									[117.4371, 37.094879],
									[117.426, 37.089901],
									[117.4143, 37.089378],
									[117.4048, 37.088551],
									[117.4014, 37.088329],
									[117.3953, 37.087639],
									[117.3869, 37.085659],
									[117.3783, 37.081181],
									[117.3675, 37.07357],
									[117.3564, 37.068932],
									[117.344, 37.06955],
									[117.3345, 37.071671],
									[117.3283, 37.071911],
									[117.3229, 37.073212],
									[117.3149, 37.074539],
									[117.3079, 37.07518],
									[117.3037, 37.073898],
									[117.3006, 37.07193],
									[117.2958, 37.067661],
									[117.2882, 37.060631],
									[117.2834, 37.056759],
									[117.276, 37.053711],
									[117.2673, 37.051529],
									[117.259, 37.049171],
									[117.251, 37.046131],
									[117.245, 37.043091],
									[117.2408, 37.039188],
									[117.2374, 37.03513],
									[117.2363, 37.029709],
									[117.2364, 37.020908],
									[117.2383, 37.009121],
									[117.2389, 37.000648],
									[117.2391, 36.997211],
									[117.2414, 36.98983],
									[117.2422, 36.98138],
									[117.2404, 36.974339],
									[117.2387, 36.9673],
									[117.2343, 36.96096],
									[117.2255, 36.953239],
									[117.2149, 36.945511],
									[117.2035, 36.937092],
									[117.1889, 36.923981],
									[117.1862, 36.92012],
									[117.1829, 36.915279],
									[117.1801, 36.910568],
									[117.1785, 36.906429],
									[117.1784, 36.901279],
									[117.18, 36.895908],
									[117.1812, 36.89064],
									[117.1807, 36.884911],
									[117.1782, 36.879971],
									[117.1729, 36.874199],
									[117.1665, 36.867519],
									[117.1639, 36.864979],
									[117.1591, 36.86237],
									[117.1532, 36.85936],
									[117.1494, 36.857201],
									[117.1472, 36.85548],
									[117.1456, 36.852032],
									[117.1445, 36.847721],
									[117.1429, 36.839741],
									[117.1418, 36.837212],
									[117.1355, 36.828232],
									[117.1261, 36.814529],
									[117.1189, 36.801071],
									[117.1124, 36.792889],
									[117.1037, 36.78767],
									[117.0939, 36.785419],
									[117.0876, 36.783199],
									[117.0821, 36.779869],
									[117.0789, 36.78022],
									[117.0747, 36.781151],
									[117.0627, 36.783691],
									[117.0565, 36.787079],
									[117.0526, 36.792999],
									[117.0515, 36.80262],
									[117.0531, 36.817181],
									[117.0544, 36.83242],
									[117.0564, 36.84446],
									[117.0521, 36.855888],
									[117.0472, 36.860199],
									[117.0414, 36.86187],
									[117.0343, 36.862389],
									[117.0242, 36.86013],
									[117.0136, 36.855228],
									[117.003, 36.85022],
									[117.0, 36.848919],
									[116.9941, 36.8494],
									[116.9846, 36.853401],
									[116.9731, 36.857769],
									[116.9595, 36.863091],
									[116.9585, 36.875599],
									[116.9589, 36.885899],
									[116.9582, 36.896339],
									[116.9558, 36.909302],
									[116.9535, 36.915291],
									[116.9489, 36.91798],
									[116.9438, 36.918171],
									[116.9391, 36.918919],
									[116.9358, 36.920689],
									[116.9326, 36.92543],
									[116.9311, 36.93771],
									[116.9261, 36.947189],
									[116.9185, 36.954868],
									[116.9067, 36.95768],
									[116.8995, 36.957668],
									[116.8961, 36.95853],
									[116.894, 36.96027],
									[116.8924, 36.96236],
									[116.8896, 36.96814],
									[116.8889, 36.973541],
									[116.8875, 36.979858],
									[116.8843, 36.984612],
									[116.8799, 36.98811],
									[116.8756, 36.991291],
									[116.8699, 36.994781],
									[116.8642, 36.9991]
								]
							};
							var polygonLayerData5 = {
								"reigon": "ChangQing",
								"value": [
									[116.5113, 36.383629],
									[116.5219, 36.390621],
									[116.5317, 36.400261],
									[116.538, 36.40546],
									[116.5415, 36.407021],
									[116.5458, 36.407959],
									[116.5535, 36.409618],
									[116.5649, 36.41132],
									[116.5739, 36.41386],
									[116.5881, 36.415981],
									[116.5972, 36.418289],
									[116.605, 36.421371],
									[116.6097, 36.424671],
									[116.6134, 36.427479],
									[116.6156, 36.43079],
									[116.6159, 36.434341],
									[116.6153, 36.438129],
									[116.6146, 36.441441],
									[116.6124, 36.445492],
									[116.6108, 36.449039],
									[116.6086, 36.45335],
									[116.6076, 36.45665],
									[116.6073, 36.46096],
									[116.6067, 36.46629],
									[116.6054, 36.471119],
									[116.6041, 36.475159],
									[116.5984, 36.477928],
									[116.5931, 36.479691],
									[116.5906, 36.480701],
									[116.5899, 36.483479],
									[116.5905, 36.487289],
									[116.592, 36.49007],
									[116.5961, 36.49234],
									[116.6014, 36.493542],
									[116.6085, 36.494492],
									[116.6152, 36.495789],
									[116.6216, 36.49881],
									[116.6235, 36.501419],
									[116.6234, 36.504631],
									[116.6206, 36.50845],
									[116.6147, 36.511379],
									[116.6077, 36.514439],
									[116.6052, 36.517109],
									[116.6048, 36.51952],
									[116.6071, 36.522362],
									[116.6125, 36.527222],
									[116.6146, 36.52961],
									[116.6177, 36.532551],
									[116.6213, 36.537331],
									[116.6236, 36.540291],
									[116.6278, 36.542122],
									[116.6317, 36.543259],
									[116.6373, 36.544651],
									[116.6421, 36.546249],
									[116.6466, 36.548531],
									[116.6511, 36.551498],
									[116.6539, 36.554459],
									[116.6553, 36.557652],
									[116.6558, 36.5606],
									[116.6552, 36.56559],
									[116.6544, 36.569679],
									[116.6541, 36.572861],
									[116.6549, 36.57513],
									[116.6563, 36.57695],
									[116.66, 36.57877],
									[116.6653, 36.580151],
									[116.6712, 36.581539],
									[116.6766, 36.583141],
									[116.6813, 36.58564],
									[116.6844, 36.587929],
									[116.6864, 36.590431],
									[116.6871, 36.593601],
									[116.6873, 36.595661],
									[116.6866, 36.599339],
									[116.6863, 36.602551],
									[116.6878, 36.606781],
									[116.6895, 36.60791],
									[116.6915, 36.60857],
									[116.6983, 36.609291],
									[116.7043, 36.610371],
									[116.7155, 36.61343],
									[116.726, 36.616619],
									[116.7381, 36.620949],
									[116.7445, 36.624458],
									[116.7483, 36.627819],
									[116.7536, 36.632992],
									[116.7553, 36.636768],
									[116.7568, 36.641029],
									[116.7582, 36.646469],
									[116.76, 36.650249],
									[116.7632, 36.653099],
									[116.7667, 36.657372],
									[116.7696, 36.661629],
									[116.7722, 36.666599],
									[116.7731, 36.67157],
									[116.7734, 36.676769],
									[116.7734, 36.683861],
									[116.773, 36.68811],
									[116.7742, 36.690708],
									[116.7768, 36.691891],
									[116.7804, 36.692379],
									[116.7862, 36.692871],
									[116.7921, 36.693951],
									[116.7953, 36.69688],
									[116.7962, 36.698738],
									[116.801, 36.69558],
									[116.8075, 36.688728],
									[116.8108, 36.683411],
									[116.8118, 36.678459],
									[116.8066, 36.667511],
									[116.8009, 36.65852],
									[116.7991, 36.65303],
									[116.7993, 36.648659],
									[116.8016, 36.644051],
									[116.8048, 36.641472],
									[116.8065, 36.639729],
									[116.8078, 36.635811],
									[116.8063, 36.63261],
									[116.8044, 36.628971],
									[116.8044, 36.62656],
									[116.8063, 36.62344],
									[116.812, 36.619572],
									[116.8196, 36.61557],
									[116.8234, 36.611851],
									[116.8251, 36.607922],
									[116.8267, 36.602169],
									[116.8291, 36.595131],
									[116.8354, 36.58725],
									[116.8453, 36.580009],
									[116.8571, 36.57272],
									[116.8648, 36.569408],
									[116.8697, 36.567612],
									[116.8723, 36.565971],
									[116.8722, 36.562641],
									[116.8675, 36.556179],
									[116.8612, 36.54731],
									[116.8597, 36.541828],
									[116.8589, 36.532669],
									[116.8583, 36.524872],
									[116.8589, 36.521191],
									[116.8609, 36.51841],
									[116.8641, 36.51675],
									[116.8674, 36.516689],
									[116.8696, 36.516201],
									[116.8713, 36.514221],
									[116.8722, 36.510529],
									[116.8727, 36.506859],
									[116.8739, 36.504539],
									[116.876, 36.503471],
									[116.8804, 36.50259],
									[116.8858, 36.501579],
									[116.8891, 36.498878],
									[116.8913, 36.494701],
									[116.893, 36.49007],
									[116.8947, 36.488201],
									[116.8967, 36.487129],
									[116.9003, 36.48695],
									[116.9035, 36.487801],
									[116.9069, 36.48843],
									[116.9116, 36.48764],
									[116.9171, 36.485458],
									[116.9247, 36.482529],
									[116.9313, 36.47961],
									[116.9374, 36.47702],
									[116.9432, 36.47514],
									[116.9512, 36.471802],
									[116.9561, 36.467949],
									[116.9579, 36.46463],
									[116.9592, 36.458759],
									[116.9591, 36.451061],
									[116.9594, 36.44453],
									[116.9613, 36.44099],
									[116.9651, 36.439461],
									[116.9735, 36.438599],
									[116.9817, 36.436852],
									[116.9862, 36.43499],
									[116.9917, 36.431278],
									[116.9977, 36.42609],
									[117.0, 36.42411],
									[117.004, 36.420849],
									[117.0066, 36.415501],
									[117.0069, 36.408051],
									[117.0075, 36.39912],
									[117.0085, 36.39489],
									[117.0108, 36.389179],
									[117.0107, 36.382999],
									[117.0112, 36.37291],
									[117.0124, 36.368229],
									[117.015, 36.365841],
									[117.0204, 36.363369],
									[117.0272, 36.362968],
									[117.0317, 36.363701],
									[117.0348, 36.363831],
									[117.0377, 36.362942],
									[117.0405, 36.35952],
									[117.0423, 36.355869],
									[117.0436, 36.351311],
									[117.0451, 36.34959],
									[117.0479, 36.348469],
									[117.0533, 36.347149],
									[117.0613, 36.342731],
									[117.072, 36.336182],
									[117.0798, 36.331161],
									[117.0778, 36.326721],
									[117.0747, 36.315689],
									[117.0727, 36.303761],
									[117.0711, 36.298019],
									[117.069, 36.29583],
									[117.0666, 36.29467],
									[117.0641, 36.29406],
									[117.0586, 36.291969],
									[117.0527, 36.289509],
									[117.0452, 36.285099],
									[117.0369, 36.279419],
									[117.0295, 36.27409],
									[117.0245, 36.270599],
									[117.0198, 36.268162],
									[117.0152, 36.266521],
									[117.0105, 36.265678],
									[117.0057, 36.26392],
									[117.0024, 36.26263],
									[116.9998, 36.26144],
									[116.9897, 36.254059],
									[116.9813, 36.24802],
									[116.9743, 36.244129],
									[116.9694, 36.2435],
									[116.9631, 36.24633],
									[116.9548, 36.252899],
									[116.9522, 36.256199],
									[116.9498, 36.257309],
									[116.9457, 36.257],
									[116.9393, 36.255871],
									[116.9283, 36.2575],
									[116.923, 36.260811],
									[116.9195, 36.26368],
									[116.9151, 36.265419],
									[116.9109, 36.26498],
									[116.9074, 36.262939],
									[116.9028, 36.259998],
									[116.897, 36.256741],
									[116.8911, 36.254761],
									[116.8838, 36.254742],
									[116.8799, 36.256512],
									[116.876, 36.259892],
									[116.8707, 36.261921],
									[116.8665, 36.26495],
									[116.8637, 36.270149],
									[116.8597, 36.277538],
									[116.8513, 36.2859],
									[116.8463, 36.290421],
									[116.8417, 36.293449],
									[116.8373, 36.294659],
									[116.8298, 36.294411],
									[116.8213, 36.293941],
									[116.8144, 36.294819],
									[116.809, 36.2966],
									[116.8023, 36.30138],
									[116.7976, 36.306252],
									[116.7931, 36.308708],
									[116.7843, 36.31089],
									[116.7767, 36.312931],
									[116.7719, 36.315399],
									[116.7665, 36.315109],
									[116.7639, 36.313091],
									[116.7609, 36.30957],
									[116.7557, 36.305401],
									[116.7512, 36.304539],
									[116.7486, 36.305149],
									[116.7434, 36.305092],
									[116.7404, 36.304668],
									[116.7375, 36.30368],
									[116.7322, 36.299961],
									[116.7266, 36.294991],
									[116.7175, 36.28582],
									[116.7132, 36.28186],
									[116.7097, 36.281681],
									[116.7066, 36.283199],
									[116.7036, 36.284382],
									[116.7001, 36.284439],
									[116.696, 36.283791],
									[116.6918, 36.28178],
									[116.6871, 36.278179],
									[116.6831, 36.275928],
									[116.6774, 36.274509],
									[116.6735, 36.275249],
									[116.6682, 36.278179],
									[116.6629, 36.282711],
									[116.654, 36.293701],
									[116.6493, 36.29755],
									[116.6438, 36.29842],
									[116.6386, 36.297211],
									[116.6305, 36.29491],
									[116.6229, 36.29351],
									[116.6172, 36.293228],
									[116.6144, 36.29266],
									[116.6059, 36.303219],
									[116.5941, 36.31435],
									[116.5874, 36.319809],
									[116.5803, 36.324249],
									[116.5741, 36.327419],
									[116.5652, 36.330269],
									[116.5556, 36.333019],
									[116.5472, 36.335411],
									[116.5409, 36.337879],
									[116.5383, 36.339401],
									[116.5371, 36.342159],
									[116.5372, 36.34663],
									[116.5387, 36.350399],
									[116.541, 36.3545],
									[116.5449, 36.360981],
									[116.545, 36.364769],
									[116.5438, 36.36673],
									[116.5415, 36.36824],
									[116.537, 36.369781],
									[116.5308, 36.371231],
									[116.5257, 36.372662],
									[116.5218, 36.374298],
									[116.5158, 36.37804],
									[116.5113, 36.383629]
								]
							};
							var polygonLayerData6 = {
								"reigon": "TiaoQiao",
								"value": [
									[116.929954, 36.732031],
									[116.933779, 36.735471],
									[116.937956, 36.736814],
									[116.941492, 36.73789],
									[116.945041, 36.737915],
									[116.949243, 36.73742],
									[116.953471, 36.735088],
									[116.95768, 36.734068],
									[116.963807, 36.734375],
									[116.967023, 36.735186],
									[116.974051, 36.740487],
									[116.979788, 36.745779],
									[116.983287, 36.749479],
									[116.986804, 36.751867],
									[116.989063, 36.751884],
									[116.992641, 36.749809],
									[116.996571, 36.745637],
									[117.001135, 36.742257],
									[117.008227, 36.742833],
									[117.01339, 36.74287],
									[117.015036, 36.740519],
									[117.017366, 36.735285],
									[117.020357, 36.729006],
									[117.021074, 36.723761],
									[117.023078, 36.718787],
									[117.02633, 36.716973],
									[117.029908, 36.714898],
									[117.036724, 36.712059],
									[117.044171, 36.710275],
									[117.051614, 36.708754],
									[117.055211, 36.705367],
									[117.056889, 36.700653],
									[117.056978, 36.694091],
									[117.057993, 36.690685],
									[117.055774, 36.687781],
									[117.050331, 36.684592],
									[117.045534, 36.681407],
									[117.039101, 36.679785],
									[117.033641, 36.677908],
									[117.024634, 36.675743],
									[117.018202, 36.674122],
									[117.013713, 36.671989],
									[117.009263, 36.666969],
									[117.006112, 36.661433],
									[117.002867, 36.662723],
									[116.998683, 36.661905],
									[116.994176, 36.661085],
									[116.988368, 36.661043],
									[116.986428, 36.661292],
									[116.981921, 36.660472],
									[116.977091, 36.659649],
									[116.970982, 36.65803],
									[116.96712, 36.657215],
									[116.962918, 36.65771],
									[116.957045, 36.662393],
									[116.953083, 36.668928],
									[116.950767, 36.673111],
									[116.949752, 36.676517],
									[116.950043, 36.678882],
									[116.950972, 36.681776],
									[116.951262, 36.684141],
									[116.948325, 36.686483],
									[116.938921, 36.689828],
									[116.933062, 36.693461],
									[116.930441, 36.69633],
									[116.928477, 36.698416],
									[116.928104, 36.702089],
									[116.929595, 36.711026],
									[116.930463, 36.718383],
									[116.93104, 36.723375],
									[116.931323, 36.726265],
									[116.930628, 36.729936],
									[116.929954, 36.732031]
								]
							};
							var polygonLayerData7 = {
								"reigon": "ShangHe",
								"value": [
									[117.4233, 37.284248],
									[117.4291, 37.28017],
									[117.4323, 37.277069],
									[117.4284, 37.26379],
									[117.4202, 37.253208],
									[117.4146, 37.244469],
									[117.4121, 37.24136],
									[117.4081, 37.24033],
									[117.3988, 37.238899],
									[117.3929, 37.235901],
									[117.388735, 37.241874],
									[117.362177, 37.234411],
									[117.353616, 37.227274],
									[117.351826, 37.223087],
									[117.351787, 37.219288],
									[117.35325, 37.215877],
									[117.355897, 37.206257],
									[117.356599, 37.201652],
									[117.354577, 37.199267],
									[117.352067, 37.197885],
									[117.348304, 37.196113],
									[117.345558, 37.196133],
									[117.344329, 37.197942],
									[117.344353, 37.200342],
									[117.34414, 37.203944],
									[117.343187, 37.208351],
									[117.342729, 37.212355],
									[117.340498, 37.213971],
									[117.338256, 37.214388],
									[117.3352, 37.21339],
									[117.3332, 37.211651],
									[117.3256, 37.205101],
									[117.3163, 37.197479],
									[117.3136, 37.195721],
									[117.3097, 37.191978],
									[117.3024, 37.18784],
									[117.2959, 37.184978],
									[117.2865, 37.18195],
									[117.267, 37.178051],
									[117.2509, 37.174782],
									[117.2452, 37.172272],
									[117.2355, 37.16671],
									[117.2255, 37.163429],
									[117.2211, 37.161861],
									[117.2183, 37.160431],
									[117.2159, 37.15855],
									[117.214, 37.155418],
									[117.2118, 37.150921],
									[117.2091, 37.144562],
									[117.2039, 37.13736],
									[117.2014, 37.135601],
									[117.1927, 37.133148],
									[117.1838, 37.131031],
									[117.1672, 37.13084],
									[117.1645, 37.131088],
									[117.161, 37.130249],
									[117.1565, 37.12965],
									[117.1528, 37.130192],
									[117.1484, 37.131771],
									[117.1437, 37.1362],
									[117.1397, 37.140518],
									[117.136, 37.144279],
									[117.132, 37.146759],
									[117.128, 37.147999],
									[117.1231, 37.147961],
									[117.1213, 37.145771],
									[117.1189, 37.141979],
									[117.1155, 37.13726],
									[117.1112, 37.13253],
									[117.109, 37.1301],
									[117.1034, 37.1264],
									[117.0962, 37.12405],
									[117.0868, 37.122379],
									[117.0792, 37.1222],
									[117.0688, 37.121429],
									[117.0581, 37.121349],
									[117.0492, 37.121159],
									[117.0366, 37.121521],
									[117.0209, 37.123909],
									[117.0315, 37.127201],
									[117.038, 37.13208],
									[117.0407, 37.135529],
									[117.0418, 37.140701],
									[117.042, 37.14642],
									[117.0442, 37.152519],
									[117.0467, 37.156761],
									[117.0498, 37.16172],
									[117.0514, 37.16803],
									[117.0509, 37.175591],
									[117.0491, 37.180962],
									[117.0445, 37.185619],
									[117.0387, 37.190269],
									[117.0304, 37.19891],
									[117.0263, 37.205631],
									[117.0241, 37.211109],
									[117.0233, 37.21603],
									[117.0232, 37.221981],
									[117.0238, 37.23035],
									[117.0251, 37.241699],
									[117.0257, 37.248119],
									[117.0258, 37.254082],
									[117.0244, 37.261742],
									[117.0217, 37.269279],
									[117.0182, 37.273842],
									[117.014, 37.27586],
									[117.0077, 37.277641],
									[117.0, 37.278259],
									[116.9978, 37.28038],
									[116.9956, 37.285721],
									[116.9936, 37.291611],
									[116.991, 37.297829],
									[116.99, 37.302299],
									[116.9894, 37.30896],
									[116.9874, 37.31649],
									[116.9844, 37.324181],
									[116.9818, 37.330231],
									[116.9809, 37.333172],
									[116.9804, 37.33736],
									[116.9815, 37.341412],
									[116.9835, 37.345879],
									[116.9865, 37.350101],
									[116.9923, 37.353668],
									[116.9981, 37.355751],
									[117.0001, 37.35622],
									[117.0021, 37.359379],
									[117.0028, 37.36248],
									[117.0027, 37.366371],
									[117.0011, 37.370831],
									[117.0, 37.372608],
									[116.9958, 37.372799],
									[116.9925, 37.37468],
									[116.9911, 37.376419],
									[116.9902, 37.379059],
									[116.9899, 37.38229],
									[116.9901, 37.385731],
									[116.9914, 37.388809],
									[116.9938, 37.391651],
									[116.9957, 37.39312],
									[116.9982, 37.39352],
									[117.0006, 37.39259],
									[117.0053, 37.392509],
									[117.0125, 37.394859],
									[117.0176, 37.397991],
									[117.0204, 37.401798],
									[117.0207, 37.405121],
									[117.0193, 37.407749],
									[117.0159, 37.4091],
									[117.011, 37.407558],
									[117.0063, 37.407639],
									[117.0037, 37.410252],
									[117.0032, 37.413799],
									[117.0041, 37.418041],
									[117.007, 37.425968],
									[117.0105, 37.43219],
									[117.0161, 37.436581],
									[117.019458, 37.436443],
									[117.02518, 37.435891],
									[117.031965, 37.435671],
									[117.040023, 37.435441],
									[117.048504, 37.435038],
									[117.0555, 37.434647],
									[117.062496, 37.434255],
									[117.076728, 37.434538],
									[117.086701, 37.436625],
									[117.090115, 37.438639],
									[117.092706, 37.443038],
									[117.093603, 37.44779],
									[117.091326, 37.453245],
									[117.088182, 37.457007],
									[117.087162, 37.460923],
									[117.086133, 37.463989],
									[117.086373, 37.466707],
									[117.088085, 37.468223],
									[117.0902, 37.469131],
									[117.0988, 37.471939],
									[117.1062, 37.474289],
									[117.1132, 37.47789],
									[117.1145, 37.48077],
									[117.1153, 37.48283],
									[117.1183, 37.485031],
									[117.1213, 37.484982],
									[117.1271, 37.480862],
									[117.1306, 37.477451],
									[117.1321, 37.47551],
									[117.1354, 37.474731],
									[117.1424, 37.477531],
									[117.1513, 37.48069],
									[117.1577, 37.4813],
									[117.1654, 37.481129],
									[117.171, 37.480591],
									[117.1756, 37.481091],
									[117.1803, 37.482731],
									[117.1846, 37.485729],
									[117.1883, 37.48954],
									[117.1924, 37.493229],
									[117.201, 37.496841],
									[117.2068, 37.499519],
									[117.2141, 37.505402],
									[117.2156, 37.51194],
									[117.2148, 37.520748],
									[117.2151, 37.529121],
									[117.2161, 37.533932],
									[117.2209, 37.53648],
									[117.2261, 37.53709],
									[117.2293, 37.535622],
									[117.2313, 37.53231],
									[117.2343, 37.529579],
									[117.2372, 37.5285],
									[117.2439, 37.52919],
									[117.2521, 37.530842],
									[117.2563, 37.531078],
									[117.2579, 37.523659],
									[117.2595, 37.521],
									[117.2621, 37.520142],
									[117.266, 37.52005],
									[117.2705, 37.519039],
									[117.2737, 37.516079],
									[117.275, 37.510929],
									[117.2769, 37.506371],
									[117.2798, 37.504211],
									[117.2819, 37.503971],
									[117.284, 37.505039],
									[117.2893, 37.506901],
									[117.2922, 37.506981],
									[117.2958, 37.505909],
									[117.3028, 37.502171],
									[117.3093, 37.502201],
									[117.3123, 37.501629],
									[117.3146, 37.493881],
									[117.3134, 37.491341],
									[117.3107, 37.48843],
									[117.3069, 37.486729],
									[117.2931, 37.48539],
									[117.2819, 37.484409],
									[117.2742, 37.48172],
									[117.2715, 37.480042],
									[117.2705, 37.477119],
									[117.2712, 37.473228],
									[117.273, 37.471931],
									[117.277, 37.47052],
									[117.2858, 37.468731],
									[117.2887, 37.466801],
									[117.2912, 37.46476],
									[117.2917, 37.462002],
									[117.2915, 37.459492],
									[117.2897, 37.454578],
									[117.291, 37.45079],
									[117.2928, 37.4482],
									[117.2945, 37.44709],
									[117.2973, 37.44669],
									[117.3027, 37.44696],
									[117.3087, 37.44825],
									[117.319, 37.451859],
									[117.3321, 37.452621],
									[117.342, 37.449928],
									[117.3508, 37.44574],
									[117.3569, 37.439129],
									[117.3618, 37.428848],
									[117.363, 37.420959],
									[117.3609, 37.41544],
									[117.3553, 37.41003],
									[117.348, 37.405022],
									[117.3463, 37.403568],
									[117.3457, 37.400841],
									[117.3466, 37.398762],
									[117.3487, 37.397228],
									[117.3578, 37.394691],
									[117.3714, 37.390411],
									[117.3814, 37.38657],
									[117.3849, 37.38464],
									[117.3863, 37.382809],
									[117.3881, 37.378479],
									[117.3887, 37.374691],
									[117.39, 37.37294],
									[117.3961, 37.367981],
									[117.3976, 37.366489],
									[117.3987, 37.364201],
									[117.398, 37.359631],
									[117.3962, 37.35458],
									[117.3968, 37.351608],
									[117.3978, 37.349201],
									[117.3999, 37.340729],
									[117.4004, 37.337299],
									[117.3984, 37.331451],
									[117.3986, 37.321369],
									[117.4016, 37.306721],
									[117.4102, 37.296341],
									[117.4203, 37.28643],
									[117.4233, 37.284248]
								]
							};
							var polygonLayerData8 = {
								"reigon": "PingYin",
								"value": [
									[116.2273, 36.18079],
									[116.2367, 36.19389],
									[116.2406, 36.198669],
									[116.2503, 36.20583],
									[116.2614, 36.214451],
									[116.2663, 36.21875],
									[116.2713, 36.223541],
									[116.2742, 36.227131],
									[116.2762, 36.231411],
									[116.2791, 36.23547],
									[116.2811, 36.239761],
									[116.2846, 36.244289],
									[116.2883, 36.24789],
									[116.2936, 36.25481],
									[116.2982, 36.26054],
									[116.3017, 36.265308],
									[116.3048, 36.271259],
									[116.3072, 36.275421],
									[116.3105, 36.279751],
									[116.3154, 36.286011],
									[116.3217, 36.291],
									[116.3274, 36.294041],
									[116.3364, 36.29636],
									[116.3482, 36.299],
									[116.3665, 36.30513],
									[116.3723, 36.308281],
									[116.3792, 36.310848],
									[116.3861, 36.313801],
									[116.3935, 36.316841],
									[116.3987, 36.318851],
									[116.4038, 36.32019],
									[116.4084, 36.320499],
									[116.4132, 36.320518],
									[116.4174, 36.31963],
									[116.4215, 36.319019],
									[116.4278, 36.31884],
									[116.432, 36.3204],
									[116.4346, 36.323132],
									[116.4365, 36.32872],
									[116.4392, 36.336151],
									[116.4432, 36.339432],
									[116.447, 36.340408],
									[116.4511, 36.33992],
									[116.462, 36.336819],
									[116.4699, 36.335941],
									[116.475, 36.337742],
									[116.4775, 36.34013],
									[116.4809, 36.346119],
									[116.4834, 36.34977],
									[116.4854, 36.352291],
									[116.4875, 36.355141],
									[116.4892, 36.35783],
									[116.4908, 36.360352],
									[116.4923, 36.3643],
									[116.4944, 36.367771],
									[116.4966, 36.370461],
									[116.4996, 36.3741],
									[116.5041, 36.379169],
									[116.5113, 36.383629],
									[116.5158, 36.37804],
									[116.5218, 36.374298],
									[116.5257, 36.372662],
									[116.5308, 36.371231],
									[116.537, 36.369781],
									[116.5415, 36.36824],
									[116.5438, 36.36673],
									[116.545, 36.364769],
									[116.5449, 36.360981],
									[116.541, 36.3545],
									[116.5387, 36.350399],
									[116.5372, 36.34663],
									[116.5371, 36.342159],
									[116.5383, 36.339401],
									[116.5409, 36.337879],
									[116.5472, 36.335411],
									[116.5556, 36.333019],
									[116.5652, 36.330269],
									[116.5741, 36.327419],
									[116.5803, 36.324249],
									[116.5874, 36.319809],
									[116.5941, 36.31435],
									[116.6059, 36.303219],
									[116.6144, 36.29266],
									[116.6119, 36.291611],
									[116.6065, 36.288799],
									[116.5993, 36.286129],
									[116.5969, 36.283298],
									[116.5965, 36.27998],
									[116.5958, 36.273911],
									[116.5905, 36.270649],
									[116.5851, 36.268082],
									[116.5792, 36.263329],
									[116.5733, 36.25766],
									[116.5653, 36.25386],
									[116.5539, 36.24894],
									[116.5469, 36.246391],
									[116.5405, 36.24474],
									[116.5287, 36.244751],
									[116.5228, 36.24654],
									[116.5164, 36.249359],
									[116.509, 36.252659],
									[116.5045, 36.252819],
									[116.5002, 36.251492],
									[116.4965, 36.24844],
									[116.4959, 36.244888],
									[116.4967, 36.238689],
									[116.4904, 36.23016],
									[116.4804, 36.224091],
									[116.4714, 36.216961],
									[116.4679, 36.213669],
									[116.468, 36.20908],
									[116.4706, 36.203671],
									[116.4773, 36.197071],
									[116.485, 36.19458],
									[116.4903, 36.191879],
									[116.4938, 36.188179],
									[116.4984, 36.183079],
									[116.5028, 36.17662],
									[116.5079, 36.171291],
									[116.5156, 36.171429],
									[116.5202, 36.170929],
									[116.521, 36.167591],
									[116.5188, 36.162121],
									[116.5176, 36.156059],
									[116.5192, 36.150761],
									[116.5217, 36.14397],
									[116.5266, 36.139679],
									[116.532, 36.138241],
									[116.5369, 36.137501],
									[116.5407, 36.13665],
									[116.5517, 36.135269],
									[116.5544, 36.131229],
									[116.5551, 36.126411],
									[116.5562, 36.12043],
									[116.5589, 36.113979],
									[116.5589, 36.109051],
									[116.5563, 36.1068],
									[116.5537, 36.106369],
									[116.5472, 36.106209],
									[116.5403, 36.10503],
									[116.5369, 36.103451],
									[116.5368, 36.101391],
									[116.5376, 36.097149],
									[116.5388, 36.090031],
									[116.539, 36.080971],
									[116.5364, 36.074692],
									[116.5299, 36.071442],
									[116.5242, 36.070438],
									[116.5221, 36.07008],
									[116.5188, 36.0695],
									[116.5103, 36.06926],
									[116.4985, 36.068699],
									[116.4893, 36.066841],
									[116.4835, 36.065071],
									[116.4733, 36.06255],
									[116.4593, 36.060749],
									[116.4477, 36.059269],
									[116.4433, 36.058159],
									[116.4392, 36.05661],
									[116.4355, 36.053661],
									[116.4329, 36.050362],
									[116.4307, 36.04924],
									[116.4283, 36.050072],
									[116.4268, 36.052601],
									[116.4268, 36.05616],
									[116.4278, 36.060619],
									[116.427, 36.064411],
									[116.4252, 36.06591],
									[116.423, 36.066971],
									[116.4188, 36.06839],
									[116.4116, 36.069038],
									[116.4042, 36.069221],
									[116.4007, 36.06971],
									[116.3968, 36.07193],
									[116.3957, 36.07481],
									[116.3943, 36.078381],
									[116.3917, 36.081959],
									[116.3892, 36.084728],
									[116.3869, 36.086479],
									[116.3826, 36.087551],
									[116.3742, 36.087059],
									[116.3694, 36.086529],
									[116.3633, 36.084419],
									[116.3596, 36.08284],
									[116.3546, 36.08152],
									[116.3512, 36.080181],
									[116.3488, 36.078369],
									[116.3479, 36.076542],
									[116.3476, 36.073898],
									[116.3467, 36.069672],
									[116.3434, 36.066841],
									[116.3397, 36.06562],
									[116.336, 36.063702],
									[116.3337, 36.06155],
									[116.332, 36.058929],
									[116.3298, 36.057461],
									[116.3269, 36.056919],
									[116.3235, 36.056591],
									[116.3194, 36.05537],
									[116.3136, 36.053261],
									[116.3069, 36.051601],
									[116.303, 36.05106],
									[116.301, 36.04982],
									[116.3001, 36.047649],
									[116.2998, 36.044788],
									[116.2993, 36.039181],
									[116.2983, 36.033569],
									[116.2971, 36.028419],
									[116.2946, 36.026039],
									[116.292, 36.025829],
									[116.2892, 36.027229],
									[116.2864, 36.030121],
									[116.283, 36.033939],
									[116.2776, 36.03651],
									[116.271722, 36.03796],
									[116.272001, 36.038819],
									[116.268873, 36.042788],
									[116.268561, 36.046392],
									[116.26829, 36.051632],
									[116.26675, 36.054598],
									[116.263984, 36.056925],
									[116.260066, 36.061559],
									[116.25772, 36.064535],
									[116.255777, 36.067507],
									[116.255053, 36.070789],
									[116.256379, 36.075353],
									[116.258109, 36.079913],
									[116.258175, 36.08253],
									[116.257459, 36.08614],
									[116.255484, 36.087802],
									[116.255591, 36.092055],
									[116.258103, 36.095622],
									[116.257379, 36.098905],
									[116.254218, 36.101565],
									[116.256334, 36.105464],
									[116.260485, 36.109992],
									[116.263408, 36.11388],
									[116.265904, 36.116793],
									[116.266019, 36.121374],
									[116.262463, 36.124366],
									[116.260067, 36.125379],
									[116.257688, 36.127047],
									[116.257754, 36.129665],
									[116.254576, 36.13167],
									[116.251769, 36.132362],
									[116.250196, 36.134019],
									[116.250279, 36.137291],
									[116.249983, 36.141549],
									[116.24683, 36.144536],
									[116.243299, 36.14851],
									[116.238178, 36.153487],
									[116.233469, 36.158785],
									[116.231148, 36.162743],
									[116.229617, 36.166036],
									[116.226876, 36.169345],
									[116.224102, 36.171346],
									[116.222529, 36.173003],
									[116.222562, 36.174311],
									[116.223847, 36.17724],
									[116.2273, 36.18079]
								]
							};
							var polygonLayerData9 = {
								"reigon": "LiCheng",
								"value": [
									[116.8196, 36.61557],
									[116.821746, 36.620989],
									[116.824603, 36.624423],
									[116.829737, 36.62656],
									[116.835539, 36.627127],
									[116.844904, 36.626669],
									[116.856861, 36.625443],
									[116.869141, 36.624218],
									[116.877883, 36.622181],
									[116.884709, 36.618555],
									[116.891489, 36.618341],
									[116.896645, 36.618903],
									[116.902418, 36.62157],
									[116.90629, 36.621598],
									[116.907921, 36.620297],
									[116.911826, 36.617962],
									[116.915103, 36.61431],
									[116.91937, 36.609091],
									[116.923984, 36.602035],
									[116.929262, 36.593672],
									[116.931919, 36.588178],
									[116.934496, 36.58846],
									[116.937687, 36.591108],
									[116.939921, 36.592962],
									[116.940886, 36.593231],
									[116.944145, 36.590892],
									[116.949032, 36.587514],
									[116.955572, 36.58126],
									[116.961423, 36.578152],
									[116.964987, 36.577128],
									[116.968196, 36.578463],
									[116.971071, 36.580584],
									[116.976152, 36.586659],
									[116.978031, 36.590873],
									[116.981154, 36.598509],
									[116.983344, 36.603513],
									[116.985549, 36.607467],
									[116.986499, 36.608786],
									[116.989734, 36.608284],
									[116.992989, 36.606208],
									[116.999518, 36.600741],
									[117.006015, 36.597638],
									[117.013451, 36.596641],
									[117.018926, 36.597468],
									[117.025365, 36.598565],
									[117.032422, 36.601766],
									[117.037868, 36.604693],
									[117.046215, 36.607903],
									[117.051962, 36.612408],
									[117.052859, 36.613887],
									[117.054493, 36.616101],
									[117.057713, 36.616649],
									[117.064196, 36.614596],
									[117.068107, 36.611736],
									[117.074633, 36.606533],
									[117.079835, 36.603682],
									[117.086913, 36.605308],
									[117.089817, 36.605329],
									[117.094026, 36.604309],
									[117.097615, 36.601447],
									[117.102517, 36.59702],
									[117.110315, 36.593138],
									[117.115801, 36.593177],
									[117.119974, 36.594782],
									[117.12286, 36.596116],
									[117.127328, 36.599823],
									[117.12987, 36.60273],
									[117.133961, 36.610372],
									[117.135492, 36.616422],
									[117.136044, 36.623251],
									[117.136288, 36.629029],
									[117.136524, 36.635331],
									[117.136772, 36.640846],
									[117.137998, 36.645581],
									[117.139877, 36.649795],
									[117.143362, 36.654545],
									[117.14784, 36.657465],
									[117.150418, 36.657746],
									[117.154308, 36.656462],
									[117.156596, 36.654378],
									[117.158266, 36.650189],
									[117.16216, 36.648642],
									[117.165717, 36.648143],
									[117.169908, 36.648435],
									[117.173107, 36.650559],
									[117.175609, 36.656352],
									[117.175824, 36.66423],
									[117.173788, 36.671566],
									[117.172737, 36.677597],
									[117.170073, 36.683616],
									[117.166768, 36.689368],
									[117.162555, 36.69065],
									[117.159321, 36.691152],
									[117.155126, 36.691122],
									[117.15125, 36.691356],
									[117.147991, 36.693695],
									[117.143089, 36.698123],
									[117.137575, 36.700184],
									[117.130781, 36.701448],
									[117.123678, 36.701659],
									[117.113969, 36.703689],
									[117.108479, 36.703912],
									[117.102682, 36.703083],
									[117.095626, 36.699882],
									[117.091208, 36.692499],
									[117.085242, 36.68038],
									[117.083055, 36.675114],
									[117.079903, 36.669578],
									[117.074099, 36.669273],
									[117.067641, 36.66949],
									[117.065365, 36.670786],
									[117.064683, 36.673406],
									[117.064619, 36.678131],
									[117.064224, 36.683379],
									[117.06288, 36.687307],
									[117.060589, 36.689654],
									[117.057993, 36.690685],
									[117.056978, 36.694091],
									[117.056889, 36.700653],
									[117.055211, 36.705367],
									[117.051614, 36.708754],
									[117.044171, 36.710275],
									[117.036724, 36.712059],
									[117.029908, 36.714898],
									[117.02633, 36.716973],
									[117.023078, 36.718787],
									[117.021074, 36.723761],
									[117.020357, 36.729006],
									[117.017366, 36.735285],
									[117.015036, 36.740519],
									[117.01339, 36.74287],
									[117.008227, 36.742833],
									[117.001135, 36.742257],
									[116.996571, 36.745637],
									[116.992641, 36.749809],
									[116.989063, 36.751884],
									[116.986804, 36.751867],
									[116.983287, 36.749479],
									[116.979788, 36.745779],
									[116.974051, 36.740487],
									[116.967023, 36.735186],
									[116.963807, 36.734375],
									[116.95768, 36.734068],
									[116.953471, 36.735088],
									[116.949243, 36.73742],
									[116.945041, 36.737915],
									[116.941492, 36.73789],
									[116.937956, 36.736814],
									[116.933779, 36.735471],
									[116.929954, 36.732031],
									[116.928649, 36.733072],
									[116.924432, 36.734616],
									[116.919258, 36.735367],
									[116.915368, 36.736652],
									[116.911786, 36.738989],
									[116.906917, 36.741054],
									[116.902059, 36.742331],
									[116.897215, 36.742559],
									[116.890765, 36.74225],
									[116.885294, 36.741161],
									[116.880461, 36.740601],
									[116.877, 36.741051],
									[116.8819, 36.745541],
									[116.8743, 36.758438],
									[116.8678, 36.773041],
									[116.8645, 36.78487],
									[116.8644, 36.792431],
									[116.8668, 36.797569],
									[116.8707, 36.800751],
									[116.8748, 36.804379],
									[116.8783, 36.810551],
									[116.8808, 36.8158],
									[116.8846, 36.818291],
									[116.8931, 36.820179],
									[116.91, 36.821201],
									[116.9266, 36.81958],
									[116.9468, 36.822289],
									[116.9547, 36.826012],
									[116.9579, 36.830448],
									[116.9599, 36.83881],
									[116.9602, 36.84808],
									[116.9594, 36.852669],
									[116.9595, 36.863091],
									[116.9731, 36.857769],
									[116.9846, 36.853401],
									[116.9941, 36.8494],
									[117.0, 36.848919],
									[117.003, 36.85022],
									[117.0136, 36.855228],
									[117.0242, 36.86013],
									[117.0343, 36.862389],
									[117.0414, 36.86187],
									[117.0472, 36.860199],
									[117.0521, 36.855888],
									[117.0564, 36.84446],
									[117.0544, 36.83242],
									[117.0531, 36.817181],
									[117.0515, 36.80262],
									[117.0526, 36.792999],
									[117.0565, 36.787079],
									[117.0627, 36.783691],
									[117.0747, 36.781151],
									[117.0789, 36.78022],
									[117.0821, 36.779869],
									[117.0876, 36.783199],
									[117.0939, 36.785419],
									[117.1037, 36.78767],
									[117.1124, 36.792889],
									[117.1189, 36.801071],
									[117.1261, 36.814529],
									[117.1355, 36.828232],
									[117.1418, 36.837212],
									[117.1429, 36.839741],
									[117.1445, 36.847721],
									[117.1456, 36.852032],
									[117.1472, 36.85548],
									[117.1494, 36.857201],
									[117.1532, 36.85936],
									[117.1591, 36.86237],
									[117.1639, 36.864979],
									[117.1665, 36.867519],
									[117.1729, 36.874199],
									[117.1782, 36.879971],
									[117.1807, 36.884911],
									[117.1812, 36.89064],
									[117.1849, 36.89204],
									[117.1898, 36.8946],
									[117.194, 36.894741],
									[117.2003, 36.89101],
									[117.2066, 36.88406],
									[117.21, 36.87915],
									[117.2105, 36.876411],
									[117.2101, 36.872742],
									[117.2077, 36.869518],
									[117.2046, 36.86755],
									[117.2023, 36.86628],
									[117.2029, 36.86433],
									[117.2082, 36.861038],
									[117.2154, 36.859261],
									[117.2214, 36.85907],
									[117.2278, 36.858768],
									[117.2327, 36.85788],
									[117.2375, 36.858711],
									[117.2403, 36.86034],
									[117.2449, 36.862091],
									[117.2469, 36.8605],
									[117.2481, 36.8573],
									[117.2498, 36.852379],
									[117.2533, 36.85141],
									[117.2623, 36.853241],
									[117.2699, 36.856239],
									[117.281, 36.863079],
									[117.2912, 36.870369],
									[117.2975, 36.87484],
									[117.3018, 36.87743],
									[117.3059, 36.879341],
									[117.3134, 36.881081],
									[117.3147, 36.879051],
									[117.3152, 36.873169],
									[117.3177, 36.864128],
									[117.3242, 36.852032],
									[117.3304, 36.844158],
									[117.336, 36.840519],
									[117.3414, 36.834591],
									[117.3439, 36.826241],
									[117.3432, 36.81982],
									[117.3389, 36.809151],
									[117.3265, 36.80003],
									[117.3154, 36.791031],
									[117.312, 36.787689],
									[117.3104, 36.785622],
									[117.3115, 36.78334],
									[117.3155, 36.781288],
									[117.3237, 36.779049],
									[117.328, 36.77713],
									[117.3286, 36.774841],
									[117.3283, 36.77037],
									[117.3296, 36.766479],
									[117.3355, 36.760792],
									[117.3411, 36.756931],
									[117.3456, 36.753059],
									[117.3472, 36.749969],
									[117.3449, 36.744228],
									[117.3375, 36.733311],
									[117.3361, 36.728378],
									[117.3364, 36.723911],
									[117.3388, 36.719002],
									[117.3431, 36.716381],
									[117.3535, 36.713459],
									[117.3585, 36.709591],
									[117.3598, 36.705261],
									[117.3619, 36.700569],
									[117.3656, 36.697041],
									[117.3662, 36.69281],
									[117.3618, 36.687851],
									[117.3569, 36.68232],
									[117.3552, 36.677158],
									[117.3551, 36.674191],
									[117.358, 36.67202],
									[117.3634, 36.670448],
									[117.3663, 36.669659],
									[117.3674, 36.666458],
									[117.3653, 36.664051],
									[117.3648, 36.660599],
									[117.3667, 36.656261],
									[117.3686, 36.652031],
									[117.3689, 36.64563],
									[117.3655, 36.63987],
									[117.3599, 36.63549],
									[117.3553, 36.631802],
									[117.3525, 36.626171],
									[117.3514, 36.618481],
									[117.3529, 36.61277],
									[117.3551, 36.607399],
									[117.3568, 36.600769],
									[117.3534, 36.59663],
									[117.3502, 36.592018],
									[117.3494, 36.588921],
									[117.3499, 36.58263],
									[117.3505, 36.576321],
									[117.3497, 36.57151],
									[117.3458, 36.568279],
									[117.3367, 36.564911],
									[117.3292, 36.560169],
									[117.3234, 36.55624],
									[117.3212, 36.552559],
									[117.3214, 36.54776],
									[117.3236, 36.543751],
									[117.3222, 36.540081],
									[117.3156, 36.53569],
									[117.3129, 36.530521],
									[117.3132, 36.525028],
									[117.3157, 36.518848],
									[117.3204, 36.51498],
									[117.323, 36.512131],
									[117.3225, 36.509041],
									[117.3175, 36.502022],
									[117.3123, 36.494888],
									[117.307, 36.482601],
									[117.3017, 36.47226],
									[117.3002, 36.467819],
									[117.2968, 36.46994],
									[117.2909, 36.473461],
									[117.2877, 36.474918],
									[117.2844, 36.4748],
									[117.282, 36.473289],
									[117.2817, 36.470081],
									[117.2819, 36.465839],
									[117.2804, 36.460331],
									[117.2761, 36.454929],
									[117.2696, 36.450642],
									[117.2676, 36.449371],
									[117.2606, 36.44566],
									[117.2531, 36.441479],
									[117.2476, 36.436871],
									[117.2446, 36.43055],
									[117.2414, 36.422741],
									[117.2385, 36.414478],
									[117.2353, 36.411251],
									[117.2306, 36.409039],
									[117.2254, 36.40797],
									[117.221, 36.407478],
									[117.2151, 36.405842],
									[117.2083, 36.402939],
									[117.2023, 36.39854],
									[117.1995, 36.395309],
									[117.196, 36.389912],
									[117.1928, 36.383461],
									[117.1904, 36.379902],
									[117.1871, 36.377239],
									[117.1844, 36.374931],
									[117.1823, 36.369652],
									[117.1806, 36.36253],
									[117.1787, 36.355869],
									[117.1758, 36.351391],
									[117.1725, 36.349411],
									[117.1696, 36.348591],
									[117.166, 36.348331],
									[117.1615, 36.348301],
									[117.1565, 36.348042],
									[117.1503, 36.346741],
									[117.1434, 36.344742],
									[117.1369, 36.342411],
									[117.1331, 36.339279],
									[117.133, 36.336182],
									[117.1325, 36.332169],
									[117.1287, 36.331799],
									[117.1247, 36.33234],
									[117.1183, 36.33493],
									[117.1087, 36.337608],
									[117.1001, 36.3396],
									[117.0945, 36.340931],
									[117.0897, 36.344101],
									[117.0872, 36.343979],
									[117.0843, 36.341782],
									[117.0817, 36.33786],
									[117.0798, 36.331161],
									[117.072, 36.336182],
									[117.0613, 36.342731],
									[117.0533, 36.347149],
									[117.0479, 36.348469],
									[117.0451, 36.34959],
									[117.0436, 36.351311],
									[117.0423, 36.355869],
									[117.0405, 36.35952],
									[117.0377, 36.362942],
									[117.0348, 36.363831],
									[117.0317, 36.363701],
									[117.0272, 36.362968],
									[117.0204, 36.363369],
									[117.015, 36.365841],
									[117.0124, 36.368229],
									[117.0112, 36.37291],
									[117.0107, 36.382999],
									[117.0108, 36.389179],
									[117.0085, 36.39489],
									[117.0075, 36.39912],
									[117.0069, 36.408051],
									[117.0066, 36.415501],
									[117.004, 36.420849],
									[117.0, 36.42411],
									[116.9977, 36.42609],
									[116.9917, 36.431278],
									[116.9862, 36.43499],
									[116.9817, 36.436852],
									[116.9735, 36.438599],
									[116.9651, 36.439461],
									[116.9613, 36.44099],
									[116.9594, 36.44453],
									[116.9591, 36.451061],
									[116.9592, 36.458759],
									[116.9579, 36.46463],
									[116.9561, 36.467949],
									[116.9512, 36.471802],
									[116.9432, 36.47514],
									[116.9374, 36.47702],
									[116.9313, 36.47961],
									[116.9247, 36.482529],
									[116.9171, 36.485458],
									[116.9116, 36.48764],
									[116.9069, 36.48843],
									[116.9035, 36.487801],
									[116.9003, 36.48695],
									[116.8967, 36.487129],
									[116.8947, 36.488201],
									[116.893, 36.49007],
									[116.8913, 36.494701],
									[116.8891, 36.498878],
									[116.8858, 36.501579],
									[116.8804, 36.50259],
									[116.876, 36.503471],
									[116.8739, 36.504539],
									[116.8727, 36.506859],
									[116.8722, 36.510529],
									[116.8713, 36.514221],
									[116.8696, 36.516201],
									[116.8674, 36.516689],
									[116.8641, 36.51675],
									[116.8609, 36.51841],
									[116.8589, 36.521191],
									[116.8583, 36.524872],
									[116.8589, 36.532669],
									[116.8597, 36.541828],
									[116.8612, 36.54731],
									[116.8675, 36.556179],
									[116.8722, 36.562641],
									[116.8723, 36.565971],
									[116.8697, 36.567612],
									[116.8648, 36.569408],
									[116.8571, 36.57272],
									[116.8453, 36.580009],
									[116.8354, 36.58725],
									[116.8291, 36.595131],
									[116.8267, 36.602169],
									[116.8251, 36.607922],
									[116.8234, 36.611851],
									[116.8196, 36.61557]
								]
							};
							var polygonLayerData10 = {
								"reigon": "JiNan",
								"value": [
									[116.902418, 36.62157],
									[116.90814, 36.627912],
									[116.909323, 36.635796],
									[116.909589, 36.639999],
									[116.911811, 36.64264],
									[116.915659, 36.644505],
									[116.921779, 36.645337],
									[116.927587, 36.645379],
									[116.933711, 36.645948],
									[116.941771, 36.646531],
									[116.94986, 36.645014],
									[116.955382, 36.642429],
									[116.960563, 36.641153],
									[116.967343, 36.640939],
									[116.977393, 36.637599],
									[116.983846, 36.637645],
									[116.987023, 36.641344],
									[116.988869, 36.64792],
									[116.989085, 36.655798],
									[116.989361, 36.659213],
									[116.988368, 36.661043],
									[116.994176, 36.661085],
									[116.998683, 36.661905],
									[117.002867, 36.662723],
									[117.006112, 36.661433],
									[117.005215, 36.656176],
									[117.004348, 36.648819],
									[117.003143, 36.64251],
									[117.000307, 36.637501],
									[117.000676, 36.634091],
									[117.001042, 36.630943],
									[117.002666, 36.630167],
									[117.006546, 36.62967],
									[117.014946, 36.628943],
									[117.021726, 36.628729],
									[117.029155, 36.628258],
									[117.036584, 36.627786],
									[117.041109, 36.627294],
									[117.045003, 36.625747],
									[117.047939, 36.623405],
									[117.051858, 36.62002],
									[117.054493, 36.616101],
									[117.052859, 36.613887],
									[117.051962, 36.612408],
									[117.046215, 36.607903],
									[117.037868, 36.604693],
									[117.032422, 36.601766],
									[117.025365, 36.598565],
									[117.018926, 36.597468],
									[117.013451, 36.596641],
									[117.006015, 36.597638],
									[116.999518, 36.600741],
									[116.992989, 36.606208],
									[116.989734, 36.608284],
									[116.986499, 36.608786],
									[116.985549, 36.607467],
									[116.983344, 36.603513],
									[116.981154, 36.598509],
									[116.978031, 36.590873],
									[116.976152, 36.586659],
									[116.971071, 36.580584],
									[116.968196, 36.578463],
									[116.964987, 36.577128],
									[116.961423, 36.578152],
									[116.955572, 36.58126],
									[116.949032, 36.587514],
									[116.944145, 36.590892],
									[116.940886, 36.593231],
									[116.939921, 36.592962],
									[116.937687, 36.591108],
									[116.934496, 36.58846],
									[116.931919, 36.588178],
									[116.929262, 36.593672],
									[116.923984, 36.602035],
									[116.91937, 36.609091],
									[116.915103, 36.61431],
									[116.911826, 36.617962],
									[116.907921, 36.620297],
									[116.90629, 36.621598],
									[116.902418, 36.62157]
								]
							};

							var polygonLayerData = [];
							polygonLayerData.push(polygonLayerData1);
							polygonLayerData.push(polygonLayerData2);
							polygonLayerData.push(polygonLayerData3);
							polygonLayerData.push(polygonLayerData4);
							polygonLayerData.push(polygonLayerData5);
							polygonLayerData.push(polygonLayerData6);
							polygonLayerData.push(polygonLayerData7);
							polygonLayerData.push(polygonLayerData8);
							polygonLayerData.push(polygonLayerData9);
							polygonLayerData.push(polygonLayerData10);
						} else if (item.markName == "Road") {
							var polygonLayerData = [
								[
									[48.007678985595696, 29.34813994295459],
									[48.08492660522461, 29.335570249901906]
								],
								[
									[48.08492660522461, 29.335570249901906],
									[48.07462692260742, 29.293660081522475]
								],
								[
									[48.07462692260742, 29.293660081522475],
									[48.996692657470696, 29.299348899524787]
								]
							];
							mapModel.gisMap.setLineData(polygonLayerData);
						} else {
							var visualLevel = Number(item.visualLevel);
							if (isNaN(visualLevel)) {
								visualLevel = minShowLevel;
							}
							if (visualLevel < minShowLevel || visualLevel > maxShowLevel || mapZoom < visualLevel) {
								continue;
							}
							var markDatas = findLocationMarkDataIcon(item.locationMark);
							var markDataFilter = [];
							var mathRandom = Math.random();
							for (var j = 0; j < markDatas.length; j++) {
								var markDataItem = markDatas[j];
								markDataItem.coordinate = [Number(markDataItem.xpos), Number(markDataItem.ypos)];
								markDataItem.id = j + 1;
								markDataItem.imageName = item.markImage.split("images/")[1];
								markDataItem.selectImageName = markDataItem.imageName;
								markDataFilter.push(markDataItem);
							}
							var zIndexCell = fusiongis.BaseLayer.getLayerZIndex({
								"mapId": renderToId,
								"layerId": mapModel.gisMapId + "_cell"
							});
							var paramObj = {
								datas: markDataFilter,
								layerId: "location" + "_" + item.locationMark,
								minShowLevel: visualLevel,
								zIndex: getLayerzIndex(item.locationMark) ? getLayerzIndex(item.locationMark) : zIndexCell + 1,
							};
							mapModel.gisMap.addLocationMark(paramObj);
						}
					} else {
						//如果未勾选删除 2：网格 3：CEO
						if (item.markName == "Area" || item.markName == "Road") {
							var susouLayer = fusiongis.BaseLayer.getLayer({
								mapId: mapModel.renderToId,
								layerId: mapModel.pologonLayerId + '_area',
							});
							if (!!susouLayer) {
								var layerData = polygonLayerData.layerData ? polygonLayerData.layerData : {};
								if (!!layerData.searchName) {
									clearSearchHilight(mapModel.renderToId, polygonLayerData.layerContent);
								}
								susouLayer.setVisible(false);
								fusiongis.BaseLayer.removeLayer({
									mapId: mapModel.renderToId,
									layerIds: [mapModel.pologonLayerId + '_area']
								})
							}
						}
					}
				}
			}

		}

		function getQueryParams() {
			var mapModel = getActivedMapModel();
			return mapModel.gisMap.getQueryParams();
		}

		function initPolygonLayer(mapId, polygonLayerData, defaultParams) {
			fusiongis.ServicePolygon.addLayer({
				mapId: mapId,
				layerId: "_polygonLayer_" + polygonLayerData.layerContent,
				legendName: '',
				minShowLevel: Number(defaultParams.mapMinZoom),
				maxShowLevel: Number(defaultParams.mapMaxZoom)
			});

			var zIndex = getLayerzIndex(polygonLayerData.location_mark) ? getLayerzIndex(polygonLayerData.location_mark) : 5;
			fusiongis.BaseLayer.setLayerZIndex({
				"mapId": mapId,
				"layerId": "_polygonLayer_" + polygonLayerData.layerContent,
				"zIndex": zIndex
			});
			var layerData = polygonLayerData.layerData ? polygonLayerData.layerData : {};
			var legendList = [];
			var borderWidth = isNotNull(layerData.borderWidth) ? layerData.borderWidth : 3;
			var borderColor = isNotNull(layerData.borderColor) ? layerData.borderColor + ",1" : "255,0,255,1";
			var fillColor = isNotNull(layerData.fillColor) ? (layerData.fillColor + "," + (isNotNull(layerData.opacity) ? layerData.opacity : 1)) : "255,255,255,0";
			if ($.isArray(layerData.thresholdColorList) && layerData.thresholdColorList.length > 0) {
				for (var i = 0; i < layerData.thresholdColorList.length; i++) {
					if (i == 0) {
						legendList.push({
							"label": "",
							"value": ["", layerData.thresholdColorList[i].minVal],
							"style": fillColor,
							"borderColor": borderColor,
							"borderWidth": borderWidth,
							"containsMin": true,
							"containsMax": false
						});
					}
					legendList.push({
						"label": "",
						"value": [layerData.thresholdColorList[i].minVal, layerData.thresholdColorList[i].maxVal],
						"style": layerData.thresholdColorList[i].colorVal + "," + (isNotNull(layerData.opacity) ? layerData.opacity : 1),
						"borderColor": layerData.renderType == 0 ? borderColor : layerData.thresholdColorList[i].colorVal + ",1",
						"borderWidth": borderWidth,
						"containsMin": true,
						"containsMax": false
					});
					if (i == layerData.thresholdColorList.length - 1) {
						legendList.push({
							"label": "",
							"value": [layerData.thresholdColorList[i].maxVal, ""],
							"style": formatThresholdColor(fillColor),
							"borderColor": formatThresholdColor(borderColor),
							"borderWidth": borderWidth,
							"containsMin": true,
							"containsMax": false
						});
					}
				}
			} else {
				legendList.push({
					"label": "",
					"value": ["", ""],
					"style": fillColor,
					"borderColor": borderColor,
					"borderWidth": borderWidth,
					"containsMin": false,
					"containsMax": false
				});
			};

			var _condition = {
				"commonParam": {
					"layerType": polygonLayerData.layerType == 2 ? "line" : "polygon",
					"isUserDefinedLegend": 1,
					"isOnlyGIS": 1
				},
				"styleParam": {
					"showLabels": 1,
					"labelType": isNotNull(layerData.searchName) ? layerData.searchName : "",
					"styleSize": borderWidth
				},
				"renderParam": {
					"legendInfo": {
						"legendType": "rangeColor",
						"renderStyle": layerData.renderType == 0 ? "Fill" : "Border",
						"legendName": "lgName",
						"legendList": legendList
					}
				},
				"onlyGISParam": {
					"FCName": polygonLayerData.layerContent,
					"valueColumnName": layerData.thresholdName,
					"dataColumnName": "",
					"operator": "CONTAIN",
					"value": [],
					"legendID": ""
				}
			};

			fusiongis.OriginalAjax.postJSON({
				url: fusiongis.Constant.GisRootUrl + '/mapRender/dw/getImgToken',
				data: JSON.stringify(_condition),
				success: function(result) {
					if (!!!result) {
						return;
					}
					var responseText = JSON.parse(result);
					var status = responseText.status;
					if (status.code === 1) {
						var _data = responseText.data;
						var requestParam = {
							mapId: mapId,
							layerId: "_polygonLayer_" + polygonLayerData.layerContent,
							imgToken: _data.imgToken,
							imgTokenLabel: _data.imgTokenLabel,
							isShowLabel: false,
							legendInfo: _data.legendInfo,
							titleImgPath: fusiongis.Constant.GisResourceURL + 'legend/',
							businessType: 'SERVICEPOLYGON',
						};
						fusiongis.ServicePolygon.setLayerData(requestParam);
					}
				},
				failure: function(result) {}
			});

			var susouLayer = fusiongis.BaseLayer.getLayer({
				mapId: mapId,
				layerId: "_polygonLayer_" + polygonLayerData.layerContent
			});
			if (!!susouLayer) {
				susouLayer.setVisible(true);
				initCeoLocation(polygonLayerData.location_mark, mapId, zIndex);
			}
		};

		//清除图层搜索高亮
		function clearSearchHilight(mapId, layerId) {
			if (!mapId) {
				var mapModel = getActivedMapModel();
				mapId = mapModel.renderToId;
			}
			var susouLayer = fusiongis.BaseLayer.getLayer({
				mapId: mapId,
				layerId: "_polygonLayer_" + layerId + "_highlight"
			});
			fusiongis.BaseLayer.clearFeatureOnLayer(susouLayer);

			fusiongis.Highlight.removeHighlight({
				mapId: mapId,
				layerId: "_polygonLayer_" + layerId
			});
		};

		//清除所有图层搜索高亮
		function clearAllSearchHilight(mapId) {
			if (!mapId) {
				var mapModel = getActivedMapModel();
				mapId = mapModel.renderToId;
			}
			var mapModel = getActivedMapModel();
			for (var i = 0; i < mapModel.gisMap.locationData.length; i++) {
				var item = mapModel.gisMap.locationData[i];
				if (item.checked) {
					var polygonLayerData = findLocationMarkDataIcon(item.locationMark);
					if ((polygonLayerData.layerType == "1" || polygonLayerData.layerType == "2") && !!polygonLayerData.layerData.searchName) {
						var susouLayer = fusiongis.BaseLayer.getLayer({
							mapId: mapId,
							layerId: "_polygonLayer_" + polygonLayerData.layerContent + "_highlight"
						});
						fusiongis.BaseLayer.clearFeatureOnLayer(susouLayer);
						fusiongis.Highlight.removeHighlight({
							mapId: mapId,
							layerId: "_polygonLayer_" + polygonLayerData.layerContent
						});
					}
				}
			}
			clearCellHighlight();
		};
		//TODO 社区打点方法
		function drawRegion(data) {
			mapData.activedMap.gisMap.huizhiquyu(data);
		}

		function getCEOLocationData(location_mark, mapId, zIndex) {
			$http({
				method: 'POST',
				url: "locationmark/getCeoLayerInfo.action",
				dataType: "json",
				data: {},
				async: false,
				cache: false,
				contentType: "application/json;charset=utf-8"
			}).then(function(data) {
				var data = data.data.data;

				if ($.isEmptyObject(data.info) || data.trans == null) {
					return;
				}
				var ceoLocationDatas = [];
				var trans = data.trans;
				var getRangeImg = function(num) {
					var imgURL = "";
					for (var k = 0; k < ceoRange.length; k++) {
						if (num >= ceoRange[k].minValue && num < ceoRange[k].maxValue) {
							imgURL = ceoRange[k].imgURL;
							return imgURL;
						}
					}
				};

				function setCeoLocationData(data, isMain) {
					var obj = {};

					obj.isMain = isMain;
					obj.imageName = getRangeImg(data.renderVal);
					obj.title = (isMain ? $translate.instant("i18n.map.ceolocation.main") : $translate.instant("i18n.map.ceolocation.second")) + "(" + data.name + ")";
					obj.coordinate = data.coordinate;
					obj.alertParams = [];
					var alertTrans = [];
					for (var k = 0; k < trans.length; k++) {
						alertTrans.push(trans[k].attribute_label);
					}
					obj.tableLabel = alertTrans;

					for (var i = 0; i < data.alertParams.length; i++) {
						var attribute = [];
						for (var j = 0; j < trans.length; j++) {
							attribute.push(data.alertParams[i][trans[j].attribute_name])
						}
						obj.alertParams.push(attribute);
					}
					ceoLocationDatas.push(obj);
				};

				setCeoLocationData(data.info, true);
				var ceoSecondFronts = data.info.secondFront;
				for (var i = 0; i < ceoSecondFronts.length; i++) {
					setCeoLocationData(ceoSecondFronts[i], false);
				}
				ceoLocation = {
					ceoLocationDatas: ceoLocationDatas,
					attrLabelList: data.trans,
					mainLocation: data.info.name
				};

				drawCeoLocation(location_mark, mapId, zIndex);
			});
		};

		function initCeoLocation(location_mark, mapId, zIndex) {
			if (!isNotNull(ceoLocation)) {
				getCEOLocationData(location_mark, mapId, zIndex);
			} else {
				drawCeoLocation(location_mark, mapId, zIndex);
			}

		};

		function drawCeoLocation(location_mark, mapId, zIndex) {
			var ceoLayerId = null;
			if (ceoLocation.attrLabelList.length > 0) {
				ceoLayerId = ceoLocation.attrLabelList[0].layer_id;
			}

			if (ceoLayerId == location_mark) {
				var susouLayer = fusiongis.BaseLayer.getLayer({
					mapId: mapId,
					layerId: "location_ceo"
				});
				if (!!susouLayer) {
					return;
				}
				fusiongis.Icon.addIcon({
					layerId: "location_ceo",
					mapId: mapId,
					datas: ceoLocation.ceoLocationDatas,
					imgPath: CommonPath.imgBasePath
				});
				fusiongis.BaseLayer.registerClick({ //多边形图层注册点击事件
					mapId: mapId,
					layerId: "location_ceo",
					callbackfunc: function(_paramObj) {
						var susouLayer = fusiongis.BaseLayer.getLayer({
							mapId: mapId,
							layerId: mapId + "_service_polygon"
						});
						var mapObj = fusiongis.Map.getMapObj(mapId)

						if (susouLayer && mapObj) {
							fusiongis.ServicePolygon.getClickData(mapObj, susouLayer, _paramObj.e, function(item) {
								if (item.length == 0) {
									FloatmessageService.popCEOWindow(_paramObj, mapId);
								}
							});
						} else {
							FloatmessageService.popCEOWindow(_paramObj, mapId);
						}
					}
				});
				fusiongis.BaseLayer.setLayerZIndex({
					"mapId": mapId,
					"layerId": "location_ceo",
					"zIndex": Number(zIndex) + 1.5
				});

				$timeout(function() {
					$("#searchInput").val(ceoLocation.mainLocation).keyup();
					$timeout(function() {
						$("#searchInputButton").click();
					}, 500);
				});

			}
		};
		//小区通过经纬度高亮
		function cellHighlight(data) {
			clearCellHighlight();
			fusiongis.Map.setMapCenter({
				mapId: getActivedMapModel().gisMap.renderToId,
				coordinate: data.centerPoint
			});
			fusiongis.Highlight.highlight({
				mapId: getActivedMapModel().gisMap.renderToId,
				layerId: getActivedMapModel().gisMap.backendCellLayerId,
				highlightType: 'vector',
				geoIds: [data.attributeList.cellid]
			});
		}

		//清除小区通过经纬度高亮
		function clearCellHighlight() {
			fusiongis.Highlight.removeHighlight({
				mapId: getActivedMapModel().gisMap.renderToId,
				layerId: getActivedMapModel().gisMap.backendCellLayerId
			});
		}

		//获取社区打点方法
		function communityDataShow(communityName, TabService) {
			getActivedMapModel().gisMap.tabSerViceCopy = TabService;
			var thresholdDataNum = LeftService.thresholdData; //阈值获取
			var workName = communityName;
			var workTime = (TabService.showWorking == "Working") ? "工作日" : "休息日";
			var workDay = (TabService.showDaytime == "day") ? "昼" : "夜";
			var communityScreenId = TabService.communityScreenId;
			var communityData = TabService.communityData;
			var indexShow = 0;
			var arrShow = [];
			var zoom = fusiongis.Map.getZoom(getActivedMapModel().gisMap.renderToId);
			//根据昼夜、工作日非工作日删选
			for (var k = 0; k < communityData[0].length; k++) {
				if (communityData[0][k].indexOf(workTime) != -1 && communityData[0][k].indexOf(workDay) != -1) {
					indexShow = k;
				}
			}
			//生成数据
			for (var a = 1; a < communityData.length - 1; a++) {
				if (communityData[a][20].indexOf(workName) != -1) {
					if (communityScreenId.length > 0) {
						for (var b = 0; b < communityScreenId.length; b++) {
							if (communityData[a][0] == communityScreenId[b]) {
								var corrdPoint = [];
								for (var s = 2; s < 12; s++) {
									if (communityData[a][s] != "") {
										corrdPoint.push([communityData[a][s].split(",")[0] * 1, communityData[a][s].split(",")[1] * 1]);
									}
								}

								//阈值数值
								var communityColor = "";
								var communityColorList = thresholdDataNum.colorList;
								for (var m = 0; m < communityColorList.length; m++) {
									var communityColorMax = Number(communityColorList[m].maxVal);
									var communityColorMin = Number(communityColorList[m].minVal);
									if (communityColorList[m].checked) {
										if (communityData[a][indexShow] < communityColorMax && communityData[a][indexShow] > communityColorMin) {
											communityColor = communityColorList[m].colorVal;
										}
									}
								}
								//num超出阈值范围不展示基站
								if (communityColor == "") {
									corrdPoint = "";
								}
								//地图等级小于10不显示数字
								var communityNumShow = communityData[a][indexShow];
								if (zoom < 10) {
									communityNumShow = "";
								}

								var leg = {
									"communityNum": communityNumShow,
									"communityColor": communityColor,
									"CommunityID": communityData[a][0],
									"CommunityCenter": communityData[a][1],
									"corrdPoint": corrdPoint,
									"CommunityPeople": communityData[a][12],
									"NetworkPeople": communityData[a][13],
									"name": communityData[a][14],
									"type": communityData[a][15],
									"population": communityData[a][16],
									"households": communityData[a][17],
									"numberBulid": communityData[a][18],
									"dress": communityData[a][19],
									"checked": false,
									"popIsShow": true
								}
								arrShow.push(leg);
							}
						}
					} else {
						var corrdPoint = [];
						for (var s = 2; s < 12; s++) {
							if (communityData[a][s] != "") {
								corrdPoint.push([communityData[a][s].split(",")[0] * 1, communityData[a][s].split(",")[1] * 1]);
							}
						}

						var communityColor = "";
						//阈值数值
						var communityColorList = thresholdDataNum.colorList;
						//设置阈值
						for (var m = 0; m < communityColorList.length; m++) {
							var communityColorMax = Number(communityColorList[m].maxVal);
							var communityColorMin = Number(communityColorList[m].minVal);
							if (communityColorList[m].checked) {
								if (communityData[a][indexShow] < communityColorMax && communityData[a][indexShow] > communityColorMin) {
									communityColor = communityColorList[m].colorVal;
								}
							}
						}

						//num超出阈值范围不展示基站
						if (communityColor == "") {
							corrdPoint = "";
						}
						//地图等级小于10不显示数字
						var communityNumShow = communityData[a][indexShow];
						if (zoom < 11) {
							communityNumShow = "";
						}

						var leg = {
							"communityNum": communityNumShow,
							"communityColor": communityColor,
							"CommunityID": communityData[a][0],
							"CommunityCenter": communityData[a][1],
							"corrdPoint": corrdPoint,
							"CommunityPeople": communityData[a][12],
							"NetworkPeople": communityData[a][13],
							"name": communityData[a][14],
							"type": communityData[a][15],
							"population": communityData[a][16],
							"households": communityData[a][17],
							"numberBulid": communityData[a][18],
							"dress": communityData[a][19],
							"checked": true,
							"popIsShow": false
						}
						arrShow.push(leg);
					}
				}
			}

			//先点击工作台传给右侧上方搜索数据
			TabService.arrShowCommunity = arrShow;

			//绘制社区
			drawRegion(arrShow);
		}

		var gisReturnObj = {
			mapData: mapData,
			initGisModel: initGisModel,
			changeZoom: changeZoom,
			getActivedMapModel: getActivedMapModel,
			refreshMapData: refreshMapData,
			clearMap: clearMap,
			canExport: canExport,
			mapType: googleMap,
			drawRegion: drawRegion,
			dataDrawPlaygon: dataDrawPlaygon,
			drawPolygon: drawPolygon,
			removeAllPolygon: removeAllPolygon,
			canDrawPologon: canDrawPologon,
			pologonNeedClear: pologonNeedClear,
			syncLeftAndRightWithMainMap: syncLeftAndRightWithMainMap,
			setActiveMapThresholdDatas: setActiveMapThresholdDatas,
			getActiveMapThresholdDatas: getActiveMapThresholdDatas,
			setActivedTabText: setActivedTabText,
			changeActiveMapAccessData: changeActiveMapAccessData,
			getActiveMapAccessType: getActiveMapAccessType,
			getActiveMapAccessData: getActiveMapAccessData,
			getQueryParams: getQueryParams,
			addActiveMapLocationMark: addActiveMapLocationMark,
			sdr_data_user: sdr_data_user,
			sdr_data_kqi: sdr_data_kqi,
			sdr_data_kpi: sdr_data_kpi,
			readcsvData: readcsvData,
			communityDataShow: communityDataShow
		};
		return gisReturnObj;
	}
]);