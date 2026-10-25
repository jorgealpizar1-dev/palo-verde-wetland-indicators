// Remotely sensed seasonal hydrological dynamics of tropical wetlands in Costa Rica
// Jorge Alpizar et al. | final indicator configuration | WELA-D-26-00174
// WELA-D-26-00174 | Corrida final seleccionada para la revisión.
// Ejecutar un año/estación por vez para evitar agregaciones concurrentes.
// No exporta ni modifica assets.
// Upload data/wetland_inventory_shp/Humedales_Estudio.shp and its companion files.
// Import that table asset into the Code Editor under the variable name table.
var wetlandInventory = table;
var roi = wetlandInventory.geometry();
var year = 2022;                 // cambiar a 2020, 2021, 2022 o 2023
var season = 'lluviosa';         // 'seca' o 'lluviosa'
var start = season === 'seca' ? ee.Date.fromYMD(year, 2, 1) : ee.Date.fromYMD(year, 8, 1);
var end = season === 'seca' ? ee.Date.fromYMD(year, 6, 1) : ee.Date.fromYMD(year, 12, 1); // exclusivo
var sceneCloud = season === 'seca' ? 10 : 20;
var sarPercentile = season === 'seca' ? 20 : 80;
var cloudScoreThreshold = 0.60;

var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(roi).filterDate(start, end)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
  .select('VV');
var radar = s1.median().clip(roi).focalMedian(3, 'circle', 'pixels');
var sarThreshold = ee.Number(radar.reduceRegion({
  reducer: ee.Reducer.percentile([sarPercentile]), geometry: roi,
  scale: 10, maxPixels: 1e9, tileScale: 4
}).get('VV'));
var sarWater = radar.lt(sarThreshold);

var s2 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterBounds(roi).filterDate(start, end)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', sceneCloud));
var cloudScore = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED')
  .filterBounds(roi).filterDate(start, end);
var joined = ee.ImageCollection(ee.Join.saveFirst('csplus').apply({
  primary: s2, secondary: cloudScore,
  condition: ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
}));
var mndwi = joined.map(function(image) {
  image = ee.Image(image);
  var clear = ee.Image(image.get('csplus')).select('cs_cdf').gte(cloudScoreThreshold);
  return image.normalizedDifference(['B3', 'B11']).rename('MNDWI')
    .updateMask(clear).toFloat();
}).mean().clip(roi);
var index = mndwi.add(1).divide(2).multiply(100).toInt();
var integrated = sarWater.and(index.gte(35));
if (season === 'lluviosa') integrated = integrated.or(index.gte(43));

var valid = mndwi.mask().and(radar.mask());
var hectares = ee.Image.pixelArea().divide(10000).rename('ha');
var validArea = hectares.updateMask(valid).reduceRegion({
  reducer: ee.Reducer.sum(), geometry: roi, crs: 'EPSG:5367', scale: 10,
  maxPixels: 1e9, tileScale: 4
}).get('ha');
var integratedArea = hectares.updateMask(integrated.updateMask(valid)).reduceRegion({
  reducer: ee.Reducer.sum(), geometry: roi, crs: 'EPSG:5367', scale: 10,
  maxPixels: 1e9, tileScale: 4
}).get('ha');
print('WELA FINAL CS+ 0.60', ee.Dictionary({
  year: year, season: season, nS1: s1.size(), nS2: s2.size(),
  sarThreshold_dB: sarThreshold, validArea_ha: validArea,
  integratedArea_ha: integratedArea,
  integratedPct: ee.Number(integratedArea).divide(validArea).multiply(100)
}));

// Cross-sensor diagnostic areas on the same valid support (Table 4).
function areaHa(mask, geometry) {
  return hectares.updateMask(mask).reduceRegion({reducer: ee.Reducer.sum(),
    geometry: geometry, crs: 'EPSG:5367', scale: 10,
    maxPixels: 1e9, tileScale: 4}).get('ha');
}
print('Single-sensor diagnostics', ee.Dictionary({
  sar_ha: areaHa(sarWater.updateMask(valid), roi),
  optical_ha: areaHa(index.gte(35).updateMask(valid), roi)
}));
// Display only; tasks are not exported or submitted by this script.
Map.centerObject(wetlandInventory, 10);
Map.addLayer(integrated.updateMask(valid).selfMask(), {palette:['173b8c']}, 'Integrated indicator');
