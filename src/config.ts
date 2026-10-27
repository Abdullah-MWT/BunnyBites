import { AppConfig, MenuItem, PromoCode, CustomerReview } from './types';

export const CONFIG: AppConfig = {
  name: 'Bunny Bites',
  tagline: 'Santorini Sunset Vibes, Hand-Pinched Crown Crusts & Bunny Magic',
  city: 'Peshawar',
  area: 'Phase 1, Hayatabad',
  fullAddress: 'Bunny Bites, Pirpal Plaza, Bilal Market, Phase 1, Hayatabad, Peshawar, Pakistan',
  phone: '+92 300 1234567',
  whatsapp: '923001234567',
  whatsappOrders: '923001234567',
  openingHoursDisplay: 'Open Daily: 12:00 PM – 03:00 AM (Late Night Craving Spot!)',
  openHour: 12, // 12:00 PM
  closeHour: 3,  // 03:00 AM next day
  deliveryFeeBase: 150,
  freeDeliveryOver: 1500,
  minOrder: 249,
  smallOrderFeeThreshold: 249,
  smallOrderFee: 50,
  taxPercent: 0, // No hidden taxes
  totalTables: 14,
  totalSeats: 68,
  stayMinutes: 90,
  adminPin: '1234',
  demoMode: true,
  currency: 'Rs.',
  acceptingOrders: true,
  busyExtraMinutes: 0,
  social: {
    tiktok: 'https://tiktok.com/@bunnybitesofficial',
    facebook: 'https://facebook.com/bunnybitespeshawar',
    instagram: 'https://instagram.com/bunnybites.pk',
  },
  ownerName: 'Faisal Khan Marwat',
  ownerStory: `Founded by master food craftsman Faisal Khan Marwat in Peshawar, Bunny Bites was born from a passionate vision: pairing authentic Greek Santorini aesthetics with artisanal stone-deck baking. Faisal brought together high-hydration 24-hour fermented dough, eighteen hand-pinched mozzarella crowns, and warm Peshawari hospitality to create Hayatabad's favorite comfort dining destination, open every night until 3:00 AM.`,
};

