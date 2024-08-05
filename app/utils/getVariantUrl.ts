const STORE_NAME = "emre-development-store";

export const getVariantUrl = (product: any, variant?: any) => {
    if (variant) {
        return `https://admin.shopify.com/store/${STORE_NAME}/products/${product.proId.split('/').pop()}/variants/${variant.varId.split('/').pop()}`
    }
    return `https://admin.shopify.com/store/${STORE_NAME}/products/${product.proId.split('/').pop()}`
}