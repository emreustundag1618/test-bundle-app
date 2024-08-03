import { v4 as uuidv4 } from 'uuid';
import { Product } from '~/interfaces/product';

function generateUniqueId() {
    return uuidv4();
}

// Converts a ShopifyProduct into a Product
export function transformData(shopifyProduct: any): Product {
    return {
      id: generateUniqueId(),
      proId: shopifyProduct.id,
      title: shopifyProduct.title,
      productType: shopifyProduct.productType || "",
      price: parseFloat(shopifyProduct.variants[0].price),
      totalInventory: shopifyProduct.totalInventory,
      image: shopifyProduct.images?.[0]?.originalSrc || "",
      quantityNeeded: 1,
      variants: shopifyProduct.variants.map((variant: any) => {
        return {
          id: generateUniqueId(),
          varId: variant.id,
          title: variant.title,
          price: parseFloat(variant.price),
          quantityNeeded: 1,
          inventory: variant.inventoryQuantity,
          image: variant.image?.originalSrc || ""
        };
      })
    };
  }

