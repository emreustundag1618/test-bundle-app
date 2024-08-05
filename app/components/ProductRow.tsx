import { BlockStack, InlineGrid, InlineStack, Thumbnail, Text, TextField, Icon, Button, Link } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';
import { getVariantUrl } from '~/utils/getVariantUrl';


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
                    <Link target="_blank" url={getVariantUrl(product)} removeUnderline monochrome>{product.title}</Link>
                    <Link target="_blank" url={getVariantUrl(product, variant)} removeUnderline monochrome>{variant.title}</Link>
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