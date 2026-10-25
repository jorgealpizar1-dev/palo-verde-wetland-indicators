# Palo Verde seasonal inundation indicator research package

Associated manuscript: Remotely sensed seasonal hydrological dynamics of tropical wetlands in Costa Rica
Authors: Jorge Alpizar, Adolfo Quesada-Roman and Christian Birkel

## Contents and provenance

- `code/gee_final_indicator.js`: final Cloud Score+ 0.60 decision rules, with a portable imported monitoring domain. It retains the season-specific percentiles, cloud limits, MNDWI integer conversion and 35/43 integration logic used in the preserved run. Single-sensor diagnostic reductions are included.
- `data/wetland_inventory_shp/` and `data/wetland_inventory.geojson`: the original 39 polygon fragments (33 wetland identifiers), in native Shapefile form and the preserved WGS84 GeoJSON copy. Source: SNIT/IGN inventory. No synthetic geometries or field labels were created.
- `data/seasonal_results.csv`: the eight preserved final-run summaries.
- `data/type_seasonal_results.csv`: the original type-level and nested shrimp-pond reductions for four years and two seasons.
- `expected_outputs/`: original detailed reduction records for traceability.
- `code/summarise_tables.R`: arithmetic for Tables 3 and 5 from preserved reductions. Mean/minimum/maximum are across four annual values per season; shrimp ponds are a nested subset.
- `code/consolidate_chirps.R` and `data/chirps_monthly/`: portable consolidation of the original monthly CHIRPS zonal worksheets, retaining their original DN fields. These contextual sheets are not independent inundation reference labels.

## Run the Earth Engine workflow

1. Use an authorized Earth Engine account and project.
2. Upload `data/wetland_inventory_shp/Humedales_Estudio.shp` and its companion `.shx`, `.dbf` and `.prj` files as a table asset in that project. Import that asset into the Code Editor under the variable name `table`. The GeoJSON copy is provided for other GIS tools.
3. Paste the GEE script, choose `year` (2020 through 2023) and `season` (`seca` or `lluviosa`), and run one case at a time. The time windows are [1 February,1 June) and [1 August,1 December).
4. Compare the printed outputs with the preserved CSV. Cloud masking and valid-pixel denominators must be retained. The package does not publish or change any existing asset.

Collections: COPERNICUS/S1_GRD; COPERNICUS/S2_HARMONIZED; GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED. Area reductions use EPSG:5367 and scale 10 m. The computational grid is not independent 10 m optical information from the 20 m B11 band.

## Run the numerical summaries

Use R from the package root. The table-summary script uses base R; monthly XLSX consolidation additionally needs `readxl`. The files keep full calculation precision. Round areas to one decimal and the Table 3 percentages and ratios to two decimals for display.

## Verification and limits

The preserved numerical outputs were checked against the manuscript. The GEE final configuration was previously run for all eight cases, and the two 2020 sensor comparisons were rerun. The entire time series was not rerun while assembling this package. The portable R scripts were inspected and their table formulas independently checked in Python; the R scripts themselves have not yet been executed in R. Asset import and full execution by another account remain to be checked.

There is no independent date-matched validation set for the 2020-2023 maps. Decimal precision, sensor agreement and the June 2024 reconnaissance must not be presented as classification accuracy. Cloud Score+ alternatives use different valid supports. No event-specific causal attribution to Hurricane Julia is made.

## Source terms

Source datasets retain their original provenance and terms. This package does not grant a new licence over third-party source datasets.
