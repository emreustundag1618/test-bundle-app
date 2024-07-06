import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { LegacyCard, EmptyState, Page, Layout, BlockStack, Card, Text, TextField, FormLayout } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { authenticate } from '~/shopify.server';

export async function loader({ request }: LoaderFunctionArgs) {
  // Here we can get ready-to-use data before component renders. For example in edit page we get data from db and fill the form with this data 
  // let formData = {
  //   title: 'Test edit data',
  //   slug: "Test edit data"
  // }

  // return json(formData)

  await authenticate.admin(request);

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  // Here we can create backend logic. For example adding data to sqlite with prisma or creating new product in shopify with graphql

  let body = await request.formData();
  const formDataObject = Object.fromEntries(body);

  return json(formDataObject);
}


const CreateKit = () => {
  // const testData = useLoaderData<typeof loader>()
  const [formData, setFormData] = useState({ title: "", slug: "" });
  const [selectedData, setSelectedData] = useState<any>([]);
  const [selectedAcc, setSelectedAcc] = useState<any>([])

  const submit = useSubmit();

  const shopify = useAppBridge();

  const showVariants = useCallback(async () => {
    try {
      const selected = await shopify.resourcePicker({ type: 'variant', multiple: true });
      // Handle the selected product here
      setSelectedData(selected || [])
    } catch (error) {
      // Handle any errors that might occur
      console.error('Error picking resource:', error);
    }
  }, []);

  const showAccessories = useCallback(async () => {
    try {
      const selected = await shopify.resourcePicker({
        type: 'product', filter: {
          hidden: true,
          variants: false,
          draft: false,
          archived: false,
        }, multiple: true
      });
      // Handle the selected product here
      setSelectedAcc(selected || [])
    } catch (error) {
      // Handle any errors that might occur
      console.error('Error picking resource:', error);
    }
  }, []);

  const handleAction = () => {
    // This makes an post request to action function
    submit(
      formData,
      {
        replace: true,
        method: "POST",
        action: ""
      }
    )
    shopify.toast.show("Form data sent");
  }




  return (
    <Page
      title="Create new kit"
      backAction={{ url: '/app' }}
      primaryAction={{ content: "Save", disabled: false, onAction: () => handleAction() }}
    >
      <BlockStack gap="1000">
        <Layout>
          <Layout.Section>
            <Text as="p">
              Create a variation kit to sell products together through a pattern product. Select yarn variants and accessories with default features to make the pattern complete.
            </Text>
          </Layout.Section>


          <Layout.Section>
            <Card padding="500">
              <FormLayout>
                <TextField label="Title" placeholder='Pattern Product Title' name="title" value={formData.title} onChange={(value) => setFormData({ ...formData, title: value })} autoComplete="off" />
                <TextField
                  label="Slug"
                  placeholder="A Unique Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={(value) => setFormData({ ...formData, slug: value })}
                  autoComplete="off"
                />
              </FormLayout>
            </Card>
          </Layout.Section>

          {!(selectedData.length > 0) ?
            (
              <Layout.Section>
                <Card>
                  <EmptyState image={'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'} action={{ content: 'Select variants', onAction: showVariants }}>
                    <Text as="p" variant='bodyMd'>Select product variants you want to add to kit</Text>
                  </EmptyState>
                </Card>
              </Layout.Section>
            )
            :
            (
              <Layout.Section>
                <Card>
                  <pre>{JSON.stringify(selectedData, null, 2)}</pre>
                </Card>
              </Layout.Section>
            )
          }
          {!(selectedAcc.length > 0) ?
            (
              <Layout.Section>
                <Card>
                  <EmptyState image={'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'} action={{ content: 'Select accessories', onAction: showAccessories }}>
                    <Text as="p" variant='bodyMd'>Select accessories you want to add to kit</Text>
                  </EmptyState>
                </Card>
              </Layout.Section>
            ) :
            (
              <Layout.Section>
                <Card>
                  <pre>{JSON.stringify(selectedAcc, null, 2)}</pre>
                </Card>
              </Layout.Section>
            )
          }
        </Layout>
      </BlockStack>
    </Page>
  )
}

export default CreateKit