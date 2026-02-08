#!/usr/bin/env node
// ============================================
// QUEST MESSENGER - Database Initialization Script
// ============================================

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'game.db');
const INIT_SQL_PATH = path.join(__dirname, 'init-db.sql');
const SEED_SQL_PATH = path.join(__dirname, 'seed-data.sql');

console.log('🗄️  Инициализация базы данных...\n');

try {
  // Удаляем старую БД если есть
  if (fs.existsSync(DB_PATH)) {
    console.log('⚠️  Удаляю существующую БД...');
    fs.unlinkSync(DB_PATH);
  }

  // Создаём новое подключение
  console.log('📁 Создаю новую БД: game.db');
  const db = new Database(DB_PATH);

  // Читаем и выполняем init-db.sql
  console.log('📝 Создаю таблицы...');
  const initSql = fs.readFileSync(INIT_SQL_PATH, 'utf8');
  db.exec(initSql);
  console.log('✅ Таблицы созданы');

  // Читаем и выполняем seed-data.sql
  console.log('🌱 Добавляю тестовые данные...');
  const seedSql = fs.readFileSync(SEED_SQL_PATH, 'utf8');
  db.exec(seedSql);
  console.log('✅ Тестовые данные добавлены');

  // Проверяем результат
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\n📊 Созданные таблицы:');
  tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`   - ${table.name} (строк: ${count.count})`);
  });

  db.close();
  console.log('\n✅ База данных успешно инициализирована!\n');

} catch (error) {
  console.error('❌ Ошибка при инициализации БД:', error.message);
  process.exit(1);
}
