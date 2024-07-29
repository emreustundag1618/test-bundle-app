// TODO: A REST API to theme app extensions and admin UI extensions
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { cors } from 'remix-utils/cors';
import { getBundleByShopifyId } from "~/models/Bundle.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const bundleShopifyID = url.searchParams.get("shopifyId");
  
    if(!bundleShopifyID) {
      return json({
        message: "Missing Shopify product ID.",
        method: "GET"
      });
    }

    const bundle = await getBundleByShopifyId(bundleShopifyID);
  
    const response = json({
      ok: true,
      message: "Success",
      data: bundle,
    });
  
    return cors(request, response);
  }