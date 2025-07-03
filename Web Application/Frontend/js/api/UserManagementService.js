class UserManagementService {
    constructor() {
        this.baseUrl = 'http://aidentify-gradutionff.runasp.net/api/User';
    }

    async getAllUsers() {
        try {
            const [doctors, students, admins] = await Promise.all([
                this.getAllDoctors(),
                this.getAllStudents(),
                this.getAllAdmins()
            ]);

            return [...doctors, ...students, ...admins];
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    }

    async getAllDoctors() {
        try {
            const response = await fetch(`${this.baseUrl}/GetAllDoctors`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch doctors');
            const doctors = await response.json();
            console.log('Doctors API Response:', doctors);
            return doctors.map(doctor => ({
                id: doctor.id,
                username: doctor.userName,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                email: doctor.email,
                role: 'Doctor',
                clinicName: doctor.clinicName
            }));
        } catch (error) {
            console.error('Error fetching doctors:', error);
            throw error;
        }
    }

    async getAllStudents() {
        try {
            const response = await fetch(`${this.baseUrl}/GetAllStudents`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch students');
            const students = await response.json();
            console.log('Students API Response:', students);
            return students.map(student => ({
                id: student.id,
                username: student.userName,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                role: 'Student',
                university: student.university,
                level: student.level
            }));
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    }

    async getAllAdmins() {
        try {
            const response = await fetch(`${this.baseUrl}/GetAllAdmins`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch admins');
            const admins = await response.json();
            console.log('Admins API Response:', admins);
            return admins.map(admin => ({
                id: admin.id,
                username: admin.userName,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                role: 'Admin'
            }));
        } catch (error) {
            console.error('Error fetching admins:', error);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            const response = await fetch(`${this.baseUrl}/UpdateUser/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) throw new Error('Failed to update user');
            return await response.json();
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/DeleteUser/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to delete user');
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

export default UserManagementService;