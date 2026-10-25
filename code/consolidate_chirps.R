# Consolidate the original monthly CHIRPS zonal sheets.
# Same record extraction as the original thesis R script; portable paths.
# Run from the package root: Rscript code/consolidate_chirps.R
if (!requireNamespace('readxl', quietly=TRUE)) stop('Install the readxl package first.')
files <- list.files('data/chirps_monthly',pattern='^[0-9]{4}_[0-9]{2}.*\\.xlsx$',full.names=TRUE)
stopifnot(length(files)>0)
process_file <- function(path) {
  nm <- basename(path)
  a <- as.data.frame(readxl::read_excel(path,col_names=FALSE,skip=1))
  stopifnot(ncol(a)>=2)
  data.frame(Year=as.integer(substr(nm,1,4)),Mes=as.integer(substr(nm,6,7)),
    Escala=ifelse(grepl('roi',nm,ignore.case=TRUE),'Roi','Cuenca'),
    fid=as.character(a[[1]]),DN=as.numeric(a[[2]]))
}
combined <- do.call(rbind,lapply(files,process_file))
dir.create('recreated_tables',showWarnings=FALSE)
write.csv(combined,'recreated_tables/chirps_monthly_consolidated.csv',row.names=FALSE)
