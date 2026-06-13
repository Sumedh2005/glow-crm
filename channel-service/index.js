const express = require('express')
const axios = require('axios')
require('dotenv').config()

const app = express()
app.use(express.json())

const OUTCOMES = ['delivered', 'delivered', 'delivered', 'opened', 'opened', 'clicked', 'failed']

function randomOutcome() {
  return OUTCOMES[Math.floor(Math.random() * OUTCOMES.length)]
}

function randomDelay() {
  return Math.floor(Math.random() * 4000) + 1000 // 1-5 seconds
}

app.post('/send', async (req, res) => {
  const { campaign_id, recipients } = req.body
  console.log(`Sending to ${recipients.length} recipients for campaign ${campaign_id}`)
  res.json({ ok: true, queued: recipients.length })

  for (const recipient of recipients) {
    setTimeout(async () => {
      const status = randomOutcome()
      try {
        const url = `${process.env.CRM_BACKEND_URL}/api/receipts`
        console.log(`Calling back: ${url} - ${recipient.name} - ${status}`)
        await axios.post(url, {
          campaign_id,
          customer_id: recipient.id,
          status
        })
      } catch (e) {
        console.log('Callback error:', e.message)
      }
    }, randomDelay())
  }
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Channel service running on port ${PORT}`))