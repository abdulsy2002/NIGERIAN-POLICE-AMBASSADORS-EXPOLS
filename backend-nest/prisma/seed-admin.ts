import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = 'abdulsy2002@gmail.com';
  const password = '@Asgusau';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists. Updating role to SUPER_ADMIN...`);
    await prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN' },
    });
    console.log('Done. Role updated to SUPER_ADMIN.');
    return;
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`✅ Super admin created successfully!`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role:  ${user.role}`);
  console.log(`   ID:    ${user.id}`);
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
