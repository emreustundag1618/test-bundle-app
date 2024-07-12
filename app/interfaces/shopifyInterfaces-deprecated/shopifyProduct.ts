import { ShopifyVariant } from "./shopifyVariant";
import { ShopifyImage } from "./shopifyImage";

export interface ShopifyProduct {
    availablePublicationCount: number;
    createdAt: string;
    descriptionHtml: string;
    handle: string;
    hasOnlyDefaultVariant: boolean;
    id: string;
    images: ShopifyImage[];
    options: {
      id: string;
      name: string;
      position: number;
      values: string[];
    }[];
    productType: string;
    publishedAt: string;
    tags: string[];
    templateSuffix: string | null;
    title: string;
    totalInventory: number;
    totalVariants: number;
    tracksInventory: boolean;
    updatedAt: string;
    variants: ShopifyVariant[];
    vendor: string;
    status: string;
  }