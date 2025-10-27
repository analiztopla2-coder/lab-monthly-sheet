const bcrypt = require('bcryptjs');

const user = { username: 'emre', password: 'ema2014', role: 'admin' };

const hash = bcrypt.hashSync(user.password, 10);

console.log('=== EMRE Kullanıcısı (ADMIN) ===\n');
console.log(`Kullanıcı: ${user.username}`);
console.log(`Şifre: ${user.password}`);
console.log(`Rol: ${user.role}`);
console.log(`Hash: ${hash}`);
console.log('\n=== Supabase SQL Komutu ===\n');
console.log(`INSERT INTO app_users (username, pass_hash, role)`);
console.log(`VALUES ('${user.username}', '${hash}', '${user.role}')`);
console.log(`ON CONFLICT (username) DO NOTHING;`);
console.log('\n=== Kopyala-Yapıştır İçin ===\n');
console.log(`INSERT INTO app_users (username, pass_hash, role) VALUES ('${user.username}', '${hash}', '${user.role}') ON CONFLICT (username) DO NOTHING;`);
