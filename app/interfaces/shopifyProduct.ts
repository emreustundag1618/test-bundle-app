import { ShopifyVariant } from "./shopifyVariant";

export interface ShopifyProduct {
    id: string;
    title: string;
    productType?: string;
    totalInventory: number;
    images?: { originalSrc: string }[]; // Define the images property
    variants: ShopifyVariant[];
}