export const INITIAL_MENU: MenuItem[] = [
  // Signature Crown Crust Pizzas
  {
    id: 'pizza-crown-signature',
    name: 'Signature Bunny Crown Crust',
    category: 'Crown Crust Pizza',
    description: 'Our showstopper! 18 hand-pinched golden crust crowns stuffed with melted mozzarella, topped with white cream dollops, tender grilled chicken, black olives, bell capsicum & herb oregano.',
    price: 1450,
    imageSvgType: 'crown-pizza',
    isBestseller: true,
    sizes: [
      { name: 'Small (8")', price: 850 },
      { name: 'Medium (11")', price: 1450 },
      { name: 'Large (14")', price: 1950 },
      { name: 'Monster Crown (16")', price: 2550 },
    ],
    addOns: [
      { name: 'Extra Cheese Bomb Crown', price: 220 },
      { name: 'Garlic Mayo Dip', price: 90 },
      { name: 'Spicy Bunny Ranch', price: 90 },
      { name: 'Extra Jalapeños & Olives', price: 120 },
    ],
  },
  {
    id: 'pizza-crown-tikka',
    name: 'Peshawari Tikka Crown Crust',
    category: 'Crown Crust Pizza',
    description: 'Traditional charcoal-spiced Peshawari chicken tikka boti, roasted onions, spiced green chilies, and creamy cheese pockets on a golden crown rim.',
    price: 1550,
    imageSvgType: 'crown-pizza',
    isSpicy: true,
    isBestseller: true,
    sizes: [
      { name: 'Small (8")', price: 920 },
      { name: 'Medium (11")', price: 1550 },
      { name: 'Large (14")', price: 2050 },
      { name: 'Monster Crown (16")', price: 2690 },
    ],
    addOns: [
      { name: 'Extra Tikka Chunks', price: 250 },
      { name: 'Spicy Bunny Ranch', price: 90 },
    ],
  },
  {
    id: 'pizza-crown-fajita',
    name: 'Smokey Fajita Crown Crust',
    category: 'Crown Crust Pizza',
    description: 'Marinated Mexican-style smoked chicken fajita with caramelised onions, crunchy trio of bell peppers, sweetcorn & double mozzarella crowns.',
    price: 1490,
    imageSvgType: 'crown-pizza',
    sizes: [
      { name: 'Small (8")', price: 890 },
      { name: 'Medium (11")', price: 1490 },
      { name: 'Large (14")', price: 1990 },
    ],
    addOns: [
      { name: 'Extra Cheese Bomb Crown', price: 220 },
      { name: 'Sweet Corn Burst', price: 90 },
    ],
  },
  {
    id: 'pizza-veggie-crown',
    name: 'Santorini Garden Crown',
    category: 'Crown Crust Pizza',
    description: 'Fresh sliced mushrooms, sweetcorn, black Kalamata olives, juicy tomatoes, capsicum, and herb feta dollops in each crown bump.',
    price: 1350,
    imageSvgType: 'crown-pizza',
    isVegetarian: true,
    sizes: [
      { name: 'Small (8")', price: 790 },
      { name: 'Medium (11")', price: 1350 },
      { name: 'Large (14")', price: 1850 },
    ],
  },

  // Crispy Fried Chicken & Glazed Wings
  {
    id: 'chicken-crispy-bucket',
    name: 'Golden Bunny Crispy Chicken (4 pcs)',
    category: 'Crispy Chicken & Wings',
    description: 'Ultra-crunchy 12-spice batter fried golden chicken, juicy on the inside. Served with freshly fried seasoned crinkle fries and signature garlic dip.',
    price: 990,
    imageSvgType: 'chicken',
    isBestseller: true,
    sizes: [
      { name: '4 Pieces + Fries', price: 990 },
      { name: '8 Pieces Feast + 2 Fries + 1L Drink', price: 1890 },
    ],
  },
  {
    id: 'wings-honey-glazed',
    name: 'Sweet Honey Garlic Glazed Wings (6 pcs)',
    category: 'Crispy Chicken & Wings',
    description: 'Crisp hand-breaded wings tossed in a sticky honey-garlic glaze, sprinkled with toasted sesame seeds and fresh scallions.',
    price: 690,
    imageSvgType: 'wings',
    isNew: true,
    sizes: [
      { name: '6 Wings', price: 690 },
      { name: '12 Wings Party Box', price: 1250 },
    ],
  },
  {
    id: 'wings-peri-peri',
    name: 'Flaming Peri-Peri Wings (6 pcs)',
    category: 'Crispy Chicken & Wings',
    description: 'Smokey, fiery African bird’s eye chili peri-peri glaze with fresh lime zest. Tender, spicy, and irresistible.',
    price: 720,
    imageSvgType: 'wings',
    isSpicy: true,
    sizes: [
      { name: '6 Wings', price: 720 },
      { name: '12 Wings Party Box', price: 1290 },
    ],
  },

  // Fast Food & Burgers
  {
    id: 'burger-bunny-crunch',
    name: 'The Big Bunny Crunch Burger',
    category: 'Fast Food & Burgers',
    description: 'Thick buttermilk fried chicken thigh fillet, molten cheddar cheese slice, tangy pickled gherkins, crisp iceberg lettuce and Bunny secret sauce in a brioche bun.',
    price: 680,
    imageSvgType: 'burger',
    isBestseller: true,
    addOns: [
      { name: 'Extra Cheddar Slice', price: 80 },
      { name: 'Beef Bacon Strip', price: 150 },
      { name: 'Crinkle Fries Upgrade', price: 160 },
    ],
  },
  {
    id: 'burger-chapli-smash',
    name: 'Peshawari Chapli Melt Burger',
    category: 'Fast Food & Burgers',
    description: 'Spiced beef chapli patty with pomegranate seeds and coriander, topped with melted mozzarella, mint yogurt sauce, and caramelized onions.',
    price: 750,
    imageSvgType: 'burger',
    isSpicy: true,
    addOns: [
      { name: 'Extra Fried Egg', price: 70 },
      { name: 'Double Patty', price: 290 },
    ],
  },

  // Noodles & Pastas
  {
    id: 'pasta-cheesy-alfredo',
    name: 'Creamy Bunny Alfredo Fettuccine',
    category: 'Noodles & Pastas',
    description: 'Ribbon pasta tossed in a velvety garlic-parmesan cream sauce with sautéed wild mushrooms and herb-grilled sliced chicken breast.',
    price: 890,
    imageSvgType: 'noodlepasta',
    addOns: [
      { name: 'Garlic Bread (2 pcs)', price: 120 },
      { name: 'Extra Parmesan Snow', price: 90 },
    ],
  },
  {
    id: 'noodles-spicy-wok',
    name: 'Dragon Fire Wok Chow Mein Noodles',
    category: 'Noodles & Pastas',
    description: 'Stir-fried egg noodles with shredded chicken, crunchy julienned cabbage, bell peppers, scallions, and a chili garlic soy reduction.',
    price: 780,
    imageSvgType: 'noodlepasta',
    isSpicy: true,
  },

  // Cheesy Baked Dishes
  {
    id: 'baked-mac-cheese',
    name: 'Triple-Baked Mac & Cheese Pot',
    category: 'Cheesy Baked Dishes',
    description: 'Elbow macaroni blanketed in cheddar, mozzarella, and smoked gouda cheese sauce, oven-baked until golden bubbly with an herbed crumb crust.',
    price: 790,
    imageSvgType: 'baked',
    isVegetarian: true,
  },
  {
    id: 'baked-chicken-lasagna',
    name: 'Rustic Baked Chicken Lasagna',
    category: 'Cheesy Baked Dishes',
    description: 'Layered pasta sheets with rich minced chicken bolognese, silky béchamel, and stringy browned mozzarella straight from the stone oven.',
    price: 950,
    imageSvgType: 'baked',
    isBestseller: true,
  },

  // Drinks & Desserts
  {
    id: 'drink-mint-margarita',
    name: 'Santorini Blue Electric Cooler',
    category: 'Drinks & Shakes',
    description: 'Signature vibrant blue curacao syrup infused with fresh mint, sparkling lime soda, and crushed ice.',
    price: 320,
    imageSvgType: 'drink',
  },
  {
    id: 'drink-pepsi-chilled',
    name: 'Chilled Pepsi (Can 250ml)',
    category: 'Drinks & Shakes',
    description: 'Ice-cold refreshing beverage.',
    price: 120,
    imageSvgType: 'drink',
  },
  {
    id: 'drink-bunny-vanilla-shake',
    name: 'Bunny Marshmallow Thickshake',
    category: 'Drinks & Shakes',
    description: 'Rich vanilla bean ice cream shake topped with whipped cream, strawberry drizzle, and mini bunny marshmallows.',
    price: 490,
    imageSvgType: 'drink',
  },
];

