import { json } from "@remix-run/node";
import prisma from "../db.server";
import { v4 as uuidv4 } from 'uuid';

function generateUniqueId() {
    return uuidv4();
}


export async function createBundle(data: any) {
    console.log("================DATA DATA DATA =======================", data);
    
    const testArray = data.variants.map((variant: any) => ({
        id: variant.varId,
        displayName: variant.displayName,
        price: variant.price,
        quantityNeeded: 1,
        inventory: variant.inventory || 0,
        image: variant.image,
        title: variant.title || "",
    }));
    console.log("================ Test Array =======================", testArray);
    try {
        const newBundle = await prisma.bundle.create({
            data: {
                id: generateUniqueId(),
                title: data.formData.title,
                slug: data.formData.slug,
                variants: {
                    create: data.variants.map((variant: any) => ({
                        id: variant.id,
                        varId: variant.varId,
                        displayName: variant.displayName,
                        price: variant.price,
                        quantityNeeded: 1,
                        inventory: variant.inventory || 0,
                        image: variant.image,
                        title: variant.title || "",
                    }))
                },
                accessories: {
                    create: data.accessories.map((accessory: any) => ({
                        id: accessory.id,
                        accId: accessory.accId,
                        title: accessory.title,
                        price: accessory.price || 0.00,
                        productType: "accessories",
                        quantityNeeded: 1,
                        totalInventory: accessory.totalInventory,
                        image: accessory.image || "",
                    }))
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
            include: { variants: true, accessories: true}
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
        const bundles = await prisma.bundle.findMany({});
        await prisma.$disconnect();
        return bundles
    } catch (error) {
        console.error("Error getting bundles:", error);
        await prisma.$disconnect();
        return json({ error: "Failed to get bundles" }, { status: 500 });
    }
}

export async function updateBundle(ID: any, data: any) {
    try {
        const updatedBundle = await prisma.bundle.update({
            where: {
                id: ID
            },
            data: {
                title: data.formData.title,
                slug: data.formData.slug,
                variants: {
                    deleteMany: {}, // Delete existing variants
                    create: data.variants.map((variant: any) => ({
                        id: variant.id,
                        varId: variant.varId,
                        displayName: variant.displayName,
                        price: variant.price,
                        quantityNeeded: variant.quantityNeeded,
                        inventory: variant.inventory || 0,
                        image: variant.image,
                        title: variant.title || "",
                    }))
                },
                accessories: {
                    deleteMany: {}, // Delete existing variants
                    create: data.accessories.map((accessory: any) => ({
                        id: accessory.id,
                        accId: accessory.accId,
                        title: accessory.title,
                        price: accessory.price || 0.00,
                        productType: "accessories",
                        quantityNeeded: accessory.quantityNeeded,
                        totalInventory: accessory.totalInventory,
                        image: accessory.image || "",
                    }))
                }

            }
        })
        await prisma.$disconnect();
        return json({ message: `${updatedBundle.title} bundle updated` })
    } catch (error) {
        console.error("Error updating bundle:", error);
        await prisma.$disconnect();
        return json({ error: "Failed to update bundle" }, { status: 500 });
    }
}

export async function deleteBundle(ID: string) {
    try {
        const deletedBundle = await prisma.bundle.delete({
            where: {
                id: ID,
            },
        });
        await prisma.$disconnect();
        return json({ message: `${deletedBundle.title} bundle updated` })
    } catch (error) {
        console.error("Error deleting bundle:", error);
        await prisma.$disconnect();
        return json({ error: "Failed to delete bundle" }, { status: 500 });
    }
}