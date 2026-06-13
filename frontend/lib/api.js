const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API error: ${res.status}`)
  }

  return res.json()
}

/* ─────────────────────────────────────────────
   CUSTOMERS
───────────────────────────────────────────── */
export const getCustomers = () => req('/api/customers')

export const getCustomer = (id) =>
  req(`/api/customers/${id}`)

export const createCustomer = (body) =>
  req('/api/customers', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const bulkInsertCustomers = (customers) =>
  req('/api/customers/bulk', {
    method: 'POST',
    body: JSON.stringify({ customers }),
  })

/* ─────────────────────────────────────────────
   SEGMENTS
───────────────────────────────────────────── */
export const getSegments = () =>
  req('/api/segments')

export const generateSegment = (prompt) =>
  req('/api/segments/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })

export const saveSegment = (body) =>
  req('/api/segments', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const deleteSegment = (id) =>
  req(`/api/segments/${id}`, {
    method: 'DELETE',
  })

/* ─────────────────────────────────────────────
   🔥 AI INSIGHTS (FEATURE 2 - SEND TIME + ANALYTICS)
───────────────────────────────────────────── */
export const getAIInsights = () =>
  req('/api/segments/insights', {
    method: 'POST',
  })

/* ─────────────────────────────────────────────
   🔥 CUSTOMER EXPLAINABILITY (FEATURE 3)
───────────────────────────────────────────── */
export const explainCustomer = (customerId, segmentContext) =>
  req(`/api/customers/${customerId}/explain`, {
    method: 'POST',
    body: JSON.stringify({ segmentContext }),
  })

/* ─────────────────────────────────────────────
   CAMPAIGNS
───────────────────────────────────────────── */
export const getCampaigns = () =>
  req('/api/campaigns')

export const getCampaign = (id) =>
  req(`/api/campaigns/${id}`)

export const createCampaign = (body) =>
  req('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const draftMessage = (body) =>
  req('/api/campaigns/draft', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const launchCampaign = (id) =>
  req(`/api/campaigns/${id}/launch`, {
    method: 'POST',
  })

export const getSendTime = () => req('/api/campaigns/send-time')

/* ─────────────────────────────────────────────
   SAVE DRAFT CAMPAIGN (without launching)
───────────────────────────────────────────── */
export const saveDraftCampaign = (body) =>
  req('/api/campaigns/draft/save', {
    method: 'POST',
    body: JSON.stringify(body),
  })