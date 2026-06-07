// Default Menu Items
const defaultMenuItems = [
    { id: 1, name: 'Milk Tea (गायखेर साहा)', price: 10, image: 'cuting chi.jpg', hidden: false },
    { id: 2, name: 'Lal tea (लाल साहा)', price: 10, image: 'lal.jpg', hidden: false },
    { id: 3, name: 'Biscuit (बिस्कुट)', price: 15, image: 'bis.jpeg', hidden: false },
    { id: 4, name: 'Papor (पापोर)', price: 5, image: 'papor.jpeg', hidden: false },
    { id: 5, name: 'Guguni (गुगुनी)', price: 10, image: 'guguni.jpeg', hidden: false },
    { id: 6, name: 'Jhal Muri (जाल मुरि)', price: 10, image: 'JH.jpeg', hidden: false },
    { id: 7, name: 'Porota (परोठा)', price: 20, image: 'porota.jpg', hidden: false },
    { id: 8, name: 'Pan Egg (दावदै)', price: 15, image: 'egg.jpeg', hidden: false },
    { id: 9, name: 'Maggi (मेगि)', price: 20, image: 'Maggi.jpg', hidden: false },
    { id: 10, name: 'Water Bottle (दै बोतल)', price: 10, image: 'water.jpeg', hidden: false },
    { id: 11, name: 'Cigarette (चिगरेट)', price: 10, image: 'ch.jpg', hidden: false },
    { id: 12, name: 'Roti (रोटी)', price: 10, image: 'roti.webp', hidden: false },         
    { id: 13, name: 'Pan (गय पाथै)', price: 5, image: 'goy.jpeg', hidden: false },
    { id: 14, name: 'Imli Kick', price: 1, image: 'em.jpeg', hidden: false },
    { id: 15, name: 'MAAZA', price: 20, image: 'maaza.jpeg', hidden: false },
    { id: 16, name: 'TREX', price: 10, image: 'x1.jpeg', hidden: false },
    { id: 17, name: 'Fanta', price: 20, image: 'fanta.jpeg', hidden: false },
    { id: 18, name: 'Puri (पुरी)', price: 10, image: 'puri.jpg', hidden: false },
    { id: 19, name: 'Sugar Cane Juice (खुसेर बिदै)', price: 20, image: 'suger.jpg', hidden: false },
    { id: 20, name: 'Chow Mein (चाउ मेन)', price: 60, image: 'R.jpg', hidden: false }
];

// Active State Data
let menuItems = [];
let dues = [];
let customers = {};
let currentTab = 'menu';
let currentInvoice = { items: [], total: 0 };

// Initialize data from localStorage
function initializeData() {
    // 1. Menu Items
    const savedMenu = localStorage.getItem('menuItems');
    if (savedMenu) {
        menuItems = JSON.parse(savedMenu);
    } else {
        menuItems = [...defaultMenuItems];
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }

    // 2. Dues
    const savedDues = localStorage.getItem('dues');
    dues = savedDues ? JSON.parse(savedDues) : [];
    
    updateCustomerSummary();
    renderPublicDuesList();
}

// Update customers rollup from raw dues entries
function updateCustomerSummary() {
    customers = {};
    dues.forEach(due => {
        const name = due.customerName;
        if (!customers[name]) {
            customers[name] = {
                totalDue: 0,
                lastTransaction: due.date,
                transactions: []
            };
        }
        const dueTotal = due.items.reduce((total, item) => total + (item.total || (item.quantity * item.price)), 0);
        customers[name].totalDue += dueTotal;
        customers[name].transactions.push(due);
        
        if (new Date(due.date) > new Date(customers[name].lastTransaction)) {
            customers[name].lastTransaction = due.date;
        }
    });
}

