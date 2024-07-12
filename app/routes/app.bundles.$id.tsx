import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react";
import { BlockStack, Card, EmptyState, FormLayout, Layout, Page, TextField, Text, InlineGrid, InlineStack, Thumbnail, Icon, ButtonGroup, Button } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { getBundleById, updateBundle } from "~/models/Bundle.server";
import { transformAccessoryData, transformVariantData } from "~/utils/transform";
import { isDifferent } from "~/utils/isDifferent";
import { XIcon, PlusIcon } from '@shopify/polaris-icons';

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
    const bundle = useLoaderData<any>();
    const [formData, setFormData] = useState({ title: bundle.title, slug: bundle.slug });
    const [variants, setVariants] = useState<any>(bundle.variants);
    const [accessories, setAccessories] = useState<any>(bundle.accessories);
    const [isChanged, setIsChanged] = useState(false)

    const fetcher = useFetcher();

    useEffect(() => {
    }, [bundle]);

    const showVariants = useCallback(async () => {
        try {
            const selected = await shopify.resourcePicker({ type: 'variant', multiple: true });
            // Handle the selected product here
            const transformedVariants = selected?.map(transformVariantData);
            setVariants(transformedVariants || []);
        } catch (error) {
            // Handle any errors that might occur
            console.error('Error picking variants:', error);
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
            const transformedAccessories = selected?.map(transformAccessoryData);
            setAccessories(transformedAccessories || [])
        } catch (error) {
            // Handle any errors that might occur
            console.error('Error picking accessories:', error);
        }
    }, []);

    const handleAction = () => {
        // This makes an post request to action
        const data = {
            formData,
            variants,
            accessories,
        };

        console.log("DATA TO SEND ==============================>", data)

        const formDataToSend = new FormData();
        formDataToSend.append('data', JSON.stringify(data));

        fetcher.submit(formDataToSend, {
            method: 'post',
            encType: 'multipart/form-data',
        });

        shopify.toast.show("Bundle updated");
    }

    const handleVariantsChange = (value: any, variantId: any) => {
        const newVariants = variants.map((variant: any) =>
            variant.id === variantId ? { ...variant, quantityNeeded: parseInt(value) } : variant
        );
        setVariants(newVariants);
    };

    const handleAccessoriesChange = (value: any, accessoryId: any) => {
        const newAccessories = accessories.map((accessory: any) =>
            accessory.id === accessoryId ? { ...accessory, quantityNeeded: parseInt(value) } : accessory
        );
        setAccessories(newAccessories);
    };

    return (
        <Page
            title={bundle.title}
            backAction={{ url: '/app' }}
            primaryAction={{ content: "Save", disabled: false, onAction: () => handleAction() }}
        >
            <BlockStack>
                <Layout>
                    <Layout.Section>
                        <Card padding="500">
                            <FormLayout>
                                <TextField
                                    label="Title"
                                    placeholder='Pattern Product Title'
                                    name="title"
                                    value={formData.title}
                                    onChange={(value) => setFormData({ ...formData, title: value })}
                                    autoComplete="off" />
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
                    {!(variants.length > 0) ?
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

                                        {variants.map((variant: any, index: any) => (
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
                                                            value={variant.quantityNeeded}
                                                            type="number"
                                                            onChange={(value) => handleVariantsChange(value, variant.id)}
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
                                                onClick={() => { }}
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
                    {!(accessories.length > 0) ?
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

                                        {accessories.map((accessory: any) => (
                                            <InlineGrid gap="200" alignItems="center" columns={2}>
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
                                                            value={accessory.quantityNeeded}
                                                            type="number"
                                                            onChange={(value) => handleAccessoriesChange(value, accessory.id)}
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
                                                onClick={() => { }}
                                                accessibilityLabel="Create shipping label"
                                            >
                                                Add more accessories                                            </Button>
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