const baseUrl = "https://orientation-cable-controls-gained.trycloudflare.com";

class CustomBundleApp extends HTMLElement {

    constructor() {
        super();
        this.shopifyDomain = "emre-development-store.myshopify.com";
        this.storefrontAccessToken = "2febbc203fcc4f4db6e40969eeafdb64"
        this._bundleData = []; // this will be all data to be fetched remix api
        this.transformedData = []; // this will include a list of variants to post cart/add for add to cart functionality
        this.variantList = []; // this will include a list of variants to post cart/add for add to cart functionality 
        // {id: variantId, quantity: selectedQuantity, quantityNeeded: neededQuantity, inventory: availableForSale}
        this.quantityNeeded = {};
        // TODO: transformedData will be mutated by selecting another variant which is fetched by clicking change color button and opening a modal to choose another variant.
        this.productId = this.dataset.product_id;
        this.endpoint = baseUrl + "/api/bundles?shopifyId=" + this.productId;

        this.style.fontSize = "14px";
        this.style.lineHeight = 1.2;

        this.selectedProductId = "";
        this.selectedVariantId = "";
        this.selectedVariantIndex = 0;
        this.selectedProductType = "";
        this.modal = "";
        this.modalOpen = false;
    }

    async getBundleData() {
        const response = await fetch(this.endpoint);
        const result = await response.json();
        this._bundleData = result.data;
        const groupedVariants = this._bundleData.products.reduce((acc, product) => {
            const variants = product.variants.map(variant => ({
                varId: variant.varId.split('/').pop(),
                proId: product.proId.split('/').pop(),
                quantity: variant.quantityNeeded,
                needed: variant.quantityNeeded,
                inventory: variant.inventory,
                productType: product.productType,
                varImg: variant.image,
                proImg: product.image,
                proTitle: product.title,
                varTitle: variant.title,
                price: variant.price
            }));

            // Group into "accessories" and "others"
            variants.forEach(variant => {
                const group = variant.productType === 'accessories' ? 'accessories' : 'others';
                if (!acc[group]) {
                    acc[group] = [];
                }
                acc[group].push(variant);
            });

            return acc;
        }, {});

        console.log("This bundle data: ", this._bundleData)

        // Setting the grouped variants
        this.setVariantList(groupedVariants);
    }

