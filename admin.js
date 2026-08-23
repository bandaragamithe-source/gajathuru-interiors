/* ============================================
   GAJATHURU INTERIORS — Admin Dashboard JavaScript
   Firebase Auth, Firestore CRUD, Orders, Settings
   ============================================ */

import { auth, db } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    where,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ============================================
// DOM REFERENCES
// ============================================
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const adminEmailDisplay = document.getElementById('adminEmailDisplay');
const welcomeName = document.getElementById('welcomeName');
const togglePassword = document.getElementById('togglePassword');

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Furniture
const furnitureGrid = document.getElementById('furnitureGrid');
const addFurnitureForm = document.getElementById('addFurnitureForm');
const btnCancelAdd = document.getElementById('btnCancelAdd');
const btnAddNewFurniture = document.getElementById('btnAddNewFurniture');
const btnAddFirstFurniture = document.getElementById('btnAddFirstFurniture');
const furnitureSearch = document.getElementById('furnitureSearch');
const furnitureFilter = document.getElementById('furnitureFilter');

// Edit Modal
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const editFurnitureForm = document.getElementById('editFurnitureForm');

// Delete Modal
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');

// Orders
const ordersTableBody = document.getElementById('ordersTableBody');
const ordersSearch = document.getElementById('ordersSearch');
const ordersFilter = document.getElementById('ordersFilter');
const ordersBadge = document.getElementById('ordersBadge');
const recentOrdersTable = document.getElementById('recentOrdersTable');

// Order Modal
const orderModal = document.getElementById('orderModal');
const closeOrderModal = document.getElementById('closeOrderModal');
const btnCloseOrderDetail = document.getElementById('btnCloseOrderDetail');
const orderDetailContent = document.getElementById('orderDetailContent');
const btnContactCustomer = document.getElementById('btnContactCustomer');

// Settings
const settingsForm = document.getElementById('settingsForm');

// Dashboard
const recentFurnitureGrid = document.getElementById('recentFurnitureGrid');
const statTotalFurniture = document.getElementById('statTotalFurniture');
const statNewOrders = document.getElementById('statNewOrders');
const statConfirmedOrders = document.getElementById('statConfirmedOrders');
const statCompletedOrders = document.getElementById('statCompletedOrders');
const currentDate = document.getElementById('currentDate');

// Loading & Toast
const loadingOverlay = document.getElementById('loadingOverlay');
const toastContainer = document.getElementById('toastContainer');

// State
const BUSINESS_WHATSAPP = "94789720335";
let currentUser = null;
let furnitureList = [];
let ordersList = [];
let deleteTargetId = null;
let furnitureUnsubscribe = null;
let ordersUnsubscribe = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    const now = new Date();
    currentDate.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    initAuth();
    initNavigation();
    initEventListeners();
});

// ============================================
// AUTHENTICATION
// ============================================

function initAuth() {
    showLoading(true);

    onAuthStateChanged(auth, (user) => {
        showLoading(false);

        if (user) {
            currentUser = user;
            showDashboard();
            adminEmailDisplay.textContent = user.email;
            welcomeName.textContent = user.email.split('@')[0];
            startRealtimeListeners();
        } else {
            currentUser = null;
            showLogin();
            stopRealtimeListeners();
        }
    });
}

function showLogin() {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
    loginForm.reset();
    loginError.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
    showPage('dashboard');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) return;

    setLoginLoading(true);
    loginError.style.display = 'none';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Welcome back, Admin!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Invalid email or password. Please try again.';
        if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
        if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
        if (error.code === 'auth/too-many-requests') message = 'Too many attempts. Please try again later.';
        if (error.code === 'auth/invalid-credential') message = 'Invalid email or password.';

        loginError.querySelector('span').textContent = message;
        loginError.style.display = 'flex';
    } finally {
        setLoginLoading(false);
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        showToast('Logged out successfully', 'info');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logging out', 'error');
    }
});

function setLoginLoading(loading) {
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');

    loginBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoader.style.display = loading ? 'inline' : 'none';
}

// Toggle password visibility
togglePassword.addEventListener('click', () => {
    const input = document.getElementById('adminPassword');
    const icon = togglePassword.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) showPage(page);
            closeMobileSidebar();
        });
    });

    // View all links
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) showPage(page);
        });
    });

    // Mobile toggle
    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', closeMobileSidebar);
}

