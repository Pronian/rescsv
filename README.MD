# ResCSV

ResCSV is a Deno CLI app that converts a group of Java resource files
(`.properties`) files to `.csv`s and vice versa.

This is useful for cases where resource files are used for localization. Instead
of working with multiple `.properties` files (each contains values for a
different language), ResCSV can create a single CSV file with all values. Once
you are done editing it, ResCSV will convert it back to several `.properties`
files.

## Prerequisites

- [Deno](https://deno.land/#installation) v1.23 or later

## Run ResCSV

### From URL

Execute the following command in your terminal to run ResCSV from the GitHub
URL:

```bash
deno run --allow-read --allow-write --import-map=import_map.json https://raw.githubusercontent.com/Pronian/rescsv/master/mod.ts
```

### Run locally

Clone this repo and execute the following command in your terminal to run ResCSV
from your local file system:

```bash
deno run --allow-read --allow-write mod.ts
```

### Arguments

- `-c <file_name_without_extension>` This command will create a CSV file from
  resource files beginning with the provided file name. The provided file name
  will also be used as for the CSV file.

- `-s <file_name_without_extension>` This command will create or update several
  `.properties` files with the values of the provided CSV files. It will not
  delete any entries in the `.properties` files, it will only add new ones or
  update existing ones. Add the `-d` flag to enable deletion of `.properties`
  entries that do not exist in the CSV file.

## Install ResCSV

### From URL

```bash
deno install --allow-read --allow-write --import-map=import_map.json -n rescsv https://raw.githubusercontent.com/Pronian/rescsv/master/mod.ts
```

### From local files

```bash
deno install --allow-read --allow-write -n rescsv mod.ts
```
