const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')

router.post('/', async (req, res) => {
  const { campaign_id, customer_id, status } = req.body
  console.log(`Receipt: campaign=${campaign_id} customer=${customer_id} status=${status}`)

  // Update individual communication status
  const { error: commError } = await supabase
    .from('communications')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('campaign_id', campaign_id)
    .eq('customer_id', customer_id)

  if (commError) console.log('Comm update error:', commError.message)

  // Get current campaign counts and increment
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('delivered_count, opened_count, clicked_count, failed_count')
    .eq('id', campaign_id)
    .single()

  if (campaign) {
    const updates = {}
    if (status === 'delivered') updates.delivered_count = (campaign.delivered_count || 0) + 1
    if (status === 'opened') updates.opened_count = (campaign.opened_count || 0) + 1
    if (status === 'clicked') updates.clicked_count = (campaign.clicked_count || 0) + 1
    if (status === 'failed') updates.failed_count = (campaign.failed_count || 0) + 1

    if (Object.keys(updates).length > 0) {
      const { error: campError } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', campaign_id)
      if (campError) console.log('Campaign update error:', campError.message)
    }
  }

  res.json({ ok: true })
})

module.exports = router