// SMARTLIBverse KOMPOS — teks yang boleh disunting, tiada skor atau penalti.
// Semua teks dalam antara muka utama diambil daripada fail ini.
window.KOMPOS_BOOK = {
  id: 'smartlibverse-kompos-msmb-v1',
  title: 'KOMPOS: Misi Sisa Menjadi Baja',
  author: 'Syahida Suffian',
  publisher: 'Pusat Sumber SKPK Taiping',
  theme: 'Sains: Bahan Terbiodegradasi dan Tidak Terbiodegradasi',
  pageCount: 5,
  pages: [
    {title:'Kulit Depan', eyebrow:'KOMIK PENDIDIKAN SMARTLIBverse', mainTitle:'KOMPOS', subtitle:'Misi Sisa Menjadi Baja', tagline:'Daripada sisa organik kepada kompos yang bermanfaat!'},
    {title:'Apa Itu Kompos?', panels:[
      {title:'Penemuan di taman sekolah', image:'proses-1-bahan.webp', alt:'Amir dan Aina mengumpulkan bahan tumbuhan untuk bekas kompos', amir:'Daun ini nak buat apa?', aina:'Kita boleh buat kompos!'},
      {title:'Siapa yang menguraikan?', image:'keratan-kompos.webp', alt:'Keratan bekas kompos menunjukkan bahan organik yang terurai menjadi kompos gelap', amir:'Siapa yang menguraikannya?', aina:'Mikroorganisma!'},
      {title:'Kompos matang', image:'proses-4-siap.webp', alt:'Murid menggunakan kompos pada tanaman sayuran', amir:'Kompos membantu tanah!', aina:'Betul!'}
    ], facts:[
      'Kompos terhasil apabila bahan organik diuraikan.',
      'Bakteria dan kulat membantu proses penguraian.',
      'Kompos matang membantu memperbaiki keadaan tanah.'
    ]},
    {title:'Kenali Bahan Kompos', subtitle:'Latihan pengukuhan · Tanpa markah', instruction:'Sentuh satu bahan, kemudian pilih kategorinya.', amir:'Mari pilih bahan yang betul!', aina:'Kamu boleh cuba berkali-kali!', materials:[
      {name:'Daun kering',slug:'daun-kering',suitable:true,fact:'Daun kering sesuai dikompos bersama bahan hijau.'},
      {name:'Rumput segar',slug:'rumput-segar',suitable:true,fact:'Rumput segar boleh dikompos bersama bahan kering.'},
      {name:'Kulit pisang',slug:'kulit-pisang',suitable:true,fact:'Kulit pisang ialah sisa organik yang sesuai untuk kompos.'},
      {name:'Sisa sayur mentah',slug:'sisa-sayur',suitable:true,fact:'Sisa sayur mentah sesuai untuk kompos.'},
      {name:'Ranting kecil',slug:'ranting-kecil',suitable:true,fact:'Ranting kecil yang dicincang boleh dikompos tetapi lambat terurai.'},
      {name:'Botol plastik biasa',slug:'botol-plastik',suitable:false,fact:'Botol plastik biasa tidak sesuai dikompos. Asingkan untuk kitar semula jika diterima.'},
      {name:'Tin minuman',slug:'tin-minuman',suitable:false,fact:'Tin minuman bukan bahan kompos. Asingkan untuk kitar semula.'},
      {name:'Botol kaca',slug:'botol-kaca',suitable:false,fact:'Kaca tidak sesuai dikompos. Asingkan dengan selamat.'},
      {name:'Bekas polistirena',slug:'polistirena',suitable:false,fact:'Polistirena tidak sesuai dimasukkan ke dalam kompos.'},
      {name:'Pembungkus plastik biasa',slug:'pembungkus-plastik',suitable:false,fact:'Pembungkus plastik biasa tidak sesuai dikompos.'}
    ], knowledge:'Kompos menggunakan bahan organik yang sesuai. Asingkan plastik, kaca, logam dan polistirena.', question:'Bahan ini masuk kategori mana?', yes:'Boleh Dikompos', no:'Tidak Sesuai'},
    {title:'Jom Buat Kompos!', subtitle:'Empat langkah mudah di taman sekolah', steps:[
      {title:'Kumpulkan bahan', image:'proses-1-bahan.webp', description:'Kumpulkan daun kering, rumput segar, kulit buah dan sisa sayur mentah yang sesuai.', amir:'Saya kutip daun kering!', aina:'Saya kumpul sisa sayur!'},
      {title:'Campurkan bahan', image:'proses-2-campur.webp', description:'Campurkan lebih banyak bahan kering dengan bahan hijau dalam bekas yang mempunyai pengudaraan.', amir:'Jom campurkan!', aina:'Tambah rumput segar!'},
      {title:'Jaga kelembapan dan udara', image:'proses-3-udara.webp', description:'Lembapkan sedikit jika kering. Gaulkan bahan dari semasa ke semasa dengan bantuan guru.', amir:'Air sedikit sahaja!', aina:'Gaul supaya ada udara!'},
      {title:'Gunakan apabila matang', image:'proses-4-siap.webp', description:'Kompos matang biasanya gelap, peroi dan berbau seperti tanah. Gunakan pada batas tanaman.', amir:'Kompos sudah gelap!', aina:'Mari bantu tanah!'}
    ], tip:'Pengkomposan mengambil masa. Tempohnya bergantung pada bahan, kelembapan, udara dan suhu.', safety:'Aktiviti kebun perlu dilakukan dengan bimbingan guru. Elakkan daging, produk tenusu, makanan berminyak dan plastik biasa.'},
    {title:'Rumusan dan Pengajaran', summary:[
      'Kompos terhasil daripada bahan organik yang terurai.',
      'Mikroorganisma membantu proses penguraian.',
      'Tidak semua bahan sesuai dikompos.',
      'Kompos membantu memperbaiki keadaan tanah.'
    ], morals:[
      'Kita mestilah mengasingkan sisa dengan betul.',
      'Kita perlu menjaga kebersihan alam sekitar.',
      'Kita hendaklah bekerjasama menjaga taman sekolah.'
    ], reflection:'Apakah perkara baharu yang kamu pelajari daripada buku ini?', amir:'Sisa organik pun berguna!', aina:'Mari jaga bumi kita!', end:'TAMAT'}
  ],
  // Labels and feedback stay editable here, alongside the supplied story text.
  ui: {
    brand:'SMARTLIBverse', library:'Perpustakaan Maya · Komik Pendidikan',
    bookHeader:'KOMIK PENDIDIKAN SMARTLIBverse · KOMPOS: Misi Sisa Menjadi Baja',
    back:'Kembali ke Perpustakaan Maya', start:'Mulakan Bacaan',
    fullscreen:'Skrin penuh', enterFullscreen:'Baca dalam skrin penuh', exitFullscreen:'Keluar daripada skrin penuh',
    resetReading:'Ulang bacaan', resetReadingTitle:'Tetap semula kemajuan bacaan buku KOMPOS sahaja',
    previous:'Sebelumnya', next:'Seterusnya', previousPage:'Halaman sebelumnya', nextPage:'Halaman seterusnya', navigation:'Navigasi halaman',
    progress:'Kemajuan bacaan', progressLabel:'Halaman yang sudah dikunjungi',
    pageCounter:'Halaman {page} daripada {total}', visitedCounter:'{count} daripada {total} halaman dikunjungi',
    pageLabel:'Halaman {page} daripada {total}: {title}', documentTitle:'{title} | SMARTLIBverse KOMPOS',
    writtenBy:'Penulis: {author}', publishedBy:'Penerbit: {publisher}',
    amir:'Amir', aina:'Aina', facts:'Fakta Penting',
    coverAlt:'Amir dan Aina di taman sekolah bersama bekas kompos berlapis',
    activityAlt:'Amir dan Aina mengumpulkan daun kering dan rumput segar',
    cutawayAlt:'Keratan rentas bekas kompos menunjukkan bahan organik berubah menjadi kompos gelap',
    recapAlt:'Amir dan Aina menggunakan kompos matang pada tanaman sekolah bersama guru',
    finishAlt:'Amir dan Aina meraikan kejayaan belajar tentang kompos',
    stepAlt:'Ilustrasi langkah {step}: {title}', materialAlt:'Ilustrasi {name}',
    materialList:'Sepuluh bahan untuk dipilih', activityLabel:'Latihan mengenal bahan',
    retry:'Cuba Semula', showAnswer:'Lihat Jawapan', nextMaterial:'Bahan Seterusnya', resetActivity:'Ulang Semua', skip:'Langkau Aktiviti',
    choose:'Pilih satu kategori untuk bermula.', chooseCategory:'Pilih kategori yang sesuai.',
    correct:'Betul! Syabas! {fact}', tryAgain:'Cuba lagi! Kamu boleh memilih sekali lagi atau tekan Lihat Jawapan.',
    answer:'Jawapan: {category}. {fact}', retryHint:'Cuba semula. Pilih kategori yang sesuai.', resetHint:'Semua bahan boleh diteroka semula.',
    explored:'Bahan diteroka: {count} daripada {total}', exploredAll:'Syabas! Kamu telah meneroka semua bahan.', exploredSuffix:'sudah diteroka',
    knowledge:'Kotak Ilmu:', ungraded:'Aktiviti ini tiada markah atau penalti. Kamu boleh mencuba semula, melihat jawapan atau meneruskan bacaan pada bila-bila masa.',
    changeTitle:'Bagaimana ia berubah?', changeText:'Daun, rumput dan sisa dapur yang sesuai akan diuraikan oleh mikroorganisma sehingga menjadi kompos matang.',
    reminder:'Ingat:', safety:'Keselamatan:', summary:'RUMUSAN', morals:'PENGAJARAN', reflection:'REFLEKSI:',
    reflectionPlaceholder:'Tulis atau bincang bersama guru…', reflectionLabel:'Jawapan refleksi pilihan',
    reflectionPrivacy:'Refleksi ini pilihan. Jawapan disimpan dalam sesi pelayar sahaja dan tidak dihantar ke pelayan.',
    finished:'Tahniah! Kamu telah menamatkan bacaan lima halaman.', unfinished:'Tahniah sampai ke halaman akhir! Kamu boleh melawat halaman lain untuk melengkapkan bacaan.',
    storageWarning:'Pelayar tidak dapat menyimpan kemajuan. Bacaan dan aktiviti masih boleh diteruskan dalam sesi ini.'
  }
};
