// script.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Insert sample data into `department`
  for (let i = 1; i <= 4; i++) {
    await prisma.department.create({
      data: {
        department_name: `Department ${i}`,
      },
    });
  }

  // Insert sample data into `users`
  for (let i = 1; i <= 4; i++) {
    await prisma.users.create({
      data: {
        user_name: `User ${i}`,
        user_email: `user${i}@example.com`,
        password: `password${i}`,
        role: i % 2 === 0 ? 'admin' : 'user',
        department_id: i, // Assuming department IDs start from 1
      },
    });
  }

  // Insert sample data into `category`
  for (let i = 1; i <= 4; i++) {
    await prisma.category.create({
      data: {
        category_name: `Category ${i}`,
      },
    });
  }

  // Insert sample data into `itemCategory`
  for (let i = 1; i <= 4; i++) {
    await prisma.itemCategory.create({
      data: {
        item_category_name: `Item Category ${i}`,
      },
    });
  }

  // Insert sample data into `items`
  for (let i = 1; i <= 4; i++) {
    await prisma.items.create({
      data: {
        item_name: `Item ${i}`,
        measuring_unit: 'Piece',
        quantity: 10 * i,
        remaining_quantity: 10 * i,
        low_limit: 2,
        unit_price: 100 * i,
        total_Amount: 1000 * i,
        category_id: i, // Assuming category IDs start from 1
        item_category_id: i, // Assuming item category IDs start from 1
      },
    });
  }

  // Insert sample data into `vendors`
  for (let i = 1; i <= 4; i++) {
    await prisma.vendors.create({
      data: {
        vendor_name: `Vendor ${i}`,
        vat_number: `VAT${i}`,
        vendor_contact: `123-456-78${i}`,
        vendor_profile: `Profile ${i}`,
        last_purchase_date: new Date(),
        last_paid: new Date(),
        payment_duration: 30,
        next_payment_date: new Date(),
        black_list: i % 2 === 0,
      },
    });
  }

  // Insert sample data into `bills`
  for (let i = 1; i <= 4; i++) {
    await prisma.bills.create({
      data: {
        bill_no: `BILL${i}`,
        bill_date: new Date(),
        invoice_no: `INV${i}`,
        paid_amount: 1000 * i,
        left_amount: 500 * i,
        actual_Amount: 1500 * i,
        vendor_ID: i, // Assuming vendor IDs start from 1
        bill_type: i % 2 === 0 ? 'VAT' : 'PAN',
      },
    });
  }

  // Insert sample data into `BillItems`
  for (let i = 1; i <= 4; i++) {
    await prisma.BillItems.create({
      data: {
        bill_id: i, // Assuming bill IDs start from 1
        item_id: i, // Assuming item IDs start from 1
        quantity: 5 * i,
        unit_price: 100 * i,
        withVATAmount: 1000 * i,
        TDS_deduct_amount: 50 * i,
        total_Amount: 1050 * i,
        TDS: 50 * i,
      },
    });
  }

  // Insert sample data into `request`
  for (let i = 1; i <= 4; i++) {
    await prisma.request.create({
      data: {
        purpose: `Request Purpose ${i}`,
        user_id: i, // Assuming user IDs start from 1
        requested_for: i,
        approved_by: i,
        remarks: `Remarks ${i}`,
        status: i % 2 === 0 ? 'Approved' : 'Pending',
        isReturned: i % 2 === 0,
      },
    });
  }

  // Insert sample data into `requestItems`
  for (let i = 1; i <= 4; i++) {
    await prisma.requestItems.create({
      data: {
        request_id: i, // Assuming request IDs start from 1
        item_id: i, // Assuming item IDs start from 1
        quantity: 3 * i,
      },
    });
  }

  // Insert sample data into `issue`
  for (let i = 1; i <= 4; i++) {
    await prisma.issue.create({
      data: {
        issue_item: `Issue Item ${i}`,
        Quantity: 2 * i,
        request_Id: i, // Assuming request IDs start from 1
      },
    });
  }

  // Insert sample data into `notification`
  for (let i = 1; i <= 4; i++) {
    await prisma.notification.create({
      data: {
        message: `Notification Message ${i}`,
        state: i % 2 === 0,
        user_id: i, // Assuming user IDs start from 1
      },
    });
  }

  console.log('Sample data inserted successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
