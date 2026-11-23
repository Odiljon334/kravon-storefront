import fs from "node:fs";
import path from "node:path";

const categories = [
  "Smart Tech & Viral Gadgets",
  "Aesthetic Room & Ambient Living",
  "TikTok Viral Mascots & Novelty EDC",
  "Winter Streetwear & Thermal Defense",
  "Beauty, Wellness & Problem Solvers",
  "Car Tech & Travel Essentials"
];

const catalogSeed = [
  {
    id: "prod_anime_9",
    catIndex: 0,
    title: "3D-Printed Cyber Mecha Muscle Duck Figurine",
    handle: "3d-printed-cyber-mecha-muscle-duck-figurine",
    sku: "KR-CYB-DUCK-09",
    cjPid: "2611200452151606300",
    price: 38.00,
    rating: 5.0,
    reviews: 88,
    stock: 13155,
    tagline: "Viral aerodynamic buff mecha duck desk mascot with articulated polymer chassis.",
    desc: "The iconic viral cyber duck engineered with high-density ABS resin and precision 3D-printed muscular physique. Complete with aerodynamic surface finishing, weighted desk balance plate, and detachable accessories.",
    materials: "Aerospace-Grade 3D Printed Resin, Matte Enamel",
    weight: "8.5 oz",
    dim: "4.7 × 3.9 × 3.1 in",
    origin: "Shenzhen Mecha Lab",
    images: [
      "https://oss-cf.cjdropshipping.com/product/2026/11/20/04/37e40ba1-7241-48e2-8324-249aee3cb328_water.jpeg",
      "https://cf.cjdropshipping.com/quick/product/6a24a703-b2ae-4de7-af30-3b769cafc167.jpg"
    ],
    variants: [
      { id: "var_duck_yel", cjVid: "2611200452151607400", title: "Cyber Yellow Standard", hex: "#ffd700", price: 38.00, stock: 7288 },
      { id: "var_duck_blk", cjVid: "2611200452151607401", title: "Stealth Obsidian", hex: "#1a1a1a", price: 42.00, stock: 5867 }
    ],
    tags: ["Viral Duck", "Desk Mascot", "TikTok Trends", "Robot Duck"]
  },
  {
    id: "prod_anime_10",
    catIndex: 0,
    title: "K07 Transparent Mecha RGB Pulse Bluetooth Speaker",
    handle: "k07-transparent-mecha-rgb-pulse-bluetooth-speaker",
    sku: "KR-MCH-SPK-10",
    cjPid: "1628635669776052224",
    price: 64.00,
    rating: 4.9,
    reviews: 268,
    stock: 11971,
    tagline: "Exoskeleton transparent acoustic chassis with music-synced 360° RGB LED matrix.",
    desc: "Viral sci-fi acoustic speaker encased in high-transparency polycarbonate shell. Houses dual full-range audio transducers, deep passive bass radiator, and dynamic light rings pulsing synchronously to rhythm frequencies.",
    materials: "Optical-Grade Transparent Polycarbonate, Neodymium Drivers",
    weight: "14.2 oz",
    dim: "3.8 × 2.1 × 2.1 in",
    origin: "Neo-Tokyo Soundworks",
    images: [
      "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg",
      "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg"
    ],
    variants: [
      { id: "var_k07_orange", cjVid: "1628635669851549696", title: "Neon Amber", hex: "#ff8800", price: 64.00, stock: 11971 }
    ],
    tags: ["Mecha Speaker", "Bluetooth Audio", "RGB Lamp", "Desk Setup"]
  },
  {
    id: "prod_anime_11",
    catIndex: 0,
    title: "Butterfly Mecha Sliding Exoskeleton Earbuds",
    handle: "butterfly-mecha-sliding-exoskeleton-earbuds",
    sku: "KR-BTF-EAR-11",
    cjPid: "1621357782253449216",
    price: 78.00,
    rating: 4.9,
    reviews: 224,
    stock: 26037,
    tagline: "Heavyweight zinc alloy dual-wing sliding chassis with ultra-low latency gaming audio.",
    desc: "Avant-garde wearable audio device constructed with die-cast zinc alloy butterfly armor. Features mechanical tactile slider deployment, ENC noise cancellation, and customizable RGB status glyphs.",
    materials: "Die-Cast Zinc Alloy Exoskeleton, Ceramic Drivers",
    weight: "6.8 oz",
    dim: "2.8 × 2.4 × 1.1 in",
    origin: "Shenzhen Mecha Works",
    images: [
      "https://cf.cjdropshipping.com/0fc46289-7998-4fae-9221-e7579fd94590.jpg",
      "https://cf.cjdropshipping.com/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg"
    ],
    variants: [
      { id: "var_ear_silver", cjVid: "1621357782278615040", title: "Brushed Chrome", hex: "#c0c0c0", price: 78.00, stock: 11224 },
      { id: "var_ear_gunmetal", cjVid: "1621357782282809344", title: "Gunmetal Void", hex: "#2b2b2b", price: 78.00, stock: 14813 }
    ],
    tags: ["Mecha Earbuds", "Gaming Audio", "Tactile Slider", "Zinc Alloy"]
  },
  {
    id: "prod_anime_1",
    catIndex: 0,
    title: "Cyberpunk LED Light-Up Winged Mask",
    handle: "cyberpunk-led-light-up-winged-mask",
    sku: "KR-CYB-MASK-01",
    cjPid: "2611200537371608400",
    price: 118.00,
    rating: 4.9,
    reviews: 142,
    stock: 14126,
    tagline: "Hand-assembled aerodynamic cyber visor mask with dual high-luminance LED wings.",
    desc: "Forged from ultra-durable ABS resin and reinforced acrylic visor shield. Integrated bilateral LED light-bars emit crisp cyberpunk neon glow with multiple pulsing strobe patterns.",
    materials: "High-Impact ABS Polymer, Optical Polycarbonate Visor",
    weight: "18.2 oz",
    dim: "7.1 × 6.7 × 5.5 in",
    origin: "Shenzhen Precision Atelier",
    images: [
      "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/cf452c93-9c5c-4be6-96ec-255d648419ad.jpg",
      "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/23d778fb-cf7a-4ec6-8968-3bf2c3757fa0.jpg"
    ],
    variants: [
      { id: "var_mask_cyan", cjVid: "2611200537371609400", title: "Dual Halo Red", hex: "#ff0055", price: 118.00, stock: 5581 },
      { id: "var_mask_red", cjVid: "2611200537371609401", title: "Cyber Multi-Color", hex: "#00e5ff", price: 124.00, stock: 8545 }
    ],
    tags: ["Cyber Mask", "LED Visor", "Cosplay", "Festival Gear"]
  },
  {
    id: "prod_anime_5",
    catIndex: 0,
    title: "Cyberpunk LED Wing & Triangle Combat Mask",
    handle: "cyberpunk-led-wing-triangle-combat-mask",
    sku: "KR-CYB-TRIA-05",
    cjPid: "2610300446171633900",
    price: 98.00,
    rating: 4.9,
    reviews: 167,
    stock: 6023,
    tagline: "Heavy-duty tactical face shield with dual neon wing pods and geometric triangular eye-mesh.",
    desc: "Engineered with rigid composite armor plates and interchangeable dual neon color accents. Provides full face coverage with breathable chin vents and adjustable elastic head harness.",
    materials: "Reinforced Composite Resin, Silicone Seal, Optical Filter",
    weight: "16.8 oz",
    dim: "7.5 × 6.3 × 5.1 in",
    origin: "Guangzhou Tactical Dynamics",
    images: [
      "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/866299b9-1f48-4f11-9a9c-ea7fb3ba90d1_water.jpeg",
      "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/3ad92a18-d7ee-45a8-9d4d-ae099bb270d1_water.jpeg"
    ],
    variants: [
      { id: "var_mask_tri", cjVid: "2610300446171634900", title: "Red & Blue Dual Neon", hex: "#00e5ff", price: 98.00, stock: 6023 }
    ],
    tags: ["Combat Mask", "Tactical Helmet", "Festival Mask"]
  },
  {
    id: "prod_anime_8",
    catIndex: 1,
    title: "Ferrofluid Magnetic Audio Rhythm Desk Visualizer",
    handle: "ferrofluid-magnetic-audio-rhythm-desk-visualizer",
    sku: "KR-FER-RHY-08",
    cjPid: "1719271582855606272",
    price: 165.00,
    rating: 5.0,
    reviews: 727,
    stock: 25074,
    tagline: "Hypnotic NASA-grade magnetic liquid sound-reactive kinetic sculpture encased in glass.",
    desc: "Real black magnetic ferrofluid suspended in purified non-miscible solution within high-strength optical glass chamber. Built-in ultra-sensitive acoustic pickup responds instantaneously to rhythm frequencies.",
    materials: "Borosilicate Optical Glass, Aerospace Aluminum, Nano-Ferrofluid",
    weight: "32.0 oz",
    dim: "6.9 × 4.1 × 4.1 in",
    origin: "Shenzhen Quantum Tech",
    images: [
      "https://cf.cjdropshipping.com/quick/product/181a4a40-e2b2-4d10-85f0-61b7fcf7c7c3.jpg",
      "https://cf.cjdropshipping.com/quick/product/0bc8a956-aa16-43bf-9f05-aa5ae9c07e0c.jpg"
    ],
    variants: [
      { id: "var_ferro_yel", cjVid: "1719271582981435392", title: "Cyber Yellow", hex: "#ffd700", price: 165.00, stock: 11946 },
      { id: "var_ferro_gry", cjVid: "1719271583048544256", title: "Stealth Gray", hex: "#7a7d85", price: 165.00, stock: 13128 }
    ],
    tags: ["Ferrofluid", "Audio Visualizer", "Desk Setup", "Kinetic Art"]
  },
  {
    id: "prod_anime_12",
    catIndex: 3,
    title: "Cyberpunk Tactical Winter Thermal Fleece Balaclava",
    handle: "cyberpunk-tactical-winter-thermal-fleece-balaclava",
    sku: "KR-WIN-BLC-12",
    cjPid: "2609290358281623700",
    price: 34.00,
    rating: 4.9,
    reviews: 584,
    stock: 14399,
    tagline: "Windproof winter thermal ski hood with articulated breathable mouth membrane.",
    desc: "Viral sub-zero cold defense balaclava engineered with heavyweight double-brushed polar fleece. Designed for motorcycle riding, snowboarding, and urban winter street style with seamless aerodynamic fit.",
    materials: "Double-Brushed Polar Thermal Fleece, Spandex Windstopper Mesh",
    weight: "5.3 oz",
    dim: "One Size Fits All",
    origin: "Hangzhou Performance Textiles",
    images: [
      "https://oss-cf.cjdropshipping.com/product/2026/10/22/03/c5460c7c-4439-4a6f-bf96-b6df0aa58712.jpg",
      "https://oss-cf.cjdropshipping.com/product/2026/10/02/08/4a38fad5-1784-43f2-a5df-333cd7c1201a_water.jpeg"
    ],
    variants: [
      { id: "var_bala_blk", cjVid: "2609290358281624700", title: "Shadow Black", hex: "#111111", price: 34.00, stock: 7852 },
      { id: "var_bala_gry", cjVid: "2609290358281624701", title: "Stealth Charcoal", hex: "#3a3a3a", price: 34.00, stock: 6547 }
    ],
    tags: ["Balaclava", "Winter Mask", "Ski Mask", "Thermal Fleece"]
  },
  {
    id: "prod_anime_13",
    catIndex: 3,
    title: "White Duck Down Thickened Winter Puffer Jacket",
    handle: "white-duck-down-thickened-winter-puffer-jacket",
    sku: "KR-WIN-DWN-13",
    cjPid: "2611160813301639500",
    price: 148.00,
    rating: 4.8,
    reviews: 124,
    stock: 13894,
    tagline: "Heavyweight 90% white duck down thermal insulation with stand-collar wind barrier.",
    desc: "Sub-zero expedition-grade technical puffer jacket packed with premium 90% white duck down. Features matte water-resistant nylon shell, double-storm placket, zippered utility chest pockets, and thermal cuffs.",
    materials: "90% White Duck Down, 100% Ripstop Nylon, Water-Repellent DWR Finish",
    weight: "38.8 oz",
    dim: "Tailored Outerwear Fit",
    origin: "Hangzhou Down Atelier",
    images: [
      "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/d2537f01-63cb-4f58-8c62-4239e64298f5_water.jpeg",
      "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/05b5153c-9f48-4802-8ba8-5f1769628511_water.jpeg"
    ],
    variants: [
      { id: "var_puffer_m", cjVid: "2611160813311630400", title: "Midnight Black (M)", hex: "#0f1012", price: 148.00, stock: 7616 },
      { id: "var_puffer_l", cjVid: "2611160813311630401", title: "Midnight Black (L)", hex: "#181a1f", price: 148.00, stock: 6278 }
    ],
    tags: ["Puffer Jacket", "Duck Down", "Winter Coat", "Techwear Outerwear"]
  },
  {
    id: "prod_anime_2",
    catIndex: 3,
    title: "Men's Black Samurai Raw-Edge Denim Jacket",
    handle: "mens-black-samurai-raw-edge-denim-jacket",
    sku: "KR-SAM-JAC-02",
    cjPid: "2610280840411601600",
    price: 89.00,
    rating: 4.8,
    reviews: 96,
    stock: 11237,
    tagline: "Deconstructed raw-edge washed dark denim chore jacket with Japanese workwear silhouette.",
    desc: "Crafted from 13.5 oz slub selvedge denim with intentional edge distressing, custom matte gunmetal buttons, dual chest flap utility pockets, and drop-shoulder tailoring.",
    materials: "100% Heavyweight Cotton Slub Denim",
    weight: "26.5 oz",
    dim: "Oversized Street Fit",
    origin: "Okayama Heritage Looms",
    images: [
      "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/5b6f3708-3e4b-4ea7-8b09-cf8f5a6538fd_water.jpeg",
      "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/d034237f-a64b-49ef-b31b-568eb406a925_water.jpeg"
    ],
    variants: [
      { id: "var_jkt_m", cjVid: "2610280840421602600", title: "Dark Gray (M)", hex: "#16171a", price: 89.00, stock: 5386 },
      { id: "var_jkt_l", cjVid: "2610280840421602601", title: "Dark Gray (L)", hex: "#22242a", price: 89.00, stock: 5851 }
    ],
    tags: ["Denim Jacket", "Raw Edge", "Streetwear", "Japanese Denim"]
  },
  {
    id: "prod_anime_3",
    catIndex: 3,
    title: "Japanese Samurai Katana 3D Graphic Hoodie",
    handle: "japanese-samurai-katana-3d-graphic-hoodie",
    sku: "KR-KAT-HOD-03",
    cjPid: "2113090606143160320",
    price: 44.00,
    rating: 4.9,
    reviews: 215,
    stock: 15166,
    tagline: "High-density thermal fleece hoodie featuring high-definition katana illustration art.",
    desc: "Sublimation-printed 420 GSM brushed cotton-poly blend fleece with vibrant crack-resistant ink. Reinforced double-stitched kangaroo pocket, metal-tipped drawstrings, and ribbed cuffs.",
    materials: "70% Ring-Spun Cotton, 30% Thermal Polyester",
    weight: "22.4 oz",
    dim: "Relaxed Boxy Cut",
    origin: "Osaka Graphic Apparel",
    images: [
      "https://cf.cjdropshipping.com/quick/product/00e9ec1d-d9ca-4720-bc2f-376d21469e3a.jpg",
      "https://cf.cjdropshipping.com/quick/product/6e99c15b-9d41-4770-9831-2916b7ff6538.jpg"
    ],
    variants: [
      { id: "var_hoodie_l", cjVid: "2113090606143160322", title: "Katana Edition (L)", hex: "#1a1a24", price: 44.00, stock: 5760 },
      { id: "var_hoodie_xl", cjVid: "2113090606143160323", title: "Katana Edition (XL)", hex: "#111218", price: 44.00, stock: 9406 }
    ],
    tags: ["Anime Hoodie", "Graphic Pullover", "Fleece Hoodie"]
  },
  {
    id: "prod_anime_6",
    catIndex: 3,
    title: "Tactical Multi-Pocket Waterproof Techwear Cargo Pants",
    handle: "tactical-multi-pocket-waterproof-techwear-cargo-pants",
    sku: "KR-CRG-PNT-06",
    cjPid: "2111351405060333568",
    price: 96.00,
    rating: 4.8,
    reviews: 134,
    stock: 16295,
    tagline: "Waterproof ripstop cargo pants with 8 modular magnetic snap pockets and tapered ankle cuffs.",
    desc: "Engineered for urban mobility with articulated knee darts, Teflon DWR waterproof coating, heavy-duty YKK zippers, reinforced crotch gusset, and tactical webbing strap loops.",
    materials: "Ripstop Cordura Nylon, DWR Water-Repellent Treatment",
    weight: "21.1 oz",
    dim: "Ergonomic Tapered Fit",
    origin: "Shenzhen Mobility Apparel",
    images: [
      "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg",
      "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg"
    ],
    variants: [
      { id: "var_cargo_m", cjVid: "2111351405060333569", title: "Medium (Waist 30-32)", hex: "#121316", price: 96.00, stock: 6959 },
      { id: "var_cargo_l", cjVid: "2111351405060333570", title: "Large (Waist 33-35)", hex: "#1c1d22", price: 96.00, stock: 9336 }
    ],
    tags: ["Cargo Pants", "Techwear Trousers", "Tactical Pants"]
  },
  {
    id: "prod_anime_7",
    catIndex: 3,
    title: "Neo-Tokyo Cyber Ronin Haori Kimono Cardigan",
    handle: "neo-tokyo-cyber-ronin-haori-kimono-cardigan",
    sku: "KR-HAORI-KIM-07",
    cjPid: "2611221014231628300",
    price: 78.00,
    rating: 4.9,
    reviews: 112,
    stock: 15247,
    tagline: "Traditional Japanese open-front drape cardigan infused with techwear strapping details.",
    desc: "Combining classic Edo kimono silhouette with modern urban functionalism. Featuring drop-shoulder kimono sleeves, magnetic chest tether buckle, and lightweight wind-resistant fabric.",
    materials: "Textured Matte Poly-Cotton, Quick-Dry Weave",
    weight: "14.8 oz",
    dim: "Loose Flowing Fit",
    origin: "Kyoto Modern Mills",
    images: [
      "https://oss-cf.cjdropshipping.com/product/2026/11/22/10/a5c92c3a-d687-4aa7-ae1d-93cb127bc0f8.jpg",
      "https://oss-cf.cjdropshipping.com/product/2026/11/22/10/1e0ec5ee-0fae-4f1e-841f-82ffbbf25531.jpg"
    ],
    variants: [
      { id: "var_kimono_xs", cjVid: "2611221014231629300", title: "Harajuku Black (XS)", hex: "#0b0c0e", price: 78.00, stock: 7010 },
      { id: "var_kimono_sm", cjVid: "2611221014231629301", title: "Harajuku Black (S/M)", hex: "#2b2c34", price: 78.00, stock: 8237 }
    ],
    tags: ["Kimono Cardigan", "Haori", "Streetwear Drape"]
  },
  {
    id: "prod_anime_4",
    catIndex: 2,
    title: "3-Piece Ninja Warrior Dagger Prop Set",
    handle: "3-piece-ninja-warrior-dagger-prop-set",
    sku: "KR-NIN-DAG-04",
    cjPid: "2090192579601915904",
    price: 54.00,
    rating: 5.0,
    reviews: 88,
    stock: 100,
    tagline: "Precision weighted zinc-aluminum alloy ninja display blades with wrapped cord hilt.",
    desc: "Collector-grade trio of unsharpened display blades modeled after classic anime ninja armaments. Includes presentation stand and custom molded protective travel sheath.",
    materials: "Die-Cast Zinc Alloy, Paracord Grip",
    weight: "24.6 oz",
    dim: "11.8 in Total Length",
    origin: "Gifu Blade Works",
    images: [
      "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg",
      "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg"
    ],
    variants: [
      { id: "var_dagger_set", cjVid: "2090192579601915905", title: "3-Blade Complete Set", hex: "#8b1111", price: 54.00, stock: 100 }
    ],
    tags: ["Anime Props", "Display Knives", "Ninja Daggers"]
  }
];

