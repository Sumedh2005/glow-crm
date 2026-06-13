process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err)
})
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err)
})

console.log('Boot: starting index.js')
console.log('Boot: SUPABASE_URL present?', !!process.env.SUPABASE_URL)
console.log('Boot: SUPABASE_ANON_KEY present?', !!process.env.SUPABASE_ANON_KEY)
console.log('Boot: GROQ_API_KEY present?', !!process.env.GROQ_API_KEY)
console.log('Boot: CHANNEL_SERVICE_URL present?', !!process.env.CHANNEL_SERVICE_URL)
console.log('Boot: PORT =', process.env.PORT)

const express = require('express')
const cors = require('cors')
require('dotenv').config()

console.log('Boot: requiring routes...')

const customersRouter = require('./routes/customers')
console.log('Boot: customers router loaded')

const segmentsRouter = require('./routes/segments')
console.log('Boot: segments router loaded')

const campaignsRouter = require('./routes/campaigns')
console.log('Boot: campaigns router loaded')

const receiptsRouter = require('./routes/receipts')
console.log('Boot: receipts router loaded')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/customers', customersRouter)
app.use('/api/segments', segmentsRouter)
app.use('/api/campaigns', campaignsRouter)
app.use('/api/receipts', receiptsRouter)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))