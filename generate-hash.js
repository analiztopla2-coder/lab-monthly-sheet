const bcrypt = require('bcryptjs');

const users = [
  { username: 'admin', password: 'admin123' },
  { username: 'emine', password: 'eminelab' },
  { username: 'emre', password: 'ema2014', role: 'admin' }
];

console.log('=== Kullanıcı Hash\'leri ===\n');

users.forEach(user => {
  const hash = bcrypt.hashSync(user.password, 10);
  const userRole = user.role || 'user';
  console.log(`Kullanıcı: ${user.username}`);
  console.log(`Şifre: ${user.password}`);
  console.log(`Rol: ${userRole}`);
  console.log(`Hash: ${hash}`);
  console.log('\nSupabase SQL:');
  console.log(`INSERT INTO app_users (username, pass_hash, role)`);
  console.log(`VALUES ('${user.username}', '${hash}', '${userRole}')`);
  console.log(`ON CONFLICT (username) DO NOTHING;\n`);
  console.log('---\n');
});

