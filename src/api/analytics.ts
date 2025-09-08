import axios from './axios';

export interface DashboardStats {
  totalAmbassadors: number;
  activeAmbassadors: number;
  totalTeams: number;
  overallComplianceRate: number;
  thisWeekActivity: number;
  lastWeekActivity: number;
  activeWarnings: number;
}

export interface ActivityTrend {
  date: string;
  stories: number;
  posts: number;
  reels: number;
  total: number;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  memberCount: number;
  complianceRate: number;
  totalActivity: number;
  avgActivityPerMember: number;
  stories: number;
  posts: number;
  reels: number;
}

export interface UserEngagement {
  userId: string;
  userName: string;
  teamName?: string;
  totalActivity: number;
  stories: number;
  posts: number;
  reels: number;
  complianceScore: number;
  lastActivity?: Date;
  warningCount: number;
  isActive: boolean;
}

export interface ComplianceTrend {
  period: string;
  compliantUsers: number;
  totalUsers: number;
  complianceRate: number;
}

export interface ActivityDistribution {
  mediaType: string;
  count: number;
  percentage: number;
}

export interface TopPerformers {
  userId: string;
  userName: string;
  teamName?: string;
  totalActivity: number;
  complianceScore: number;
}

export interface InactiveUsers {
  userId: string;
  userName: string;
  teamName?: string;
  lastActivity?: Date;
  daysSinceLastActivity: number;
  warningCount: number;
}

export interface AmbassadorSummary {
  id: string;
  name: string;
  actual: {
    stories: number;
    posts: number;
    reels: number;
  };
  expected: {
    stories: number;
    posts: number;
    reels: number;
  };
  compliance: {
    story: string;
    post: string;
    reel: string;
  };
  role?: 'ambassador' | 'leader';
  active?: boolean;
  photoUrl?: string;
  lastActivity?: Date;
}

class AnalyticsAPI {
  // ===== NEW COMPREHENSIVE ENDPOINTS =====
  
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await axios.get('/analytics/dashboard-stats');
    return response.data;
  }

  async getActivityTrends(days: number = 30): Promise<ActivityTrend[]> {
    const response = await axios.get('/analytics/activity-trends', {
      params: { days }
    });
    return response.data;
  }

  async getTeamPerformance(): Promise<TeamPerformance[]> {
    const response = await axios.get('/analytics/team-performance');
    return response.data;
  }

  async getUserEngagement(): Promise<UserEngagement[]> {
    const response = await axios.get('/analytics/user-engagement');
    return response.data;
  }

  async getComplianceTrends(months: number = 6): Promise<ComplianceTrend[]> {
    const response = await axios.get('/analytics/compliance-trends', {
      params: { months }
    });
    return response.data;
  }

  async getActivityDistribution(): Promise<ActivityDistribution[]> {
    const response = await axios.get('/analytics/activity-distribution');
    return response.data;
  }

  async getTopPerformers(limit: number = 10): Promise<TopPerformers[]> {
    const response = await axios.get('/analytics/top-performers', {
      params: { limit }
    });
    return response.data;
  }

  async getInactiveUsers(days: number = 7): Promise<InactiveUsers[]> {
    const response = await axios.get('/analytics/inactive-users', {
      params: { days }
    });
    return response.data;
  }

  // ===== EXISTING ENDPOINTS =====

  async getAllCompliance(start?: string, end?: string): Promise<AmbassadorSummary[]> {
    const response = await axios.get('/analytics/all-compliance', {
      params: { start, end }
    });
    return response.data;
  }

  async getTeamCompliance(leaderId: string, start?: string, end?: string): Promise<AmbassadorSummary[]> {
    const response = await axios.get('/analytics/team-compliance', {
      params: { leaderId, start, end }
    });
    return response.data;
  }

  async getWeeklyCompliance(userId: string, from?: string, to?: string) {
    const response = await axios.get('/analytics/weekly-compliance', {
      params: { userId, from, to }
    });
    return response.data;
  }

  async getMonthlyActivity(leaderId?: string) {
    const response = await axios.get('/analytics/monthly-activity', {
      params: leaderId ? { leaderId } : {}
    });
    return response.data;
  }

  async getTeamActivity() {
    const response = await axios.get('/analytics/team-activity');
    return response.data;
  }

  async getTeamMonthlyActivity() {
    const response = await axios.get('/analytics/team-monthly-activity');
    return response.data;
  }

  async getTeamContribution() {
    const response = await axios.get('/analytics/team-contribution');
    return response.data;
  }

  async getComplianceByTeam() {
    const response = await axios.get('/analytics/compliance-by-team');
    return response.data;
  }

  async getOverallComplianceRate(start?: string, end?: string) {
    const response = await axios.get('/analytics/overall-compliance-rate', {
      params: { start, end }
    });
    return response.data;
  }

  async getTeamComplianceCount(leaderId: string, start?: string, end?: string) {
    const response = await axios.get('/analytics/team-compliance-count', {
      params: { leaderId, start, end }
    });
    return response.data;
  }

  async getTeamComplianceStats(leaderId: string) {
    const response = await axios.get('/analytics/team-compliance-stats', {
      params: { leaderId }
    });
    return response.data;
  }
}

export const analyticsAPI = new AnalyticsAPI();
export default analyticsAPI;
