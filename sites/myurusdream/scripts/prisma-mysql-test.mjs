import { PrismaClient } from '@prisma/client';

const urls = [
  process.env.U1,
  process.env.U2,
  process.env.U3,
];

for (const url of urls) {
  console.log('\nTRY', url?.replace(/:[^:@]+@/, ':***@'));
  const p = new PrismaClient({ datasources: { db: { url } }, log: ['error'] });
  try {
    const r = await p.$queryRaw`SELECT 1 as ok`;
    console.log('OK', r);
  } catch (e) {
    console.log('FAIL', e.message.split('\n').slice(0, 4).join(' | '));
  } finally {
    await p.$disconnect();
  }
}
