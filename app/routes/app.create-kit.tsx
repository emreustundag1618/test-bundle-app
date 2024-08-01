import { LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useNavigate, } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { EmptyState, Page, Layout, BlockStack, Card, Text, TextField, FormLayout } from '@shopify/polaris';
import { useEffect, useState } from 'react';
import { transformData } from '~/utils/transform';
import { Bundle } from '~/interfaces/bundle';
import { authenticate } from '~/shopify.server';
import ProductList from '~/components/ProductList';

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
  const [bundle, setBundle] = useState<Bundle>({ id: "", shopifyId: "", title: "", slug: "", products: [] });
  const selectedIds = (bundle.products.length > 0) ? bundle.products.map((product: any) => ({ id: product.proId, variants: product.variants.map((variant: any) => ({ id: variant.varId })) })) : [];


  const fetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const selectProducts = async () => {
    try {
      const selectedProducts = await shopify.resourcePicker({
        type: 'product',
        filter: {
          hidden: false,
          variants: true,
          draft: false,
          archived: false,
        },
        multiple: true,
        action: "select",
        selectionIds: selectedIds
      });
      console.log("Selected Products ================", selectedProducts);


      // Here uses the nullish coalescing operator (??) to provide an empty array if selectedProducts is undefined or null.
      if (selectedProducts) {
        const transformedProducts = (selectedProducts ?? []).map(transformData);
        console.log("Transformed Products ================", transformedProducts);
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

    shopify.toast.show(`Bundle "${bundle.title}" created.`);
  }

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setTimeout(() => navigate("/app"), 1000);
    }
  }, [fetcher.state, fetcher.data]);

  // TODO: Component will be renewed

  const handleQuantityChange = (value: number, variantId: string) => {
    if (value > 0) {
      const nextBundle = {
        ...bundle,
        products: bundle.products.map(product => {
          return {
            ...product,
            variants: product.variants.map(variant => {
              if (variant.id === variantId) {
                return {
                  ...variant,
                  quantityNeeded: value
                }
              } else {
                return variant
              }

            })
          }
        })
      }
      setBundle(nextBundle);
    } else {
      return
    }

  };


  return (
    // TODO: handleAction passing not calling will be tried on action
    <Page
      title="Create new kit"
      backAction={{ url: '/app' }}
      primaryAction={{ content: "Save", disabled: false, onAction: () => handleAction() }}
    >
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Text as="p">
              Create a variation kit to sell products together through a pattern product. Select yarn variants and accessories with default features to make the pattern complete.
            </Text>
          </Layout.Section>
          {/* Title and slug of create kit page */}
          <Layout.Section>
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
          </Layout.Section>
        </Layout>


        <Layout>
          {/* Empty state */}
          {!(bundle.products.length > 0) ? (
            <Layout.Section>
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
            </Layout.Section>
          ) : (
            <ProductList bundle={bundle} onQuantityChange={handleQuantityChange} onSelectProducts={selectProducts} />
          )}

        </Layout>
      </BlockStack>

    </Page>
  )
}

export default CreateKit