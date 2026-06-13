const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')
const axios = require('axios')
const Groq = require('groq-sdk')
const { enrichCustomers } = require('../lib/replenishment')
require('dotenv').config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ── GET /api/campaigns ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ── GET /api/campaigns/send-time — MUST be before /:id ─────────────────────
router.get('/send-time', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('communications')
      .select('updated_at, status, channel')
      .in('status', ['opened', 'clicked'])

    if (error) return res.status(500).json({ error: error.message })
    if (!data || data.length === 0) return res.json({
      best_hour: 9,
      best_day: 'Sunday',
      best_window: '9 AM – 10 AM',
      confidence: 'low',
      total_engagements: 0,
      engagement_by_hour: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        label: h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`,
        count: 0
      })),
      day_breakdown: {}
    })

    const hourCounts = {}
    const dayCounts = {}
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    data.forEach(row => {
      const d = new Date(row.updated_at)
      const hour = d.getHours()
      const day = DAYS[d.getDay()]
      hourCounts[hour] = (hourCounts[hour] || 0) + (row.status === 'clicked' ? 2 : 1)
      dayCounts[day] = (dayCounts[day] || 0) + (row.status === 'clicked' ? 2 : 1)
    })

    const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]
    const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]

    const hour = parseInt(bestHour[0])
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const nextHour = hour + 1
    const nextAmpm = nextHour >= 12 ? 'PM' : 'AM'
    const displayNext = nextHour > 12 ? nextHour - 12 : nextHour

    const engagement_by_hour = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`,
      count: hourCounts[h] || 0
    }))

    res.json({
      best_hour: hour,
      best_day: bestDay[0],
      best_window: `${displayHour} ${ampm} – ${displayNext} ${nextAmpm}`,
      total_engagements: data.length,
      confidence: data.length > 20 ? 'high' : data.length > 10 ? 'medium' : 'low',
      engagement_by_hour,
      day_breakdown: dayCounts
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── GET /api/campaigns/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', req.params.id)
    .single()
  if (error) return res.status(500).json({ error: error.message })

  const { data: comms } = await supabase
    .from('communications')
    .select('*')
    .eq('campaign_id', req.params.id)
    .order('sent_at', { ascending: false })

  res.json({ ...campaign, communications: comms || [] })
})

// ── POST /api/campaigns/draft ───────────────────────────────────────────────
router.post('/draft', async (req, res) => {
  const { segment_name, segment_description, channel } = req.body
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a marketing copywriter for a D2C skincare brand called Glow. Write a personalized ${channel || 'WhatsApp'} message that feels warm and human, not salesy. Keep it under 160 characters for SMS, under 300 for WhatsApp/Email. Use [Name] as placeholder for customer name. Respond with ONLY the message text, nothing else.`
        },
        {
          role: 'user',
          content: `Write a campaign message for this audience: ${segment_name}. ${segment_description || ''}`
        }
      ]
    })
    res.json({ message: completion.choices[0].message.content })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── POST /api/campaigns/draft/save — Save as draft without launching ────────
router.post('/draft/save', async (req, res) => {
  const { name, segment_id, segment_name, message, channel, status } = req.body

  const { data, error } = await supabase
    .from('campaigns')
    .insert([{
      name,
      segment_id,
      segment_name,
      message,
      channel,
      status: status || 'pending',
      sent_count: 0,
      delivered_count: 0,
      opened_count: 0,
      clicked_count: 0
    }])
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

// ── POST /api/campaigns/:id/launch ─────────────────────────────────────────
router.post('/:id/launch', async (req, res) => {
  const { id } = req.params

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return res.status(500).json({ error: error.message })

  let customers = []

  if (campaign.segment_id) {
    const { data: segment } = await supabase
      .from('segments')
      .select('*')
      .eq('id', campaign.segment_id)
      .single()

    if (segment?.filters) {
      const { data: rawCustomers } = await supabase.from('customers').select('*')
      const allEnriched = enrichCustomers(rawCustomers || [])
      const f = segment.filters

      customers = allEnriched.filter(c => {
        if (f.preferred_category && !c.preferred_category?.toLowerCase().includes(f.preferred_category.toLowerCase())) return false
        if (f.min_aov && c.aov < f.min_aov) return false
        if (f.max_aov && c.aov > f.max_aov) return false
        if (f.min_orders && c.total_orders < f.min_orders) return false
        if (f.replenishment_status && c.replenishment_status !== f.replenishment_status) return false
        if (f.churn_status && c.churn_status !== f.churn_status) return false
        if (f.inactive_days) {
          if (!c.last_purchase_date) return false
          const cutoff = new Date()
          cutoff.setDate(cutoff.getDate() - f.inactive_days)
          if (new Date(c.last_purchase_date) > cutoff) return false
        }
        return true
      })
    }
  }

  if (customers.length === 0) {
    const { data: rawCustomers } = await supabase.from('customers').select('*').limit(15)
    customers = enrichCustomers(rawCustomers || [])
  }

  const comms = customers.map(c => ({
    campaign_id: id,
    customer_id: c.id,
    customer_name: c.name,
    channel: campaign.channel,
    status: 'sent'
  }))

  await supabase.from('communications').insert(comms)
  await supabase.from('campaigns').update({
    status: 'sent',
    sent_count: customers.length,
    delivered_count: customers.length,
    launched_at: new Date().toISOString()
  }).eq('id', id)

  try {
    await axios.post(`${process.env.CHANNEL_SERVICE_URL}/send`, {
      campaign_id: id,
      recipients: customers.map(c => ({
        id: c.id,
        name: c.name,
        channel: campaign.channel,
        message: campaign.message
      }))
    })
  } catch (e) {
    console.log('Channel service error:', e.message)
  }

  res.json({ success: true, sent: customers.length })
})

// ── POST /api/campaigns ─────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, segment_id, segment_name, message, channel } = req.body
  const { data, error } = await supabase
    .from('campaigns')
    .insert([{ name, segment_id, segment_name, message, channel, status: 'draft' }])
    .select()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

module.exports = router