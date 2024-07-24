import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate, useSubmit } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { EmptyState, Page, Layout, BlockStack, Card, Text, TextField, FormLayout, ResourceList, ResourceItem, Avatar, Thumbnail, InlineStack, Bleed, InlineGrid, Icon, ButtonGroup, Button } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { createBundle, getBundleById, updateBundle, deleteBundle } from '~/models/Bundle.server';
import { transformData } from '~/utils/transform';
import { XIcon, PlusIcon } from '@shopify/polaris-icons';
import { Bundle } from '~/interfaces/bundle';
import { authenticate } from '~/shopify.server';
import { Product } from '~/interfaces/product';

export async function loader({ request }: LoaderFunctionArgs) {
  // Here we can get ready-to-use data before component renders. For example in edit page we get data from db and fill the form with this data 

  await authenticate.admin(request);

  return null;
}

// export async function action({request}: ActionFunctionArgs) {

//   const formData = await request.formData();
//   console.log("FORM DATA ============================>", formData)
//   // JSON object of formData
//   const dataEntry = formData.get('data');
//   console.log("DATA ENTRY ============================>", dataEntry)

//   if (typeof dataEntry === 'string') {
//     const data = JSON.parse(dataEntry);

//     // Process the data, e.g., save to database
//     await createBundle(data);

//     return json(data);
//   } else {
//     throw new Error("Invalid form data");
//   }
// }


const CreateKit = () => {
  const [bundle, setBundle] = useState<Bundle>({ id: "", title: "", slug: "", products: [] });
  const selectedIds = (bundle.products.length > 0) ? bundle.products.map((product: any) => ({ id: product.proId, variants: product.variants.map((variant: any) => ({ id: variant.varId })) })) : [];


  const fetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const selectProducts = async () => {
    try {
      const selectedProducts = await shopify.resourcePicker({
        type: 'product',
        filter: {
          hidden: true,
          variants: true,
          draft: false,
          archived: false,
        },
        multiple: true,
        action: "select",
        selectionIds: selectedIds
      });


      // Here uses the nullish coalescing operator (??) to provide an empty array if selectedProducts is undefined or null.
      if (selectedProducts) {
        const transformedProducts = (selectedProducts ?? []).map(transformData);
        setBundle({ ...bundle, products: transformedProducts });
      }
      // TODO: productlar ilk seçimde bundle ı set etmeden önce component render oluyor.. Neden?
    } catch (error) {
      console.error('Error picking products from Shopify:', error);
    }
  };

  const handleAction = () => {

    const formDataToSend = new FormData();
    formDataToSend.append('data', JSON.stringify(bundle));

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

  // TODO: Component will be renewed


  return (
    // TODO: handleAction passing not calling will be tried on action
    <Page
      title="Create new kit"
      backAction={{ url: '/app' }}
      primaryAction={{ content: "Save", disabled: false, onAction: () => handleAction() }}
    >
      <BlockStack gap="500">
        <Text as="p">
          Create a variation kit to sell products together through a pattern product. Select yarn variants and accessories with default features to make the pattern complete.
        </Text>
        {/* Title and slug of create kit page */}
        <Card>
          <FormLayout>
            <TextField
              label="Title"
              placeholder='Pattern Product Title'
              name="title"
              value={bundle.title}
              onChange={(value) => setBundle({ ...bundle, title: value })}
              autoComplete="off"
            />
            <TextField
              label="Slug"
              placeholder="A Unique Slug"
              name="slug"
              value={bundle.slug}
              onChange={(value) => setBundle({ ...bundle, slug: value })}
              autoComplete="off"
            />
          </FormLayout>
        </Card>

        {/* Empty state */}
        {!(bundle.products.length > 0) ? (
          <Card>
            <EmptyState
              image={'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
              action={{
                content: 'Select products',
                onAction: selectProducts
              }}>
              <Text as="p" variant='bodyMd'>Select products you want to add to kit</Text>
            </EmptyState>
          </Card>
        ) : (
          <Card>
            <BlockStack gap="300">
              <InlineGrid gap="200" alignItems="center" columns={2}>
                <Text as='p' variant='bodyMd' fontWeight='bold'>
                  Product
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

              {bundle.products.map((product: Product) => (
                <InlineGrid key={product.id} gap="200" alignItems="center" columns={2}>
                  <InlineStack gap="300" blockAlign='center'>
                    <Thumbnail
                      source="https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
                      size="large"
                      alt="Black choker necklace"
                    />
                    <BlockStack>
                      <Text variant="bodyMd" fontWeight="bold" as="h3">
                        {product.title}
                      </Text>
                      {(product.variants.length > 0) && product.variants.map(variant => (
                        <div>{variant.title}</div>
                      ))}
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
                        $ {product.price}
                      </Text>
                    </InlineGrid>
                    <InlineGrid columns={2} gap="300" alignItems="center">
                      <TextField
                        labelHidden
                        disabled
                        label="Total inventory quantity"
                        autoComplete="off"
                        value={String(product.totalInventory)}
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
                  onClick={selectProducts}
                  accessibilityLabel="Reselect products"
                >
                  Re-select Products
                </Button>
              </ButtonGroup>
            </InlineStack>
          </Card>
        )}


      </BlockStack>

    </Page>
  )
}

export default CreateKit