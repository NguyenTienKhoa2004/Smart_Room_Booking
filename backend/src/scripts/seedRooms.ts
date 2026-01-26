import db from '../config/database';

async function seedRooms() {
    const roomNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Sigma', 'Omega', 'Zenith', 'Horizon', 'Portal', 'Matrix'];
    const equipments = ['Projector', 'Whiteboard', 'Video Conference', 'TV', 'Coffee Machine', 'Sound System', 'AC', 'Wifi'];
    const statuses = ['available', 'in_use', 'reserved', 'maintenance'];

    try {
        console.log('🌱 Starting to seed rooms...');

        // Clear existing rooms (optional, but good for idempotent seeding)
        // await db.query('DELETE FROM rooms');

        for (let i = 0; i < 10; i++) {
            const name = `${roomNames[i]} Room`;
            const capacity = Math.floor(Math.random() * (20 - 2 + 1)) + 2;
            const floor = Math.floor(Math.random() * 5) + 1;

            // Random equipment count 1-4
            const roomEquipCount = Math.floor(Math.random() * 4) + 1;
            const roomEquip = [...equipments]
                .sort(() => 0.5 - Math.random())
                .slice(0, roomEquipCount);

            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const imageUrl = `https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000`;

            await db.query(
                `INSERT INTO rooms (name, capacity, floor, equipment, status, image_url) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [name, capacity, floor, roomEquip, status, imageUrl]
            );

            console.log(`✅ Inserted: ${name}`);
        }

        console.log('✨ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding rooms:', error);
        process.exit(1);
    }
}

seedRooms();
