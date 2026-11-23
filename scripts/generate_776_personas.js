import fs from "node:fs";
import path from "node:path";

const firstNamesMale = [
  "Javohir", "Farrux", "Bobur", "Sherzod", "Ulug'bek", "Temur", "Sardor", "Rustam", "Sanjar", "Otabek",
  "Bekzod", "Akmal", "Shavkat", "Doston", "Mirzo", "Anvar", "Hamid", "Shohruh", "Ilhom", "Mansur",
  "Jamshid", "Zohid", "Nodir", "Alisher", "Azamat", "Qobil", "Botir", "Sobir", "G'ayrat", "Jasur",
  "Umid", "Ravshan", "Komil", "Asror", "Erkin", "Shuhrat", "Zafar", "Iskandar", "Muhriddin", "Baxtiyor",
  "Olim", "Xurshid", "Shahboz", "Elyor", "Abror", "Dilshod", "Doniyor", "Eldor", "Furqat", "G'olib",
  "Hikmat", "Jahongir", "Kamron", "Laziz", "Mahmud", "Navro'z", "Oybek", "Po'lat", "Qahramon", "Rahmat",
  "Sarvar", "Tohir", "Urol", "Vali", "Xoliq", "Yoqub", "Zayniddin", "Abbos", "Bahodir", "Chori",
  "Davron", "Eson", "Fayzullo", "Habib", "Ibrohim", "Karim", "Latif", "Murod", "Nasim", "Ortiq",
  "Panji", "Qodir", "Rasul", "Saydullo", "Tursun", "Usmon", "Vohid", "Xurram", "Yodgor", "Zokir"
];

const firstNamesFemale = [
  "Nodira", "Dilnoza", "Malika", "Zilola", "Shahnoza", "Gulnora", "Feruza", "Sevara", "Madina", "Rayhon",
  "Kamola", "Nargiza", "Umida", "Nilufar", "Mohira", "Dildora", "Barno", "Saodat", "Munira", "Aziza",
  "Gulsanam", " Lola", "Shohida", "Maftuna", "Zulayho", "Gulbahor", "Shodiya", "Dilsora", "Robiya", "Oysha",
  "Zuhra", "Fotima", "Mastura", "Farida", "Xadicha", "Muhabbat", "Nazira", "Gulchehra", "Surayyo", "Sabina",
  "Zarina", "Charos", "Guzal", "Oydin", "Yulduz", "Gavhar", "Gulrux", "Dilrabo", "Zebo", "Nafisa",
  "Hulkar", "Sayyora", "Ozoda", "Marjona", "Shirin", "Parizod", "Asila", "Jasmina", "Laylo", "Shahzoda",
  "Muattar", "Gulandom", "Dilafro'z", "Manzura", "Nigora", "Rano", "Sitora", "Tamara", "Umrbibi", "Xonzoda",
  "Yashnar", "Zarafshon", "Bahora", "Guljamol", "Dilorom", "Mohinur", "Nozima", "Oqila", "Parijan", "Qunduz"
];

const lastNames = [
  "Toshmatov", "Qosimov", "Zokirov", "Rahimov", "Karimov", "Saidov", "Nazarov", "Yusupov", "Ahmedov", "Sultonov",
  "Aliyev", "Mirzayev", "Xolmatov", "Berdiyev", "Normatov", "Oripov", "Ergashev", "Murodov", "Rustamov", "Sobirov",
  "Tursunov", "Usmonov", "Fayziyev", "Hakimov", "Jo'rayev", "Qodirov", "Latipov", "Mahmudov", "Nabiyev", "Po'latov",
  "Raxmonov", "Salimov", "Tojiyev", "Umarov", "Xoliqov", "Yo'ldoshev", "Ziyoyev", "Abdurazzoqov", "Boymurodov", "Choriyev",
  "Davlatov", "Eshmurodov", "Farmonov", "G'aniyev", "Haydarov", "Ismoilov", "Jabborov", "Komilov", "Lapasov", "Madaminov",
  "Ne'matov", "Ochilov", "Pirmatov", "Qo'chqorov", "Ro'ziyev", "Sodiqov", "Temirov", "Ubaydullayev", "Vahobov", "Xudoyberdiyev",
  "Yalg'oshev", "Zokirjonov", "Anorboyev", "Bo'riyev", "Chamanov", "Do'stov", "Elmurodov", "Fattohov", "G'afforov", "Hasanov",
  "Ibragimov", "Jalilov", "Keldiyorov", "Luqmonov", "Mamatqulov", "Nosirov", "Ortiqov", "Pardayev", "Qobilov", "Radjabov",
  "Samadov", "Toshpo'latov", "Uzoqov", "Valiyev", "Xamdamov", "Yoqubov", "Zayniyev", "Abduvaliyev", "Bobonazarov", "Chorshanbiyev"
];

