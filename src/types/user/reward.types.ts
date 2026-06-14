
export interface DailyRewardStatus {
    eligible: boolean;
    lastClaimDate: string | null;
    rewardAmount: number;
}

export interface ClaimDailyReward {
    success: boolean;
    message: string;
    rewardAmount: number;
}