// Render public views
function renderPublicMenu() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;
    
    menuGrid.innerHTML = '';
    const visibleItems = menuItems.filter(item => !item.hidden);
    
    if (visibleItems.length === 0) {
        menuGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted); font-size: 1.2rem;">Our kitchen is currently preparing fresh batches! Check back soon.</div>`;
        return;
    }
    
    visibleItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='water.jpeg'">
            <h3>${item.name}</h3>
            <p class="price">₹${parseFloat(item.price).toFixed(2)}</p>
        `;
        menuGrid.appendChild(card);
    });
}

function renderInvoiceItemsList() {
    const itemsList = document.querySelector('.items-list');
    if (!itemsList) return;
    
    itemsList.innerHTML = '';
    const visibleItems = menuItems.filter(item => !item.hidden);
    
    if (visibleItems.length === 0) {
        itemsList.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No items available for order.</p>`;
        return;
    }
    
    visibleItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-checkbox';
        itemDiv.innerHTML = `
            <label class="checkbox-left">
                <input type="checkbox" id="item-${item.id}" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                <span>${item.name} - ₹${parseFloat(item.price).toFixed(2)}</span>
            </label>
            <input type="number" class="quantity-input" value="1" min="1" disabled style="opacity: 0.5;">
        `;
        itemsList.appendChild(itemDiv);

        const checkbox = itemDiv.querySelector('input[type="checkbox"]');
        const quantityInput = itemDiv.querySelector('.quantity-input');

        checkbox.addEventListener('change', function() {
            if (this.checked) {
                quantityInput.disabled = false;
                quantityInput.style.opacity = '1';
            } else {
                quantityInput.disabled = true;
                quantityInput.style.opacity = '0.5';
            }
            updateSelectedItems();
        });

        quantityInput.addEventListener('input', updateSelectedItems);
    });
}

function updateSelectedItems() {
    const selected = [];
    let total = 0;
    const itemsList = document.querySelector('.items-list');
    if (!itemsList) return;

    itemsList.querySelectorAll('.item-checkbox').forEach(itemDiv => {
        const checkbox = itemDiv.querySelector('input[type="checkbox"]');
        const quantityInput = itemDiv.querySelector('.quantity-input');
        
        if (checkbox.checked) {
            const quantity = parseInt(quantityInput.value) || 1;
            const price = parseFloat(checkbox.dataset.price);
            const itemTotal = quantity * price;
            
            selected.push({
                name: checkbox.dataset.name,
                quantity,
                price,
                total: itemTotal
            });
            total += itemTotal;
        }
    });

    displaySelectedItems(selected, total);
}

