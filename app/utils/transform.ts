import { v4 as uuidv4 } from 'uuid';
import { Bundle } from '~/interfaces/bundle';
import { Product } from '~/interfaces/product';

function generateUniqueId() {
    return uuidv4();
}

export function transformVariantData(variant: any) {
    return {
        id: generateUniqueId(),
        varId: variant.id || "",
        productId: variant.product.id || "",
        displayName: variant.displayName,
        price: parseFloat(variant.price) || 0.00,
        quantityNeeded: variant.quantityNeeded || 1,
        inventory: variant?.inventoryQuantity || 0,
        image: variant?.image?.originalSrc || "",
        title: variant?.title || ""
    };
}

export function transformAccessoryData(accessory: any) {

    return {
        id: generateUniqueId(),
        accId: accessory.id || "",
        title: accessory.title,
        price: parseFloat(accessory.variants[0].price) || 0.00,
        productType: accessory.productType || "accessories",
        quantityNeeded: accessory.quantityNeeded || 1,
        totalInventory: accessory?.totalInventory || 0,
        image: accessory?.images?.[0]?.originalSrc || ""
    };
}

export function transformData(products: Product[]) {
    products.map((product: any) => {
        return {
            id: generateUniqueId(),
            proId: product.id,
            title: product.title,
            productType: product.productType || "",
            price: product.variants[0].price,
            totalInventory: product.totalInventory,
            image: product.images?.[0].originalSrc,
            quantityNeeded: 1,
            variants: product.variants.map((variant: any) => {
                return {
                    id: generateUniqueId(),
                    varId: variant.id,
                    title: variant.title,
                    price: variant.price,
                    quantityNeeded: 1,
                    inventory: variant.inventoryQuantity,
                    image: variant.image || ""
                }
            })
        }
    })
};

