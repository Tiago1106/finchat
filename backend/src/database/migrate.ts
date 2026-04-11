import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não configurada');
  }

  console.log('Rodando migrations...');
  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  await migrate(db, {
    migrationsFolder: './src/database/migrations',
  });

  console.log('Migrations aplicadas com sucesso!');
  await client.end();
}

runMigrations().catch((err) => {
  console.error('Erro ao rodar migrations:', err);
  process.exit(1);
});
