// Admin Dashboard JavaScript

// Backend API URL
const API_URL = 'http://localhost:5002/api';

// Store auth token
let authToken = localStorage.getItem('darkPinoAdminToken') || null;

// Orders data from backend
let orders = [];

// Current selected order
let currentOrder = null;

// Authentication with backend
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    try {
        // Login to backend
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@darkpinopeptides.com',
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            // Store token
            authToken = result.token;
            localStorage.setItem('darkPinoAdminToken', authToken);
            
            // Show dashboard
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'flex';
            loadDashboard();
        } else {
            alert('Invalid credentials. Use password: DarkPino2024!');
            document.getElementById('adminPassword').value = '';
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Make sure the backend server is running.');
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    authToken = null;
    localStorage.removeItem('darkPinoAdminToken');
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPassword').value = '';
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Update page title
        const tab = this.dataset.tab;
        const titles = {
            orders: 'Orders Management',
            analytics: 'Analytics Dashboard',
            products: 'Products Management',
            settings: 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[tab];
        
        // Show corresponding tab
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tab + 'Tab').classList.add('active');
    });
});

// Load Dashboard
async function loadDashboard() {
    await fetchOrders();
    updateStats();
    loadOrders();
    updateOrderCount();
}

// Fetch orders from backend
async function fetchOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const result = await response.json();
        
        if (result.success) {
            orders = result.orders;
        } else {
            console.error('Failed to fetch orders:', result.message);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

// Update Statistics
function updateStats() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totals?.total || order.total || 0), 0);
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
}

// Update Order Count Badge
function updateOrderCount() {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const orderCountBadge = document.querySelector('.order-count');
    if (orderCountBadge) {
        orderCountBadge.textContent = pendingCount;
        orderCountBadge.style.display = pendingCount > 0 ? 'block' : 'none';
    }
}

// Load Orders
function loadOrders(filter = 'all') {
    const tbody = document.getElementById('ordersTableBody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    
    let filteredOrders = orders;
    if (filter !== 'all') {
        filteredOrders = orders.filter(o => o.status === filter);
    }
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '';
        noOrdersMessage.style.display = 'flex';
        return;
    }
    
    noOrdersMessage.style.display = 'none';
    tbody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td><span class="order-id">${order.orderNumber || order._id}</span></td>
            <td>${new Date(order.createdAt || order.date).toLocaleDateString()}</td>
            <td>
                <div>${order.customer.firstName} ${order.customer.lastName}</div>
                <div style="font-size: 0.875rem; color: var(--text-dim);">${order.customer.email}</div>
            </td>
            <td>${order.items.length} items</td>
            <td><strong>$${(order.totals?.total || order.total || 0).toFixed(2)}</strong></td>
            <td>
                <span class="payment-method">
                    ${getPaymentIcon(order.payment?.method || order.paymentMethod)}
                    ${order.payment?.method || order.paymentMethod || 'N/A'}
                </span>
            </td>
            <td>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action" onclick="viewOrder('${order._id}')" title="View Details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn-action" onclick="printLabel('${order._id}')" title="Print Label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get Payment Icon
function getPaymentIcon(payment) {
    const icons = {
        card: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
        solana: '<svg width="16" height="16" viewBox="0 0 397.7 311.7" fill="currentColor"><path d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/><path d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/><path d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/></svg>',
        etransfer: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
    };
    return icons[payment] || '';
}

// Filter Orders
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        loadOrders(this.dataset.filter);
    });
});

// View Order Details
function viewOrder(orderId) {
    currentOrder = orders.find(o => o._id === orderId);
    if (!currentOrder) return;
    
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderDetailsContent');
    
    content.innerHTML = `
        <div class="order-info">
            <div class="info-section">
                <h3>Order Information</h3>
                <div class="info-row">
                    <span class="info-label">Order ID:</span>
                    <span class="info-value">${currentOrder.orderNumber || currentOrder._id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">${new Date(currentOrder.createdAt || currentOrder.date).toLocaleString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        <select id="orderStatus" class="status-select">
                            <option value="pending" ${currentOrder.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${currentOrder.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${currentOrder.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="completed" ${currentOrder.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">${currentOrder.payment}</span>
                </div>
            </div>
            
            <div class="info-section">
                <h3>Customer Information</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${currentOrder.customer.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${currentOrder.customer.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${currentOrder.customer.phone || 'N/A'}</span>
                </div>
            </div>
            
            <div class="info-section">
                <h3>Shipping Address</h3>
                <div class="info-row">
                    <span class="info-value">
                        ${currentOrder.shipping.address}<br>
                        ${currentOrder.shipping.city}, ${currentOrder.shipping.state} ${currentOrder.shipping.zip}<br>
                        ${currentOrder.shipping.country}
                    </span>
                </div>
            </div>
            
            <div class="info-section">
                <h3>Order Items</h3>
                <div class="items-list">
                    ${currentOrder.items.map(item => `
                        <div class="item-row">
                            <div>
                                <strong>${item.name}</strong>
                                <div style="font-size: 0.875rem; color: var(--text-dim);">Qty: ${item.quantity}</div>
                            </div>
                            <div>
                                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="info-row" style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--border);">
                    <span class="info-label"><strong>Total:</strong></span>
                    <span class="info-value"><strong>$${currentOrder.total.toFixed(2)}</strong></span>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close Order Modal
