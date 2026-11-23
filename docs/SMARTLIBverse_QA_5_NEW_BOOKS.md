# QA lima buku baharu — SMARTLIBverse

Tarikh ujian tempatan: 23 November 2026, Asia/Kuala_Lumpur. Data ujian ialah data sintetik dalam konteks Chromium baharu, bukan pelayar atau data murid sebenar.

## Keputusan buku dan quality gate

| Buku | Halaman cerita | Situasi | Fakta/visual | Status penerbitan |
|---|---:|---:|---|---|
| RIBUT | 6 | 6 SVG asal | LULUS | Sedia diterbitkan |
| TSUNAMI dikemas kini | 6 | 6 ikon sumber | LULUS; papan tanda KAWASAN PANTAI pada halaman 1–2 | Sedia diterbitkan |
| GEMPA BUMI V1 penuh | 6 | 6 kad 960×600 | MENUNGGU SEMAKAN PENGGUNA: visual orang di jalan ketika gegaran, halaman 1–2 | Draf, dikecualikan daripada Pages |
| BANJIR V1 | 6 | 6 kad 960×600 | LULUS; nota elektrik basah sumber kelihatan pada halaman 5 | Sedia diterbitkan |
| PERSENYAWAAN V3 | 5 | 6 kad baharu 960×600 | LULUS; kad 6 blastokista; penerbit disahkan pengguna | Sedia diterbitkan |

**Tepat 5 sumber / 29 halaman / 30 situasi. Build awam: 4 buku baharu / 23 halaman.** Tiada aktiviti dikira sebagai halaman cerita. Tiada ilustrasi diganti, dipotong atau dijana semula. Rujukan fakta, hash dan penjelasan gate tersedia dalam `SMARTLIBverse_IMPORT_5_BOOKS_AUDIT.md`.

## Ujian automatik yang boleh diulang

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Node 24 digunakan; minimum repo Node 22. Repo tidak mempunyai TypeScript atau perintah lint berasingan; build memeriksa sintaks JavaScript dan mengimbas rahsia/backend yang tidak sepatutnya. Workflow PR dan Pages sedia ada tidak diganti.

- **37/37 unit tests LULUS**: termasuk 32 ujian asal, kontrak lima buku, jumlah halaman/aktiviti, hash aset, gate draf, URL selamat, pengasingan kemajuan, import teks plain, dan semua 28 fail KOMPOS baseline.
- **Production build LULUS**: hash buku/aset disahkan, empat buku sahaja disalin, GEMPA BUMI tidak terdapat dalam `dist`. 20 aset HD-2D lama, ROKET dan KOMPOS turut diverifikasi oleh build asal.
- **Regresi game LULUS** pada 1366×768, 820×980, 390×844: foyer, dua avatar, semua zon, tiga cerita asal, kuiz, reward idempotency, kunci Secret, navigasi, collision, kawalan dan kemajuan.
- **Regresi KOMPOS LULUS** pada tiga saiz tersebut serta 360×800: lima halaman, sepuluh bahan, kedua-dua kategori, cuba semula tanpa had, lihat jawapan, ulang tanpa reset bacaan, langkau sebelum jawapan, tamat tanpa aktiviti, refleksi sesi, swipe CDP, keyboard, fullscreen dan pengasingan storage. Urbanist dimuat. Fail/kunci/soalan/aktiviti KOMPOS tidak diubah.
- **Koleksi baharu**: suite `tools/library-acceptance.mjs` melawat 29 halaman sumber × 5 viewport = **145 paparan halaman**; 30 situasi × 5 = **150 paparan aktiviti**. GEMPA BUMI diuji hanya pada loopback dengan label DRAF; tidak dibuka di produksi.

Viewport koleksi: **360×800, 390×844, 430×900, 768×1024, 1280×900**. Setiap halaman diperiksa nisbah asal, `contain`, keempat-empat tepi berada dalam viewport imej dan tiada horizontal overflow. Setiap situasi dibuka, jawapan salah dicuba, cuba semula, lihat jawapan dan jawapan betul diuji. Setiap keadaan mempunyai screenshot dalam artifact `test-results/library/`.

