// ===================================
// REPORTS & ANALYTICS MODULE
// ===================================

const Reports = {
    render() {
        const container = document.getElementById('reportsView');
        container.innerHTML = `
            <div class="menu-section">
                <button class="btn btn-light" onclick="Views.backToPOS()" style="margin-bottom: 20px;">← Back to POS</button>
                
                <h2 style="margin-bottom: 20px;">📊 Sales Reports</h2>
                
                <div class="stats-grid" id="statsGrid"></div>
                
                <div class="settings-card" style="margin-bottom: 20px;">
                    <h3>👤 Staff Performance</h3>
                    <div id="staffPerformance"></div>
                </div>
                
                <div class="settings-card">
                    <h3>Recent Orders</h3>
                    <div id="orderHistory"></div>
                </div>
                
                <button class="btn btn-success" onclick="Reports.exportReport()" style="margin-top: 20px;">📥 Export to CSV</button>
            </div>
        `;
        
        this.renderStats();
        this.renderStaffPerformance();
        this.renderOrderHistory();
    },
    
    renderStats() {
        const today = new Date().toDateString();
        const todayOrders = State.orders.filter(o => new Date(o.timestamp).toDateString() === today);
        const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
        
        const totalOrders = State.orders.length;
        const totalSales = State.orders.reduce((sum, o) => sum + o.total, 0);
        
        // Best selling
        const itemCounts = {};
        State.orders.forEach(order => {
            order.items.forEach(item => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
            });
        });
        
        const bestSeller = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
        
        const statsHtml = `
            <div class="stat-card">
                <div class="stat-value">${todayOrders.length}</div>
                <div class="stat-label">Today's Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">₱${todaySales.toFixed(2)}</div>
                <div class="stat-label">Today's Sales</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalOrders}</div>
                <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">₱${totalSales.toFixed(2)}</div>
                <div class="stat-label">Total Sales</div>
            </div>
            ${bestSeller ? `
                <div class="stat-card">
                    <div class="stat-value">${bestSeller[1]}</div>
                    <div class="stat-label">Best: ${bestSeller[0]}</div>
                </div>
            ` : ''}
        `;
        
        document.getElementById('statsGrid').innerHTML = statsHtml;
    },
    
    renderStaffPerformance() {
        const staffPerformance = {};
        
        State.orders.forEach(order => {
            const staffName = order.staffName || 'Unknown';
            if (!staffPerformance[staffName]) {
                staffPerformance[staffName] = { orders: 0, sales: 0 };
            }
            staffPerformance[staffName].orders++;
            staffPerformance[staffName].sales += order.total;
        });
        
        const performanceHtml = Object.entries(staffPerformance).map(([name, stats]) => `
            <div style="background: var(--light); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <div style="font-weight: bold; margin-bottom: 5px;">${name}</div>
                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                    <span>${stats.orders} orders</span>
                    <span>₱${stats.sales.toFixed(2)} sales</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('staffPerformance').innerHTML = performanceHtml || '<p style="text-align: center; color: #999;">No data yet</p>';
    },
    
    renderOrderHistory() {
        const historyHtml = State.orders.slice(-20).reverse().map(order => `
            <div style="padding: 15px; border-bottom: 1px solid var(--light); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Order #${order.id}</strong><br>
                    <small>${Utils.formatDateTime(order.timestamp)}</small><br>
                    <small>${order.items.length} items - ₱${order.total.toFixed(2)}</small>
                </div>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
        `).join('');
        
        document.getElementById('orderHistory').innerHTML = historyHtml || '<p style="text-align: center; color: #999;">No orders yet</p>';
    },
    
    exportReport() {
        const data = [
            ['Order ID', 'Date', 'Items', 'Staff', 'Subtotal', 'Discount', 'Total', 'Payment', 'Status'],
            ...State.orders.map(o => [
                o.id,
                Utils.formatDateTime(o.timestamp),
                o.items.map(i => `${i.quantity}x ${i.name}`).join('; '),
                o.staffName || 'N/A',
                o.subtotal.toFixed(2),
                (o.discount.value || 0).toFixed(2),
                o.total.toFixed(2),
                o.payment,
                o.status
            ])
        ];
        
        Utils.exportToCSV(data, `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
        Utils.showNotification('Sales report exported', 'success');
        Utils.logAction('export', 'Sales report exported');
    }
};

