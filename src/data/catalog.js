export const categories = ['All items', 'Apparel', 'Accessories', 'Home']

export const promos = [
  {
    code: 'WELCOME10',
    type: 'percent',
    amount: 10,
    label: '10% off',
  },
  {
    code: 'SAVE15',
    type: 'fixed',
    amount: 15,
    minSubtotal: 80,
    label: '$15 off orders over $80',
  },
  {
    code: 'FREESHIP',
    type: 'shipping',
    label: 'Free standard shipping',
  },
]

export const deliveryMethods = [
  { id: 'standard', label: 'Standard', detail: '5–7 business days', price: 6 },
  { id: 'express', label: 'Express', detail: '2 business days', price: 14 },
  { id: 'pickup', label: 'Store pickup', detail: 'Ready tomorrow', price: 0 },
]

export const adminUser = {
  id: 'admin',
  name: 'Store Admin',
  email: 'admin@adedayho.shop',
  password: 'admin123',
  isAdmin: true,
  addresses: [
    {
      id: 'studio',
      fullName: 'Store Admin',
      line1: '18 Mercer Street',
      city: 'New York',
      region: 'NY',
      postal: '10013',
      country: 'United States',
      phone: '212-555-0148',
    },
  ],
}

const review = (id, author, rating, text, date) => ({ id, author, rating, text, date })

export const products = [
  {
    id: 1,
    name: 'Everyday Overshirt',
    category: 'Apparel',
    price: 68,
    salePrice: 58,
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85',
    ],
    alt: 'Neutral overshirt hanging against a light background',
    description:
      'A midweight overshirt with a clean collar and two patch pockets. It layers over a tee or works on its own through most of the year.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Sand', 'Olive', 'Navy'],
    stock: 9,
    createdAt: '2026-07-02',
    reviews: [
      review('r1', 'Mina', 5, 'The weight is right and the sand color goes with everything I already own.', '2026-08-14'),
      review('r2', 'Andre', 4, 'True to size. I sized up for a looser fit over knits.', '2026-09-03'),
    ],
  },
  {
    id: 2,
    name: 'Canvas Weekend Tote',
    category: 'Accessories',
    price: 42,
    salePrice: null,
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85',
    ],
    alt: 'Structured everyday tote bag',
    description:
      'A structured canvas tote with a flat base and a zip pocket inside. It holds a laptop, a market run, or a weekend change of clothes.',
    sizes: [],
    colors: ['Natural', 'Black'],
    stock: 4,
    createdAt: '2026-08-19',
    reviews: [
      review('r3', 'Leah', 5, 'Stands up on its own and the straps are long enough for the shoulder.', '2026-09-11'),
    ],
  },
  {
    id: 3,
    name: 'Ribbed Cotton Tee',
    category: 'Apparel',
    price: 34,
    salePrice: null,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85',
    ],
    alt: 'Folded white cotton t-shirt',
    description:
      'A ribbed cotton tee with a slightly heavy hand and a neckline that keeps its shape. It is the piece the rest of the closet leans on.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy'],
    stock: 18,
    createdAt: '2026-06-11',
    reviews: [
      review('r4', 'Chris', 5, 'Washed it twice and it still looks the same. Soft without being thin.', '2026-07-22'),
      review('r5', 'Priya', 4, 'The navy is deep and the ribbing is neat. I wish the sleeves were a touch longer.', '2026-08-01'),
    ],
  },
  {
    id: 4,
    name: 'Stoneware Pour-Over',
    category: 'Home',
    price: 52,
    salePrice: null,
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=85',
    ],
    alt: 'Ceramic coffee pour-over set on a table',
    description:
      'A stoneware dripper and server made for a slow morning. The glaze is matte, and the handle stays comfortable when the server is full.',
    sizes: [],
    colors: ['Stone', 'White'],
    stock: 6,
    createdAt: '2026-09-08',
    reviews: [
      review('r6', 'Jonah', 5, 'Brews evenly and looks good left on the counter.', '2026-09-28'),
    ],
  },
  {
    id: 5,
    name: 'Everyday Sunglasses',
    category: 'Accessories',
    price: 56,
    salePrice: null,
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=85',
    ],
    alt: 'Classic sunglasses in warm sunlight',
    description:
      'A simple acetate frame with smoke lenses. Light enough for a pocket and shaped so it sits close without pinching.',
    sizes: [],
    colors: ['Tortoise', 'Black'],
    stock: 0,
    createdAt: '2026-05-20',
    reviews: [
      review('r7', 'Elena', 4, 'The tortoise frame is lighter than it looks. Lenses are dark enough for driving.', '2026-06-18'),
    ],
  },
  {
    id: 6,
    name: 'Soft Knit Throw',
    category: 'Home',
    price: 88,
    salePrice: 74,
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85',
    ],
    alt: 'Textured throw in a calm living room',
    description:
      'A cotton-blend throw with a loose knit and a weight that stays on the couch instead of sliding off. Large enough for one person, folded at the foot of a bed.',
    sizes: [],
    colors: ['Oat', 'Sage'],
    stock: 5,
    createdAt: '2026-10-20',
    reviews: [
      review('r8', 'Sam', 5, 'Warm without being heavy. The oat color hides everyday use.', '2026-10-26'),
    ],
  },
]
