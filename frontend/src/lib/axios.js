import axios from 'axios'

const normalizeApiBaseUrl = (rawUrl) => {
    const trimmed = (rawUrl || '').trim().replace(/\/+$/, '')

    if (!trimmed) {
        return 'https://quick-pass-theta.vercel.app/api'
    }

    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

const api = axios.create({
    baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
    headers: {
        'Content-Type': 'application/json',
    },
})

export default api
