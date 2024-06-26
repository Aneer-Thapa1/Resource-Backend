const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Attempt to fetch items (this will test the connection)
    const items = await prisma.item.findMany();
    console.log("Connection successful! Fetched items:", items);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
