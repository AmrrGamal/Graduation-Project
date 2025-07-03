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

// API Base URL
const API_BASE_URL = "http://aidentify-gradutionff.runasp.net/api";

$(document).ready(function () {
    const auth = checkAdminAuth();
    if (!auth) return;

    const { token } = auth;

    // Load users
    async function loadUsers() {
        try {
            const [adminsResponse, doctorsResponse, studentsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/User/GetAllAdmins`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }),
                fetch(`${API_BASE_URL}/User/GetAllDoctors`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }),
                fetch(`${API_BASE_URL}/User/GetAllStudents`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
            ]);

            if (!adminsResponse.ok || !doctorsResponse.ok || !studentsResponse.ok) {
                throw new Error("Failed to fetch users");
            }

            const admins = await adminsResponse.json();
            const doctors = await doctorsResponse.json();
            const students = await studentsResponse.json();

            // Combine all users with their roles
            const allUsers = [
                ...(Array.isArray(admins) ? admins.map(admin => ({ ...admin, roles: 'Admin' })) : []),
                ...(Array.isArray(doctors) ? doctors.map(doctor => ({ ...doctor, roles: 'Doctor' })) : []),
                ...(Array.isArray(students) ? students.map(student => ({ ...student, roles: 'Student' })) : [])
            ];

            // Update table body
            const tableBody = $('#usersTableBody');
            tableBody.empty();

            allUsers.forEach((user, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${user.userName || ''}</td>
                        <td>${(user.firstName || '')} ${(user.lastName || '')}</td>
                        <td>${user.email || ''}</td>
                        <td>${user.roles || ''}</td>
                    </tr>
                `;
                tableBody.append(row);
            });

        } catch (error) {
            console.error('Error loading users:', error);
            if (error.message === 'Failed to fetch') {
                alert('Connection error: Unable to reach the server. Please check your internet connection and try again.');
            } else {
                alert('Failed to load users. Please check the console for details.');
            }
        }
    }

    // Role filter functionality
    $('#roleFilter').on('change', function () {
        const selectedRole = $(this).val();
        $('#usersTableBody tr').each(function () {
            const roleCell = $(this).find('td:eq(4)');
            if (selectedRole === 'all' || roleCell.text() === selectedRole) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // Initial load
    loadUsers();
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
