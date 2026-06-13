/**
 * Replenishment Intelligence — live computation helper
 *
 * Never read replenishment_status or replenishment_days_left from the DB.
 * Always compute from last_purchase_date + preferred_category at query time.
 */

// Product lifespan in days by category
const CATEGORY_LIFESPAN = {
  'Serums': 30,
  'Sun Protection': 30,
  'Cleansers': 60,
  'Moisturiser': 45,
  'Anti-Ageing': 45,
}

/**
 * Compute live replenishment and churn fields for a single customer.
 * @param {Object} customer - raw customer row from DB
 * @returns {Object} - customer with computed fields merged in
 */
function computeReplenishment(customer) {
  const lifespan = CATEGORY_LIFESPAN[customer.preferred_category] || 30

  let days_since_purchase = null
  let days_left = null
  let replenishment_status = 'on_track'
  let churn_status = 'natural_gap'

  if (customer.last_purchase_date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const purchase = new Date(customer.last_purchase_date)
    purchase.setHours(0, 0, 0, 0)

    days_since_purchase = Math.floor((today - purchase) / (1000 * 60 * 60 * 24))
    days_left = lifespan - days_since_purchase

    // Replenishment status
    if (days_left > 7) {
      replenishment_status = 'on_track'
    } else if (days_left >= 0) {
      replenishment_status = 'due_soon'
    } else {
      replenishment_status = 'overdue'
    }

    // Churn status (based on how far past their lifespan they are)
    if (days_since_purchase < lifespan) {
      churn_status = 'natural_gap'
    } else if (days_since_purchase <= lifespan * 1.2) {
      churn_status = 'at_risk'
    } else {
      churn_status = 'churn_risk'
    }
  }

  return {
    ...customer,
    days_since_purchase,
    days_left,
    replenishment_status,
    churn_status,
    // expose lifespan so frontend can show the formula
    product_lifespan_days: lifespan,
  }
}

/**
 * Enrich an array of customers with live computed replenishment fields.
 * @param {Array} customers
 * @returns {Array}
 */
function enrichCustomers(customers) {
  return customers.map(computeReplenishment)
}

module.exports = { CATEGORY_LIFESPAN, computeReplenishment, enrichCustomers }
