const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')
const Groq = require('groq-sdk')
const { enrichCustomers } = require('../lib/replenishment')
require('dotenv').config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ─── Helper: apply filters to an in-memory array of enriched customers ───────
// replenishment_status and churn_status are always evaluated on computed fields, never DB columns.
function applyFiltersInMemory(customers, f) {
  if (!f) return customers
  return customers.filter(c => {
    if (f.preferred_category && !c.preferred_category?.toLowerCase().includes(String(f.preferred_category).toLowerCase())) return false
    if (f.min_aov != null && c.aov < f.min_aov) return false
    if (f.max_aov != null && c.aov > f.max_aov) return false
    if (f.min_orders != null && c.total_orders < f.min_orders) return false
    if (f.replenishment_status && c.replenishment_status !== f.replenishment_status) return false
    if (f.churn_status && c.churn_status !== f.churn_status) return false
    if (f.inactive_days != null) {
      if (!c.last_purchase_date) return false
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - f.inactive_days)
      if (new Date(c.last_purchase_date) > cutoff) return false
    }
    return true
  })
}

// ─── Normalize AI-returned filter values to match our exact enums ────────────
// Llama-3.1-8b sometimes returns close-but-not-exact strings, numeric strings,
// or 0 instead of null. This maps common variants back to valid values.
const REPLENISHMENT_VALUES = ['on_track', 'due_soon', 'overdue']
const CHURN_VALUES = ['natural_gap', 'at_risk', 'churn_risk']

function normalizeEnum(value, validValues) {
  if (value == null) return null
  const v = String(value).toLowerCase().trim().replace(/\s+/g, '_').replace(/-/g, '_')
  if (validValues.includes(v)) return v
  // common aliases
  const aliasMap = {
    'churn': 'churn_risk',
    'high_churn_risk': 'churn_risk',
    'churn_risk_high': 'churn_risk',
    'risk': 'at_risk',
    'gap': 'natural_gap',
    'natural': 'natural_gap',
    'restock': 'due_soon',
    'restock_soon': 'due_soon',
    'due': 'due_soon',
    'late': 'overdue',
    'past_due': 'overdue'
  }
  return aliasMap[v] || null
}

function normalizeNumber(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return isNaN(n) ? null : n
}

function normalizeFilters(filters) {
  if (!filters) return {}
  return {
    preferred_category: filters.preferred_category || null,
    min_aov: normalizeNumber(filters.min_aov),
    max_aov: normalizeNumber(filters.max_aov),
    min_orders: normalizeNumber(filters.min_orders),
    replenishment_status: normalizeEnum(filters.replenishment_status, REPLENISHMENT_VALUES),
    churn_status: normalizeEnum(filters.churn_status, CHURN_VALUES),
    inactive_days: normalizeNumber(filters.inactive_days)
  }
}

// ─── GET /api/segments — list segments with live customer counts ──────────────
router.get('/', async (req, res) => {
  const { data: segments, error } = await supabase
    .from('segments')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })

  const { data: rawCustomers } = await supabase.from('customers').select('*')
  const allCustomers = enrichCustomers(rawCustomers || [])

  const updated = segments.map(seg => {
    if (!seg.filters || Object.keys(seg.filters).length === 0) return seg
    const matching = applyFiltersInMemory(allCustomers, seg.filters)
    return { ...seg, customer_count: matching.length }
  })

  res.json(updated)
})

