// Add styles for table header
const style = document.createElement('style');
style.textContent = `
    .table thead {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    }
    .table thead th {
        color: white;
        font-weight: 600;
        border: none;
        padding: 15px;
    }
    .table tbody td {
        vertical-align: middle;
    }
    .badge {
        padding: 8px 12px;
        font-weight: 500;
    }
    .btn-sm {
        padding: 6px 12px;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);

// Mock data for payments
const mockPayments = [
    {
        id: 'PAY001',
        userName: 'John Smith',
        amount: '$99.99',
        plan: 'Premium Plan',
        date: '2024-03-15',
        status: 'Pending'
    },
    {
        id: 'PAY002',
        userName: 'Sarah Johnson',
        amount: '$49.99',
        plan: 'Basic Plan',
        date: '2024-03-14',
        status: 'Pending'
    },
    {
        id: 'PAY003',
        userName: 'Michael Brown',
        amount: '$149.99',
        plan: 'Enterprise Plan',
        date: '2024-03-13',
        status: 'Pending'
    },
    {
        id: 'PAY004',
        userName: 'Emily Davis',
        amount: '$99.99',
        plan: 'Premium Plan',
        date: '2024-03-12',
        status: 'Pending'
    },
    {
        id: 'PAY005',
        userName: 'David Wilson',
        amount: '$49.99',
        plan: 'Basic Plan',
        date: '2024-03-11',
        status: 'Pending'
    }
];

// Format date to readable format
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Load all pending payments
function loadPendingPayments() {
    const tableBody = document.getElementById('paymentsTableBody');
    tableBody.innerHTML = '';

    if (mockPayments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No pending payments found</td>
            </tr>
        `;
        return;
    }

    mockPayments.forEach(payment => {
        const row = document.createElement('tr');
        row.id = `payment-row-${payment.id}`;
        row.innerHTML = `
            <td>${payment.id}</td>
            <td>${payment.userName}</td>
            <td>${payment.amount}</td>
            <td>${payment.plan}</td>
            <td>${formatDate(payment.date)}</td>
            <td><span class="badge bg-warning">${payment.status}</span></td>
            <td>
                <button class="btn btn-success btn-sm me-2" onclick="approvePayment('${payment.id}')">
                    Approve
                </button>
                <button class="btn btn-danger btn-sm" onclick="rejectPayment('${payment.id}')">
                    Reject
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show success toast message
function showSuccessToast(message) {
    const toast = document.getElementById('successToast');
    const toastBody = toast.querySelector('.toast-body');
    toastBody.textContent = message;
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Approve payment
function approvePayment(paymentId) {
    if (!confirm('Are you sure you want to approve this payment?')) {
        return;
    }

    // Remove the payment from mock data
    const index = mockPayments.findIndex(p => p.id === paymentId);
    if (index !== -1) {
        mockPayments.splice(index, 1);
    }

    // Remove the payment row from the table
    const paymentRow = document.getElementById(`payment-row-${paymentId}`);
    if (paymentRow) {
        paymentRow.remove();
    }

    // Check if there are any remaining payments
    const tableBody = document.getElementById('paymentsTableBody');
    if (tableBody.children.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No pending payments found</td>
            </tr>
        `;
    }

    showSuccessToast('Payment approved successfully!');
}

// Reject payment
function rejectPayment(paymentId) {
    if (!confirm('Are you sure you want to reject this payment?')) {
        return;
    }

    // Remove the payment from mock data
    const index = mockPayments.findIndex(p => p.id === paymentId);
    if (index !== -1) {
        mockPayments.splice(index, 1);
    }

    // Remove the payment row from the table
    const paymentRow = document.getElementById(`payment-row-${paymentId}`);
    if (paymentRow) {
        paymentRow.remove();
    }

    // Check if there are any remaining payments
    const tableBody = document.getElementById('paymentsTableBody');
    if (tableBody.children.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No pending payments found</td>
            </tr>
        `;
    }

    showSuccessToast('Payment rejected successfully!');
}

// Initialize page
function initialize() {
    // Load pending payments
    loadPendingPayments();

    // Add logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);

// Check if user has valid token
function checkAuth() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

// ✅ Check Admin authentication
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token || !user.roles.includes("Admin")) {
        alert("🚫 Unauthorized access. Please login as an admin.");
        window.location.href = "../login.html";
        return null;
    }

    return { user, token };
}

document.addEventListener("DOMContentLoaded", async function () {
    const auth = checkAdminAuth();
    if (!auth) return;

    const { token } = auth;

    // Load payments on page load
    await loadPayments();

    // Function to load payments
    async function loadPayments() {
        try {
            const response = await fetch("http://aidentify-gradutionff.runasp.net/api/payment", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to fetch payments");

            const data = await response.json();
            const tableBody = document.querySelector("#paymentsTableBody");
            tableBody.innerHTML = "";

            data.forEach((payment) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${payment.id}</td>
                    <td>${payment.userName || 'N/A'}</td>
                    <td>${payment.userRole || 'N/A'}</td>
                    <td>${payment.status}</td>
                    <td>
                        ${payment.status === 'Pending' ? `
                            <button class="btn btn-success btn-sm" onclick="approvePayment('${payment.id}')">
                                <i class='bx bx-check'></i> Approve
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="rejectPayment('${payment.id}')">
                                <i class='bx bx-x'></i> Reject
                            </button>
                        ` : ''}
                        <button class="btn btn-danger btn-sm" onclick="deletePayment('${payment.id}')">
                            <i class='bx bx-trash'></i> Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error(error);
            alert("❌ Failed to load payments");
        }
    }

    // Function to approve payment
    window.approvePayment = async function (id) {
        if (!confirm("Are you sure you want to approve this payment?")) return;

        try {
            const response = await fetch(`http://aidentify-gradutionff.runasp.net/api/payment/update-status/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify("Completed")
            });

            if (!response.ok) throw new Error("Failed to approve payment");

            alert("✅ Payment approved successfully!");
            await loadPayments();
        } catch (error) {
            console.error(error);
            alert("❌ Failed to approve payment");
        }
    };

    // Function to reject payment
    window.rejectPayment = async function (id) {
        if (!confirm("Are you sure you want to reject this payment?")) return;

        try {
            const response = await fetch(`http://aidentify-gradutionff.runasp.net/api/payment/update-status/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify("Failed")
            });

            if (!response.ok) throw new Error("Failed to reject payment");

            alert("✅ Payment rejected successfully!");
            await loadPayments();
        } catch (error) {
            console.error(error);
            alert("❌ Failed to reject payment");
        }
    };

    // Function to delete payment
    window.deletePayment = async function (id) {
        if (!confirm("Are you sure you want to delete this payment?")) return;

        try {
            const response = await fetch(`http://aidentify-gradutionff.runasp.net/api/payment/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to delete payment");

            alert("✅ Payment deleted successfully!");
            await loadPayments();
        } catch (error) {
            console.error(error);
            alert("❌ Failed to delete payment");
        }
    };
});

// ✅ Logout functionality
document.getElementById("logoutBtn").addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../login.html";
        return;
    }

    try {
        const res = await fetch("http://aidentify-gradutionff.runasp.net/api/Account/Logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Logout failed");

    } catch (err) {
        console.error("Error during logout:", err);
    }

    // Clear localStorage and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../login.html";
}); 