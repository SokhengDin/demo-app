export type Product = {
  id: string;
  name: string;
  price: number; // in cents
  stock: number;
};

export type CartItem = { productId: string; quantity: number };

export type Cart = {
  items: CartItem[];
  discountPercent?: number;
};

export const products: Map<string, Product> = new Map([
  ["p1", { id: "p1", name: "Ceramic Mug", price: 1400, stock: 12 }],
  ["p2", { id: "p2", name: "Canvas Tote Bag", price: 2200, stock: 8 }],
  ["p3", { id: "p3", name: "Wool Beanie", price: 1800, stock: 5 }],
  ["p4", { id: "p4", name: "Leather Notebook", price: 3200, stock: 3 }],
  ["p5", { id: "p5", name: "Enamel Pin Set", price: 900, stock: 20 }],
  ["p6", { id: "p6", name: "Steel Water Bottle", price: 2600, stock: 0 }],
]);

export const carts: Map<string, Cart> = new Map();
