import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de desenvolvimento...');

  // ── Admin ───────────────────────────────────────────────────────
  const adminEmail = 'admin@lavaja.com.br';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash('Admin@123456!', 12),
        role: 'ADMIN',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'LavaJá',
            phone: '+5511999999999',
          },
        },
      },
    });
    console.log('✅ Admin criado:', admin.email);
  } else {
    console.log('⏭️  Admin já existe:', adminEmail);
  }

  // ── Categorias ──────────────────────────────────────────────────
  const categories = [
    { name: 'Brastemp', slug: 'brastemp' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'LG', slug: 'lg' },
    { name: 'Electrolux', slug: 'electrolux' },
    { name: 'Consul', slug: 'consul' },
    { name: 'Midea', slug: 'midea' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categorias criadas:', categories.map((c) => c.name).join(', '));

  // ── Produtos de exemplo ──────────────────────────────────────────
  const products = [
    {
      sku: 'LVJ-BRA-BWH12AB',
      name: 'Brastemp Clean 12kg',
      slug: 'brastemp-clean-12kg-inox',
      description:
        'Lavadora Brastemp Clean 12kg com ciclo rápido de 30 minutos, turbilhão e função Steam para higienização profunda das roupas. Motor com tecnologia Direct Drive garantindo performance e silêncio.',
      condition: 'EXCELLENT' as const,
      conditionNote: 'Componentes elétricos revisados. Borrachas e vedações novas. Tina interna higienizada com produto industrial.',
      originalPrice: 1899,
      salePrice: 649,
      stock: 2,
      brand: 'Brastemp',
      model: 'BWH12AB',
      capacity: '12kg',
      voltage: 'V220' as const,
      warrantyMonths: 3,
      isFeatured: true,
    },
    {
      sku: 'LVJ-SAM-WW11BB',
      name: 'Samsung EcoBubble 11kg',
      slug: 'samsung-ecobubble-11kg',
      description:
        'Lavadora Samsung EcoBubble com tecnologia Digital Inverter, conectividade Wi-Fi e capacidade de 11kg. Consome até 46% menos energia que modelos convencionais.',
      condition: 'EXCELLENT' as const,
      conditionNote: 'Revisão completa realizada. Bomba d\'água substituída preventivamente. Painel eletrônico testado.',
      originalPrice: 3200,
      salePrice: 1299,
      stock: 1,
      brand: 'Samsung',
      model: 'WW11BB6534AW',
      capacity: '11kg',
      voltage: 'V220' as const,
      warrantyMonths: 6,
      isFeatured: true,
    },
    {
      sku: 'LVJ-LGE-F4WV',
      name: 'LG Direct Drive 8.5kg',
      slug: 'lg-direct-drive-8-5kg',
      description:
        'Lavadora LG com motor Direct Drive de 9 movimentos, sem correias ou engrenagens que possam desgastar. Design compacto ideal para apartamentos.',
      condition: 'GOOD' as const,
      conditionNote: 'Pequenas marcas externas. Funcionamento 100%. Rolamentos e vedações em perfeito estado.',
      originalPrice: 2450,
      salePrice: 899,
      stock: 3,
      brand: 'LG',
      model: 'F4WV3008S3W',
      capacity: '8.5kg',
      voltage: 'BIVOLT' as const,
      warrantyMonths: 3,
      isFeatured: true,
    },
    {
      sku: 'LVJ-ELEC-LPE16',
      name: 'Electrolux Premium 16kg',
      slug: 'electrolux-premium-16kg',
      description: 'Lavadora Electrolux de alta capacidade com dispenser autolimpante. Lava edredom King Size.',
      condition: 'EXCELLENT' as const,
      conditionNote: 'Equipamento semi-novo com apenas 10 meses de uso e revisão premium da LavaJá.',
      originalPrice: 2899,
      salePrice: 1199,
      stock: 2,
      brand: 'Electrolux',
      model: 'LPE16',
      capacity: '16kg',
      voltage: 'V110' as const,
      warrantyMonths: 6,
      isFeatured: false,
    },
    {
      sku: 'LVJ-CON-CWH12',
      name: 'Consul Facilite 12kg',
      slug: 'consul-facilite-12kg',
      description: 'Lavadora Consul Facilite com copo dosador e sistema de reuso de água. Super econômica.',
      condition: 'GOOD' as const,
      conditionNote: 'Revisão hidráulica feita. Testada e higienizada.',
      originalPrice: 1699,
      salePrice: 599,
      stock: 5,
      brand: 'Consul',
      model: 'CWH12AB',
      capacity: '12kg',
      voltage: 'V220' as const,
      warrantyMonths: 3,
      isFeatured: false,
    },
    {
      sku: 'LVJ-MID-MF200',
      name: 'Lava e Seca Midea HealthGuard 11kg',
      slug: 'midea-healthguard-11kg',
      description: 'Lava e Seca inteligente com motor Inverter Quattro e conexão Wi-Fi. Esteriliza 99.9% das bactérias.',
      condition: 'EXCELLENT' as const,
      conditionNote: 'Placa e duto de secagem novos originais.',
      originalPrice: 3899,
      salePrice: 1599,
      stock: 1,
      brand: 'Midea',
      model: 'MF200',
      capacity: '11kg',
      voltage: 'V220' as const,
      warrantyMonths: 6,
      isFeatured: true,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }
  console.log('✅ Produtos criados:', products.map((p) => p.name).join(', '));

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   E-mail: admin@lavaja.com.br');
  console.log('   Senha:  Admin@123456!');
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
