export interface ShopifyVariant {
    id: string;
    title: string;
    price: number;
    inventoryQuantity: number;
    image?: string; // Assuming each variant can have an image
  }