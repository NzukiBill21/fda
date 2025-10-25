import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Roles
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Full system control - Maximum 3 users' },
    { name: 'ADMIN', description: 'Bossy, Analytics, Orders, Can add people - Maximum 2 users' },
    { name: 'SUB_ADMIN', description: 'Limited admin rights - Maximum 3 users' },
    { name: 'USER', description: 'Standard customer user' },
    { name: 'DELIVERY_GUY', description: 'Handles food delivery' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles created');

  // Get roles
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
  const deliveryRole = await prisma.role.findUnique({ where: { name: 'DELIVERY_GUY' } });

  // Create Super Admin
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@monda.com' },
    update: {},
    create: {
      email: 'admin@monda.com',
      password: hashedPasswordAdmin,
      name: 'Super Admin',
      phone: '+254700000000',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdmin.id,
        roleId: superAdminRole!.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: superAdminRole!.id,
    },
  });
  console.log('✅ Super Admin created (admin@monda.com / admin123)');

  // Create Regular Admin
  const regularAdmin = await prisma.user.upsert({
    where: { email: 'manager@monda.com' },
    update: {},
    create: {
      email: 'manager@monda.com',
      password: hashedPasswordAdmin,
      name: 'Manager Admin',
      phone: '+254700000001',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: regularAdmin.id,
        roleId: adminRole!.id,
      },
    },
    update: {},
    create: {
      userId: regularAdmin.id,
      roleId: adminRole!.id,
    },
  });
  console.log('✅ Admin created (manager@monda.com / admin123)');

  // Create Customer
  const hashedPasswordCustomer = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: hashedPasswordCustomer,
      name: 'Test Customer',
      phone: '+254711111111',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: customer.id,
        roleId: userRole!.id,
      },
    },
    update: {},
    create: {
      userId: customer.id,
      roleId: userRole!.id,
    },
  });
  console.log('✅ Customer created (customer@test.com / customer123)');

  // Create Delivery Guy
  const deliveryGuy = await prisma.user.upsert({
    where: { email: 'delivery@monda.com' },
    update: {},
    create: {
      email: 'delivery@monda.com',
      password: hashedPasswordAdmin,
      name: 'Delivery Guy',
      phone: '+254722222222',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: deliveryGuy.id,
        roleId: deliveryRole!.id,
      },
    },
    update: {},
    create: {
      userId: deliveryGuy.id,
      roleId: deliveryRole!.id,
    },
  });

  await prisma.deliveryGuyProfile.upsert({
    where: { userId: deliveryGuy.id },
    update: {},
    create: {
      userId: deliveryGuy.id,
      status: 'online',
      isAvailable: true,
    },
  });
  console.log('✅ Delivery Guy created (delivery@monda.com / admin123)');

  // Create Sample Menu Items
  const menuItems = [
    {
      name: 'Chicken Biryani',
      description: 'Aromatic rice dish with tender chicken and spices',
      price: 12.99,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
      rating: 4.8,
      isPopular: true,
      isSpicy: true,
    },
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza with fresh mozzarella and basil',
      price: 9.99,
      category: 'Pizza',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
      rating: 4.6,
      isPopular: true,
      isVegetarian: true,
    },
    {
      name: 'Burger Deluxe',
      description: 'Juicy beef burger with all the toppings',
      price: 8.99,
      category: 'Burgers',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      rating: 4.5,
      isPopular: true,
    },
    {
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan and croutons',
      price: 6.99,
      category: 'Salads',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1',
      rating: 4.3,
      isVegetarian: true,
    },
    {
      name: 'Pasta Carbonara',
      description: 'Creamy pasta with bacon and parmesan',
      price: 11.99,
      category: 'Pasta',
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
      rating: 4.7,
    },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({
      where: { name: item.name },
    });
    if (!existing) {
      await prisma.menuItem.create({
        data: item as any,
      });
    }
  }
  console.log('✅ Menu items created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Accounts created:');
  console.log('   Super Admin: admin@monda.com / admin123');
  console.log('   Admin: manager@monda.com / admin123');
  console.log('   Customer: customer@test.com / customer123');
  console.log('   Delivery: delivery@monda.com / admin123');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
