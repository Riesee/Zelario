import { AxiosError } from "axios";
import API from "@/lib/api-client";
import { REWARD_ROUTES } from "@/routes";
import {
  DailyRewardStatus,
  ClaimDailyReward
} from "@/types/user/reward.types";

interface ApiErrorData {
  error?: string;
  message?: string;
  success?: boolean;
}


// Helper function to handle API errors
const handleApiError = (error: AxiosError<ApiErrorData>, defaultMessage: string) => {
  console.error("Reward API Error:", {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message,
    url: error.config?.url,
    method: error.config?.method
  });

  const errorMessage = error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    defaultMessage;

  return {
    success: false,
    error: errorMessage
  };
};

export const fetchDailyRewardStatus = async () => {
  try {
    const response = await API.get<DailyRewardStatus>(REWARD_ROUTES.DAILY_REWARD_STATUS);
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError<ApiErrorData>, 'Failed to fetch reward status.');
  }
};

export const claimDailyReward = async () => {
  try {
    const response = await API.post<ClaimDailyReward>(REWARD_ROUTES.CLAIM_DAILY_REWARD, {});
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError<ApiErrorData>, 'Failed to claim reward.');
  }
};