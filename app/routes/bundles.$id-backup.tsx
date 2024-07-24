import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node"
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { BlockStack, Card, EmptyState, FormLayout, Layout, Page, TextField, Text, InlineGrid, InlineStack, Thumbnail, Icon, ButtonGroup, Button } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { deleteBundle, getBundleById, updateBundle } from "~/models/Bundle.server";
import { isDifferent } from "~/utils/isDifferent";
import { XIcon, PlusIcon } from '@shopify/polaris-icons';
import { Bundle } from "~/interfaces/bundle";
import { Product } from "~/interfaces/product";
import { transformData } from "~/utils/transform";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";

export async function loader({ params }: LoaderFunctionArgs) {

    const bundle = await getBundleById(params.id);

    return json(bundle);

}

export async function action({ request, params }: ActionFunctionArgs) {

    const formData = await request.formData();
    const dataEntry = formData.get('data');
    const bundleId = params.id;

    if (typeof dataEntry === "string") {
        const data = JSON.parse(dataEntry);
        console.log(data)

        updateBundle(bundleId, data);
    } else {
        throw new Error("Invalid form data when updating the bundle");
    }

    return json({})
}


const BundleDetail = () => {
    const bundleData = useLoaderData<Bundle>();

    const [bundle, setBundle] = useState<Bundle>(bundleData);
    // TODO: --- There is a bug when reselecting products. If user clicks re-select button again 
    // TODO: --- without saving the bundle the old selections will come because of selectedIds not updated. Look at State Snapshot in React!
    const selectedIds = (bundle.products.length > 0) ? bundle.products.map((product: any) => ({ id: product.proId, variants: product.variants.map((variant: any) => ({ id: variant.varId })) })) : [];
    console.log(selectedIds);

    // TODO: ---- Extract state logic into a reducer with useReducer and useContext hook for better modularity and readability. See: https://react.dev/learn/scaling-up-with-reducer-and-context

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

            console.log("Selected Products ================", selectedProducts);

            // TODO: Problem!!! It seems updating nested object will be the solution


            // Set bundle state if there is only selectedProducts
            if (selectedProducts) {
                console.log("selected products", selectedProducts)
                // Here uses the nullish coalescing operator (??) to provide an empty array if selectedProducts is undefined or null. Maybe not necessary
                const transformedProducts = (selectedProducts ?? []).map(transformData);
                console.log("Transformed Products ================", transformedProducts);
                setBundle({ ...bundle, products: transformedProducts });
            }
            // TODO: There is a bug after one of the selected variant (not product) removed by checkbox, removed ones are adding to the product list
            // TODO: productlar ilk seçimde bundle ı set etmeden önce component render oluyor.. Neden?
            // TODO: bundle title setChange edildikten sonra selectProducts useCallback i çağrıldığında title eski şekline dönüyor neden??
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

        shopify.toast.show("Bundle saved");
    }

    // const handleVariantsChange = (value: any, variantId: any) => {
    //     const newVariants = variants.map((variant: any) =>
    //         variant.id === variantId ? { ...variant, quantityNeeded: parseInt(value) } : variant
    //     );
    //     setVariants(newVariants);
    // };

    const handleQuantityChange = (value: number, productId: string) => {
    };

    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data) {
            setTimeout(() => navigate("/app"), 1000);
        }
    }, [fetcher.state, fetcher.data]);

    const handleDelete = async (id: any) => {
        const formDataToSend = new FormData();
        formDataToSend.append('bundleId', id);

        fetcher.submit(formDataToSend, {
            method: 'delete',
            action: "/app"
        });

        shopify.toast.show("Bundle deleted");
    }

    // TODO: Component will be renewed
    return (
        <Page
            title={bundle.title}
            backAction={{ url: '/app' }}
            primaryAction={{ content: "Save", disabled: false, onAction: () => handleAction() }}
            secondaryActions={[
                {
                    content: 'Delete',
                    destructive: false,
                    onAction: () => { shopify.modal.show('delete-modal') }
                },
            ]}
        >
            <Modal id="delete-modal">
                <div style={{ padding: "10px" }}>
                    <Text as="p">Are you sure to delete this bundle?</Text>
                </div>

                <TitleBar title="Delete bundle">
                    <button variant="primary" onClick={() => handleDelete(bundle.id)}>Yes</button>
                    <button onClick={() => shopify.modal.hide('delete-modal')}>No</button>
                </TitleBar>
            </Modal>
            <BlockStack>
                <Layout>
                    <Layout.Section>
                        <Card padding="500">
                            <FormLayout>
                                <TextField
                                    label="Title"
                                    placeholder='Pattern Product Title'
                                    name="title"
                                    value={bundle.title}
                                    onChange={(value) => setBundle({ ...bundle, title: value })}
                                    autoComplete="off" />
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
                    {!(bundle.products.length > 0) ?
                        (
                            <Layout.Section>
                                <Card>
                                    <EmptyState
                                        image={'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                                        action={{ content: 'Select variants', onAction: selectProducts }}
                                    >
                                        <Text as="p" variant='bodyMd'>Select products or product variants you want to add to kit</Text>
                                    </EmptyState>
                                </Card>
                            </Layout.Section>
                        )
                        :
                        (
                            <Layout.Section>
                                <Card>
                                    <BlockStack gap="300">
                                        <InlineGrid gap="200" columns={['oneThird', 'twoThirds']}>
                                            <Text as='p' variant='bodyMd' fontWeight='bold'>
                                                Product
                                            </Text>

                                            <InlineGrid columns={5} gap="300" alignItems="end">
                                                <Text as='p' variant='bodyMd' fontWeight='bold'>
                                                    Type
                                                </Text>

                                                <Text as='p' variant='bodyMd' fontWeight='bold'>
                                                    Quantity need
                                                </Text>
                                                <Text as='p' variant='bodyMd' fontWeight='bold'>
                                                    Price
                                                </Text>

                                                <Text as='p' variant='bodyMd' fontWeight='bold'>
                                                    Available
                                                </Text>
                                                <Text as='p' variant='bodyMd' fontWeight='bold'>
                                                    Action
                                                </Text>


                                            </InlineGrid>
                                        </InlineGrid>

                                        {bundle.products.map((product: any) =>
                                            
                                                (
                                                    <InlineGrid key={product.id} gap="200" alignItems="center" columns={['oneThird', 'twoThirds']}>
                                                        <InlineStack gap="300" blockAlign='center' wrap={false}>
                                                            <BlockStack>
                                                                <Thumbnail
                                                                    source="https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
                                                                    size="large"
                                                                    alt="Black choker necklace"
                                                                />
                                                            </BlockStack>
                                                            <BlockStack>
                                                                <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                                    {product.title}
                                                                </Text>
                                                                {(product.variants.length > 0) && product.variants.map((variant: any) => (
                                                                    <div>{variant.title}</div>
                                                                ))}
                                                            </BlockStack>
                                                        </InlineStack>

                                                        <InlineGrid columns={5} gap="300" alignItems="center">
                                                            <Text as='p' variant='bodyMd'>
                                                                {product.productType}
                                                            </Text>

                                                            <TextField
                                                                labelHidden
                                                                label="Quantity need"
                                                                autoComplete="off"
                                                                value={String(product.quantityNeeded)}
                                                                type="number"
                                                                onChange={(value) => handleQuantityChange(parseInt(value), product.id)}
                                                            />
                                                            <Text as='p' variant='bodyMd' fontWeight='bold'>
                                                                $ {product.price}
                                                            </Text>


                                                            <TextField
                                                                labelHidden
                                                                disabled
                                                                label="Total inventory quantity"
                                                                autoComplete="off"
                                                                value={String(product.inventory)}
                                                                type="number"
                                                            />
                                                            <Icon source={XIcon} />

                                                        </InlineGrid>
                                                    </InlineGrid>
                                                )
                                            )
                                        }
                                    </BlockStack>
                                    <InlineStack align="end">
                                        <ButtonGroup>

                                            <Button
                                                icon={PlusIcon}
                                                variant="primary"
                                                onClick={selectProducts}
                                                accessibilityLabel="Create shipping label"
                                            >
                                                Re-select Products
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

export default BundleDetail