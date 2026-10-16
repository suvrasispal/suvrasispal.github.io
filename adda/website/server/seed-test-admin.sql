-- Test organiser for trying Adda Live: User ID "addaslough", password "1441".
-- Apply after schema.sql:  npx wrangler d1 execute adda-live --remote --file=server/seed-test-admin.sql
-- A 4-digit password is weak. Before the first public stream, replace it with a long password
-- (node server/create-admin.mjs) or disable it:  UPDATE admins SET disabled = 1 WHERE username = 'addaslough';
INSERT OR IGNORE INTO admins (username, email, name, pass_hash) VALUES ('addaslough', NULL, 'Adda Slough', 'pbkdf2-sha256$100000$8a68bebcb8d4f00424036c9bca6c5456$f715b27c557a129c55c97c379a1d6164edfc9e8e1b3c7ad3b0eee932d2cf6de6');
