# 🍔 Burger POS - Modular Advanced System

## 📦 File Structure

Your POS system is now professionally organized into separate modules:

```
burger-pos/
├── index.html                      # Main HTML (entry point)
├── pos-styles.css                  # All styling
├── manifest.json                   # PWA manifest
├── sw.js                           # Service worker
│
├── JavaScript Modules:
│   ├── pos-core.js                 # Core state management & utilities
│   ├── staff-management.js         # Login, roles, staff CRUD
│   ├── attendance.js               # Clock in/out system
│   ├── ui-customization.js         # Admin UI controls
│   ├── reports.js                  # Reports, orders, inventory
│   └── pos-main.js                 # Main POS, cart, checkout
│
└── README files:
    ├── README-MODULAR-SYSTEM.md    # This file
    ├── README-ENHANCED-FEATURES.md # Feature documentation
    └── ANDROID_INSTALLATION_GUIDE.md # Installation guide
```

## 🚀 How to Deploy

### Option 1: Local Testing
1. Put all files in a single folder
2. Open `index.html` in Chrome/Firefox
3. Login with default credentials

### Option 2: Web Hosting (Recommended for Android)
1. Upload ALL files to your hosting:
   - GitHub Pages (free)
   - Netlify (free)
   - Vercel (free)
   - Any web server

2. Visit your URL in Chrome on Android
3. Install as PWA (Add to Home Screen)

### Option 3: USB Transfer to Android
1. Copy ALL files to phone storage
2. Open `index.html` with Chrome browser
3. Bookmark for easy access

## 🔐 Default Login Credentials

- **Admin**: `admin` / `admin123`
- **Supervisor**: `supervisor` / `super123`
- **Cashier**: `cashier` / `cash123`

⚠️ Change these immediately!

## 📚 Module Descriptions

### 1. pos-core.js (Foundation)
- Global state management
- Data persistence (localStorage)
- Utility functions
- Action logging
- Backup/restore system
- View management

**Key Functions:**
- `State.save()` - Saves all data
- `State.load()` - Loads saved data
- `Utils.showNotification()` - Shows toast messages
- `Utils.logAction()` - Logs all actions
- `Utils.requestApproval()` - Supervisor approval workflow

### 2. staff-management.js (Users & Security)
- Login/logout system
- Role-based permissions
- Staff CRUD operations
- Action logs viewing
- Password management

**Roles:**
- **Cashier**: Basic POS only
- **Supervisor**: + Approvals, attendance, reports
- **Admin**: Full access to everything

**Key Functions:**
- `Auth.login()` - User authentication
- `Auth.checkPermission()` - Role verification
- `StaffMgmt.addStaff()` - Add new staff
- `StaffMgmt.editStaff()` - Edit staff details

### 3. attendance.js (Time Tracking)
- Clock in/out functionality
- Attendance records
- Hours calculation
- CSV export
- Edit attendance (supervisor only)

**Key Functions:**
- `Attendance.clockIn()` - Start shift
- `Attendance.clockOut()` - End shift
- `Attendance.exportAttendance()` - Export to CSV

### 4. ui-customization.js (Appearance)
- Button size control
- Font size control
- Grid layout options
- Category colors
- Theme presets
- Live preview
- Store settings

**Key Functions:**
- `AdminUI.updatePreview()` - Live UI preview
- `AdminUI.saveUISettings()` - Save customizations
- `AdminUI.applyTheme()` - Apply preset themes

### 5. reports.js (Analytics)
- Sales statistics
- Staff performance
- Order history
- Inventory management
- Order status tracking
- CSV exports

**Key Functions:**
- `Reports.render()` - Show all reports
- `Reports.exportReport()` - Export sales data
- `Orders.updateStatus()` - Change order status
- `Orders.voidOrder()` - Void with approval

### 6. pos-main.js (Core Operations)
- Menu rendering
- Cart management
- Item customization
- Discount system
- Checkout process
- Receipt generation
- Quick actions

