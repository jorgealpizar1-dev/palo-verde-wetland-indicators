# Recreate summary calculations from the preserved final Earth Engine outputs.
# Run from the package root: Rscript code/summarise_tables.R
dir.create('recreated_tables', showWarnings=FALSE)
x <- read.csv('data/seasonal_results.csv', stringsAsFactors=FALSE)
out <- do.call(rbind, lapply(sort(unique(x$year)), function(y) {
  dry <- x[x$year==y & x$season=='dry',]; wet <- x[x$year==y & x$season=='wet',]
  stopifnot(nrow(dry)==1, nrow(wet)==1)
  data.frame(year=y, dry_pct=dry$integrated_area_ha/dry$valid_area_ha*100,
    dry_ha=dry$integrated_area_ha, wet_pct=wet$integrated_area_ha/wet$valid_area_ha*100,
    wet_ha=wet$integrated_area_ha,
    delta_pp=wet$integrated_area_ha/wet$valid_area_ha*100-dry$integrated_area_ha/dry$valid_area_ha*100,
    delta_ha=wet$integrated_area_ha-dry$integrated_area_ha,
    wet_dry_area_ratio=wet$integrated_area_ha/dry$integrated_area_ha)
}))
write.csv(out, 'recreated_tables/table3_unrounded.csv', row.names=FALSE)
t <- read.csv('data/type_seasonal_results.csv', stringsAsFactors=FALSE)
t$pct <- 100*t$flood_ha/t$area_ha
groups <- split(t, interaction(t$tipo_hum,t$season,drop=TRUE))
tab5 <- do.call(rbind,lapply(groups,function(g) {
  stopifnot(nrow(g)==4, length(unique(g$year))==4)
  data.frame(type=g$tipo_hum[1],season=g$season[1],n_years=4,
             mean_pct=mean(g$pct),min_pct=min(g$pct),max_pct=max(g$pct))
}))
write.csv(tab5, 'recreated_tables/table5_unrounded.csv',row.names=FALSE)
cat('Summary tables written. These are numerical summaries, not accuracy estimates.\n')
