const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: `${API_BASE_URL}/auth/register`,
        LOGIN: `${API_BASE_URL}/auth/login`,
    },
    USER: {
        PROFILE: `${API_BASE_URL}/user/profile`,
    },
    TRANSACTION: {
        CREATE: `${API_BASE_URL}/transaction/create`,
        MY_TRANSACTIONS: `${API_BASE_URL}/transaction/my-transactions`,
        GET_BY_ID: (id) => `${API_BASE_URL}/transaction/${id}`,
        ADMIN: {
            PENDING: `${API_BASE_URL}/transaction/admin/pending`,
            VERIFY: (id) => `${API_BASE_URL}/transaction/admin/verify/${id}`,
        }
    }
}; 