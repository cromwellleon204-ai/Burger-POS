// ===================================
// BURGER POS - CORE MODULE
// ===================================

// Global State Management
const State = {
    // Core Settings
    storeName: 'Burger Paradise',
    bgImage: '',
    primaryColor: '#FF6B35',
    
    // UI Customization
    uiSettings: {
        btnSize: 1,
        fontSize: 1,
        gridCols: 4,
        showImages: true,
        categoryColors: {
            Burgers: '#FF6B35',
            Sides: '#F7931E',
            Drinks: '#3498DB',
            'Add-ons': '#9B59B6'
        }
    },
    
    // Current User
    currentUser: null,
    
    // Staff Database
    staff: [
        { id: 1, name: 'Admin User', username: 'admin', password: 'admin123', role: 'admin', active: true, clockedIn: false },
        { id: 2, name: 'Supervisor User', username: 'supervisor', password: 'super123', role: 'supervisor', active: true, clockedIn: false },
        { id: 3, name: 'Cashier User', username: 'cashier', password: 'cash123', role: 'cashier', active: true, clockedIn: false }
    ],
    
    // Attendance & Logs
    attendance: [],
    actionLogs: [],
    
    // Menu & Orders
    categories: ['Burgers', 'Sides', 'Drinks', 'Add-ons'],
    currentCategory: 'Burgers',
    menu: [],
    cart: [],
    orders: [],
    inventory: [],
    discount: { type: 'percent', value: 0, approved: false, approvedBy: null },
    
    // System Variables
    currentEditItem: null,
    selectedPayment: null,
    orderNumber: 1,
    lastOrder: null,
    currentVoidOrder: null,
    pendingApprovalCallback: null,
    
    // Helper methods
    save() {
        const stateToSave = { ...this };
        delete stateToSave.currentUser; // Don't save session
        localStorage.setItem('burgerPOSAdvanced', JSON.stringify(stateToSave));
    },
    
    load() {
        const saved = localStorage.getItem('burgerPOSAdvanced');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(this, parsed);
        } else {
            this.menu = DefaultData.menu;
            this.inventory = DefaultData.inventory;
            this.save();
        }
    },
    
    getNextId(array) {
        return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
    }
};

