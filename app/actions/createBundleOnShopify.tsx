import { Bundle } from "~/interfaces/bundle";

export async function createBundleOnShopify (data: Bundle, admin: any) {
    const response = await admin.graphql(
        `#graphql
          mutation populateProduct($input: ProductInput!) {
            productCreate(input: $input) {
              product {
                id
                title
              }
            }
          }`,
        {
          variables: {
            input: {
              title: `${data.title}`,
              productType: "Pattern",
              vendor: "Sensy - Bundle"
            },
          },
        },
      );
      const responseJson = await response.json();
      return responseJson
}