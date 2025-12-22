
import { faker } from '@faker-js/faker';

const API_URL = "http://localhost:8000";

async function seedData() {
    console.log("🌱 Seeding Compliance Sandbox with International Users...");

    // 1. Create/Update Tenant first to avoid 403 DPO blocks (if we go over 100 later)
    try {
        await fetch(`${API_URL}/tenants/dpo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "ComplianceDesk Global",
                dpo_name: "Alex Reed",
                dpo_email: "compliance@cd.ai",
                dpo_phone: "+123456789",
                region: "asia-south1"
            })
        });
        console.log("✅ Tenant Compliance Profile Set (DPO Appointed)");
    } catch (e) {
        console.warn("⚠️ Failed to set tenant DPO, might face blocks.");
    }

    const countries = ["IN", "SG", "ZA", "KE", "NG"];

    for (let i = 0; i < 20; i++) {
        const country = countries[i % countries.length];
        const isSG = country === "SG";

        const fakeUser = {
            name: faker.person.fullName(),
            id: isSG ? `S${faker.string.numeric(7)}${faker.string.alpha(1).toUpperCase()}` : `IND-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
            image_url: faker.image.avatar(),
            country: country
        };

        try {
            const response = await fetch(`${API_URL}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fakeUser)
            });

            const data = await response.json();
            if (response.ok) {
                console.log(`[${i + 1}/20] Created ${fakeUser.name} (${country}): Task ${data.task_id}`);
                if (isSG) console.log(`   └─ 🛡️ NRIC Masking applied for SG user.`);
            } else {
                console.error(`[${i + 1}/20] Failed ${fakeUser.name}: ${data.detail}`);
            }
        } catch (e) {
            console.error(`Error connection error for user ${fakeUser.name}`);
        }
    }

    console.log("✅ Seeding Complete. Dashboard should now show masked SG IDs and DPO status.");
}

seedData();

