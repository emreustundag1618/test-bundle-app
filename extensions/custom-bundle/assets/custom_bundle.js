const baseUrl = "https://continued-clips-holidays-possibility.trycloudflare.com";

class CustomBundleApp extends HTMLElement {

    constructor() {
        super();
        this.shopifyDomain = "emre-development-store.myshopify.com";
        this.storefrontAccessToken = "2febbc203fcc4f4db6e40969eeafdb64"
        this._bundleData = []; // this will be all data to be fetched remix api
        this._shopifyData = []; // this will be all data to be fetched from shopify via storefront api
        this.transformedData = []; // this will include a list of variants to post cart/add for add to cart functionality {id: 123423423, quantity: 2}
        // TODO: transformedData will be mutated by selecting another variant which is fetched by clicking change color button and opening a modal to choose another variant.
        this.productId = this.dataset.product_id;
        this.endpoint = baseUrl + "/api/bundles?shopifyId=" + this.productId;

        this.style.fontSize = "14px";
        this.style.lineHeight = 1.2;

        this.modalOpen = false;
        console.log("Bundle product id: ", this.productId);
    }

    // TODO: change color functionality and fetch products all variants such as color

    async getBundleData() {
        const response = await fetch(this.endpoint);
        const result = await response.json();
        this._bundleData = result.data;
    }

    async connectedCallback() {
        // console.log("Custom element added to page.");
        await this.getBundleData();
        await this.getProductsAndVariantsFromShopify(this._bundleData.products.map(product => product.proId.split("/").pop()));
        this.renderBundle();
        document.getElementById('sensy-add-to-cart').addEventListener('click', () => this.addToCart(this._bundleData.products));

        console.log("Bundle data: ", this._bundleData)
        mutateData(this._bundleData, this.transformedData);
        console.log(this.transformedData)

        // test
        
    }

