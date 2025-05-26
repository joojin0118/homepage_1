-- Add category column to products table
ALTER TABLE products 
ADD COLUMN category VARCHAR(50) DEFAULT 'general';

-- Create index for category filtering
CREATE INDEX idx_products_category ON products(category);

-- Add some sample categories for existing products (optional)
UPDATE products SET category = 'electronics' WHERE name ILIKE '%이어폰%' OR name ILIKE '%워치%' OR name ILIKE '%스피커%' OR name ILIKE '%허브%';
UPDATE products SET category = 'fashion' WHERE name ILIKE '%백팩%';
UPDATE products SET category = 'beauty' WHERE name ILIKE '%스킨케어%';

-- Comment on the category column
COMMENT ON COLUMN products.category IS 'Product category for filtering and organization'; 