Suite juga memeriksa: carian/kategori termasuk pautan legasi, route rak sebenar, direct links, nombor 5/6 halaman, reset zum apabila tukar halaman, pan/scroll ketika zum, reload, kemajuan per buku, preservation key game/KOMPOS, langkau sebelum menjawab, Escape/fokus semula, fullscreen, saiz target 44px, edit teks, JSON export/import/penolakan fail buku lain, font fallback, reduced motion dan tamat bacaan apabila storage disekat.

Swipe/pembatalan sentuhan diuji melalui **Chrome DevTools Protocol touch input**. Ini ujian browser automatik; bukan ujian peranti Android/iPhone/iPad fizikal. Safari dan Edge fizikal belum diuji.

## Bukti dan semakan visual

- Semua halaman dan kad sumber diperiksa melalui contact sheet serta screenshot penuh. BANJIR kad 6 menunjukkan kereta berhenti, bukan memandu meredah banjir. PERSENYAWAAN menggunakan enam kad V3 berasingan. TSUNAMI tidak menggunakan imej `-asal` lama.
- RIBUT: enam derivative WebP lossless mempunyai decoded RGBA **sama** dengan PNG asal; tiada resize/crop. Laporan penukaran dalam `five-book-inputs.json`.
- Teks setiap halaman hasil adapter dibandingkan secara mendalam dengan semua medan teks sumber — semua sama. Teks HTML boleh disunting; teks yang sudah berada dalam imej tidak didakwa boleh disunting.
- Screenshot pilihan dalam `qa-five-books/`; keseluruhan matriks dan JSON keputusan disimpan sebagai Actions artifacts. Screenshot ialah paparan ujian sintetik.
- Pernah berlaku satu timeout suite kerana folder build dijana semula ketika browser tempatan masih membaca fail. Itu menyebabkan 404 sementara pada server ujian; suite koleksi dijalankan semula terhadap build yang tidak berubah sepanjang run. Jangan bina semula `dist` serentak dengan ujian browser.

## Regresi SMARTLIB berasingan (baca sahaja)

Laman <https://skpkt.github.io/smartlib/> diperiksa melalui konteks browser kosong. HTTP 200, dua input kata laluan dan tiada uncaught JavaScript error. Hash HTML baseline: `00eb951a0e719e052f51eb374e19335a14d1dff949b97acc38b27987bec5f2a0`.

**Login akaun sebenar tidak diuji**; tiada credential digunakan, ditukar atau dilog. Tiada fail/commit/PR pada repo SMARTLIB. Semakan selepas release membandingkan hash HTML ini. Screenshot dan keputusan baca sahaja berada dalam `test-results/smartlib-regression/`.

## CI, deployment dan bukti pasca-release

PR menjalankan unit, build dan suite browser penuh. Merge hanya selepas semakan hijau. [Workflow Pages sedia ada](https://github.com/SKPKT/smartlibverse/actions/workflows/pages.yml) membina dan menerbitkan ke Pages, kemudian menjalankan suite game serta koleksi pada URL live. Run live menguji empat buku diterbitkan (23×5 = 115 paparan halaman; 24×5 = 120 situasi), pautan KOMPOS asal dan penolakan GEMPA BUMI.

Keputusan CI/Pages sebenar, commit dan pautan run dilaporkan pada PR serta laporan release selepas ia selesai. Dokumen ini tidak menganggap HTTP 200 sahaja sebagai bukti deployment; HTML, data, aset dan interaksi perlu disahkan.

## Pembetulan metadata disahkan

Pada 23 November 2026, pengguna mengesahkan penerbit PERSENYAWAAN ialah **Pusat Sumber SKPK Taiping**. Katalog, kredit pembaca, manifest dan adapter import dikemas kini secara serasi. Teks cerita, lima halaman, enam aktiviti dan semua aset V3 kekal.

Semakan metadata pada 390px dan 1280px mengesahkan penerbit yang sama pada kad katalog serta kredit pembaca, tanpa ralat JavaScript atau perubahan pada kemajuan KOMPOS. Semua 37 unit tests dan production build lulus.

## Isu terbuka

1. **GEMPA BUMI**: pengguna perlu menyemak visual halaman 1–2 atau membekalkan pembetulan rasmi. Buku kekal draf; tidak dimasukkan secara senyap untuk mencapai angka lima buku live.
2. Peranti fizikal, pembaca skrin manusia dan autentikasi akaun SMARTLIB sebenar belum diuji. Semakan accessibility automatik dan keyboard tidak menggantikan penilaian pengguna MBPK.
