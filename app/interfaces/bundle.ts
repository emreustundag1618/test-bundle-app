import { Product } from "./product"

export interface Bundle {
    id: String,
    title: String,
    slug: String,
    products: Product[]
}