function displaySelectedItems(items, total) {
    const selectedItemsDiv = document.querySelector('.selected-items');
    const totalAmountSpan = document.getElementById('total-amount');
    
    if (totalAmountSpan) {
        totalAmountSpan.textContent = total;
    }
    
    if (!selectedItemsDiv) return;

    if (items.length === 0) {
        selectedItemsDiv.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No items selected yet.</p>`;
        return;
    }

    let itemsHTML = items.map(item => `
        <div class="selected-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>₹${item.total.toFixed(2)}</span>
        </div>
    `).join('');

    itemsHTML += `
        <div class="total-section" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
            <div style="display: flex; justify-content: center;">
                <button onclick="initiateUPIPayment(${total})" class="upi-btn">
                    Pay with UPI
                </button>
            </div>
        </div>
    `;

    selectedItemsDiv.innerHTML = itemsHTML;
}

// UPI Payment Integration
function initiateUPIPayment(amount) {
    if (amount <= 0) {
        alert('Invoice amount must be greater than zero.');
        return;
    }
    const upiId = '9864728992@okbizaxis';
    const merchantName = 'HEALTHY FOOD';
    const transactionNote = 'Gourmet Food Purchase';
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&tr=${Date.now()}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    window.location.href = upiUrl;
}

// Generate receipt invoice
function setupInvoiceGenerator() {
    const generateInvoiceBtn = document.getElementById('generate-invoice');
    if (!generateInvoiceBtn) return;

    generateInvoiceBtn.addEventListener('click', () => {
        const items = [];
        let total = 0;
        const itemsList = document.querySelector('.items-list');
        if (!itemsList) return;

        itemsList.querySelectorAll('.item-checkbox').forEach(itemDiv => {
            const checkbox = itemDiv.querySelector('input[type="checkbox"]');
            const quantityInput = itemDiv.querySelector('.quantity-input');
            
            if (checkbox.checked) {
                const quantity = parseInt(quantityInput.value) || 0;
                if (quantity <= 0) {
                    alert(`Please enter a valid quantity for ${checkbox.dataset.name}`);
                    return;
                }
                const price = parseFloat(checkbox.dataset.price);
                const itemTotal = quantity * price;
                items.push({
                    name: checkbox.dataset.name,
                    quantity,
                    price,
                    total: itemTotal
                });
                total += itemTotal;
            }
        });

        if (items.length === 0) {
            alert('Please select at least one item to generate an invoice.');
            return;
        }

        const invoiceHTML = `
            <div class="invoice-content">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 1.4rem;">HEALTHY FOOD</h3>
                    <p style="margin: 3px 0 0 0; font-size: 0.9rem;">Fresh & Premium Gourmet</p>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.85rem;">
                    <span>Date: ${new Date().toLocaleDateString()}</span>
                    <span>Time: ${new Date().toLocaleTimeString()}</span>
                </div>
                <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin: 10px 0;">
                    <thead>
                        <tr style="border-bottom: 1px dashed #000;">
                            <th style="text-align: left; padding: 4px 0;">Item</th>
                            <th style="text-align: center; padding: 4px 0;">Qty</th>
                            <th style="text-align: right; padding: 4px 0;">Price</th>
                            <th style="text-align: right; padding: 4px 0;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td style="padding: 4px 0;">${item.name}</td>
                                <td style="text-align: center; padding: 4px 0;">${item.quantity}</td>
                                <td style="text-align: right; padding: 4px 0;">₹${item.price.toFixed(2)}</td>
                                <td style="text-align: right; padding: 4px 0;">₹${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; margin-top: 5px;">
                    <span>GRAND TOTAL:</span>
                    <span>₹${total.toFixed(2)}</span>
                </div>
                <div style="text-align: center; margin-top: 25px; font-size: 0.85rem;">
                    <p style="margin: 5px 0;">Thank you for dining with us!</p>
                    <button onclick="initiateUPIPayment(${total})" class="upi-btn" style="margin-top: 10px;">Pay with UPI</button>
                </div>
            </div>
        `;

        currentInvoice = { items, total };
        const invoiceDetails = document.getElementById('invoice-details');
        const modal = document.getElementById('invoice-modal');
        const duesSection = document.getElementById('invoice-dues-section');
        if (duesSection) duesSection.style.display = 'none';
        if (invoiceDetails && modal) {
            invoiceDetails.innerHTML = invoiceHTML;
            modal.style.display = 'block';
        }
    });
}

// Admin Panel Logic
function setupAdminView() {
    const loginForm = document.getElementById('admin-login-form');
    const passwordInput = document.getElementById('admin-password');
    const loginView = document.getElementById('admin-login-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    
    // Check session login state
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        loginView.style.display = 'none';
        dashboardView.style.display = 'grid';
        loadAdminMenuTab();
        renderCustomerDuesList();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = passwordInput.value;
            if (pass === 'kalilinuxuseronly1234') {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                loginView.style.display = 'none';
                dashboardView.style.display = 'grid';
                passwordInput.value = '';
                loadAdminMenuTab();
                renderCustomerDuesList();
            } else {
                alert('Access Denied: Incorrect Password');
            }
        });
    }

    // Admin inner navigation subtabs
    const subtabButtons = document.querySelectorAll('.admin-tab-btn');
    const subtabContents = document.querySelectorAll('.admin-subcontent');

    subtabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            subtabButtons.forEach(b => b.classList.remove('active'));
            subtabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-subtab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            if (targetId === 'admin-menu') {
                loadAdminMenuTab();
            } else if (targetId === 'admin-dues') {
                renderCustomerDuesList();
            }
        });
    });
}

// Load Admin Menu Tab
function loadAdminMenuTab() {
    const adminMenuList = document.getElementById('admin-menu-list');
    if (!adminMenuList) return;
    
    adminMenuList.innerHTML = '';
    
    menuItems.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'admin-item-row';
        itemRow.innerHTML = `
            <div class="admin-item-info">
                <img src="${item.image}" alt="${item.name}" class="admin-item-img" onerror="this.src='water.jpeg'">
                <div class="admin-item-details">
                    <h4>${item.name}</h4>
                    <p>Item ID: ${item.id}</p>
                </div>
            </div>
            <div class="admin-item-controls">
                <div>
                    <span style="font-size: 0.9rem; margin-right: 5px;">Price: ₹</span>
                    <input type="number" class="price-edit-input" data-id="${item.id}" value="${item.price}" min="0">
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.9rem; color: var(--text-muted);">${item.hidden ? 'Hidden' : 'Visible'}</span>
                    <label class="switch">
                        <input type="checkbox" class="visibility-toggle" data-id="${item.id}" ${!item.hidden ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        `;
        adminMenuList.appendChild(itemRow);
        
        // Add live update of visibility text
        const toggle = itemRow.querySelector('.visibility-toggle');
        const textSpan = toggle.parentElement.previousElementSibling;
        toggle.addEventListener('change', function() {
            textSpan.textContent = this.checked ? 'Visible' : 'Hidden';
        });
    });
}

// Save Admin Menu Changes
function setupAdminMenuSave() {
    const saveBtn = document.getElementById('save-menu-changes');
    if (!saveBtn) return;
    
    saveBtn.addEventListener('click', () => {
        const priceInputs = document.querySelectorAll('.price-edit-input');
        const visibilityToggles = document.querySelectorAll('.visibility-toggle');
        
        let updated = false;

        priceInputs.forEach(input => {
            const id = parseInt(input.dataset.id);
            const val = parseFloat(input.value);
            const match = menuItems.find(item => item.id === id);
            if (match && !isNaN(val) && val >= 0) {
                match.price = val;
                updated = true;
            }
        });

        visibilityToggles.forEach(toggle => {
            const id = parseInt(toggle.dataset.id);
            const visible = toggle.checked;
            const match = menuItems.find(item => item.id === id);
            if (match) {
                match.hidden = !visible;
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            alert('Menu configurations saved successfully!');
            renderPublicMenu();
            renderInvoiceItemsList();
            loadAdminMenuTab();
        }
    });
}

// Add New Menu Item logic
function setupAddNewItem() {
    const addItemForm = document.getElementById('add-item-form');
    if (!addItemForm) return;

    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('item-name');
        const priceInput = document.getElementById('item-price');
        const imageFileInput = document.getElementById('item-image-file');
        const imageUrlInput = document.getElementById('item-image-url');

        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value);

        if (!name || isNaN(price) || price < 0) {
            alert('Please check your input fields.');
            return;
        }

        const file = imageFileInput.files[0];
        
        const saveAndRenderItem = (imgSrc) => {
            const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
            const newItem = {
                id: newId,
                name,
                price,
                image: imgSrc,
                hidden: false
            };

            menuItems.push(newItem);
            localStorage.setItem('menuItems', JSON.stringify(menuItems));

            alert(`"${name}" has been successfully added to the menu!`);
            addItemForm.reset();

            renderPublicMenu();
            renderInvoiceItemsList();
            loadAdminMenuTab();
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                saveAndRenderItem(evt.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            const imageUrl = imageUrlInput.value.trim() || 'water.jpeg';
            saveAndRenderItem(imageUrl);
        }
    });
}

// Customer Dues Management Rendering
function renderCustomerDuesList() {
    const customerList = document.getElementById('customer-list');
    if (!customerList) return;

    customerList.innerHTML = '';

    const customerEntries = Object.entries(customers);
    
    if (customerEntries.length === 0) {
        customerList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No outstanding customer dues recorded.</td></tr>';
        return;
    }

    customerEntries.forEach(([name, data]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="customer-name" data-name="${name}">${name}</span></td>
            <td>₹${data.totalDue.toFixed(2)}</td>
            <td>${formatDate(data.lastTransaction)}</td>
            <td>${data.totalDue > 0 ? '<span class="status-pending">Pending</span>' : '<span class="status-paid">Settled</span>'}</td>
            <td>
                <button class="action-btn inspect-btn" data-name="${name}">Inspect Ledger</button>
                <button class="action-btn delete delete-btn" data-name="${name}">Clear / Delete</button>
            </td>
        `;
        customerList.appendChild(row);
    });

    // Add handlers dynamically
    customerList.querySelectorAll('.customer-name, .inspect-btn').forEach(elem => {
        elem.addEventListener('click', (e) => {
            const name = e.target.dataset.name;
            showCustomerDetails(name);
        });
    });

    customerList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = e.target.dataset.name;
            deleteCustomer(name);
        });
    });
}

