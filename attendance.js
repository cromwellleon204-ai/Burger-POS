// ===================================
// ATTENDANCE TRACKING MODULE
// ===================================

const Attendance = {
    toggleClock() {
        if (!State.currentUser) return;
        
        if (State.currentUser.clockedIn) {
            this.clockOut();
        } else {
            this.clockIn();
        }
    },
    
    clockIn() {
        if (!State.currentUser) return;
        
        const now = new Date();
        const staff = State.staff.find(s => s.id === State.currentUser.id);
        
        if (staff) {
            staff.clockedIn = true;
            staff.clockInTime = now.toISOString();
            
            State.attendance.push({
                id: Date.now(),
                staffId: State.currentUser.id,
                staffName: State.currentUser.name,
                date: now.toLocaleDateString(),
                timeIn: now.toLocaleTimeString(),
                timeOut: null,
                totalHours: null
            });
            
            State.currentUser.clockedIn = true;
            State.currentUser.clockInTime = now.toISOString();
            
            Auth.updateUserDisplay();
            State.save();
            Utils.logAction('clock_in', `${State.currentUser.name} clocked in`);
            Utils.showNotification('Clocked in successfully', 'success');
        }
    },
    
    clockOut() {
        if (!State.currentUser) return;
        
        const now = new Date();
        const staff = State.staff.find(s => s.id === State.currentUser.id);
        
        if (staff) {
            staff.clockedIn = false;
            
            // Find today's attendance record
            const todayRecord = State.attendance.find(a => 
                a.staffId === State.currentUser.id && 
                a.date === now.toLocaleDateString() &&
                !a.timeOut
            );
            
            if (todayRecord && staff.clockInTime) {
                todayRecord.timeOut = now.toLocaleTimeString();
                const clockIn = new Date(staff.clockInTime);
                const hours = ((now - clockIn) / (1000 * 60 * 60)).toFixed(2);
                todayRecord.totalHours = hours;
            }
            
            delete staff.clockInTime;
            State.currentUser.clockedIn = false;
            delete State.currentUser.clockInTime;
            
            Auth.updateUserDisplay();
            State.save();
            Utils.logAction('clock_out', `${State.currentUser.name} clocked out`);
            Utils.showNotification('Clocked out successfully', 'success');
        }
    },
    
    render() {
        const container = document.getElementById('attendanceView');
        container.innerHTML = `
            <div class="menu-section">
                <button class="btn btn-light" onclick="Views.backToPOS()" style="margin-bottom: 20px;">← Back to POS</button>
                
                <h2 style="margin-bottom: 20px;">🕐 Staff Attendance</h2>
                
                <div class="settings-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3>Attendance Records</h3>
                        <button class="btn btn-success" onclick="Attendance.exportAttendance()">📥 Export</button>
                    </div>
                    <div class="attendance-list" id="attendanceList"></div>
                </div>
            </div>
        `;
        
        this.renderAttendanceList();
    },
    
    renderAttendanceList() {
        const container = document.getElementById('attendanceList');
        if (!container) return;
        
        if (State.attendance.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No attendance records yet</p>';
            return;
        }
        
        // Group by date (most recent first)
        const groupedByDate = {};
        State.attendance.forEach(record => {
            if (!groupedByDate[record.date]) {
                groupedByDate[record.date] = [];
            }
            groupedByDate[record.date].push(record);
        });
        
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
        
        container.innerHTML = sortedDates.slice(0, 30).map(date => `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; margin-bottom: 10px; padding: 10px; background: var(--primary-color); color: white; border-radius: 8px;">
                    ${date}
                </div>
                ${groupedByDate[date].map(record => `
                    <div class="attendance-item">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; margin-bottom: 5px;">${record.staffName}</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 14px; color: #666;">
                                <div><strong>In:</strong> ${record.timeIn}</div>
                                <div><strong>Out:</strong> ${record.timeOut || 'Still clocked in'}</div>
                                <div><strong>Hours:</strong> ${record.totalHours ? record.totalHours + 'h' : '-'}</div>
                            </div>
                        </div>
                        ${Auth.checkPermission('supervisor') ? `
                            <button class="btn btn-light" onclick="Attendance.editRecord(${record.id})" style="padding: 8px 16px;">✏️</button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('');
    },
    
    editRecord(recordId) {
        const record = State.attendance.find(r => r.id === recordId);
        if (!record) return;
        
        const newTimeOut = prompt('Edit Time Out (HH:MM:SS format):', record.timeOut || '');
        if (newTimeOut === null) return;
        
        if (newTimeOut) {
            record.timeOut = newTimeOut;
            
            // Recalculate hours
            try {
                const timeInParts = record.timeIn.split(':');
                const timeOutParts = newTimeOut.split(':');
                const timeIn = new Date();
                timeIn.setHours(parseInt(timeInParts[0]), parseInt(timeInParts[1]), parseInt(timeInParts[2] || 0));
                const timeOut = new Date();
                timeOut.setHours(parseInt(timeOutParts[0]), parseInt(timeOutParts[1]), parseInt(timeOutParts[2] || 0));
                
                const hours = ((timeOut - timeIn) / (1000 * 60 * 60)).toFixed(2);
                record.totalHours = hours;
            } catch (e) {
                Utils.showNotification('Invalid time format', 'error');
                return;
            }
            
            State.save();
            this.renderAttendanceList();
            Utils.showNotification('Attendance record updated', 'success');
            Utils.logAction('attendance_edit', `Edited attendance for ${record.staffName} on ${record.date}`);
        }
    },
    
    exportAttendance() {
        const data = [
            ['Staff Name', 'Date', 'Time In', 'Time Out', 'Total Hours'],
            ...State.attendance.map(r => [
                r.staffName,
                r.date,
                r.timeIn,
                r.timeOut || 'N/A',
                r.totalHours || 'N/A'
            ])
        ];
        
        Utils.exportToCSV(data, `attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
        Utils.showNotification('Attendance report exported', 'success');
        Utils.logAction('export', 'Attendance report exported');
    }
};

console.log('✅ Attendance Module Loaded');
