//variables

const cartBtn = document.querySelector('.cart-btn'); //the cart button on appbar
const closeCartBtn = document.querySelector('.close-cart'); //close button on cartbar
const clearCartBtn = document.querySelector('.clear-cart'); //clear button
const cartDOM = document.querySelector('.cart'); //the whole div in cartapp
const cartOverlay = document.querySelector('.cart-overlay'); //cartapp
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
let buttonsDOM = [];

//getting the products
class Products{
    async getProducts(){
        
        try {
            const result = await fetch("products.json");
            const data = await result.json();          
            const products = data.items.map(item => {
                const {id} = item.sys;
                const {title,price} = item.fields;
                const {url} = item.fields.image.fields.file;
                
                return {id,title,price,url}
            })

            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

//display products
class UI{
    displayProducts(products) {
        let productsHTML = '';

        products.forEach(product => {
            productsHTML += `
            <!-- singal product-->
                <article class="product">
                    <div class="img-container">
                        <img src="${product.url}" alt="product" class="product-img">
                        <button class="bag-btn" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                            add to bag
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
            <!-- end of singal product-->`
        });

        productsDOM.innerHTML = productsHTML;
    }

    getBagButtons(){
        buttonsDOM = [...document.querySelectorAll('.bag-btn')];
        
        buttonsDOM.forEach(btn => {
            const id = btn.dataset.id;
            const inCart = cart.find(el => el.id === id);

            if(inCart){
                btn.innerText = 'in cart';
                btn.disabled = true;
            }

            btn.addEventListener('click', (event)=> {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;

                const cartItem = {...Storage.getProducts(id), 'amount': 1};
                cart = [...cart, cartItem];
                
                Storage.saveCart(cart);
                this.setCartValues(cart);
                this.addCartItem(cartItem);
                this.showCart();
            });
        })
    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.forEach(item => {
            tempTotal += (item.price * item.amount);
            itemsTotal += item.amount
        })

        cartTotal.innerHTML = parseFloat(tempTotal.toFixed(2));
        cartItems.innerHTML = itemsTotal;
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src="${item.url}" alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
        `
        cartContent.appendChild(div);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    setupAPP(){
        cart.forEach(item => this.addCartItem(item));
        this.setCartValues(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    cartLogic(){
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        })

        cartContent.addEventListener('click', () => {
            const cartItem = event.target;
            const id = cartItem.dataset.id
            if (cartItem.classList.contains ('remove-item')){              
                this.removeItem(id);
                cartContent.removeChild(cartItem.parentElement.parentElement)
            } else if (cartItem.classList.contains('fa-chevron-up')){
                const tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                cartItem.nextElementSibling.innerHTML = tempItem.amount;
                this.setCartValues(cart);
                Storage.saveCart(cart);
            } else if (cartItem.classList.contains('fa-chevron-down')) {
                const tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0){
                    cartItem.previousElementSibling.innerHTML = tempItem.amount;
                } else {
                    this.removeItem(id);
                    cartContent.removeChild(cartItem.parentElement.parentElement)
                }
                this.setCartValues(cart);
                Storage.saveCart(cart);
            }
        })

    }

    clearCart(){
        const cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }

        this.hideCart();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        Storage.saveCart(cart);
        this.setCartValues(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-shopping-cart"></i>add to bag';
    }

    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

//local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products));
    }

    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getProducts(id){
        return JSON.parse(localStorage.getItem('products')).find(item => item.id === id);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();
    const ui = new UI();

    ui.setupAPP();
    
    products.getProducts()
    .then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    })
    .then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});