const Orders = {
    render() {
        const container = document.getElementById('ordersView');
        const activeOrders = State.orders.filter(o => o.status !== 'completed' && o.status !== 'voided');
        
        container.innerHTML = `
            <div class="menu-section">
                <button class="btn btn-light" onclick="Views.backToPOS()" style="margin-bottom: 20px;">← Back to POS</button>
                
                <h2 style="margin-bottom: 20px;">📋 Order Management</h2>
                
                <div id="activeOrdersList"></div>
            </div>
        `;
        
        const listContainer = container.querySelector('#activeOrdersList');
        
        if (activeOrders.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #999;">No active orders</p>';
            return;
        }
        
        listContainer.innerHTML = activeOrders.map(order => `
            <div class="settings-card" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>Order #${order.id}</h3>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <div style="margin-bottom: 15px;">
                    ${order.items.map(item => `
                        <div style="padding: 8px 0; border-bottom: 1px solid var(--light);">
                            ${item.quantity}x ${item.name}
                            ${item.customizations && item.customizations.length > 0 ? `<br><small style="color: #666;">${item.customizations.map(c => c.text).join(', ')}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 10px;">
                    ${order.status === 'pending' ? `<button class="btn btn-warning" onclick="Orders.updateStatus(${order.id}, 'preparing')">Start Preparing</button>` : ''}
                    ${order.status === 'preparing' ? `<button class="btn btn-success" onclick="Orders.updateStatus(${order.id}, 'ready')">Mark Ready</button>` : ''}
                    ${order.status === 'ready' ? `<button class="btn btn-primary" onclick="Orders.updateStatus(${order.id}, 'completed')">Complete</button>` : ''}
                    ${Auth.checkPermission('supervisor') ? `<button class="btn btn-danger" onclick="Orders.voidOrder(${order.id})">Void</button>` : ''}
                </div>
            </div>
        `).join('');
    },
    
    updateStatus(orderId, status) {
        const order = State.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            State.save();
            this.render();
            Utils.logAction('order_status_change', `Order #${orderId} changed to ${status}`);
        }
    },
    
    voidOrder(orderId) {
        Utils.requestApproval('Void Order', (supervisor) => {
            const reason = prompt('Reason for voiding this order:');
            if (!reason) return;
            
            const order = State.orders.find(o => o.id === orderId);
            if (order) {
                order.status = 'voided';
                State.save();
                this.render();
                Utils.logAction('order_void', `Order #${orderId} voided by ${supervisor.name}. Reason: ${reason}`, true);
                Utils.showNotification('Order voided', 'success');
            }
        });
    }
};

const Inventory = {
    render() {
        const container = document.getElementById('inventoryView');
        container.innerHTML = `
            <div class="menu-section">
                <button class="btn btn-light" onclick="Views.backToPOS()" style="margin-bottom: 20px;">← Back to POS</button>
                
                <h2 style="margin-bottom: 20px;">📦 Inventory Management</h2>
                
                <div class="settings-card">
                    <h3>Add Ingredient</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px;">
                        <input type="text" id="newIngredientName" placeholder="Ingredient name" class="form-control">
                        <input type="number" id="newIngredientQty" placeholder="Quantity" min="0" class="form-control">
                        <button class="btn btn-primary" onclick="Inventory.addIngredient()">Add</button>
                    </div>
                </div>
                
                <div id="inventoryList" style="margin-top: 20px;"></div>
            </div>
        `;
        
        this.renderList();
    },
    
    renderList() {
        const container = document.getElementById('inventoryList');
        if (!container) return;
        
        container.innerHTML = State.inventory.map(item => `
            <div class="settings-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${item.name}</strong><br>
                        <span style="color: ${item.quantity < 20 ? 'var(--danger)' : '#666'};">
                            ${item.quantity} ${item.unit}
                            ${item.quantity < 20 ? ' ⚠️ Low Stock' : ''}
                        </span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="number" id="adjust-${item.id}" placeholder="Qty" style="width: 80px; padding: 8px; border: 2px solid var(--light); border-radius: 8px;">
                        <button class="btn btn-success" onclick="Inventory.adjust(${item.id}, 1)">+</button>
                        <button class="btn btn-danger" onclick="Inventory.adjust(${item.id}, -1)">-</button>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    addIngredient() {
        const name = document.getElementById('newIngredientName').value.trim();
        const qty = parseInt(document.getElementById('newIngredientQty').value) || 0;
        
        if (!name) {
            Utils.showNotification('Please enter ingredient name', 'error');
            return;
        }
        
        State.inventory.push({
            id: State.getNextId(State.inventory),
            name: name,
            quantity: qty,
            unit: 'units'
        });
        
        document.getElementById('newIngredientName').value = '';
        document.getElementById('newIngredientQty').value = '';
        
        State.save();
        this.renderList();
        Utils.logAction('inventory_add', `Added ${name}`);
    },
    
    adjust(itemId, direction) {
        const item = State.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        const input = document.getElementById(`adjust-${itemId}`);
        const amount = parseInt(input.value) || 0;
        
        if (amount <= 0) {
            Utils.showNotification('Please enter a valid quantity', 'error');
            return;
        }
        
        item.quantity += (amount * direction);
        if (item.quantity < 0) item.quantity = 0;
        
        input.value = '';
        State.save();
        this.renderList();
        Utils.logAction('inventory_adjust', `${direction > 0 ? 'Added' : 'Removed'} ${amount} ${item.unit} of ${item.name}`);
    }
};

console.log('✅ Reports Module Loaded');
