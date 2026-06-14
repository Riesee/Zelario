export const REWARD_ROUTES = {
    DAILY_REWARD_STATUS: '/api/rewards/daily-login',
    CLAIM_DAILY_REWARD: '/api/rewards/daily-login/claim'
} as const

export type RewardRoutes = typeof REWARD_ROUTES[keyof typeof REWARD_ROUTES]