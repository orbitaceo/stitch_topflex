/**
 * Gerador de chaves RSA 2048 para JWT RS256
 * Executa uma vez para criar as chaves de desenvolvimento
 * NUNCA commitar as chaves geradas
 */
const { generateKeyPairSync } = require('crypto');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

const KEYS_DIR = join(__dirname, '..', 'keys');

if (!existsSync(KEYS_DIR)) {
  mkdirSync(KEYS_DIR, { recursive: true });
}

console.log('🔑 Gerando par de chaves RSA 2048 para JWT RS256...');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// Salvar arquivos PEM (para referência)
writeFileSync(join(KEYS_DIR, 'private.pem'), privateKey);
writeFileSync(join(KEYS_DIR, 'public.pem'), publicKey);

// Formatar para uso em .env.local (sem quebras de linha literais)
const privateEsc = privateKey.replace(/\n/g, '\\n');
const publicEsc  = publicKey.replace(/\n/g, '\\n');

console.log('\n✅ Chaves geradas em: keys/private.pem e keys/public.pem');
console.log('\n📋 Cole estas linhas no seu .env.local:\n');
console.log(`JWT_PRIVATE_KEY="${privateEsc}"`);
console.log(`\nJWT_PUBLIC_KEY="${publicEsc}"`);

// Também salvar o .env.local pronto para uso direto
const fs = require('fs');
const envLocalPath = join(__dirname, '..', '.env.local');

let envContent = '';
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  // Substituir ou adicionar as chaves JWT
  envContent = envContent
    .replace(/^JWT_PRIVATE_KEY=.*/m, `JWT_PRIVATE_KEY="${privateEsc}"`)
    .replace(/^JWT_PUBLIC_KEY=.*/m,  `JWT_PUBLIC_KEY="${publicEsc}"`);
} else {
  // Criar .env.local a partir do .env.example com chaves já incluídas
  const example = fs.readFileSync(join(__dirname, '..', '.env.example'), 'utf8');
  envContent = example
    .replace(/^JWT_PRIVATE_KEY=.*/m, `JWT_PRIVATE_KEY="${privateEsc}"`)
    .replace(/^JWT_PUBLIC_KEY=.*/m,  `JWT_PUBLIC_KEY="${publicEsc}"`);
}

fs.writeFileSync(envLocalPath, envContent, 'utf8');
console.log(`\n✅ .env.local atualizado com as chaves JWT!`);
console.log('⚠️  NUNCA commite o arquivo keys/ ou .env.local\n');
