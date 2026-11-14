/* Datos de prueba (mock) generados desde database/seed.sql y backend/avatar.py.
   No editar a mano: se regeneran con tools/generar_mock.py */
window.PURPLE1_SEED = {
 "users": [
  {
   "id": 1,
   "address": "Bogota, Colombia",
   "is_staff": 0,
   "username": "demo@purpleone.com",
   "last_name": "Demo",
   "phone": "3001234567",
   "email": "demo@purpleone.com",
   "first_name": "Usuario"
  },
  {
   "id": 2,
   "address": "Oficina Purple One",
   "is_staff": 1,
   "username": "admin@purpleone.com",
   "last_name": "Purple",
   "phone": "3007654321",
   "email": "admin@purpleone.com",
   "first_name": "Admin"
  }
 ],
 "product_types": [
  {
   "id": 1,
   "uses_color": 1,
   "name": "Ropa",
   "uses_size": 1
  },
  {
   "id": 2,
   "uses_color": 1,
   "name": "Accesorio",
   "uses_size": 0
  },
  {
   "id": 3,
   "uses_color": 0,
   "name": "Coleccionable",
   "uses_size": 0
  },
  {
   "id": 4,
   "uses_color": 0,
   "name": "Escuderia",
   "uses_size": 0
  }
 ],
 "categories": [
  {
   "id": 1,
   "parent_id": null,
   "name": "Ropa",
   "slug": "ropa",
   "is_active": 1,
   "description": "Categoria Ropa de Purple One."
  },
  {
   "id": 2,
   "parent_id": 1,
   "name": "Hoodies",
   "slug": "hoodies",
   "is_active": 1,
   "description": "Categoria Hoodies de Purple One."
  },
  {
   "id": 3,
   "parent_id": 1,
   "name": "Camisetas",
   "slug": "camisetas",
   "is_active": 1,
   "description": "Categoria Camisetas de Purple One."
  },
  {
   "id": 4,
   "parent_id": null,
   "name": "Accesorios",
   "slug": "accesorios",
   "is_active": 1,
   "description": "Categoria Accesorios de Purple One."
  },
  {
   "id": 5,
   "parent_id": 4,
   "name": "Gorras",
   "slug": "gorras",
   "is_active": 1,
   "description": "Categoria Gorras de Purple One."
  },
  {
   "id": 6,
   "parent_id": 4,
   "name": "Mochilas",
   "slug": "mochilas",
   "is_active": 1,
   "description": "Categoria Mochilas de Purple One."
  },
  {
   "id": 7,
   "parent_id": null,
   "name": "Escuderias",
   "slug": "escuderias",
   "is_active": 1,
   "description": "Categoria Escuderias de Purple One."
  },
  {
   "id": 8,
   "parent_id": 7,
   "name": "Ferrari",
   "slug": "ferrari",
   "is_active": 1,
   "description": "Categoria Ferrari de Purple One."
  },
  {
   "id": 9,
   "parent_id": 8,
   "name": "Leclerc",
   "slug": "leclerc",
   "is_active": 1,
   "description": "Categoria Leclerc de Purple One."
  },
  {
   "id": 10,
   "parent_id": 7,
   "name": "Red Bull",
   "slug": "red-bull",
   "is_active": 1,
   "description": "Categoria Red Bull de Purple One."
  },
  {
   "id": 11,
   "parent_id": 10,
   "name": "Verstappen",
   "slug": "verstappen",
   "is_active": 1,
   "description": "Categoria Verstappen de Purple One."
  },
  {
   "id": 12,
   "parent_id": 7,
   "name": "Mercedes",
   "slug": "mercedes",
   "is_active": 1,
   "description": "Categoria Mercedes de Purple One."
  },
  {
   "id": 13,
   "parent_id": 7,
   "name": "McLaren",
   "slug": "mclaren",
   "is_active": 1,
   "description": "Categoria McLaren de Purple One."
  },
  {
   "id": 14,
   "parent_id": null,
   "name": "Coleccionables",
   "slug": "coleccionables",
   "is_active": 1,
   "description": "Categoria Coleccionables de Purple One."
  },
  {
   "id": 15,
   "parent_id": 14,
   "name": "Miniaturas",
   "slug": "miniaturas",
   "is_active": 1,
   "description": "Categoria Miniaturas de Purple One."
  },
  {
   "id": 16,
   "parent_id": 14,
   "name": "Posters",
   "slug": "posters",
   "is_active": 1,
   "description": "Categoria Posters de Purple One."
  }
 ],
 "teams": [
  {
   "id": 1,
   "name": "Ferrari",
   "slug": "ferrari",
   "logo_path": "img/escudo-ferrari.jpeg",
   "is_active": 1,
   "description": "Escuderia Ferrari."
  },
  {
   "id": 2,
   "name": "Red Bull",
   "slug": "red-bull",
   "logo_path": "img/escudo-redbull.jpeg",
   "is_active": 1,
   "description": "Oracle Red Bull Racing."
  },
  {
   "id": 3,
   "name": "Mercedes",
   "slug": "mercedes",
   "logo_path": "img/escudo-mercedes.jpeg",
   "is_active": 1,
   "description": "Mercedes-AMG Petronas Formula One Team."
  },
  {
   "id": 4,
   "name": "McLaren",
   "slug": "mclaren",
   "logo_path": "img/escudo-mclaren.jpeg",
   "is_active": 1,
   "description": "McLaren Formula 1 Team."
  },
  {
   "id": 5,
   "name": "Alpine",
   "slug": "alpine",
   "logo_path": "img/escudo-alpine.jpeg",
   "is_active": 1,
   "description": "BWT Alpine Formula One Team."
  },
  {
   "id": 6,
   "name": "Cadillac",
   "slug": "cadillac",
   "logo_path": "img/escudo-cadillac.jpeg",
   "is_active": 1,
   "description": "Cadillac Formula 1 Team."
  }
 ],
 "sizes": [
  {
   "id": 1,
   "visual_order": 1,
   "name": "XS"
  },
  {
   "id": 2,
   "visual_order": 2,
   "name": "S"
  },
  {
   "id": 3,
   "visual_order": 3,
   "name": "M"
  },
  {
   "id": 4,
   "visual_order": 4,
   "name": "L"
  },
  {
   "id": 5,
   "visual_order": 5,
   "name": "XL"
  }
 ],
 "colors": [
  {
   "id": 1,
   "hex_code": "#000000",
   "name": "Negro"
  },
  {
   "id": 2,
   "hex_code": "#FFFFFF",
   "name": "Blanco"
  },
  {
   "id": 3,
   "hex_code": "#7B2CFF",
   "name": "Morado"
  },
  {
   "id": 4,
   "hex_code": "#E10600",
   "name": "Rojo Ferrari"
  },
  {
   "id": 5,
   "hex_code": "#1E41FF",
   "name": "Azul Racing"
  }
 ],
 "products": [
  {
   "id": 1,
   "name": "Hoodie Leclerc",
   "slug": "hoodie-leclerc",
   "is_featured": 1,
   "product_type_id": 1,
   "is_active": 1,
   "base_price": 89.9,
   "description": "Hoodie premium inspirada en Charles Leclerc con acentos Ferrari."
  },
  {
   "id": 2,
   "name": "Hoodie Red Bull",
   "slug": "hoodie-red-bull",
   "is_featured": 1,
   "product_type_id": 1,
   "is_active": 1,
   "base_price": 92.9,
   "description": "Sudadera tecnica con presencia Red Bull y detalle Verstappen."
  },
  {
   "id": 3,
   "name": "Camiseta Ferrari Race Day",
   "slug": "camiseta-ferrari-race-day",
   "is_featured": 0,
   "product_type_id": 1,
   "is_active": 1,
   "base_price": 44.9,
   "description": "Camiseta ligera para dias de carrera con identidad Ferrari."
  },
  {
   "id": 4,
   "name": "Camiseta Mercedes Pitwall",
   "slug": "camiseta-mercedes-pitwall",
   "is_featured": 0,
   "product_type_id": 1,
   "is_active": 1,
   "base_price": 46.9,
   "description": "Camiseta limpia y tecnica con guinos al pitwall de Mercedes."
  },
  {
   "id": 5,
   "name": "Gorra McLaren Apex",
   "slug": "gorra-mclaren-apex",
   "is_featured": 1,
   "product_type_id": 2,
   "is_active": 1,
   "base_price": 29.9,
   "description": "Gorra estructurada McLaren para paddock y calle."
  },
  {
   "id": 6,
   "name": "Gorra Red Bull Champion",
   "slug": "gorra-red-bull-champion",
   "is_featured": 0,
   "product_type_id": 2,
   "is_active": 1,
   "base_price": 31.9,
   "description": "Gorra inspirada en el dominio de Red Bull en Formula 1."
  },
  {
   "id": 7,
   "name": "Mochila Racing Travel",
   "slug": "mochila-racing-travel",
   "is_featured": 1,
   "product_type_id": 2,
   "is_active": 1,
   "base_price": 64.9,
   "description": "Mochila amplia para viajes de carrera y uso diario."
  },
  {
   "id": 8,
   "name": "Miniatura F1 Ferrari SF-24",
   "slug": "miniatura-f1-ferrari-sf-24",
   "is_featured": 1,
   "product_type_id": 3,
   "is_active": 1,
   "base_price": 59.9,
   "description": "Miniatura de exhibicion para fanaticos de Ferrari."
  },
  {
   "id": 9,
   "name": "Poster Formula 1 Night Race",
   "slug": "poster-formula-1-night-race",
   "is_featured": 0,
   "product_type_id": 3,
   "is_active": 1,
   "base_price": 19.9,
   "description": "Poster decorativo con energia de gran premio nocturno."
  },
  {
   "id": 10,
   "name": "Pack Escuderia Mercedes",
   "slug": "pack-escuderia-mercedes",
   "is_featured": 0,
   "product_type_id": 4,
   "is_active": 1,
   "base_price": 74.9,
   "description": "Pack fan con piezas esenciales para seguidores de Mercedes."
  },
  {
   "id": 11,
   "name": "Pack Escuderia McLaren",
   "slug": "pack-escuderia-mclaren",
   "is_featured": 0,
   "product_type_id": 4,
   "is_active": 1,
   "base_price": 72.9,
   "description": "Pack fan con visual McLaren para tribuna y coleccion."
  },
  {
   "id": 12,
   "name": "Miniatura Red Bull RB20",
   "slug": "miniatura-red-bull-rb20",
   "is_featured": 1,
   "product_type_id": 3,
   "is_active": 1,
   "base_price": 61.9,
   "description": "Miniatura de coleccion con silueta dominante de Red Bull."
  }
 ],
 "product_images": [
  {
   "id": 1,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/hoodie-leclerc.jpeg",
   "alt_text": "Hoodie Leclerc",
   "product_id": 1
  },
  {
   "id": 2,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/sweater-redbull.jpeg",
   "alt_text": "Hoodie Red Bull",
   "product_id": 2
  },
  {
   "id": 3,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/polo-ferrari.jpeg",
   "alt_text": "Camiseta Ferrari Race Day",
   "product_id": 3
  },
  {
   "id": 4,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/shirt-mercedes.jpeg",
   "alt_text": "Camiseta Mercedes Pitwall",
   "product_id": 4
  },
  {
   "id": 5,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/cap-maclaren.jpeg",
   "alt_text": "Gorra McLaren Apex",
   "product_id": 5
  },
  {
   "id": 6,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/cap-redbull.jpeg",
   "alt_text": "Gorra Red Bull Champion",
   "product_id": 6
  },
  {
   "id": 7,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/sack-redbull.jpeg",
   "alt_text": "Mochila Racing Travel",
   "product_id": 7
  },
  {
   "id": 8,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/carro-redbull.jpeg",
   "alt_text": "Miniatura F1 Ferrari SF-24",
   "product_id": 8
  },
  {
   "id": 9,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/placeholder-product.png",
   "alt_text": "Poster Formula 1 Night Race",
   "product_id": 9
  },
  {
   "id": 10,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/polo-mercedez.jpeg",
   "alt_text": "Pack Escuderia Mercedes",
   "product_id": 10
  },
  {
   "id": 11,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/cap-maclaren.jpeg",
   "alt_text": "Pack Escuderia McLaren",
   "product_id": 11
  },
  {
   "id": 12,
   "display_order": 1,
   "is_main": 1,
   "image_path": "img/carro-redbull.jpeg",
   "alt_text": "Miniatura Red Bull RB20",
   "product_id": 12
  }
 ],
 "product_categories": [
  {
   "category_id": 1,
   "product_id": 1
  },
  {
   "category_id": 2,
   "product_id": 1
  },
  {
   "category_id": 8,
   "product_id": 1
  },
  {
   "category_id": 9,
   "product_id": 1
  },
  {
   "category_id": 1,
   "product_id": 2
  },
  {
   "category_id": 2,
   "product_id": 2
  },
  {
   "category_id": 10,
   "product_id": 2
  },
  {
   "category_id": 11,
   "product_id": 2
  },
  {
   "category_id": 1,
   "product_id": 3
  },
  {
   "category_id": 3,
   "product_id": 3
  },
  {
   "category_id": 8,
   "product_id": 3
  },
  {
   "category_id": 1,
   "product_id": 4
  },
  {
   "category_id": 3,
   "product_id": 4
  },
  {
   "category_id": 12,
   "product_id": 4
  },
  {
   "category_id": 4,
   "product_id": 5
  },
  {
   "category_id": 5,
   "product_id": 5
  },
  {
   "category_id": 13,
   "product_id": 5
  },
  {
   "category_id": 4,
   "product_id": 6
  },
  {
   "category_id": 5,
   "product_id": 6
  },
  {
   "category_id": 10,
   "product_id": 6
  },
  {
   "category_id": 11,
   "product_id": 6
  },
  {
   "category_id": 4,
   "product_id": 7
  },
  {
   "category_id": 6,
   "product_id": 7
  },
  {
   "category_id": 14,
   "product_id": 8
  },
  {
   "category_id": 15,
   "product_id": 8
  },
  {
   "category_id": 8,
   "product_id": 8
  },
  {
   "category_id": 14,
   "product_id": 9
  },
  {
   "category_id": 16,
   "product_id": 9
  },
  {
   "category_id": 7,
   "product_id": 10
  },
  {
   "category_id": 12,
   "product_id": 10
  },
  {
   "category_id": 7,
   "product_id": 11
  },
  {
   "category_id": 13,
   "product_id": 11
  },
  {
   "category_id": 14,
   "product_id": 12
  },
  {
   "category_id": 15,
   "product_id": 12
  },
  {
   "category_id": 10,
   "product_id": 12
  },
  {
   "category_id": 11,
   "product_id": 12
  }
 ],
 "inventory": [
  {
   "id": 1,
   "color_id": 1,
   "stock": 12,
   "price_override": null,
   "size_id": 2,
   "sku": "HOODIE-LECLERC-S-1",
   "is_active": 1,
   "product_id": 1
  },
  {
   "id": 2,
   "color_id": 2,
   "stock": 13,
   "price_override": null,
   "size_id": 2,
   "sku": "HOODIE-LECLERC-S-2",
   "is_active": 1,
   "product_id": 1
  },
  {
   "id": 3,
   "color_id": 4,
   "stock": 15,
   "price_override": null,
   "size_id": 2,
   "sku": "HOODIE-LECLERC-S-4",
   "is_active": 1,
   "product_id": 1
  },
  {
   "id": 4,
   "color_id": 1,
   "stock": 13,
   "price_override": null,
   "size_id": 3,
   "sku": "HOODIE-LECLERC-M-1",
   "is_active": 1,
   "product_id": 1
  },
  {
   "id": 5,
   "color_id": 2,
   "stock": 14,
   "price_override": null,
   "size_id": 3,
   "sku": "HOODIE-LECLERC-M-2",
   "is_active": 1,
   "product_id": 1
  },
  {
   "id": 6,
   "color_id": 4,
   "stock": 16,
   "price_override": null,
   "size_id": 3,
   "sku": "HOODIE-LECLERC-M-4",
   "is_active": 1,
   "product_id": 1
  },
  {
   "id": 7,
   "color_id": 1,
   "stock": 14,
   "price_override": null,
   "size_id": 4,
   "sku": "HOODIE-LECLERC-L-1",
   "is_active": 1,
   "product_id": 1
  },
  {
   "id": 8,
   "color_id": 2,
   "stock": 15,
   "price_override": null,
   "size_id": 4,
   "sku": "HOODIE-LECLERC-L-2",
   "is_active": 1,
   "product_id": 1
  },
  {
   "id": 9,
   "color_id": 4,
   "stock": 17,
   "price_override": null,
   "size_id": 4,
   "sku": "HOODIE-LECLERC-L-4",
   "is_active": 1,
   "product_id": 1
  },
  {
   "id": 10,
   "color_id": 1,
   "stock": 13,
   "price_override": null,
   "size_id": 2,
   "sku": "HOODIE-RED-BULL-S-1",
   "is_active": 1,
   "product_id": 2
  },
  {
   "id": 11,
   "color_id": 2,
   "stock": 14,
   "price_override": null,
   "size_id": 2,
   "sku": "HOODIE-RED-BULL-S-2",
   "is_active": 1,
   "product_id": 2
  },
  {
   "id": 12,
   "color_id": 4,
   "stock": 16,
   "price_override": null,
   "size_id": 2,
   "sku": "HOODIE-RED-BULL-S-4",
   "is_active": 1,
   "product_id": 2
  },
  {
   "id": 13,
   "color_id": 1,
   "stock": 14,
   "price_override": null,
   "size_id": 3,
   "sku": "HOODIE-RED-BULL-M-1",
   "is_active": 1,
   "product_id": 2
  },
  {
   "id": 14,
   "color_id": 2,
   "stock": 15,
   "price_override": null,
   "size_id": 3,
   "sku": "HOODIE-RED-BULL-M-2",
   "is_active": 1,
   "product_id": 2
  },
  {
   "id": 15,
   "color_id": 4,
   "stock": 17,
   "price_override": null,
   "size_id": 3,
   "sku": "HOODIE-RED-BULL-M-4",
   "is_active": 1,
   "product_id": 2
  },
  {
   "id": 16,
   "color_id": 1,
   "stock": 15,
   "price_override": null,
   "size_id": 4,
   "sku": "HOODIE-RED-BULL-L-1",
   "is_active": 1,
   "product_id": 2
  },
  {
   "id": 17,
   "color_id": 2,
   "stock": 16,
   "price_override": null,
   "size_id": 4,
   "sku": "HOODIE-RED-BULL-L-2",
   "is_active": 1,
   "product_id": 2
  },
  {
   "id": 18,
   "color_id": 4,
   "stock": 18,
   "price_override": null,
   "size_id": 4,
   "sku": "HOODIE-RED-BULL-L-4",
   "is_active": 1,
   "product_id": 2
  },
  {
   "id": 19,
   "color_id": 1,
   "stock": 14,
   "price_override": null,
   "size_id": 2,
   "sku": "CAMISETA-FERRARI-R-S-1",
   "is_active": 1,
   "product_id": 3
  },
  {
   "id": 20,
   "color_id": 2,
   "stock": 15,
   "price_override": null,
   "size_id": 2,
   "sku": "CAMISETA-FERRARI-R-S-2",
   "is_active": 1,
   "product_id": 3
  },
  {
   "id": 21,
   "color_id": 4,
   "stock": 17,
   "price_override": null,
   "size_id": 2,
   "sku": "CAMISETA-FERRARI-R-S-4",
   "is_active": 1,
   "product_id": 3
  },
  {
   "id": 22,
   "color_id": 1,
   "stock": 15,
   "price_override": null,
   "size_id": 3,
   "sku": "CAMISETA-FERRARI-R-M-1",
   "is_active": 1,
   "product_id": 3
  },
  {
   "id": 23,
   "color_id": 2,
   "stock": 16,
   "price_override": null,
   "size_id": 3,
   "sku": "CAMISETA-FERRARI-R-M-2",
   "is_active": 1,
   "product_id": 3
  },
  {
   "id": 24,
   "color_id": 4,
   "stock": 18,
   "price_override": null,
   "size_id": 3,
   "sku": "CAMISETA-FERRARI-R-M-4",
   "is_active": 1,
   "product_id": 3
  },
  {
   "id": 25,
   "color_id": 1,
   "stock": 16,
   "price_override": null,
   "size_id": 4,
   "sku": "CAMISETA-FERRARI-R-L-1",
   "is_active": 1,
   "product_id": 3
  },
  {
   "id": 26,
   "color_id": 2,
   "stock": 17,
   "price_override": null,
   "size_id": 4,
   "sku": "CAMISETA-FERRARI-R-L-2",
   "is_active": 1,
   "product_id": 3
  },
  {
   "id": 27,
   "color_id": 4,
   "stock": 19,
   "price_override": null,
   "size_id": 4,
   "sku": "CAMISETA-FERRARI-R-L-4",
   "is_active": 1,
   "product_id": 3
  },
  {
   "id": 28,
   "color_id": 1,
   "stock": 15,
   "price_override": null,
   "size_id": 2,
   "sku": "CAMISETA-MERCEDES--S-1",
   "is_active": 1,
   "product_id": 4
  },
  {
   "id": 29,
   "color_id": 2,
   "stock": 16,
   "price_override": null,
   "size_id": 2,
   "sku": "CAMISETA-MERCEDES--S-2",
   "is_active": 1,
   "product_id": 4
  },
  {
   "id": 30,
   "color_id": 4,
   "stock": 18,
   "price_override": null,
   "size_id": 2,
   "sku": "CAMISETA-MERCEDES--S-4",
   "is_active": 1,
   "product_id": 4
  },
  {
   "id": 31,
   "color_id": 1,
   "stock": 16,
   "price_override": null,
   "size_id": 3,
   "sku": "CAMISETA-MERCEDES--M-1",
   "is_active": 1,
   "product_id": 4
  },
  {
   "id": 32,
   "color_id": 2,
   "stock": 17,
   "price_override": null,
   "size_id": 3,
   "sku": "CAMISETA-MERCEDES--M-2",
   "is_active": 1,
   "product_id": 4
  },
  {
   "id": 33,
   "color_id": 4,
   "stock": 19,
   "price_override": null,
   "size_id": 3,
   "sku": "CAMISETA-MERCEDES--M-4",
   "is_active": 1,
   "product_id": 4
  },
  {
   "id": 34,
   "color_id": 1,
   "stock": 17,
   "price_override": null,
   "size_id": 4,
   "sku": "CAMISETA-MERCEDES--L-1",
   "is_active": 1,
   "product_id": 4
  },
  {
   "id": 35,
   "color_id": 2,
   "stock": 18,
   "price_override": null,
   "size_id": 4,
   "sku": "CAMISETA-MERCEDES--L-2",
   "is_active": 1,
   "product_id": 4
  },
  {
   "id": 36,
   "color_id": 4,
   "stock": 8,
   "price_override": null,
   "size_id": 4,
   "sku": "CAMISETA-MERCEDES--L-4",
   "is_active": 1,
   "product_id": 4
  },
  {
   "id": 37,
   "color_id": 1,
   "stock": 16,
   "price_override": null,
   "size_id": null,
   "sku": "GORRA-MCLAREN-APEX-C1",
   "is_active": 1,
   "product_id": 5
  },
  {
   "id": 38,
   "color_id": 3,
   "stock": 18,
   "price_override": null,
   "size_id": null,
   "sku": "GORRA-MCLAREN-APEX-C3",
   "is_active": 1,
   "product_id": 5
  },
  {
   "id": 39,
   "color_id": 5,
   "stock": 20,
   "price_override": null,
   "size_id": null,
   "sku": "GORRA-MCLAREN-APEX-C5",
   "is_active": 1,
   "product_id": 5
  },
  {
   "id": 40,
   "color_id": 1,
   "stock": 17,
   "price_override": null,
   "size_id": null,
   "sku": "GORRA-RED-BULL-CHAMP-C1",
   "is_active": 1,
   "product_id": 6
  },
  {
   "id": 41,
   "color_id": 3,
   "stock": 19,
   "price_override": null,
   "size_id": null,
   "sku": "GORRA-RED-BULL-CHAMP-C3",
   "is_active": 1,
   "product_id": 6
  },
  {
   "id": 42,
   "color_id": 5,
   "stock": 21,
   "price_override": null,
   "size_id": null,
   "sku": "GORRA-RED-BULL-CHAMP-C5",
   "is_active": 1,
   "product_id": 6
  },
  {
   "id": 43,
   "color_id": 1,
   "stock": 18,
   "price_override": null,
   "size_id": null,
   "sku": "MOCHILA-RACING-TRAVE-C1",
   "is_active": 1,
   "product_id": 7
  },
  {
   "id": 44,
   "color_id": 3,
   "stock": 20,
   "price_override": null,
   "size_id": null,
   "sku": "MOCHILA-RACING-TRAVE-C3",
   "is_active": 1,
   "product_id": 7
  },
  {
   "id": 45,
   "color_id": 5,
   "stock": 22,
   "price_override": null,
   "size_id": null,
   "sku": "MOCHILA-RACING-TRAVE-C5",
   "is_active": 1,
   "product_id": 7
  },
  {
   "id": 46,
   "color_id": null,
   "stock": 14,
   "price_override": null,
   "size_id": null,
   "sku": "MINIATURA-F1-FERRARI-SF--STD",
   "is_active": 1,
   "product_id": 8
  },
  {
   "id": 47,
   "color_id": null,
   "stock": 15,
   "price_override": null,
   "size_id": null,
   "sku": "POSTER-FORMULA-1-NIGHT-R-STD",
   "is_active": 1,
   "product_id": 9
  },
  {
   "id": 48,
   "color_id": null,
   "stock": 16,
   "price_override": null,
   "size_id": null,
   "sku": "PACK-ESCUDERIA-MERCEDES-STD",
   "is_active": 1,
   "product_id": 10
  },
  {
   "id": 49,
   "color_id": null,
   "stock": 17,
   "price_override": null,
   "size_id": null,
   "sku": "PACK-ESCUDERIA-MCLAREN-STD",
   "is_active": 1,
   "product_id": 11
  },
  {
   "id": 50,
   "color_id": null,
   "stock": 6,
   "price_override": null,
   "size_id": null,
   "sku": "MINIATURA-RED-BULL-RB20-STD",
   "is_active": 1,
   "product_id": 12
  }
 ],
 "product_teams": [
  {
   "team_id": 1,
   "product_id": 1
  },
  {
   "team_id": 2,
   "product_id": 2
  },
  {
   "team_id": 1,
   "product_id": 3
  },
  {
   "team_id": 3,
   "product_id": 4
  },
  {
   "team_id": 4,
   "product_id": 5
  },
  {
   "team_id": 2,
   "product_id": 6
  },
  {
   "team_id": 1,
   "product_id": 8
  },
  {
   "team_id": 3,
   "product_id": 10
  },
  {
   "team_id": 4,
   "product_id": 11
  },
  {
   "team_id": 2,
   "product_id": 12
  }
 ],
 "races": [
  {
   "id": 1,
   "name": "Gran Premio de Monza",
   "circuit": "Autodromo Nazionale Monza",
   "country": "Italia",
   "race_date": "2026-09-06T14:00:00",
   "drivers": [
    [
     "Charles Leclerc",
     "ferrari"
    ],
    [
     "Max Verstappen",
     "red-bull"
    ],
    [
     "Lando Norris",
     "mclaren"
    ],
    [
     "George Russell",
     "mercedes"
    ]
   ]
  },
  {
   "id": 2,
   "name": "Gran Premio de Singapur",
   "circuit": "Marina Bay Street Circuit",
   "country": "Singapur",
   "race_date": "2026-09-20T13:00:00",
   "drivers": [
    [
     "Oscar Piastri",
     "mclaren"
    ],
    [
     "Max Verstappen",
     "red-bull"
    ],
    [
     "Charles Leclerc",
     "ferrari"
    ],
    [
     "Lewis Hamilton",
     "ferrari"
    ]
   ]
  },
  {
   "id": 3,
   "name": "Gran Premio de Las Vegas",
   "circuit": "Las Vegas Strip Circuit",
   "country": "Estados Unidos",
   "race_date": "2026-11-21T06:00:00",
   "drivers": [
    [
     "Max Verstappen",
     "red-bull"
    ],
    [
     "Lando Norris",
     "mclaren"
    ],
    [
     "George Russell",
     "mercedes"
    ],
    [
     "Carlos Sainz",
     "cadillac"
    ]
   ]
  }
 ],
 "avatar": {
  "slots": [
   {
    "id": "skin",
    "label": "Piel"
   },
   {
    "id": "head",
    "label": "Cabeza"
   },
   {
    "id": "face",
    "label": "Cara"
   },
   {
    "id": "torso",
    "label": "Torso"
   },
   {
    "id": "legs",
    "label": "Piernas"
   },
   {
    "id": "extra",
    "label": "Accesorio"
   },
   {
    "id": "bg",
    "label": "Fondo"
   }
  ],
  "catalog": [
   {
    "id": "skin-1",
    "slot": "skin",
    "name": "Tono 1",
    "style": {
     "color": "#f6d2b5"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "skin-2",
    "slot": "skin",
    "name": "Tono 2",
    "style": {
     "color": "#e8b48c"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "skin-3",
    "slot": "skin",
    "name": "Tono 3",
    "style": {
     "color": "#c98d62"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "skin-4",
    "slot": "skin",
    "name": "Tono 4",
    "style": {
     "color": "#99613f"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "skin-5",
    "slot": "skin",
    "name": "Tono 5",
    "style": {
     "color": "#6a4027"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "head-none",
    "slot": "head",
    "name": "Sin gorra",
    "style": {
     "kind": "none"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "head-cap-purple",
    "slot": "head",
    "name": "Gorra morada",
    "style": {
     "kind": "cap",
     "color": "#7b2cff",
     "accent": "#ffffff"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "head-cap-red",
    "slot": "head",
    "name": "Gorra roja",
    "style": {
     "kind": "cap",
     "color": "#e02440",
     "accent": "#ffd166"
    },
    "wins": 0,
    "price": 150
   },
   {
    "id": "head-cap-papaya",
    "slot": "head",
    "name": "Gorra papaya",
    "style": {
     "kind": "cap",
     "color": "#ff8a1f",
     "accent": "#1b1733"
    },
    "wins": 0,
    "price": 150
   },
   {
    "id": "head-headset",
    "slot": "head",
    "name": "Audifonos de pit wall",
    "style": {
     "kind": "headset",
     "color": "#1b1733",
     "accent": "#7b2cff"
    },
    "wins": 0,
    "price": 300
   },
   {
    "id": "head-helmet",
    "slot": "head",
    "name": "Casco de piloto",
    "style": {
     "kind": "helmet",
     "color": "#7b2cff",
     "accent": "#ffffff"
    },
    "wins": 1,
    "price": 0
   },
   {
    "id": "head-helmet-chrome",
    "slot": "head",
    "name": "Casco cromado",
    "style": {
     "kind": "helmet",
     "color": "#c9cfdb",
     "accent": "#7b2cff"
    },
    "wins": 3,
    "price": 0
   },
   {
    "id": "head-helmet-gold",
    "slot": "head",
    "name": "Casco de campeon",
    "style": {
     "kind": "helmet",
     "color": "#f5b942",
     "accent": "#1b1733"
    },
    "wins": 5,
    "price": 0
   },
   {
    "id": "face-none",
    "slot": "face",
    "name": "Sin accesorio",
    "style": {
     "kind": "none"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "face-sunglasses",
    "slot": "face",
    "name": "Gafas de sol",
    "style": {
     "kind": "sunglasses",
     "color": "#1b1733"
    },
    "wins": 0,
    "price": 120
   },
   {
    "id": "face-visor",
    "slot": "face",
    "name": "Visor morado",
    "style": {
     "kind": "visor",
     "color": "#7b2cff",
     "accent": "#ff5fd2"
    },
    "wins": 2,
    "price": 0
   },
   {
    "id": "torso-tee-purple",
    "slot": "torso",
    "name": "Camiseta Purple1",
    "style": {
     "kind": "tee",
     "color": "#7b2cff",
     "accent": "#ffffff",
     "print": "P1"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "torso-tee-white",
    "slot": "torso",
    "name": "Camiseta blanca",
    "style": {
     "kind": "tee",
     "color": "#f4f1fa",
     "accent": "#7b2cff",
     "print": "P1"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "torso-polo-red",
    "slot": "torso",
    "name": "Polo de escuderia",
    "style": {
     "kind": "polo",
     "color": "#e02440",
     "accent": "#ffffff"
    },
    "wins": 0,
    "price": 200
   },
   {
    "id": "torso-hoodie-black",
    "slot": "torso",
    "name": "Hoodie negro",
    "style": {
     "kind": "hoodie",
     "color": "#221c33",
     "accent": "#b48cff"
    },
    "wins": 0,
    "price": 250
   },
   {
    "id": "torso-suit-purple",
    "slot": "torso",
    "name": "Traje de piloto",
    "style": {
     "kind": "suit",
     "color": "#7b2cff",
     "accent": "#ffffff"
    },
    "wins": 1,
    "price": 0
   },
   {
    "id": "torso-suit-gold",
    "slot": "torso",
    "name": "Traje de campeon",
    "style": {
     "kind": "suit",
     "color": "#1b1733",
     "accent": "#f5b942"
    },
    "wins": 4,
    "price": 0
   },
   {
    "id": "legs-jeans",
    "slot": "legs",
    "name": "Jeans",
    "style": {
     "kind": "pants",
     "color": "#3c4f8c"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "legs-black",
    "slot": "legs",
    "name": "Pantalon negro",
    "style": {
     "kind": "pants",
     "color": "#221c33"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "legs-shorts",
    "slot": "legs",
    "name": "Shorts",
    "style": {
     "kind": "shorts",
     "color": "#4a4560"
    },
    "wins": 0,
    "price": 100
   },
   {
    "id": "legs-suit-purple",
    "slot": "legs",
    "name": "Pantalon de piloto",
    "style": {
     "kind": "suit",
     "color": "#7b2cff",
     "accent": "#ffffff"
    },
    "wins": 2,
    "price": 0
   },
   {
    "id": "legs-suit-gold",
    "slot": "legs",
    "name": "Pantalon de campeon",
    "style": {
     "kind": "suit",
     "color": "#1b1733",
     "accent": "#f5b942"
    },
    "wins": 4,
    "price": 0
   },
   {
    "id": "extra-none",
    "slot": "extra",
    "name": "Sin accesorio",
    "style": {
     "kind": "none"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "extra-flag",
    "slot": "extra",
    "name": "Bandera a cuadros",
    "style": {
     "kind": "flag"
    },
    "wins": 0,
    "price": 200
   },
   {
    "id": "extra-medal",
    "slot": "extra",
    "name": "Medalla",
    "style": {
     "kind": "medal",
     "color": "#f5b942"
    },
    "wins": 1,
    "price": 0
   },
   {
    "id": "extra-trophy",
    "slot": "extra",
    "name": "Trofeo",
    "style": {
     "kind": "trophy",
     "color": "#f5b942"
    },
    "wins": 3,
    "price": 0
   },
   {
    "id": "bg-lilac",
    "slot": "bg",
    "name": "Lila",
    "style": {
     "kind": "plain",
     "color": "#e9dcff"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "bg-white",
    "slot": "bg",
    "name": "Blanco",
    "style": {
     "kind": "plain",
     "color": "#f6f3fb"
    },
    "wins": 0,
    "price": 0
   },
   {
    "id": "bg-grid",
    "slot": "bg",
    "name": "Parrilla de salida",
    "style": {
     "kind": "grid",
     "color": "#2b2740"
    },
    "wins": 0,
    "price": 150
   },
   {
    "id": "bg-night",
    "slot": "bg",
    "name": "Carrera nocturna",
    "style": {
     "kind": "night",
     "color": "#140b2e"
    },
    "wins": 0,
    "price": 180
   },
   {
    "id": "bg-podium",
    "slot": "bg",
    "name": "Podio",
    "style": {
     "kind": "podium",
     "color": "#f5b942"
    },
    "wins": 2,
    "price": 0
   }
  ],
  "defaults": {
   "skin": "skin-1",
   "head": "head-none",
   "face": "face-none",
   "torso": "torso-tee-purple",
   "legs": "legs-jeans",
   "extra": "extra-none",
   "bg": "bg-lilac"
  }
 }
};
