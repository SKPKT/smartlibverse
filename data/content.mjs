// Original demo stories. No school records or commercial books are used.
export const books = [
 {id:'taman',title:'Sahabat di Taman',icon:'🌳',shelf:'cerita',pages:[
 'Pada pagi yang cerah, Aina dan Budi pergi ke taman. Mereka membawa sebotol air dan sebuah buku cerita.',
 'Di tepi bangku, mereka melihat seekor anak kucing. Kucing itu tidak dapat keluar dari kotak yang terbalik. Aina mengangkat kotak dengan perlahan.',
 'Budi meletakkan sedikit air di dalam bekas. Mereka meminta bantuan penjaga taman untuk mencari pemilik kucing. Mereka tidak membawa kucing itu pulang sendiri.',
 'Sebelum pulang, Aina dan Budi mengutip sampah mereka. Mereka gembira kerana dapat membantu. Sahabat yang baik bekerjasama dan menjaga alam.'
 ],quiz:[['Siapakah sahabat Aina?',['Budi','Ali','Raju','Mei'],0],['Di manakah mereka pergi?',['Pasar','Taman','Pantai','Sekolah'],1],['Apakah yang menutupi kucing?',['Buku','Daun','Kotak','Bola'],2],['Siapakah yang diminta membantu?',['Penjaga taman','Pemandu bas','Tukang masak','Juruterbang'],0],['Apakah pengajaran cerita?',['Buang sampah','Bekerjasama dan membantu','Ambil haiwan orang','Bermain di jalan'],1]]},
 {id:'kancil',title:'Pengembaraan Si Kancil',icon:'🦌',shelf:'alam',pages:[
 'Si Kancil mahu melawat kebun di seberang anak sungai. Hujan semalam menyebabkan air sungai mengalir deras.',
 'Dia nampak sebatang kayu nipis. Kancil tidak terus melangkah. Dia tahu kayu itu mungkin patah. Dia meminta nasihat Kura-kura.',
 'Kura-kura menunjukkan sebuah jambatan yang kukuh di hulu sungai. Mereka berjalan bersama di laluan yang selamat.',
 'Di kebun, mereka meminta izin sebelum memetik buah. Kancil belajar bahawa berfikir dahulu dan meminta bantuan dapat menjaga keselamatan.'
 ],quiz:[['Ke manakah Kancil mahu pergi?',['Kebun','Bulan','Kedai','Laut'],0],['Mengapakah air deras?',['Panas','Hujan semalam','Salji','Angin kipas'],1],['Siapakah membantu Kancil?',['Harimau','Gajah','Kura-kura','Burung'],2],['Bagaimanakah mereka menyeberang?',['Berenang','Kayu nipis','Melompat','Jambatan kukuh'],3],['Apakah yang perlu dibuat sebelum memetik buah?',['Minta izin','Berlari','Bersembunyi','Menjerit'],0]]},
 {id:'misteri',title:'Misteri Buku Bercahaya',icon:'📘',shelf:'umum',pages:[
 'Nuri menemui buku bersinar di sudut perpustakaan. Pada kulitnya tertulis: Ilmu Menerangi Dunia. Dia meminta izin guru untuk membacanya.',
 'Halaman pertama menunjukkan pokok dan matahari. Nuri membaca bahawa tumbuhan memerlukan cahaya, air dan udara untuk membesar.',
 'Pada halaman kedua ada peta langit. Bulan tidak mengeluarkan cahayanya sendiri. Bulan memantulkan cahaya matahari.',
 'Nuri sedar cahaya buku itu datang daripada lampu kecil pada rak pameran. Keajaiban sebenar ialah pengetahuan baharu. Dia memulangkan buku ke tempat asal.'
 ],quiz:[['Siapakah menemui buku?',['Budi','Nuri','Aina','Kancil'],1],['Di manakah buku ditemui?',['Perpustakaan','Dapur','Padang','Kolam'],0],['Apakah keperluan tumbuhan?',['Gula sahaja','Batu','Cahaya, air dan udara','Plastik'],2],['Bulan memantulkan cahaya daripada apa?',['Lampu jalan','Lilin','Bintang kertas','Matahari'],3],['Apakah yang dibuat selepas membaca?',['Sorok buku','Koyak buku','Pulangkan buku','Buang buku'],2]]}
];
export const missions = [
 {id:'tutorial',title:'Pengembara Ilmu Bermula',goal:'Bergerak ke penanda dan berinteraksi dengan LIBRA.',xp:20,coins:10,stars:0,badge:'Pengembara Ilmu'},
 {id:'books',title:'Detektif Buku',goal:'Buka dua bahan berlainan di rak Perpustakaan Maya.',xp:30,coins:15,stars:1,badge:'Detektif Buku'},
 {id:'read',title:'Pencerita Cilik',goal:'Baca semua halaman satu cerita dan tekan Tamat Membaca.',xp:40,coins:15,stars:0,badge:'Pembaca Cilik'},
 {id:'quiz',title:'Bijak Membaca',goal:'Selepas membaca, jawab sekurang-kurangnya 4 daripada 5 soalan dengan betul.',xp:50,coins:20,stars:1,badge:'Juara Kuiz'},
 {id:'garden',title:'Penjelajah Hijau',goal:'Terokai tiga objek alam dan jawab soalan taman.',xp:35,coins:20,stars:1,badge:'Penjelajah Hijau'},
 {id:'secret',title:'Penjelajah Rahsia',goal:'Cari buku tersembunyi dan selesaikan teka-teki di Zon Rahsia.',xp:50,coins:25,stars:1,badge:'Penjelajah Rahsia'}
];
export const zones = [
 {id:'plaza',name:'Plaza Mula',icon:'🏛',color:'#12594b',objects:[['guide','LIBRA BOT',500,240,'robot']]},
 {id:'library',name:'Perpustakaan Maya',icon:'📚',color:'#75523a',objects:[['cerita','Rak Cerita Bergambar',250,250,'shelf'],['alam','Rak Sains & Alam',500,250,'shelf'],['umum','Rak Pengetahuan Am',750,250,'shelf']]},
 {id:'gallery',name:'Galeri Cerita',icon:'📖',color:'#73513f',objects:books.map((b,i)=>[b.id,b.title,250+i*250,280,'book'])},
 {id:'quiz',name:'Arena Kuiz',icon:'🧩',color:'#554d72',objects:[['quiz','Cabaran Kefahaman',500,260,'desk']]},
 {id:'awards',name:'Dewan Anugerah',icon:'🏆',color:'#6b5830',objects:[['awards','Pentas Pencapaian',500,260,'trophy']]},
 {id:'garden',name:'Taman Ilmu',icon:'🌿',color:'#316e48',objects:[['tree','Pokok',230,240,'tree'],['flower','Bunga',470,260,'flower'],['butterfly','Rama-rama',730,240,'butterfly'],['pond','Kolam',300,440,'pond'],['board','Papan Maklumat Alam',700,440,'board']]},
 {id:'secret',name:'Zon Rahsia',icon:'🔑',color:'#315665',objects:[['hidden','Buku Tersembunyi',280,280,'book'],['riddle','Teka-teki Ilmu',700,280,'desk']]}
];
export const facts={tree:'Pokok menghasilkan oksigen dan memberi teduhan.',flower:'Bunga membantu menarik serangga pendebunga.',butterfly:'Rama-rama bermula sebagai telur, ulat, kepompong dan kemudian dewasa.',pond:'Kolam ialah habitat hidupan seperti ikan dan tumbuhan air.',board:'Jaga alam: jangan petik tumbuhan tanpa izin dan jangan buang sampah.'};