const cities = [
  "Toshkent (Yunusobod)", "Toshkent (Chilonzor)", "Toshkent (Mirobod)", "Toshkent (Shayxontohur)", "Toshkent (Sergeli)",
  "Samarqand shahar", "Samarqand (Urgut)", "Samarqand (Pastdarg'om)", "Buxoro shahar", "Buxoro (G'ijduvon)",
  "Farg'ona shahar", "Farg'ona (Marg'ilon)", "Farg'ona (Qo'qon)", "Andijon shahar", "Andijon (Asaka)", "Andijon (Shahrixon)",
  "Namangan shahar", "Namangan (Chust)", "Qarshi shahar", "Qashqadaryo (Shahrisabz)", "Termiz shahar", "Surxondaryo (Denov)",
  "Navoiy shahar", "Navoiy (Zarafshon)", "Jizzax shahar", "Sirdaryo (Guliston)", "Xorazm (Urganch)", "Xorazm (Xiva)",
  "Qoraqalpog'iston (Nukus)", "Qoraqalpog'iston (Qo'ng'irot)", "Olmaota", "Ostona", "Bishkek", "O'sh", "Dushanbe", "Xo'jand",
  "Istanbul", "Anqara", "Moskva", "Sankt-Peterburg", "Kazan", "Boku", "Dubay", "London", "Berlin", "Varshava", "Seul", "Pekin"
];

const professions = [
  "Senior Backend Dasturchi", "Bosh Hisobchi (Chief Accountant)", "Kardiolog Jarroh", "Maktab Matematika O'qituvchisi",
  "Xalqaro Yuk Mashinasi Haydovchisi", "Lifestyle & Tech Bloger", "Universitet Dotsenti", "Payvandchi (Argon Welder)",
  "Stomatolog Implantolog", "Taksi Haydovchisi (Yandex Comfort)", "Katta Qurilish Prorabi", "Bojxona Rasmiylashtiruvi Mutaxassisi",
  "Bolalar Bog'chasi Mudirasi", "Advokat (Fuqarolik Huquqi)", "Restoran Bosh Oshpazi", "Farmatsevtika Ombori Mudiri",
  "Fintech Xavfsizlik Auditori", "Fitnes Murabbiy va Nutrisiolog", "Tikuvchilik Tsexi Rahbari", "Grafik Dizayner & Art Director",
  "Avtoservis Bosh Ustasi", "Zargarlik Buyumlari Ustasi", "Aviadispetcher", "Bank Kredit Bo'limi Boshlig'i",
  "Paxta Klasteri Bosh Agronomi", "Supermarket Logistika Menejeri", "Mebel Ishlab Chiqarish Texnologi", "Teleradio Ovoz Rejissyori",
  "Kutubxona Mudirasi", "Elektrotexnika Muhandisi", "Gidroelektr Stansiyasi Operatori", "Qandolatchi Usta",
  "Sotuv Bo'limi Boshlig'i", "Notarius", "Video Montajchi (Colorist)", "Xususiy Klinika Hamshirasi",
  "Geologiya Qidiruv Muhandisi", "Uy Bekasi (3 farzandli)", "Pensioner (Sobiq Temir Yo'l Muhandisi)", "Talaba (Toshkent TATU)",
  "Mobil Ilovalar QA Testeri", "Gidroponika Issiqxona Egasi", "Ekspeditor Kuryer", "Musiqa Maktabi Pianisti",
  "Neft va Gaz Quvurlari Inspektori", "Interyer Dizayneri", "Kibersport Murabbiyi", "Sug'urta Agenti",
  "Kopirayter va SEO Mutaxassisi", "Sartarosh-Stilist", "Poyabzal Modellari Konstruktori", "Metallurgiya Zavodi Quyuvchisi",
  "Arxiv Mudiri", "Veterinar Vrach", "Kran Operatori", "Poliot Muhandisi (Civil Aviation)",
  "Bojxona Ombiri Nazoratchisi", "Plastik Qoliplar Muhandisi", "Tarjimon (Xitoy-O'zbek)", "E-Commerce Media Buyer",
  "Optika va Linza Mutaxassisi", "Dron Operatori va Kartograf", "Lift Montaj Muhandisi", "Uy-Joy Shirkat Boshlig'i",
  "Solol O'simliklar Eksportchisi", "Muzqaymoq Zavodi Laboranti", "Soliq Boshqarmasi Bosh Inspektori", "Kinoaktyor va Teatr Rejissyori",
  "Avtodiler Sotuv Konsultanti", "Shina Ishlab Chiqarish Vulkanizatori", "Poligrafiya Chopxonasi Bosmachisi", "Biorobotika Aspiranti",
  "Poyga Treki Mexaniki", "Echki Sutidan Pishloq Ishlab Chiqaruvchi", "Marmar Kesish Ustasi", "Sun'iy Yo'ldosh Aloqa Muhandisi",
  "Sanoat Alpinisti", "Shaxmat Bo'yicha Xalqaro Master", "Sharqshunos Tarjimon (Koreys tili)", "Kabel Zavodi Sifat Nazoratchisi"
];

