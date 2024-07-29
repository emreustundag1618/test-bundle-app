import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState } from 'react';

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
        const endpoint = "https://hungary-instantly-rt-standing.trycloudflare.com/api/bundles?shopifyId="
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
    return <Text>Loading...</Text>;
  }



  return (
    // The AdminBlock component provides an API for setting the title of the Block extension wrapper.
    <AdminBlock title="My Block Extension">
      <BlockStack>
        <Text fontWeight="bold">{i18n.translate('welcome', { TARGET })}</Text>
        <Text>{JSON.stringify(bundle.title)}</Text>
        {bundle.products.map(product => {
          return product.variants.map(variant => (
            <Text>{variant.title}</Text>
          ))
        })}
      </BlockStack>
    </AdminBlock>
  );
}

function mapToVariantsArray(bundle: Bundle) {
  const variantsArray = [];

  bundle.products.forEach(product => {
    product.variants.forEach(variant => {
      variantsArray.push(variant);
    });
  });

  return variantsArray;
}