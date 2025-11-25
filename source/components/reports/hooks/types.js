// reports/hooks/types.js
// Tipos para useReports
export const useReportsTypes = {
  filters: `{
    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    targetType?: 'post' | 'comment' | 'user' | 'forum' | 'profile';
    urgency?: 'low' | 'medium' | 'high' | 'critical';
  }`,

  returnType: `{
    reports: Array<{
      id: string;
      targetType: string;
      targetId: string;
      targetData: any;
      reason: string;
      description: string;
      urgency: string;
      reportedBy: string;
      reportedAt: any;
      status: string;
      reviewedBy?: string;
      reviewedAt?: any;
      moderatorNotes?: string;
      actionTaken?: string;
    }>;
    loading: boolean;
    error: string | null;
    stats: {
      pending: number;
      reviewed: number;
      resolved: number;
      critical: number;
      total: number;
    } | null;
    refresh: () => Promise<void>;
    updateReportStatus: (reportId: string, status: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
    resolveReport: (reportId: string, actionTaken: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
    dismissReport: (reportId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  }`,
};

// Tipos para useModerationActions
export const useModerationActionsTypes = {
  returnType: `{
    loading: boolean;
    error: string | null;
    takeAction: (actionData: {
      action: string;
      targetType: string;
      targetId: string;
      reason: string;
      details?: any;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      relatedReports?: string[];
      notifyUser?: boolean;
      targetUserId?: string;
      duration?: string;
      strikeData?: any;
    }) => Promise<{ success: boolean; logId?: string; error?: string }>;
    removePost: (postId: string, reason: string, relatedReports?: string[]) => Promise<{ success: boolean; logId?: string; error?: string }>;
    removeComment: (commentId: string, reason: string, relatedReports?: string[]) => Promise<{ success: boolean; logId?: string; error?: string }>;
    suspendUser: (userId: string, duration: string, reason: string, strikePoints?: number) => Promise<{ success: boolean; logId?: string; error?: string }>;
    warnUser: (userId: string, reason: string) => Promise<{ success: boolean; logId?: string; error?: string }>;
    clearError: () => void;
  }`,
};

// Tipos para useModerationStats
export const useModerationStatsTypes = {
  returnType: `{
    stats: {
      totalActions: number;
      actionsByType: Record<string, number>;
      actionsByModerator: Record<string, number>;
      severityBreakdown: Record<string, number>;
      reports?: {
        pending: number;
        reviewed: number;
        resolved: number;
        critical: number;
        total: number;
      };
    } | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    topModerators: Array<{ moderatorId: string; count: number }>;
    commonActions: Array<{ action: string; count: number }>;
  }`,
};

// Tipos para useUserStrikes
export const useUserStrikesTypes = {
  returnType: `{
    strikes: Array<{
      id: string;
      userId: string;
      reason: string;
      severity: 'low' | 'medium' | 'high';
      points: number;
      expiresAt: any;
      givenBy: string;
      givenAt: any;
      relatedContent: {
        type: string;
        id: string;
      };
      isActive: boolean;
      appealed: boolean;
      appealReason?: string;
    }>;
    loading: boolean;
    error: string | null;
    totalPoints: number;
    suspensionLevel: {
      level: 'none' | '1d' | '7d' | '30d' | 'permanent';
      pointsToNext: number;
    };
    refresh: () => Promise<void>;
    addStrike: (strikeData: {
      reason: string;
      severity: 'low' | 'medium' | 'high';
      points?: number;
      expiresAt?: any;
      contentType?: string;
      contentId?: string;
    }) => Promise<{ success: boolean; error?: string }>;
    getStrikeHistory: () => Promise<Array<any>>;
  }`,
};

// Tipos para useCreateReport
export const useCreateReportTypes = {
  returnType: `{
    loading: boolean;
    error: string | null;
    success: boolean;
    createReport: (reportData: {
      targetType: 'post' | 'comment' | 'user' | 'forum' | 'profile';
      targetId: string;
      targetData?: any;
      reason: string;
      description?: string;
      urgency?: 'low' | 'medium' | 'high' | 'critical';
    }) => Promise<{ success: boolean; reportId?: string; error?: string }>;
    reportPost: (postId: string, postData: any, reason: string, description: string, urgency?: string) => Promise<{ success: boolean; reportId?: string; error?: string }>;
    reportComment: (commentId: string, commentData: any, reason: string, description: string, urgency?: string) => Promise<{ success: boolean; reportId?: string; error?: string }>;
    reportUser: (userId: string, userData: any, reason: string, description: string, urgency?: string) => Promise<{ success: boolean; reportId?: string; error?: string }>;
    reportProfile: (userId: string, profileData: any, reason: string, description: string, urgency?: string) => Promise<{ success: boolean; reportId?: string; error?: string }>;
    reset: () => void;
  }`,
};

// Tipos para useModerationPanel (hook combinado)
export const useModerationPanelTypes = {
  returnType: `{
    // Reports
    reports: Array<any>;
    reportsLoading: boolean;
    reportsError: string | null;
    reportsStats: {
      pending: number;
      reviewed: number;
      resolved: number;
      critical: number;
      total: number;
    } | null;
    refreshReports: () => Promise<void>;
    updateReportStatus: (reportId: string, status: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
    
    // Stats
    moderationStats: {
      totalActions: number;
      actionsByType: Record<string, number>;
      actionsByModerator: Record<string, number>;
      severityBreakdown: Record<string, number>;
      reports?: {
        pending: number;
        reviewed: number;
        resolved: number;
        critical: number;
        total: number;
      };
    } | null;
    statsLoading: boolean;
    topModerators: Array<{ moderatorId: string; count: number }>;
    commonActions: Array<{ action: string; count: number }>;
    
    // Actions
    takeAction: (actionData: any) => Promise<{ success: boolean; logId?: string; error?: string }>;
    removePost: (postId: string, reason: string, relatedReports?: string[]) => Promise<{ success: boolean; logId?: string; error?: string }>;
    removeComment: (commentId: string, reason: string, relatedReports?: string[]) => Promise<{ success: boolean; logId?: string; error?: string }>;
    suspendUser: (userId: string, duration: string, reason: string, strikePoints?: number) => Promise<{ success: boolean; logId?: string; error?: string }>;
    warnUser: (userId: string, reason: string) => Promise<{ success: boolean; logId?: string; error?: string }>;
    actionLoading: boolean;
    actionError: string | null;
  }`,
};
