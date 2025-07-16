# E-commerce Database Design

## Overview
This database design focuses on the core requirements for a basic e-commerce system: customer tracking, product catalog, and shopping cart functionality.

### **Key Design Decisions**

#### **1. User Management**
- Single `users` table with `user_type` enum (`store_owner`, `customer`)
- Separate `user_addresses` table for location tracking (age, gender analysis)
- Supports both authenticated users and guest sessions
- **Customer tracking**: Age, gender, location analysis via user profiles and addresses

#### **2. Product System**
- **Products table**: Core product information with SKU, pricing, inventory
- **Product variations**: For different sizes, colors, etc.
- **Flexible attributes**: `product_attributes` table for reusable characteristics
- **Unified taxonomy system**: `taxonomies` table for categories, tags, brands, and other classifications
- **Product catalog**: SKU-based identification, multiple variations, flexible taxonomy, inventory management

#### **3. Cart System**
- **Automatic calculations**: Triggers update totals when items change
- **Session support**: Works for both logged-in and guest users
- **Real-time totals**: `total_amount`, `total_items`, `unique_items_count`
- **Shopping cart**: Add/remove items, quantity management, automatic calculations, session support

#### **4. Simplified Indexing**
- Only essential indexes for core operations
- Focus on authentication, product lookup, and cart operations

## Database Schema Diagram

```mermaid
erDiagram
    users {
        int id PK
        string email UK
        string password_hash
        enum user_type
        string first_name
        string last_name
        date date_of_birth
        string gender
        string phone
        boolean is_active
        boolean email_verified
        timestamp created_at
        timestamp updated_at
    }

    user_addresses {
        int id PK
        int user_id FK
        string address_type
        string address_line1
        string address_line2
        string city
        string state
        string postal_code
        string country
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    taxonomies {
        int id PK
        string name
        string slug UK
        text description
        enum taxonomy_type
        int parent_id FK
        int sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    products {
        int id PK
        string sku UK
        string name
        text description
        string short_description
        decimal price
        decimal compare_price
        decimal cost_price
        decimal weight
        jsonb dimensions
        int store_id
        boolean is_active
        boolean is_featured
        int stock_quantity
        int low_stock_threshold
        boolean allow_backorders
        timestamp created_at
        timestamp updated_at
    }

    product_attributes {
        int id PK
        string name
        string attribute_type
        string value
        int sort_order
        boolean is_active
        timestamp created_at
    }

    product_variations {
        int id PK
        int product_id FK
        string sku UK
        string name
        decimal price_adjustment
        int stock_quantity
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    product_images {
        int id PK
        int product_id FK
        string image_url
        string alt_text
        int sort_order
        boolean is_primary
        timestamp created_at
    }

    product_taxonomies {
        int id PK
        int product_id FK
        int taxonomy_id FK
        timestamp created_at
    }

    variation_attributes {
        int id PK
        int variation_id FK
        int attribute_id FK
        timestamp created_at
    }

    product_meta {
        int id PK
        int product_id FK
        string meta_key
        text meta_value
        timestamp created_at
    }

    carts {
        int id PK
        int user_id FK
        string session_id
        string status
        decimal total_amount
        int total_items
        int unique_items_count
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    cart_items {
        int id PK
        int cart_id FK
        int product_id FK
        int variation_id FK
        int quantity
        decimal unit_price
        decimal total_price
        timestamp created_at
        timestamp updated_at
    }

    %% Relationships
    users ||--o{ user_addresses : "has"
    users ||--o{ carts : "owns"
    taxonomies ||--o{ taxonomies : "parent_child"
    taxonomies ||--o{ product_taxonomies : "classifies"
    products ||--o{ product_taxonomies : "tagged_with"
    products ||--o{ product_variations : "has"
    products ||--o{ product_images : "has"
    products ||--o{ product_meta : "has"
    products ||--o{ cart_items : "added_to"
    product_variations ||--o{ variation_attributes : "has"
    product_attributes ||--o{ variation_attributes : "used_by"
    carts ||--o{ cart_items : "contains"
    product_variations ||--o{ cart_items : "selected_as"
```



## Technical Highlights

### **Unified Taxonomy System**
- Single table for categories, tags, brands, and other classifications
- Easy querying across different taxonomy types
- Flexible tagging system for products

### **Performance Optimized**
- Essential indexes only
- Efficient foreign key relationships
- Proper data types for each field

## Future Extensibility

The design allows for easy addition of:
- Discount/promotion systems
- Order management
- Payment processing
- Analytics and reporting
- Multi-store support
