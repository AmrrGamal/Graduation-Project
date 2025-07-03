class RoleManager {
    static ROLES = {
        ADMIN: 'Admin',
        DOCTOR: 'Doctor',
        STUDENT: 'Student'
    };

    static FEATURES = {
        PREDICT_TEETH: 'predict_teeth',
        PREDICT_DISEASE: 'predict_disease',
        PREDICT_GENDER: 'predict_gender',
        PREDICT_AGE: 'predict_age',
        MANAGE_PATIENTS: 'manage_patients',
        MANAGE_QUIZZES: 'manage_quizzes',
        VIEW_QUIZZES: 'view_quizzes',
        MANAGE_PLANS: 'manage_plans',
        MANAGE_USERS: 'manage_users',
        MANAGE_PAYMENTS: 'manage_payments'
    };

    static ROLE_FEATURES = {
        [this.ROLES.ADMIN]: [
            this.FEATURES.MANAGE_PLANS,
            this.FEATURES.MANAGE_USERS,
            this.FEATURES.MANAGE_PAYMENTS,
            this.FEATURES.MANAGE_QUIZZES,
            this.FEATURES.PREDICT_TEETH,
            this.FEATURES.PREDICT_DISEASE,
            this.FEATURES.PREDICT_GENDER,
            this.FEATURES.PREDICT_AGE
        ],
        [this.ROLES.DOCTOR]: [
            this.FEATURES.PREDICT_TEETH,
            this.FEATURES.PREDICT_DISEASE,
            this.FEATURES.PREDICT_GENDER,
            this.FEATURES.PREDICT_AGE,
            this.FEATURES.MANAGE_PATIENTS,
            this.FEATURES.VIEW_QUIZZES
        ],
        [this.ROLES.STUDENT]: [
            this.FEATURES.PREDICT_TEETH,
            this.FEATURES.PREDICT_DISEASE,
            this.FEATURES.VIEW_QUIZZES
        ]
    };

    static hasFeature(role, feature) {
        if (!this.ROLE_FEATURES[role]) {
            return false;
        }
        return this.ROLE_FEATURES[role].includes(feature);
    }

    static getAvailableFeatures(role) {
        return this.ROLE_FEATURES[role] || [];
    }

    static canAccess(role, feature) {
        return this.hasFeature(role, feature);
    }

    static getRoleFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    static checkAccess(feature) {
        const role = this.getRoleFromToken();
        if (!role) return false;
        return this.canAccess(role, feature);
    }

    static redirectToRoleHome(role) {
        switch (role) {
            case this.ROLES.ADMIN:
                window.location.href = '/Admin/index_admin.html';
                break;
            case this.ROLES.DOCTOR:
                window.location.href = '/Doctor/index_doctor.html';
                break;
            case this.ROLES.STUDENT:
                window.location.href = '/Student/index_student.html';
                break;
            default:
                window.location.href = '/index.html';
        }
    }
}

export default RoleManager; 