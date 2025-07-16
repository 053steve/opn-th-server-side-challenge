-- E-commerce Database Schema
-- This schema supports the basic requirements for store owners and customers
-- Focused on: customer tracking, product catalog, and shopping cart functionality

-- =====================================================
-- USER MANAGEMENT
-- =====================================================

-- User types enum
CREATE TYPE user_type AS ENUM ('store_owner', 'customer');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type user_type NOT NULL DEFAULT 'customer',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User addresses
CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(50) DEFAULT 'shipping', -- shipping, billing
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Thailand',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =====================================================
-- TAXONOMY SYSTEM (Categories, Tags, etc.)
-- =====================================================

-- Taxonomy types enum
CREATE TYPE taxonomy_type AS ENUM ('category', 'tag', 'brand', 'material', 'style');

-- Main taxonomy table for categories, tags, and other classifications
CREATE TABLE taxonomies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    taxonomy_type taxonomy_type NOT NULL,
    parent_id INTEGER REFERENCES taxonomies(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT ATTRIBUTES (Size, Color, etc.)
-- =====================================================

-- Product attributes for variations
CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    attribute_type VARCHAR(50) NOT NULL, -- size, color, brand, material, etc.
    value VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT SYSTEM
-- =====================================================

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2), -- Original price for discount display
    cost_price DECIMAL(10,2), -- Cost for profit calculation
    weight DECIMAL(8,3), -- in kg
    dimensions JSONB, -- {length, width, height}
    store_id INTEGER, -- Reference to store (can be null for now)
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    allow_backorders BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product images
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product taxonomy relationships
CREATE TABLE product_taxonomies (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    taxonomy_id INTEGER REFERENCES taxonomies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, taxonomy_id)
);

-- Product variations (for different sizes, colors, etc.)
CREATE TABLE product_variations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0, -- Additional cost for this variation
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Variation attributes (size, color, etc.)
CREATE TABLE variation_attributes (
    id SERIAL PRIMARY KEY,
    variation_id INTEGER REFERENCES product_variations(id) ON DELETE CASCADE,
    attribute_id INTEGER REFERENCES product_attributes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(variation_id, attribute_id)
);

-- Product metadata
CREATE TABLE product_meta (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    meta_key VARCHAR(255) NOT NULL,
    meta_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CART SYSTEM
-- =====================================================

-- Shopping carts
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest users
    status VARCHAR(50) DEFAULT 'active', -- active, abandoned, converted
    total_amount DECIMAL(10,2) DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    unique_items_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variation_id INTEGER REFERENCES product_variations(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





-- =====================================================
-- ESSENTIAL INDEXES FOR PERFORMANCE
-- =====================================================

-- User authentication and lookup
CREATE INDEX idx_users_email ON users(email);

-- Product catalog queries
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Cart operations
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- Taxonomy navigation
CREATE INDEX idx_taxonomies_type ON taxonomies(taxonomy_type);
CREATE INDEX idx_taxonomies_slug ON taxonomies(slug);
CREATE INDEX idx_product_taxonomies_product_id ON product_taxonomies(product_id);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample users
INSERT INTO users (email, password_hash, user_type, first_name, last_name, date_of_birth, gender) VALUES
('store.owner@example.com', '$2b$10$hashedpassword', 'store_owner', 'John', 'StoreOwner', '1985-03-15', 'male'),
('customer1@example.com', '$2b$10$hashedpassword', 'customer', 'Jane', 'Customer', '1990-07-22', 'female'),
('customer2@example.com', '$2b$10$hashedpassword', 'customer', 'Bob', 'Smith', '1988-11-08', 'male');



-- Insert sample taxonomies
INSERT INTO taxonomies (name, slug, description, taxonomy_type) VALUES
-- Categories
('Clothing', 'clothing', 'All clothing items', 'category'),
('T-Shirts', 't-shirts', 'T-shirt category', 'category'),
('Jeans', 'jeans', 'Jeans category', 'category'),
('Shoes', 'shoes', 'Shoes category', 'category'),

-- Tags
('Premium', 'premium', 'Premium quality items', 'tag'),
('New Arrival', 'new-arrival', 'New arrival items', 'tag'),
('Sale', 'sale', 'Sale items', 'tag'),
('Eco-Friendly', 'eco-friendly', 'Environmentally friendly products', 'tag'),

-- Brands
('Nike', 'nike', 'Nike brand', 'brand'),
('Adidas', 'adidas', 'Adidas brand', 'brand'),
('Puma', 'puma', 'Puma brand', 'brand');

-- Insert sample product attributes
INSERT INTO product_attributes (name, attribute_type, value) VALUES
-- Sizes
('Small', 'size', 'S'),
('Medium', 'size', 'M'),
('Large', 'size', 'L'),
('XL', 'size', 'XL'),

-- Colors
('Red', 'color', '#FF0000'),
('Blue', 'color', '#0000FF'),
('Black', 'color', '#000000'),
('White', 'color', '#FFFFFF');

-- Insert sample products
INSERT INTO products (sku, name, description, price, compare_price, stock_quantity) VALUES
('TSH-001', 'Premium Cotton T-Shirt', 'High quality cotton t-shirt with comfortable fit', 1000.00, 1200.00, 50),
('JEA-001', 'Classic Blue Jeans', 'Classic blue jeans with perfect fit', 1500.00, 1800.00, 30),
('SNE-001', 'Comfortable Sneakers', 'Comfortable sneakers for daily wear', 2000.00, 2500.00, 25),
('HOO-001', 'Warm Hoodie', 'Warm and cozy hoodie for cold weather', 1200.00, 1500.00, 40);

-- Link products to taxonomies
INSERT INTO product_taxonomies (product_id, taxonomy_id) VALUES
-- T-shirt: categories + tags
(1, 1), (1, 2), -- Clothing and T-Shirts categories
(1, 5), (1, 6), -- Premium and New Arrival tags

-- Jeans: categories + tags
(2, 1), (2, 3), -- Clothing and Jeans categories
(2, 5), (2, 8), -- Premium and Nike brand

-- Sneakers: categories + tags
(3, 1), (3, 4), -- Clothing and Shoes categories
(3, 6), (3, 9), -- New Arrival and Adidas brand

-- Hoodie: categories + tags
(4, 1), (4, 2), -- Clothing and T-Shirts categories
(4, 7), (4, 10); -- Sale and Puma brand

-- Insert sample product variations
INSERT INTO product_variations (product_id, sku, name, price_adjustment) VALUES
(1, 'TSH-001-S', 'Small', 0),
(1, 'TSH-001-M', 'Medium', 0),
(1, 'TSH-001-L', 'Large', 50),
(1, 'TSH-001-XL', 'XL', 100);

-- Link variations to size attributes
INSERT INTO variation_attributes (variation_id, attribute_id) VALUES
(1, 1), -- Small size
(2, 2), -- Medium size
(3, 3), -- Large size
(4, 4); -- XL size
