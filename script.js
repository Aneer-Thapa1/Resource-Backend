const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { department_name: 'Engineering' } }),
    prisma.department.create({ data: { department_name: 'Sales' } }),
    prisma.department.create({ data: { department_name: 'Human Resources' } }),
    prisma.department.create({ data: { department_name: 'Finance' } }),
    prisma.department.create({ data: { department_name: 'Marketing' } }),
  ]);

  // Users
  const users = await Promise.all([
    prisma.users.create({
      data: {
        user_name: 'John Doe',
        user_email: 'john.doe@example.com',
        contact: '1234567890',
        password: 'securepassword',
        role: 'admin',
        department_id: departments[0].department_id,
      },
    }),
    prisma.users.create({
      data: {
        user_name: 'Jane Smith',
        user_email: 'jane.smith@example.com',
        contact: '2345678901',
        password: 'securepassword',
        role: 'user',
        department_id: departments[1].department_id,
      },
    }),
    prisma.users.create({
      data: {
        user_name: 'Michael Johnson',
        user_email: 'michael.johnson@example.com',
        contact: '3456789012',
        password: 'securepassword',
        role: 'user',
        department_id: departments[2].department_id,
      },
    }),
    prisma.users.create({
      data: {
        user_name: 'Emily Davis',
        user_email: 'emily.davis@example.com',
        contact: '4567890123',
        password: 'securepassword',
        role: 'user',
        department_id: departments[3].department_id,
      },
    }),
    prisma.users.create({
      data: {
        user_name: 'David Wilson',
        user_email: 'david.wilson@example.com',
        contact: '5678901234',
        password: 'securepassword',
        role: 'user',
        department_id: departments[4].department_id,
      },
    }),
  ]);

  // Vendors
  const vendors = await Promise.all([
    prisma.vendors.create({
      data: {
        vendor_name: 'Tech Supplies Inc.',
        vat_number: 'TS123456',
        vendor_contact: '6789012345',
        vendor_profile: 'Technology and Office Supplies',
        last_purchase_date: new Date(),
        last_paid: new Date(),
        payment_duration: 30,
        next_payment_date: new Date(),
        black_list: false,
      },
    }),
    prisma.vendors.create({
      data: {
        vendor_name: 'Office Essentials LLC',
        vat_number: 'OE123456',
        vendor_contact: '7890123456',
        vendor_profile: 'Office Equipment and Furniture',
        last_purchase_date: new Date(),
        last_paid: new Date(),
        payment_duration: 45,
        next_payment_date: new Date(),
        black_list: false,
      },
    }),
    prisma.vendors.create({
      data: {
        vendor_name: 'Stationery World',
        vat_number: 'SW123456',
        vendor_contact: '8901234567',
        vendor_profile: 'Stationery and Paper Products',
        last_purchase_date: new Date(),
        last_paid: new Date(),
        payment_duration: 30,
        next_payment_date: new Date(),
        black_list: false,
      },
    }),
    prisma.vendors.create({
      data: {
        vendor_name: 'Office Solutions',
        vat_number: 'OS123456',
        vendor_contact: '9012345678',
        vendor_profile: 'Office Supplies and Accessories',
        last_purchase_date: new Date(),
        last_paid: new Date(),
        payment_duration: 60,
        next_payment_date: new Date(),
        black_list: false,
      },
    }),
    prisma.vendors.create({
      data: {
        vendor_name: 'Tech Gear Co.',
        vat_number: 'TG123456',
        vendor_contact: '0123456789',
        vendor_profile: 'Technology and Gadgets',
        last_purchase_date: new Date(),
        last_paid: new Date(),
        payment_duration: 30,
        next_payment_date: new Date(),
        black_list: false,
      },
    }),
  ]);

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { category_name: 'Electronics' } }),
    prisma.category.create({ data: { category_name: 'Furniture' } }),
    prisma.category.create({ data: { category_name: 'Stationery' } }),
    prisma.category.create({ data: { category_name: 'Office Supplies' } }),
    prisma.category.create({ data: { category_name: 'Gadgets' } }),
  ]);

  // Item Categories
  const itemCategories = await Promise.all([
    prisma.itemCategory.create({ data: { item_category_name: 'Office Equipment' } }),
    prisma.itemCategory.create({ data: { item_category_name: 'Electronics' } }),
    prisma.itemCategory.create({ data: { item_category_name: 'Furniture' } }),
    prisma.itemCategory.create({ data: { item_category_name: 'Stationery' } }),
    prisma.itemCategory.create({ data: { item_category_name: 'Gadgets' } }),
  ]);

  // Items
  const items = await Promise.all([
    prisma.items.create({
      data: {
        item_name: 'Laptop',
        measuring_unit: 'piece',
        quantity: 10,
        remaining_quantity: 10,
        low_limit: 5,
        unit_price: 1000,
        total_Amount: 10000,
        Status: true,
        category_id: categories[0].category_id,
        item_category_id: itemCategories[1].item_category_id,
      },
    }),
    prisma.items.create({
      data: {
        item_name: 'Office Chair',
        measuring_unit: 'piece',
        quantity: 20,
        remaining_quantity: 20,
        low_limit: 10,
        unit_price: 150,
        total_Amount: 3000,
        Status: true,
        category_id: categories[1].category_id,
        item_category_id: itemCategories[2].item_category_id,
      },
    }),
    prisma.items.create({
      data: {
        item_name: 'Notebook',
        measuring_unit: 'piece',
        quantity: 50,
        remaining_quantity: 50,
        low_limit: 20,
        unit_price: 5,
        total_Amount: 250,
        Status: true,
        category_id: categories[2].category_id,
        item_category_id: itemCategories[3].item_category_id,
      },
    }),
    prisma.items.create({
      data: {
        item_name: 'Printer',
        measuring_unit: 'piece',
        quantity: 5,
        remaining_quantity: 5,
        low_limit: 2,
        unit_price: 200,
        total_Amount: 1000,
        Status: true,
        category_id: categories[0].category_id,
        item_category_id: itemCategories[1].item_category_id,
      },
    }),
    prisma.items.create({
      data: {
        item_name: 'Desk Lamp',
        measuring_unit: 'piece',
        quantity: 15,
        remaining_quantity: 15,
        low_limit: 5,
        unit_price: 30,
        total_Amount: 450,
        Status: true,
        category_id: categories[1].category_id,
        item_category_id: itemCategories[2].item_category_id,
      },
    }),
  ]);

  console.log('Dummy data created successfully!');
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