const temperaments = [
  "O'ta skeptik va texnik auditga berilgan", "Har bir tiyinni hisoblaydigan o'ta tejamkor", "Charchagan, to'g'ridan-to'g'ri amaliyotchi",
  "Trend va estetikaga haddan tashqari talabchan", "Salomatlik va kimyoviy xavfsizlikka o'ta hushyor", "Texnologiyaga qiziqmaydigan oddiy xaridor",
  "Byudjeti cheklangan, doim eng arzon narx qidiruvchi", "Qonun va shartnomalar bandini sinchiklab o'quvchi", "Sabrsiz, mahsulotni 3 kunda kutuvchi ekspresschi",
  "Uy-joy va oila shinamligini birinchi o'ringa qo'yuvchi", "Kiyimlarning santimetriga e'tiborli perfektisionist", "Ekologiya va qayta ishlanishga talabchan minimalist",
  "Tovon va kompensatsiya talab qiluvchi radikal xaridor", "Katta yoshli, onlayn to'lovdan qo'rqadigan konservator", "Brendning ijtimoiy nufuziga qaraydigan premium mijoz",
  "Sovuq qonli tahlilchi, faqat faktlarga ishonuvchi", "Ko'p aldangan, har bir do'kondan firibgarlik kutuvchi", "Do'stlariga ko'z-ko'z qilishni yaxshi ko'ruvchi xaridor",
  "Bolalari uchun eng zararsizini qidirayotgan mehribon ota-ona", "Tez jahli chiqadigan, buyurtma kechiksa shovqin ko'taruvchi"
];

const familyStatuses = [
  "Bo'ydoq, 2 nafar mushuk bilan ijarada yashaydi", "Uylangan, 1 nafar chaqalog'i bor", "Turmushga chiqqan, 2 nafar maktab yoshidagi bolasi bor",
  "Katta oila boshlig'i, 4 nafar farzand va ota-onasi bilan yashaydi", "Talabalar yotoqxonasida 3 nafar kursdoshi bilan turadi",
  "Yolg'iz ona, 7 yoshli qizini yolg'iz voyaga yetkazmoqda", "Yosh oila, yangi kvartira kreditini to'lamoqda", "Nafaqaxo'r, 6 nafar nevaraning bobosi",
  "Qaynota-qaynona bilan katta hovlida yashaydi (8 jon)", "Yolg'iz yashaydigan mustaqil frilanser", "Uylangan, rafiqasi bilan birga xususiy biznes yuritadi",
  "Uch farzandning onasi, uy bekasi", "Nafaqaxo'r ayol, tomorqa va bog'dorchilik bilan band", "Aka-uka birgalikda kvartira ijaraga olgan"
];

