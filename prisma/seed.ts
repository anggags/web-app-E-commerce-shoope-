import "dotenv/config";

import { hash } from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ProductStatus, Role, StoreStatus } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL belum diisi. Salin .env.example ke .env.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DEMO_PASSWORD = "Password123!";

type SeedVariant = {
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  options: Record<string, string>;
};

type SeedProduct = {
  name: string;
  category: string;
  description: string;
  images: string[];
  variants: SeedVariant[];
};

type SeedStore = {
  ownerName: string;
  ownerEmail: string;
  storeName: string;
  city: string;
  phone: string;
  shippingFee: number;
  freeShippingMin?: number;
  products: SeedProduct[];
};

const STORES: SeedStore[] = [
  {
    ownerName: "Budi Santoso",
    ownerEmail: "seller@demo.test",
    storeName: "Elektro Nusantara",
    city: "Bandung",
    phone: "081200000001",
    shippingFee: 18000,
    freeShippingMin: 300000,
    products: [
      {
        name: "Powerbank 20000mAh Fast Charging",
        category: "Elektronik",
        description:
          "Powerbank kapasitas 20000mAh dengan dua port USB dan fast charging 22.5W. Cocok untuk smartphone, tablet, dan laptop kecil. Dilengkapi proteksi overcharge serta indikator level baterai.",
        images: ["https://picsum.photos/seed/pb1/800/800", "https://picsum.photos/seed/pb2/800/800"],
        variants: [
          {
            sku: "PB-BLK",
            name: "Hitam",
            price: 189000,
            compareAtPrice: 249000,
            stock: 25,
            options: { Warna: "Hitam" },
          },
          {
            sku: "PB-WHT",
            name: "Putih",
            price: 189000,
            stock: 18,
            options: { Warna: "Putih" },
          },
        ],
      },
      {
        name: "Headset Bluetooth ANC 5.3",
        category: "Elektronik",
        description:
          "Headset wireless dengan active noise cancelling, driver 40mm, dan baterai tahan 30 jam. Mendukung multipoint sehingga bisa terhubung ke dua perangkat sekaligus.",
        images: ["https://picsum.photos/seed/hs1/800/800"],
        variants: [
          {
            sku: "HS-BLK",
            name: "Hitam",
            price: 349000,
            compareAtPrice: 429000,
            stock: 12,
            options: { Warna: "Hitam" },
          },
          {
            sku: "HS-BLU",
            name: "Biru",
            price: 349000,
            stock: 7,
            options: { Warna: "Biru" },
          },
        ],
      },
      {
        name: "TWS Earbuds ANC Pro",
        category: "Elektronik",
        description:
          "Earbuds TWS dengan active noise cancelling, driver 12mm, dan kasus pengisian cepat USB-C. Total pemakaian hingga 32 jam dan latensi rendah untuk gaming.",
        images: ["https://picsum.photos/seed/tws1/800/800", "https://picsum.photos/seed/tws2/800/800"],
        variants: [
          {
            sku: "TWS-BLK",
            name: "Hitam",
            price: 249000,
            compareAtPrice: 329000,
            stock: 30,
            options: { Warna: "Hitam" },
          },
          {
            sku: "TWS-WHT",
            name: "Putih",
            price: 249000,
            stock: 22,
            options: { Warna: "Putih" },
          },
        ],
      },
      {
        name: "Smartwatch Fit AMOLED 46mm",
        category: "Elektronik",
        description:
          "Jam tangan pintar layar AMOLED 1.43 inci dengan pemantau detak jantung, SpO2, 120+ mode olahraga, dan baterai hingga 14 hari. Tahan air 5 ATM.",
        images: ["https://picsum.photos/seed/sw1/800/800"],
        variants: [
          {
            sku: "SW-BLK",
            name: "Hitam",
            price: 459000,
            compareAtPrice: 599000,
            stock: 15,
            options: { Warna: "Hitam" },
          },
          {
            sku: "SW-SLV",
            name: "Silver",
            price: 479000,
            stock: 9,
            options: { Warna: "Silver" },
          },
        ],
      },
      {
        name: "Kabel USB-C 60W Braided 2m",
        category: "Elektronik",
        description:
          "Kabel charging USB-C berjalin (braided) dengan dukungan PD 60W dan transfer data cepat. Kepala konektor diperkuat, tidak mudah putus.",
        images: ["https://picsum.photos/seed/kb1/800/800"],
        variants: [
          {
            sku: "UCB-1M",
            name: "1 meter",
            price: 39000,
            compareAtPrice: 55000,
            stock: 120,
            options: { Panjang: "1 meter" },
          },
          {
            sku: "UCB-2M",
            name: "2 meter",
            price: 49000,
            compareAtPrice: 75000,
            stock: 100,
            options: { Panjang: "2 meter" },
          },
        ],
      },
      {
        name: "Charger GaN 65W Dua Port",
        category: "Elektronik",
        description:
          "Charger GaN 65W dengan dua port USB-C dan satu USB-A, bisa mengisi laptop, tablet, dan ponsel sekaligus. Ukuran ringkas dengan proteksi berlebih.",
        images: ["https://picsum.photos/seed/cg1/800/800"],
        variants: [
          {
            sku: "GAN-WHT",
            name: "Putih",
            price: 219000,
            compareAtPrice: 289000,
            stock: 40,
            options: { Warna: "Putih" },
          },
          {
            sku: "GAN-BLK",
            name: "Hitam",
            price: 219000,
            stock: 34,
            options: { Warna: "Hitam" },
          },
        ],
      },
      {
        name: "Speaker Bluetooth 15W IPX7",
        category: "Elektronik",
        description:
          "Speaker portabel 15W dengan bass bertekstur, tahan air IPX7, dan baterai 14 jam. Bisa disambung dua unit untuk stereo.",
        images: ["https://picsum.photos/seed/sp1/800/800"],
        variants: [
          {
            sku: "SP-BLK",
            name: "Hitam",
            price: 289000,
            compareAtPrice: 369000,
            stock: 20,
            options: { Warna: "Hitam" },
          },
          {
            sku: "SP-BLU",
            name: "Biru",
            price: 299000,
            stock: 12,
            options: { Warna: "Biru" },
          },
        ],
      },
      {
        name: "Mouse Wireless Silent 2.4G",
        category: "Elektronik",
        description:
          "Mouse nirkabel senyap dengan sensor presisi 1600 DPI dan hemat baterai hingga 12 bulan. Cocok untuk kerja dan sekolah, receiver USB menyatu.",
        images: ["https://picsum.photos/seed/mw1/800/800"],
        variants: [
          {
            sku: "MW-GRY",
            name: "Abu-abu",
            price: 99000,
            compareAtPrice: 139000,
            stock: 60,
            options: { Warna: "Abu-abu" },
          },
          {
            sku: "MW-BLK",
            name: "Hitam",
            price: 99000,
            stock: 55,
            options: { Warna: "Hitam" },
          },
        ],
      },
      {
        name: "Kipas Angin Portable USB",
        category: "Elektronik",
        description:
          "Kipas mini bertenaga USB dengan tiga tingkat kecepatan, dapat berdiri atau digenggam. Baterai 2600mAh, ideal untuk perjalanan.",
        images: ["https://picsum.photos/seed/kp1/800/800"],
        variants: [
          {
            sku: "KP-WHT",
            name: "Putih",
            price: 59000,
            compareAtPrice: 89000,
            stock: 45,
            options: { Warna: "Putih" },
          },
        ],
      },
      {
        name: "Power Strip 4 Stopkontak + USB-C",
        category: "Elektronik",
        description:
          "Steker listrik 4 outlet dengan 2 port USB-A dan 1 USB-C, dilengkapi proteksi lonjakan dan tombol pemutus. Kabel 2 meter.",
        images: ["https://picsum.photos/seed/ps1/800/800"],
        variants: [
          {
            sku: "PS-WHT",
            name: "Putih",
            price: 89000,
            compareAtPrice: 119000,
            stock: 55,
            options: { Warna: "Putih" },
          },
        ],
      },
    ],
  },
  {
    ownerName: "Siti Rahayu",
    ownerEmail: "seller2@demo.test",
    storeName: "Dapur Sehat",
    city: "Surabaya",
    phone: "081200000002",
    shippingFee: 12000,
    freeShippingMin: 150000,
    products: [
      {
        name: "Madu Hutan Murni 500ml",
        category: "Makanan",
        description:
          "Madu hutan liar tanpa campuran gula dan tanpa pemanis tambahan. Dipanen dari bunga hutan tropis, dikemas dalam botol kaca 500ml yang aman untuk penyimpanan.",
        images: ["https://picsum.photos/seed/md1/800/800"],
        variants: [
          {
            sku: "MD-500",
            name: "500 ml",
            price: 89000,
            stock: 40,
            options: { Ukuran: "500 ml" },
          },
          {
            sku: "MD-250",
            name: "250 ml",
            price: 52000,
            stock: 30,
            options: { Ukuran: "250 ml" },
          },
        ],
      },
      {
        name: "Sabun Herbal Sereh 250ml",
        category: "Kecantikan",
        description:
          "Sabun herbal serbaguna dengan minyak zaitun dan ekstrak sereh. Mengandung bahan alami tanpa paraben, cocok untuk kulit sensitif dan perawatan harian keluarga.",
        images: ["https://picsum.photos/seed/sb1/800/800"],
        variants: [
          {
            sku: "SB-250",
            name: "250 ml",
            price: 38000,
            stock: 60,
            options: { Ukuran: "250 ml" },
          },
        ],
      },
      {
        name: "Kopi Robusta Gayo 250g",
        category: "Makanan",
        description:
          "Biji kopi robusta Gayo sangrai medium tanpa campuran, aroma cokelat dan kacang. Digiling kasar atau biji utuh sesuai selera.",
        images: ["https://picsum.photos/seed/kp2/800/800"],
        variants: [
          {
            sku: "KO-250",
            name: "250 gram",
            price: 65000,
            compareAtPrice: 90000,
            stock: 50,
            options: { Ukuran: "250 gram" },
          },
          {
            sku: "KO-500",
            name: "500 gram",
            price: 120000,
            stock: 30,
            options: { Ukuran: "500 gram" },
          },
        ],
      },
      {
        name: "Teh Hijau Premium 60g",
        category: "Makanan",
        description:
          "Daun teh hijau pilihan dari dataran tinggi, dikeringkan halus tanpa pewarna. Kaya antioksidan dan rendah kafein.",
        images: ["https://picsum.photos/seed/tg1/800/800"],
        variants: [
          {
            sku: "TH-60",
            name: "60 gram",
            price: 48000,
            compareAtPrice: 65000,
            stock: 40,
            options: { Ukuran: "60 gram" },
          },
        ],
      },
      {
        name: "Oat Instan Premium 1kg",
        category: "Makanan",
        description:
          "Oat gulung instan 1kg tanpa tambahan gula, tinggi serat dan protein. Cukup seduh air panas 3 menit untuk sarapan praktis.",
        images: ["https://picsum.photos/seed/ot1/800/800"],
        variants: [
          {
            sku: "OT-1KG",
            name: "1 kg",
            price: 55000,
            compareAtPrice: 72000,
            stock: 65,
            options: { Ukuran: "1 kg" },
          },
        ],
      },
      {
        name: "Granola Madu Kacang 500g",
        category: "Makanan",
        description:
          "Granola panggang dengan madu asli, oat utuh, dan campuran kacang mete serta almond. Renyah tanpa minyak sawit.",
        images: ["https://picsum.photos/seed/gr1/800/800"],
        variants: [
          {
            sku: "GR-500",
            name: "500 gram",
            price: 78000,
            compareAtPrice: 99000,
            stock: 25,
            options: { Ukuran: "500 gram" },
          },
        ],
      },
      {
        name: "Sirup Gula Aren Asli 510ml",
        category: "Makanan",
        description:
          "Sirup gula aren murni dari nira aren pilihan, tanpa pengawet dan pewarna. Manis legit untuk jajanan dan minuman.",
        images: ["https://picsum.photos/seed/sga1/800/800"],
        variants: [
          {
            sku: "SGA-510",
            name: "510 ml",
            price: 47000,
            compareAtPrice: 62000,
            stock: 42,
            options: { Ukuran: "510 ml" },
          },
        ],
      },
      {
        name: "Minyak Zaitun Extra Virgin 250ml",
        category: "Makanan",
        description:
          "Minyak zaitun extra virgin cold-pressed, pH rendah dan kaya oleic acid. Cocok untuk salad, tumisan, dan perawatan.",
        images: ["https://picsum.photos/seed/ol1/800/800"],
        variants: [
          {
            sku: "OL-250",
            name: "250 ml",
            price: 115000,
            compareAtPrice: 150000,
            stock: 28,
            options: { Ukuran: "250 ml" },
          },
        ],
      },
      {
        name: "Minyak Kelapa Murni 300ml",
        category: "Kecantikan",
        description:
          "Virgin coconut oil (VCO) 100% alami untuk perawatan rambut, kulit, dan kesehatan. Dikemas gelap agar kualitas terjaga.",
        images: ["https://picsum.photos/seed/vco1/800/800"],
        variants: [
          {
            sku: "VCO-300",
            name: "300 ml",
            price: 68000,
            compareAtPrice: 89000,
            stock: 36,
            options: { Ukuran: "300 ml" },
          },
        ],
      },
      {
        name: "Masker Aloe Vera Menenangkan 50g",
        category: "Kecantikan",
        description:
          "Masker wajah gel aloe vera menenangkan kulit merah dan lembap. Tanpa paraben, cocok untuk kulit sensitif.",
        images: ["https://picsum.photos/seed/av1/800/800"],
        variants: [
          {
            sku: "AV-50",
            name: "50 gram",
            price: 32000,
            compareAtPrice: 45000,
            stock: 70,
            options: { Ukuran: "50 gram" },
          },
        ],
      },
    ],
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

async function main() {
  console.log("Membersihkan data lama...");
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  console.log("Hash password demo...");
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  await prisma.user.create({
    data: {
      name: "Admin Demo",
      email: "admin@demo.test",
      passwordHash,
      role: Role.ADMIN,
      phone: "081200000000",
    },
  });

  await prisma.user.create({
    data: {
      name: "Rina Pembeli",
      email: "buyer@demo.test",
      passwordHash,
      role: Role.BUYER,
      phone: "081200000099",
    },
  });

  let productCount = 0;
  let variantCount = 0;

  for (const entry of STORES) {
    console.log(`Membuat toko ${entry.storeName}...`);

    const owner = await prisma.user.create({
      data: {
        name: entry.ownerName,
        email: entry.ownerEmail,
        passwordHash,
        role: Role.SELLER,
      },
    });

    const store = await prisma.store.create({
      data: {
        ownerId: owner.id,
        name: entry.storeName,
        slug: slugify(entry.storeName),
        city: entry.city,
        phone: entry.phone,
        shippingFee: entry.shippingFee,
        freeShippingMin: entry.freeShippingMin ?? null,
        status: StoreStatus.ACTIVE,
      },
    });

    for (const product of entry.products) {
      productCount += 1;

      const created = await prisma.product.create({
        data: {
          storeId: store.id,
          slug: `${slugify(product.name)}-${productCount}`,
          name: product.name,
          description: product.description,
          category: product.category,
          basePrice: Math.min(...product.variants.map((variant) => variant.price)),
          status: ProductStatus.ACTIVE,
          options: Object.keys(product.variants[0].options),
          publishedAt: new Date(),
          soldCount: 10 + productCount * 7,
          viewCount: 120 + productCount * 55,
          rating: Number((3.5 + ((productCount * 13) % 14) / 10).toFixed(1)),
          ratingCount: 2 + productCount * 3,
        },
      });

      await prisma.productImage.createMany({
        data: product.images.map((url, index) => ({
          productId: created.id,
          url,
          alt: product.name,
          sortOrder: index,
          isPrimary: index === 0,
        })),
      });

      await prisma.productVariant.createMany({
        data: product.variants.map((variant) => ({
          productId: created.id,
          sku: variant.sku,
          name: variant.name,
          options: variant.options,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice ?? null,
          stock: variant.stock,
        })),
      });

      variantCount += product.variants.length;
    }
  }

  console.log(
    `\nSelesai: ${STORES.length} toko, ${productCount} produk, ${variantCount} varian.`,
  );
  console.log(`\nPassword semua akun demo: ${DEMO_PASSWORD}`);
  console.log("  admin@demo.test    -> admin");
  console.log("  buyer@demo.test    -> buyer");
  console.log("  seller@demo.test   -> seller (Elektro Nusantara)");
  console.log("  seller2@demo.test  -> seller (Dapur Sehat)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });