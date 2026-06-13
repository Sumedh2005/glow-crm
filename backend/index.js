const express = require('express')
const cors = require('cors')
require('dotenv').config()

const customersRouter = require('./routes/customers')
const segmentsRouter = require('./routes/segments')
const campaignsRouter = require('./routes/campaigns')
const receiptsRouter = require('./routes/receipts')

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