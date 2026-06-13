const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')
const { enrichCustomers, computeReplenishment } = require('../lib/replenishment')

// Get all customers — returns live-computed replenishment fields
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(enrichCustomers(data))
})

// Get single customer — returns live-computed replenishment fields
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', req.params.id)
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(computeReplenishment(data))
})

// Create customer — strip stale static columns before insert
router.post('/', async (req, res) => {
  // eslint-disable-next-line no-unused-vars
  const { replenishment_status, replenishment_days_left, ...safeBody } = req.body
  const { data, error } = await supabase
    .from('customers')
    .insert([safeBody])
    .select()
  if (error) return res.status(500).json({ error: error.message })
  res.json(computeReplenishment(data[0]))
})

// Bulk insert from CSV — strip stale static columns before insert
router.post('/bulk', async (req, res) => {
  const { customers } = req.body
  const safe = customers.map(({ replenishment_status, replenishment_days_left, ...c }) => c)
  const { data, error } = await supabase
    .from('customers')
    .insert(safe)
    .select()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ inserted: data.length })
})

module.exports = router