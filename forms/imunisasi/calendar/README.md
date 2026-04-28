# Imunisasi

## Kalender
---
Directory: [./calendar](./calendar)
---
terbagi dalam 2 versi

### Perbedaan Versi
- bentuk data _(yang tersimpan didalem `askep_data_list.data_json`)_:
    1. ```jsonc
        {
            "version": "1",
            "<row>_<umur>_<field>": "<nilai>"
            //...
        }
        
        // contoh:
        {
            "hepatitis-b_b0_praktik-tanggal": "yyyy-mm-dd",
            "hepatitis-b_b0_praktik-waktu": "HH:mm:ss",
            "hepatitis-b_b0_vaksin": "1",
            "hepatitis-b_b0_vaksin-dosis": "1",
            "hepatitis-b_b0_vaksin-dosis-unit": "1",
            "hepatitis-b_b0_program": "2",
            "hepatitis-b_b0_deskripsi": "sebuah deskripsi",
            "hepatitis-b_b0_kipi-check": "t/f",
            "hepatitis-b_b0_kipi-kode": "1",
        }
        ```
    2. ```jsonc
        {
            "version": "2",
            "<row>": {
                "<umur>": {
                    "<field>": "<nilai>"
                    //...
                }
            }
        }
        
        // contoh:
        {
            "hepatitis-b": {
                "b0": {
                    "praktik-tanggal": "",
                    "praktik-waktu": "",
                    "vaksin": "",
                    "vaksin-dosis": "",
                    "vaksin-dosis-unit": "",
                    "program": "",
                    "deskripsi": "",
                    "kipi-check": "on",
                    "kipi-kode": "1"
                }
            }
        }
        ```
- besaran data json yg tersimpan:
    1. semua row,umur,& nilai tersimpan dalam askep
    2. hanya sebagian yang tersimpan, data yang tersimpan hanyalah yg telah terisi

### Build
kalender imunisasi utamanya saya generate, menggunakan 1 [config](./scripts/conf.js) pada variable `ROWS`, masing-masing versi mempunyai caranya sendiri untuk menggenerate.

untuk menggenerate jalankan command dibawah didalam folder ini, hasil generate html berada di [dist/form/imunisasi/calendar](../../../dist/forms/imunisasi/calendar)

```bash
# versi 1
$ node ./main.js v1

# versi 2
$ node ./main.js v2
```

hanya saja, teruntuk script & stylesheet masih belum menjadi 1 dalam html
dalam hasil output terdapat keyword `{{ .Stylesheet }}` dan `{{ .Script }}`,
silahkan mengreplace line tersebut dengan konten script/stylesheet yang telah ditentukan.

- versi 1:
    - script -> [v1.js](./calendar/templates/v1.js)
    - stylesheet -> [v1.css](./calendar/templates/v1.css)
- versi 2:
    - script -> [v2.js](./calendar/templates/v2.js)
    - stylesheet -> [v1.js](./calendar/templates/v1.css) _(sengaja sama dengan versi 1)_


### Note
- versi 2 belum mempunyai cara pengiriman pada satusehat console
- untuk script dan stylesheet saya biasanya menggunakan tools sendiri untuk merging, dan bilaperlu menggunakannya bisa dilihat di [github](https://github.com/scarlass/tera-askep) menggunakan golang