// Default Data
const DefaultData = {
    menu: [
        { id: 1, name: 'Classic Burger', price: 150, category: 'Burgers', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23F4A460" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23fff"%3E🍔%3C/text%3E%3C/svg%3E', enabled: true, description: 'Classic beef burger' },
        { id: 2, name: 'Cheeseburger', price: 180, category: 'Burgers', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23FFD700" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23fff"%3E🧀%3C/text%3E%3C/svg%3E', enabled: true, description: 'With cheddar cheese' },
        { id: 3, name: 'Bacon Burger', price: 200, category: 'Burgers', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23CD5C5C" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23fff"%3E🥓%3C/text%3E%3C/svg%3E', enabled: true, description: 'Crispy bacon strips' },
        { id: 4, name: 'Double Burger', price: 250, category: 'Burgers', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%238B4513" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="70" text-anchor="middle" fill="%23fff"%3E🍔🍔%3C/text%3E%3C/svg%3E', enabled: true, description: 'Double patty' },
        { id: 5, name: 'French Fries', price: 80, category: 'Sides', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23FFD700" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23fff"%3E🍟%3C/text%3E%3C/svg%3E', enabled: true, description: 'Golden fries' },
        { id: 6, name: 'Onion Rings', price: 90, category: 'Sides', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23DEB887" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23fff"%3E🧅%3C/text%3E%3C/svg%3E', enabled: true, description: 'Crispy rings' },
        { id: 7, name: 'Coke', price: 50, category: 'Drinks', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23DC143C" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23fff"%3E🥤%3C/text%3E%3C/svg%3E', enabled: true, description: 'Ice cold' },
        { id: 8, name: 'Iced Tea', price: 45, category: 'Drinks', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23D2691E" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23fff"%3E🧊%3C/text%3E%3C/svg%3E', enabled: true, description: 'Refreshing' },
        { id: 9, name: 'Extra Cheese', price: 30, category: 'Add-ons', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23FFD700" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23fff"%3E🧀%3C/text%3E%3C/svg%3E', enabled: true, description: 'Add cheese' },
        { id: 10, name: 'Bacon', price: 50, category: 'Add-ons', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23CD5C5C" width="200" height="200"/%3E%3Ctext x="100" y="110" font-size="80" text-anchor="middle" fill="%23fff"%3E🥓%3C/text%3E%3C/svg%3E', enabled: true, description: 'Crispy bacon' },
    ],
    
    inventory: [
        { id: 1, name: 'Beef Patty', quantity: 100, unit: 'pcs' },
        { id: 2, name: 'Buns', quantity: 150, unit: 'pcs' },
        { id: 3, name: 'Cheese Slices', quantity: 80, unit: 'pcs' },
        { id: 4, name: 'Bacon', quantity: 60, unit: 'strips' },
        { id: 5, name: 'Lettuce', quantity: 50, unit: 'heads' },
        { id: 6, name: 'Tomatoes', quantity: 40, unit: 'pcs' },
        { id: 7, name: 'Onions', quantity: 45, unit: 'pcs' },
        { id: 8, name: 'French Fries', quantity: 200, unit: 'servings' },
    ]
};

// Utility Functions
const Utils = {
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notificationText');
        
        text.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },
    
    formatCurrency(amount) {
        return `₱${parseFloat(amount).toFixed(2)}`;
    },
    
    formatDate(date) {
        return new Date(date).toLocaleDateString();
    },
    
    formatTime(date) {
        return new Date(date).toLocaleTimeString();
    },
    
    formatDateTime(date) {
        return new Date(date).toLocaleString();
    },
    
    logAction(action, details, requiresApproval = false) {
        State.actionLogs.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            staffName: State.currentUser ? State.currentUser.name : 'System',
            role: State.currentUser ? State.currentUser.role : 'system',
            action: action,
            details: details,
            requiresApproval: requiresApproval
        });
        
        // Keep only last 500 logs
        if (State.actionLogs.length > 500) {
            State.actionLogs = State.actionLogs.slice(0, 500);
        }
        
        State.save();
    },
    
    requestApproval(action, callback) {
        const modal = document.getElementById('approvalModal');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span>🔐 Supervisor Approval Required</span>
                    <button class="modal-close" onclick="Utils.closeApprovalModal()">×</button>
                </div>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <strong>Action requires supervisor approval:</strong><br>
                    <span>${action}</span>
                </div>
                <div class="form-group">
                    <label>Supervisor Username</label>
                    <input type="text" id="approvalUsername" placeholder="Enter supervisor username">
                </div>
                <div class="form-group">
                    <label>Supervisor Password / PIN</label>
                    <input type="password" id="approvalPassword" placeholder="Enter password or PIN">
                </div>
                <button class="btn btn-success" onclick="Utils.submitApproval()" style="width: 100%; padding: 16px;">
                    Approve
                </button>
            </div>
        `;
        State.pendingApprovalCallback = callback;
        modal.classList.add('active');
    },
    
    closeApprovalModal() {
        document.getElementById('approvalModal').classList.remove('active');
        State.pendingApprovalCallback = null;
    },
    
    submitApproval() {
        const username = document.getElementById('approvalUsername').value.trim();
        const password = document.getElementById('approvalPassword').value;
        
        const supervisor = State.staff.find(s => 
            s.username === username && 
            s.password === password && 
            (s.role === 'supervisor' || s.role === 'admin') &&
            s.active
        );
        
        if (supervisor) {
            if (State.pendingApprovalCallback) {
                State.pendingApprovalCallback(supervisor);
            }
            Utils.closeApprovalModal();
            Utils.showNotification('Approval granted', 'success');
        } else {
            Utils.showNotification('Invalid supervisor credentials', 'error');
        }
    },
    
    exportToCSV(data, filename) {
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    backupData() {
        const backup = JSON.stringify(State, null, 2);
        const blob = new Blob([backup], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `burger-pos-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Utils.showNotification('Backup downloaded successfully', 'success');
        Utils.logAction('backup', 'System data backed up');
    },
    
    restoreData(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backup = JSON.parse(e.target.result);
                if (confirm('This will restore all data from the backup. Current data will be replaced. Continue?')) {
                    Object.assign(State, backup);
                    State.currentUser = null; // Clear session
                    State.save();
                    Utils.showNotification('Data restored successfully. Please refresh the page.', 'success');
                    Utils.logAction('restore', 'System data restored from backup');
                    setTimeout(() => location.reload(), 2000);
                }
            } catch (error) {
                Utils.showNotification('Invalid backup file', 'error');
            }
        };
        reader.readAsText(file);
    }
};

// Views Management
const Views = {
    current: 'pos',
    
    show(view) {
        // Hide all views
        ['posView', 'adminView', 'staffView', 'attendanceView', 'reportsView', 'ordersView', 'inventoryView'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        
        // Show selected view
        const viewMap = {
            'pos': 'posView',
            'admin': 'adminView',
            'staff': 'staffView',
            'attendance': 'attendanceView',
            'reports': 'reportsView',
            'orders': 'ordersView',
            'inventory': 'inventoryView'
        };
        
        const viewId = viewMap[view];
        if (viewId) {
            document.getElementById(viewId).classList.remove('hidden');
            this.current = view;
            
            // Render specific view
            switch(view) {
                case 'pos':
                    POS.renderCategories();
                    POS.renderMenu();
                    break;
                case 'admin':
                    AdminUI.render();
                    break;
                case 'staff':
                    StaffMgmt.render();
                    break;
                case 'attendance':
                    Attendance.render();
                    break;
                case 'reports':
                    Reports.render();
                    break;
                case 'orders':
                    Orders.render();
                    break;
                case 'inventory':
                    Inventory.render();
                    break;
            }
        }
    },
    
    backToPOS() {
        this.show('pos');
    }
};

// Make Views.backToPOS available globally for onclick
window.backToPOS = () => Views.backToPOS();

console.log('✅ POS Core Module Loaded');
