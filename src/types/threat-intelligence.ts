export interface ThreatFeed {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  category: string;
}

export interface Article {
  title: string;
  url: string;
  description: string;
  publishedAt: string | null;
  keywords: string[];
  threatTypes: string[];
  industriesMentioned: string[];
  regionsMentioned: string[];
  technologiesMentioned: string[];
  severity: string;
}

export interface Threat {
  name: string;
  severity: string;
  description: string;
  affectedSectors: string[];
  articleCount: number;
  trend: string;
}

export interface Recommendation {
  priority: string;
  category: string;
  title: string;
  description: string;
  actions: string[];
}

export interface Statistics {
  totalArticles: number;
  relevantArticles: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  topThreatTypes: { type: string; count: number }[];
  timeRange: { from: string; to: string };
}

export interface ThreatProfile {
  profileName: string;
  industries: string[];
  regions: string[];
  technologies: string[];
  threatSummary: string;
  topThreats: Threat[];
  recommendations: Recommendation[];
  statistics: Statistics;
  relevantArticles: Article[];
  generatedAt: string;
}
