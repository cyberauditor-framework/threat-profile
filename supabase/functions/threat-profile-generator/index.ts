import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ThreatProfileRequest {
  profileName: string;
  industries: string[];
  regions: string[];
  technologies: string[];
  articles: Article[];
}

interface Article {
  title: string;
  url: string;
  description: string;
  publishedAt: string | null;
  threatTypes: string[];
  industriesMentioned: string[];
  regionsMentioned: string[];
  technologiesMentioned: string[];
  severity: string;
}

interface ThreatProfile {
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

interface Threat {
  name: string;
  severity: string;
  description: string;
  affectedSectors: string[];
  articleCount: number;
  trend: string;
}

interface Recommendation {
  priority: string;
  category: string;
  title: string;
  description: string;
  actions: string[];
}

interface Statistics {
  totalArticles: number;
  relevantArticles: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  topThreatTypes: { type: string; count: number }[];
  timeRange: { from: string; to: string };
}

function filterRelevantArticles(
  articles: Article[],
  industries: string[],
  regions: string[],
  technologies: string[]
): Article[] {
  return articles.filter(article => {
    const industryMatch = industries.length === 0 ||
      industries.some(ind =>
        article.industriesMentioned.some(mentioned =>
          mentioned.toLowerCase().includes(ind.toLowerCase()) ||
          ind.toLowerCase().includes(mentioned.toLowerCase())
        )
      );

    const regionMatch = regions.length === 0 ||
      regions.some(reg =>
        article.regionsMentioned.some(mentioned =>
          mentioned.toLowerCase().includes(reg.toLowerCase()) ||
          reg.toLowerCase().includes(mentioned.toLowerCase())
        )
      );

    const techMatch = technologies.length === 0 ||
      technologies.some(tech =>
        article.technologiesMentioned.some(mentioned =>
          mentioned.toLowerCase().includes(tech.toLowerCase()) ||
          tech.toLowerCase().includes(mentioned.toLowerCase())
        )
      );

    return industryMatch || regionMatch || techMatch;
  });
}

function generateTopThreats(articles: Article[]): Threat[] {
  const threatMap = new Map<string, {
    count: number;
    severity: string;
    descriptions: Set<string>;
    sectors: Set<string>;
  }>();

  for (const article of articles) {
    for (const threat of article.threatTypes) {
      if (!threatMap.has(threat)) {
        threatMap.set(threat, {
          count: 0,
          severity: article.severity,
          descriptions: new Set(),
          sectors: new Set()
        });
      }

      const data = threatMap.get(threat)!;
      data.count++;

      if (article.description) {
        data.descriptions.add(article.description.substring(0, 200));
      }

      article.industriesMentioned.forEach(ind => data.sectors.add(ind));

      const severityPriority = { critical: 4, high: 3, medium: 2, low: 1 };
      if (severityPriority[article.severity as keyof typeof severityPriority] >
          severityPriority[data.severity as keyof typeof severityPriority]) {
        data.severity = article.severity;
      }
    }
  }

  const threats: Threat[] = Array.from(threatMap.entries())
    .map(([name, data]) => ({
      name,
      severity: data.severity,
      description: Array.from(data.descriptions)[0] || `${name} activity detected in recent threat intelligence`,
      affectedSectors: Array.from(data.sectors),
      articleCount: data.count,
      trend: data.count > 5 ? 'increasing' : data.count > 2 ? 'stable' : 'emerging'
    }))
    .sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity as keyof typeof severityOrder] -
                          severityOrder[a.severity as keyof typeof severityOrder];
      if (severityDiff !== 0) return severityDiff;
      return b.articleCount - a.articleCount;
    })
    .slice(0, 10);

  return threats;
}

