import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Card, EmptyState, FormLayout, Layout, Page, TextField, Text, InlineGrid, InlineStack, Thumbnail, Icon } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { getBundleById } from "~/models/Bundle.server";
import { transformAccessoryData, transformVariantData } from "~/utils/transform";
import { XIcon } from '@shopify/polaris-icons';

export async function loader({ params }: LoaderFunctionArgs) {

    const bundle = await getBundleById(params.id);

    return json(bundle)
}


const BundleDetail = () => {
    const bundle = useLoaderData<any>();
    const [formData, setFormData] = useState({ title: "", slug: "" });
    const [variants, setVariants] = useState<any>([]);
    const [accessories, setAccessories] = useState<any>([]);

    useEffect(() => {
        setFormData({ title: bundle.title, slug: bundle.slug });
        setVariants(bundle.variants);
        setAccessories(bundle.accessories);
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

    return (
        <Page title={bundle.title}>
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

                                        {variants.map((variant: any) => (
                                            <InlineGrid gap="200" alignItems="center" columns={2}>
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