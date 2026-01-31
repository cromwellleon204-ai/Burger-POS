// ===================================
// STAFF MANAGEMENT & AUTHENTICATION
// ===================================

const Auth = {
    selectedRole: 'cashier',
    
    selectRole(role) {
        this.selectedRole = role;
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-role="${role}"]`).classList.add('active');
    },
    
    login() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            Utils.showNotification('Please enter username and password', 'error');
            return;
        }
        
        const user = State.staff.find(s => 
            s.username === username && 
            s.password === password && 
            s.role === this.selectedRole &&
            s.active
        );
        
        if (user) {
            State.currentUser = user;
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            this.updateUserDisplay();
            this.updateUIPermissions();
            Utils.logAction('login', `${user.name} logged in as ${user.role}`);
            Utils.showNotification(`Welcome ${user.name}!`, 'success');
            POS.init();
        } else {
            Utils.showNotification('Invalid credentials or role mismatch', 'error');
        }
    },
    
    logout() {
        if (State.currentUser && State.currentUser.clockedIn) {
            if (!confirm('You are still clocked in. Clock out before logging out?')) {
                return;
            }
            Attendance.clockOut();
        }
        
        if (State.currentUser) {
            Utils.logAction('logout', `${State.currentUser.name} logged out`);
        }
        
        State.currentUser = null;
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        Views.backToPOS();
    },
    
    updateUserDisplay() {
        if (!State.currentUser) return;
        
        document.getElementById('currentUserDisplay').textContent = State.currentUser.name;
        document.getElementById('currentRoleDisplay').textContent = `Role: ${State.currentUser.role.charAt(0).toUpperCase() + State.currentUser.role.slice(1)}`;
        
        const clockBtn = document.getElementById('clockBtn');
        if (State.currentUser.clockedIn) {
            clockBtn.textContent = 'Clock Out';
            clockBtn.classList.add('clocked-in');
        } else {
            clockBtn.textContent = 'Clock In';
            clockBtn.classList.remove('clocked-in');
        }
    },
    
    updateUIPermissions() {
        if (!State.currentUser) return;
        
        const role = State.currentUser.role;
        
        // Hide certain buttons based on role
        const adminBtn = document.getElementById('btnAdmin');
        const staffBtn = document.getElementById('btnStaffMgmt');
        
        if (role === 'cashier') {
            adminBtn.classList.add('hidden');
            staffBtn.classList.add('hidden');
        } else {
            adminBtn.classList.remove('hidden');
            staffBtn.classList.remove('hidden');
        }
    },
    
    checkPermission(requiredRole) {
        if (!State.currentUser) return false;
        
        const roleHierarchy = {
            'cashier': 1,
            'supervisor': 2,
            'admin': 3
        };
        
        return roleHierarchy[State.currentUser.role] >= roleHierarchy[requiredRole];
    }
};

const StaffMgmt = {
    currentEditStaff: null,
    
    render() {
        const container = document.getElementById('staffView');
        container.innerHTML = `
            <div class="menu-section">
                <button class="btn btn-light" onclick="Views.backToPOS()" style="margin-bottom: 20px;">← Back to POS</button>
                
                <h2 style="margin-bottom: 20px;">👥 Staff Management</h2>
                
                <div class="settings-card" style="margin-bottom: 20px;">
                    <h3>Add New Staff</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px;">
                        <input type="text" id="newStaffName" placeholder="Full name" class="form-control">
                        <input type="text" id="newStaffUsername" placeholder="Username" class="form-control">
                        <select id="newStaffRole" class="form-control">
                            <option value="cashier">Cashier</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button class="btn btn-primary" onclick="StaffMgmt.addStaff()">Add Staff</button>
                    </div>
                </div>
                
                <div class="staff-list" id="staffList"></div>

                <div class="settings-card" style="margin-top: 20px;">
                    <h3>📋 Action Logs</h3>
                    <div style="max-height: 400px; overflow-y: auto;" id="actionLogsList"></div>
                </div>
            </div>
        `;
        
        this.renderStaffList();
        this.renderActionLogs();
    },
    
    renderStaffList() {
        const container = document.getElementById('staffList');
        if (!container) return;
        
        container.innerHTML = State.staff.map(staff => `
            <div class="staff-item">
                <div>
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${staff.name}</div>
                    <div style="font-size: 12px; color: #666;">
                        @${staff.username} • ${staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="staff-status ${staff.active ? 'status-active' : 'status-inactive'}">
                        ${staff.active ? 'Active' : 'Inactive'}
                    </span>
                    ${staff.clockedIn ? '<span class="staff-status status-clocked-in">Clocked In</span>' : ''}
                    <button class="btn btn-light" onclick="StaffMgmt.editStaff(${staff.id})">✏️ Edit</button>
                </div>
            </div>
        `).join('');
    },
    
    renderActionLogs() {
        const container = document.getElementById('actionLogsList');
        if (!container) return;
        
        if (State.actionLogs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No action logs yet</p>';
            return;
        }
        
        container.innerHTML = State.actionLogs.slice(0, 50).map(log => `
            <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${log.requiresApproval ? 'var(--warning)' : 'var(--primary-color)'}; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold;">
                    <span>${log.staffName} (${log.role})</span>
                    <span>${Utils.formatDateTime(log.timestamp)}</span>
                </div>
                <div style="color: #666; font-size: 11px;">
                    <strong>${log.action}:</strong> ${log.details}
                </div>
            </div>
        `).join('');
    },
    
    addStaff() {
        const name = document.getElementById('newStaffName').value.trim();
        const username = document.getElementById('newStaffUsername').value.trim();
        const role = document.getElementById('newStaffRole').value;
        
        if (!name || !username) {
            Utils.showNotification('Please enter name and username', 'error');
            return;
        }
        
        // Check if username exists
        if (State.staff.find(s => s.username === username)) {
            Utils.showNotification('Username already exists', 'error');
            return;
        }
        
        const defaultPassword = 'pass123'; // Staff should change this immediately
        
        const newStaff = {
            id: State.getNextId(State.staff),
            name: name,
            username: username,
            password: defaultPassword,
            role: role,
            active: true,
            clockedIn: false
        };
        
        State.staff.push(newStaff);
        State.save();
        
        document.getElementById('newStaffName').value = '';
        document.getElementById('newStaffUsername').value = '';
        
        this.renderStaffList();
        Utils.showNotification(`Staff added! Default password: ${defaultPassword}`, 'success');
        Utils.logAction('staff_add', `Added new ${role}: ${name}`);
    },
    
    editStaff(staffId) {
        const staff = State.staff.find(s => s.id === staffId);
        if (!staff) return;
        
        this.currentEditStaff = staff;
        
        const modal = document.getElementById('staffEditModal');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span>Edit Staff Member</span>
                    <button class="modal-close" onclick="StaffMgmt.closeEditModal()">×</button>
                </div>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="editStaffName" value="${staff.name}">
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="editStaffUsername" value="${staff.username}">
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="editStaffRole">
                        <option value="cashier" ${staff.role === 'cashier' ? 'selected' : ''}>Cashier</option>
                        <option value="supervisor" ${staff.role === 'supervisor' ? 'selected' : ''}>Supervisor</option>
                        <option value="admin" ${staff.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>New Password (leave blank to keep current)</label>
                    <input type="password" id="editStaffPassword" placeholder="Enter new password">
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="editStaffActive" ${staff.active ? 'checked' : ''}>
                        <span>Active</span>
                    </label>
                </div>
                <div style="display: grid; gap: 10px;">
                    <button class="btn btn-success" onclick="StaffMgmt.saveStaffEdit()">Save Changes</button>
                    ${staff.id !== State.currentUser.id ? '<button class="btn btn-danger" onclick="StaffMgmt.deleteStaff()">Delete Staff</button>' : ''}
                </div>
            </div>
        `;
        modal.classList.add('active');
    },
    
    closeEditModal() {
        document.getElementById('staffEditModal').classList.remove('active');
        this.currentEditStaff = null;
    },
    
    saveStaffEdit() {
        if (!this.currentEditStaff) return;
        
        const staff = State.staff.find(s => s.id === this.currentEditStaff.id);
        if (!staff) return;
        
        staff.name = document.getElementById('editStaffName').value.trim();
        staff.username = document.getElementById('editStaffUsername').value.trim();
        staff.role = document.getElementById('editStaffRole').value;
        staff.active = document.getElementById('editStaffActive').checked;
        
        const newPassword = document.getElementById('editStaffPassword').value;
        if (newPassword) {
            staff.password = newPassword;
        }
        
        State.save();
        this.closeEditModal();
        this.renderStaffList();
        Utils.showNotification('Staff updated successfully', 'success');
        Utils.logAction('staff_edit', `Updated staff: ${staff.name}`);
    },
    
    deleteStaff() {
        if (!this.currentEditStaff) return;
        
        if (!confirm('Are you sure you want to delete this staff member?')) return;
        
        const staff = this.currentEditStaff;
        State.staff = State.staff.filter(s => s.id !== staff.id);
        State.save();
        this.closeEditModal();
        this.renderStaffList();
        Utils.showNotification('Staff deleted successfully', 'success');
        Utils.logAction('staff_delete', `Deleted staff: ${staff.name}`);
    }
};

console.log('✅ Staff Management Module Loaded');
