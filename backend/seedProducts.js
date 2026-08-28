require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    name: "Apple iPhone 15",
    slug: "apple-iphone-15",
    description:
      "Apple iPhone 15 with advanced camera system and powerful performance.",
    brand: "Apple",
    category: "Electronics",
    price: 69999,
    discount: 8,
    images: [
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 25,
    rating: 4.8,
    reviewCount: 1245,
    specifications: {
      Display: "6.1 inch",
      Storage: "128GB",
      Camera: "48MP",
    },
    isActive: true,
  },

  {
    name: "Samsung Galaxy S24",
    slug: "samsung-galaxy-s24",
    description:
      "Samsung Galaxy S24 with premium display and powerful performance.",
    brand: "Samsung",
    category: "Electronics",
    price: 74999,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 30,
    rating: 4.7,
    reviewCount: 892,
    specifications: {
      Display: "6.2 inch AMOLED",
      Storage: "256GB",
      Camera: "50MP",
    },
    isActive: true,
  },

  {
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description:
      "Premium wireless headphones with advanced noise cancellation.",
    brand: "Sony",
    category: "Audio",
    price: 29999,
    discount: 12,
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 18,
    rating: 4.8,
    reviewCount: 763,
    specifications: {
      Type: "Wireless",
      Battery: "30 hours",
      Connectivity: "Bluetooth",
    },
    isActive: true,
  },

  {
    name: "Apple MacBook Air M3",
    slug: "apple-macbook-air-m3",
    description:
      "Powerful and lightweight MacBook Air powered by Apple M3 chip.",
    brand: "Apple",
    category: "Laptops",
    price: 99999,
    discount: 7,
    images: [
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 12,
    rating: 4.9,
    reviewCount: 532,
    specifications: {
      Processor: "Apple M3",
      RAM: "8GB",
      Storage: "256GB SSD",
    },
    isActive: true,
  },

  {
    name: "Nike Air Max",
    slug: "nike-air-max",
    description:
      "Comfortable everyday sneakers with responsive cushioning.",
    brand: "Nike",
    category: "Fashion",
    price: 8999,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 40,
    rating: 4.6,
    reviewCount: 421,
    specifications: {
      Material: "Mesh",
      Type: "Running Shoes",
    },
    isActive: true,
  },

  {
    name: "Apple Watch Series 9",
    slug: "apple-watch-series-9",
    description:
      "Smartwatch with fitness tracking and health features.",
    brand: "Apple",
    category: "Wearables",
    price: 41999,
    discount: 9,
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 20,
    rating: 4.7,
    reviewCount: 615,
    specifications: {
      Display: "45mm",
      Connectivity: "GPS",
      Battery: "18 hours",
    },
    isActive: true,
  },

  {
    name: "Canon EOS Camera",
    slug: "canon-eos-camera",
    description:
      "High-quality digital camera for photography enthusiasts.",
    brand: "Canon",
    category: "Cameras",
    price: 58999,
    discount: 11,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 10,
    rating: 4.6,
    reviewCount: 318,
    specifications: {
      Resolution: "24MP",
      Lens: "18-55mm",
      Video: "4K",
    },
    isActive: true,
  },

  {
    name: "JBL Portable Speaker",
    slug: "jbl-portable-speaker",
    description:
      "Portable Bluetooth speaker with powerful audio.",
    brand: "JBL",
    category: "Audio",
    price: 6999,
    discount: 14,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 35,
    rating: 4.5,
    reviewCount: 287,
    specifications: {
      Connectivity: "Bluetooth",
      Battery: "20 hours",
      Waterproof: "Yes",
    },
    isActive: true,
  },

  {
    name: "Adidas Running Shoes",
    slug: "adidas-running-shoes",
    description:
      "Lightweight running shoes designed for everyday comfort.",
    brand: "Adidas",
    category: "Fashion",
    price: 6499,
    discount: 18,
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 45,
    rating: 4.4,
    reviewCount: 356,
    specifications: {
      Material: "Synthetic",
      Type: "Running",
    },
    isActive: true,
  },

  {
    name: "Samsung 55 Inch Smart TV",
    slug: "samsung-55-inch-smart-tv",
    description:
      "4K smart television with vibrant colors and smart features.",
    brand: "Samsung",
    category: "Electronics",
    price: 52999,
    discount: 13,
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 15,
    rating: 4.6,
    reviewCount: 245,
    specifications: {
      Display: "55 inch",
      Resolution: "4K UHD",
      Type: "Smart TV",
    },
    isActive: true,
  },

  {
    name: "Dyson Hair Dryer",
    slug: "dyson-hair-dryer",
    description:
      "Premium hair dryer with intelligent heat control.",
    brand: "Dyson",
    category: "Beauty",
    price: 34999,
    discount: 6,
    images: [
      "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 14,
    rating: 4.8,
    reviewCount: 189,
    specifications: {
      Power: "1600W",
      Settings: "3",
    },
    isActive: true,
  },

  {
    name: "Nike Backpack",
    slug: "nike-backpack",
    description:
      "Spacious everyday backpack suitable for college, travel and work.",
    brand: "Nike",
    category: "Accessories",
    price: 3499,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 50,
    rating: 4.5,
    reviewCount: 412,
    specifications: {
      Material: "Polyester",
      Capacity: "25L",
    },
    isActive: true,
  },

  {
    name: "Philips Air Fryer",
    slug: "philips-air-fryer",
    description:
      "Air fryer designed for healthier cooking with less oil.",
    brand: "Philips",
    category: "Home & Living",
    price: 8999,
    discount: 16,
    images: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 22,
    rating: 4.5,
    reviewCount: 278,
    specifications: {
      Capacity: "4.1L",
      Power: "1400W",
    },
    isActive: true,
  },

  {
    name: "OnePlus Nord CE",
    slug: "oneplus-nord-ce",
    description:
      "Affordable smartphone with smooth performance and fast charging.",
    brand: "OnePlus",
    category: "Electronics",
    price: 24999,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 28,
    rating: 4.4,
    reviewCount: 521,
    specifications: {
      Display: "6.7 inch",
      RAM: "8GB",
      Storage: "128GB",
    },
    isActive: true,
  },

  {
    name: "Ray-Ban Sunglasses",
    slug: "ray-ban-sunglasses",
    description:
      "Classic premium sunglasses with UV protection.",
    brand: "Ray-Ban",
    category: "Accessories",
    price: 12999,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
    ],
    stock: 32,
    rating: 4.7,
    reviewCount: 198,
    specifications: {
      Frame: "Classic",
      Lens: "UV Protected",
    },
    isActive: true,
  },
];

async function seedProducts() {
  try {
    const mongoUri =
      process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI not found in .env"
      );
    }

    await mongoose.connect(mongoUri);

    console.log(
      "MongoDB connected successfully ✅"
    );

    for (const product of products) {
      await Product.findOneAndUpdate(
        {
          slug: product.slug,
        },
        product,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log(
      `✅ ${products.length} products added/updated successfully`
    );

    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Product seeding failed:"
    );

    console.error(
      error.message
    );

    await mongoose.connection.close();

    process.exit(1);
  }
}

seedProducts();