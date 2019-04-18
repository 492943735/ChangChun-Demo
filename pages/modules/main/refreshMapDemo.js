var RefreshMapDemo = (function (f) {
    f.demoConstant = 1;
    var refreshMaps = function () {
        f.Map.refreshMaps(['mapId-1']);
    };
    var updateMap = function () {

        /***  生成弹出信息框 start  ***/
        var divStr = '<div style="width: 300px;height: 270px;border: 2px solid #C59393;' +
            'background-color: #E8DFDF;position: absolute;left: 40%;top: 40%;z-index: 999" ' +
            'id="showPopup"><ul style="list-style: none;padding: 0px 5px">';
        var liStr = '<li style="margin: 5px">';
        var okStr = '<li style="margin: 20px;padding-left: 60px"><input type="button"' +
            ' value="确定" id="submitInfo">&nbsp;&nbsp;<input type="button" value="取消" id="closePopup"></li>';
        var popupObj = [
            '地图中心点:',
            '&nbsp;&nbsp;经度&nbsp;<input type="text" class="lonLat">',
            '&nbsp;&nbsp;纬度&nbsp;<input type="text" class="lonLat">',
            '地图级别:',
            '&nbsp;&nbsp;最大&nbsp;<input type="text" class="mapLevel">',
            '&nbsp;&nbsp;最小&nbsp;<input type="text" class="mapLevel">',
                '地图类型：<select class="mapType"><option>OSM_MAP</option><option>HUAWEI_MAP' +
                '</option><option>GOOGLE_MAP</option><option>BING_MAP</option></select>',
            'URL/KEY:&nbsp;<input type="text" class="urlKey">',
                '控件:<input type="checkbox" value="scaleLine">级别<input type="checkbox" ' +
                'value="zoomContent">比例尺<input type="checkbox" value="mousePosition">经纬度信息' +
                '<input type="checkbox" value="overviewMap">鹰眼'
        ];

        var popStr = divStr;
        popupObj.forEach(function (item) {
            popStr = popStr + liStr + item + '</li>';
        });
        popStr = popStr + okStr + '</ul></div>';

        var mapId = 'mapId-1';
        $('#showPopup').remove();
        $('#' + mapId).append($(popStr));
        /***  生成弹出信息框 end ***/

        $('#submitInfo').off('click').click(function () {
            okButton();
        });
        $('#closePopup').off('click').click(function () {
            $('#showPopup').remove();
        })

        var okButton = function () {

            var updateParam = {mapId: 'mapId-1'};

            //获取中心点信息
            var lon = $('.lonLat')[0].value, lat = $('.lonLat')[1].value, centerInfo;
            if (lon && lat) {
                updateParam.center = [lon, lat];
            }

            //获取最大最小级别
            var maxZoom = $('.mapLevel')[0].value, minZoom = $('.mapLevel')[1].value;
            if (maxZoom && minZoom) {
                updateParam.minZoom = minZoom;
                updateParam.maxZoom = maxZoom;
            }

            //获取地图类型
            var mapType = $('.mapType')[0].value, url;
            if (mapType !== 'OSM') {
                url = $('.urlKey')[0].value;
                /*f.BaseLayer.removeLayer({
                 mapId:mapId,
                 layerIds:['base_layer_osm']
                 })*/
            }
            updateParam.mapType = mapType;
            updateParam.url = url;
            updateParam.layerId = 'huaweiMap';
            //获取地图控件
            var controls = [];
            for (var i = 0; i < $('input[type=checkbox]:checked').length; i++) {
                controls.push($('input[type=checkbox]:checked')[i].value)
            }
            updateParam.controls = controls;

            f.Map.updateMap(updateParam);
            $('#showPopup').remove();
        };

    };

    //根据点线面数据绘制图形
    var setVectorLayerData = function (type) {
        //生成随机的点信息
        var mapId = 'mapId-1';
        var createRandomPoint = function () {
            var extent = [109.07226562500001, 38.315801006824984, 124.89257812500003, 42.15525946577861]
            f.Map.setMapCenter({
                coordinate: [115,40],
                mapId: mapId,
                zoom: 8
            });
            var lons = extent[2] - extent[0], lats = extent[3] - extent[1];
            var tempLon, tempLat, pointArr = [], tempStyleObj;
            var fillColor = [
                [109, 185, 230, 0.5],
                [96, 232, 220, 0.5],
                [79, 132, 76, 0.5],
                [236, 191, 61, 0.5],
                [68, 39, 62, 0.5]
            ];
            for (var i = 5; i < 10; i++) {
                tempStyleObj = {
                    strokeWidth: 1,
                    strokeColor: [15, 11, 210, 1],
                    fillColor: fillColor[i - 5],
                    radius: i,
                    data: []
                };
                for (var j = 0; j < 6000; j++) {
                    tempLon = extent[2] - Math.random() * lons;
                    tempLat = extent[3] - Math.random() * lats;
                    tempStyleObj.data.push([tempLon, tempLat]);
                }
                pointArr.push(tempStyleObj);
            }
            var param = {
                mapId: mapId,
                layerId: 'pointLayer',
                layerType: 'POINT',
                layerData: pointArr
            };
            f.BaseLayer.setVectorLayerData(param);
        };

        //生成随机的线信息
        var createRandomLine = function () {
            var mapId = 'mapId-1';
            var center =  [116, 39];
            f.Map.setMapCenter({
                coordinate: center,
                mapId: mapId,
                zoom: 14
            });
            var constantLong = 2000;
            var centerMactor = ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857');
            var lon, lat, arr = [], tempArr = [];
            for (var i = 0; i < 360; i++) {
                tempArr = [];
                lon = centerMactor[0] + constantLong * Math.cos(i / 180 * Math.PI);
                lat = centerMactor[1] + constantLong * Math.sin(i / 180 * Math.PI);
                tempArr.push(center);
                tempArr.push(ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326'));
                arr.push(tempArr);
            }
            var param = {
                mapId: mapId,
                layerId: 'lineLayer',
                layerData: [
                    {
                        strokeWidth: 2,
                        strokeColor: [123, 148, 82, 1],
                        lineType: '',
                        showArrow: false,
                        data: arr
                    }
                ],
                layerType: 'LINE'
            };
            f.BaseLayer.setVectorLayerData(param);
        };

        //生成随机的面信息
        var createRandomPolygon = function () {
            var mapId = 'mapId-1';
            var betaLon = 0.01, betaLat = 0.001, maxLon, minLon, maxLat, minLat, arr = [], styleObj, styleObjArr = [];
            var center =  [116, 39];
            f.Map.setMapCenter({
                coordinate: center,
                mapId: mapId,
                zoom: 13
            });
            for (var i = 0; i < 5000; i++) {
                styleObj = {
                    strokeWidth: 2,
                    strokeColor: [155, 99, 155, 1],
                    fillColor: [
                        Math.ceil(Math.random() * 255), Math.ceil(Math.random() * 255), Math.ceil(Math.random() * 255),
                        1
                    ],
                    data: []
                };

                minLat = center[1] + betaLat * i;
                maxLat = center[1] + betaLat * (i + 1);
                for (var j = 0; j < 10; j++) {
                    arr = [];
                    minLon = center[0] + betaLon * j;
                    maxLon = center[0] + betaLon * (j + 1);
                    arr.push([minLon, minLat]);
                    arr.push([maxLon, minLat]);
                    arr.push([maxLon, maxLat]);
                    arr.push([minLon, maxLat]);
                    styleObj.data.push(arr);
                }
                styleObjArr.push(styleObj);
            }
            var param = {
                mapId: mapId,
                layerId: 'polygonLayer',
                layerData: styleObjArr,
                layerType: 'POLYGON'
            };
            f.BaseLayer.setVectorLayerData(param);
        };
        if (type === 'point') {
            createRandomPoint();
        }
        else if (type === 'line') {
            createRandomLine();
        }
        else if (type === 'polygon') {
            createRandomPolygon();
        }
    };

    var removeVectorLayer = function (param) {
        var mapId = 'mapId-1';
        f.BaseLayer.removeLayer({
            mapId: mapId,
            layerIds: [param + 'Layer']
        });
    };
    var addChartOnMap = function () {
        var paramObj = {
            mapId: 'mapId-1',
            data: {
                pie: [],
                bar: []
            }
        };

        var mapExtent = fusiongis.Map.getExtent(paramObj.mapId);
        var lons = mapExtent[2] - mapExtent[0], lats = mapExtent[3] - mapExtent[1];
        for (var i = 0; i < 50; i++) {
            //随机生成饼图
            var pieId = 'pie' + i;
            var tempPie = {id: pieId, width: '40px', height: '40px', Data: [], color: ['#369858', '#569814']};
            tempPie.position =
                ol.proj.toLonLat([mapExtent[2] - Math.random() * lons, mapExtent[3] - Math.random() * lats]);
            tempPie.Data.push({
                value: Math.floor(Math.random() * 20),
                name: '直接访问'
            });
            tempPie.Data.push({
                value: Math.floor(Math.random() * 20),
                name: '间接访问'
            });
            paramObj.data.pie.push(tempPie);
            //随机生成柱状图
            var tempBar = { width: '40px', height: '40px', xAxisData: [], Data: [], color: ['#cc2698', '#dd5987']};
            tempBar.id = 'bar' + i;
            tempBar.position =
                ol.proj.toLonLat([mapExtent[2] - Math.random() * lons, mapExtent[3] - Math.random() * lats]);
            for (var j = 0; j < 6; j++) {
                tempBar.Data.push(Math.floor(Math.random() * 15));
                tempBar.xAxisData.push({value: 'bar' + j});
            }
            paramObj.data.bar.push(tempBar);
        }
        fusiongis.Chart.addChartOnMap(paramObj);
    };

    var convergeGrid = function (_mapId) {
        var data = [];
        if (data.length === 0) {
            for (var j = 0; j < 400; j++) {
                var lon = -50 + 100 * Math.random();
                var lat = -30 + 60 * Math.random();
                data.push([lon, lat]);
            }
        }

        var param = {
            mapId: _mapId,
            width: 50,
            height: 50,
            data: data,
            color: [
                'rgba(0,205,102,0.5)', 'rgba(0,205,102,0.5)', 'rgba(0,205,102,0.5)', 'rgba(0,205,102,0.5)','rgba(0,205,102,0.5)'
            ],
            step: 2
        };

        fusiongis.ConvergeGrid.convergeForGrid(param);
    };

    var convergeCell = function () {
        var data = [];
        if (data.length === 0) {
            for (var j = 0; j < 400; j++) {
                var lon = -50 + 100 * Math.random();
                var lat = -30 + 60 * Math.random();
                data.push([lon, lat]);
            }
        }

        var param = {
            mapId: 'mapId-1',
            radius: 30,
            data: data,
            color: [
                'rgba(32,3,163,0.3)', 'rgba(33,207,235,0.3)', 'rgba(49,221,44,0.3)', 'rgba(225,138,12,0.3)',
                'rgba(228,21,46,0.3)'
            ],
            step: 2
        };

        fusiongis.ConvergeCell.convergeForCell(param);
    };

    var convergeClose = function () {
        var param = {
            mapId: 'mapId-1'
        };
        fusiongis.ConvergeCell.removeConverge(param);
        fusiongis.ConvergeGrid.removeConverge(param);
    };
    return {
        refreshMaps: refreshMaps,
        updateMap: updateMap,
        setVectorLayerData: setVectorLayerData,
        removeVectorLayer: removeVectorLayer,
        addChartOnMap: addChartOnMap,
        convergeGrid: convergeGrid,
        convergeCell: convergeCell,
        convergeClose: convergeClose
    }
}(fusiongis));










