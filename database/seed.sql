USE purple1;
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, is_staff) VALUES
('demo@purpleone.com','demo@purpleone.com','pbkdf2_sha256$600000$demo_salt$a982a37d90754ce2d08957db2bcd72213eeef710760dc8bc0c5d14a2eededcfb','Usuario','Demo','3001234567','Bogota, Colombia',0),
('admin@purpleone.com','admin@purpleone.com','pbkdf2_sha256$600000$admin_salt$30eeb89976aae901e93162f5bfe51708b4a712a3e1cd7d9b45e4c6badbac7ac2','Admin','Purple','3007654321','Oficina Purple One',1);
INSERT INTO product_types (name, uses_size, uses_color) VALUES ('Ropa',1,1),('Accesorio',0,1),('Coleccionable',0,0),('Escuderia',0,0);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (1, 'Ropa', 'ropa', NULL, 'Categoria Ropa de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (2, 'Hoodies', 'hoodies', 1, 'Categoria Hoodies de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (3, 'Camisetas', 'camisetas', 1, 'Categoria Camisetas de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (4, 'Accesorios', 'accesorios', NULL, 'Categoria Accesorios de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (5, 'Gorras', 'gorras', 4, 'Categoria Gorras de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (6, 'Mochilas', 'mochilas', 4, 'Categoria Mochilas de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (7, 'Escuderias', 'escuderias', NULL, 'Categoria Escuderias de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (8, 'Ferrari', 'ferrari', 7, 'Categoria Ferrari de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (9, 'Leclerc', 'leclerc', 8, 'Categoria Leclerc de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (10, 'Red Bull', 'red-bull', 7, 'Categoria Red Bull de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (11, 'Verstappen', 'verstappen', 10, 'Categoria Verstappen de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (12, 'Mercedes', 'mercedes', 7, 'Categoria Mercedes de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (13, 'McLaren', 'mclaren', 7, 'Categoria McLaren de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (14, 'Coleccionables', 'coleccionables', NULL, 'Categoria Coleccionables de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (15, 'Miniaturas', 'miniaturas', 14, 'Categoria Miniaturas de Purple One.', 1);
INSERT INTO categories (id, name, slug, parent_id, description, is_active) VALUES (16, 'Posters', 'posters', 14, 'Categoria Posters de Purple One.', 1);
INSERT INTO teams (id, name, slug, description, logo_path, is_active) VALUES
(1, 'Ferrari', 'ferrari', 'Escuderia Ferrari.', 'img/escudo-ferrari.jpeg', 1),
(2, 'Red Bull', 'red-bull', 'Oracle Red Bull Racing.', 'img/escudo-redbull.jpeg', 1),
(3, 'Mercedes', 'mercedes', 'Mercedes-AMG Petronas Formula One Team.', 'img/escudo-mercedes.jpeg', 1),
(4, 'McLaren', 'mclaren', 'McLaren Formula 1 Team.', 'img/escudo-mclaren.jpeg', 1),
(5, 'Alpine', 'alpine', 'BWT Alpine Formula One Team.', 'img/escudo-alpine.jpeg', 1),
(6, 'Cadillac', 'cadillac', 'Cadillac Formula 1 Team.', 'img/escudo-cadillac.jpeg', 1);
INSERT INTO sizes (name, visual_order) VALUES ('XS',1),('S',2),('M',3),('L',4),('XL',5);
INSERT INTO colors (name, hex_code) VALUES ('Negro','#000000'),('Blanco','#FFFFFF'),('Morado','#7B2CFF'),('Rojo Ferrari','#E10600'),('Azul Racing','#1E41FF');
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (1, 1, 'Hoodie Leclerc', 'hoodie-leclerc', 'Hoodie premium inspirada en Charles Leclerc con acentos Ferrari.', 89.90, 1, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (1, 'img/hoodie-leclerc.jpeg', 'Hoodie Leclerc', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (1, 2);
INSERT INTO product_categories (product_id, category_id) VALUES (1, 8);
INSERT INTO product_categories (product_id, category_id) VALUES (1, 9);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (1, 'HOODIE-LECLERC-S-1', 2, 1, NULL, 12, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (1, 'HOODIE-LECLERC-S-2', 2, 2, NULL, 13, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (1, 'HOODIE-LECLERC-S-4', 2, 4, NULL, 15, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (1, 'HOODIE-LECLERC-M-1', 3, 1, NULL, 13, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (1, 'HOODIE-LECLERC-M-2', 3, 2, NULL, 14, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (1, 'HOODIE-LECLERC-M-4', 3, 4, NULL, 16, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (1, 'HOODIE-LECLERC-L-1', 4, 1, NULL, 14, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (1, 'HOODIE-LECLERC-L-2', 4, 2, NULL, 15, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (1, 'HOODIE-LECLERC-L-4', 4, 4, NULL, 17, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (2, 1, 'Hoodie Red Bull', 'hoodie-red-bull', 'Sudadera tecnica con presencia Red Bull y detalle Verstappen.', 92.90, 1, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (2, 'img/sweater-redbull.jpeg', 'Hoodie Red Bull', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (2, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (2, 2);
INSERT INTO product_categories (product_id, category_id) VALUES (2, 10);
INSERT INTO product_categories (product_id, category_id) VALUES (2, 11);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (2, 'HOODIE-RED-BULL-S-1', 2, 1, NULL, 13, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (2, 'HOODIE-RED-BULL-S-2', 2, 2, NULL, 14, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (2, 'HOODIE-RED-BULL-S-4', 2, 4, NULL, 16, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (2, 'HOODIE-RED-BULL-M-1', 3, 1, NULL, 14, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (2, 'HOODIE-RED-BULL-M-2', 3, 2, NULL, 15, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (2, 'HOODIE-RED-BULL-M-4', 3, 4, NULL, 17, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (2, 'HOODIE-RED-BULL-L-1', 4, 1, NULL, 15, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (2, 'HOODIE-RED-BULL-L-2', 4, 2, NULL, 16, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (2, 'HOODIE-RED-BULL-L-4', 4, 4, NULL, 18, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (3, 1, 'Camiseta Ferrari Race Day', 'camiseta-ferrari-race-day', 'Camiseta ligera para dias de carrera con identidad Ferrari.', 44.90, 0, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (3, 'img/polo-ferrari.jpeg', 'Camiseta Ferrari Race Day', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (3, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (3, 3);
INSERT INTO product_categories (product_id, category_id) VALUES (3, 8);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (3, 'CAMISETA-FERRARI-R-S-1', 2, 1, NULL, 14, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (3, 'CAMISETA-FERRARI-R-S-2', 2, 2, NULL, 15, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (3, 'CAMISETA-FERRARI-R-S-4', 2, 4, NULL, 17, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (3, 'CAMISETA-FERRARI-R-M-1', 3, 1, NULL, 15, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (3, 'CAMISETA-FERRARI-R-M-2', 3, 2, NULL, 16, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (3, 'CAMISETA-FERRARI-R-M-4', 3, 4, NULL, 18, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (3, 'CAMISETA-FERRARI-R-L-1', 4, 1, NULL, 16, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (3, 'CAMISETA-FERRARI-R-L-2', 4, 2, NULL, 17, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (3, 'CAMISETA-FERRARI-R-L-4', 4, 4, NULL, 19, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (4, 1, 'Camiseta Mercedes Pitwall', 'camiseta-mercedes-pitwall', 'Camiseta limpia y tecnica con guinos al pitwall de Mercedes.', 46.90, 0, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (4, 'img/shirt-mercedes.jpeg', 'Camiseta Mercedes Pitwall', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (4, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (4, 3);
INSERT INTO product_categories (product_id, category_id) VALUES (4, 12);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (4, 'CAMISETA-MERCEDES--S-1', 2, 1, NULL, 15, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (4, 'CAMISETA-MERCEDES--S-2', 2, 2, NULL, 16, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (4, 'CAMISETA-MERCEDES--S-4', 2, 4, NULL, 18, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (4, 'CAMISETA-MERCEDES--M-1', 3, 1, NULL, 16, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (4, 'CAMISETA-MERCEDES--M-2', 3, 2, NULL, 17, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (4, 'CAMISETA-MERCEDES--M-4', 3, 4, NULL, 19, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (4, 'CAMISETA-MERCEDES--L-1', 4, 1, NULL, 17, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (4, 'CAMISETA-MERCEDES--L-2', 4, 2, NULL, 18, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (4, 'CAMISETA-MERCEDES--L-4', 4, 4, NULL, 8, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (5, 2, 'Gorra McLaren Apex', 'gorra-mclaren-apex', 'Gorra estructurada McLaren para paddock y calle.', 29.90, 1, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (5, 'img/cap-maclaren.jpeg', 'Gorra McLaren Apex', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (5, 4);
INSERT INTO product_categories (product_id, category_id) VALUES (5, 5);
INSERT INTO product_categories (product_id, category_id) VALUES (5, 13);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (5, 'GORRA-MCLAREN-APEX-C1', NULL, 1, NULL, 16, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (5, 'GORRA-MCLAREN-APEX-C3', NULL, 3, NULL, 18, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (5, 'GORRA-MCLAREN-APEX-C5', NULL, 5, NULL, 20, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (6, 2, 'Gorra Red Bull Champion', 'gorra-red-bull-champion', 'Gorra inspirada en el dominio de Red Bull en Formula 1.', 31.90, 0, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (6, 'img/cap-redbull.jpeg', 'Gorra Red Bull Champion', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (6, 4);
INSERT INTO product_categories (product_id, category_id) VALUES (6, 5);
INSERT INTO product_categories (product_id, category_id) VALUES (6, 10);
INSERT INTO product_categories (product_id, category_id) VALUES (6, 11);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (6, 'GORRA-RED-BULL-CHAMP-C1', NULL, 1, NULL, 17, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (6, 'GORRA-RED-BULL-CHAMP-C3', NULL, 3, NULL, 19, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (6, 'GORRA-RED-BULL-CHAMP-C5', NULL, 5, NULL, 21, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (7, 2, 'Mochila Racing Travel', 'mochila-racing-travel', 'Mochila amplia para viajes de carrera y uso diario.', 64.90, 1, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (7, 'img/sack-redbull.jpeg', 'Mochila Racing Travel', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (7, 4);
INSERT INTO product_categories (product_id, category_id) VALUES (7, 6);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (7, 'MOCHILA-RACING-TRAVE-C1', NULL, 1, NULL, 18, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (7, 'MOCHILA-RACING-TRAVE-C3', NULL, 3, NULL, 20, 1);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (7, 'MOCHILA-RACING-TRAVE-C5', NULL, 5, NULL, 22, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (8, 3, 'Miniatura F1 Ferrari SF-24', 'miniatura-f1-ferrari-sf-24', 'Miniatura de exhibicion para fanaticos de Ferrari.', 59.90, 1, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (8, 'img/carro-redbull.jpeg', 'Miniatura F1 Ferrari SF-24', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (8, 14);
INSERT INTO product_categories (product_id, category_id) VALUES (8, 15);
INSERT INTO product_categories (product_id, category_id) VALUES (8, 8);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (8, 'MINIATURA-F1-FERRARI-SF--STD', NULL, NULL, NULL, 14, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (9, 3, 'Poster Formula 1 Night Race', 'poster-formula-1-night-race', 'Poster decorativo con energia de gran premio nocturno.', 19.90, 0, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (9, 'img/placeholder-product.png', 'Poster Formula 1 Night Race', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (9, 14);
INSERT INTO product_categories (product_id, category_id) VALUES (9, 16);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (9, 'POSTER-FORMULA-1-NIGHT-R-STD', NULL, NULL, NULL, 15, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (10, 4, 'Pack Escuderia Mercedes', 'pack-escuderia-mercedes', 'Pack fan con piezas esenciales para seguidores de Mercedes.', 74.90, 0, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (10, 'img/polo-mercedez.jpeg', 'Pack Escuderia Mercedes', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (10, 7);
INSERT INTO product_categories (product_id, category_id) VALUES (10, 12);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (10, 'PACK-ESCUDERIA-MERCEDES-STD', NULL, NULL, NULL, 16, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (11, 4, 'Pack Escuderia McLaren', 'pack-escuderia-mclaren', 'Pack fan con visual McLaren para tribuna y coleccion.', 72.90, 0, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (11, 'img/cap-maclaren.jpeg', 'Pack Escuderia McLaren', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (11, 7);
INSERT INTO product_categories (product_id, category_id) VALUES (11, 13);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (11, 'PACK-ESCUDERIA-MCLAREN-STD', NULL, NULL, NULL, 17, 1);
INSERT INTO products (id, product_type_id, name, slug, description, base_price, is_featured, is_active) VALUES (12, 3, 'Miniatura Red Bull RB20', 'miniatura-red-bull-rb20', 'Miniatura de coleccion con silueta dominante de Red Bull.', 61.90, 1, 1);
INSERT INTO product_images (product_id, image_path, alt_text, display_order, is_main) VALUES (12, 'img/carro-redbull.jpeg', 'Miniatura Red Bull RB20', 1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (12, 14);
INSERT INTO product_categories (product_id, category_id) VALUES (12, 15);
INSERT INTO product_categories (product_id, category_id) VALUES (12, 10);
INSERT INTO product_categories (product_id, category_id) VALUES (12, 11);
INSERT INTO inventory (product_id, sku, size_id, color_id, price_override, stock, is_active) VALUES (12, 'MINIATURA-RED-BULL-RB20-STD', NULL, NULL, NULL, 6, 1);

INSERT INTO product_teams (product_id, team_id) VALUES
(1, 1),
(2, 2),
(3, 1),
(4, 3),
(5, 4),
(6, 2),
(8, 1),
(10, 3),
(11, 4),
(12, 2);
