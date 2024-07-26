import { json } from "@remix-run/node";
import prisma from "../db.server";
import { v4 as uuidv4 } from 'uuid';
import { Product } from "~/interfaces/product";
import { Variant } from "~/interfaces/variant";
import { Bundle } from "~/interfaces/bundle";

function generateUniqueId() {
    return uuidv4();
}

export async function createBundle(bundle: Bundle) {
    try {
        const newBundle = await prisma.bundle.create({
            data: {
                id: generateUniqueId(),
                shopifyId: bundle.shopifyId,
                title: bundle.title,
                slug: bundle.slug,
                products: {
                    create: bundle.products.map((product: Product) => {
                        return {
                            id: product.id,
                            proId: product.proId,
                            title: product.title,
                            productType: product.productType,
                            price: product.price,
                            totalInventory: product.totalInventory,
                            image: product.image || "",
                            quantityNeeded: product.quantityNeeded,
                            variants: {
                                create: product.variants.map((variant: Variant) => {
                                    return {
                                        id: variant.id,
                                        varId: variant.varId,
                                        title: variant.title,
                                        price: variant.price,
                                        quantityNeeded: variant.quantityNeeded,
                                        inventory: variant.inventory,
                                        image: variant.image || ""
                                    }
                                })
                            }
                        }
                    })
                }
            },
            include: {
                products: {
                    include: {
                        variants: true
                    }
                }
            }
        });
        await prisma.$disconnect();
        return json({ message: `${newBundle.title} bundle created` })
    } catch (error) {
        console.error("Error creating bundle:", error);
        await prisma.$disconnect();
        return json({ error: "Failed to create bundle" }, { status: 500 });
    }
}

export async function getBundleById(ID: any) {
    try {
        const bundle = await prisma.bundle.findUnique({
            where: {
                id: ID
            },
            include: {
                products: {
                    include: {
                        variants: true
                    }
                }
            }
        });
        await prisma.$disconnect();
        return bundle
    } catch (error) {
        console.error("Error getting bundle:", error);
        await prisma.$disconnect();
        return json({ error: "Failed to get bundle" }, { status: 500 });
    }
}

export async function getBundles() {
    try {
        const bundles = await prisma.bundle.findMany({
            include: {
                products: {
                    include: {
                        variants: true
                    }
                },
            }
        });
        await prisma.$disconnect();
        return bundles
    } catch (error) {
        console.error("Error getting bundles:", error);
        await prisma.$disconnect();
        return json({ error: "Failed to get bundles" }, { status: 500 });
    }
}

export async function updateBundle(ID: any, bundle: Bundle) {
    try {
        const updatedBundle = await prisma.$transaction(async (prisma) => {
            // Step 1: Delete existing variants
            await prisma.variant.deleteMany({
                where: {
                    productId: {
                        in: (await prisma.product.findMany({
                            where: { bundleId: ID },
                            select: { id: true }
                        })).map(product => product.id)
                    }
                }
            });
        
            // Step 2: Delete existing products
            await prisma.product.deleteMany({
                where: { bundleId: ID }
            });
        
            // Step 3: Update the bundle with new products and variants
            const updatedBundle = await prisma.bundle.update({
                where: {
                    id: ID
                },
                data: {
                    title: bundle.title,
                    slug: bundle.slug,
                    products: {
                        create: bundle.products.map((product: Product) => ({
                            id: generateUniqueId(),
                            proId: product.proId,
                            title: product.title,
                            productType: product.productType,
                            price: product.price,
                            totalInventory: product.totalInventory,
                            image: product.image || "",
                            quantityNeeded: product.quantityNeeded,
                            variants: {
                                create: product.variants.map((variant: Variant) => ({
                                    id: generateUniqueId(),
                                    varId: variant.varId,
                                    title: variant.title,
                                    price: variant.price,
                                    quantityNeeded: variant.quantityNeeded,
                                    inventory: variant.inventory,
                                    image: variant.image || ""
                                }))
                            }
                        }))
                    },
                }
            });
        
            return updatedBundle;
        });
        
        await prisma.$disconnect();
        return json({ message: `${updatedBundle.title} bundle updated` })
    } catch (error) {
        console.error("Error updating bundle:", error);
        await prisma.$disconnect();
        return json({ error: "Failed to update bundle" }, { status: 500 });
    }
}

export async function deleteBundle(ID: any) {
    try {
        const deletedBundle = await prisma.bundle.delete({
            where: {
                id: ID,
            },
            include: {
                products: {
                  include: {
                    variants: true,
                  },
                },
              },
        });
        await prisma.$disconnect();
        return json({ message: `${deletedBundle.title} bundle deleted` })
    } catch (error) {
        console.error("Error deleting bundle:", error);
        await prisma.$disconnect();
        return json({ error: "Failed to delete bundle" }, { status: 500 });
    }
}