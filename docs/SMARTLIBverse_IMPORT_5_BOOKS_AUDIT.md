# Audit import lima buku SMARTLIBverse

Tarikh: 23 November 2026 (Asia/Kuala_Lumpur). Branch: `feature/library-five-books`.

## Baseline dan skop terlindung

- Baseline produksi: `ce82cb755313568895b681e513f9af4b5fd898a7`, tree `74d62a2ff32b042cae8c460dbcc544f186f397cf`.
- Repo ialah laman statik HTML/CSS/ES modules, Node 22+, Playwright dan GitHub Pages. Tiada React/Vite atau backend baharu.
- KOMPOS sedia ada: `books/kompos/index.html`, data `book-data.js`, enjin `js/flipbook.js`, CSS `css/flipbook.css`, manifest dan 23 ilustrasi/bahan WebP. Jumlah 28 fail.
- Subtree KOMPOS: `1c38aa28ece13527ecb1e2dd0cb46250ec12ce3c`. Hash setiap fail baseline disimpan dalam `kompos-protected-baseline.json`; ujian mengesahkan set laluan dan bait sumber tidak berubah.
- URL KOMPOS kekal: <https://skpkt.github.io/smartlibverse/books/kompos/>. Kunci bacaan `smartlibverse_kompos_read_v1`; refleksi sesi `smartlibverse_kompos_reflection_v1`; 5 halaman dan 10 bahan pengelasan tanpa markah dikekalkan.
- Tiada folder/data/aset KOMPOS diimport, disalin atau didaftarkan dalam enjin baharu. Kad pautan legasi menuju pembaca asal dan membaca kemajuan asal tanpa menulisnya. Laluan `reader.html?book=kompos` hanya mengalihkan ke URL asal.
- ROKET, tiga cerita/kuiz asal, XP, avatar, collision dan `smartlibverse_demo_v1` tidak diubah. `js/main.mjs` hanya menambah pautan koleksi pada menu rak perpustakaan; query versi script di `world/index.html` dikemas kini.
- `SKPKT/smartlib`, login SMARTLIB, auth, Apps Script, Sheets, API, dashboard dan data sekolah tidak disentuh. Semakan laman login adalah baca sahaja.

## Inventori input dan keselamatan arkib

Wrapper `SMARTLIBverse_CodeX_5_Buku_Tanpa_KOMPOS.zip` mengandungi manifest serta enam ZIP yang diminta. SHA-256 wrapper: `959fb00c6614da72a73ab6bfd60a2550fc1f1da7fdea72b9e08e4acb8096395d`.

Setiap ZIP dalaman diperiksa saiz dan SHA-256 terhadap manifest **sebelum** kandungannya diekstrak. Semua enam sepadan. Template berasingan yang dilampirkan mempunyai hash sama dengan salinan dalam wrapper. Butiran lengkap: `five-book-inputs.json` dan manifest per buku. Tiada arkib KOMPOS dibuka.

Ekstrak dibuat di luar repo/penerbitan, menolak laluan mutlak, `..`, symlink, pendua huruf besar/kecil, bilangan/saiz ekstrak berlebihan. `__MACOSX`, `.DS_Store`, backup dan enjin demo lama tidak diterbitkan. Folder pembungkus tunggal dibuang untuk mengelakkan had panjang laluan Windows; laluan dalaman buku tidak diubah.

| Sumber rasmi | Halaman | Aktiviti | Aset digunakan | Resolusi / versi | Keputusan penerbitan |
|---|---:|---:|---:|---|---|
| RIBUT Enam Halaman Hybrid | 6 | 6 situasi | 6 halaman + 6 SVG asal | 1087×1536; PNG → WebP lossless tanpa resize/crop, decoded RGBA sama | Lulus quality gate |
| TSUNAMI Kawasan Pantai Dikemaskini | 6 | 6 situasi | 6 WebP halaman | 1087×1536; label KAWASAN PANTAI diperiksa pada halaman 1–2 | Lulus quality gate |
| GEMPA BUMI 6 Halaman V1 penuh | 6 | 6 kad | 6 halaman + 6 kad | Halaman 1600×2400; kad 960×600 | Draf: visual halaman 1–2 perlu semakan pengguna |
| BANJIR 6 Halaman V1 | 6 | 6 kad | 6 halaman + 6 kad | Halaman 1024×1536; kad 960×600 | Lulus semakan visual/fakta dengan nota keselamatan sumber dipaparkan |
| PERSENYAWAAN V3 | 5 | 6 kad | 5 halaman + 6 kad | Halaman 1087×1536; enam kad baharu 960×600 | Lulus; penerbit disahkan pengguna pada 23 November 2026 |
| Template enjin sahaja | — | — | Rujukan HTML/CSS/JS | Tiada data/aset KOMPOS | Bukan buku; katalog kosong tidak disalin |

Jumlah input tepat **5 buku, 29 halaman cerita, 30 situasi aktiviti**. Build awam mengandungi **4 buku baharu, 23 halaman**; GEMPA BUMI 6 halaman dikekalkan untuk semakan setempat sahaja. Aktiviti bukan halaman tambahan. TSUNAMI membekalkan ikon, bukan kad bergambar; ikon asal dikekalkan, tidak menggantikan sebarang ilustrasi yang dibekalkan.

## Enjin, adapter dan metadata

`library/flipbooks/` ialah satu katalog dan satu pembaca bersama, berpandukan struktur reader, navigasi, palet dan kontrak kemajuan template. Keupayaan yang tiada dalam template ditambah: renderer halaman imej penuh, fit/zoom/reset, overlay aktiviti berasingan dan penyuntingan teks pendamping. Enjin KOMPOS tidak diganti.

