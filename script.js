// ==========================================
// 1. GLOBAL INITIALIZATION & BAG COUNT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    updateBagCount();

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") toggleSidebar(false);
    });
    
    if (document.getElementById('cart-container-main')) {
        loadCartPage();
    }
    if (document.getElementById('orders-container-main')) {
        loadOrdersPage();
    }
});

function toggleSidebar(open) {
    let sidebar = document.getElementById("mobile-sidebar");
    let overlay = document.getElementById("sidebar-overlay");
    let toggleButton = document.querySelector(".menu-toggle-btn");
    if (!sidebar || !overlay) return;

    let isOpen = typeof open === "boolean" ? open : !sidebar.classList.contains("is-open");
    sidebar.classList.toggle("is-open", isOpen);
    overlay.classList.toggle("is-open", isOpen);
    sidebar.setAttribute("aria-hidden", String(!isOpen));
    if (toggleButton) toggleButton.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("sidebar-open", isOpen);
}

function updateBagCount() {
    let cart = JSON.parse(localStorage.getItem('nostraCart')) || [];
    let bagSpans = document.querySelectorAll('#bag-count');
    
    bagSpans.forEach(span => {
        if (cart.length > 0) {
            span.innerText = `Bag (${cart.length})`;
        } else {
            span.innerText = `Bag`;
        }
    });
}


// ==========================================
// 2. COLLECTIONS PAGE: SEARCH & FILTER
// ==========================================

function searchProducts() {
    let input = document.getElementById('search-input');
    if (!input) return;
    
    let filter = input.value.toLowerCase();
    let products = document.getElementsByClassName('product-card');

    for (let i = 0; i < products.length; i++) {
        let productName = products[i].getAttribute('data-name');
        if (productName && productName.toLowerCase().includes(filter)) {
            products[i].style.display = "block";
        } else {
            products[i].style.display = "none";
        }
    }
}

function filterCategory(category, buttonElement) {
    let products = document.getElementsByClassName('product-card');
    let buttons = document.getElementsByClassName('filter-btn');

    for (let btn of buttons) {
        btn.classList.remove('active');
    }
    if (buttonElement) {
        buttonElement.classList.add('active');
    }

    for (let i = 0; i < products.length; i++) {
        let productCat = products[i].getAttribute('data-category');
        if (category === 'all' || productCat === category) {
            products[i].style.display = "block";
        } else {
            products[i].style.display = "none";
        }
    }
}


// ==========================================
// 3. CART LOGIC (Add, Remove, Summary)
// ==========================================

function addToCart(title, price, img) {
    let cart = JSON.parse(localStorage.getItem('nostraCart')) || [];
    cart.push({ title: title, price: price, img: img });
    localStorage.setItem('nostraCart', JSON.stringify(cart));
    
    updateBagCount();
    showModal(title + " added to your shopping bag successfully!");
}

