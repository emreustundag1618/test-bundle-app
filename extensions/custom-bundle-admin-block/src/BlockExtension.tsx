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
  Box, NumberField
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState } from 'react';



// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.block.render';


export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const { i18n, data } = useApi(TARGET);
  const splittedProduct = data.selected[0].id.split("/");
  const shopifyId = splittedProduct[splittedProduct.length - 1];

  const [bundle, setBundle] = useState<Bundle | null>(null);

  useEffect(() => {

    async function fetchBundleData(ID: string) {
      try {
        const endpoint = "https://phd-body-excellent-surgeon.trycloudflare.com/api/bundles?shopifyId="
        const response = await fetch(endpoint + ID);
        const json = await response.json();
        setBundle(json.data);
      } catch (error) {
        console.error(error)
      }
    }

    fetchBundleData(shopifyId);
  }, [shopifyId])

  if (!bundle) {
    return (
      <>
        <Text>Loading...</Text>
        <ProgressIndicator size="small-200" />
      </>
    );
  }

  return (
    // The AdminBlock component provides an API for setting the title of the Block extension wrapper.
    <AdminBlock title={"Custom Bundle App:" + JSON.stringify(bundle.title)}>
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


        {bundle.products.map(product => {
          return product.variants.map(variant => (
            <InlineStack blockAlignment='center' inlineSize="100%" gap="large">
              <Box blockSize={50} inlineSize="10%">
                <Image alt="" source={variant.image || product.image} />
              </Box>
              <Box inlineSize="60%">
                <Text>{variant.title}</Text>
              </Box>
              <Box inlineSize="20%">
                <NumberField label="" defaultValue={variant.quantityNeeded.toString()} disabled={true} />
              </Box>
              <Box inlineSize="10%">
                <Text>Edit</Text>
              </Box>
            </InlineStack>
          ))
        })}
      </BlockStack>
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