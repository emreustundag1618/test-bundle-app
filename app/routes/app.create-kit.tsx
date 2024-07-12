import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate, useSubmit } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { EmptyState, Page, Layout, BlockStack, Card, Text, TextField, FormLayout, ResourceList, ResourceItem, Avatar, Thumbnail, InlineStack, Bleed, InlineGrid, Icon, ButtonGroup, Button } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { createBundle, getBundleById, updateBundle, deleteBundle } from '~/models/Bundle.server';
import { transformVariantData, transformAccessoryData } from '~/utils/transform';
import { XIcon, PlusIcon } from '@shopify/polaris-icons';



const CreateKit = () => {
  const [formData, setFormData] = useState({ id: "", title: "", slug: "", products: [] });


  return (
    <Page
      title="Create new kit"
      backAction={{ url: '/app' }}
      primaryAction={{ content: "Save", disabled: false, onAction: () => { } }}
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
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              autoComplete="off"
            />
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

        {/* Empty state */}
        {!(formData.products.length > 9) ? (
          <Card>
            <EmptyState
              image={'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
              action={{
                content: 'Select products',
                onAction: (() => { })
              }}>
              <Text as="p" variant='bodyMd'>Select products you want to add to kit</Text>
            </EmptyState>
          </Card>
        ) : (
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

              {formData.products.map((variant: any) => (
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
        )}


      </BlockStack>

    </Page>
  )
}

export default CreateKit