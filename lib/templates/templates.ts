export const getKhatamPrayerHtml = (targetKhatam: number) => `
  <div class="text-left mt-2" style="max-height: 70vh; overflow-y: auto; overflow-x: hidden; padding-right: 12px;">
    <p class="text-sm font-bold text-[#D97757] text-center mb-4">Alhamdulillah, kamu telah menyelesaikan putaran ${targetKhatam}x Khatam!</p>
    
    <div class="bg-[#EAF0EA] p-5 rounded-2xl border border-[#c7dcc7] shadow-sm mb-4">
      <div class="space-y-6">
        <p dir="rtl" class="text-xl font-serif text-[#3E4F3E] leading-[2.4] text-justify">
          الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ حَمْداً يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيْدَهُ اللَّهُمَّ صَلِّ وَسَلَّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ
        </p>
        <p dir="rtl" class="text-xl font-serif text-[#3E4F3E] leading-[2.4] text-justify">
          اللَّهُمَّ أَصْلِحْ قُلُوْبَنَا وَأَزِلْ عُيُوْبَنَا وَتَوَّلَنَا بِالْحُسْنَى وَزَيِنًا بِالتَّقْوَى وَاجْمَعْ لَنَا خَيْرَ الآخِرَةِ وَالْأُولَى وَارْزُقْنَا طَاعَتَكَ مَا أَبْقَيْتَنَا اللَّهُمَّ يَسِّرْنَا لِلْيُسْرَى وَجَنِّبْنَا الْعُسْرَى وَأَعِذْنَا مِنْ شُرُورِ أَنْفُسِنَا وَسَيِّئَاتِ أَعْمَالِنَا وَأَعِذْنَا مِنْ عَذَابِ النَّارِ وَعَذَابِ الْقَبْرِ وَفِتْنَةِ الْمَحْيَا وَالْمَمَاتِ وَفِتْنَةِ الْمَسِيحِ الدَّجَّالِ
        </p>
        <p dir="rtl" class="text-xl font-serif text-[#3E4F3E] leading-[2.4] text-justify">
          اَللَّهُمَّ إِنَّا نَسْأَلُكَ الْهُدَى وَالتَّقْوَى وَالْعَفَافَ وَالْغِنَى اللَّهُمَّ إِنَّا نَسْتَوْدِعُكَ أَدْيَانَنَا وَأَبْدَانَنَا وَخَوَاتِيمِ أَعْمَالِنَا وَأَنْفُسَنَا وَأَهْلِيْنَا وَأَحْبَابَنَا وَسَائِرَ الْمُسْلِمِينَ وَجَمِيعَ مَا أَنْعَمْتَ عَلَيْنَا وَعَلَيْهِمْ مِنْ أُمُورِ الْآخِرَةِ وَالدُّنْيَا اللَّهُمَّ إِنَّا نَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدِّيْنِ وَالدُّنْيَا وَالْآخِرَةِ وَاجْمَعْ بَيْنَنَا وَبَيْنَ أَحْبَابِنَا فِي دَارِ كَرَامَتِكَ بِفَضْلِكَ وَرَحْمَتِكَ
        </p>
        <p dir="rtl" class="text-xl font-serif text-[#3E4F3E] leading-[2.4] text-justify">
          اللَّهُمَّ أَصْلِحْ وَلَاةَ الْمُسْلِمِيْنَ وَوَفِّقْهُمْ لِلْعَدْلِ فِي رِعَايَاهُمْ وَالْإِحْسَانِ إِلَيْهِمْ وَالشَّفَقَةِ عَلَيْهِمْ وَالرِّفْقِ بِهِمْ وَالْإِعْتِنَاءِ بِمَصَالِحِهِمْ وَحَبِّبْهُمْ إِلَى الرَّعِيَّةِ وَحَبِّبِ الرَّعِيَّةِ إِلَيْهِمْ وَوَفَقْهُمْ لِصِرَاطِكَ الْمُسْتَقِيمِ وَالْعَمَلِ بِوَظَائِفِ دِيْنِكَ الْقَوِيمِ
        </p>
        <p dir="rtl" class="text-xl font-serif text-[#3E4F3E] leading-[2.4] text-justify">
          اللَّهُمَّ الْطُفْ بِعَبْدِكَ سُلْطَانَنَا وَوَفِّقْهُ لِمَصَالِحِ الدُّنْيَا وَالْآخِرَةِ وَحَبِّبْهُ إِلَى الرَّعِيَّةِ وَحَبِّبِ الرَّعِيَّةَ إِلَيْهِ اللَّهُمَّ ارْحَمْ نَفْسَهُ وَبِلَادَهُ وَصُنْ أَتْبَاعَهُ وَأَجْنَادَهُ وَانْصُرْهُ عَلَى أَعْدَاءِ الدِّيْنِ وَسَائِرِ الْمُخَالِفِيْنَ وَوَفِّقْهُ لِإِزَالَةِ الْمُنْكَرَاتِ وَإِظْهَارِ الْمَحَاسِنِ وَأَنْوَاعِ الْخَيْرَاتِ وَزِدِ الْإِسْلَامَ بِسَبَبِهِ ظُهُوْرًا وَأَعِزَّهُ وَرَعِيَّتَهُ إِعْزَازًا بَاهِرًا
        </p>
        <p dir="rtl" class="text-xl font-serif text-[#3E4F3E] leading-[2.4] text-justify">
          اللَّهُمَّ أَصْلِحْ أَحْوَالَ الْمُسْلِمِيْنَ وَأَرْخِصْ أَسْعَارَهُمْ وَآمِنْهُمْ فِي أَوْطَانِهِمْ وَاقْضِ دِيْوَنَهُمْ وَعَافِ مَرْضَاهُمْ وَانْصُرْ جُيُوْشَهُمْ وَسَلَّمْ غُيَّابَهُمْ وَفُكَ أَسْرَاهُمْ وَاشْفِ صُدُوْرَهُمْ وَأَذْهِبْ غَيْظَ قُلُوْبِهِمْ وَأَلَّفَ بَيْنَهُمْ وَاجْعَلْ فِي قُلُوبِهِمُ الإِيْمَانَ وَالْحِكْمَةَ وَثَبِّتْهُمْ عَلَى مِلَّةِ رَسُوْلِكَ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَأَوْزِعْهُمْ أَنْ يُوْفُوْا بِعَهْدِكَ الَّذِي عَاهَدْتَهُمْ عَلَيْهِ وَانْصُرْهُمْ عَلَى عَدُوكَ وَعَدُوِّهِمْ إِلَهَ الْحَقِّ وَاجْعَلْنَا مِنْهُمْ
        </p>
        <p dir="rtl" class="text-xl font-serif text-[#3E4F3E] leading-[2.4] text-justify">
          اللَّهُمَّ اجْعَلْهُمْ آمِرِيْنَ بِالْمَعْرُوْفِ فَاعِلِيْنَ بِهِ نَاهِيْنَ عَنِ الْمُنْكَرِ مُجْتَنِبِيْنَ لَهُ مُحَافِظِيْنَ عَلَى حُدُودِكَ قَائِمِيْنَ عَلَى طَاعَتِكَ مُتَنَاصِفِيْنَ مُتَنَاصِحِيْنَ اللَّهُمَّ صُنْهُمْ فِي أَقْوَالِهِمْ وَأَفْعَالِهِمْ وَبَارِكْ لَهُمْ فِي جَمِيعِ أَحْوَالِهِمْ الْحَمْدُ لِلهِ رَبِّ الْعَالَمِيْنَ حَمْداً يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيْدَهُ اللَّهُمَّ صَلِّ وَسَلَّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ
        </p>
      </div>

      <div class="mt-6 pt-4 border-t border-[#c7dcc7] space-y-3">
        <p class="text-[11px] text-[#6B8E6B] text-justify font-medium leading-relaxed">
          <strong class="text-[#3E4F3E]">Artinya:</strong> "Segala puji bagi Allah Tuhan sekalian alam dengan pujian yang memadai dengan nikmat-nikmat-Nya dan sepadan dengan tambahan-Nya. Ya Allah, limpahkanlah shalawat dan salam atas Muhammad dan keluarga penghulu kami Muhammad sebagaimana Engkau melimpahkan shalawat kepada Nabi Ibrahim dan keluarganya. Berkatilah penghulu kami Muhammad dan keluarga Muhammad, sebagaimana Engkau berkati Ibrahim dan keluarganya. Di seluruh alam, sesungguhnya Engkau Maha Terpuji dan Maha Mulia.
        </p>
        <p class="text-[11px] text-[#6B8E6B] text-justify font-medium leading-relaxed">
          Ya Allah, perbaikilah hati kami, hilangkanlah keburukan kami, bimbinglah kami dengan jalan yang terbaik, hiasilah kami dengan ketaqwaan, kumpulkanlah bagi kami kebaikan akhirat dan dunia dan anugerahkanlah kami ketaatan kepada-Mu selama Engkau menghidupkan kami. Ya Allah, mudahkanlah kami ke jalan kemudahan dan jauhkanlah kami dari kesukaran, lindungilah kami dari keburukan diri kami dan amal-amal kami yang buruk, lindungilah kami dari siksa neraka dan siksa kubur, fitnah semasa hidup dan sesudah mati serta fitnah Al-Masih Ad-Dajjal.
        </p>
        <p class="text-[11px] text-[#6B8E6B] text-justify font-medium leading-relaxed">
          Ya Allah, kami mohon kepada-Mu petunjuk, ketakwaan, kesucian diri dan kecukupan. Ya Allah, Kami titipkan pada-Mu agama, jiwaraga dan penghabisan amal-amal kami, keluarga dan orang-orang yang kami cintai, kaum muslimin lainnya dan segala urusan akhirat dan dunia yang Engkau anugerahkan kepada kami dan mereka. Ya Allah, kami mohon kepada-Mu maaf dan keselamatan dalam agama, dunia dan akhirat. Kumpulkanlah antara kami dan orang-orang yang kami cintai di negeri kemuliaan-Mu dengan anugerah dan rahmat-Mu.
        </p>
        <p class="text-[11px] text-[#6B8E6B] text-justify font-medium leading-relaxed">
          Ya Allah, perbaikilah para pemimpin muslimin dan jadikanlah mereka berlaku adil terhadap rakyat mereka, berbuat baik kepada mereka, menunjukkan kasih sayang dan bersikap lemah-lembut kepada mereka serta memperhatikan kemaslahatan mereka. Jadikanlah mereka mencintai rakyat dan mereka dicintai rakyat. Jadikanlah mereka menempuh jalan-Mu dan mengamalkan tugas-tugas agama-Mu yang lurus.
        </p>
        <p class="text-[11px] text-[#6B8E6B] text-justify font-medium leading-relaxed">
          Ya Allah, berlembutlah kepada hamba-Mu, penguasa kami dan jadikanlah dia memperhatikan maslahat-maslahat dunia dan akhirat. Jadikanlah dia mencintai rakyatnya dan jadikanlah dia dicintai rakyat. Ya Allah, rahmatilah diri dan negerinya, jagalah para pengikut dan tentaranya, tolonglah dia untuk menghadapi musuh-musuh agama dan para penantang lainnya. Jadikanlah dia bertindak menghilangkan berbagai kemungkaran dan menunjukkan kebaikan-kebaikan serta berbagai bentuk kebajikan. Jadikanlah Islam semakin tersebar dengan sebabnya, muliakanlah dia dan rakyatnya dengan kemuliaan yang cemerlang.
        </p>
        <p class="text-[11px] text-[#6B8E6B] text-justify font-medium leading-relaxed">
          Ya Allah, perbaikilah keadaan kaum muslimin dan murahkanlah harga-harga mereka, amankanlah mereka di negeri-negeri mereka, lunasilah hutang-hutang mereka, sembuhkanlah orang-orang yang sakit diantara mereka, bebaskanlah mereka yang ditawan, sembuhkanlah penyakit hati mereka, hilangkanlah kemarahan hati mereka dan persatukanlah diantara mereka. Jadikanlah iman dan hikmah dalam hati mereka, tetapkanlah mereka diatas agama Rasul-Mu SAW. Ilhamilah mereka agar memenuhi janji-Mu yang Engkau berikan kepada mereka, tolonglah mereka dalam menghadapi musuh-Mu dan musuh mereka, wahai Tuhan Yang Maha Besar dan jadikanlah kami dari golongan mereka.
        </p>
        <p class="text-[11px] text-[#6B8E6B] text-justify font-medium leading-relaxed">
          Ya Allah, jadikanlah mereka menyuruh berbuat kebaikan dan mengamalkannya, mencegah dari kemunkaran dan menjauhinya, memelihara batas-batas-Mu, melakukan ketaatan kepada-Mu, saling berbuat baik dan menasihati. Ya Allah, jagalah dalam pendapat dan perbuatan mereka, berkatilah mereka dalam semua keadaan mereka.
        </p>
        <p class="text-[11px] text-[#6B8E6B] text-justify font-medium leading-relaxed">
          Segala Puji bagi Allah Tuhan sekalian alam dengan pujian yang memadai dengan nikmat-nikmat-Nya dan sepadan dengan tambahan-Nya. Ya Allah, limpahkanlah shalawat dan salam ke atas Muhammad dan keluarga Penghulu Kami Muhammad sebagaimana Engkau melimpahkan shalawat kepada Nabi Ibrahim dan keluarganya. Berkatilah Penghulu kami Muhammad dan keluarga Muhammad, sebagaimana Engkau berkati Ibrahim dan keluarganya. Di seluruh alam, sesungguhnya Engkau Maha Terpuji dan Maha Mulia."
        </p>
      </div>
    </div>

    <div class="mt-4 bg-[#FFF4F1] p-5 rounded-2xl border border-[#FADCD5] text-center shadow-sm">
      <p dir="rtl" class="text-2xl font-serif text-[#D97757] mb-3">مَنْ قَرَأَ الْقُرْآنَ ثُمَّ دَعَا أَمَّنَ عَلَى دُعَائِهِ أَرْبَعَةُ آلَافٍ</p>
      <p class="text-[11px] text-[#8C8273] font-medium leading-relaxed">"Barangsiapa membaca Al-Qur'an, kemudian berdoa, maka doanya diamini oleh 4.000 malaikat."<br/><span class="font-bold text-[#A35941]">(HR. Ad-Darimi)</span></p>
    </div>

    <div class="mt-5 pt-3 border-t border-[#E5E0D8] text-[10px] text-center text-[#A39A8E]">
       <b>Sumber Doa:</b> <a href="https://jabar.nu.or.id/doa/doa-khatam-al-qur-an-lengkap-dengan-teks-arab-dan-artinya-AoJxn" target="_blank" style="color: #6B8E6B; text-decoration: underline; font-weight: bold;">jabar.nu.or.id</a> (Kitab at-Tibyan fi Adab Hamalati al-Qur’an karya Imam an-Nawawi)
    </div>
  </div>
`;