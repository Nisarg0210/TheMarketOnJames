const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
    "Bakery",
    "Beverages",
    "Chips",
    "Chocolates & Candy",
    "Cleaning GM",
    "Dairy Cooler",
    "Frozen",
    "Grocery",
    "Med",
    "Pet",
    "Snacks",
    "Prepared Foods",
    "Alcohol"
];

async function main() {
    console.log("Adding categories...");
    for (const name of categories) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        console.log(`- ${name}`);
    }
    console.log("Categories added successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