// Public Customer Dues Rendering
function renderPublicDuesList() {
    const publicCustomerList = document.getElementById('public-customer-list');
    if (!publicCustomerList) return;

    publicCustomerList.innerHTML = '';

    const customerEntries = Object.entries(customers);
    
    if (customerEntries.length === 0) {
        publicCustomerList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No outstanding customer dues recorded.</td></tr>';
        return;
    }

    customerEntries.forEach(([name, data]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="customer-name" data-name="${name}">${name}</span></td>
            <td>₹${data.totalDue.toFixed(2)}</td>
            <td>${formatDate(data.lastTransaction)}</td>
            <td>${data.totalDue > 0 ? '<span class="status-pending">Pending</span>' : '<span class="status-paid">Settled</span>'}</td>
            <td>
                <button class="action-btn inspect-btn" data-name="${name}">Inspect Statement</button>
            </td>
        `;
        publicCustomerList.appendChild(row);
    });

    // Add handlers dynamically
    publicCustomerList.querySelectorAll('.customer-name, .inspect-btn').forEach(elem => {
        elem.addEventListener('click', (e) => {
            const name = e.target.dataset.name;
            showCustomerDetails(name);
        });
    });
}

// Show Customer Ledger in Detail Modal
function showCustomerDetails(customerName) {
    const modal = document.getElementById('customer-modal');
    const modalCustomerName = document.getElementById('modal-customer-name');
    const modalTotalDue = document.getElementById('modal-total-due');
    const vouchersContainer = document.querySelector('.vouchers-by-date');
    const printButton = document.getElementById('print-customer-dues');

    if (!modal || !modalCustomerName || !modalTotalDue || !vouchersContainer) return;

    const data = customers[customerName];
    if (!data) return;

    modalCustomerName.textContent = customerName;
    modalTotalDue.textContent = data.totalDue.toFixed(2);
    
    // Group transactions by date
    const groupedTransactions = groupTransactionsByDate(data.transactions);
    
    vouchersContainer.innerHTML = '';
    Object.entries(groupedTransactions).forEach(([date, transactions]) => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'date-group';
        
        let rowsHTML = '';
        transactions.forEach(t => {
            t.items.forEach(item => {
                rowsHTML += `
                    <tr>
                        <td>${item.name}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td>₹${parseFloat(item.price).toFixed(2)}</td>
                        <td style="text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                `;
            });
        });

        dateGroup.innerHTML = `
            <h3>${formatDate(date)}</h3>
            <table class="voucher-table">
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th>Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>
        `;
        vouchersContainer.appendChild(dateGroup);
    });
    
    if (printButton) {
        printButton.onclick = () => printCustomerDues(customerName, groupedTransactions);
    }
    
    modal.style.display = 'block';
}