- `catalog.js` mendaftar lima buku baharu sahaja. Setiap buku mempunyai `book.json`, `manifest.json` dan aset relatif sendiri.
- `tools/import-five-books.mjs` ialah adapter luar talian eksplisit, hanya membaca sumber yang telah diverifikasi melalui `SOURCE_ROOT`; ia tidak menyentuh `books/kompos`. Data sumber berlainan dipetakan kepada kontrak yang sama. Dialog/fakta/nota/amaran/rumusan asal dipelihara sebagai teks HTML pendamping.
- Urbanist dimuat sekali bagi setiap halaman melalui Google Fonts, dengan fallback sistem. Fail font tidak diedarkan.
- Semua imej `contain`, nisbah asal, ruang letterbox; tiada crop/resize aset. Zum menggunakan permukaan yang boleh ditatal, tidak memotong gambar secara kekal. Pertukaran halaman memulihkan Muat Penuh.
- Teks terbenam dalam gambar kekal raster. Hanya teks HTML pendamping boleh disunting, dieksport/import JSON dan dipulihkan. Renderer menggunakan `textContent`, tidak memasukkan HTML daripada import.
- Penulis/penerbit diambil daripada sumber atau pengesahan pengguna. Penerbit PERSENYAWAAN disahkan pengguna pada 23 November 2026 sebagai **Pusat Sumber SKPK Taiping**. Manifest merekod pengesahan ini sebagai editorial override; checksum arkib dan data sumber asal kekal.
- Kemajuan baharu: `smartlibverse_book_<id>_visited_v1`. Suntingan: `smartlibverse_book_<id>_text_v1`. Aktiviti tidak menambah halaman atau mengubah progress. Tiada markah/pemasa/penalti/had percubaan, API sekolah, data murid atau rekod NILAM.
- Enam situasi per buku menyokong cuba semula, lihat jawapan, seterusnya, ulang semua, langkau/tutup, Escape, fokus semula, dan keyboard. Tiada aktiviti menjadi syarat tamat.

## Quality gate fakta dan ilustrasi

- RIBUT: bangunan kukuh, jauhi kawasan terbuka/pokok tinggi/wayar jatuh dan patuhi amaran sepadan dengan panduan [METMalaysia](https://www.met.gov.my/pendidikan/fenomena-cuaca/). Semua enam halaman dan SVG asal digunakan.
- TSUNAMI: siri ombak, perpindahan ke kawasan tinggi dan ombak susulan disemak dengan [METMalaysia](https://www.met.gov.my/pendidikan/tsunami/). Halaman lama `-asal.jpg` tidak digunakan atau diterbitkan.
- GEMPA BUMI: teks dan enam jawapan menyokong Tunduk, Lindung, Pegang. Namun halaman 1–2 menunjukkan orang bergerak di jalan dalam suasana runtuhan/gegaran. Laporan asal sendiri memerlukan semakan pengguna sebelum penerbitan. Ini boleh mengelirukan berbanding [USGS](https://www.usgs.gov/faqs/what-should-i-do-during-earthquake), yang menasihatkan orang di dalam supaya berlindung dan tidak berlari keluar ketika gegaran. Ilustrasi tidak disunting diam-diam. Buku draf tidak disalin ke `dist`; pembaca awam menolaknya walaupun `review=1`. Pratonton hanya dibenarkan pada loopback dan server QA, bukan GitHub Pages.
- BANJIR: enam kad melarang bermain/meredah air dan sentuhan elektrik basah; kad 6 menunjukkan kereta **berhenti** sebelum jalan banjir. Pada halaman 5, nota asal “Jika tangan atau lantai basah…” ditampilkan di luar panel teks pendamping supaya tidak tersembunyi. Ini selaras dengan [panduan Suruhanjaya Tenaga](https://st.gov.my/sites/default/files/2026-02/garis-panduan-kaedah-kaedah-keselamatan-pengguna-elektrik-di-musim-banjir.pdf). Gambar asal tidak diubah.
- PERSENYAWAAN: lima halaman, V3 enam kad tersendiri. Sperma/ovum, persenyawaan, pembahagian zigot dan implantasi blastokista diperiksa terhadap [MedlinePlus/NLM](https://medlineplus.gov/ency/article/002398.htm). Diagram ialah model pendidikan, bukan skala mikroskop sebenar. Kad 6 menggambarkan blastokista, bukan janin besar.

## Build, rollback dan menambah buku

Workflow Pages sedia ada dikekalkan. `npm test`, `npm run build`, `npm run test:browser` menjalankan semakan game lama dan koleksi baharu. Build memeriksa manifest dan menolak kebocoran draf. Server QA bind ke `127.0.0.1`; fallback aset draf hanya hidup apabila `LIBRARY_REVIEW=1`, tidak termasuk build laman.

Rollback: revert commit merge integrasi ini melalui Git, tanpa force-push. Ia membuang pautan/modul baharu sahaja; fail KOMPOS baseline serta semua kunci simpanan sedia ada tidak perlu dipulihkan atau dimigrasi. Suntingan/progress buku baharu boleh dibiarkan pada pelayar dan tidak menyentuh data lama.

Buku baharu seterusnya boleh ditambah melalui folder data/aset/manifest dan rekod katalog, tanpa menulis pembaca baharu. Kontrak versi ini mengehadkan lima ID yang diaudit; penambahan ID/metadata/bilangan halaman baharu perlu dikemas kini bersama validasi dan ujian supaya tidak diterbitkan tanpa quality gate.
