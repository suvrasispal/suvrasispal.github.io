#!/usr/bin/env node
// Creates the SQL to add an Adda Live organiser (admin). The password is typed, never passed as an argument.
// Usage:
//   node server/create-admin.mjs "Display Name" userid [email] > admin.sql
//   npx wrangler d1 execute adda-live --remote --file=admin.sql && rm admin.sql
import readline from 'node:readline';

const [name, username, email] = process.argv.slice(2);
if (!name || !username || !/^[a-z0-9._-]{3,40}$/i.test(username) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
  console.error('Usage: node server/create-admin.mjs "Display Name" userid [email] > admin.sql');
  process.exit(1);
}

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr, terminal: true });
  rl._writeToOutput = (s) => { if (s.includes(q)) process.stderr.write(s); };
  return new Promise((r) => rl.question(q, (a) => { rl.close(); process.stderr.write('\n'); r(a); }));
}

const pw = await ask('Password (12+ characters): ');
if (pw.length < 12) { console.error('Password must be at least 12 characters.'); process.exit(1); }
if ((await ask('Repeat password: ')) !== pw) { console.error('Passwords do not match.'); process.exit(1); }

const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
const hash = hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256));
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
console.log(`INSERT INTO admins (username, email, name, pass_hash) VALUES (${q(username.toLowerCase())}, ${email ? q(email.toLowerCase()) : 'NULL'}, ${q(name)}, ${q(`pbkdf2-sha256$100000$${hex(salt)}$${hash}`)});`);
console.error(`SQL for ${username} written. Run it with wrangler d1 execute, then delete the file.`);
