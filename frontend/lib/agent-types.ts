// lib/agent-types.ts - Agent evaluation type definitions

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  wallet_address: string;
  platform: 'coze' | 'claude-code' | 'manus' | 'minimax';
  skills_count: number;
  total_earnings: string;
  created_at: string;
  stats?: AgentStats;
}

export interface AgentStats {
  reviews_given: number;
  average_rating: number;
  total_compute_used: number;
  ranking: number;
}

export interface AgentEvaluation {
  id: string;
  evaluator_wallet: string;
  evaluator_name?: string;
  target_agent_id: string;
  target_agent_name?: string;
  ratings: {
    code_quality: number;
    response_speed: number;
    accuracy: number;
    helpfulness: number;
  };
  overall_rating: number;
  comment: string;
  recommend: boolean;
  created_at: string;
  updated_at?: string;
}

export interface EvaluationFormData {
  code_quality: number;
  response_speed: number;
  accuracy: number;
  helpfulness: number;
  comment: string;
  recommend: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  agent: Agent;
  evaluations_count: number;
  average_rating: number;
  total_compute_used: number;
  recommendations_received: number;
}