function showPage(pageId) {
    // Update nav
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageId);
    });

    // Update pages
    pages.forEach(page => {
        page.classList.toggle('active', page.id === `page-${pageId}`);
    });

    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'furniture': 'Furniture Management',
        'add-furniture': 'Add New Furniture',
        'orders': 'Customer Orders',
        'settings': 'Website Settings'
    };
    pageTitle.textContent = titles[pageId] || 'Dashboard';

    // Refresh data for specific pages
    if (pageId === 'furniture') renderFurnitureGrid();
    if (pageId === 'orders') renderOrdersTable();
    if (pageId === 'settings') loadSettings();
}

function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
}

// ============================================
// REALTIME LISTENERS
// ============================================

function startRealtimeListeners() {
    // Listen to furniture collection
    const furnitureQuery = query(collection(db, 'furniture'), orderBy('createdAt', 'desc'));
    furnitureUnsubscribe = onSnapshot(furnitureQuery, (snapshot) => {
        furnitureList = [];
        snapshot.forEach(docSnap => {
            furnitureList.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderFurnitureGrid();
        renderRecentFurniture();
        updateStats();
    }, (error) => {
        console.error('Furniture listener error:', error);
        showToast('Error loading furniture data', 'error');
    });

    // Listen to orders collection
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    ordersUnsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        ordersList = [];
        snapshot.forEach(docSnap => {
            ordersList.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderOrdersTable();
        renderRecentOrders();
        updateStats();
        updateOrdersBadge();
    }, (error) => {
        console.error('Orders listener error:', error);
        showToast('Error loading orders', 'error');
    });
}

function stopRealtimeListeners() {
    if (furnitureUnsubscribe) furnitureUnsubscribe();
    if (ordersUnsubscribe) ordersUnsubscribe();
    furnitureUnsubscribe = null;
    ordersUnsubscribe = null;
}

// ============================================
// STATISTICS
// ============================================

function updateStats() {
    statTotalFurniture.textContent = furnitureList.length;
    statNewOrders.textContent = ordersList.filter(o => o.orderStatus === 'New').length;
    statConfirmedOrders.textContent = ordersList.filter(o => o.orderStatus === 'Confirmed').length;
    statCompletedOrders.textContent = ordersList.filter(o => o.orderStatus === 'Completed').length;
}

function updateOrdersBadge() {
    const newCount = ordersList.filter(o => o.orderStatus === 'New').length;
    ordersBadge.textContent = newCount;
    ordersBadge.style.display = newCount > 0 ? 'inline-block' : 'none';
}

// ============================================
// FURNITURE CRUD
// ============================================

function renderFurnitureGrid() {
    const searchTerm = (furnitureSearch?.value || '').toLowerCase();
    const categoryFilter = furnitureFilter?.value || 'all';

    let filtered = furnitureList.filter(item => {
        const matchesSearch = !searchTerm || 
            item.name?.toLowerCase().includes(searchTerm) ||
            item.description?.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        furnitureGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-couch"></i>
                <p>No furniture items found</p>
                <button class="btn btn-primary" id="btnAddFirstFurniture2">Add Your First Item</button>
            </div>
        `;
        document.getElementById('btnAddFirstFurniture2')?.addEventListener('click', () => showPage('add-furniture'));
        return;
    }

    furnitureGrid.innerHTML = filtered.map(item => `
        <div class="furniture-card" data-id="${item.id}">
            <div class="furniture-card-img">
                ${item.imageUrl 
                    ? `<img src="${item.imageUrl}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\'fas fa-couch no-image\'></i>';">`
                    : `<i class="fas fa-couch no-image"></i>`
                }
            </div>
            <div class="furniture-card-body">
                <h4>${escapeHtml(item.name)}</h4>
                <div class="furniture-card-meta">
                    <span class="furniture-category">${escapeHtml(item.category)}</span>
                    <span class="furniture-price">LKR ${formatPrice(item.price)}</span>
                </div>
                <p class="furniture-card-desc">${escapeHtml(item.description || 'No description')}</p>
                <div class="furniture-card-actions">
                    <button class="btn btn-outline btn-small btn-edit" data-id="${item.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small btn-delete" data-id="${item.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach event listeners
    furnitureGrid.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    furnitureGrid.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
}

function renderRecentFurniture() {
    const recent = furnitureList.slice(0, 5);

    if (recent.length === 0) {
        recentFurnitureGrid.innerHTML = `
            <div class="empty-state" style="padding:24px;">
                <i class="fas fa-couch" style="font-size:1.5rem;"></i>
                <p style="font-size:0.85rem;">No furniture added yet</p>
            </div>
        `;
        return;
    }

    recentFurnitureGrid.innerHTML = recent.map(item => `
        <div class="recent-furniture-item">
            <div class="recent-furniture-img">
                ${item.imageUrl 
                    ? `<img src="${item.imageUrl}" alt="" loading="lazy">`
                    : `<i class="fas fa-couch"></i>`
                }
            </div>
            <div class="recent-furniture-info">
                <h5>${escapeHtml(item.name)}</h5>
                <span>${escapeHtml(item.category)} · LKR ${formatPrice(item.price)}</span>
            </div>
        </div>
    `).join('');
}

// Add Furniture
addFurnitureForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        imageUrl: document.getElementById('productImage').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        createdAt: serverTimestamp()
    };

    showLoading(true);

    try {
        await addDoc(collection(db, 'furniture'), data);
        showToast('Furniture added successfully!', 'success');
        addFurnitureForm.reset();
        showPage('furniture');
    } catch (error) {
        console.error('Add furniture error:', error);
        showToast('Error adding furniture', 'error');
    } finally {
        showLoading(false);
    }
});

btnCancelAdd.addEventListener('click', () => {
    addFurnitureForm.reset();
    showPage('furniture');
});

btnAddNewFurniture?.addEventListener('click', () => showPage('add-furniture'));
btnAddFirstFurniture?.addEventListener('click', () => showPage('add-furniture'));

// Edit Furniture
function openEditModal(id) {
    const item = furnitureList.find(f => f.id === id);
    if (!item) return;

    document.getElementById('editFurnitureId').value = id;
    document.getElementById('editProductName').value = item.name || '';
    document.getElementById('editProductCategory').value = item.category || '';
    document.getElementById('editProductPrice').value = item.price || '';
    document.getElementById('editProductImage').value = item.imageUrl || '';
    document.getElementById('editProductDescription').value = item.description || '';

    editModal.style.display = 'flex';
}

function closeEditModalFn() {
    editModal.style.display = 'none';
    editFurnitureForm.reset();
}

closeEditModal.addEventListener('click', closeEditModalFn);
btnCancelEdit.addEventListener('click', closeEditModalFn);
editModal.querySelector('.modal-backdrop').addEventListener('click', closeEditModalFn);

editFurnitureForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editFurnitureId').value;
    const data = {
        name: document.getElementById('editProductName').value.trim(),
        category: document.getElementById('editProductCategory').value,
        price: parseFloat(document.getElementById('editProductPrice').value) || 0,
        imageUrl: document.getElementById('editProductImage').value.trim(),
        description: document.getElementById('editProductDescription').value.trim(),
        updatedAt: serverTimestamp()
    };

    showLoading(true);

    try {
        await updateDoc(doc(db, 'furniture', id), data);
        showToast('Furniture updated successfully!', 'success');
        closeEditModalFn();
    } catch (error) {
        console.error('Update furniture error:', error);
        showToast('Error updating furniture', 'error');
    } finally {
        showLoading(false);
    }
});

