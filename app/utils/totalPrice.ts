// Computes total price of products in a bundle
import { Bundle } from "~/interfaces/bundle";

export function computeTotalPrice(bundle: Bundle) {
    let totalPrice = 0;
  
    bundle.products.forEach(product => {
      product.variants.forEach(variant => {
        totalPrice += variant.price * variant.quantityNeeded;
      });
    });
  
    return totalPrice.toFixed(2).toString();
  }