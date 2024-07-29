import { Product } from "./product"

export interface Bundle {
    id: string,
    shopifyId: string,
    title: string,
    slug: string,
    products: Product[]
}