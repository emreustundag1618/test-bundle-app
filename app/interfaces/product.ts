import { Variant } from "./variant"

export interface Product {
    id: String,
    proId: String,
    title: String,
    productType: String,
    price: Number,
    totalInventory: Number,
    image: String,
    quantityNeeded: Number,
    variants: Variant[]
}