export const INITIAL_COMBOS: MenuItem[] = [
  {
    id: 'combo-family-feast',
    name: 'Bunny Family Royal Feast',
    category: 'Deals & Combos',
    description: '1 Large Crown Crust Pizza + 4 Pcs Crispy Chicken + 1 Crinkle Fries + 6 Honey Glazed Wings + 1.5L Pepsi. Perfect for 4–5 foodies!',
    price: 3490,
    imageSvgType: 'combo',
    isBestseller: true,
  },
  {
    id: 'combo-crown-crunch',
    name: 'Crown & Crunch Duo Box',
    category: 'Deals & Combos',
    description: '1 Medium Signature Crown Crust Pizza + 1 Big Bunny Crunch Burger + 2 Drinks + Dip.',
    price: 2190,
    imageSvgType: 'combo',
    isBestseller: true,
  },
  {
    id: 'combo-midnight-hayatabad',
    name: 'Midnight Hayatabad Craving Deal',
    category: 'Deals & Combos',
    description: '1 Small Crown Crust Pizza + 6 Peri-Peri Wings + 1 Blue Electric Cooler. Available till 3:00 AM!',
    price: 1590,
    imageSvgType: 'combo',
    isNew: true,
  },
];

export const INITIAL_PROMOS: PromoCode[] = [
  {
    code: 'BUNNY10',
    type: 'percent',
    value: 10,
    minOrder: 500,
    isActive: true,
    description: '10% OFF on all orders above Rs. 500',
  },
  {
    code: 'FIRSTBITE',
    type: 'flat',
    value: 200,
    minOrder: 1500,
    isActive: true,
    description: 'Flat Rs. 200 OFF on orders above Rs. 1,500',
  },
  {
    code: 'CROWN25',
    type: 'percent',
    value: 15,
    minOrder: 2500,
    isActive: true,
    description: '15% OFF for Party Orders above Rs. 2,500',
  },
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Hamza K. (Hayatabad Phase 3)',
    rating: 5,
    date: 'Yesterday',
    comment: 'The Crown Crust is hands down the best pizza innovation in Peshawar! Every crust bump is packed with warm melted cheese. Santorini ambiance is surreal!',
    isSample: true,
    approved: true,
  },
  {
    id: 'rev-2',
    author: 'Zainab Afridi',
    rating: 5,
    date: '3 days ago',
    comment: 'Ordered at 1:30 AM! Delivery was piping hot in 25 minutes. Crispy chicken was super juicy and the 3D bunny on the website made my kids super happy!',
    isSample: true,
    approved: true,
  },
  {
    id: 'rev-3',
    author: 'Engr. Bilal Khan',
    rating: 5,
    date: 'Last week',
    comment: 'Table reservation for our family anniversary was seamless. The blue booths, hanging flowers and gold glow make you feel like you are in Greece with great food.',
    isSample: true,
    approved: true,
  },
];
