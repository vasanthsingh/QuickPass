const LOCAL_PASSES_KEY = 'quickpass_local_passes'

const safeParse = (raw) => {
    try {
        return JSON.parse(raw)
    } catch {
        return []
    }
}

const readAllLocalPasses = () => {
    const raw = localStorage.getItem(LOCAL_PASSES_KEY)
    if (!raw) return []
    const parsed = safeParse(raw)
    return Array.isArray(parsed) ? parsed : []
}

const writeAllLocalPasses = (passes) => {
    localStorage.setItem(LOCAL_PASSES_KEY, JSON.stringify(passes))
}

export const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
})

export const getLocalPassesForStudent = (rollNumber) => {
    if (!rollNumber) return []
    return readAllLocalPasses()
        .filter((pass) => pass.rollNumber === rollNumber)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export const saveLocalPassForStudent = ({ rollNumber, passType, payload }) => {
    const nextPass = {
        _id: `local-${Date.now()}`,
        rollNumber,
        passType,
        fromDate: payload.fromDate,
        fromTime: payload.fromTime,
        toDate: payload.toDate,
        toTime: payload.toTime,
        destination: payload.destination,
        reason: payload.reason,
        transportMode: payload.transportMode,
        status: 'Pending',
        guardianApprovalStatus: passType === 'Home Pass' ? 'Pending' : 'NotRequired',
        createdAt: new Date().toISOString(),
        source: 'local',
    }

    const existing = readAllLocalPasses()
    writeAllLocalPasses([nextPass, ...existing])
    return nextPass
}

export const getDisplayStatus = (pass) => {
    if (!pass) return 'Unknown'

    if (pass.passType === 'Day Pass' && pass.status === 'Pending') {
        return 'Pending Warden Approval'
    }

    if (pass.passType === 'Home Pass' && pass.status === 'Pending' && pass.guardianApprovalStatus === 'Pending') {
        return 'Pending Guardian Approval'
    }

    if (pass.passType === 'Home Pass' && pass.status === 'Pending' && pass.guardianApprovalStatus === 'Approved') {
        return 'Pending Warden Approval'
    }

    return pass.status || 'Pending'
}

export const getStatusClass = (statusLabel) => {
    const value = String(statusLabel || '').toLowerCase()
    if (value.includes('approved') || value.includes('completed')) return 'status-green'
    if (value.includes('rejected') || value.includes('expired')) return 'status-red'
    if (value.includes('out')) return 'status-blue'
    return 'status-amber'
}

export const formatDate = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