const categoryTemplates = {
  0: [
    { name: "Smart Wi-Fi Pocket HD Cinema Projector", price: 129.00, pid: "2611230752061608900", tag: "Mini Projector", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/23/07/3e680a6c-7e3f-42e3-bc12-f19e4871c890.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/23/07/7b2a95c8-c62f-45a8-b9a3-5c829e123456.jpg", desc: "Palm-sized 1080P supported wireless smart mini projector with built-in Android OS, stereo speakers, and auto keystone correction.", mat: "High-Strength Polycarbonate, Optical Glass Lens", wt: "12.5 oz", dim: "4.3 × 4.3 × 1.8 in" },
    { name: "3-in-1 Foldable Magnetic MagSafe Charging Station", price: 48.00, pid: "2611231123251611801", tag: "Wireless Charger", img1: "https://cf.cjdropshipping.com/quick/product/181a4a40-e2b2-4d10-85f0-61b7fcf7c7c3.jpg", img2: "https://cf.cjdropshipping.com/quick/product/0bc8a956-aa16-43bf-9f05-aa5ae9c07e0c.jpg", desc: "Fast-charging Qi wireless hub capable of charging phone, smartwatch, and wireless earbuds simultaneously with fold-flat origami design.", mat: "Anodized Aluminum Alloy, Soft-Touch Silicone", wt: "7.4 oz", dim: "3.2 × 3.2 × 0.8 in (Folded)" },
    { name: "Levitating Magnetic Astronaut Soundbar", price: 88.00, pid: "2611231123251611802", tag: "Levitating Speaker", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "Futuristic zero-gravity magnetic levitation astronaut speaker floating in mid-air above electromagnetic base with breathing RGB ring.", mat: "ABS Polymer, Rare-Earth Neodymium Magnets", wt: "28.0 oz", dim: "6.7 × 4.7 × 4.7 in" },
    { name: "RGB Sound-Reactive Desktop Rhythm Light Bar", price: 32.00, pid: "2611231123251611803", tag: "RGB Visualizer", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/cf452c93-9c5c-4be6-96ec-255d648419ad.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/23d778fb-cf7a-4ec6-8968-3bf2c3757fa0.jpg", desc: "32-bit ARM processor audio rhythm pickup light featuring 32 independent color LEDs and 8 dynamic display spectrum modes.", mat: "Brushed Aluminum Shell, Optical Diffuser", wt: "3.5 oz", dim: "7.1 × 0.7 × 0.6 in" },
    { name: "Handheld High-Speed Turbo Jet Blower Fan", price: 58.00, pid: "2611231123251611804", tag: "Turbo Fan", img1: "https://cf.cjdropshipping.com/quick/product/6a24a703-b2ae-4de7-af30-3b769cafc167.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/20/04/37e40ba1-7241-48e2-8324-249aee3cb328_water.jpeg", desc: "130,000 RPM brushless motor mini jet fan delivering 52 m/s hurricane airspeed for desk dusting, outdoor fire starting, and drying.", mat: "Aerospace CNC Machined Alloy, Carbon Fiber Texture", wt: "10.2 oz", dim: "5.5 × 3.5 × 1.4 in" },
    { name: "Cyberpunk Transparent 65W Fast Power Bank", price: 72.00, pid: "2611231123251611805", tag: "Power Bank", img1: "https://cf.cjdropshipping.com/0fc46289-7998-4fae-9221-e7579fd94590.jpg", img2: "https://cf.cjdropshipping.com/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg", desc: "High-transparency 20000mAh external battery pack with smart color IPS display showing real-time voltage, current, and wattage.", mat: "Clear Polycarbonate, Industrial Alloy Frame", wt: "15.8 oz", dim: "6.1 × 2.6 × 1.1 in" },
    { name: "Retro Pixel Art Smart Desktop Clock & Display", price: 84.00, pid: "2611231123251611806", tag: "Pixel Clock", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/866299b9-1f48-4f11-9a9c-ea7fb3ba90d1_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/3ad92a18-d7ee-45a8-9d4d-ae099bb270d1_water.jpeg", desc: "16x16 programmable RGB LED matrix screen displaying customizable pixel animations, weather telemetry, clock, and game notifications.", mat: "Matte Enamel Shell, Optical Diffusion Glass", wt: "13.6 oz", dim: "3.9 × 3.9 × 1.5 in" },
    { name: "Fingerprint Encrypted High-Speed USB-C SSD Case", price: 62.00, pid: "2611231123251611807", tag: "Encrypted Storage", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "Military-grade hardware AES-256 encrypted NVMe M.2 external drive enclosure with sub-second biometric fingerprint scanner.", mat: "Die-Cast Zinc Alloy, Thermal Silicone Pad", wt: "4.8 oz", dim: "4.1 × 1.4 × 0.5 in" },
    { name: "Wireless Smart Laser Distance Measure Meter", price: 42.00, pid: "2611231123251611808", tag: "Smart Meter", img1: "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg", img2: "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg", desc: "Precision ±2mm millimeter laser measuring device with OLED screen and smartphone Bluetooth sync for instant architectural floor plans.", mat: "Anodized Aluminum Unibody, Tempered Glass", wt: "3.2 oz", dim: "3.1 × 1.4 × 0.6 in" },
    { name: "Smart Sensor Noise-Canceling Sleep Headband", price: 36.00, pid: "2611231123251611809", tag: "Sleep Audio", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/22/03/c5460c7c-4439-4a6f-bf96-b6df0aa58712.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/02/08/4a38fad5-1784-43f2-a5df-333cd7c1201a_water.jpeg", desc: "Ultra-thin 0.2-inch flat speaker headband with breathable cooling mesh for side sleepers, insomnia relief, and white noise.", mat: "Cooling Spandex Blend, Memory Foam", wt: "2.8 oz", dim: "One Size Fits All (Elastic)" },
    { name: "Smart Wireless Barcode & Micro Label Printer", price: 45.00, pid: "2611231123251611810", tag: "Thermal Printer", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "Ink-free Bluetooth thermal pocket printer for aesthetic sticker labels, cable tags, retail organization, and pantry jars.", mat: "High-Impact ABS, Thermal Printhead", wt: "6.1 oz", dim: "5.1 × 2.9 × 1.1 in" }
  ],
  1: [
    { name: "Flame Atmosphere Aroma Essential Oil Humidifier", price: 46.00, pid: "2611231123251611811", tag: "Flame Diffuser", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/12/01/5e1289bc-789a-4123-bc90-ea4561237890.jpg", img2: "https://cf.cjdropshipping.com/quick/product/0bc8a956-aa16-43bf-9f05-aa5ae9c07e0c.jpg", desc: "Realistic blazing fireplace flame simulation combining fine ultrasonic cool mist with smart amber and blue LEDs.", mat: "PP Food-Grade Polymer, Electronic Core", wt: "14.5 oz", dim: "6.7 × 4.0 × 3.0 in" },
    { name: "Sunset Golden Hour Halo Ambient Projection Lamp", price: 28.00, pid: "2119810391354687489", tag: "Sunset Lamp", img1: "https://cf.cjdropshipping.com/quick/product/181a4a40-e2b2-4d10-85f0-61b7fcf7c7c3.jpg", img2: "https://cf.cjdropshipping.com/quick/product/0bc8a956-aa16-43bf-9f05-aa5ae9c07e0c.jpg", desc: "180-degree rotatable optical crystal lens casting warm golden hour atmospheric sunlight halo across walls and ceilings.", mat: "Anodized Aluminum Stand, Optical Glass Lens", wt: "11.2 oz", dim: "10.2 × 3.9 × 3.9 in" },
    { name: "Anti-Gravity Levitating Water Droplet Visualizer", price: 68.00, pid: "2611231123251611812", tag: "Anti-Gravity", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "Optical stroboscopic technology making physical water droplets appear to levitate slowly upward while continuously purifying room air.", mat: "ABS Polymer, Silicone Internal Tubing", wt: "22.0 oz", dim: "9.1 × 4.7 × 4.7 in" },
    { name: "Deep Sea Moving Sand Art Round Glass Frame", price: 39.00, pid: "2611231123251611813", tag: "Sand Art", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "Relaxing kinetic moving sand art picture creating unique mountain landscapes and ocean dunes with every 360-degree rotation.", mat: "Lead-Free High Transparency Glass, Natural Sand", wt: "16.4 oz", dim: "7.0 × 7.0 × 1.5 in" },
    { name: "Galaxy Star Astronaut Laser Nebula Projector", price: 52.00, pid: "2611231123251611814", tag: "Star Projector", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/cf452c93-9c5c-4be6-96ec-255d648419ad.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/23d778fb-cf7a-4ec6-8968-3bf2c3757fa0.jpg", desc: "Magnetic 360-degree articulated astronaut head projecting HD starry galaxy nebulae with 8 color transitions and remote timing control.", mat: "High-Density ABS, Precision Laser Module", wt: "18.0 oz", dim: "8.9 × 4.7 × 4.4 in" },
    { name: "Crystal Diamond Touch Table Lamp with RGB", price: 26.00, pid: "2611231123251611815", tag: "Crystal Lamp", img1: "https://cf.cjdropshipping.com/0fc46289-7998-4fae-9221-e7579fd94590.jpg", img2: "https://cf.cjdropshipping.com/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg", desc: "Precision faceted acrylic crystal touch lamp creating vivid 3D blooming rose light patterns with 16 switchable color atmospheres.", mat: "Premium Optical Acrylic, Metal Base", wt: "10.0 oz", dim: "8.5 × 3.5 × 3.5 in" },
    { name: "Magnetic Levitating 3D Printed Moon Lamp", price: 79.00, pid: "2611231123251611816", tag: "Moon Lamp", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/04/37e40ba1-7241-48e2-8324-249aee3cb328_water.jpeg", img2: "https://cf.cjdropshipping.com/quick/product/6a24a703-b2ae-4de7-af30-3b769cafc167.jpg", desc: "Realistic lunar topography crafted via high-precision 3D printing, floating and spinning endlessly without contact above magnetic plinth.", mat: "Eco-Friendly PLA, Walnut Wood Finish Base", wt: "31.2 oz", dim: "5.5 in Diameter Moon" },
    { name: "Volcano Eruption Dual-Mode Essential Oil Diffuser", price: 42.00, pid: "2611231123251611817", tag: "Volcano Diffuser", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/866299b9-1f48-4f11-9a9c-ea7fb3ba90d1_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/3ad92a18-d7ee-45a8-9d4d-ae099bb270d1_water.jpeg", desc: "Dual jellyfish smoke ring pulse mode and continuous red flame eruption mode for stress-relief and relaxing aromatic room ambiance.", mat: "Food-Safe Polypropylene, Electroplated Knobs", wt: "15.0 oz", dim: "5.4 × 5.4 × 4.3 in" },
    { name: "Kinetic Perpetual Motion Pendulum Art Sculpture", price: 34.00, pid: "2611050734481623600", tag: "Kinetic Art", img1: "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg", img2: "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg", desc: "Silent electromagnetic perpetual desk orbit sculpture swinging continuously to demonstrate momentum conservation laws.", mat: "Chrome-Plated Steel, High-Density Base", wt: "12.8 oz", dim: "9.4 × 8.7 × 4.3 in" },
    { name: "Infinity Mirror RGB Tunnel Hexagon Wall Panel", price: 64.00, pid: "2611231123251611818", tag: "Infinity Mirror", img1: "https://cf.cjdropshipping.com/quick/product/00e9ec1d-d9ca-4720-bc2f-376d21469e3a.jpg", img2: "https://cf.cjdropshipping.com/quick/product/6e99c15b-9d41-4770-9831-2916b7ff6538.jpg", desc: "Mind-bending infinite depth optical tunnel light with customizable dynamic RGB chasing patterns controlled via smartphone app.", mat: "Two-Way Mirror Glass, Aluminum Alloy Frame", wt: "25.0 oz", dim: "11.0 × 9.5 × 1.2 in" },
    { name: "Ceramic Backflow Waterfall Dragon Incense Burner", price: 29.00, pid: "2611120155171600700", tag: "Incense Burner", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/5b6f3708-3e4b-4ea7-8b09-cf8f5a6538fd_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/d034237f-a64b-49ef-b31b-568eb406a925_water.jpeg", desc: "Handcrafted glazed ceramic sculpture directing dense aromatic smoke downward in tranquil cascaded waterfalls around crystal sphere.", mat: "High-Fired Glazed Ceramic", wt: "20.5 oz", dim: "7.8 × 4.1 × 3.9 in" },
    { name: "RGB Neon Anime Cyber Cloud Wall Sign", price: 38.00, pid: "2611231123251611819", tag: "Neon Sign", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/22/10/a5c92c3a-d687-4aa7-ae1d-93cb127bc0f8.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/22/10/1e0ec5ee-0fae-4f1e-841f-82ffbbf25531.jpg", desc: "Flexible silicone LED neon light mounted on transparent acrylic backing with dimmer switch and USB low-voltage power supply.", mat: "Silicone LED Neon Strips, Acrylic Backplate", wt: "11.0 oz", dim: "13.8 × 8.7 × 0.6 in" },
    { name: "Smart Ambient Hexagonal Modular Touch Wall Light", price: 49.00, pid: "2611231123251611820", tag: "Hexagon Light", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/d2537f01-63cb-4f58-8c62-4239e64298f5_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/05b5153c-9f48-4802-8ba8-5f1769628511_water.jpeg", desc: "Modular magnetic hexagon light tiles that connect magnetically in any geometric pattern and light up seamlessly upon finger touch.", mat: "ABS Polymer, Optical Diffuser", wt: "19.2 oz", dim: "4.5 × 3.9 × 0.8 in (Per Tile)" },
    { name: "Floating Magnetic Levitating Bonsai Flower Pot", price: 82.00, pid: "2611231123251611821", tag: "Levitating Plant", img1: "https://cf.cjdropshipping.com/quick/product/181a4a40-e2b2-4d10-85f0-61b7fcf7c7c3.jpg", img2: "https://cf.cjdropshipping.com/quick/product/0bc8a956-aa16-43bf-9f05-aa5ae9c07e0c.jpg", desc: "Futuristic zero-gravity geometric planter suspended and rotating smoothly in mid-air to ensure 360-degree sunlight absorption.", mat: "High-Strength Polymer, Walnut Wood Grain Base", wt: "29.4 oz", dim: "5.3 × 5.3 × 1.1 in Base" },
    { name: "Jellyfish Aquarium Mood Night Light with RGB", price: 44.00, pid: "2611231123251611822", tag: "Jellyfish Lamp", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "Realistic lifelike silicone jellyfish gliding effortlessly through water illuminated by 16 color-changing underwater LED spotlights.", mat: "Optical-Grade Acrylic Tank, Silicone Jellyfish", wt: "24.0 oz", dim: "11.8 × 4.1 × 4.1 in" }
  ],
  2: [
    { name: "3D-Printed Articulated Crystal Gem Dragon", price: 29.00, pid: "2611231123251611823", tag: "Crystal Dragon", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/04/37e40ba1-7241-48e2-8324-249aee3cb328_water.jpeg", img2: "https://cf.cjdropshipping.com/quick/product/6a24a703-b2ae-4de7-af30-3b769cafc167.jpg", desc: "Viral 18-inch fully flexible articulated mythical dragon printed in dual-tone iridescent silk PLA with gemstone faceted spine scales.", mat: "High-Gloss Silk PLA Polymer", wt: "6.2 oz", dim: "18.0 × 2.4 × 1.5 in" },
    { name: "Heavyweight Mechanical Slider Haptic Fidget Coin", price: 34.00, pid: "2611231123251611824", tag: "Haptic Slider", img1: "https://cf.cjdropshipping.com/0fc46289-7998-4fae-9221-e7579fd94590.jpg", img2: "https://cf.cjdropshipping.com/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg", desc: "CNC machined stainless steel sensory slider featuring strong magnetic detents delivering crisp mechanical tactile feedback.", mat: "Solid Stainless Steel 304, Neodymium Magnets", wt: "3.2 oz", dim: "1.8 × 1.1 × 0.4 in" },
    { name: "Precision Gyroscope Metal Spinning Desktop Top", price: 32.00, pid: "2611231123251611825", tag: "Spinning Top", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "Perfect balance engineered spinning top machined from solid aerospace brass with silicon nitride ceramic contact bearing ball.", mat: "Solid Brass, Silicon Nitride Ceramic Ball", wt: "2.4 oz", dim: "1.2 × 1.2 × 1.4 in" },
    { name: "Magnetic Deconstructable Modular Fidget Pen", price: 24.00, pid: "2611231123251611826", tag: "Fidget Pen", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/866299b9-1f48-4f11-9a9c-ea7fb3ba90d1_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/3ad92a18-d7ee-45a8-9d4d-ae099bb270d1_water.jpeg", desc: "Functional gel ink rollerball pen constructed from 13 neodymium magnetic cylinders and steel spheres that transform into endless shapes.", mat: "High-Strength Rare Earth Magnets, Steel Balls", wt: "4.5 oz", dim: "5.5 × 0.4 in" },
    { name: "Titanium EDC Pry Bar & Multi-Tool Pocket Clip", price: 42.00, pid: "2611231123251611827", tag: "EDC Prybar", img1: "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg", img2: "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg", desc: "Grade 5 TC4 titanium alloy utility pry tool featuring bottle opener, hex wrench, nail puller, and glass breaker tip.", mat: "TC4 Aerospace Titanium Alloy", wt: "1.8 oz", dim: "4.7 × 0.9 × 0.2 in" },
    { name: "Articulated Lucky 13 Mecha Action Figurine", price: 27.00, pid: "2611231123251611828", tag: "Action Figure", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/04/37e40ba1-7241-48e2-8324-249aee3cb328_water.jpeg", img2: "https://cf.cjdropshipping.com/quick/product/6a24a703-b2ae-4de7-af30-3b769cafc167.jpg", desc: "Multi-jointed posable robot mannequin with 30 movable articulation points, 3 interchangeable weapon packs, and desk display stand.", mat: "High-Flexibility ABS Polymer", wt: "4.0 oz", dim: "5.5 × 2.0 × 1.0 in" },
    { name: "Balisong Dull Blade Butterfly Practice Trainer", price: 28.00, pid: "2611231123251611829", tag: "Butterfly Trainer", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "Safe 100% unsharpened stainless steel flip trainer with bushing pivot system, skeletonized handles, and weighted center balance.", mat: "440C Stainless Steel, Brass Washers", wt: "4.8 oz", dim: "8.7 in Open Length" },
    { name: "Mini Heavyweight Bolt-Action Brass Pocket Pen", price: 32.00, pid: "2611231123251611830", tag: "Tactical Pen", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/5b6f3708-3e4b-4ea7-8b09-cf8f5a6538fd_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/d034237f-a64b-49ef-b31b-568eb406a925_water.jpeg", desc: "Solid brass pocket pen with satisfying bolt-action deployment mechanism and pressurized Schmidt ink cartridge compatibility.", mat: "Solid H62 Brass Unibody", wt: "2.6 oz", dim: "3.7 × 0.4 in" },
    { name: "Magnetic Metal Infinity Cube Stress Fidget", price: 22.00, pid: "2611231123251611831", tag: "Infinity Cube", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "Precision die-cast aluminum alloy 8-block foldable infinity cube with sandblasted anodized surface for tactile relaxation.", mat: "Anodized Aluminum Alloy, Brass Pins", wt: "5.5 oz", dim: "1.6 × 1.6 × 1.6 in" },
    { name: "Mechanical Keyboard Switch Fidget Keychain", price: 18.00, pid: "2611231123251611832", tag: "Switch Fidget", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/cf452c93-9c5c-4be6-96ec-255d648419ad.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/23d778fb-cf7a-4ec6-8968-3bf2c3757fa0.jpg", desc: "Authentic mechanical blue clicky switch housed in CNC aluminum housing with transparent PBT keycap and built-in RGB LED flash.", mat: "CNC Aluminum Frame, PBT Keycap", wt: "1.5 oz", dim: "1.2 × 1.0 × 1.0 in" },
    { name: "Kinetic Optical Illusion Brass Vortex Desk Toy", price: 36.00, pid: "2611231123251611833", tag: "Optical Toy", img1: "https://cf.cjdropshipping.com/quick/product/181a4a40-e2b2-4d10-85f0-61b7fcf7c7c3.jpg", img2: "https://cf.cjdropshipping.com/quick/product/0bc8a956-aa16-43bf-9f05-aa5ae9c07e0c.jpg", desc: "Precision machined solid sphere creating a continuous 360-degree flowing helix optical illusion when spun upon flat desktop.", mat: "Solid Stainless Steel with Polished Spiral", wt: "6.8 oz", dim: "1.9 × 1.9 × 1.9 in" },
    { name: "Tactical Quick-Release Keychain Titanium Carabiner", price: 26.00, pid: "2611231123251611834", tag: "Titanium Carabiner", img1: "https://cf.cjdropshipping.com/0fc46289-7998-4fae-9221-e7579fd94590.jpg", img2: "https://cf.cjdropshipping.com/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg", desc: "Ultra-strong ultralight TC4 titanium alloy carabiner with one-handed spring gate mechanism and integrated pry tool.", mat: "TC4 Aerospace Titanium", wt: "1.1 oz", dim: "2.8 × 1.3 × 0.2 in" },
    { name: "Magnetic Slider Gun Tactile Fidget Clicker", price: 31.00, pid: "2611231123251611835", tag: "Tactile Clicker", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/866299b9-1f48-4f11-9a9c-ea7fb3ba90d1_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/3ad92a18-d7ee-45a8-9d4d-ae099bb270d1_water.jpeg", desc: "Mechanical push-slider simulating crisp firearm slide action with internal dual-stage spring detents and textured grip.", mat: "Alloy Steel, Stainless Springs", wt: "3.8 oz", dim: "2.4 × 1.2 × 0.5 in" },
    { name: "3D Articulated Skeleton Warrior Action Figurine", price: 29.00, pid: "2611231123251611836", tag: "Skeleton Mecha", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/04/37e40ba1-7241-48e2-8324-249aee3cb328_water.jpeg", img2: "https://cf.cjdropshipping.com/quick/product/6a24a703-b2ae-4de7-af30-3b769cafc167.jpg", desc: "Fully poseable 3D printed mechanical skeleton warrior with interchangeable hands and tactical combat broadsword accessory.", mat: "High-Toughness Composite Resin", wt: "4.2 oz", dim: "6.0 × 2.2 × 1.1 in" },
    { name: "Heavyweight Brass Knuckle Paperweight EDC", price: 35.00, pid: "2611231123251611837", tag: "Brass Paperweight", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "Solid forged yellow brass four-finger collector paperweight with chamfered finger holes and hand-polished antique patina finish.", mat: "Solid Cast H59 Brass", wt: "9.5 oz", dim: "4.5 × 2.6 × 0.4 in" }
  ],
  3: [
    { name: "USB Smart Electric Heated Thermal Vest", price: 59.00, pid: "2611231123251611838", tag: "Heated Vest", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/d2537f01-63cb-4f58-8c62-4239e64298f5_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/05b5153c-9f48-4802-8ba8-5f1769628511_water.jpeg", desc: "9 carbon fiber heating zones powered by 5V USB battery pack delivering 3 temperature levels up to 131°F in 5 seconds.", mat: "Waterproof Polyester Shell, Carbon Fiber Wire", wt: "14.2 oz", dim: "Sizes M to 3XL Available" },
    { name: "Touchscreen Winter Windproof Thermal Fleece Gloves", price: 26.00, pid: "2611231123251611839", tag: "Thermal Gloves", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/22/03/c5460c7c-4439-4a6f-bf96-b6df0aa58712.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/02/08/4a38fad5-1784-43f2-a5df-333cd7c1201a_water.jpeg", desc: "Sensitive conductive silicone fingertips with anti-slip palm grip, zipper wind cuffs, and water-repellent neoprene outer shell.", mat: "High-Density Polar Fleece, SBR Waterproof Layer", wt: "3.8 oz", dim: "Sizes M, L, XL" },
    { name: "Oversized Heavyweight Sherpa Blanket Hoodie", price: 54.00, pid: "2611231123251611840", tag: "Blanket Hoodie", img1: "https://cf.cjdropshipping.com/quick/product/00e9ec1d-d9ca-4720-bc2f-376d21469e3a.jpg", img2: "https://cf.cjdropshipping.com/quick/product/6e99c15b-9d41-4770-9831-2916b7ff6538.jpg", desc: "Giant wearable fleece blanket hoodie lined with ultra-soft fluffy sherpa, giant front snack pouch, and elasticized warmth cuffs.", mat: "300 GSM Microfiber Flannel, 280 GSM Sherpa", wt: "34.0 oz", dim: "One Size Fits All (Oversized)" },
    { name: "Fleece-Lined Winter Windproof Tactical Joggers", price: 68.00, pid: "2611231123251611841", tag: "Winter Joggers", img1: "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg", img2: "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg", desc: "Heavy sub-zero cargo joggers insulated with thick thermal fleece lining, waterproof zippered pockets, and reinforced gussets.", mat: "Windproof Nylon-Spandex Shell, Polar Fleece Lining", wt: "23.5 oz", dim: "Sizes M, L, XL, XXL" },
    { name: "Waterproof Winter Down Thermal Cloud Slides", price: 38.00, pid: "2611231123251611842", tag: "Down Slippers", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/d2537f01-63cb-4f58-8c62-4239e64298f5_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/05b5153c-9f48-4802-8ba8-5f1769628511_water.jpeg", desc: "Indoor-outdoor puffer slipper boots filled with duck down thermal insulation and thick non-slip EVA cloud platform soles.", mat: "Waterproof Ripstop Nylon, Thickened EVA Sole", wt: "12.0 oz", dim: "Sizes 36 to 45" },
    { name: "High-Neck Windstopper Polar Fleece Neck Gaiter", price: 21.00, pid: "2611231123251611843", tag: "Neck Gaiter", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/22/03/c5460c7c-4439-4a6f-bf96-b6df0aa58712.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/02/08/4a38fad5-1784-43f2-a5df-333cd7c1201a_water.jpeg", desc: "Adjustable drawstring thermal neck scarf warm collar shielding throat and chest against sub-zero biting winter gusts.", mat: "Anti-Pilling Double Layer Fleece", wt: "3.2 oz", dim: "11.8 × 9.8 in" },
    { name: "LED Illuminated Winter Knit Rechargeable Beanie", price: 24.00, pid: "2611231123251611844", tag: "LED Beanie", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "Ultra-warm ribbed knit winter beanie featuring removable USB-rechargeable 4-LED headlight with 3 brightness settings.", mat: "Elastic Acrylic Knit, Ultra-Soft Lining", wt: "4.5 oz", dim: "Stretch Fit" },
    { name: "Reflective Tactical Functional Chest Rig Bag", price: 42.00, pid: "2611231123251611845", tag: "Chest Rig", img1: "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg", img2: "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg", desc: "Hands-free tactical streetwear chest pack with 3M reflective safety webbing, waterproof phone pouch, and headphone pass-through.", mat: "1000D Cordura Waterproof Nylon", wt: "8.5 oz", dim: "8.7 × 5.9 × 2.0 in" },
    { name: "Magnetic Quick-Release Metal Utility Webbing Belt", price: 25.00, pid: "2611231123251611846", tag: "Magnetic Belt", img1: "https://cf.cjdropshipping.com/quick/product/0fc46289-7998-4fae-9221-e7579fd94590.jpg", img2: "https://cf.cjdropshipping.com/quick/product/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg", desc: "Heavy-duty tactical nylon belt with patented magnetic slide buckle snapping shut instantly and opening with a single finger tug.", mat: "High-Tensile Nylon Webbing, Zinc Alloy Buckle", wt: "7.0 oz", dim: "49.2 in Length (Adjustable)" },
    { name: "Waterproof Anti-Theft Crossbody Sling Backpack", price: 48.00, pid: "2611231123251611847", tag: "Sling Bag", img1: "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg", img2: "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg", desc: "Hard-shell EVA geometric chest bag with TSA combination lock, integrated USB charging port, and hidden card pocket.", mat: "Shockproof EVA Shell, Waterproof Oxford Cloth", wt: "17.6 oz", dim: "12.6 × 6.7 × 3.5 in" }
  ],
  4: [
    { name: "7-Color LED Photon Facial Light Therapy Mask", price: 79.00, pid: "2611231123251611848", tag: "LED Face Mask", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/cf452c93-9c5c-4be6-96ec-255d648419ad.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/23d778fb-cf7a-4ec6-8968-3bf2c3757fa0.jpg", desc: "Salon-grade phototherapy mask emitting 7 therapeutic light wavelengths to stimulate collagen, reduce redness, and eliminate acne bacteria.", mat: "Medical-Grade Silicone, Optical Waveguides", wt: "15.0 oz", dim: "9.0 × 7.5 × 4.0 in" },
    { name: "Microcurrent EMS V-Line Face Sculpting Massager", price: 49.00, pid: "2611231123251611849", tag: "EMS Sculptor", img1: "https://cf.cjdropshipping.com/quick/product/0fc46289-7998-4fae-9221-e7579fd94590.jpg", img2: "https://cf.cjdropshipping.com/quick/product/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg", desc: "Ergonomic handheld microcurrent roller sending gentle bioelectric pulses to tighten skin, sculpt jawline contours, and reduce puffiness.", mat: "Zinc Alloy Roller Heads, ABS Handle", wt: "5.8 oz", dim: "6.3 × 2.4 × 1.2 in" },
    { name: "Ultrasonic 45kHz Retainer & Jewelry Cleaner Machine", price: 44.00, pid: "2611231123251611850", tag: "Ultrasonic Cleaner", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "45,000 Hz high-frequency soundwave cavitation bath dislodging microscopic grime from dental aligners, retainers, rings, and glasses.", mat: "304 Food-Grade Stainless Steel Tank, ABS", wt: "16.8 oz", dim: "7.5 × 4.1 × 3.7 in" },
    { name: "Heated Shiatsu Cervical Neck & Shoulder Massager", price: 62.00, pid: "2611231123251611851", tag: "Neck Massager", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "8 deep-kneading 3D rotation nodes with soothing infrared heat therapy relieving tense trapezius knots and chronic desk stiffness.", mat: "Breathable Mesh, Premium PU Leather", wt: "38.0 oz", dim: "15.7 × 7.8 × 6.3 in" },
    { name: "Stainless Steel Face & Eye Depuffing Ice Roller", price: 19.00, pid: "2611231123251611852", tag: "Ice Roller", img1: "https://cf.cjdropshipping.com/quick/product/181a4a40-e2b2-4d10-85f0-61b7fcf7c7c3.jpg", img2: "https://cf.cjdropshipping.com/quick/product/0bc8a956-aa16-43bf-9f05-aa5ae9c07e0c.jpg", desc: "Cold-retaining stainless steel barrel providing instant cryotherapy to shrink pores, calm morning face puffiness, and soothe headaches.", mat: "Food-Grade Stainless Steel, Ergonomic Handle", wt: "4.8 oz", dim: "6.5 × 2.6 × 1.5 in" },
    { name: "Ergonomic Cervical Memory Foam Contour Pillow", price: 56.00, pid: "2611231123251611853", tag: "Cervical Pillow", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "Orthopedic butterfly contour design supporting spinal alignment and neck traction for back and side sleepers seeking pain relief.", mat: "Slow-Rebound Memory Foam, Washable Silk Pillowcase", wt: "36.0 oz", dim: "24.0 × 14.5 × 4.7 in" },
    { name: "Smart Dynamic Electric Cupping Therapy Massager", price: 38.00, pid: "2611231123251611854", tag: "Cupping Massager", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/866299b9-1f48-4f11-9a9c-ea7fb3ba90d1_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/3ad92a18-d7ee-45a8-9d4d-ae099bb270d1_water.jpeg", desc: "Combining rhythmic suction cupping, red light therapy, and 12-level temperature control for accelerated muscle recovery and fascia release.", mat: "High-Temperature Resistant ABS, Silicone Cup", wt: "10.5 oz", dim: "3.7 × 3.7 × 3.1 in" },
    { name: "Smart Posture Corrector with Vibration Reminder", price: 29.00, pid: "2611231123251611855", tag: "Posture Corrector", img1: "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg", img2: "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg", desc: "Intelligent angle sensor buzzing gently whenever spine slouches forward beyond 25 degrees to build natural muscle memory.", mat: "High-Elastic Nylon Harness, Silicone Sensor", wt: "3.0 oz", dim: "Universal Adjustable Chest Strap" },
    { name: "Sonic Waterproof Silicone Facial Cleansing Brush", price: 32.00, pid: "2611231123251611856", tag: "Facial Brush", img1: "https://cf.cjdropshipping.com/quick/product/0fc46289-7998-4fae-9221-e7579fd94590.jpg", img2: "https://cf.cjdropshipping.com/quick/product/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg", desc: "8,000 sonic pulsations per minute channeled through soft antimicrobial silicone bristles to lift away 99.5% of dirt, oil, and makeup residue.", mat: "FDA-Grade Soft Silicone, IPX7 Waterproof", wt: "4.2 oz", dim: "3.1 × 3.0 × 1.2 in" },
    { name: "Acupressure Foot Massage Mat with Magnet Spheres", price: 27.00, pid: "2611231123251611857", tag: "Acupressure Mat", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/5b6f3708-3e4b-4ea7-8b09-cf8f5a6538fd_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/d034237f-a64b-49ef-b31b-568eb406a925_water.jpeg", desc: "Targeted reflexology points stimulated by contoured nodules and bio-magnets to promote blood circulation and relieve plantar fasciitis.", mat: "Non-Toxic TPE Polymer, Bio-Magnets", wt: "14.0 oz", dim: "15.0 × 11.5 in" },
    { name: "Octopus Claw Electric Scalp Head Massager", price: 35.00, pid: "2611231123251611858", tag: "Scalp Massager", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/04/37e40ba1-7241-48e2-8324-249aee3cb328_water.jpeg", img2: "https://cf.cjdropshipping.com/quick/product/6a24a703-b2ae-4de7-af30-3b769cafc167.jpg", desc: "12 multi-frequency vibration tentacles delivering gentle 360-degree scalp stimulation to reduce migraines, stress, and hair loss.", mat: "Soft TPE Tentacles, Micro-Motor Core", wt: "7.8 oz", dim: "7.0 × 5.5 × 5.5 in" },
    { name: "Blue Light Blocking Titanium Computer Glasses", price: 39.00, pid: "2611231123251611859", tag: "Blue Light Glasses", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "Ultra-flexible lightweight memory titanium frames with multi-layer anti-reflective lenses filtering 99% of harmful digital screen blue light.", mat: "Beta-Titanium Alloy, CR-39 Optical Lenses", wt: "0.6 oz (Ultralight)", dim: "52-18-142 mm" },
    { name: "Bluetooth 3D Contoured Eye Mask for Sleeping", price: 33.00, pid: "2611231123251611860", tag: "Sleep Mask", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/22/03/c5460c7c-4439-4a6f-bf96-b6df0aa58712.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/02/08/4a38fad5-1784-43f2-a5df-333cd7c1201a_water.jpeg", desc: "100% blackout 3D eye cup design eliminating eye pressure with built-in high-fidelity ultra-flat stereo speakers and 10-hour battery.", mat: "Cooling Memory Foam, Breathable Ice Silk", wt: "3.5 oz", dim: "Universal Adjustable Strap" },
    { name: "High-Pressure Ionic Filter Mineral Shower Head", price: 29.00, pid: "2611231123251611861", tag: "Ionic Shower", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "Micro-nozzle laser perforation boosting water pressure by 200% while triple mineral stone beads filter chlorine, heavy metals, and rust.", mat: "Clear Polycarbonate, Bioactive Mineral Stones", wt: "9.2 oz", dim: "9.8 × 3.1 in" },
    { name: "Rechargeable Electric Fabric Shaver Lint Remover", price: 25.00, pid: "2611231123251611862", tag: "Lint Shaver", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/d2537f01-63cb-4f58-8c62-4239e64298f5_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/05b5153c-9f48-4802-8ba8-5f1769628511_water.jpeg", desc: "6-blade stainless steel floating cutter head shaving fabric pills, fuzz, and lint from sweaters, coats, and furniture in seconds.", mat: "ABS Body, Stainless Honeycomb Mesh", wt: "6.8 oz", dim: "5.5 × 3.1 × 3.1 in" },
    { name: "Automatic Retractable Cord & Cable Management Hub", price: 18.00, pid: "2611231123251611863", tag: "Cable Winder", img1: "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg", img2: "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg", desc: "One-pull automatic winding mechanism organizing headphone cords and USB cables neatly in compact pocket disc.", mat: "Durable ABS Housing", wt: "1.4 oz", dim: "2.7 × 2.0 × 0.6 in" }
  ],
  5: [
    { name: "15W Qi Smart Sensor Auto-Clamping Car Phone Mount", price: 38.00, pid: "2611231123251611864", tag: "Car Mount", img1: "https://cf.cjdropshipping.com/quick/product/0fc46289-7998-4fae-9221-e7579fd94590.jpg", img2: "https://cf.cjdropshipping.com/quick/product/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg", desc: "Infrared motion sensor automatically opening motorized arms and clamping phone firmly while delivering 15W fast wireless charging.", mat: "Mirror Glass Faceplate, Aluminum Alloy Arms", wt: "6.5 oz", dim: "4.5 × 2.8 × 2.0 in" },
    { name: "Cordless High-Power Handheld Mini Car Vacuum", price: 46.00, pid: "2123660735518212097", tag: "Car Vacuum", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "12,000 Pa cyclone brushless motor suction vacuum with washable HEPA filter and 2-in-1 crevice brush for car seats, vents, and crumbs.", mat: "High-Impact ABS, Washable HEPA Filter", wt: "13.0 oz", dim: "9.8 × 2.2 × 2.2 in" },
    { name: "Digital Smart Portable Tire Air Inflator Pump", price: 54.00, pid: "2611231123251611865", tag: "Tire Inflator", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/866299b9-1f48-4f11-9a9c-ea7fb3ba90d1_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/30/04/3ad92a18-d7ee-45a8-9d4d-ae099bb270d1_water.jpeg", desc: "Rechargeable 150 PSI cordless tire compressor featuring digital LCD pressure preset and auto-shutoff when target pressure is reached.", mat: "Reinforced Alloy Cylinder, Heat-Dissipating Shell", wt: "17.0 oz", dim: "6.2 × 2.6 × 1.8 in" },
    { name: "Emergency Glass Breaker & Seatbelt Cutter Tool", price: 18.00, pid: "2611231123251611866", tag: "Safety Hammer", img1: "https://cf.cjdropshipping.com/quick/product/1812847b-1cb8-4bc2-811c-92275e5f52bf.jpg", img2: "https://cf.cjdropshipping.com/quick/product/a53e414c-e83c-49a3-9569-80862d3aee44.jpg", desc: "Spring-loaded tungsten steel window spike shattering car glass underwater in 0.1s with guarded razor-sharp seatbelt slice blade.", mat: "Tungsten Steel Point, Aluminum Alloy Shell", wt: "2.1 oz", dim: "3.5 × 0.8 in" },
    { name: "Solar Powered Rotating Helicopter Car Air Freshener", price: 27.00, pid: "2611231123251611867", tag: "Car Aromatherapy", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/04/37e40ba1-7241-48e2-8324-249aee3cb328_water.jpeg", img2: "https://cf.cjdropshipping.com/quick/product/6a24a703-b2ae-4de7-af30-3b769cafc167.jpg", desc: "Mini alloy helicopter model whose solar rotor blades spin autonomously in daylight to disperse botanical aromatherapy fragrance rings.", mat: "Electroplated Zinc Alloy, Beechwood Core", wt: "5.5 oz", dim: "4.1 × 2.8 × 2.4 in" },
    { name: "RGB Sound-Controlled Car Interior Ambient Light Strips", price: 29.00, pid: "2611231123251611868", tag: "Car Ambient Light", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/cf452c93-9c5c-4be6-96ec-255d648419ad.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/23d778fb-cf7a-4ec6-8968-3bf2c3757fa0.jpg", desc: "4-piece waterproof flexible RGB footwell strips syncing pulses dynamically to car stereo music via smartphone Bluetooth app.", mat: "Flexible Silicone, 5050 SMD LEDs", wt: "7.0 oz", dim: "4 × 8.7 in Strips" },
    { name: "Strong Magnetic MagSafe Car Air Vent Phone Ring", price: 22.00, pid: "2611231123251611869", tag: "MagSafe Mount", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "20 rare-earth N52 neodymium magnets locked inside circular metal ring holding phones rock-steady through sudden bumps and sharp turns.", mat: "Anodized Aluminum Alloy, Silicone Pad", wt: "2.6 oz", dim: "2.4 × 2.4 × 1.2 in" },
    { name: "Tactical 7-in-1 Survival Paracord Compass Bracelet", price: 16.00, pid: "2611231123251611870", tag: "Paracord Bracelet", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "Military 550 lb parachute cord unraveling into 10 feet of cordage with flint fire starter, loud whistle, compass, and scraper.", mat: "550 Military Paracord, Magnesium Flint", wt: "1.4 oz", dim: "9.8 × 1.0 in" },
    { name: "Heavy-Duty Multi-Compartment Car Trunk Organizer", price: 39.00, pid: "2611231131471634300", tag: "Trunk Organizer", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/5b6f3708-3e4b-4ea7-8b09-cf8f5a6538fd_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/28/08/d034237f-a64b-49ef-b31b-568eb406a925_water.jpeg", desc: "Collapsible 600D waterproof Oxford storage box with reinforced aluminum handles, removable divider plates, and non-slip rubber base.", mat: "600D Waterproof Oxford Polyester", wt: "36.0 oz", dim: "23.6 × 14.6 × 12.6 in" },
    { name: "Windproof Dual-Arc Plasma USB Rechargeable Lighter", price: 23.00, pid: "2611231123251611871", tag: "Plasma Lighter", img1: "https://cf.cjdropshipping.com/0fc46289-7998-4fae-9221-e7579fd94590.jpg", img2: "https://cf.cjdropshipping.com/1800cc1b-a0c6-45e5-b119-814bb23490f2.jpg", desc: "Flameless high-voltage electrical dual arc igniting candles and campfires in howling gale force winds with LED battery indicator.", mat: "Zinc Alloy PVD Coating", wt: "2.8 oz", dim: "2.9 × 1.4 × 0.5 in" },
    { name: "Portable Handheld Espresso Coffee Maker for Travel", price: 58.00, pid: "2611231123251611872", tag: "Travel Espresso", img1: "https://cf.cjdropshipping.com/quick/product/181a4a40-e2b2-4d10-85f0-61b7fcf7c7c3.jpg", img2: "https://cf.cjdropshipping.com/quick/product/0bc8a956-aa16-43bf-9f05-aa5ae9c07e0c.jpg", desc: "Manual piston pump generating 18 bars of pressure for rich crema espresso on road trips, camping, and remote flights without electricity.", mat: "BPA-Free Food Grade Polymer, Stainless Filter", wt: "12.5 oz", dim: "6.9 × 2.4 × 2.4 in" },
    { name: "100W Multi-Port USB-C Fast Car Charger Adapter", price: 26.00, pid: "2611231123251611873", tag: "Car Charger", img1: "https://cf.cjdropshipping.com/1d80f0b2-6ff5-4e79-bab6-123f02ea3d6d.jpg", img2: "https://cf.cjdropshipping.com/8de452fd-1aa3-42c4-809e-3471ba3dc81f.jpg", desc: "Dual USB-C Power Delivery 100W + USB-A QuickCharge 3.0 ports charging MacBook laptops and smartphones simultaneously from 12V socket.", mat: "Flame-Retardant PC, Anodized Alloy Rim", wt: "1.8 oz", dim: "2.9 × 1.3 in" },
    { name: "Night Driving HD Polarized Anti-Glare Glasses", price: 25.00, pid: "2611231123251611874", tag: "Night Glasses", img1: "https://oss-cf.cjdropshipping.com/product/2026/10/22/03/c5460c7c-4439-4a6f-bf96-b6df0aa58712.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/10/02/08/4a38fad5-1784-43f2-a5df-333cd7c1201a_water.jpeg", desc: "Yellow-tinted high-contrast polarized lenses softening intense oncoming high-beam glare and enhancing road edge visibility in rain.", mat: "TR90 Memory Polymer Frame, TAC Polarized Lenses", wt: "0.8 oz", dim: "56-16-140 mm" },
    { name: "Waterproof EDC Survival First-Aid Capsule", price: 21.00, pid: "2601070551041636400", tag: "Survival Capsule", img1: "https://cf.cjdropshipping.com/quick/product/cb85d47e-8c3b-4890-a292-cc7406a14732.jpg", img2: "https://cf.cjdropshipping.com/quick/product/d99f36f6-49eb-4340-9a2e-8392fb2b8745.jpg", desc: "Hermetically sealed O-ring threaded aluminum tube keeping emergency medication, matches, and currency 100% dry underwater.", mat: "6061 T6 Hard-Anodized Aluminum", wt: "1.9 oz", dim: "3.9 × 1.1 in" },
    { name: "Carbon Fiber Anti-Collision Car Door Edge Guards", price: 17.00, pid: "2611230656201607400", tag: "Door Guards", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/cf452c93-9c5c-4be6-96ec-255d648419ad.jpg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/23d778fb-cf7a-4ec6-8968-3bf2c3757fa0.jpg", desc: "Flexible 3D carbon fiber pattern protective strips shielding car doors and side mirrors from parking lot scratches and chips.", mat: "High-Flexibility Epoxy Resin, 3M VHB Adhesive", wt: "3.5 oz", dim: "4 Pieces (5.9 × 0.8 in)" },
    { name: "Ergonomic Memory Foam Car Lumbar Support Cushion", price: 42.00, pid: "2611231123251611875", tag: "Lumbar Cushion", img1: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/d2537f01-63cb-4f58-8c62-4239e64298f5_water.jpeg", img2: "https://oss-cf.cjdropshipping.com/product/2026/11/16/08/05b5153c-9f48-4802-8ba8-5f1769628511_water.jpeg", desc: "Anatomically curved high-density memory foam cushion filling lower back gap to eliminate sciatica and driving fatigue.", mat: "CertiPUR-US Memory Foam, 4D Breathable Mesh", wt: "18.0 oz", dim: "17.7 × 14.9 × 4.7 in" }
  ]
};

const fullProducts = [];
let idCounter = 1;

for (const seed of catalogSeed) {
  fullProducts.push({
    id: seed.id || `prod_trend_${idCounter}`,
    shopifyId: `gid:shopify:product:${900100 + idCounter}`,
    sku: seed.sku,
    cjPid: seed.cjPid,
    title: seed.title,
    handle: seed.handle,
    category: categories[seed.catIndex],
    price: seed.price,
    currency: "USD",
    rating: seed.rating,
    reviewsCount: seed.reviews,
    stockCount: seed.stock,
    listedNum: seed.reviews,
    availableForSale: true,
    tagline: seed.tagline,
    description: seed.desc,
    materials: seed.materials,
    weight: seed.weight,
    dimensions: seed.dim,
    origin: seed.origin,
    images: seed.images,
    variants: seed.variants.map((v, i) => ({
      id: v.id,
      cjVid: v.cjVid,
      title: v.title,
      hex: v.hex,
      price: v.price,
      inStock: true,
      imageIndex: i % 2,
      stockCount: v.stock
    })),
    tags: seed.tags
  });
  idCounter++;
}

for (let catIdx = 0; catIdx < categories.length; catIdx++) {
  const currentCount = fullProducts.filter(p => p.category === categories[catIdx]).length;
  const needed = 16 - currentCount;
  const templates = categoryTemplates[catIdx] || [];
  for (let i = 0; i < needed && i < templates.length; i++) {
    const tmpl = templates[i];
    const handle = tmpl.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    fullProducts.push({
      id: `prod_trend_${idCounter}`,
      shopifyId: `gid:shopify:product:${900100 + idCounter}`,
      sku: `NV-${catIdx+1}-${idCounter}`,
      cjPid: tmpl.pid,
      title: tmpl.name,
      handle: handle,
      category: categories[catIdx],
      price: tmpl.price,
      currency: "USD",
      rating: +(4.8 + ((idCounter * 7) % 3) * 0.1).toFixed(1),
      reviewsCount: 80 + ((idCounter * 47) % 450),
      stockCount: 5000 + ((idCounter * 911) % 20000),
      listedNum: 25 + ((idCounter * 31) % 200),
      availableForSale: true,
      tagline: tmpl.desc.slice(0, 90) + "...",
      description: tmpl.desc,
      materials: tmpl.mat,
      weight: tmpl.wt,
      dimensions: tmpl.dim,
      origin: "Direct Manufacturer Atelier",
      images: [tmpl.img1, tmpl.img2],
      variants: [
        { id: `var_${idCounter}_a`, cjVid: `${tmpl.pid}01`, title: "Standard Edition", hex: "#111111", price: tmpl.price, inStock: true, imageIndex: 0, stockCount: 4500 },
        { id: `var_${idCounter}_b`, cjVid: `${tmpl.pid}02`, title: "Collector Edition", hex: "#00e5ff", price: tmpl.price, inStock: true, imageIndex: 1, stockCount: 5500 }
      ],
      tags: [categories[catIdx], tmpl.tag, "TikTok Viral", "Trending 2026"]
    });
    idCounter++;
  }
}

const outputPath = path.join(process.cwd(), "data", "products.js");
const fileContent = `export const products = ${JSON.stringify(fullProducts, null, 2)};\n`;
fs.writeFileSync(outputPath, fileContent, "utf8");

console.log(`Generated ${fullProducts.length} products to ${outputPath}`);
categories.forEach(c => {
  const count = fullProducts.filter(p => p.category === c).length;
  console.log(`- ${c}: ${count} products`);
});
