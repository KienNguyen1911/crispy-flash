import { useState, useEffect } from 'react';
import { getUserHeatmapData, getUserLearningStats, getUserInfo } from '@/services/analytics-api';
import { apiClient } from '@/lib/api';
import { HeatmapData } from '@/lib/types';

interface UserLearningStats {
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  reviewAccuracy: number;
  dailyReviewCounts: Array<{
    date: string;
    count: number;
  }>;
  weeklyStreak: number;
}

interface UserInfo {
  id: string;
  email: string;
  name: string;
  avatar: string;
  subscription: {
    status: string;
    expiryDate: string | null;
  };
  memberSince: string;
}

export function useUserHeatmapData() {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getUserHeatmapData();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch heatmap data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useUserLearningStats() {
  const [stats, setStats] = useState<UserLearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getUserLearningStats(apiClient);
        setStats(response as UserLearningStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch learning stats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, loading, error };
}

export function useUserInfo() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getUserInfo();
        setUser(response as UserInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user info');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { user, loading, error };
}