// Delete Furniture
function openDeleteModal(id) {
    deleteTargetId = id;
    deleteModal.style.display = 'flex';
}

function closeDeleteModalFn() {
    deleteModal.style.display = 'none';
    deleteTargetId = null;
}

closeDeleteModal.addEventListener('click', closeDeleteModalFn);
btnCancelDelete.addEventListener('click', closeDeleteModalFn);
deleteModal.querySelector('.modal-backdrop').addEventListener('click', closeDeleteModalFn);

btnConfirmDelete.addEventListener('click', async () => {
    if (!deleteTargetId) return;

    showLoading(true);

    try {
        await deleteDoc(doc(db, 'furniture', deleteTargetId));
        showToast('Furniture deleted successfully', 'success');
        closeDeleteModalFn();
    } catch (error) {
        console.error('Delete furniture error:', error);
        showToast('Error deleting furniture', 'error');
    } finally {
        showLoading(false);
    }
});

// Search & Filter
furnitureSearch?.addEventListener('input', () => renderFurnitureGrid());
furnitureFilter?.addEventListener('change', () => renderFurnitureGrid());

// ============================================
// ORDERS
// ============================================

function renderOrdersTable() {
    const searchTerm = (ordersSearch?.value || '').toLowerCase();
    const statusFilter = ordersFilter?.value || 'all';

    let filtered = ordersList.filter(order => {
        const matchesSearch = !searchTerm ||
            order.customerName?.toLowerCase().includes(searchTerm) ||
            order.customerPhone?.includes(searchTerm) ||
            order.furnitureType?.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        ordersTableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="8">No orders found</td>
            </tr>
        `;
        return;
    }

    ordersTableBody.innerHTML = filtered.map(order => {
        const date = order.createdAt?.toDate 
            ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'N/A';
        const dims = `${order.width || '--'}${order.unit || ''} × ${order.height || '--'}${order.unit || ''} × ${order.depth || '--'}${order.unit || ''}`;

        return `
            <tr data-id="${order.id}">
                <td><strong>#${order.id.slice(-6).toUpperCase()}</strong></td>
                <td>${escapeHtml(order.customerName || 'N/A')}</td>
                <td>${escapeHtml(order.customerPhone || 'N/A')}</td>
                <td>${escapeHtml(order.furnitureType || 'N/A')}</td>
                <td><span style="font-size:0.8rem;color:var(--text-light);">${dims}</span></td>
                <td><span style="font-size:0.8rem;color:var(--text-muted);">${date}</span></td>
                <td>
                    <select class="status-select status-${(order.orderStatus || 'new').toLowerCase().replace(/\s+/g, '-')}"
                        data-id="${order.id}" style="padding:4px 8px;border-radius:20px;border:none;font-size:0.75rem;font-weight:700;cursor:pointer;text-transform:uppercase;">
                        <option value="New" ${order.orderStatus === 'New' ? 'selected' : ''}>New</option>
                        <option value="Contacted" ${order.orderStatus === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="Quotation Sent" ${order.orderStatus === 'Quotation Sent' ? 'selected' : ''}>Quotation Sent</option>
                        <option value="Confirmed" ${order.orderStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Completed" ${order.orderStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${order.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-outline btn-small btn-view-order" data-id="${order.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Attach listeners
    ordersTableBody.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const id = e.target.dataset.id;
            const newStatus = e.target.value;

            try {
                await updateDoc(doc(db, 'orders', id), { orderStatus: newStatus, updatedAt: serverTimestamp() });
                showToast(`Order status updated to ${newStatus}`, 'success');
            } catch (error) {
                console.error('Update status error:', error);
                showToast('Error updating status', 'error');
            }
        });
    });

    ordersTableBody.querySelectorAll('.btn-view-order').forEach(btn => {
        btn.addEventListener('click', () => openOrderModal(btn.dataset.id));
    });
}

