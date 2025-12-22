
const { faker } = require('@faker-js/faker');
const fs = require('fs');

// Note: This script mocks the Admin SDK writes to a local JSON file 
// to avoid messing with your real Firestore during this demo.
// In a real staging environment, you would use admin.firestore().

const generateSyntheticData = async () => {
    console.log('[SYNTHETIC] Generating 10,000 Zero-PII identities...');
    const users = [];

    for (let i = 0; i < 10000; i++) {
        const fakeName = faker.person.fullName();
        const fakeAadhaar = faker.string.numeric(12);

        // TOKENIZE (Simulating the Vault)
        const token = `tok_syn_${faker.string.uuid().slice(0, 8)}`;

        users.push({
            uid: `user_${i}`,
            role: 'citizen',
            // NO REAL PII here, only tokens!
            aadhaar_token: token,
            status: faker.helpers.arrayElement(['VERIFIED', 'PENDING', 'REJECTED']),
            created_at: faker.date.recent().toISOString()
        });
    }

    // Save to a mock DB file
    fs.writeFileSync('synthetic_db.json', JSON.stringify(users, null, 2));
    console.log('[SYNTHETIC] Done. Saved to synthetic_db.json');
    console.log('[SAFETY] Real Protean API was NOT called.');
};

generateSyntheticData();