function loadCartPage() {
    updateBagCount();
    let cartContainer = document.getElementById('cart-container-main');
    if (!cartContainer) return;

    let cart = JSON.parse(localStorage.getItem('nostraCart')) || [];

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; background: #fff; border-radius: 8px; grid-column: span 2; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="font-size: 20px; color: #282c3f; margin-bottom: 10px;">Your Shopping Bag is Empty!</h3>
                <p style="color: #696e79; margin-bottom: 20px; font-size: 14px;">Explore our collections and add your favorite fashion items to the bag.</p>
                <a href="collections.html" class="shop-now-btn" style="display: inline-block; width: auto; padding: 10px 25px;">SHOP NOW</a>
            </div>
        `;
        return;
    }

    let totalMRP = 0;
    let itemsHTML = '<div class="cart-items-list">';

    cart.forEach((item, index) => {
        totalMRP += Number(item.price);
        itemsHTML += `
            <div class="cart-item-card" style="display: flex; align-items: center; gap: 20px; background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <img src="${item.img}" alt="Product" style="width: 90px; height: 110px; object-fit: cover; border-radius: 6px;">
                <div style="flex-grow: 1;">
                    <h3 style="font-size: 16px; font-weight: 700; color: #282c3f;">${item.title}</h3>
                    <p style="font-size: 15px; font-weight: 700; color: #282c3f; margin-top: 8px;">Rs. ${item.price}</p>
                </div>
                <div>
                    <button onclick="removeFromCart(${index})" style="padding: 8px 16px; background: var(--accent-color); color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 13px;">Remove</button>
                </div>
            </div>
        `;
    });
    itemsHTML += '</div>';

    let summaryHTML = `
        <div class="cart-summary">
            <h3 style="font-size: 16px; font-weight: 700; color: #282c3f; margin-bottom: 20px; border-bottom: 1px solid #eaeaec; padding-bottom: 10px;">PRICE DETAILS (${cart.length} Items)</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #535766;">
                <span>Total MRP</span>
                <span>Rs. ${totalMRP}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #535766;">
                <span>Convenience Fee</span>
                <span><strong style="color: #03a685;">FREE</strong></span>
            </div>
            <hr style="border: none; border-top: 1px solid #eaeaec; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 16px; font-weight: 700; color: #282c3f;">
                <span>Total Amount</span>
                <span>Rs. ${totalMRP}</span>
            </div>
            <button class="shop-now-btn" style="width: 100%; text-align: center;" onclick="placeOrder()">PLACE ORDER</button>
        </div>
    `;

    cartContainer.innerHTML = itemsHTML + summaryHTML;
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('nostraCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('nostraCart', JSON.stringify(cart));
    loadCartPage();
    updateBagCount();
}


// ==========================================
// 4. ORDERS LOGIC (Place Order, Cancel Order)
// ==========================================

function placeOrder() {
    let cart = JSON.parse(localStorage.getItem('nostraCart')) || [];
    if (cart.length === 0) return;

    let orders = JSON.parse(localStorage.getItem('nostraOrders')) || [];
    
    cart.forEach(item => {
        orders.push({
            title: item.title,
            price: item.price,
            img: item.img,
            orderId: "#NOS" + Math.floor(10000 + Math.random() * 90000),
            date: "Delivered in 3 Days"
        });
    });

    localStorage.setItem('nostraOrders', JSON.stringify(orders));
    localStorage.removeItem('nostraCart');

    showModal("Order placed successfully!");
    setTimeout(() => {
        window.location.href = "orders.html";
    }, 1200);
}

function cancelOrder(index) {
    let orders = JSON.parse(localStorage.getItem('nostraOrders')) || [];
    orders.splice(index, 1);
    localStorage.setItem('nostraOrders', JSON.stringify(orders));
    loadOrdersPage();
    showModal("Order has been cancelled successfully.");
}

function loadOrdersPage() {
    updateBagCount();
    let ordersContainer = document.getElementById('orders-container-main');
    if (!ordersContainer) return;

    let orders = JSON.parse(localStorage.getItem('nostraOrders')) || [];

    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="font-size: 20px; color: #282c3f; margin-bottom: 10px;">No Orders Placed Yet!</h3>
                <p style="color: #696e79; margin-bottom: 20px; font-size: 14px;">Your ordered fashion items will appear here once you place an order.</p>
                <a href="collections.html" class="shop-now-btn" style="display: inline-block; width: auto; padding: 10px 25px;">START SHOPPING</a>
            </div>
        `;
        return;
    }

    let html = '';
    orders.forEach((order, index) => {
        html += `
            <div class="order-card" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 20px;">
                <div style="display: flex; gap: 20px; align-items: center;">
                    <img src="${order.img}" alt="Product" style="width: 80px; height: 90px; object-fit: cover; border-radius: 6px;">
                    <div>
                        <h3 style="font-size: 16px; font-weight: 700; color: #282c3f;">${order.title}</h3>
                        <p style="font-size: 13px; font-weight: 600; color: #282c3f; margin-top: 4px;">Order ID: ${order.orderId}</p>
                        <span style="display: inline-block; margin-top: 6px; padding: 4px 10px; background: #e6f8f3; color: #03a685; font-size: 12px; font-weight: 600; border-radius: 4px;">${order.date}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: 16px; font-weight: 700; color: #282c3f; margin-bottom: 10px;">Rs. ${order.price}</p>
                    <button onclick="cancelOrder(${index})" style="padding: 6px 14px; background: #fff; color: var(--accent-color); border: 1px solid var(--accent-color); border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.3s;">Cancel Order</button>
                </div>
            </div>
        `;
    });

    ordersContainer.innerHTML = html;
}


// ==========================================
// 5. CUSTOM MODAL / DIALOG BOX DESIGN
// ==========================================

function showModal(message) {
    // Remove existing modal if any
    let existingModal = document.getElementById('custom-alert-modal');
    if (existingModal) existingModal.remove();

    let modalHTML = `
        <div id="custom-alert-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;">
            <div style="background: #fff; padding: 25px 35px; border-radius: 8px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.15); max-width: 350px; width: 90%;">
                <h3 style="color: var(--accent-color); font-size: 18px; margin-bottom: 12px; font-weight: 700;">Nostra Alert</h3>
                <p style="color: #535766; font-size: 14px; margin-bottom: 20px;">${message}</p>
                <button onclick="document.getElementById('custom-alert-modal').remove()" style="background: var(--accent-color); color: white; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 13px;">OK</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}