function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
    currentOrder = null;
}

// Update Order Status
function updateOrderStatus() {
    if (!currentOrder) return;
    
    const newStatus = document.getElementById('orderStatus').value;
    currentOrder.status = newStatus;
    
    // Update in storage
    const orderIndex = orders.findIndex(o => o.id === currentOrder.id);
    if (orderIndex !== -1) {
        orders[orderIndex] = currentOrder;
        localStorage.setItem('darkPinoOrders', JSON.stringify(orders));
    }
    
    // Refresh display
    loadOrders();
    updateStats();
    updateOrderCount();
    closeOrderModal();
    
    showNotification(`Order ${currentOrder.id} status updated to ${newStatus}`);
}

// Print Shipping Label
function printLabel(orderId) {
    const order = orderId ? orders.find(o => o.id === orderId) : currentOrder;
    if (!order) return;
    
    // Create label window
    const labelWindow = window.open('', '_blank', 'width=400,height=600');
    labelWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Shipping Label - ${order.id}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: white;
                }
                .label {
                    border: 2px solid #000;
                    padding: 20px;
                    max-width: 360px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #8b5cf6;
                }
                .section {
                    margin-bottom: 20px;
                }
                .section-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                    font-size: 12px;
                }
                .barcode {
                    text-align: center;
                    margin: 20px 0;
                    font-family: 'Courier New', monospace;
                    font-size: 18px;
                    letter-spacing: 2px;
                }
                .priority {
                    background: #8b5cf6;
                    color: white;
                    padding: 5px 10px;
                    text-align: center;
                    font-weight: bold;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="label">
                <div class="header">
                    <div class="logo">DARK PINO PEPTIDES</div>
                    <div>Research Grade Peptides</div>
                </div>
                
                <div class="section">
                    <div class="section-title">Ship To:</div>
                    <div>${order.customer.name}</div>
                    <div>${order.shipping.address}</div>
                    <div>${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip}</div>
                    <div>${order.shipping.country}</div>
                </div>
                
                <div class="section">
                    <div class="section-title">Order Details:</div>
                    <div>Order #: ${order.id}</div>
                    <div>Date: ${new Date(order.date).toLocaleDateString()}</div>
                    <div>Items: ${order.items.length}</div>
                </div>
                
                <div class="barcode">
                    |||||| ${order.id.replace('ORD-', '')} ||||||
                </div>
                
                <div class="section">
                    <div class="section-title">Contents:</div>
                    ${order.items.map(item => `
                        <div>• ${item.name} (Qty: ${item.quantity})</div>
                    `).join('')}
                </div>
                
                <div class="priority">
                    PRIORITY SHIPPING - HANDLE WITH CARE
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
}

// Refresh Orders
async function refreshOrders() {
    await fetchOrders();
    loadOrders();
    updateStats();
    updateOrderCount();
    showNotification('Orders refreshed');
}

// Export Orders to CSV
function exportOrders() {
    let csv = 'Order ID,Date,Customer Name,Email,Total,Status,Payment Method\n';
    
    orders.forEach(order => {
        csv += `"${order.id}","${new Date(order.date).toLocaleDateString()}","${order.customer.name}","${order.customer.email}","$${order.total.toFixed(2)}","${order.status}","${order.payment}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showNotification('Orders exported to CSV');
}

// Export Labels to PDF (simplified version)
function exportLabels() {
    // In production, use a library like jsPDF
    const labelData = orders.map(order => ({
        id: order.id,
        name: order.customer.name,
        address: `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip}`
    }));
    
    console.log('Label data ready for PDF export:', labelData);
    showNotification('Label export ready (check console for data)');
}

// Change Password
function changePassword() {
    const newPassword = prompt('Enter new admin password:');
    if (newPassword && newPassword.length >= 8) {
        // In production, this would update on the server
        showNotification('Password updated successfully');
    } else if (newPassword) {
        alert('Password must be at least 8 characters');
    }
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .status-select {
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        cursor: pointer;
    }
`;
document.head.appendChild(animationStyles);

// Simulate receiving orders (for demo purposes)
function simulateOrder() {
    const sampleOrder = {
        id: 'ORD-' + Date.now().toString().slice(-8),
        date: new Date().toISOString(),
        customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-0123'
        },
        shipping: {
            address: '123 Main St',
            city: 'Toronto',
            state: 'ON',
            zip: 'M5V 3A8',
            country: 'Canada'
        },
        items: [
            { name: 'BPC-157', quantity: 2, price: 89.99 },
            { name: 'TB-500', quantity: 1, price: 124.99 }
        ],
        total: 304.97,
        payment: Math.random() > 0.5 ? 'card' : 'solana',
        status: 'pending'
    };
    
    orders.unshift(sampleOrder);
    localStorage.setItem('darkPinoOrders', JSON.stringify(orders));
    
    if (document.getElementById('adminDashboard').style.display === 'flex') {
        loadDashboard();
        showNotification(`New order received: ${sampleOrder.id}`);
    }
}

// Check for new orders every 30 seconds (demo)
setInterval(() => {
    if (Math.random() > 0.8) { // 20% chance of new order
        simulateOrder();
    }
}, 30000);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date for date filters
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
});