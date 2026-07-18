/**
 * Editable placeholder pricing for the MVP. In later phases this is
 * replaced by the `review_products` table, editable from the
 * administrator dashboard. Prices are illustrative only.
 */
export interface SampleProduct {
  nameKey: string
  price: string
}

export const sampleProducts: SampleProduct[] = [
  { nameKey: 'pricing.product1Name', price: '$49' },
  { nameKey: 'pricing.product2Name', price: '$129' },
  { nameKey: 'pricing.product3Name', price: '$99' },
  { nameKey: 'pricing.product4Name', price: '$349' },
  { nameKey: 'pricing.product5Name', price: 'Sliding Scale' },
]
