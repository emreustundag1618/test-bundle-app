import { Product } from "./product"

export interface Bundle {
    id: string,
    title: string,
    slug: string,
    products: Product[]
}