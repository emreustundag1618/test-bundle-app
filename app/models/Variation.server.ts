import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function createVariant() {
  try {
    await prisma.testModel.create({
      data: {
        id: "2",
        title: "Test title",
        slug: "test-slug",
      },
    });
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error creating product variant:", error);
    await prisma.$disconnect();
    return json({ error: "Failed to create product variant" }, { status: 500 });
  }
}
