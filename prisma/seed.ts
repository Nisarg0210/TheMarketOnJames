import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Seed Categories
    const categories = [
        'Dairy',
        'Produce',
        'Bakery',
        'Meat',
        'Frozen',
        'Beverages',
        'Snacks',
        'Canned Goods',
        'Condiments',
        'Household',
    ];

    for (const name of categories) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    console.log('✓ Categories seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