function renderRecentOrders() {
    const recent = ordersList.slice(0, 5);

    if (recent.length === 0) {
        recentOrdersTable.innerHTML = `
            <tr class="empty-row">
                <td colspan="4">No orders yet</td>
            </tr>
        `;
        return;
    }

    recentOrdersTable.innerHTML = recent.map(order => {
        const date = order.createdAt?.toDate
            ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'N/A';

        return `
            <tr>
                <td>${escapeHtml(order.customerName || 'N/A')}</td>
                <td>${escapeHtml(order.furnitureType || 'N/A')}</td>
                <td>${date}</td>
                <td><span class="status-badge status-${(order.orderStatus || 'new').toLowerCase().replace(/\s+/g, '-')}">${order.orderStatus || 'New'}</span></td>
            </tr>
        `;
    }).join('');
}

function openOrderModal(id) {
    const order = ordersList.find(o => o.id === id);
    if (!order) return;

    const date = order.createdAt?.toDate
        ? order.createdAt.toDate().toLocaleString('en-US')
        : 'N/A';

    // Build features text
    let featuresHtml = '';
    if (order.additionalFeatures && Object.keys(order.additionalFeatures).length > 0) {
        Object.entries(order.additionalFeatures).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    featuresHtml += `<span>• ${escapeHtml(v)}</span>`;
                });
            } else {
                featuresHtml += `<span>• ${escapeHtml(value)}</span>`;
            }
        });
    } else {
        featuresHtml = '<span style="color:var(--text-muted);">None specified</span>';
    }

    orderDetailContent.innerHTML = `
        <div class="order-detail-section">
            <h4><i class="fas fa-user"></i> Customer Information</h4>
            <div class="order-detail-grid">
                <span><strong>Name:</strong> ${escapeHtml(order.customerName || 'N/A')}</span>
                <span><strong>Phone:</strong> ${escapeHtml(order.customerPhone || 'N/A')}</span>
                <span><strong>Email:</strong> ${escapeHtml(order.customerEmail || 'Not provided')}</span>
                <span><strong>Address:</strong> ${escapeHtml(order.customerAddress || 'N/A')}, ${escapeHtml(order.customerCity || 'N/A')}</span>
            </div>
        </div>
        <div class="order-detail-section">
            <h4><i class="fas fa-couch"></i> Furniture Details</h4>
            <div class="order-detail-grid">
                <span><strong>Type:</strong> ${escapeHtml(order.furnitureType || 'N/A')}</span>
                <span><strong>Material:</strong> ${escapeHtml(order.material || 'N/A')}</span>
                <span><strong>Color:</strong> ${escapeHtml(order.color || 'N/A')}</span>
                <span><strong>Dimensions:</strong> W:${order.width || '--'}${order.unit || ''} × H:${order.height || '--'}${order.unit || ''} × D:${order.depth || '--'}${order.unit || ''}</span>
            </div>
        </div>
        <div class="order-detail-section">
            <h4><i class="fas fa-sliders-h"></i> Additional Features</h4>
            <div style="display:flex;flex-direction:column;gap:4px;">
                ${featuresHtml}
            </div>
        </div>
        <div class="order-detail-section">
            <h4><i class="fas fa-sticky-note"></i> Notes</h4>
            <p style="color:var(--text-light);font-size:0.9rem;">${escapeHtml(order.customerNotes || 'No additional notes')}</p>
        </div>
        <div class="order-detail-section">
            <h4><i class="fas fa-info-circle"></i> Order Info</h4>
            <div class="order-detail-grid">
                <span><strong>Order ID:</strong> #${order.id.slice(-6).toUpperCase()}</span>
                <span><strong>Status:</strong> <span class="status-badge status-${(order.orderStatus || 'new').toLowerCase().replace(/\s+/g, '-')}">${order.orderStatus || 'New'}</span></span>
                <span><strong>Date:</strong> ${date}</span>
                <span><strong>Reference Image:</strong> ${order.referenceImageUploaded ? 'Yes' : 'No'}</span>
            </div>
        </div>
    `;

    // Set WhatsApp link
    const phone = order.customerPhone?.replace(/\D/g, '');
    if (phone) {
        btnContactCustomer.href = `https://wa.me/${phone}`;
        btnContactCustomer.style.display = 'inline-flex';
    } else {
        btnContactCustomer.style.display = 'none';
    }

    orderModal.style.display = 'flex';
}