function groupTransactionsByDate(transactions) {
    return transactions.reduce((groups, transaction) => {
        const date = transaction.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {});
}

// Add New Customer Due Entry
function addNewCustomer(customerName, dueAmount) {
    const newDue = {
        customerName: customerName,
        date: new Date().toISOString().split('T')[0],
        items: [{
            name: 'Initial Ledger Balance',
            quantity: 1,
            price: dueAmount,
            total: dueAmount
        }]
    };
    
    dues.push(newDue);
    
    try {
        localStorage.setItem('dues', JSON.stringify(dues));
        updateCustomerSummary();
        renderCustomerDuesList();
        renderPublicDuesList();
        return true;
    } catch (error) {
        console.error('Error saving dues database:', error);
        alert('Storage full or unavailable. Could not save ledger entry.');
        return false;
    }
}

// Settle / Delete Customer record
function deleteCustomer(customerName) {
    if (confirm(`Are you sure you want to completely clear the ledger for "${customerName}"? This deletes all transaction histories permanently.`)) {
        dues = dues.filter(due => due.customerName !== customerName);
        try {
            localStorage.setItem('dues', JSON.stringify(dues));
            updateCustomerSummary();
            renderCustomerDuesList();
            renderPublicDuesList();
        } catch (error) {
            console.error('Error settling customer data:', error);
        }
    }
}

// Export Ledger Data as JSON
function exportData() {
    const data = {
        website: 'HEALTHY FOOD',
        exportDate: new Date().toISOString(),
        duesDatabase: dues
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthy_food_ledger_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Print Customer Dues Report
function printCustomerDues(customerName, groupedTransactions) {
    const printWindow = window.open('', '_blank');
    const data = customers[customerName];
    if (!data) return;

    let tablesHTML = '';
    Object.entries(groupedTransactions).forEach(([date, transactions]) => {
        let rows = '';
        transactions.forEach(t => {
            t.items.forEach(item => {
                rows += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${parseFloat(item.price).toFixed(2)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                `;
            });
        });

        tablesHTML += `
            <div style="margin-bottom: 25px;">
                <h3 style="border-bottom: 2px solid #1b4332; padding-bottom: 4px; color: #1b4332;">${formatDate(date)}</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; text-align: left;">Item Description</th>
                            <th style="padding: 8px; text-align: center;">Qty</th>
                            <th style="padding: 8px; text-align: left;">Price</th>
                            <th style="padding: 8px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    });

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ledger Statement - ${customerName}</title>
            <style>
                body { font-family: 'Courier New', Courier, monospace; padding: 30px; color: #000; }
                h1 { margin: 0 0 5px 0; color: #1b4332; font-size: 2rem; }
                .header { margin-bottom: 30px; border-bottom: 3px double #1b4332; padding-bottom: 15px; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>HEALTHY FOOD</h1>
                <p style="margin: 0 0 15px 0;">Customer Ledger Statement</p>
                <p><strong>Customer Name:</strong> ${customerName}</p>
                <p><strong>Outstanding Balance:</strong> ₹${data.totalDue.toFixed(2)}</p>
                <p><strong>Date Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            ${tablesHTML}
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 25px; font-weight: bold; background-color: #1b4332; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Print Statement</button>
            </div>
            <script>
                window.onload = () => {
                    window.print();
                }
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
}

function setupInvoiceDuesSaving() {
    const addDuesBtn = document.getElementById('invoice-add-dues-btn');
    const duesSection = document.getElementById('invoice-dues-section');
    const cancelDuesBtn = document.getElementById('cancel-save-dues');
    const confirmDuesBtn = document.getElementById('confirm-save-dues');
    const customerInput = document.getElementById('due-customer-search');
    
    if (addDuesBtn && duesSection) {
        addDuesBtn.addEventListener('click', () => {
            // Populate datalist of existing customers
            const datalist = document.getElementById('invoice-existing-customers');
            if (datalist) {
                datalist.innerHTML = Object.keys(customers)
                    .map(name => `<option value="${name}"></option>`)
                    .join('');
            }
            duesSection.style.display = 'block';
            if (customerInput) {
                customerInput.value = '';
                customerInput.focus();
            }
        });
    }

    if (cancelDuesBtn && duesSection) {
        cancelDuesBtn.addEventListener('click', () => {
            duesSection.style.display = 'none';
        });
    }

    if (confirmDuesBtn) {
        confirmDuesBtn.addEventListener('click', () => {
            if (!customerInput) return;
            const customerName = customerInput.value.trim();
            if (!customerName) {
                alert('Please select or enter a customer name.');
                return;
            }

            if (!currentInvoice.items || currentInvoice.items.length === 0) {
                alert('No items in the invoice to record.');
                return;
            }

            // Create new due entry
            const newDue = {
                customerName: customerName,
                date: new Date().toISOString().split('T')[0],
                items: currentInvoice.items
            };
            
            dues.push(newDue);
            
            try {
                localStorage.setItem('dues', JSON.stringify(dues));
                updateCustomerSummary();
                renderCustomerDuesList();
                renderPublicDuesList();
                
                alert(`Invoice successfully saved to dues for "${customerName}"!`);
                
                // Hide modal and reset
                const modal = document.getElementById('invoice-modal');
                if (modal) modal.style.display = 'none';
                duesSection.style.display = 'none';
                
                // Reset invoice selections
                resetInvoiceSelection();
            } catch (error) {
                console.error('Error saving dues:', error);
                alert('Failed to save to local storage.');
            }
        });
    }
}

function resetInvoiceSelection() {
    const itemsList = document.querySelector('.items-list');
    if (itemsList) {
        itemsList.querySelectorAll('.item-checkbox').forEach(itemDiv => {
            const checkbox = itemDiv.querySelector('input[type="checkbox"]');
            const quantityInput = itemDiv.querySelector('.quantity-input');
            if (checkbox) checkbox.checked = false;
            if (quantityInput) {
                quantityInput.value = "1";
                quantityInput.disabled = true;
                quantityInput.style.opacity = '0.5';
            }
        });
    }
    updateSelectedItems();
}

// Helpers
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Document Load Handlers
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    renderPublicMenu();
    renderInvoiceItemsList();
    setupInvoiceGenerator();
    setupInvoiceDuesSaving();
    setupAdminView();
    setupAdminMenuSave();
    setupAddNewItem();

    // Tab switcher handlers
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            currentTab = tabId;
            const contentBlock = document.getElementById(tabId);
            if (contentBlock) {
                contentBlock.classList.add('active');
            }

            // Specific refresh on load
            if (tabId === 'menu') {
                renderPublicMenu();
            } else if (tabId === 'invoice') {
                renderInvoiceItemsList();
                updateSelectedItems();
            } else if (tabId === 'dues') {
                renderPublicDuesList();
            } else if (tabId === 'admin') {
                // If logged in, refresh menu tab
                if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
                    loadAdminMenuTab();
                    renderCustomerDuesList();
                    renderPublicDuesList();
                }
            }
        });
    });

    // Close Modals handler
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Hook up Export Dues button
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    // Customer dues form toggles
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const addCustomerForm = document.getElementById('add-customer-form');
    const cancelAddCustomerBtn = document.getElementById('cancel-add-customer');
    const customerForm = document.getElementById('customer-form');

    if (addCustomerBtn && addCustomerForm) {
        addCustomerBtn.addEventListener('click', () => {
            addCustomerForm.style.display = 'block';
        });
    }

    if (cancelAddCustomerBtn && addCustomerForm) {
        cancelAddCustomerBtn.addEventListener('click', () => {
            addCustomerForm.style.display = 'none';
            if (customerForm) customerForm.reset();
        });
    }

    if (customerForm) {
        customerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('customer-name');
            const amountInput = document.getElementById('due-amount');
            
            const customerName = nameInput.value.trim();
            const dueAmount = parseFloat(amountInput.value);
            
            if (!customerName) {
                alert('Please enter a customer name');
                return;
            }
            
            if (isNaN(dueAmount) || dueAmount < 0) {
                alert('Please enter a valid due amount');
                return;
            }
            
            if (addNewCustomer(customerName, dueAmount)) {
                customerForm.reset();
                addCustomerForm.style.display = 'none';
            }
        });
    }

    // Search and sort in dues
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#customer-list tr');
            
            rows.forEach(row => {
                const nameCell = row.querySelector('.customer-name');
                if (nameCell) {
                    const name = nameCell.textContent.toLowerCase();
                    row.style.display = name.includes(searchTerm) ? '' : 'none';
                }
            });
        });
    }

    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const tbody = document.getElementById('customer-list');
            if (!tbody) return;
            
            const rows = Array.from(tbody.getElementsByTagName('tr'));
            if (rows.length === 0 || rows[0].cells.length < 2) return;
            
            rows.sort((a, b) => {
                const aName = a.querySelector('.customer-name')?.textContent || '';
                const bName = b.querySelector('.customer-name')?.textContent || '';
                
                if (sortBy === 'name') {
                    return aName.localeCompare(bName);
                } else if (sortBy === 'amount') {
                    const aAmt = parseFloat(a.cells[1]?.textContent.replace('₹', '')) || 0;
                    const bAmt = parseFloat(b.cells[1]?.textContent.replace('₹', '')) || 0;
                    return bAmt - aAmt;
                } else if (sortBy === 'date') {
                    // Sort by date inside customers rollup
                    const aDate = customers[aName]?.lastTransaction || 0;
                    const bDate = customers[bName]?.lastTransaction || 0;
                    return new Date(bDate) - new Date(aDate);
                }
                return 0;
            });
            
            tbody.innerHTML = '';
            rows.forEach(row => tbody.appendChild(row));
        });
    }

    // Search and sort in public dues
    const publicSearchInput = document.getElementById('public-customer-search');
    if (publicSearchInput) {
        publicSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#public-customer-list tr');
            
            rows.forEach(row => {
                const nameCell = row.querySelector('.customer-name');
                if (nameCell) {
                    const name = nameCell.textContent.toLowerCase();
                    row.style.display = name.includes(searchTerm) ? '' : 'none';
                }
            });
        });
    }

    const publicSortSelect = document.getElementById('public-sort-by');
    if (publicSortSelect) {
        publicSortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const tbody = document.getElementById('public-customer-list');
            if (!tbody) return;
            
            const rows = Array.from(tbody.getElementsByTagName('tr'));
            if (rows.length === 0 || rows[0].cells.length < 2) return;
            
            rows.sort((a, b) => {
                const aName = a.querySelector('.customer-name')?.textContent || '';
                const bName = b.querySelector('.customer-name')?.textContent || '';
                
                if (sortBy === 'name') {
                    return aName.localeCompare(bName);
                } else if (sortBy === 'amount') {
                    const aAmt = parseFloat(a.cells[1]?.textContent.replace('₹', '')) || 0;
                    const bAmt = parseFloat(b.cells[1]?.textContent.replace('₹', '')) || 0;
                    return bAmt - aAmt;
                } else if (sortBy === 'date') {
                    const aDate = customers[aName]?.lastTransaction || 0;
                    const bDate = customers[bName]?.lastTransaction || 0;
                    return new Date(bDate) - new Date(aDate);
                }
                return 0;
            });
            
            tbody.innerHTML = '';
            rows.forEach(row => tbody.appendChild(row));
        });
    }

    // Print invoice modal button
    const printInvoiceBtn = document.getElementById('print-invoice');
    if (printInvoiceBtn) {
        printInvoiceBtn.addEventListener('click', () => {
            window.print();
        });
    }
});

// Audio Player functionality
const bgMusic = document.getElementById('bgMusic');
const playPauseBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');

let isPlaying = false;

function tryPlayMusic() {
    if (!bgMusic) return;
    bgMusic.muted = false;
    bgMusic.volume = 0.5;

    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                isPlaying = true;
                if (playPauseBtn) playPauseBtn.textContent = 'Pause';
            })
            .catch(error => {
                console.log('Playback blocked by browser autoplay policy.');
                isPlaying = false;
                if (playPauseBtn) playPauseBtn.textContent = 'Play';
            });
    }
}

if (playPauseBtn && bgMusic) {
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            isPlaying = false;
            playPauseBtn.textContent = 'Play';
        } else {
            tryPlayMusic();
        }
    });

    nextBtn.addEventListener('click', () => {
        bgMusic.currentTime = 0;
        tryPlayMusic();
    });

    bgMusic.addEventListener('play', () => {
        isPlaying = true;
        playPauseBtn.textContent = 'Pause';
    });

    bgMusic.addEventListener('pause', () => {
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
    });
}
