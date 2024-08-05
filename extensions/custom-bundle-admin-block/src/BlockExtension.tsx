import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
  ProgressIndicator,
  Image,
  InlineStack,
  Section,
  Box, NumberField,
  Link
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState } from 'react';
import { getProductData } from './utils';

// const product = getProductData()


// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.block.render';
const apiUrl = "https://orientation-cable-controls-gained.trycloudflare.com"
const STORE_NAME = "emre-development-store"


// export default reactExtension(TARGET, () => <App />);


export default reactExtension(TARGET, async (api) => {
  const product = await getProductData(api.data.selected[0].id);

  return <App product={product.data.product} />
});

function App({ product }) {
  console.log("Product: ", product)

  // The useApi hook provides access to several useful APIs like i18n and data.
  const { i18n, data } = useApi(TARGET);
  console.log(data)
  const splittedProduct = data.selected[0].id.split("/");
  const shopifyId = splittedProduct[splittedProduct.length - 1];

  const [bundle, setBundle] = useState<Bundle | null>(null);

  useEffect(() => {

    async function fetchBundleData(ID: string) {
      try {
        const endpoint = apiUrl + "/api/bundles?shopifyId=";
        const response = await fetch(endpoint + ID);
        const json = await response.json();
        setBundle(json.data);
      } catch (error) {
        console.error(error)
      }
    }

    fetchBundleData(shopifyId);
  }, [shopifyId]);

  if (product.productType !== "Pattern") {
    return (
      <AdminBlock title={"Custom Bundle App"}>
        <Text>This product is not a pattern type</Text>
      </AdminBlock>
    )
  }

  if (!bundle) {
    return (
      <AdminBlock title={"Custom Bundle App:"}>
        <Text>Loading...</Text>
        <ProgressIndicator size="small-200" />
      </AdminBlock>
    );
  }

  return (
    // The AdminBlock component provides an API for setting the title of the Block extension wrapper.
    <AdminBlock title={"Custom Bundle App: " + bundle.title}>
      {bundle.products.length > 0 ? (
        <BlockStack gap>
          {/* <Text fontWeight="bold">{i18n.translate('welcome', { TARGET })}</Text> */}

          <BlockStack>
            <InlineStack blockAlignment='center' inlineSize="100%" gap="large">
              <Box inlineSize="10%">
                <Text fontWeight='bold'>Image</Text>
              </Box>
              <Box inlineSize="60%">
                <Text fontWeight='bold'>Title</Text>
              </Box>
              <Box inlineSize="20%">
                <Text fontWeight='bold'>Quantity needed</Text>
              </Box>
              <Box inlineSize="10%">
                <Text fontWeight='bold'>Action</Text>
              </Box>
            </InlineStack>
          </BlockStack>

          <BlockStack>
            {bundle.products.map(product => {
              return product.variants.map(variant => (
                <InlineStack blockAlignment='center' inlineSize="100%" gap="large">
                  <Box blockSize={40} inlineSize="8%">
                    <Image alt="" source={variant.image || product.image} />
                  </Box>
                  <Box inlineSize="60%">
                    <Text>{variant.title}</Text>
                  </Box>
                  <Box inlineSize="20%">
                    <NumberField label="" defaultValue={variant.quantityNeeded.toString()} disabled={true} />
                  </Box>
                  <Box padding="base" inlineSize="10%">
                    <Link href={getVariantUrl(product, variant)}>Edit</Link>
                  </Box>
                </InlineStack>
              ))
            })}
          </BlockStack>

        </BlockStack>
      ) : (
        <>
          <Text>No bundle products found</Text>
        </>
      )}

    </AdminBlock>
  );
}

export interface Bundle {
  id: string,
  shopifyId: string,
  title: string,
  slug: string,
  products: Product[]
}

export interface Product {
  id: string,
  proId: string,
  title: string,
  productType: string,
  price: number,
  totalInventory: number,
  image?: string,
  quantityNeeded: number,
  variants: Variant[]
}

export interface Variant {
  id: string,
  varId: string,
  title: string,
  price: number,
  quantityNeeded: number,
  inventory: number,
  image?: string
}

const getVariantUrl = (product: any, variant: any) => {
  return `https://admin.shopify.com/store/${STORE_NAME}/products/${product.proId.split('/').pop()}/variants/${variant.varId.split('/').pop()}`
}