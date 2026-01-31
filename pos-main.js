// ===================================
// MAIN POS MODULE - Cart, Menu, Checkout
// ===================================

const POS = {
    currentCustomItem: null,
    currentEditItem: null,
    
    init() {
        this.renderCategories();
        this.renderMenu();
        this.updateCart();
    },
    
    renderCategories() {
        const container = document.getElementById('categoryTabs');
        if (!container) return;
        
        container.innerHTML = State.categories.map(cat => 
            `<button class="category-tab ${cat === State.currentCategory ? 'active' : ''}" 
                     data-category="${cat}"
                     onclick="POS.selectCategory('${cat}')">${cat}</button>`
        ).join('');
    },
    
    selectCategory(category) {
        State.currentCategory = category;
        this.renderCategories();
        this.renderMenu();
    },
    
    renderMenu() {
        const container = document.getElementById('menuGrid');
        if (!container) return;
        
        const items = State.menu.filter(item => item.category === State.currentCategory && item.enabled);
        
        if (items.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No items in this category</p>';
            return;
        }
        
        const canEdit = State.currentUser && (State.currentUser.role === 'admin' || State.currentUser.role === 'supervisor');
        
        container.innerHTML = items.map(item => `
            <div class="menu-item ${!item.enabled ? 'disabled' : ''}" onclick="POS.showCustomModal(${item.id})">
                ${canEdit ? `<div class="edit-badge" onclick="event.stopPropagation(); POS.showEditModal(${item.id})">✏️</div>` : ''}
                <img src="${item.image}" class="menu-item-image" alt="${item.name}">
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-price">₱${item.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    },
    
    showCustomModal(itemId) {
        const item = State.menu.find(i => i.id === itemId);
        if (!item || !item.enabled) return;
        
        this.currentCustomItem = itemId;
        
        let customOptions = '';
        if (item.category === 'Burgers') {
            customOptions = `
                <div class="customization-options">
                    <div class="custom-option" data-type="add" data-value="cheese">+ Extra Cheese (₱30)</div>
                    <div class="custom-option" data-type="add" data-value="bacon">+ Bacon (₱50)</div>
                    <div class="custom-option" data-type="add" data-value="egg">+ Egg (₱25)</div>
                    <div class="custom-option" data-type="add" data-value="patty">+ Extra Patty (₱80)</div>
                    <div class="custom-option remove" data-type="remove" data-value="onions">- No Onions</div>
                    <div class="custom-option remove" data-type="remove" data-value="mayo">- No Mayo</div>
                    <div class="custom-option remove" data-type="remove" data-value="lettuce">- No Lettuce</div>
                    <div class="custom-option remove" data-type="remove" data-value="tomato">- No Tomato</div>
                </div>
            `;
        }
        
        const modal = document.getElementById('customModal');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span>Customize ${item.name}</span>
                    <button class="modal-close" onclick="POS.closeCustomModal()">×</button>
                </div>
                ${customOptions}
                <div class="form-group">
                    <label>Special Instructions</label>
                    <textarea id="customNotes" placeholder="Any special requests?"></textarea>
                </div>
                <button class="btn btn-success" onclick="POS.addToCart()" style="width: 100%; padding: 16px; font-size: 16px;">
                    Add to Cart
                </button>
            </div>
        `;
        modal.classList.add('active');
        
        // Add click handlers for customizations
        modal.querySelectorAll('.custom-option').forEach(opt => {
            opt.addEventListener('click', function() {
                this.classList.toggle('selected');
            });
        });
    },
    
    closeCustomModal() {
        document.getElementById('customModal').classList.remove('active');
        this.currentCustomItem = null;
    },
    
    addToCart() {
        const item = State.menu.find(i => i.id === this.currentCustomItem);
        if (!item) return;
        
        const selectedOptions = Array.from(document.querySelectorAll('.custom-option.selected'));
        const customizations = selectedOptions.map(opt => ({
            type: opt.dataset.type,
            value: opt.dataset.value,
            text: opt.textContent
        }));
        
        const addOns = customizations.filter(c => c.type === 'add');
        let extraPrice = 0;
        if (addOns.find(a => a.value === 'cheese')) extraPrice += 30;
        if (addOns.find(a => a.value === 'bacon')) extraPrice += 50;
        if (addOns.find(a => a.value === 'egg')) extraPrice += 25;
        if (addOns.find(a => a.value === 'patty')) extraPrice += 80;
        
        const notes = document.getElementById('customNotes').value;
        
        State.cart.push({
            id: Date.now(),
            itemId: item.id,
            name: item.name,
            price: item.price + extraPrice,
            quantity: 1,
            customizations: customizations,
            notes: notes
        });
        
        this.updateCart();
        this.closeCustomModal();
        State.save();
    },
    
    updateCart() {
        const container = document.getElementById('cartItems');
        if (!container) return;
        
        if (State.cart.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; margin-top: 50px;">Cart is empty</p>';
            document.getElementById('cartTotals').innerHTML = '';
            return;
        }
        
        container.innerHTML = State.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-header">
                    <div class="cart-item-name">${item.name}</div>
                    <button class="cart-item-remove" onclick="POS.removeFromCart(${item.id})">×</button>
                </div>
                ${item.customizations && item.customizations.length > 0 ? `
                    <div class="cart-customizations">
                        ${item.customizations.map(c => c.text).join(', ')}
                    </div>
                ` : ''}
                ${item.notes ? `<div class="cart-customizations">Note: ${item.notes}</div>` : ''}
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="POS.updateQuantity(${item.id}, -1)">−</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="POS.updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <div class="cart-item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        `).join('');
        
        this.updateTotals();
    },
    
    updateQuantity(cartId, change) {
        const item = State.cart.find(i => i.id === cartId);
        if (!item) return;
        
        item.quantity += change;
        if (item.quantity <= 0) {
            this.removeFromCart(cartId);
        } else {
            this.updateCart();
            State.save();
        }
    },
    
    removeFromCart(cartId) {
        State.cart = State.cart.filter(i => i.id !== cartId);
        this.updateCart();
        State.save();
    },
    
    clearCart() {
        if (State.cart.length === 0) return;
        if (!confirm('Clear all items from cart?')) return;
        
        State.cart = [];
        State.discount = { type: 'percent', value: 0, approved: false, approvedBy: null };
        document.getElementById('discountValue').value = '';
        document.getElementById('approvalRequired').classList.add('hidden');
        this.updateCart();
        State.save();
    },
    
    applyDiscount() {
        const value = parseFloat(document.getElementById('discountValue').value) || 0;
        const type = document.getElementById('discountType').value;
        
        if (value <= 0) {
            State.discount = { type: 'percent', value: 0, approved: false, approvedBy: null };
            document.getElementById('approvalRequired').classList.add('hidden');
            this.updateTotals();
            return;
        }
        
        // Require approval if cashier
        if (State.currentUser.role === 'cashier') {
            Utils.requestApproval(`Apply ${value}${type === 'percent' ? '%' : '₱'} discount`, (supervisor) => {
                State.discount = { type, value, approved: true, approvedBy: supervisor.name };
                document.getElementById('approvalRequired').classList.remove('hidden');
                document.getElementById('approvalRequired').innerHTML = `✅ Approved by ${supervisor.name}`;
                this.updateTotals();
                Utils.logAction('discount_applied', `${value}${type === 'percent' ? '%' : '₱'} discount approved by ${supervisor.name}`, true);
            });
        } else {
            State.discount = { type, value, approved: true, approvedBy: State.currentUser.name };
            document.getElementById('approvalRequired').classList.remove('hidden');
            document.getElementById('approvalRequired').innerHTML = `✅ Approved by ${State.currentUser.name}`;
            this.updateTotals();
        }
    },
    
    updateTotals() {
        const subtotal = State.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        let discount = 0;
        if (State.discount.approved) {
            if (State.discount.type === 'percent') {
                discount = subtotal * (State.discount.value / 100);
            } else {
                discount = State.discount.value;
            }
        }
        
        const total = subtotal - discount;
        
        document.getElementById('cartTotals').innerHTML = `
            <div class="cart-total-row">
                <span>Subtotal:</span>
                <span>₱${subtotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
                <div class="cart-total-row" style="color: var(--success);">
                    <span>Discount:</span>
                    <span>-₱${discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="cart-total-row grand-total">
                <span>TOTAL:</span>
                <span>₱${total.toFixed(2)}</span>
            </div>
        `;
    },
    
    checkout() {
        if (State.cart.length === 0) {
            Utils.showNotification('Cart is empty!', 'error');
            return;
        }
        
        State.selectedPayment = null;
        
        const modal = document.getElementById('checkoutModal');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span>Complete Payment</span>
                    <button class="modal-close" onclick="POS.closeCheckoutModal()">×</button>
                </div>
                <div class="form-group">
                    <label>Payment Method</label>
                    <div class="payment-methods">
                        <div class="payment-method" onclick="POS.selectPayment('cash')">💵 Cash</div>
                        <div class="payment-method" onclick="POS.selectPayment('gcash')">📱 GCash</div>
                        <div class="payment-method" onclick="POS.selectPayment('maya')">💳 Maya</div>
                        <div class="payment-method" onclick="POS.selectPayment('card')">💳 Card</div>
                    </div>
                </div>
                <div id="cashPaymentFields" class="hidden">
                    <div class="form-group">
                        <label>Amount Tendered (₱)</label>
                        <input type="number" id="amountTendered" min="0" step="0.01" oninput="POS.calculateChange()">
                    </div>
                    <div class="form-group">
                        <label>Change (₱)</label>
                        <input type="number" id="changeAmount" readonly style="background: var(--light);">
                    </div>
                </div>
                <button class="btn btn-success" onclick="POS.completePayment()" style="width: 100%; padding: 16px; font-size: 16px;">
                    Complete Order
                </button>
            </div>
        `;
        modal.classList.add('active');
    },
    
    closeCheckoutModal() {
        document.getElementById('checkoutModal').classList.remove('active');
    },
    
    selectPayment(method) {
        State.selectedPayment = method;
        
        document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
        event.target.classList.add('selected');
        
        const cashFields = document.getElementById('cashPaymentFields');
        if (method === 'cash') {
            cashFields.classList.remove('hidden');
            const total = this.calculateTotal();
            document.getElementById('amountTendered').value = total.toFixed(2);
            this.calculateChange();
        } else {
            cashFields.classList.add('hidden');
        }
    },
    
    calculateTotal() {
        const subtotal = State.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        if (State.discount.approved) {
            if (State.discount.type === 'percent') {
                discount = subtotal * (State.discount.value / 100);
            } else {
                discount = State.discount.value;
            }
        }
        return subtotal - discount;
    },
    
    calculateChange() {
        const total = this.calculateTotal();
        const tendered = parseFloat(document.getElementById('amountTendered').value) || 0;
        const change = tendered - total;
        document.getElementById('changeAmount').value = Math.max(0, change).toFixed(2);
    },
    
    completePayment() {
        if (!State.selectedPayment) {
            Utils.showNotification('Please select a payment method!', 'error');
            return;
        }
        
        if (State.selectedPayment === 'cash') {
            const total = this.calculateTotal();
            const tendered = parseFloat(document.getElementById('amountTendered').value) || 0;
            if (tendered < total) {
                Utils.showNotification('Insufficient payment amount!', 'error');
                return;
            }
        }
        
        // Create order
        const order = {
            id: State.orderNumber++,
            items: [...State.cart],
            subtotal: State.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            discount: State.discount,
            total: this.calculateTotal(),
            payment: State.selectedPayment,
            timestamp: new Date().toISOString(),
            status: 'pending',
            staffName: State.currentUser ? State.currentUser.name : 'Unknown'
        };
        
        State.orders.push(order);
        State.lastOrder = order;
        
        // Deduct inventory (simplified)
        State.cart.forEach(cartItem => {
            const menuItem = State.menu.find(m => m.id === cartItem.itemId);
            if (menuItem && menuItem.category === 'Burgers') {
                const patty = State.inventory.find(i => i.name === 'Beef Patty');
                if (patty) patty.quantity -= cartItem.quantity;
                
                const buns = State.inventory.find(i => i.name === 'Buns');
                if (buns) buns.quantity -= cartItem.quantity;
            }
        });
        
        this.closeCheckoutModal();
        this.showReceipt(order);
        
        // Clear cart
        State.cart = [];
        State.discount = { type: 'percent', value: 0, approved: false, approvedBy: null };
        document.getElementById('discountValue').value = '';
        document.getElementById('approvalRequired').classList.add('hidden');
        
        this.updateCart();
        State.save();
        Utils.logAction('order_complete', `Order #${order.id} completed - ₱${order.total.toFixed(2)}`);
    },
    
    showReceipt(order) {
        let discountAmount = 0;
        if (order.discount.value > 0) {
            if (order.discount.type === 'percent') {
                discountAmount = order.subtotal * (order.discount.value / 100);
            } else {
                discountAmount = order.discount.value;
            }
        }
        
        const content = `
            <div class="receipt-header">
                <h2>${State.storeName}</h2>
                <p>Order #${order.id}</p>
                <p>${Utils.formatDateTime(order.timestamp)}</p>
                <p>Served by: ${order.staffName}</p>
            </div>
            <div class="receipt-items">
                ${order.items.map(item => `
                    <div class="receipt-item">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    ${item.customizations && item.customizations.length > 0 ? `
                        <div style="font-size: 11px; margin-left: 10px; color: #666;">
                            ${item.customizations.map(c => c.text).join(', ')}
                        </div>
                    ` : ''}
                `).join('')}
            </div>
            <div class="receipt-footer">
                <div class="receipt-item">
                    <span>Subtotal:</span>
                    <span>₱${order.subtotal.toFixed(2)}</span>
                </div>
                ${discountAmount > 0 ? `
                    <div class="receipt-item">
                        <span>Discount:</span>
                        <span>-₱${discountAmount.toFixed(2)}</span>
                    </div>
                ` : ''}
                <div class="receipt-item" style="font-weight: bold; border-top: 1px dashed #000; padding-top: 5px;">
                    <span>TOTAL:</span>
                    <span>₱${order.total.toFixed(2)}</span>
                </div>
                <p style="margin-top: 15px;">Payment: ${order.payment.toUpperCase()}</p>
                <p style="margin-top: 15px;">Thank you for your order!</p>
            </div>
        `;
        
        const modal = document.getElementById('receiptModal');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span>Order Receipt</span>
                    <button class="modal-close" onclick="POS.closeReceiptModal()">×</button>
                </div>
                <div id="receiptContent" class="receipt-content">${content}</div>
                <div style="display: grid; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-primary" onclick="POS.printReceipt()">🖨️ Print Receipt</button>
                    <button class="btn btn-success" onclick="POS.closeReceiptModal()">Done</button>
                </div>
            </div>
        `;
        modal.classList.add('active');
    },
    
    closeReceiptModal() {
        document.getElementById('receiptModal').classList.remove('active');
    },
    
    printReceipt() {
        window.print();
    },
    
    repeatLastOrder() {
        if (!State.lastOrder || !State.lastOrder.items) {
            Utils.showNotification('No previous order found', 'warning');
            return;
        }
        
        State.cart = JSON.parse(JSON.stringify(State.lastOrder.items));
        this.updateCart();
        Utils.showNotification('Last order repeated', 'success');
    },
    
    showPopularItems() {
        const itemCounts = {};
        State.orders.forEach(order => {
            order.items.forEach(item => {
                itemCounts[item.itemId] = (itemCounts[item.itemId] || 0) + item.quantity;
            });
        });
        
        const popular = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([itemId]) => parseInt(itemId));
        
        if (popular.length === 0) {
            Utils.showNotification('No sales data yet', 'warning');
            return;
        }
        
        Utils.showNotification('Showing popular items', 'success');
        
        // Temporarily filter menu
        const container = document.getElementById('menuGrid');
        const popularItems = State.menu.filter(item => popular.includes(item.id) && item.enabled);
        
        container.innerHTML = popularItems.map(item => `
            <div class="menu-item" onclick="POS.showCustomModal(${item.id})">
                <img src="${item.image}" class="menu-item-image" alt="${item.name}">
                <div class="menu-item-info">
                    <div class="menu-item-name">⭐ ${item.name}</div>
                    <div class="menu-item-price">₱${item.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
        
        setTimeout(() => this.renderMenu(), 10000);
    },
    
    showEditModal(itemId) {
        if (!Auth.checkPermission('supervisor')) {
            Utils.showNotification('Permission denied', 'error');
            return;
        }
        
        const item = State.menu.find(i => i.id === itemId);
        if (!item) return;
        
        this.currentEditItem = item;
        
        const modal = document.getElementById('editModal');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span>Edit Menu Item</span>
                    <button class="modal-close" onclick="POS.closeEditModal()">×</button>
                </div>
                <div class="form-group">
                    <label>Item Name</label>
                    <input type="text" id="editItemName" value="${item.name}">
                </div>
                <div class="form-group">
                    <label>Price (₱)</label>
                    <input type="number" id="editItemPrice" min="0" step="0.01" value="${item.price}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="editItemDesc">${item.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="editItemCategory">
                        ${State.categories.map(cat => `<option value="${cat}" ${cat === item.category ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Item Image</label>
                    <input type="file" id="editItemImage" accept="image/*" onchange="POS.previewEditImage(this)">
                    <img id="editImagePreview" class="image-preview" src="${item.image}" />
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="editItemEnabled" ${item.enabled ? 'checked' : ''}>
                        <span>Item Available</span>
                    </label>
                </div>
                <button class="btn btn-success" onclick="POS.saveItemEdit()">Save Changes</button>
                <button class="btn btn-danger" onclick="POS.deleteItem()">Delete Item</button>
            </div>
        `;
        modal.classList.add('active');
    },
    
    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        this.currentEditItem = null;
    },
    
    previewEditImage(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('editImagePreview').src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    },
    
    saveItemEdit() {
        if (!this.currentEditItem) return;
        
        const item = State.menu.find(i => i.id === this.currentEditItem.id);
        if (!item) return;
        
        item.name = document.getElementById('editItemName').value;
        item.price = parseFloat(document.getElementById('editItemPrice').value);
        item.description = document.getElementById('editItemDesc').value;
        item.category = document.getElementById('editItemCategory').value;
        item.enabled = document.getElementById('editItemEnabled').checked;
        
        const imageInput = document.getElementById('editItemImage');
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                item.image = e.target.result;
                State.save();
                POS.renderMenu();
                if (Views.current === 'admin') AdminUI.renderAdminMenuList();
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            State.save();
            this.renderMenu();
            if (Views.current === 'admin') AdminUI.renderAdminMenuList();
        }
        
        this.closeEditModal();
        Utils.showNotification('Item updated successfully!', 'success');
        Utils.logAction('menu_edit', `Updated ${item.name}`);
    },
    
    deleteItem() {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        const item = this.currentEditItem;
        State.menu = State.menu.filter(i => i.id !== item.id);
        State.save();
        this.renderMenu();
        if (Views.current === 'admin') AdminUI.renderAdminMenuList();
        this.closeEditModal();
        Utils.showNotification('Item deleted successfully!', 'success');
        Utils.logAction('menu_delete', `Deleted ${item.name}`);
    },
    
    showAddItemModal() {
        this.currentEditItem = { id: State.getNextId(State.menu), enabled: true, category: State.categories[0] };
        
        const modal = document.getElementById('editModal');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span>Add New Menu Item</span>
                    <button class="modal-close" onclick="POS.closeEditModal()">×</button>
                </div>
                <div class="form-group">
                    <label>Item Name</label>
                    <input type="text" id="editItemName">
                </div>
                <div class="form-group">
                    <label>Price (₱)</label>
                    <input type="number" id="editItemPrice" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="editItemDesc"></textarea>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="editItemCategory">
                        ${State.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Item Image</label>
                    <input type="file" id="editItemImage" accept="image/*" onchange="POS.previewEditImage(this)">
                    <img id="editImagePreview" class="image-preview hidden" />
                </div>
                <button class="btn btn-success" onclick="POS.saveNewItem()">Add Item</button>
            </div>
        `;
        modal.classList.add('active');
    },
    
    saveNewItem() {
        const newItem = {
            id: this.currentEditItem.id,
            name: document.getElementById('editItemName').value,
            price: parseFloat(document.getElementById('editItemPrice').value),
            description: document.getElementById('editItemDesc').value,
            category: document.getElementById('editItemCategory').value,
            enabled: true,
            image: document.getElementById('editImagePreview').src || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23999"%3E📦%3C/text%3E%3C/svg%3E'
        };
        
        State.menu.push(newItem);
        State.save();
        this.renderMenu();
        if (Views.current === 'admin') AdminUI.renderAdminMenuList();
        this.closeEditModal();
        Utils.showNotification('Item added successfully!', 'success');
        Utils.logAction('menu_add', `Added ${newItem.name}`);
    }
};

// Initialize everything when DOM is ready
window.addEventListener('DOMContentLoaded', function() {
    console.log('🍔 Burger POS System Loading...');
    State.load();
    
    if (State.currentUser) {
        Auth.updateUserDisplay();
        Auth.updateUIPermissions();
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        POS.init();
    }
    
    console.log('✅ Burger POS System Ready!');
});

console.log('✅ Main POS Module Loaded');
