import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { LegacyCard, EmptyState, Page, Layout, BlockStack, Card, Text } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { authenticate } from '~/shopify.server';


// Must be on app._index.tsx file
// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   await authenticate.admin(request);
//   console.log(authenticate)

//   return null;
// };


const Variations = () => {
  const [rpActive, setRpActive] = useState(false);
  const [testText, setTestText] = useState("");

  const shopify = useAppBridge();

  useEffect(() => {
    setTestText(JSON.stringify(shopify));
    const getRp = async () => {
      const selected = await shopify.resourcePicker({ type: 'product' });
    }

    if (rpActive) {
      shopify.toast.show("Toast added");
      getRp();
    }
  }, [rpActive, shopify]);

  const toggleRp = useCallback(() => {
    setRpActive(prevState => !prevState);
  }, []);


  return (
    <Page title="Variation Kits">
      <BlockStack gap="1000">
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <EmptyState
                heading="Create a variation kit to get started"
                action={{ content: 'Create kit', onAction: toggleRp }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Create variant groups and accessories of a pattern and sell them together through a pattern type product.</p>
              </EmptyState>
            </LegacyCard>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <Text as="h2" variant="headingSm">Test card</Text>
              <Text as="p">{testText}</Text>
              {rpActive && <Text as="p">Some text here!!!!</Text>}
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

    </Page>
  )
}

export default Variations