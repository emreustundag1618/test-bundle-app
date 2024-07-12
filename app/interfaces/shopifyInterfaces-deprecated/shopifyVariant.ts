import { ShopifyImage } from "./shopifyImage";

export interface ShopifyVariant {
    availableForSale: boolean;
    barcode: string;
    compareAtPrice: number | null;
    createdAt: string;
    displayName: string;
    fulfillmentService: {
      id: string;
      inventoryManagement: boolean;
      productBased: boolean;
      serviceName: string;
      type: string;
    };
    id: string;
    image?: ShopifyImage;
    inventoryItem: {
      __typename: string;
      id: string;
    };
    inventoryManagement: string;
    inventoryPolicy: string;
    inventoryQuantity: number;
    position: number;
    price: string;
    product: {
      __typename: string;
      id: string;
    };
    requiresShipping: boolean;
    selectedOptions: {
      __typename: string;
      value: string;
    }[];
    sku: string;
    taxable: boolean;
    title: string;
    updatedAt: string;
    weight: number;
    weightUnit: string;
  }