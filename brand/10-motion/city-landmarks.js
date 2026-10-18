/*
 * «Груз в пути» — original schematic city landmarks, 2026.
 * Fixed trusted SVG fragments; no user input, external assets or SVG IDs.
 * Contract: viewBox 0 0 180 200, ground y=190. Palette comes from .gvp-city-*.
 * Geographic references and illustration notes: CITIES.md.
 */
(function () {
  'use strict';

  var F = 'gvp-city-fill';
  var A = 'gvp-city-accent';
  var W = 'gvp-city-window';
  var C = 'gvp-city-cutout';
  function path(d, cls) { return '<path class="' + (cls || F) + '" d="' + d + '"/>'; }
  function rect(x, y, width, height, cls, radius) {
    return '<rect class="' + (cls || F) + '" x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '" rx="' + (radius || 0) + '"/>';
  }
  function circle(x, y, radius, cls) { return '<circle class="' + (cls || F) + '" cx="' + x + '" cy="' + y + '" r="' + radius + '"/>'; }
  function detail(d, width) { return '<path class="gvp-city-detail" d="' + d + '" fill="none" stroke-width="' + (width || 2) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function arch(x, y, width, height, cls) {
    var r = width / 2;
    return path('M' + x + ' ' + (y + height) + 'V' + (y + r) + 'a' + r + ' ' + r + ' 0 0 1 ' + width + ' 0V' + (y + height) + 'Z', cls || W);
  }
  function windows(xs, ys, width, height) {
    return ys.map(function (y) { return xs.map(function (x) { return rect(x, y, width || 6, height || 10, W, 1); }).join(''); }).join('');
  }
  function cross(x, y) { return detail('M' + x + ' ' + y + 'v10m-4-6h8', 2); }
  function onion(x, y, r) {
    return rect(x - r / 2, y + r + 2, r, 14) + path('M' + (x - r) + ' ' + (y + r + 4) + 'C' + (x - r - 5) + ' ' + (y + r - 5) + ' ' + (x - 4) + ' ' + (y + 4) + ' ' + x + ' ' + y + 'C' + (x + 4) + ' ' + (y + 4) + ' ' + (x + r + 5) + ' ' + (y + r - 5) + ' ' + (x + r) + ' ' + (y + r + 4) + 'Z', A);
  }
  function base(x, width) { return rect(x, 183, width, 7, F, 2); }
  function scene(name, landmark, landscape, source, svg) {
    return Object.freeze({ name: name, landmark: landmark, landscape: landscape, source: source, svg: svg });
  }

  var scenes = {
    moskva: scene('Москва', 'Собор Василия Блаженного', 'city', 'https://shm.ru/museum/hvb/',
      base(18, 144) +
      path('M28 183v-55l16-15 16 15v55M120 183v-55l16-15 16 15v55') +
      rect(48, 111, 26, 72) + rect(108, 105, 25, 78) +
      path('M72 183V96l18-40 18 40v87Z') +
      path('M77 95 90 53l13 42Z', A) + rect(83, 39, 14, 18) + onion(90, 18, 8) + cross(90, 9) +
      rect(53, 86, 16, 25) + onion(61, 62, 12) + cross(61, 53) +
      rect(112, 78, 16, 27) + onion(120, 54, 12) + cross(120, 45) +
      rect(34, 109, 16, 18) + onion(42, 90, 10) + cross(42, 81) +
      rect(132, 101, 15, 25) + onion(140, 80, 10) + cross(140, 71) +
      arch(82, 143, 16, 40, C) + arch(54, 132, 9, 20) + arch(113, 126, 9, 20) +
      windows([33, 137], [145, 164], 6, 10) + detail('M23 178h134M49 119h24m36-8h23M85 107h10m-10 10h10') +
      detail('M54 87l14-10m-14 3 11-9m48 7 13-13M35 110l13-10m85 1 12-12', 1.5)),

    'sankt-peterburg': scene('Санкт-Петербург', 'Главное Адмиралтейство', 'river', 'https://visit-petersburg.ru/leisure/places/tp-194700-zdanie-glavnogo-admiralteystva/',
      base(9, 162) + rect(13, 145, 154, 38) + rect(67, 111, 46, 72) +
      path('M63 113h54l-7-9H70Z', A) + rect(77, 86, 26, 21) +
      path('M75 87h30L99 72H81Z', A) + rect(84, 62, 12, 13) +
      path('M85 62 90 22l5 40Z', A) + detail('M90 11v13', 2) +
      path('M90 12h14l-5 5H87Z', A) + path('M94 9v7h7Z', A) +
      path('M9 145h59v-6H9Zm104-6h58v6h-58Z', A) +
      arch(78, 148, 24, 35, C) + windows([19, 31, 43, 55, 119, 131, 143, 155], [154, 170], 5, 9) +
      arch(81, 118, 6, 14) + arch(93, 118, 6, 14) +
      detail('M17 149h44m58 0h44M71 137h38M72 178v-32m36 32v-32M82 90h16', 1.6)),

    saratov: scene('Саратов', 'Саратовская консерватория', 'city', 'https://www.saratovmer.ru/o_saratove/dostoprimechatelnosti/dostinfo/6/',
      base(12, 156) + rect(19, 112, 142, 71) +
      rect(23, 75, 27, 108) + path('M18 76 36 39l19 37Z', A) +
      path('M31 42 36 20l5 22Z', A) + detail('M36 14v10') +
      path('M61 113 89 76l29 37Z', A) + rect(75, 109, 29, 74) +
      path('M119 112V88l11-21 11 21v95h-22Z') +
      path('M116 88 130 55l14 33Z', A) + rect(144, 102, 16, 81) +
      path('M141 103 152 82l11 21Z', A) +
      circle(89, 112, 10, C) + detail('M89 103v18m-9-9h18m-15-6 12 12m-12 0 12-12', 1.5) +
      arch(30, 88, 10, 20) + arch(30, 121, 10, 25) + arch(30, 156, 10, 27) +
      arch(80, 138, 19, 45, C) + arch(122, 105, 7, 20) + arch(132, 105, 7, 20) +
      windows([56, 111, 148], [137, 163], 6, 12) + detail('M23 151h27M61 129h54m5 15h21M17 179h147', 1.5)),

    tyumen: scene('Тюмень', 'Мост Влюблённых', 'river', 'https://visittyumen.ru/places/most-vlyublyennykh/',
      path('M8 170h164v9H8Z') +
      path('M39 183 49 64h10l11 119H58L54 97l-4 86ZM111 183l10-119h10l10 119h-12l-3-86-4 86Z') +
      path('M45 66h18v8H45Zm72 0h18v8h-18Z', A) +
      detail('M54 75 9 169m45-94L25 169m29-94 1 94m-1-94 28 94m-28-94 45 94M126 75l-45 94m45-94-28 94m28-94v94m0-94 29 94m-29-94 45 94', 1.4) +
      rect(8, 161, 164, 3, A) + detail('M11 164v7m13-7v7m13-7v7m13-7v7m13-7v7m13-7v7m13-7v7m13-7v7m13-7v7m13-7v7m13-7v7m13-7v7m13-7v7', 1.3) +
      rect(8, 183, 26, 7) + rect(146, 183, 26, 7)),

    izhevsk: scene('Ижевск', 'Свято-Михайловский собор', 'hills', 'https://foto.patriarchia.ru/church/eparkhii/izhevskaya-eparkhiya/patriarshiy-vizit-v-udmurtskuyu-mitropoliyu-liturgiya-v-mikhaylovskom-kafedralnom-sobore-izhevska/',
      base(16, 148) + path('M26 183v-46l18-16 18 16v46M118 183v-46l18-16 18 16v46') +
      path('M53 183v-74l17-18 20 18 20-18 17 18v74Z') + rect(75, 69, 30, 114) +
      path('M68 111 90 84l22 27Z', A) + rect(81, 49, 18, 24) +
      onion(90, 24, 13) + cross(90, 14) +
      rect(54, 94, 14, 18) + onion(61, 73, 10) + cross(61, 64) +
      rect(113, 94, 14, 18) + onion(120, 73, 10) + cross(120, 64) +
      rect(36, 119, 14, 19) + onion(43, 98, 10) + cross(43, 89) +
      rect(130, 119, 14, 19) + onion(137, 98, 10) + cross(137, 89) +
      arch(81, 148, 18, 35, C) + arch(83, 119, 14, 18) +
      arch(59, 128, 9, 19) + arch(112, 128, 9, 19) + arch(37, 148, 10, 20) + arch(132, 148, 10, 20) +
      detail('M24 178h132M78 143h24m-28-28h32M54 154h20m32 0h20M80 73h20', 1.5)),

    barnaul: scene('Барнаул', 'Дом под шпилем', 'city', 'https://guestcard.barnaul.org/places/mozaika/3841/',
      base(12, 156) + rect(16, 111, 102, 72) + rect(112, 85, 42, 98) + rect(118, 65, 30, 22) +
      path('M114 65h38l-11-15h-16Z', A) + path('M130 50 133 15l3 35Z', A) +
      detail('M133 11v8m0-7h10l-4 4h-6', 1.6) +
      rect(12, 106, 104, 7, A) + rect(108, 82, 50, 7, A) +
      circle(133, 74, 7, C) + detail('M133 70v5l4 2', 1.5) +
      windows([22, 35, 48, 61, 74, 87, 100], [124, 145, 165], 6, 10) +
      windows([120, 140], [99, 120, 141], 6, 11) +
      arch(123, 159, 20, 24, C) + rect(111, 154, 45, 5, A) +
      detail('M18 140h92m-92 20h92M116 91v61m34-61v61M16 116h95', 1.4)),

    ulyanovsk: scene('Ульяновск', 'Центр-музей И. А. Гончарова', 'city', 'https://www.culture.ru/institutes/11123/istoriko-memorialnyi-centr-muzei-i-a-goncharova',
      base(14, 152) + rect(18, 114, 144, 69) + path('M14 114h152l-8-12H22Z', A) +
      rect(72, 68, 36, 115) + path('M67 69h46L90 38Z', A) +
      rect(83, 29, 14, 13) + path('M79 29 90 14l11 15Z', A) +
      detail('M90 9v9', 2) + circle(90, 86, 11, C) + detail('M90 78v9l6 3', 1.8) +
      rect(70, 101, 40, 6, A) + rect(71, 124, 38, 5, A) +
      arch(82, 141, 16, 42, C) + windows([26, 41, 56, 117, 132, 147], [125, 152, 170], 7, 10) +
      arch(79, 111, 7, 12) + arch(94, 111, 7, 12) +
      detail('M22 145h45m46 0h45M22 164h45m46 0h45M22 119h45m46 0h45', 1.5)),

    irkutsk: scene('Иркутск', 'Московские ворота', 'river', 'https://admirk.ru/news/v_irkutske_zavershilsya_remont_fasada_moskovskikh_vorot/',
      base(27, 126) + rect(34, 87, 112, 96) + rect(30, 81, 120, 10, A) +
      path('M39 81V63h102v18Z') + rect(46, 56, 88, 8, A) + rect(53, 44, 74, 13) +
      path('M50 44h80l-7-7H57Z', A) +
      arch(64, 107, 52, 76, C) +
      rect(39, 96, 9, 78, A) + rect(51, 96, 7, 78, A) + rect(122, 96, 7, 78, A) + rect(132, 96, 9, 78, A) +
      rect(37, 172, 23, 8, A) + rect(120, 172, 23, 8, A) +
      path('M60 118q30-37 60 0l-5 4q-25-30-50 0Z', A) +
      rect(60, 67, 60, 7, W, 1) +
      detail('M53 51h74M36 92h108M35 179h110M64 128h-5m62 0h-5M89 100h3', 1.5)),

    yaroslavl: scene('Ярославль', 'Церковь Ильи Пророка', 'city', 'https://yarkremlin.ru/museum/tserkov-ili-proroka/?CODE=tserkov-ili-proroka',
      base(10, 160) + rect(60, 105, 85, 78) + rect(66, 89, 73, 20) +
      path('M61 107q10-18 20 0 10-18 20 0 10-18 20 0 10-18 20 0Z', A) +
      rect(94, 53, 13, 38) + onion(100.5, 30, 12) + cross(100.5, 20) +
      rect(69, 71, 12, 21) + onion(75, 51, 10) + cross(75, 42) +
      rect(121, 71, 12, 21) + onion(127, 51, 10) + cross(127, 42) +
      rect(84, 76, 10, 16) + onion(89, 59, 8) +
      rect(109, 76, 10, 16) + onion(114, 59, 8) +
      path('M17 183V111l14-35 15 35v72Z') + path('M13 112 31 64l19 48Z', A) +
      rect(26, 56, 10, 11) + onion(31, 41, 7) + cross(31, 32) +
      arch(25, 115, 12, 23, C) + rect(46, 151, 20, 32) + rect(141, 143, 22, 40) +
      path('M138 144 152 132l14 12Z', A) +
      arch(74, 127, 10, 22) + arch(96, 127, 10, 22) + arch(119, 127, 10, 22) +
      arch(96, 162, 12, 21, C) + detail('M65 157h77M17 178h146M23 144h17', 1.5)),

    tomsk: scene('Томск', 'Дом с жар-птицами', 'hills', 'https://kruzheva.lib.tomsk.ru/page/871/',
      base(22, 136) + rect(29, 113, 122, 70) + path('M22 114 58 75h69l31 39Z', A) +
      path('M65 120V86L90 63l25 23v34Z') + path('M59 88 90 58l31 30-5 5-26-26-26 26Z', A) +
      path('M25 116 49 93l24 23v9H25ZM111 116l22-23 23 23v9h-45Z') +
      detail('M68 82c-16-2-19-10-16-17 1 9 7 9 12 9l-8-14c11 3 15 9 12 22m44 0c16-2 19-10 16-17-1 9-7 9-12 9l8-14c-11 3-15 9-12 22', 2.3) +
      windows([36, 59, 83, 107, 131], [132, 161], 10, 15) +
      rect(81, 88, 18, 25, W, 2) +
      detail('M33 129h16m7 0h16m8 0h16m8 0h16m8 0h16M33 158h16m7 0h16m8 0h16m8 0h16m8 0h16M30 153h120M34 179h112M77 117h26M86 91v19m8-19v19', 1.7) +
      path('M30 120h120v5H30Z', A) + windows([33, 55, 77, 99, 121, 143], [120], 3, 7)),

    orenburg: scene('Оренбург', 'Пешеходный мост «Европа — Азия»', 'river', 'https://travel.orb.ru/chem-zanyatsya/points/interesnye-mesta/znakovye-mesta/peshekhodnyy-most-evropa-aziya2070/',
      path('M8 162h164v10H8Z') +
      path('M44 182V80h8v102Zm17 0V80h8v102ZM111 182V80h8v102Zm17 0V80h8v102Z') +
      path('M40 81 56 60l17 21v7H40ZM107 81l16-21 17 21v7h-33Z', A) +
      detail('M10 154Q35 82 56 87Q90 149 123 87q21-5 47 67', 3) +
      detail('M17 139v23m13-48v48m13-70v70m26-53v53m13-36v36m13-31v31m13-43v43m27-71v71m13-51v51m13-27v27', 1.5) +
      rect(8, 156, 164, 3, A) +
      rect(79, 129, 7, 33, A) + rect(94, 129, 7, 33, A) + path('M77 129h11l-5.5-7Zm15 0h11l-5.5-7Z', A) +
      rect(8, 182, 23, 8) + rect(149, 182, 23, 8)),

    kemerovo: scene('Кемерово', 'Монумент «Память шахтёрам Кузбасса»', 'hills', 'https://redhill-kemerovo.ru/assets/files/Almanax/2004-vyip-5.pdf',
      base(30, 120) + path('M40 183v-13h100v13ZM53 170v-40l17-10 10 7 13-9 18 8 16-2v46Z') +
      path('M70 130 66 107l8-24 5-23 19-7 17 12 9 25-11 24-10 15-5 30-15-4-4-24Z') +
      path('M78 59q-6-9-1-18 6-10 17-8l10 7 3 15-9 13-13-2Z') +
      path('M75 46q0-13 15-15 14 1 17 14l-3 4H77Z', A) +
      rect(86, 40, 9, 6, W, 2) +
      path('M76 78 63 90l-5 27 10 3 8-23 8-8ZM106 76l15 11-5 19-16 7-7-9 15-6Z', A) +
      path('M85 93 97 87l9 9-8 11-12-3Z', A) +
      path('M54 116h13l-3 11h-4v35h-5v-35h-4Z', A) +
      detail('M89 52h8m-9 7 9-1M82 70l7 15 13-15M87 114l5 10-5 23M67 134l7 26m39-24-9 26M42 176h96', 1.7)),

    ryazan: scene('Рязань', 'Соборная колокольня Рязанского кремля', 'hills', 'https://ryazankreml.ru/visitors/8/objects/1',
      base(41, 98) + rect(49, 145, 82, 38) + rect(59, 110, 62, 36) +
      rect(69, 79, 42, 31) + rect(77, 60, 26, 20) +
      path('M75 61q0-13 15-15 15 2 15 15Z', A) +
      path('M87 47 90 15l3 32Z', A) + detail('M90 8v12m-4-8h8', 1.5) +
      rect(44, 139, 92, 7, A) + rect(55, 104, 70, 7, A) + rect(66, 74, 48, 7, A) +
      arch(77, 152, 26, 31, C) + arch(79, 114, 22, 25, C) + arch(82, 84, 16, 21, C) + arch(85, 61, 10, 13, C) +
      rect(53, 149, 6, 31, A) + rect(62, 149, 6, 31, A) + rect(112, 149, 6, 31, A) + rect(121, 149, 6, 31, A) +
      detail('M65 115v21m49-21v21M73 84v18m34-18v18M45 181h90M65 133h9m33 0h9', 1.5)),

    khabarovsk: scene('Хабаровск', 'Амурский мост', 'river', 'https://museum.mintrans.ru/exposition/coins/30',
      path('M7 153h166v9H7Z') + rect(21, 160, 11, 30) + rect(84, 160, 12, 30) + rect(148, 160, 11, 30) +
      path('M8 151 27 105h63l64 0 18 46h-7l-17-39H33l-18 39Z', A) +
      detail('M15 149 34 112l16 37 18-37 19 37 19-37 19 37 18-37 22 37M27 105l5 48m17-48v48m20-48v48m21-48v48m20-48v48m20-48v48m22-48 6 48', 2.2) +
      path('M9 146h162v4H9Z', A) +
      rect(18, 181, 17, 9, A) + rect(81, 181, 18, 9, A) + rect(145, 181, 17, 9, A) +
      detail('M10 164h160m-148 3h10m52 0h12m52 0h11', 1.4)),

    kirov: scene('Киров', 'Береговая ротонда Александровского сада', 'river', 'https://xn--b1alfrhcki.xn--p1ai/place/detail/2404/',
      base(31, 118) + rect(38, 175, 104, 8, A) + rect(45, 167, 90, 8) +
      path('M40 94q3-30 50-35 47 5 50 35Z', A) +
      rect(37, 92, 106, 10) + rect(42, 103, 96, 6, A) +
      rect(49, 109, 8, 58) + rect(71, 109, 8, 58) + rect(101, 109, 8, 58) + rect(123, 109, 8, 58) +
      rect(46, 160, 14, 7, A) + rect(68, 160, 14, 7, A) + rect(98, 160, 14, 7, A) + rect(120, 160, 14, 7, A) +
      rect(85, 53, 10, 8, A) + circle(90, 50, 3, A) +
      detail('M60 154h60m-61-20h11m9 0h21m9 0h13M64 134v20m22-20v20m10-20v20m20-20v20M49 99h82', 1.7) +
      path('M10 187q9-23 20 0Zm140 0q10-30 21 0Z', A)),

    penza: scene('Пенза', 'Монумент «Росток»', 'river', 'https://www.penzatourism.ru/routes/peshekhodnye/po-istoricheskomu-tsentru/',
      base(30, 120) + path('M42 183v-11h96v11ZM58 172l6-9h52l6 9Z') +
      path('M84 163 80 75Q79 44 61 17q27 15 31 44 7-30 29-47-15 29-15 58l-8 91Z') +
      path('M89 160 88 75q1-23-10-43 20 22 18 42l-3 86Z', A) +
      path('M27 156h36v7H27Z') +
      detail('M84 91 89 157M102 63l-7 94M30 163h31M46 177h89', 1.6) +
      path('M141 187v-25h4v25Zm-8-14 10-18 10 18Zm1-12 9-16 9 16Z', A)),

    tula: scene('Тула', 'Тульский кремль', 'city', 'https://ukt71.ru/museum/tulskij-kreml/',
      base(8, 164) + rect(14, 131, 152, 52) +
      path('M15 132v-10h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v4Z', A) +
      rect(20, 91, 31, 92) + path('M15 94 35.5 55 56 94Z', A) +
      rect(127, 91, 31, 92) + path('M122 94 142.5 55 163 94Z', A) +
      rect(73, 105, 34, 78) + path('M67 108 90 70l23 38Z', A) +
      detail('M35 48v10m107-10v10M90 63v10', 1.8) +
      arch(80, 148, 20, 35, C) + arch(31, 108, 9, 17) + arch(138, 108, 9, 17) +
      rect(84, 119, 12, 13, W, 1) +
      detail('M17 178h146M22 137h27m80 0h27M25 153h17m89 0h17M54 149h15m42 0h13M24 165h25m80 0h26M76 139h28', 1.5))
  };

  window.GVP_CITY_SCENES = Object.freeze(scenes);
}());
