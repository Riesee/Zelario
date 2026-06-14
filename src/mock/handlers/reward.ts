import { 
    ok,
    fail,
    MockResult, 
    MockBody,
    pathOnly,
    queryOf
} from "../utils"; 
import { mockStore } from "../store";

interface RewardRecord {
  lastClaimDate: string | null; // ISO Date String format YYYY-MM-DD
  rewardAmount: number;
}
const STORAGE_KEY = "zelario_mock_rewards_db";

// In-memory table mapping userId -> reward details
const getRewardsDb = (userId: string): Record<string, RewardRecord> => {
    if (typeof window === "undefined") return {};
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        const initialDb: Record<string, RewardRecord> = {
            [userId]: { lastClaimDate: null, rewardAmount: 50 }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
        return initialDb;
    }
    return JSON.parse(data);
};

const updateRewardsDb = (db: Record<string, RewardRecord>) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
};

const isSessionAuthenticated = (): boolean => {
    if (typeof window === "undefined") return false;
  
    try {
        const persistRoot = localStorage.getItem("persist:root");
        if (!persistRoot) return false;

        const parsedRoot = JSON.parse(persistRoot);        
        if (parsedRoot && parsedRoot.userAuth) {
            const userAuth = JSON.parse(parsedRoot.userAuth);
            return userAuth.isAuthenticated === true;
        }
    } catch (error) {
        console.error("Error parsing sync mock session data:", error);
    }

    // Fallback to standard token validation checks if Redux isn't loaded yet
    return localStorage.isAuthenticated;
};

// Helper utility to get the current UTC date string (YYYY-MM-DD)
const getTodayUTCString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export function handleRewardApi(
  method: string,
  url: string,
  body?: MockBody
): MockResult | null {
    const path = pathOnly(url);
    const m = method.toUpperCase();

    if (!path.startsWith('/api/rewards')) return null;
    const userId = mockStore.currentUser?._id || "demo-user-1";
    const rewardsDb = getRewardsDb(userId);
    const todayStr = getTodayUTCString();
    
    if (m === "GET" && path === "/api/rewards/daily-login") {
        if (!isSessionAuthenticated()) {
            return ok({
                eligible: true,
                lastClaimDate: null,
                rewardAmount: 50
            });
        }
        if (!rewardsDb[userId]) {
            rewardsDb[userId] = { lastClaimDate: null, rewardAmount: 50 };
            updateRewardsDb(rewardsDb);
        }
        const record = rewardsDb[userId];
        const isEligible = record.lastClaimDate !== todayStr;
        
        return ok({
            eligible: isEligible,
            lastClaimDate: record.lastClaimDate,
            rewardAmount: record.rewardAmount
        });
    }

    if (m === "POST" && path === "/api/rewards/daily-login/claim") {   
        console.log     
        if (!isSessionAuthenticated() || !mockStore.currentUser?._id) {
            return fail("unauthorized: Please log in to manage or claim account profile rewards.", 401);
        }

        if (!rewardsDb[userId]) {
            rewardsDb[userId] = { lastClaimDate: null, rewardAmount: 50 };
            updateRewardsDb(rewardsDb);
        }
        
        const record = rewardsDb[userId];        
        if (record.lastClaimDate === todayStr) {
            return fail("Reward already claimed today", 400); 
        }
        record.lastClaimDate = todayStr;
        updateRewardsDb(rewardsDb);

        if (mockStore.currentUser) {
            mockStore.currentUser.totalPoints += record.rewardAmount;
        }
        
        return ok({
            success: true,
            message: "Reward claimed successfully",
            rewardAmount: record.rewardAmount
        });
    }
    return null;
}
