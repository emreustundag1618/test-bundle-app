import { BlockStack, Button, ButtonGroup, Card, Icon, InlineGrid, InlineStack, Layout, Text, TextField, Thumbnail } from "@shopify/polaris"
import { XIcon, PlusIcon } from '@shopify/polaris-icons';
import ProductRow from "./ProductRow";


const ProductList = ({ bundle, onQuantityChange, onSelectProducts, onRemoveProduct }: any) => {
    return (
        <Layout.Section>
            <Card>
                <BlockStack gap="300">
                    <InlineGrid gap="200" columns={['oneThird', 'twoThirds']}>
                        <Text as='p' variant='bodyMd' fontWeight='bold'>Product</Text>
                        <InlineGrid columns={5} gap="300" alignItems="center">
                            <Text as='p' variant='bodyMd' fontWeight='bold' alignment="center">Type</Text>
                            <Text as='p' variant='bodyMd' fontWeight='bold' alignment="center">Quantity need</Text>
                            <Text as='p' variant='bodyMd' fontWeight='bold' alignment="center">Price</Text>
                            <Text as='p' variant='bodyMd' fontWeight='bold' alignment="center">Available</Text>
                            <Text as='p' variant='bodyMd' fontWeight='bold' alignment="center">Action</Text>
                        </InlineGrid>
                    </InlineGrid>

                    {bundle.products.map((product: any) => product.variants.map((variant: any) => (
                        <ProductRow key={variant.id} product={product} variant={variant} onQuantityChange={onQuantityChange} onRemoveProduct={onRemoveProduct}/>
                    )))}
                </BlockStack>
                <InlineStack align="end">
                    <ButtonGroup>
                        <Button
                            icon={PlusIcon}
                            variant="primary"
                            onClick={onSelectProducts}
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

export default ProductList