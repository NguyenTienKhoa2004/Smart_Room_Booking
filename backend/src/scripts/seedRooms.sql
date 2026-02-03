-- Seed Rooms Script for PostgreSQL
-- Copy and paste this into pgAdmin Query Tool

-- Insert 10 sample rooms with random capacities, floors, and equipment
INSERT INTO rooms (name, capacity, floor, equipment, status, image_url) VALUES
('Alpha Room', 15, 3, ARRAY['Projector', 'Whiteboard', 'Video Conference', 'Wifi'], 'available', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'),
('Beta Room', 8, 2, ARRAY['TV', 'Whiteboard', 'AC'], 'available', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'),
('Gamma Room', 12, 1, ARRAY['Projector', 'Sound System', 'Wifi', 'AC'], 'available', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'),
('Delta Room', 6, 4, ARRAY['Video Conference', 'Whiteboard'], 'in_use', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'),
('Sigma Room', 18, 5, ARRAY['Projector', 'TV', 'Coffee Machine', 'Wifi'], 'available', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'),
('Omega Room', 10, 2, ARRAY['Whiteboard', 'AC', 'Wifi'], 'reserved', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'),
('Zenith Room', 14, 3, ARRAY['Projector', 'Video Conference', 'Sound System'], 'available', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'),
('Horizon Room', 5, 1, ARRAY['TV', 'Wifi'], 'maintenance', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'),
('Portal Room', 20, 4, ARRAY['Projector', 'Whiteboard', 'Video Conference', 'Coffee Machine'], 'available', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'),
('Matrix Room', 9, 5, ARRAY['TV', 'AC', 'Wifi'], 'available', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000');

-- Verify the inserted data
SELECT id, name, capacity, floor, equipment, status FROM rooms ORDER BY id;
