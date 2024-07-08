import { json } from "@remix-run/node";
import prisma from "../db.server";


export async function createBundle() {
    try {
        const newBundle = await prisma.bundle.create({
            data: {
                id: "4",
                title: "Test bundle title",
                slug: "test-bundle-slug",
                variants: {
                    create: {
                        id: "2",
                        displayName: "Test title",
                        price: 13.00,
                        quantityNeeded: 2,
                        inventoryQuantity: 30,
                        image: "ccc.jpg",
                        title: "variant title",
                    }
                },
                accessories: {
                    create: {
                        id: "2",
                        title: "Test title",
                        price: 13.00,
                        productType: "accessory",
                        quantityNeeded: 2,
                        totalInventory: 20,
                        image: "variant title",
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

export async function getBundleById(ID: string) {
    try {
        const bundle = await prisma.bundle.findUnique({
            where: {
                id: ID
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
        const bundles = await prisma.bundle.findMany({});
        await prisma.$disconnect();
        return bundles
    } catch (error) {
        console.error("Error getting bundles:", error);
        await prisma.$disconnect();
        return json({ error: "Failed to get bundles" }, { status: 500 });
    }
}

export async function updateBundle(ID: string) {
    try {
        const updatedBundle = await prisma.bundle.update({
            where: {
                id: ID
            },
            data: {
                title: "Updated title"
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