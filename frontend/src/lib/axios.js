import axios from 'axios'

const normalizeApiBase = (rawBase) => {
    const fallbackBase = 'http://localhost:5000/api'
    const candidate = String(rawBase || fallbackBase).trim()
    const withoutTrailingSlash = candidate.replace(/\/+$/, '')

    return withoutTrailingSlash.endsWith('/api')
        ? withoutTrailingSlash
        : `${withoutTrailingSlash}/api`
}

const api = axios.create({
    baseURL: normalizeApiBase(import.meta.env.VITE_API_BASE_URL),
})

export default api
