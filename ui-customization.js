// ===================================
// UI CUSTOMIZATION MODULE
// ===================================

const AdminUI = {
    render() {
        const container = document.getElementById('adminView');
        container.innerHTML = `
            <div class="menu-section">
                <button class="btn btn-light" onclick="Views.backToPOS()" style="margin-bottom: 20px;">← Back to POS</button>
                
                <div style="display: grid; gap: 20px;">
                    ${this.renderUICustomization()}
                    ${this.renderStoreSettings()}
                    ${this.renderMenuManagement()}
                    ${this.renderBackupRestore()}
                </div>
            </div>
        `;
        
        this.loadCurrentSettings();
    },
    
    renderUICustomization() {
        return `
            <div class="settings-card">
                <h3>🎨 UI Customization</h3>
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label><strong>Button Size</strong></label>
                        <div class="slider-control">
                            <span>Small</span>
                            <input type="range" id="btnSizeSlider" min="0.8" max="1.5" step="0.1" value="1" oninput="AdminUI.updatePreview()">
                            <span>Large</span>
                            <span class="slider-value" id="btnSizeValue">1.0x</span>
                        </div>
                    </div>
                    
                    <div>
                        <label><strong>Font Size</strong></label>
                        <div class="slider-control">
                            <span>Small</span>
                            <input type="range" id="fontSizeSlider" min="0.8" max="1.5" step="0.1" value="1" oninput="AdminUI.updatePreview()">
                            <span>Large</span>
                            <span class="slider-value" id="fontSizeValue">1.0x</span>
                        </div>
                    </div>
                    
                    <div>
                        <label><strong>Grid Columns</strong></label>
                        <div class="slider-control">
                            <span>2x2</span>
                            <input type="range" id="gridColsSlider" min="2" max="6" step="1" value="4" oninput="AdminUI.updatePreview()">
                            <span>6x6</span>
                            <span class="slider-value" id="gridColsValue">4</span>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="showImagesToggle" checked onchange="AdminUI.updatePreview()">
                            <span><strong>Show Item Images</strong></span>
                        </label>
                    </div>
                    
                    <div>
                        <label><strong>Category Colors</strong></label>
                        <div class="color-grid">
                            <div class="color-picker-group">
                                <input type="color" id="burgersColor" value="#FF6B35" onchange="AdminUI.updatePreview()">
                                <span>Burgers</span>
                            </div>
                            <div class="color-picker-group">
                                <input type="color" id="sidesColor" value="#F7931E" onchange="AdminUI.updatePreview()">
                                <span>Sides</span>
                            </div>
                            <div class="color-picker-group">
                                <input type="color" id="drinksColor" value="#3498DB" onchange="AdminUI.updatePreview()">
                                <span>Drinks</span>
                            </div>
                            <div class="color-picker-group">
                                <input type="color" id="addonsColor" value="#9B59B6" onchange="AdminUI.updatePreview()">
                                <span>Add-ons</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label><strong>Theme Presets</strong></label>
                        <div class="theme-presets">
                            <div class="theme-preset" style="background: linear-gradient(135deg, #FF6B35, #F7931E);" onclick="AdminUI.applyTheme('orange')">Orange</div>
                            <div class="theme-preset" style="background: linear-gradient(135deg, #E74C3C, #C0392B);" onclick="AdminUI.applyTheme('red')">Red</div>
                            <div class="theme-preset" style="background: linear-gradient(135deg, #3498DB, #2980B9);" onclick="AdminUI.applyTheme('blue')">Blue</div>
                            <div class="theme-preset" style="background: linear-gradient(135deg, #2ECC71, #27AE60);" onclick="AdminUI.applyTheme('green')">Green</div>
                            <div class="theme-preset" style="background: linear-gradient(135deg, #9B59B6, #8E44AD);" onclick="AdminUI.applyTheme('purple')">Purple</div>
                            <div class="theme-preset" style="background: linear-gradient(135deg, #34495E, #2C3E50);" onclick="AdminUI.applyTheme('dark')">Dark</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-success" onclick="AdminUI.saveUISettings()">💾 Save UI Settings</button>
                    <button class="btn btn-light" onclick="AdminUI.resetUISettings()">🔄 Reset</button>
                </div>
            </div>
        `;
    },
    
    renderStoreSettings() {
        return `
            <div class="settings-card">
                <h3>🏪 Store Settings</h3>
                <div class="form-group">
                    <label>Store Name</label>
                    <input type="text" id="adminStoreName" placeholder="Enter store name">
                </div>
                <div class="form-group">
                    <label>Primary Color</label>
                    <input type="color" id="adminPrimaryColor" value="#FF6B35">
                </div>
                <button class="btn btn-success" onclick="AdminUI.saveStoreSettings()">Save Store Settings</button>
            </div>
        `;
    },
    
    renderMenuManagement() {
        return `
            <div class="settings-card">
                <h3>🍔 Menu Management</h3>
                <button class="btn btn-primary" onclick="POS.showAddItemModal()">+ Add New Item</button>
                <div style="max-height: 400px; overflow-y: auto; margin-top: 15px;" id="adminMenuList"></div>
            </div>
        `;
    },
    
    renderBackupRestore() {
        return `
            <div class="settings-card">
                <h3>💾 Backup & Restore</h3>
                <button class="btn btn-success" onclick="Utils.backupData()" style="width: 100%; margin-bottom: 10px;">
                    📥 Download Backup
                </button>
                <div class="form-group">
                    <label>Restore from Backup</label>
                    <input type="file" id="restoreFile" accept=".json" onchange="Utils.restoreData(this.files[0])">
                </div>
            </div>
        `;
    },
    
    loadCurrentSettings() {
        document.getElementById('btnSizeSlider').value = State.uiSettings.btnSize;
        document.getElementById('fontSizeSlider').value = State.uiSettings.fontSize;
        document.getElementById('gridColsSlider').value = State.uiSettings.gridCols;
        document.getElementById('showImagesToggle').checked = State.uiSettings.showImages;
        
        document.getElementById('burgersColor').value = State.uiSettings.categoryColors.Burgers;
        document.getElementById('sidesColor').value = State.uiSettings.categoryColors.Sides;
        document.getElementById('drinksColor').value = State.uiSettings.categoryColors.Drinks;
        document.getElementById('addonsColor').value = State.uiSettings.categoryColors['Add-ons'];
        
        document.getElementById('adminStoreName').value = State.storeName;
        document.getElementById('adminPrimaryColor').value = State.primaryColor;
        
        this.updatePreview();
        this.renderAdminMenuList();
    },
    
    updatePreview() {
        const btnSize = parseFloat(document.getElementById('btnSizeSlider').value);
        const fontSize = parseFloat(document.getElementById('fontSizeSlider').value);
        const gridCols = parseInt(document.getElementById('gridColsSlider').value);
        const showImages = document.getElementById('showImagesToggle').checked;
        
        document.getElementById('btnSizeValue').textContent = btnSize.toFixed(1) + 'x';
        document.getElementById('fontSizeValue').textContent = fontSize.toFixed(1) + 'x';
        document.getElementById('gridColsValue').textContent = gridCols;
        
        document.documentElement.style.setProperty('--btn-size', btnSize);
        document.documentElement.style.setProperty('--font-size', fontSize);
        document.documentElement.style.setProperty('--grid-cols', gridCols);
        document.documentElement.style.setProperty('--show-images', showImages ? 'block' : 'none');
        
        document.documentElement.style.setProperty('--burgers-color', document.getElementById('burgersColor').value);
        document.documentElement.style.setProperty('--sides-color', document.getElementById('sidesColor').value);
        document.documentElement.style.setProperty('--drinks-color', document.getElementById('drinksColor').value);
        document.documentElement.style.setProperty('--addons-color', document.getElementById('addonsColor').value);
    },
    
    saveUISettings() {
        State.uiSettings = {
            btnSize: parseFloat(document.getElementById('btnSizeSlider').value),
            fontSize: parseFloat(document.getElementById('fontSizeSlider').value),
            gridCols: parseInt(document.getElementById('gridColsSlider').value),
            showImages: document.getElementById('showImagesToggle').checked,
            categoryColors: {
                Burgers: document.getElementById('burgersColor').value,
                Sides: document.getElementById('sidesColor').value,
                Drinks: document.getElementById('drinksColor').value,
                'Add-ons': document.getElementById('addonsColor').value
            }
        };
        
        State.save();
        Utils.logAction('ui_settings_changed', 'UI customization saved');
        Utils.showNotification('UI settings saved successfully!', 'success');
    },
    
    resetUISettings() {
        if (!confirm('Reset all UI settings to default?')) return;
        
        State.uiSettings = {
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
        };
        
        this.loadCurrentSettings();
        State.save();
        Utils.logAction('ui_settings_reset', 'UI settings reset to default');
        Utils.showNotification('UI settings reset to default', 'success');
    },
    
    applyTheme(theme) {
        const themes = {
            orange: { burgers: '#FF6B35', sides: '#F7931E', drinks: '#FFB84D', addons: '#FFA500' },
            red: { burgers: '#E74C3C', sides: '#C0392B', drinks: '#EC7063', addons: '#F1948A' },
            blue: { burgers: '#3498DB', sides: '#2980B9', drinks: '#5DADE2', addons: '#85C1E9' },
            green: { burgers: '#2ECC71', sides: '#27AE60', drinks: '#58D68D', addons: '#82E0AA' },
            purple: { burgers: '#9B59B6', sides: '#8E44AD', drinks: '#AF7AC5', addons: '#C39BD3' },
            dark: { burgers: '#34495E', sides: '#2C3E50', drinks: '#5D6D7E', addons: '#85929E' }
        };
        
        const colors = themes[theme];
        document.getElementById('burgersColor').value = colors.burgers;
        document.getElementById('sidesColor').value = colors.sides;
        document.getElementById('drinksColor').value = colors.drinks;
        document.getElementById('addonsColor').value = colors.addons;
        
        this.updatePreview();
        Utils.showNotification(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`, 'success');
    },
    
    saveStoreSettings() {
        State.storeName = document.getElementById('adminStoreName').value;
        State.primaryColor = document.getElementById('adminPrimaryColor').value;
        
        document.getElementById('storeName').textContent = State.storeName;
        document.documentElement.style.setProperty('--primary-color', State.primaryColor);
        
        State.save();
        Utils.logAction('store_settings_changed', 'Store settings updated');
        Utils.showNotification('Store settings saved!', 'success');
    },
    
    renderAdminMenuList() {
        const container = document.getElementById('adminMenuList');
        if (!container) return;
        
        container.innerHTML = State.menu.map(item => `
            <div style="background: var(--light); padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>₱${item.price.toFixed(2)} - ${item.category}</small>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <div class="toggle-switch ${item.enabled ? 'active' : ''}" onclick="AdminUI.toggleItem(${item.id})"></div>
                    <button class="btn btn-light" onclick="POS.showEditModal(${item.id})" style="padding: 8px 16px;">✏️</button>
                </div>
            </div>
        `).join('');
    },
    
    toggleItem(itemId) {
        const item = State.menu.find(i => i.id === itemId);
        if (item) {
            item.enabled = !item.enabled;
            State.save();
            this.renderAdminMenuList();
            POS.renderMenu();
            Utils.logAction('menu_item_toggle', `${item.enabled ? 'Enabled' : 'Disabled'} ${item.name}`);
        }
    }
};

console.log('✅ UI Customization Module Loaded');
