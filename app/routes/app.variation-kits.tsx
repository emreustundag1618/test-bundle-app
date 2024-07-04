import { LoaderFunctionArgs } from '@remix-run/node';
import { LegacyCard, EmptyState, Page, Layout, BlockStack } from '@shopify/polaris';
import { authenticate } from '~/shopify.server';

// Must be on app._index.tsx file
// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   await authenticate.admin(request);
//   console.log(authenticate)

//   return null;
// };

const Variations = () => {
  return (
    <Page title="Variation Kits">
      <BlockStack>
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <EmptyState
                heading="Create a variation kit to get started"
                action={{ content: 'Create kit' }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Create variant groups and accessories of a pattern and sell them together through a pattern type product.</p>
              </EmptyState>
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </BlockStack>

    </Page>
  )
}

export default Variations