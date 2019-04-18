var GridDensityDemo = (function (g) {

    var addGridDensity = function (paramObj) {
        var mapId = paramObj.mapId, layerId = paramObj.layerId, kpi = paramObj.kpi;

        var _buildData = function () {
            var coordinates = [];
            if (coordinates.length === 0) {
                for (var i = 0; i < 1000; i++) {
                    var _x = -180 + 360 * Math.random();
                    var _y = -85 + 170 * Math.random();
                    coordinates.push([_x, _y]);
                }
            }

            return coordinates;
        };

        var _paramObj = {
            mapId: mapId,
            layerId: layerId,
            datas: _buildData(),
            gridWidth: 50,
            gridHeight: 50,
			color: 'red',
        };

        g.GridDensity.addGridDensity(_paramObj);
    };
    return {
        addGridDensity: addGridDensity
    }
}(fusiongis));