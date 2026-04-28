## Form Satusehat Antenatal Care (ANC) V.2

### Files
- [HTML form](./index.html)
- [CSS](./index.css)
- [Script](./functionality.js)

### Usage
konten file harus di gabung:
- compile css
    ```bash
    # jalankan di root directory repo ini
    $ npm run anc2:b

    # atau build secara incremental (watch)
    $ npm run anc2:w
    ```
    compile output css berada di `<repo-dir>/dist/forms/anc2/index.css`
- lalu gabungkan 3 file yg dibutuhkan kedalam 1 file html:
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
# jalankan di root directory
tera-askep sync anc2
```
