import { Variant } from "./variant"

export interface Product {
    id: string,
    proId: string,
    title: string,
    productType: string,
    price: number,
    totalInventory: number,
    image?: string,
    quantityNeeded: number,
    variants: Variant[]
}