    async connectedCallback() {
        // console.log("Custom element added to page.");
        await this.getBundleData();
        await this.getProductsAndVariantsFromShopify(this._bundleData.products.map(product => product.proId.split("/").pop()));
        this.renderBundle();
        mutateData(this._bundleData, this.transformedData);
        console.log("Transformed data(mutated): ", this.transformedData);
        // initialize modal
        this.initializeModal();
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
        } catch (error) {
            console.error("Error while fetching products from shopify: ", error)
        }
    }

    renderBundle() {

        this.innerHTML = `
            <div class="custom-bundle-app" id="custom-bundle-app">
                <h3 class="custom-bundle-title">Customize Your Pattern</h3>
                <div class="custom-bundle-products">
                ${this.variantList.others.length > 0 ? `
                <div class="custom-variants">
                            <h4 class="custom-variants-title"> Select Yarns</h4>
                            <ul class="custom-variant-list">
                                ${this.renderProducts(this.variantList.others)}
                            </ul>
                        </div>
                ` : ``}
                ${this.variantList.accessories.length > 0 ? `
                <div class="custom-accessories">
                            <h4 class="custom-accessories-title"> Select Accessories</h4>
                            <ul class="custom-variant-list">
                                ${this.renderProducts(this.variantList.accessories)}
                            </ul>
                        </div>
                ` : ``}   
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

        document.getElementById('sensy-add-to-cart').addEventListener('click', () => this.addToCart(this.variantList));

        const changeColorButtons = document.querySelectorAll('.custom-bundle-change-color');
        changeColorButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.modal.style.display = 'block';
                this.selectedVariantId = e.target.dataset.varId;
                this.selectedProductId = e.target.parentElement.dataset.proId;
                this.selectedVariantIndex = e.target.dataset.variantIndex;

                this.updateModalContent()
            })
        });

        const quantityItems = document.querySelectorAll('.quantity-item');
        quantityItems.forEach(input => {
            input.addEventListener('change', (e) => {
                this.selectedProductType = e.target.dataset.type;
                this.handleQuantityChange(e.target.dataset.index, Number(e.target.value));
            })
        })
    }

    renderProducts(variantList) {
        let variantListHtml = "";
        variantList.forEach((variant, index) => {
            variantListHtml += `
                                <li class="custom-list-item">
                                    <div class="custom-list-item-left">
                                    <div class="custom-bundle-product-image-container">
                                        ${variant.varImg || variant.proImg ? `
                                        <img src="${variant.varImg || variant.proImg}" alt="">
                                        ` : `
                                        <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M12.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path fill-rule="evenodd" d="M9.018 3.5h1.964c.813 0 1.469 0 2 .043.546.045 1.026.14 1.47.366a3.75 3.75 0 0 1 1.64 1.639c.226.444.32.924.365 1.47.043.531.043 1.187.043 2v1.964c0 .813 0 1.469-.043 2-.045.546-.14 1.026-.366 1.47a3.75 3.75 0 0 1-1.639 1.64c-.444.226-.924.32-1.47.365-.531.043-1.187.043-2 .043h-1.964c-.813 0-1.469 0-2-.043-.546-.045-1.026-.14-1.47-.366a3.75 3.75 0 0 1-1.64-1.639c-.226-.444-.32-.924-.365-1.47-.043-.531-.043-1.187-.043-2v-1.964c0-.813 0-1.469.043-2 .045-.546.14-1.026.366-1.47a3.75 3.75 0 0 1 1.639-1.64c.444-.226.924-.32 1.47-.365.531-.043 1.187-.043 2-.043Zm-1.877 1.538c-.454.037-.715.107-.912.207a2.25 2.25 0 0 0-.984.984c-.1.197-.17.458-.207.912-.037.462-.038 1.057-.038 1.909v1.428l.723-.867a1.75 1.75 0 0 1 2.582-.117l2.695 2.695 1.18-1.18a1.75 1.75 0 0 1 2.604.145l.216.27v-2.374c0-.852 0-1.447-.038-1.91-.037-.453-.107-.714-.207-.911a2.25 2.25 0 0 0-.984-.984c-.197-.1-.458-.17-.912-.207-.462-.037-1.056-.038-1.909-.038h-1.9c-.852 0-1.447 0-1.91.038Zm-2.103 7.821a7.12 7.12 0 0 1-.006-.08.746.746 0 0 0 .044-.049l1.8-2.159a.25.25 0 0 1 .368-.016l3.226 3.225a.75.75 0 0 0 1.06 0l1.71-1.71a.25.25 0 0 1 .372.021l1.213 1.516c-.021.06-.045.114-.07.165-.216.423-.56.767-.984.983-.197.1-.458.17-.912.207-.462.037-1.056.038-1.909.038h-1.9c-.852 0-1.447 0-1.91-.038-.453-.037-.714-.107-.911-.207a2.25 2.25 0 0 1-.984-.984c-.1-.197-.17-.458-.207-.912Z"></path></svg>
                                        ` }
                                    </div>
                                    <div class="product-info" data-pro-id="${variant.proId}">
                                        <span class="custom-bundle-change-color" 
                                        data-variant-index=${index} data-var-id="${variant.varId}">Change color</span>
                                        <div class="variant-name">${variant.varTitle} </div>
                                        <div class="product-name">${variant.proTitle}</div>
                                        ${variant.inventory === 0 ? `<span "secondary-label">Out of stock</span>` : ""}
                                        ${variant.needed > variant.quantity ? `<span class="warning-label">You need ${(variant.needed - variant.quantity).toString()} more for this project</span>` : ""}
                                        ${variant.quantity > variant.inventory ? `<span class="danger-label">Insufficient product in inventory</span>` : ""}
                                        ${variant.quantity <= variant.inventory ? `<span class="success-label">In stock</span>` : ""}
                                    </div>
                                    </div>
                                    <div class="custom-list-item-right">
                                        <div class="quantity-label">QTY</div>
                                        <input min="0" type="number" label="QTY" value="${variant.quantity}" class="quantity-item" data-index=${index} data-type=${variant.productType}>
                                        <div class="custom-price">x$${variant.price}</div>
                                    </div>
                                </li>
                            `
        });
        return variantListHtml
    }

    getTotalPrice() {
        let total = 0;
        this.variantList.accessories?.forEach(acc => {
            total += acc.price * acc.quantity
        });
        this.variantList.others?.forEach(item => {
            total += item.price * item.quantity
        })
        return total
    }

    addToCart(variantList) {
        let formData = {
            'items': [
            ]
        }

        // Loop through each product and create a promise to add it to the cart
        // Combine the others and accessories arrays
        const allVariants = [...variantList.others, ...variantList.accessories];

        // Iterate over the combined array and push items with quantity > 0 to formData.items
        allVariants.forEach(item => {
            if (item.quantity > 0) {
                formData.items.push({
                    id: item.varId,
                    quantity: item.quantity
                });
            }
        });

        formData.items = formData.items.reduce((acc, item) => {
            const existingItem = acc.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                acc.push({ ...item });
            }
            return acc;
        }, []);

        console.log("Form data to send: ", formData)

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

    initializeModal() {

        let modalHtml = `
            <div id="custom-bundle-modal" class="modal" style="display:${this.modalOpen ? "block" : "none"}">
                <div class="modal-content">
                    <span id="closeModalButton" class="close-button">&times;</span>
                    <div id="customBundleModalContent">Loading...</div>
                </div>
            </div>
        `
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        this.modal = document.getElementById('custom-bundle-modal');

        const closeModalButton = document.getElementById('closeModalButton');
        closeModalButton.addEventListener('click', () => {
            this.modal.style.display = 'none'
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.modal.style.display = 'none'
            }
        });
    }

    updateModalContent() {
        console.log("updateModalContent called. ProductId is: ", this.selectedProductId);
        console.log("this selected variant index with modal: ", this.selectedVariantIndex);

        const selectedProduct = this.transformedData.find(product =>
            product.id.split('/').pop() === this.selectedProductId
        );

        this.selectedProductType = selectedProduct.productType;

        const selectedVariant = selectedProduct?.variants.find(variant =>
            variant.id.split('/').pop() === this.selectedVariantId
        );

        const modalContent = document.getElementById('customBundleModalContent');
        if (this.selectedProductId) {
            modalContent.innerHTML = `
                <div id="modalTitle">Select Your Color</div>
                    <div id="available-colors">Available Colors</div>
                    <div id="selected-color">Selected variant id: ${this.selectedVariantId}</div>
                    <div id="selected-color">Color: Light Pink</div>
                    <div id="modalColorList">
                    ${selectedProduct.variants.map(variant => {
                return `<div class="custom-bundle-modal-image-container">
                                    <img class="custom-bundle-variant-img ${variant.id === selectedVariant.id ? "selected-variant" : ""}"
                                    src="${variant.image.url}" 
                                    data-variant-id="${variant.id}"
                                    />
                                    <div>${variant.title}</div>
                                </div>
                                `}).join('')}</div>`
        } else {
            modalContent.innerHTML = `<p>Product not found.</p>`
        }

        const modalImages = document.querySelectorAll('.custom-bundle-variant-img')

        modalImages.forEach(img =>
            img.addEventListener('mouseenter', (e) => {
                modalImages.forEach(img => img.classList.contains('hovered-variant') ? img.classList.remove('hovered-variant') : null)
                e.target.classList.add('hovered-variant');

            }));
        modalImages.forEach(img => img.addEventListener('mouseleave', (e) => {
            e.target.classList.remove('hovered-variant');
        }));
        modalImages.forEach(img => img.addEventListener('click', (e) => {
            modalImages.forEach(img => img.classList.contains('selected-variant') ? img.classList.remove('selected-variant') : null);
            this.selectedVariantId = e.target.dataset.variantId.split('/').pop();
            e.target.classList.add('selected-variant');
            setTimeout(() => {
                this.modal.style.display = "none"
            }, 100);
            this.updateVariantList(this.selectedVariantIndex, this.getVariantById(this.selectedVariantId));
        }));
    }

    // ? TODO: All variants to be added. normalize or not normalize. Think
    // Set initial variant list state
    setVariantList(variantList) {
        // {id: variant id, quantity: selected quantity, needed: neededQuantity, inventory: availableForSale}
        this.variantList = variantList
    }

    getVariantById(id) {
        return this.transformedData
            .flatMap(product => product.variants)
            .find(variant =>
                variant.id.split('/').pop() === id
            );
    }

    getProductById(id) {
        return this.transformedData.find(product => product.id.split('/').pop() === id)
    }

    // Update variant list upon a selection of a variant such as color on modal
    updateVariantList(index, newVariant) {
        // Here new variant has the transformed shopify variant data structure
        const selectedProduct = this.getProductById(this.selectedProductId);

        // Test for update method 2
        if (this.selectedProductType === "accessories") {
            this.variantList.accessories = this.variantList.accessories.map((accessory, i) => {
                if (i === Number(index)) {
                    return {
                        ...accessory,
                        varId: newVariant.id.split('/').pop(),
                        proId: selectedProduct.id.split('/').pop(),
                        inventory: newVariant.quantityAvailable,
                        productType: selectedProduct.productType,
                        varImg: newVariant.image.url,
                        proImg: selectedProduct.featuredImage.url,
                        proTitle: selectedProduct.title,
                        varTitle: newVariant.title,
                        price: Number(newVariant.price.amount)
                    }
                } else {
                    return accessory
                }
            })
        } else {
            this.variantList.others = this.variantList.others.map((accessory, i) => {
                if (i === Number(index)) {
                    return {
                        ...accessory,
                        varId: newVariant.id.split('/').pop(),
                        proId: selectedProduct.id.split('/').pop(),
                        inventory: newVariant.quantityAvailable,
                        productType: selectedProduct.productType,
                        varImg: newVariant.image.url,
                        proImg: selectedProduct.featuredImage.url,
                        proTitle: selectedProduct.title,
                        varTitle: newVariant.title,
                        price: Number(newVariant.price.amount)
                    }
                } else {
                    return accessory
                }
            })
        }

        console.log("this selected list after: ", this.variantList);
        this.renderBundle();
    }

    handleQuantityChange(index, newQuantity) {
        // Test for update method 2
        if (this.selectedProductType === "accessories") {
            this.variantList.accessories = this.variantList.accessories.map((accessory, i) => {
                if (i === Number(index)) {
                    return {
                        ...accessory,
                        quantity: newQuantity
                    }
                } else {
                    return accessory
                }
            })
        } else {
            this.variantList.others = this.variantList.others.map((accessory, i) => {
                if (i === Number(index)) {
                    return {
                        ...accessory,
                        quantity: newQuantity
                    }
                } else {
                    return accessory
                }
            })
        }

        console.log("this selected list after: ", this.variantList);
        this.renderBundle();
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

function mutateData(bundle, transformedData) {
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