const clusterDefinitions = [
  {
    cluster: "Security & Payments",
    objectionTemplates: [
      "To'lov qilish sahifasida bank kartasi xavfsizligi bo'yicha PCI-DSS yoki 256-bit SSL yorliqlari ko'rinmayapti, kartam ma'lumotlari sizib chiqmaydimi?",
      "Saytda Uzcard va Humo kartalari orqali to'lov qilganda yashirin konvertatsiya komissiyasi ushlanib qolmasligiga qanday kafolat bor?",
      "To'lov shlyuzining xavfsizlik protokollari qaysi bank tomonidan kafolatlangan? Firibgar klon sayt emasligingizni qanday bilaman?",
      "Onlayn karta kiritgandan so'ng 3D Secure orqali SMS tasdiqlash kodi kelishi ta'minlanganmi, yechib olingan pul qaytmay qolmaydimi?",
      "Kredit kartamdan avtomatik ravishda qayta obuna yoki qo'shimcha yashirin xizmat to'lovlari yechilmasligiga qonuniy kafolat bormi?"
    ],
    dislikeTemplates: [
      "Chekout jarayonida xavfsizlik audit logotipi va ma'lumotlar shifrlanishi haqida ogohlantirish yo'qligi sababli to'xtab qoldim.",
      "To'lov sahifasida Visa, Mastercard, Humo belgilarining xavfsizlik sertifikati ko'zga tashlanmadi.",
      "Xavfsiz xarid kafolatiga doir alohida texnik bayonotning etishmasligi ishonchsizlik uyg'otdi.",
      "Karta kiritish oynasi shubhali ko'rindi, yuridik ro'yxatdan o'tgan kompaniya rekvizitlari topilmadi."
    ],
    requestedFeature: "256-Bit SSL, PCI-DSS Level 1 Audit nishonlari va to'liq shifrlangan to'lov kafolati"
  },
  {
    cluster: "Logistics & Shipping Speed",
    objectionTemplates: [
      "Xitoy fabrikasidan yetkazib berish muddati necha kun? Qishki mavsum o'tib ketgandan keyin keladigan bo'lsa menga keragi yo'q.",
      "Posilka yo'lga chiqqach, qayerda turganini kuzatish uchun xalqaro trek-raqam (Tracking Code) real vaqtda beriladimi?",
      "Havo ekspressi orqali keladimi yoki poyezdda 40 kun yuradimi? Menga shoshilinch sovg'a uchun 7-12 kunlik aniq muddat kerak.",
      "Agar posilka bojxonada ushlanib qolsa yoki aeroport omborida adashib yo'qolsa, yangisini jo'natish kimning hisobidan bo'ladi?",
      "Viloyat markaziga emas, olis tuman va qishloqlargacha yetkazib berish pochta orqali oxirgi manzilgacha bormi?"
    ],
    dislikeTemplates: [
      "Yetkazib berish muddati bo'yicha aniq havo ekspress grafigi ko'rsatilmaganligi meni ikkilantirdi.",
      "Tracking raqami berilishi va posilkani qayerdan tekshirish mumkinligi haqida batafsil izoh yo'q edi.",
      "Kargo marshruti (Air Express 7-12 kun) bo'yicha vizual yo'l xaritasi etishmayapti.",
      "Yuk yo'qolgan taqdirda mijozga darhol yangisini yuborish mexanizmi shaffof yozilmagan."
    ],
    requestedFeature: "Air Express 7-12 kunlik kafolatli kargo va jonli xalqaro kuzatuv (Live Tracking ID)"
  },
  {
    cluster: "Risk & Guarantees",
    objectionTemplates: [
      "Agar mahsulot yo'lda sinib, ezilib yoki ishlamaydigan holatda kelsa, pulimni 100% qaytarib olasizmi yoki bahona qilasizmi?",
      "30 kunlik sinov muddati davomida mahsulot yoqmasa yoki nosoz bo'lib chiqsa, qaytarish shartlari qanchalik oson va ortiqcha byurokratiyasiz?",
      "Xitoydan kelayotgan buyumlar uchun xaridor riskini to'liq o'z zimmasiga oluvchi yozma kafolat tizimi bormi?",
      "Olingan gadjet 2 haftada kuyib qolsa, kimga murojaat qilaman? Do'kon g'oyib bo'lib qolmasligiga qanday ishonaman?",
      "Agar qadoq ochilganda fabrikaviy nuqson aniqlansa, bepul qaytarib yangi originalini jo'natib berasizmi?"
    ],
    dislikeTemplates: [
      "Kafolat bo'limida 'faqat ochilmagan qutini qaytarish mumkin' degan nohaq shartlar yo'qligiga ishonchim komil emas edi.",
      "Uch qavatli himoya tizimi — qaytarish, sinish sug'urtasi va bojxona himoyasi alohida yirik shriftda yozilmagan edi.",
      "Singan yuklar uchun video dalil ko'rsatilganda zudlik bilan pulni to'liq qaytarish mexanizmi ko'rinmadi.",
      "Do'konning o'z kafolati ishlab chiqaruvchi zavod kafolati bilan mustahkamlangani haqida hujjat yo'q edi."
    ],
    requestedFeature: "Uch Qavatli Po'lat Kafolat: 30-kunlik so'zsiz qaytarish va 100% Sinish sug'urtasi"
  },
  {
    cluster: "Pricing & Localization",
    objectionTemplates: [
      "Saytda narxlar faqat AQSH dollarida berilgan, O'zbekiston so'mida bank kursi bilan qancha bo'lishini kalkulyatorda hisoblashga majburman.",
      "Chekoutda 'Service Fee' yoki yashirin yetkazib berish xarajati deb qo'shimcha summa qo'shilib ketmaydimi?",
      "Yangi xaridorlar uchun e'lon qilingan WELCOME10 chegirma promokodi savatchada ishlaydimi yoki qog'ozdagi reklama xolosmi?",
      "Mahsulot narxi mahalliy bozordagidan arzon bo'lsa ham, kargo to'lovi tufayli 2 barobar qimmatlashib ketmaydimi?",
      "Savatchadagi jami summa so'mda va dollarda bir vaqtning o'zida yaqqol ko'rinib turishi kerak, noaniqlikni yoqtirmayman."
    ],
    dislikeTemplates: [
      "Har bir kartochkada so'mdagi (UZS) ekvivalent yo'qligi sababli narxni darhol tushunish qiyin bo'ldi.",
      "Savatchada chegirma kuponi qo'llanganda yakuniy tejalgan pul so'mda ko'rsatilmadi.",
      "Yetkazib berish mutlaqo bepul ekanligi katta yozuv bilan savatchaning eng tepasida ta'kidlanmagan.",
      "Dollar narxidan tashqari davlat markaziy banki kursi bo'yicha tiniq shaffof jadval yo'qligi yoqmadi."
    ],
    requestedFeature: "Real vaqtli Dual Narx ($ USD + ≈ UZS so'm) va 100% Shaffof Savatcha Hisob-kitobi"
  },
  {
    cluster: "Customer Support & Simplicity",
    objectionTemplates: [
      "Saytda uzun anketalar to'ldirishga, karta ma'lumotlarini terishga vaqtim ham, toqatim ham yo'q. Telegram orqali 1 daqiqada odam bilan gaplashib olsa bo'ladimi?",
      "Katta yoshdagi odamlar yoki onlayn xaridni bilmaydiganlar uchun telefon yoki Telegram orqali buyurtma qabul qiluvchi jonli mutaxassis bormi?",
      "Savol tug'ilganda faqat ingliz tilidagi robot javob bermay, o'zbek tilida erkin tushuntirib bera oladigan xodim bormi?",
      "Buyurtma bergandan so'ng kuryer kelguncha aloqada bo'lib turuvchi shaxsiy menejer biriktiriladimi?",
      "Sayt interfeysi murakkab bo'lsa va ro'yxatdan o'tishni talab qilsa, buyurtmani tashlab chiqib ketaman. Oddiy 1-klik kerak."
    ],
    dislikeTemplates: [
      "Har bir mahsulot oynasida to'g'ridan-to'g'ri Telegram Concierge orqali buyurtma berish tugmasi yetishmayotgan edi.",
      "Saytda jonli yordam ko'rsatuvchi 24/7 Support Drawer tezkor aloqa oynasi ko'rinmadi.",
      "O'zbek tilida professional texnik maslahat beradigan operatorga ulanish havolasi topilmadi.",
      "Oddiy xalq uchun uzun qatorli chekout formasi juda charchatuvchi tuyuldi."
    ],
    requestedFeature: "1-Click Telegram Concierge va 24/7 Jonli O'zbek Tili Qo'llab-quvvatlash Xizmati"
  },
  {
    cluster: "Product Safety & Certifications",
    objectionTemplates: [
      "Xitoydan kelayotgan buyumlarning xalqaro xavfsizlik sertifikatlari (CE, RoHS, FDA, FCC) bormi? Sifatsiz plastikdan zaharlanib qolmaymizmi?",
      "Elektronika mahsulotlarining qizib ketmasligi va qisqa tutashuvdan himoyalanganligi zavod sinovidan o'tganmi?",
      "Bolalar yoki go'zallik parvarishi vositalari teriga zarar bermasligi, toksik moddalar yo'qligi qanday tasdiqlangan?",
      "Mahsulot zavoddan chiqishdan oldin sifat nazorati (QC Passed) tekshiruvidan o'tgani haqida rasmiy belgi bormi?",
      "Katalogdagi rasmlar haqiqiy zavod fotosuratimi yoki shunchaki 3D render chizilgan quruq tasvirmi?"
    ],
    dislikeTemplates: [
      "Kartochkalarda xalqaro sifat nishonlari (Verified Factory QC Passed, CE, RoHS) yaqqol muhrlanmagan edi.",
      "Gadjetlarning yong'in va qisqa tutashuv xavfsizligi bo'yicha texnik deklaratsiyasi ko'rsatilmadi.",
      "Kosmetika va massajorlarning sertifikatlangan zavod partiyasi raqami ochiq yozilmagan.",
      "Zavod sifat nazoratining 100% tekshiruvdan o'tgani haqidagi kafolat yorlig'i etishmadi."
    ],
    requestedFeature: "Verified Factory QC Passed, CE, RoHS va FDA Xalqaro Xavfsizlik Sertifikat Muhrlari"
  },
  {
    cluster: "Sizing & Technical Specs",
    objectionTemplates: [
      "Qishki kiyimlar va kurtkalarning o'lchami Osiyo standartimi yoki Yevropa? O'lcham adashib tor yoki kalta kelib qolmasligiga qanday aniqlik bor?",
      "Elektron qurilmalarning zaryadlovchisi 220V va bizning rozetkaga mos keladimi, adapter izlab yuramizmi?",
      "Mahsulotning aniq santimetrlari, vazni va batareya sig'imi (mAh) to'liq jadvalda ko'rsatilmagan bo'lsa, qanday qilib ishonib olaman?",
      "Kiyim matosining tarkibi (paxta, poliester, suv o'tkazmas membrana) batafsil yozilganmi?",
      "Gadjetning suvdan himoya darajasi (IP67, IP68) haqiqatan mavjudmi yoki faqat so'zdami?"
    ],
    dislikeTemplates: [
      "Kiyim-kechak kartochkalarida interaktiv Santimetr/Dyuym (CM/IN) o'lcham jadvali etishmayotgan edi.",
      "Texnik parametrlarda kuchlanish (220V/50Hz) va rozetka turi (EU Plug) alohida ajratib ko'rsatilmadi.",
      "Mahsulotning og'irligi va g'ilof materialining mustahkamlik ko'rsatkichlari to'liq berilmagan.",
      "O'lcham bo'yicha tavsiyalar va bo'y-vazn nisbati kalkulyatori ko'rinmadi."
    ],
    requestedFeature: "Interaktiv Santimetr/Dyuym O'lcham Jadvali (CM/IN) va 220V EU Plug Texnik Spetsifikatsiyasi"
  },
  {
    cluster: "Legal & Customs Compliance",
    objectionTemplates: [
      "Posilka aeroportga kelganda bojxonachilar to'xtatib, 30% bojxona solig'i yoki rasmiylashtirish to'lovi talab qilmaydimi?",
      "DDP (Delivered Duty Paid) sharti bormi? Ya'ni barcha soliq va rasmiy bojlar narx ichida to'langan bo'lishi shart.",
      "Sotib olingan buyum uchun rasmiy elektron chek va xarid hisob-fakturasi beriladimi?",
      "O'zbekiston Respublikasi qonunlariga ko'ra ruxsat etilmagan yoki litsenziyalanmagan tovarlar emasligiga kafolat bormi?",
      "Kompaniyaning rasmiy huquqiy maqomi va xalqaro savdo qoidalariga muvofiqligi haqida ma'lumot qani?"
    ],
    dislikeTemplates: [
      "Saytda bojxona to'lovlari yo'qligi (DDP Zero Customs Tax) alohida huquqiy band sifatida ta'kidlanmagan edi.",
      "Xarid cheki va xalqaro yetkazib berish shartnomasi shartlari shaffof e'lon qilinmagan.",
      "Bojxona deklaratsiyasi to'liq do'kon kargosi tomonidan rasmiylashtirilishi ochiq yozilmadi.",
      "Yuridik javobgarlik va iste'molchilar huquqlarini himoya qilish deklaratsiyasi etishmadi."
    ],
    requestedFeature: "DDP 0% Bojxona Kafolati (Delivered Duty Paid) va Rasmiy Elektron Xarid Cheki"
  }
];

