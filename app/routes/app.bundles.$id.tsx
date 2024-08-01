import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node"
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { BlockStack, Card, EmptyState, FormLayout, Layout, Page, TextField, Text, InlineGrid, InlineStack, Thumbnail, Icon, ButtonGroup, Button } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { getBundleById, updateBundle } from "~/models/Bundle.server";
import { Bundle } from "~/interfaces/bundle";
import { transformData } from "~/utils/transform";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import ProductList from "~/components/ProductList";

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
    const selectedIds = (bundle.products.length > 0) ? bundle.products.map((product: any) => ({ id: product.proId, variants: product.variants.map((variant: any) => ({ id: variant.varId })) })) : [];

    // TODO: ---- Extract state logic into a reducer with useReducer and useContext hook for better modularity and readability. See: https://react.dev/learn/scaling-up-with-reducer-and-context

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

            // Set bundle state if there is only selectedProducts
            if (selectedProducts) {
                console.log("selected products", selectedProducts)
                // Here uses the nullish coalescing operator (??) to provide an empty array if selectedProducts is undefined or null. Maybe not necessary
                const transformedProducts = (selectedProducts ?? []).map(transformData);
                console.log("Transformed Products ================", transformedProducts);
                setBundle({ ...bundle, products: transformedProducts });
            }
        } catch (error) {
            console.error('Error picking products from Shopify:', error);
        }
    };

    const handleAction = () => {

        const formDataToSend = new FormData();
        formDataToSend.append('data', JSON.stringify(bundle));

        fetcher.submit(formDataToSend, {
            method: 'post',
            encType: 'multipart/form-data'
        });

        shopify.toast.show("Bundle saved");
    }

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
                            <ProductList bundle={bundle} onQuantityChange={handleQuantityChange} onSelectProducts={selectProducts}/>
                        )
                    }
                </Layout>
            </BlockStack>
        </Page>
    )
}

export default BundleDetail