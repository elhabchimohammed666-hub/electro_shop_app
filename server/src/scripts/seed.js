import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

await connectDatabase();

const categoryData = [
  { name: 'Smartphones', slug: 'smartphones', description: 'Téléphones mobiles et smartphones.' },
  { name: 'Ordinateurs', slug: 'ordinateurs', description: 'Laptops et ordinateurs portables.' },
  { name: 'Tablettes', slug: 'tablettes', description: 'Tablettes pour le travail et les loisirs.' },
  { name: 'Accessoires', slug: 'accessoires', description: 'Les essentiels pour vos appareils.' },
  { name: 'Composants', slug: 'composants', description: 'Pièces et composants électroniques.' }
];

for (const category of categoryData) {
  await Category.updateOne({ slug: category.slug }, { $setOnInsert: category }, { upsert: true });
}

const categories = await Category.find();
const categoryBySlug = Object.fromEntries(categories.map(category => [category.slug, category._id]));
const products = [
  { title: 'iPhone 15 Pro', description: 'Un smartphone puissant et élégant avec écran Super Retina XDR.', brand: 'Apple', category: 'smartphones', condition: 'new', priceMinor: 1199000, stock: 8, specifications: { Écran: '6,1 pouces', Stockage: '128 Go', Couleur: 'Titane naturel' } },
  { title: 'Galaxy S24', description: 'Un compagnon intelligent conçu pour capturer chaque moment.', brand: 'Samsung', category: 'smartphones', condition: 'new', priceMinor: 899000, stock: 12, specifications: { Écran: '6,2 pouces', Stockage: '256 Go', RAM: '8 Go' } },
  { title: 'MacBook Air 13"', description: 'Léger, silencieux et prêt pour vos journées les plus chargées.', brand: 'Apple', category: 'ordinateurs', condition: 'new', priceMinor: 1499000, stock: 5, specifications: { Écran: '13,6 pouces', Processeur: 'Apple M3', RAM: '16 Go', Stockage: '512 Go' } },
  { title: 'ThinkPad X1 Carbon', description: 'Un ultraportable professionnel fiable pour travailler partout.', brand: 'Lenovo', category: 'ordinateurs', condition: 'refurbished', priceMinor: 999000, stock: 4, specifications: { Écran: '14 pouces', Processeur: 'Intel Core i7', RAM: '16 Go', Stockage: '512 Go' } },
  { title: 'iPad Air', description: 'Toute la polyvalence d’un grand écran dans un format léger.', brand: 'Apple', category: 'tablettes', condition: 'new', priceMinor: 749000, stock: 7, specifications: { Écran: '11 pouces', Stockage: '128 Go', Connectivité: 'Wi-Fi' } },
  { title: 'Casque sans fil Studio', description: 'Un son immersif et confortable pour vous accompagner toute la journée.', brand: 'Sony', category: 'accessoires', condition: 'new', priceMinor: 249000, stock: 15, specifications: { Autonomie: '30 heures', Connectivité: 'Bluetooth', Réduction: 'Active' } }
];

for (const { category, ...product } of products) {
  await Product.updateOne(
    { title: product.title },
    { $setOnInsert: { ...product, category: categoryBySlug[category] } },
    { upsert: true }
  );
}

console.log(`Données de démonstration prêtes : ${categories.length} catégories.`);
await mongoose.disconnect();
