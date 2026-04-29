// Usage: node src/backend/scripts/seed_groups.js <admin_email>
// Seeds one support group per category. Safe to re-run (skips existing categories).
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { query } = require('../db');

const GROUPS = [
  {
    condition_category: 'anxiety',
    name: 'Calm Together',
    description: 'A safe space for people living with anxiety to share coping strategies, experiences, and mutual support.',
  },
  {
    condition_category: 'depression',
    name: 'Rising Again',
    description: 'A compassionate community for those navigating depression — no judgement, just understanding and hope.',
  },
  {
    condition_category: 'ocd',
    name: 'Beyond the Loop',
    description: 'Support for people managing OCD — share experiences, strategies, and encouragement with others who understand.',
  },
  {
    condition_category: 'adhd',
    name: 'Focus & Flow',
    description: 'A community for people with ADHD to share tips, celebrate wins, and support each other through the challenges.',
  },
  {
    condition_category: 'grief',
    name: 'Healing Hearts',
    description: 'A gentle space to process loss and grief together — all types of loss welcome, all feelings valid.',
  },
  {
    condition_category: 'loneliness',
    name: 'Connected',
    description: 'For those feeling isolated or disconnected — build real connection with others who understand loneliness.',
  },
  {
    condition_category: 'stress',
    name: 'Steady Ground',
    description: 'Share and receive support for life stress, burnout, and overwhelm — practical tips and mutual encouragement.',
  },
  {
    condition_category: 'general_support',
    name: 'Open Circle',
    description: 'A welcoming general support group — anyone going through a difficult time is welcome here.',
  },
];

async function main() {
  const adminEmail = process.argv[2];
  if (!adminEmail) {
    console.error('Usage: node seed_groups.js <admin_email>');
    process.exit(1);
  }

  const { rows: adminRows } = await query('SELECT id FROM users WHERE email = $1 AND role = $2', [adminEmail.toLowerCase().trim(), 'admin']);
  if (!adminRows.length) {
    console.error('Admin user not found. Run seed_admin.js first.');
    process.exit(1);
  }
  const adminId = adminRows[0].id;

  let created = 0;
  let skipped = 0;

  for (const g of GROUPS) {
    const { rows: existing } = await query(
      'SELECT 1 FROM groups WHERE condition_category = $1',
      [g.condition_category]
    );
    if (existing.length) {
      console.log(`  skip — ${g.condition_category} group already exists`);
      skipped++;
      continue;
    }
    await query(
      `INSERT INTO groups (name, condition_category, description, created_by)
       VALUES ($1, $2, $3, $4)`,
      [g.name, g.condition_category, g.description, adminId]
    );
    console.log(`  created — ${g.condition_category}: "${g.name}"`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