    async getProductsAndVariantsFromShopify(productIds) {
        const queryString = productIds.map(id => `id:${id}`).join(' OR ');
        const query = `
        {
            products(first: 10, query: "${queryString}") {
                edges {
                    node {
                        id
                        handle
                        productType
                        totalInventory
                        title
                        featuredImage {
                            id
                            url
                            altText
                        }
                        variants(first: 50) {
                            edges {
                                node {
                                    id
                                    availableForSale
                                    title
                                    image {
                                        altText
                                        id
                                        url
                                    }
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    quantityAvailable
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

        try {
            const response = await fetch(`https://${this.shopifyDomain}/api/2024-07/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken
                },
                body: JSON.stringify({ query })
            });

            const shopifyResult = await response.json();
            this.transformedData = transformShopifyData(shopifyResult.data.products.edges);
            console.log("Transformed data: ", this.transformedData);
        } catch (error) {
            console.error("Error while fetching products from shopify: ", error)
        }
    }

    renderBundle() {
        const yarnList = this._bundleData.products.filter(product => product.productType !== "accessories");
        const accessoryList = this._bundleData.products.filter(product => product.productType === "accessories");
        console.log("Yarn list: ", yarnList)
        console.log("Accessory list: ", accessoryList)
        this.innerHTML = `
            <div class="custom-bundle-app" id="custom-bundle-app">
                <h3 class="custom-bundle-title">Customize Your Pattern</h3>
                <div class="custom-bundle-products">
                    ${yarnList.length > 0 ? ` 
                        <div class="custom-variants">
                            <h4 class="custom-variants-title"> Select Yarns</h4>
                            <ul class="custom-variant-list">
                                ${this.renderProducts(yarnList)}
                            </ul>
                        </div>
                    ` : ``}
                    ${accessoryList.length > 0 ? `
                        <div class="custom-accessories">
                            <h4 class="custom-accessories-title"> Select Accessories</h4>
                            <ul class="custom-variant-list">
                                ${this.renderProducts(accessoryList)}
                            </ul>
                        </div>
                    ` : ""}
                </div>
                <div class="total-price">
                    <div class="total-price-label">Your price</div>
                    <div class="total-price-amount">$${this.getTotalPrice().toFixed(2).toString()}</div>
                </div>
                <div class="add-to-cart">
                    <button id="sensy-add-to-cart" type="submit">Add to cart</button>
                </div>
            </div>
        `


    }

    renderProducts(productList) {
        let productListHtml = "";
        productList.forEach(product => {
            product.variants.forEach(variant => {
                productListHtml += `
                                <li class="custom-list-item">
                                    <div class="custom-list-item-left">
                                    <div class="custom-bundle-product-image-container">
                                        ${variant.image || product.image ? `
                                        <img src="${variant.image || product.image}" alt="">
                                        ` : `
                                        <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M12.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path fill-rule="evenodd" d="M9.018 3.5h1.964c.813 0 1.469 0 2 .043.546.045 1.026.14 1.47.366a3.75 3.75 0 0 1 1.64 1.639c.226.444.32.924.365 1.47.043.531.043 1.187.043 2v1.964c0 .813 0 1.469-.043 2-.045.546-.14 1.026-.366 1.47a3.75 3.75 0 0 1-1.639 1.64c-.444.226-.924.32-1.47.365-.531.043-1.187.043-2 .043h-1.964c-.813 0-1.469 0-2-.043-.546-.045-1.026-.14-1.47-.366a3.75 3.75 0 0 1-1.64-1.639c-.226-.444-.32-.924-.365-1.47-.043-.531-.043-1.187-.043-2v-1.964c0-.813 0-1.469.043-2 .045-.546.14-1.026.366-1.47a3.75 3.75 0 0 1 1.639-1.64c.444-.226.924-.32 1.47-.365.531-.043 1.187-.043 2-.043Zm-1.877 1.538c-.454.037-.715.107-.912.207a2.25 2.25 0 0 0-.984.984c-.1.197-.17.458-.207.912-.037.462-.038 1.057-.038 1.909v1.428l.723-.867a1.75 1.75 0 0 1 2.582-.117l2.695 2.695 1.18-1.18a1.75 1.75 0 0 1 2.604.145l.216.27v-2.374c0-.852 0-1.447-.038-1.91-.037-.453-.107-.714-.207-.911a2.25 2.25 0 0 0-.984-.984c-.197-.1-.458-.17-.912-.207-.462-.037-1.056-.038-1.909-.038h-1.9c-.852 0-1.447 0-1.91.038Zm-2.103 7.821a7.12 7.12 0 0 1-.006-.08.746.746 0 0 0 .044-.049l1.8-2.159a.25.25 0 0 1 .368-.016l3.226 3.225a.75.75 0 0 0 1.06 0l1.71-1.71a.25.25 0 0 1 .372.021l1.213 1.516c-.021.06-.045.114-.07.165-.216.423-.56.767-.984.983-.197.1-.458.17-.912.207-.462.037-1.056.038-1.909.038h-1.9c-.852 0-1.447 0-1.91-.038-.453-.037-.714-.107-.911-.207a2.25 2.25 0 0 1-.984-.984c-.1-.197-.17-.458-.207-.912Z"></path></svg>
                                        ` }
                                    </div>
                                    <div class="product-info">
                                        <div class="variant-name">${variant.title}</div>
                                        <div class="product-name">${product.title}</div>
                                        ${variant.inventory === 0 ? `<span>Out of stock</span>` : ""}
                                        ${variant.quantityNeeded < variant.inventory ? `<span>In stock</span>` : ""}
                                    </div>
                                    </div>
                                    <div class="custom-list-item-right">
                                        <div class="quantity-label">QTY</div>
                                        <input type="number" label="QTY" value="${variant.quantityNeeded}" class="quantity-item">
                                        <div class="custom-price">x$${variant.price}</div>
                                    </div>
                                </li>
                            `
            })

        });
        return productListHtml
    }

    getTotalPrice() {
        let total = 0;
        this._bundleData.products.forEach(product => {
            product.variants.forEach(variant => {
                total += variant.price * variant.quantityNeeded
            })
        })
        return total
    }

    addToCart(products) {
        console.log('addToCart triggered')

        // TODO: If variant has no sales channel then variant not found error

        let formData = {
            'items': [
            ]
        }

        // Loop through each product and create a promise to add it to the cart
        products.forEach(product => {
            product.variants.forEach(variant => {
                // Check it has variant or product (because shopify has a weird structure when no variant in a product)
                if (variant.title !== "Default Title") { // then it has NO variant

                }
                formData.items.push({
                    'id': variant.varId.split('/').pop(),
                    'quantity': 1
                });
            });
        })

        console.log(formData)

        fetch('cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                return response.json();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    renderModal(productId) {

    }

}

customElements.define("sensy-custom-bundle", CustomBundleApp);

// Transform shopify data fetched from storefront api into clear one
function transformShopifyData(data) {
    return data.map(product => {
        return {
            id: product.node.id,
            handle: product.node.handle,
            title: product.node.title,
            totalInventory: product.node.totalInventory,
            featuredImage: product.node.featuredImage,
            productType: product.node.productType,
            variants: product.node.variants.edges.map(variant => variant.node)
        }
    })
}

function mutateData(bundle, transformedData){
    bundle.products.forEach(bundleProduct => {
        bundleProduct.variants.forEach(bundleVariant => {
            transformedData.forEach(transformedProduct => {
                if (transformedProduct.id === bundleProduct.proId) {
                    transformedProduct.variants.forEach(transformedVariant => {
                        if (transformedVariant.id === bundleVariant.varId) {
                            transformedVariant.quantityNeeded = bundleVariant.quantityNeeded;
                        }
                    });
                }
            });
        });
    });
}