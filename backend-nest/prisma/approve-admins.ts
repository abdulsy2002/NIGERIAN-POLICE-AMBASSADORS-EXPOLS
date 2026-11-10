import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Approve all admin accounts so they can log in
  const result = await prisma.user.updateMany({
    where: { role: { in: ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN'] } },
    data: { isApproved: true },
  });
  console.log(`✅ Approved ${result.count} admin account(s).`);
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