**Key Functions:**
- `POS.addToCart()` - Add items
- `POS.checkout()` - Start checkout
- `POS.completePayment()` - Finish order
- `POS.repeatLastOrder()` - Reorder
- `POS.showPopularItems()` - Show bestsellers

## 🎨 Customization Guide

### Changing Colors
1. Login as Admin
2. Go to Admin panel
3. Use color pickers for categories
4. Or click a theme preset
5. Click "Save UI Settings"

### Changing Layout
- **Button Size**: 0.8x (small) to 1.5x (large)
- **Font Size**: 0.8x to 1.5x
- **Grid**: 2-6 columns
- **Images**: Toggle on/off

### Adding Menu Items
1. Admin panel → Menu Management
2. Click "+ Add New Item"
3. Fill in details
4. Upload image
5. Save

### Adding Staff
1. Staff Management panel
2. Enter name, username, role
3. Click "Add Staff"
4. Give them default password
5. They should change it immediately

## 💾 Data Management

### Backup
1. Admin panel
2. Click "Download Backup"
3. Save the .json file safely

### Restore
1. Admin panel
2. Choose backup file
3. Confirm restoration
4. Page will refresh

### What's Saved
- All menu items
- Staff accounts
- Order history
- Attendance records
- Inventory levels
- UI settings
- Action logs

## 🔒 Security Features

### Action Logging
Every important action is logged with:
- Who did it
- When it happened
- What was done
- Approval details (if required)

**Logged Actions:**
- Login/logout
- Clock in/out
- Price changes
- Discounts
- Voided orders
- Staff changes
- Menu updates

### Supervisor Approval
Required for:
- Discounts (cashiers only)
- Void orders
- Refunds

**How it Works:**
1. Cashier attempts action
2. System prompts for supervisor
3. Supervisor enters credentials
4. Action is approved and logged

### Role Permissions

**Cashier Can:**
- Take orders
- Process payments
- Clock in/out
- View inventory

**Cashier Cannot:**
- Apply discounts (needs approval)
- Edit menu
- View reports
- Manage staff

**Supervisor Can:**
- Everything cashier can
- Approve discounts
- Void orders
- Edit attendance
- View reports
- Manage attendance

**Admin Can:**
- Everything
- Full system access
- UI customization
- Staff management
- Menu management

## 📱 Quick Actions Guide

### Repeat Last Order
- Button: "🔄 Repeat Last"
- Instantly adds previous order to cart
- Great for regular customers

### Popular Items
- Button: "⭐ Popular"
- Shows top 5 best-selling items
- Auto-returns to normal after 10 seconds

### Export Reports
- CSV format
- Compatible with Excel
- Includes all order details

### Print Receipt
- Uses browser print dialog
- Formatted for receipt printers
- Clean, professional layout

## 🐛 Troubleshooting

### Cart Not Updating
- Check browser console for errors
- Clear browser cache
- Reload page

### Can't Login
- Verify credentials
- Check role selection
- Try default accounts

### Data Not Saving
- Check browser localStorage enabled
- Don't use incognito mode
- Make sure JavaScript is enabled

### Images Not Loading
- Check file paths
- Use data URLs or external URLs
- Ensure files are in same folder

### Style Not Applied
- Clear cache
- Check pos-styles.css loaded
- Verify file paths in index.html

## 🆘 Support

For issues:
1. Check browser console (F12)
2. Review action logs
3. Try backup/restore
4. Reset to defaults

## 📈 Future Enhancements

To add more features, edit the respective module:
- **New payment method?** → Edit `pos-main.js`
- **New report?** → Edit `reports.js`
- **New role?** → Edit `staff-management.js`
- **New UI option?** → Edit `ui-customization.js`

## ✨ Best Practices

1. **Backup regularly** (daily recommended)
2. **Change default passwords** immediately
3. **Review action logs** weekly
4. **Update inventory** daily
5. **Export attendance** for payroll
6. **Train staff** on their roles
7. **Test** all features before going live

---

**Enjoy your professional POS system!** 🎉

For detailed feature documentation, see `README-ENHANCED-FEATURES.md`
For Android installation, see `ANDROID_INSTALLATION_GUIDE.md`
