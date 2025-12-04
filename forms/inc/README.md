# Form Satusehat Initial Neonatal Care (INC)

### Primary Files
- [HTML form](./index.html)
- [CSS](./index.css)
- [Script](./index.js)

terpisah menjadi 3, dan hasil akhirnya perlu diconcat atau digabungkan kedalam 1 html, teruntuk css dikarenakan menggunakan tailwind perlu dicompile terlebih dahulu.

### Build
compile css:
```bash
# jalankan di root directory repo ini
$ npm run inc:build
```
```bash
# atau build secara incremental
$ npm run inc:watch
```

compile output css berada di:
```bash
<repo-dir>/dist/forms/inc/index.css
```

lalu gabungkan 3 file yg tersebut kedalam 1 file:
```html
<style>
    /**
    * primary style content (hasil compile output css)
    */
</style>

<script>
    // primary script content
</script>

<!-- primary html content  -->
```

atau untuk mempermudah proses penggabungan file bisa menggunakan tools [tera-askep](https://github.com/scarlass/tera-askep):
```bash
tera-askep sync antenatal
```