function generatePersonas(targetCount = 776) {
  const personas = [];
  let maleIdx = 0;
  let femaleIdx = 0;
  let lastNameIdx = 0;
  let cityIdx = 0;
  let professionIdx = 0;
  let tempIdx = 0;
  let familyIdx = 0;

  for (let i = 1; i <= targetCount; i++) {
    const isMale = (i % 2 === 1);
    let firstName = "";
    if (isMale) {
      firstName = firstNamesMale[maleIdx % firstNamesMale.length];
      maleIdx++;
    } else {
      firstName = firstNamesFemale[femaleIdx % firstNamesFemale.length];
      femaleIdx++;
    }

    const baseLastName = lastNames[lastNameIdx % lastNames.length];
    lastNameIdx++;
    const formattedLastName = isMale ? baseLastName : baseLastName + "a";
    const fullName = `${firstName} ${formattedLastName}`;

    const minAge = 18;
    const maxAge = 75;
    const age = minAge + ((i * 7 + 13) % (maxAge - minAge + 1));

    const city = cities[cityIdx % cities.length];
    cityIdx++;

    const profession = professions[professionIdx % professions.length];
    professionIdx++;

    const temperament = temperaments[tempIdx % temperaments.length];
    tempIdx++;

    const family = familyStatuses[familyIdx % familyStatuses.length];
    familyIdx++;

    const clusterInfo = clusterDefinitions[(i - 1) % clusterDefinitions.length];
    const objectionTemplate = clusterInfo.objectionTemplates[(i - 1) % clusterInfo.objectionTemplates.length];
    const dislikeTemplate = clusterInfo.dislikeTemplates[(i - 1) % clusterInfo.dislikeTemplates.length];

    const uniqueObjection = `[№${i} - ${profession}, ${city}]: ${objectionTemplate}`;
    const uniqueDislike = `[Mijoz №${i} e'tirozi]: ${dislikeTemplate}`;

    const rawRating = 4.0 + ((i * 17) % 29) / 10;
    const initialRating = Math.min(6.8, Math.max(3.8, parseFloat(rawRating.toFixed(1))));

    personas.push({
      id: i,
      name: fullName,
      gender: isMale ? "Erkak" : "Ayol",
      age,
      city,
      profession,
      temperament,
      family,
      cluster: clusterInfo.cluster,
      whyWontBuy: uniqueObjection,
      whyDisliked: uniqueDislike,
      initialRating,
      requestedFeature: clusterInfo.requestedFeature
    });
  }

  return personas;
}

const all776 = generatePersonas(776);
const outDir = path.join(process.cwd(), "data");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, "customer_personas_776.json");
fs.writeFileSync(outPath, JSON.stringify({
  datasetName: "776_RUTHLESS_SAVAGE_CUSTOMER_PERSONAS",
  totalPersonas: all776.length,
  generationTimestamp: new Date().toISOString(),
  personas: all776
}, null, 2), "utf8");

console.log(`Successfully generated ${all776.length} unique customer personas at ${outPath}`);
