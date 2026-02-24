import bcrypt from 'bcryptjs';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

// Generate hash untuk password: admin123
hashPassword('admin123').then(hash => {
  console.log('=== SUPERADMIN USER CREATION ===\n');
  console.log('Password hash untuk "admin123":');
  console.log(hash);
  console.log('\n=== SQL INSERT COMMAND ===');
  console.log(`INSERT INTO users (username, email, password, fullname, role) VALUES ('admin', 'admin@cortexlog.com', '${hash}', 'Super Administrator', 'superadmin');`);
  console.log('\n=== LOGIN CREDENTIALS ===');
  console.log('Username: admin');
  console.log('Email: admin@cortexlog.com');
  console.log('Password: admin123');
  console.log('Role: superadmin');
}).catch(err => console.error(err));
