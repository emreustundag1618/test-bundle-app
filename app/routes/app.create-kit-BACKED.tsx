import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate, useSubmit } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { LegacyCard, EmptyState, Page, Layout, BlockStack, Card, Text, TextField, FormLayout, ResourceList, ResourceItem, Avatar, Thumbnail, InlineStack, Bleed, InlineGrid, Icon, ButtonGroup, Button } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { authenticate } from '~/shopify.server';
import { createBundle, getBundleById, updateBundle, deleteBundle } from '~/models/Bundle.server';
import { transformVariantData, transformAccessoryData } from '~/utils/transform';
import { XIcon, PlusIcon } from '@shopify/polaris-icons';



export async function loader({ request }: LoaderFunctionArgs) {
  // Here we can get ready-to-use data before component renders. For example in edit page we get data from db and fill the form with this data 
  // let formData = {
  //   title: 'Test edit data',
  //   slug: "Test edit data"
  // }

  // return json(formData);
  await authenticate.admin(request);

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  // Here we can create backend logic. For example adding data to sqlite with prisma or creating new product in shopify with graphql

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


const CreateKit = () => {
  // const testData = useLoaderData<typeof loader>()
  const [formData, setFormData] = useState({ title: "", slug: "" });
  const [selectedVar, setSelectedVar] = useState<any>([]);
  const [selectedAcc, setSelectedAcc] = useState<any>([]);

  const bundleData = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const shopify = useAppBridge();

  const showVariants = useCallback(async () => {
    try {
      const selected = await shopify.resourcePicker({
        type: 'variant',
        multiple: true,
        selectionIds: selectedVar.length > 0 ? selectedAcc.map((variant: any) => ({ id: variant.varId })) : []

      });
      console.log(selected);
      // Handle the selected product here
      const transformedVariants = selected?.map(transformVariantData);
      setSelectedVar(transformedVariants || []);
    } catch (error) {
      // Handle any errors that might occur
      console.error('Error picking variants:', error);
    }
  }, []);

  const showAccessories = useCallback(async () => {
    try {
      const selected = await shopify.resourcePicker({
        type: 'product',
        filter: {
          hidden: true,
          variants: true,
          draft: false,
          archived: false,
        },
        multiple: true,
        action: "select",
        selectionIds: selectedAcc.length > 0 ? selectedAcc.map((accessory: any) => ({ id: accessory.accId })) : []
      });
      // Handle the selected product here
      const transformedAccessories = selected?.map(transformAccessoryData);
      setSelectedAcc(transformedAccessories || [])
    } catch (error) {
      // Handle any errors that might occur
      console.error('Error picking accessories:', error);
    }
  }, []);

  const handleAction = () => {
    // This makes an post request to action
    const data = {
      formData,
      variants: selectedVar,
      accessories: selectedAcc,
    };

    const formDataToSend = new FormData();
    formDataToSend.append('data', JSON.stringify(data));

    fetcher.submit(formDataToSend, {
      method: 'post',
      encType: 'multipart/form-data',
      action: "/app"
    });

    shopify.toast.show("Bundle created");
  }

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setTimeout(() => navigate("/app"), 1000);
    }
  }, [fetcher.state, fetcher.data]);

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

          {!(selectedVar.length > 0) ?
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
                  <BlockStack gap="300">
                    <InlineGrid gap="200" alignItems="center" columns={2}>
                      <Text as='p' variant='bodyMd' fontWeight='bold'>
                        Variant
                      </Text>

                      <InlineGrid columns={2} gap="300" alignItems="center">
                        <InlineGrid columns={2} gap="300" alignItems="center">
                          <Text as='p' variant='bodyMd' fontWeight='bold'>
                            Quantity need
                          </Text>
                          <Text as='p' variant='bodyMd' fontWeight='bold'>
                            Price
                          </Text>
                        </InlineGrid>
                        <InlineGrid columns={2} gap="300" alignItems="center">
                          <Text as='p' variant='bodyMd' fontWeight='bold'>
                            Available
                          </Text>
                          <Text as='p' variant='bodyMd' fontWeight='bold'>
                            Action
                          </Text>
                        </InlineGrid>

                      </InlineGrid>
                    </InlineGrid>

                    {selectedVar.map((variant: any) => (
                      <InlineGrid key={variant.id} gap="200" alignItems="center" columns={2}>
                        <InlineStack gap="300" blockAlign='center'>
                          <Thumbnail
                            source="https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
                            size="large"
                            alt="Black choker necklace"
                          />
                          <BlockStack>
                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                              {variant.title}
                            </Text>
                            <Text variant="bodyMd" as="p">
                              {variant.displayName}
                            </Text>
                          </BlockStack>
                        </InlineStack>

                        <InlineGrid columns={2} gap="300" alignItems="center">
                          <InlineGrid columns={2} gap="300" alignItems="center">
                            <TextField
                              labelHidden
                              label="Quantity need"
                              autoComplete="off"
                              value="1"
                              type="number"
                            />
                            <Text as='p' variant='bodyMd' fontWeight='bold'>
                              $ {variant.price}
                            </Text>
                          </InlineGrid>
                          <InlineGrid columns={2} gap="300" alignItems="center">
                            <TextField
                              labelHidden
                              disabled
                              label="Total inventory quantity"
                              autoComplete="off"
                              value={variant.inventory}
                              type="number"
                            />
                            <Icon source={XIcon} />
                          </InlineGrid>

                        </InlineGrid>
                      </InlineGrid>

                    ))}
                  </BlockStack>
                  <InlineStack align="end">
                    <ButtonGroup>

                      <Button
                        icon={PlusIcon}
                        variant="primary"
                        onClick={showVariants}
                        accessibilityLabel="Create shipping label"
                      >
                        Add more variants
                      </Button>
                    </ButtonGroup>
                  </InlineStack>
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
            )
            :
            (
              <Layout.Section>
                <Card>
                  <BlockStack gap="300">
                    <InlineGrid gap="200" alignItems="center" columns={2}>
                      <Text as='p' variant='bodyMd' fontWeight='bold'>
                        Accessory
                      </Text>

                      <InlineGrid columns={2} gap="300" alignItems="center">
                        <InlineGrid columns={2} gap="300" alignItems="center">
                          <Text as='p' variant='bodyMd' fontWeight='bold'>
                            Quantity need
                          </Text>
                          <Text as='p' variant='bodyMd' fontWeight='bold'>
                            Price
                          </Text>
                        </InlineGrid>
                        <InlineGrid columns={2} gap="300" alignItems="center">
                          <Text as='p' variant='bodyMd' fontWeight='bold'>
                            Available
                          </Text>
                          <Text as='p' variant='bodyMd' fontWeight='bold'>
                            Action
                          </Text>
                        </InlineGrid>

                      </InlineGrid>
                    </InlineGrid>

                    {selectedAcc.map((accessory: any) => (
                      <InlineGrid key={accessory.id} gap="200" alignItems="center" columns={2}>
                        <InlineStack gap="300" blockAlign='center'>
                          <Thumbnail
                            source="https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
                            size="large"
                            alt="Black choker necklace"
                          />
                          <BlockStack>
                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                              {accessory.title}
                            </Text>
                            <Text variant="bodyMd" as="p">
                              {accessory.displayName}
                            </Text>
                          </BlockStack>
                        </InlineStack>

                        <InlineGrid columns={2} gap="300" alignItems="center">
                          <InlineGrid columns={2} gap="300" alignItems="center">
                            <TextField
                              labelHidden
                              label="Quantity need"
                              autoComplete="off"
                              value="1"
                              type="number"
                            />
                            <Text as='p' variant='bodyMd' fontWeight='bold'>
                              $ {accessory.price}
                            </Text>
                          </InlineGrid>
                          <InlineGrid columns={2} gap="300" alignItems="center">
                            <TextField
                              labelHidden
                              disabled
                              label="Total inventory quantity"
                              autoComplete="off"
                              value={accessory.totalInventory}
                              type="number"
                            />
                            <Icon source={XIcon} />
                          </InlineGrid>

                        </InlineGrid>
                      </InlineGrid>

                    ))}
                  </BlockStack>
                  <InlineStack align="end">
                    <ButtonGroup>

                      <Button
                        icon={PlusIcon}
                        variant="primary"
                        onClick={showAccessories}
                        accessibilityLabel="Create shipping label"
                      >
                        Add more accessories
                      </Button>
                    </ButtonGroup>
                  </InlineStack>
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