// ─── POST /api/segments/generate — AI natural language → filters → customers ──
router.post('/generate', async (req, res) => {
  const { prompt } = req.body
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a CRM segmentation engine for a D2C skincare brand.
Convert natural language audience descriptions into filter logic.
Respond ONLY with valid JSON, no markdown, no explanation, no preamble.

IMPORTANT RULES:
- For replenishment_status, use EXACTLY one of: "on_track", "due_soon", "overdue", or null. Do not invent other values.
- For churn_status, use EXACTLY one of: "natural_gap", "at_risk", "churn_risk", or null. Do not invent other values.
- If a field isn't mentioned in the prompt, set it to null (not 0, not empty string).
- preferred_category should match category names like "Serums", "Cleansers", "Sun Protection", "Moisturiser", "Anti-Ageing".

Format:
{
  "filters": {
    "preferred_category": "string or null",
    "min_aov": number or null,
    "max_aov": number or null,
    "min_orders": number or null,
    "replenishment_status": "on_track" | "due_soon" | "overdue" | null,
    "churn_status": "natural_gap" | "at_risk" | "churn_risk" | null,
    "inactive_days": number or null
  },
  "segment_name": "short descriptive name",
  "description": "one sentence description"
}

Example:
Input: "customers who are a churn risk and prefer cleansers"
Output: {"filters":{"preferred_category":"Cleansers","min_aov":null,"max_aov":null,"min_orders":null,"replenishment_status":null,"churn_status":"churn_risk","inactive_days":null},"segment_name":"Cleanser Churn Risks","description":"Customers at high churn risk who prefer cleansers"}

Example:
Input: "high spenders due for restock"
Output: {"filters":{"preferred_category":null,"min_aov":3000,"max_aov":null,"min_orders":null,"replenishment_status":"due_soon","churn_status":null,"inactive_days":null},"segment_name":"High-Value Restock Window","description":"High AOV customers due for restock soon"}`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    })

    const rawText = completion.choices[0].message.content
    console.log('--- /segments/generate ---')
    console.log('RAW GROQ RESPONSE:', rawText)

    let parsed
    try {
      const clean = rawText.replace(/```json|```/gi, '').trim()
      parsed = JSON.parse(clean)
    } catch (e) {
      console.error('AI parse error:', e.message)
      return res.status(500).json({ error: 'AI parse error', raw: rawText })
    }

    const normalizedFilters = normalizeFilters(parsed.filters)
    console.log('PARSED FILTERS (raw):', JSON.stringify(parsed.filters))
    console.log('NORMALIZED FILTERS:', JSON.stringify(normalizedFilters))

    const filters = {
      filters: normalizedFilters,
      segment_name: parsed.segment_name || 'AI Generated Segment',
      description: parsed.description || prompt
    }

    // Fetch all customers, enrich, then apply filters in-memory
    const { data: rawCustomers, error } = await supabase.from('customers').select('*')
    if (error) return res.status(500).json({ error: error.message })

    console.log('TOTAL CUSTOMERS IN DB:', rawCustomers.length)

    const enriched = enrichCustomers(rawCustomers)
    const matching = applyFiltersInMemory(enriched, normalizedFilters)

    console.log('MATCHING COUNT:', matching.length)
    console.log('---------------------------')

    res.json({ filters, customers: matching, count: matching.length })
  } catch (e) {
    console.error('AI error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

// ─── POST /api/segments — save a segment ─────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, description, filters, customer_count } = req.body
  const { data, error } = await supabase
    .from('segments')
    .insert([{ name, description, filters, customer_count }])
    .select()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

// ─── Robust JSON array extractor for Groq/Llama responses ───────────────────
function extractJsonArray(text) {
  let clean = text.replace(/```json|```/gi, '').trim()
  try { return JSON.parse(clean) } catch (_) { }

  const match = clean.match(/\[\s*\{[\s\S]*?\}\s*\]/)
  if (match) {
    try { return JSON.parse(match[0]) } catch (_) { }
  }

  const start = clean.indexOf('[')
  if (start !== -1) {
    let candidate = clean.slice(start)
    candidate = candidate.replace(/,\s*([\]}])/g, '$1')
    try { return JSON.parse(candidate) } catch (_) { }
  }

  return null
}

// ─── Template fallback insights (used if Groq returns unparseable JSON) ───────
function templateInsights(summary) {
  return [
    {
      tag: '🔁 Replenishment',
      tagBg: '#FEF9C3', tagColor: '#854D0E',
      priority: 'Urgent', priorityColor: '#DC2626',
      title: `${summary.due_soon} customers entering their restock window now`,
      body: `These customers are within 7 days of their product cycle end. Reaching them now with a restock reminder can recover ₹${Math.round(summary.due_soon * summary.avg_aov).toLocaleString()} in revenue.`,
      borderColor: '#EAB308'
    },
    {
      tag: '⚠️ Churn Risk',
      tagBg: '#FEE2E2', tagColor: '#991B1B',
      priority: 'High Priority', priorityColor: '#DC2626',
      title: `${summary.churn_risk} customers are 1.2× past their product lifespan`,
      body: `These customers have gone significantly past their expected repurchase date. A win-back campaign with an incentive is recommended before they churn permanently.`,
      borderColor: '#EF4444'
    },
    {
      tag: '⭐ High AOV',
      tagBg: '#F3E8FF', tagColor: '#7C3AED',
      priority: 'Medium Priority', priorityColor: '#7C3AED',
      title: `${summary.high_aov_count} high-value customers (₹3000+ AOV) to nurture`,
      body: `Your premium segment drives outsized revenue per order. A VIP-exclusive campaign with early access or loyalty rewards can increase their purchase frequency.`,
      borderColor: '#A855F7'
    },
    {
      tag: '✨ Serums',
      tagBg: '#DBEAFE', tagColor: '#1E40AF',
      priority: 'Medium Priority', priorityColor: '#2563EB',
      title: `${summary.serum_buyers} serum buyers on short 30-day cycles`,
      body: `Serums have the shortest replenishment window in your catalogue. Automated 25-day reminders targeting this group can significantly reduce lapsed orders.`,
      borderColor: '#3B82F6'
    },
  ]
}

// ─── POST /api/segments/insights — AI insights from live data ─────────────────
router.post('/insights', async (req, res) => {
  try {
    const { data: rawCustomers } = await supabase.from('customers').select('*')
    const customers = enrichCustomers(rawCustomers || [])

    const summary = {
      total: customers.length,
      due_soon: customers.filter(c => c.replenishment_status === 'due_soon').length,
      overdue: customers.filter(c => c.replenishment_status === 'overdue').length,
      on_track: customers.filter(c => c.replenishment_status === 'on_track').length,
      churn_risk: customers.filter(c => c.churn_status === 'churn_risk').length,
      at_risk: customers.filter(c => c.churn_status === 'at_risk').length,
      avg_aov: Math.round(customers.reduce((s, c) => s + (c.aov || 0), 0) / customers.length),
      high_aov_count: customers.filter(c => c.aov >= 3000).length,
      serum_buyers: customers.filter(c => c.preferred_category === 'Serums').length,
      spf_buyers: customers.filter(c => c.preferred_category === 'Sun Protection').length,
      anti_ageing: customers.filter(c => c.preferred_category === 'Anti-Ageing').length,
      categories: [...new Set(customers.map(c => c.preferred_category))],
    }

    let insights = null

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an AI analyst for a D2C skincare brand CRM called Glow.
Generate exactly 4 actionable marketing insights as a JSON array.
Output ONLY the raw JSON array — no markdown, no code fences, no explanation, no preamble.
Start your response with [ and end with ]. Nothing before or after.
Each element must have these exact string keys:
tag, tagBg, tagColor, priority, priorityColor, title, body, borderColor`
          },
          {
            role: 'user',
            content: `Customer base data:
Total: ${summary.total} | On track: ${summary.on_track} | Due soon: ${summary.due_soon} | Overdue: ${summary.overdue}
Churn risk: ${summary.churn_risk} | At risk: ${summary.at_risk}
Avg AOV: Rs${summary.avg_aov} | High AOV (3000+): ${summary.high_aov_count}
Serum buyers: ${summary.serum_buyers} | SPF buyers: ${summary.spf_buyers} | Anti-ageing: ${summary.anti_ageing}

Generate 4 insights a marketing manager would act on today. JSON array only.`
          }
        ],
        temperature: 0.3,
      })

      const raw = completion.choices[0].message.content
      insights = extractJsonArray(raw)
      if (!insights || !Array.isArray(insights)) {
        console.warn('Groq returned unparseable JSON, using template fallback. Raw:', raw.slice(0, 200))
        insights = null
      }
    } catch (aiErr) {
      console.warn('Groq call failed, using template fallback:', aiErr.message)
    }

    if (!insights) insights = templateInsights(summary)

    const predictedRevenue = customers
      .filter(c => c.replenishment_status === 'due_soon')
      .reduce((s, c) => s + (c.aov || 0), 0)

    res.json({
      insights,
      predictedRevenue,
      total: customers.length,
      summary,
    })
  } catch (e) {
    console.error('Insights error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

module.exports = router