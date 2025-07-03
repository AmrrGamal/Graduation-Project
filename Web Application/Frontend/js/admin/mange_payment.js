// Mock data for payments
const mockPayments = [
    {
        id: 'payment-1',
        userName: 'samaOsaman',
        amount: '$30',
        plan: 'Enterprise Plan',
        date: '2025-03-15',
        status: 'Pending'
    },
    {
        id: 'payment-2',
        userName: 'TokatokaSalah',
        amount: '$5',
        plan: 'Basic Plan',
        date: '2025-03-14',
        status: 'Pending'
    },
    {
        id: 'payment-3',
        userName: 'Mariamsaad',
        amount: '$15',
        plan: 'Premium Plan',
        date: '2025-03-13',
        status: 'Pending'
    },

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