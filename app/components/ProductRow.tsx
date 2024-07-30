import { BlockStack, InlineGrid, InlineStack, Thumbnail, Text, TextField, Icon, Button } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';

const ProductRow = ({ product, variant, onQuantityChange }: any) => {
    return (
        <InlineGrid key={product.id} gap="200" alignItems="center" columns={['oneThird', 'twoThirds']}>
            <InlineStack gap="300" blockAlign='center' wrap={false}>
                <BlockStack>
                    <Thumbnail
                        source={variant.image || product.image || ImageIcon}
                        size="large"
                        alt="Black choker necklace"
                    />
                </BlockStack>
                <BlockStack>
                    <Text variant="bodyMd" fontWeight="bold" as="h3">{product.title}</Text>
                    <Text variant="bodyMd" as="h4">{variant.title}</Text>
                </BlockStack>
            </InlineStack>

            <InlineGrid columns={4} gap="300" alignItems="center">
                <Text as='p' variant='bodyMd' alignment="center">{product.productType}</Text>
                <TextField
                    labelHidden
                    label="Quantity need"
                    autoComplete="off"
                    value={String(variant.quantityNeeded)}
                    type="number"
                    onChange={(value) => onQuantityChange(parseInt(value), variant.id)}
                />
                <Text as='p' variant='bodyMd' fontWeight='bold' alignment="center">$ {variant.price}</Text>
                <TextField
                    labelHidden
                    disabled
                    label="Total inventory quantity"
                    autoComplete="off"
                    value={String(variant.inventory)}
                    type="number"
                />

            </InlineGrid>
        </InlineGrid>
    )
}

export default ProductRow