import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { EmptyState, Page, Layout, BlockStack, Card, Text, IndexTable, useBreakpoints, InlineStack, Thumbnail } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { createBundle, getBundles } from '~/models/Bundle.server';
import { authenticate } from '~/shopify.server';


// Must be on app._index.tsx file
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const bundles = await getBundles();

  return json(bundles);
};

export async function action({request}: ActionFunctionArgs) {
  
  const formData = await request.formData();
  const dataEntry = formData.get('data');

  if (typeof dataEntry === 'string') {
    const data = JSON.parse(dataEntry);

    // Process the data, e.g., save to database
    await createBundle(data);

    return json(data);
  } else {
    throw new Error("Invalid form data");
  }
}


const Bundles = () => {
  const [rpActive, setRpActive] = useState(false);
  const [testText, setTestText] = useState("");
  const bundles = useLoaderData<any[]>();

  const shopify = useAppBridge();

  const navigate = useNavigate();

  const handleClick = (id: any) => {
    navigate("/app/bundles/" + id)
  }

  return (
    <Page title="Variant Kits">
      <BlockStack gap="1000">
        <Layout>
          {!(bundles.length > 0) ? (
            <Layout.Section>
              <Card>
                <EmptyState
                  heading="Create a variation kit to get started"
                  action={{ content: 'Create kit', url: "/app/create-kit" }}
                  image={'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                >
                  <p>Create variant groups and accessories of a pattern and sell them together through a pattern type product.</p>
                </EmptyState>
              </Card>
            </Layout.Section>
          ) : (
            <Layout.Section>
              <Card>
                <IndexTable
                  selectable={false}
                  condensed={useBreakpoints().smDown}
                  resourceName={{
                    singular: 'bundle',
                    plural: 'bundles',
                  }}
                  itemCount={bundles.length}
                  headings={[
                    { title: 'Name' },
                    { title: 'Slug' },
                    {
                      alignment: 'end',
                      id: 'price',
                      title: 'Price',
                    },
                  ]}
                >
                  {bundles.map(
                    ({ id, title, slug }, index) => (
                      <IndexTable.Row
                        id={id}
                        key={id}
                        position={index}
                        onClick={() => handleClick(id)}
                      >
                        <IndexTable.Cell>
                          <InlineStack gap="300" blockAlign='center'>
                            <Thumbnail
                              source="https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
                              size="medium"
                              alt="Black choker necklace"
                            />

                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                              {title}
                            </Text>

                          </InlineStack>
                        </IndexTable.Cell>
                        <IndexTable.Cell>{slug}</IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text as="span" alignment="end" numeric>
                            $0.00
                          </Text>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    ),
                  )}
                </IndexTable>
              </Card>
            </Layout.Section>
          )}
        </Layout>
      </BlockStack>

    </Page>
  )
}

export default Bundles