import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { createBundle, deleteBundle } from "~/models/Bundle.server";
import { createBundleOnShopify } from "~/actions/createBundleOnShopify";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const dataEntry = formData.get('data');

  if (request.method === "POST") {
    if (typeof dataEntry === 'string') {
      const data = JSON.parse(dataEntry);
      console.log("Created bundle data=============:", data);

      
      const responseJson = await createBundleOnShopify(data, admin);
      const shopifyId = JSON.parse(JSON.stringify(responseJson)).data.productCreate.product.id;
      data.shopifyId = shopifyId
      await createBundle(data);

      return json(data);
    } else {
      throw new Error("Invalid form data");
    }
  } else if (request.method === "DELETE") {
    const bundleId = formData.get("bundleId");
    try {
      await deleteBundle(bundleId);
      return json({ message: 'Bundle deleted' });
    } catch (error) {
      console.error("Error deleting bundle", error);
      return json({ error: 'Failed to delete bundle' }, { status: 500 });
    }
  }

}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Home</Link>
        <Link to="/app/create-kit">Create a kit</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