function closeOrderModalFn() {
    orderModal.style.display = 'none';
}

closeOrderModal.addEventListener('click', closeOrderModalFn);
btnCloseOrderDetail.addEventListener('click', closeOrderModalFn);
orderModal.querySelector('.modal-backdrop').addEventListener('click', closeOrderModalFn);

// Search & Filter
ordersSearch?.addEventListener('input', () => renderOrdersTable());
ordersFilter?.addEventListener('change', () => renderOrdersTable());

// ============================================
// SETTINGS
// ============================================

async function loadSettings() {
    showLoading(true);

    try {
        const docRef = doc(db, 'settings', 'business');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('settingBusinessName').value = data.businessName || '';
            document.getElementById('settingTagline').value = data.tagline || '';
            document.getElementById('settingWhatsapp').value = data.whatsapp || '';
            document.getElementById('settingPhone').value = data.phone || '';
            document.getElementById('settingEmail').value = data.email || '';
            document.getElementById('settingAddress').value = data.address || '';
            document.getElementById('settingAbout').value = data.aboutText || '';
        }
    } catch (error) {
        console.error('Load settings error:', error);
        showToast('Error loading settings', 'error');
    } finally {
        showLoading(false);
    }
}

settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        businessName: document.getElementById('settingBusinessName').value.trim(),
        tagline: document.getElementById('settingTagline').value.trim(),
        whatsapp: document.getElementById('settingWhatsapp').value.trim(),
        phone: document.getElementById('settingPhone').value.trim(),
        email: document.getElementById('settingEmail').value.trim(),
        address: document.getElementById('settingAddress').value.trim(),
        aboutText: document.getElementById('settingAbout').value.trim(),
        updatedAt: serverTimestamp()
    };

    showLoading(true);

    try {
        await setDoc(doc(db, 'settings', 'business'), data, { merge: true });
        showToast('Settings saved successfully!', 'success');
    } catch (error) {
        console.error('Save settings error:', error);
        showToast('Error saving settings', 'error');
    } finally {
        showLoading(false);
    }
});

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'toastFadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    });

    toastContainer.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'toastFadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// ============================================
// LOADING
// ============================================

function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatPrice(price) {
    if (!price && price !== 0) return '0';
    return price.toLocaleString('en-LK');
}

function initEventListeners() {
    // Keyboard shortcuts for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModalFn();
            closeDeleteModalFn();
            closeOrderModalFn();
        }
    });
}
