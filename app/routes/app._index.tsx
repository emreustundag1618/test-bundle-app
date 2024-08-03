import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { EmptyState, Page, Layout, BlockStack, Card, Text, IndexTable, useBreakpoints, InlineStack, Thumbnail } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { Bundle } from '~/interfaces/bundle';
import { createBundle, getBundles } from '~/models/Bundle.server';
import { authenticate } from '~/shopify.server';
import { computeTotalPrice } from '~/utils/totalPrice';
import {
  ProductListIcon
} from '@shopify/polaris-icons';


// Must be on app._index.tsx file
export const loader = async ({ request }: LoaderFunctionArgs) => {

  const { admin } = await authenticate.admin(request);
  
  console.log(admin)

  const bundles = await getBundles();

  return json(bundles);
};


const Bundles = () => {

  const bundles = useLoaderData<any[]>();

  const navigate = useNavigate();

  const handleClick = (id: any) => {
    navigate("/app/bundles/" + id)
  }

  const handleAction = () => {
    navigate("/app/create-kit");
  }

  return (
    <Page
      title="Variant Kits"
      primaryAction={{ content: "Create", disabled: false, onAction: () => handleAction() }}
    >
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
                    title: 'Total Price',
                  },
                ]}
              >
                {bundles.map(
                  (bundle: Bundle, index) => (
                    <IndexTable.Row
                      id={bundle.id}
                      key={bundle.id}
                      position={index}
                      onClick={() => handleClick(bundle.id)}
                    >
                      <IndexTable.Cell>
                        <InlineStack gap="300" blockAlign='center'>
                          <Thumbnail
                            source={ProductListIcon}
                            size="medium"
                            alt="Bundle"
                          />

                          <Text variant="bodyMd" fontWeight="bold" as="h3">
                            {bundle.title}
                          </Text>

                        </InlineStack>
                      </IndexTable.Cell>
                      <IndexTable.Cell>{bundle.slug}</IndexTable.Cell>
                      <IndexTable.Cell>
                        <Text as="span" alignment="end" numeric>
                          $ {computeTotalPrice(bundle)}
                        </Text>
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  ),
                )}
              </IndexTable>
            </Layout.Section>
          )}
        </Layout>
      </BlockStack>

    </Page>
  )
}

export default Bundles