
export async function getProductData(productId: any) {
    // This example uses metafields to store the data. For more information, refer to https://shopify.dev/docs/apps/custom-data/metafields.
    return await makeGraphQLQuery(
        `query Product($id: ID!) {
        product(id: $id) {
          id
          title
          productType
        }
      }
    `,
        { id: productId }
    );
}


async function makeGraphQLQuery(query: any, variables: any) {
    const graphQLQuery = {
        query,
        variables,
    };

    const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(graphQLQuery),
    });

    if (!res.ok) {
        console.error("Network error");
    }

    return await res.json();
}