function generateRecommendations(
  threats: Threat[],
  industries: string[],
  technologies: string[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const hasCritical = threats.some(t => t.severity === 'critical');
  const hasRansomware = threats.some(t => t.name.includes('ransomware'));
  const hasPhishing = threats.some(t => t.name.includes('phishing'));
  const hasAPT = threats.some(t => t.name.includes('apt'));
  const hasVulnerability = threats.some(t => t.name.includes('vulnerability'));

  if (hasCritical) {
    recommendations.push({
      priority: 'critical',
      category: 'Incident Response',
      title: 'Activate Enhanced Monitoring',
      description: 'Critical threats detected targeting your sector. Immediate action required.',
      actions: [
        'Review and update incident response procedures',
        'Increase SOC monitoring frequency',
        'Conduct threat hunting exercises',
        'Validate backup and recovery procedures'
      ]
    });
  }

  if (hasRansomware) {
    recommendations.push({
      priority: 'high',
      category: 'Data Protection',
      title: 'Strengthen Ransomware Defenses',
      description: 'Ransomware campaigns are actively targeting organizations in your industry.',
      actions: [
        'Test and verify offline backup integrity',
        'Implement application whitelisting',
        'Restrict administrative privileges',
        'Deploy anti-ransomware solutions',
        'Conduct ransomware response drills'
      ]
    });
  }

  if (hasPhishing) {
    recommendations.push({
      priority: 'high',
      category: 'User Awareness',
      title: 'Enhanced Phishing Protection',
      description: 'Sophisticated phishing campaigns detected. User training is essential.',
      actions: [
        'Deploy advanced email filtering',
        'Conduct phishing simulation exercises',
        'Implement multi-factor authentication',
        'Review email security policies',
        'Train users on latest phishing techniques'
      ]
    });
  }

  if (hasAPT) {
    recommendations.push({
      priority: 'critical',
      category: 'Threat Detection',
      title: 'APT Detection and Response',
      description: 'Advanced Persistent Threat activity detected in your region or sector.',
      actions: [
        'Deploy advanced threat detection tools',
        'Implement network segmentation',
        'Conduct regular threat intelligence reviews',
        'Establish threat hunting program',
        'Review access controls and privilege management'
      ]
    });
  }

  if (hasVulnerability) {
    recommendations.push({
      priority: 'high',
      category: 'Patch Management',
      title: 'Accelerate Vulnerability Remediation',
      description: 'Critical vulnerabilities are being actively exploited.',
      actions: [
        'Prioritize patching for identified vulnerabilities',
        'Conduct vulnerability assessments',
        'Implement virtual patching where applicable',
        'Review and update patch management procedures',
        'Deploy vulnerability scanning tools'
      ]
    });
  }

  if (technologies.some(t => t.toLowerCase().includes('cloud'))) {
    recommendations.push({
      priority: 'medium',
      category: 'Cloud Security',
      title: 'Cloud Security Posture Review',
      description: 'Cloud infrastructure requires continuous security monitoring.',
      actions: [
        'Review cloud security configurations',
        'Implement cloud security posture management',
        'Audit IAM policies and permissions',
        'Enable cloud security monitoring',
        'Review data encryption settings'
      ]
    });
  }

  recommendations.push({
    priority: 'medium',
    category: 'Security Governance',
    title: 'Regular Threat Intelligence Reviews',
    description: 'Maintain continuous awareness of the evolving threat landscape.',
    actions: [
      'Subscribe to threat intelligence feeds',
      'Conduct weekly threat briefings',
      'Update security policies based on new threats',
      'Share threat intelligence with industry peers',
      'Document lessons learned from incidents'
    ]
  });

  return recommendations;
}

function generateStatistics(allArticles: Article[], relevantArticles: Article[]): Statistics {
  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  const threatTypeCount = new Map<string, number>();

  for (const article of relevantArticles) {
    severityCounts[article.severity as keyof typeof severityCounts]++;

    for (const threat of article.threatTypes) {
      threatTypeCount.set(threat, (threatTypeCount.get(threat) || 0) + 1);
    }
  }

  const topThreatTypes = Array.from(threatTypeCount.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const dates = relevantArticles
    .map(a => a.publishedAt)
    .filter(d => d !== null) as string[];

  const timeRange = dates.length > 0 ? {
    from: dates.sort()[0],
    to: dates.sort()[dates.length - 1]
  } : {
    from: new Date().toISOString(),
    to: new Date().toISOString()
  };

  return {
    totalArticles: allArticles.length,
    relevantArticles: relevantArticles.length,
    criticalThreats: severityCounts.critical,
    highThreats: severityCounts.high,
    mediumThreats: severityCounts.medium,
    lowThreats: severityCounts.low,
    topThreatTypes,
    timeRange
  };
}

function generateThreatSummary(
  threats: Threat[],
  statistics: Statistics,
  industries: string[],
  regions: string[],
  technologies: string[]
): string {
  const contextParts = [];

  if (industries.length > 0) {
    contextParts.push(`${industries.join(', ')} sector${industries.length > 1 ? 's' : ''}`);
  }

  if (regions.length > 0) {
    contextParts.push(`${regions.join(', ')} region${regions.length > 1 ? 's' : ''}`);
  }

  if (technologies.length > 0) {
    contextParts.push(`${technologies.join(', ')} technolog${technologies.length > 1 ? 'ies' : 'y'}`);
  }

  const context = contextParts.length > 0
    ? `targeting ${contextParts.join(' in ')}`
    : 'across all sectors';

  const topThreatsText = threats.slice(0, 3).map(t => t.name).join(', ');

  let summary = `Analysis of ${statistics.relevantArticles} threat intelligence articles ${context} reveals `;

  if (statistics.criticalThreats > 0) {
    summary += `${statistics.criticalThreats} critical threat${statistics.criticalThreats > 1 ? 's' : ''}, `;
  }

  summary += `${statistics.highThreats} high-severity threat${statistics.highThreats > 1 ? 's' : ''}, `;
  summary += `and ${statistics.mediumThreats + statistics.lowThreats} medium to low-severity incidents. `;

  if (topThreatsText) {
    summary += `Primary threat vectors include ${topThreatsText}. `;
  }

  summary += `Organizations should prioritize security controls and monitoring based on the identified threat landscape.`;

  return summary;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: ThreatProfileRequest = await req.json();

    const { profileName, industries, regions, technologies, articles } = body;

    if (!profileName || !articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'profileName and articles are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Generating threat profile: ${profileName}`);
    console.log(`Criteria - Industries: ${industries?.length || 0}, Regions: ${regions?.length || 0}, Technologies: ${technologies?.length || 0}`);
    console.log(`Total articles to analyze: ${articles.length}`);

    const relevantArticles = filterRelevantArticles(
      articles,
      industries || [],
      regions || [],
      technologies || []
    );

    console.log(`Relevant articles found: ${relevantArticles.length}`);

    const topThreats = generateTopThreats(relevantArticles);
    const statistics = generateStatistics(articles, relevantArticles);
    const recommendations = generateRecommendations(topThreats, industries || [], technologies || []);
    const threatSummary = generateThreatSummary(
      topThreats,
      statistics,
      industries || [],
      regions || [],
      technologies || []
    );

    const profile: ThreatProfile = {
      profileName,
      industries: industries || [],
      regions: regions || [],
      technologies: technologies || [],
      threatSummary,
      topThreats,
      recommendations,
      statistics,
      relevantArticles: relevantArticles.slice(0, 50),
      generatedAt: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({
        success: true,
        profile
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Error generating threat profile:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});
