# ResCSV

ResCSV is a Deno CLI app that converts a group of Java resource files (`.properties` files)  containing translations to `.csv`s and vice versa.

It accepts `.properties` files with the the `<name>_<two-letter-language-code>.properties` or `<name>_<two-letter-language-code>_<capitalized-country-code>.properties` format, such as `account_en.properties`, `account_en_US.properties`, etc.

Instead of working with multiple `.properties` files (each contains values for a different language), ResCSV can create a single CSV file with all values. Once you are done editing it, ResCSV will convert it back to several `.properties` files.

## Prerequisites

- [Deno](https://deno.land/#installation) v2.3 or later

## Run ResCSV

Clone this repo and execute the following command in your terminal to run ResCSV from your local file system:

```bash
deno run --allow-read --allow-write mod.ts
```

### Arguments

- `-c` This command will create a single CSV file from all resource files (`.properties`) in the current directory. The CSV file will be named `all.csv`.

- `-c <file_name_without_extension>` This command will create a CSV file from resource files beginning with the provided file name. The provided file name will also be used as for the CSV file.

- `-s <file_name_without_extension>` This command will create or update several `.properties` files with the values of the provided CSV files. It will not delete any entries in the `.properties` files, it will only add new ones or update existing ones. Add the `-d` flag to enable deletion of `.properties` entries that do not exist in the CSV file.

## Install ResCSV

Clone this repo and execute the following command in your terminal to install ResCSV globally:

```bash
deno install --allow-read --allow-write -n rescsv mod.ts
```
