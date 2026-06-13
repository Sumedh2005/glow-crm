/**
 * Seed script — refreshes last_purchase_date for all customers.
 *
 * Spreads purchases across the last 5–75 days so the live
 * replenishment computation produces a natural mix of:
 *   on_track, due_soon, overdue, at_risk, churn_risk
 *
 * Run with: node scripts/seed.js
 */
const supabase = require('../lib/supabase')
const { computeReplenishment } = require('../lib/replenishment')

// Offsets in days from today — intentionally varied so every
// category ends up with different computed statuses
const OFFSETS = [
  // Very recent — on_track for all categories
  3, 5, 7, 8, 10,
  // ~2 weeks — on_track for Cleansers/Moisturiser/Anti-Ageing; due_soon for Serums/SPF
  14, 16, 18, 20, 22,
  // ~3.5–4 weeks — due_soon for Serums/SPF; on_track approaching for others
  25, 27, 28, 30, 32,
  // ~5–6 weeks — overdue for Serums/SPF; due_soon/overdue for Moisturiser/Anti-Ageing
  35, 38, 40, 42, 44,
  // ~7–8 weeks — overdue + at_risk territory for most categories
  48, 50, 52, 55, 58,
  // ~10–12 weeks — churn_risk for Serums/SPF (30-day cycle × 1.2 = 36 days)
  62, 65, 68, 72, 75,
]

async function seed() {
  console.log('📅 Fetching all customers...')
  const { data: customers, error } = await supabase.from('customers').select('id, name, preferred_category')
  if (error) {
    console.error('Error fetching customers:', error)
    process.exit(1)
  }

  console.log(`Found ${customers.length} customers. Refreshing last_purchase_date...\n`)

  const today = new Date()
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i]
    const offset = OFFSETS[i % OFFSETS.length]

    const purchaseDate = new Date(today)
    purchaseDate.setDate(today.getDate() - offset)
    const formattedDate = purchaseDate.toISOString().split('T')[0]

    const { error: updateErr } = await supabase
      .from('customers')
      .update({
        last_purchase_date: formattedDate,
        // Explicitly null these out — they are now computed, never stored
        replenishment_status: null,
        replenishment_days_left: null,
      })
      .eq('id', customer.id)

    if (updateErr) {
      console.error(`  ✗ ${customer.name}: ${updateErr.message}`)
      errorCount++
    } else {
      // Preview what the computed status will be
      const preview = computeReplenishment({
        last_purchase_date: formattedDate,
        preferred_category: customer.preferred_category,
      })
      console.log(
        `  ✓ ${customer.name.padEnd(22)} [${(customer.preferred_category || 'Unknown').padEnd(14)}]` +
        `  ${formattedDate}  →  ${preview.replenishment_status.padEnd(10)}  days_left: ${String(preview.days_left).padStart(4)}  churn: ${preview.churn_status}`
      )
      successCount++
    }
  }

  console.log(`\n✅ Done. ${successCount} updated, ${errorCount} errors.`)
  console.log('\nStatus distribution preview:')
  const { data: all } = await supabase.from('customers').select('last_purchase_date, preferred_category')
  const enriched = all.map(c => computeReplenishment(c))
  const counts = { on_track: 0, due_soon: 0, overdue: 0 }
  const churn = { natural_gap: 0, at_risk: 0, churn_risk: 0 }
  enriched.forEach(c => {
    if (counts[c.replenishment_status] !== undefined) counts[c.replenishment_status]++
    if (churn[c.churn_status] !== undefined) churn[c.churn_status]++
  })
  console.log('  Replenishment:', counts)
  console.log('  Churn status: ', churn)
}

seed()
