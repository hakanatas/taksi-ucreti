/* ─────────────────────────────────────────────────────────────
   ALTYAZILAR / CAPTIONS — düzenlenebilir.
   Kısa, tek fikir, 8. sınıf dili. start/end saniye cinsinden.
   note: öğretmen için önerilen seslendirme cümlesi.
   ───────────────────────────────────────────────────────────── */
(function (root) {
  const CAPTIONS = [
    { scene: 1, start: 4.4, end: 10.2, tr: 'Taksi ücreti', en: 'A taxi fare',
      note: 'Bir taksinin açılış ücreti 20 TL, her kilometresi 5 TL. Ücret gidilen yola bağlı. Bu ilişkiyi nasıl gösterelim?' },
    { scene: 2, start: 10.8, end: 19.2, tr: 'Tablo ve grafik', en: 'A table and a graph',
      note: 'Tabloda her kilometrede ücret 5 TL artıyor: 20, 25, 30, 35, 40. Bu sayı ikililerini grafiğe koyalım: noktalar bir doğru üzerinde.' },
    { scene: 2, start: 19.4, end: 27.8, tr: 'y = 5x + 20', en: 'y = 5x + 20',
      note: 'Cebirsel ifade: y eşittir 5x artı 20. Tablo, grafik ve cebirsel ifade aynı doğrusal ilişkiyi gösteriyor.' },
    { scene: 3, start: 28.8, end: 38.8, tr: 'Soruya göre temsil', en: 'A representation for the question',
      note: '12 kilometre kaç TL? Cebirsel ifade en hızlısı: 5 çarpı 12 artı 20, 80 TL. 60 TL ile kaç kilometre gidilir? Grafikten okuyalım: 8 kilometre.' },
    { scene: 3, start: 39.0, end: 45.8, tr: 'Doğrula', en: 'Check it',
      note: 'Cebirle doğrulayalım: 5 çarpı 8 artı 20, 60. İlk birkaç kilometre için tablo yeter.' },
    { scene: 4, start: 46.8, end: 55.8, tr: 'İkinci taksi', en: 'A second taxi',
      note: 'B taksisinin açılışı 10 TL, kilometresi 7 TL: y eşittir 7x artı 10. Doğrular 5 kilometrede kesişiyor: ikisi de 45 TL.' },
    { scene: 4, start: 56.0, end: 63.8, tr: 'Karşılaştırmada grafik', en: 'The graph for comparing',
      note: '5 kilometreden kısa yolda B, uzun yolda A daha ucuz. Grafik bu farkı bir bakışta gösterdi.' },
    { scene: 5, start: 64.8, end: 73.8, tr: 'Temsilleri tart', en: 'Weigh the representations',
      note: 'Tablo birkaç değeri hızlıca gösterir. Grafik eğilimi ve karşılaştırmayı gösterir. Cebirsel ifade her değer için kesin sonuç verir.' },
    { scene: 5, start: 74.0, end: 79.8, tr: 'Kullanışlı olanı seç', en: 'Pick the handy one',
      note: 'Aynı durum, üç temsil, farklı kolaylıklar: soruya göre en ekonomik ve kullanışlı olanı seç.' },
    { scene: 6, start: 80.6, end: 86.4, tr: 'Sabit artış: doğrusal', en: 'Constant change: linear',
      note: 'Aklında kalsın: sabit artış doğrusal bir ilişkidir; tablo, grafik ve cebirsel ifadeyle gösterilebilir.' },
    { scene: 6, start: 86.8, end: 91.0, tr: 'Soruya uygun temsil!', en: 'The right representation for the question!',
      note: 'Soruya en uygun temsili seç!' },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CAPTIONS;
  else { root.LI = root.LI || {}; root.LI.CAPTIONS = CAPTIONS; }
})(typeof window !== 'undefined' ? window : globalThis);
