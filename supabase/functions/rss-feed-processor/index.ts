import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  content?: string;
}

interface ProcessedArticle {
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

const THREAT_KEYWORDS = {
  threatTypes: [
    'ransomware', 'malware', 'phishing', 'apt', 'ddos', 'vulnerability',
    'exploit', 'trojan', 'backdoor', 'botnet', 'spyware', 'rootkit',
    'zero-day', 'supply chain', 'credential theft', 'data breach',
    'social engineering', 'business email compromise', 'cryptojacking'
  ],
  industries: [
    'financial', 'healthcare', 'energy', 'government', 'retail',
    'technology', 'manufacturing', 'telecommunications', 'education',
    'transportation', 'critical infrastructure', 'media', 'defense'
  ],
  regions: [
    'united states', 'europe', 'asia', 'china', 'russia', 'north korea',
    'iran', 'middle east', 'latin america', 'africa', 'global', 'worldwide'
  ],
  technologies: [
    'windows', 'linux', 'macos', 'aws', 'azure', 'google cloud',
    'office 365', 'active directory', 'exchange', 'vmware', 'docker',
    'kubernetes', 'cisco', 'fortinet', 'palo alto', 'sharepoint',
    'sap', 'oracle', 'sql server', 'wordpress', 'apache', 'nginx',
    'salesforce', 'android', 'ios', 'chrome', 'firefox', 'edge'
  ]
};

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];

  const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);

  for (const match of itemMatches) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i);
    const descMatch = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const pubDateMatch = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
    const contentMatch = itemXml.match(/<content:encoded[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i);

    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].trim(),
        link: linkMatch[1].trim(),
        description: descMatch ? descMatch[1].trim() : '',
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : undefined,
        content: contentMatch ? contentMatch[1].trim() : undefined
      });
    }
  }

  return items;
}

function extractKeywords(text: string, keywordList: string[]): string[] {
  const lowerText = text.toLowerCase();
  const found = new Set<string>();

  for (const keyword of keywordList) {
    if (lowerText.includes(keyword.toLowerCase())) {
      found.add(keyword);
    }
  }

  return Array.from(found);
}

function determineSeverity(threatTypes: string[], keywords: string[]): string {
  const criticalIndicators = ['zero-day', 'critical', 'ransomware', 'apt', 'data breach'];
  const highIndicators = ['exploit', 'vulnerability', 'malware', 'backdoor'];

  const allTerms = [...threatTypes, ...keywords].map(t => t.toLowerCase());

  if (criticalIndicators.some(indicator => allTerms.includes(indicator))) {
    return 'critical';
  }
  if (highIndicators.some(indicator => allTerms.includes(indicator))) {
    return 'high';
  }
  if (threatTypes.length > 0) {
    return 'medium';
  }
  return 'low';
}

function processArticle(item: RSSItem): ProcessedArticle {
  const fullText = `${item.title} ${item.description || ''} ${item.content || ''}`;

  const threatTypes = extractKeywords(fullText, THREAT_KEYWORDS.threatTypes);
  const industries = extractKeywords(fullText, THREAT_KEYWORDS.industries);
  const regions = extractKeywords(fullText, THREAT_KEYWORDS.regions);
  const technologies = extractKeywords(fullText, THREAT_KEYWORDS.technologies);

  const allKeywords = [...threatTypes, ...industries, ...regions, ...technologies];
  const severity = determineSeverity(threatTypes, allKeywords);

  return {
    title: item.title,
    url: item.link,
    description: item.description || '',
    publishedAt: item.pubDate || null,
    keywords: allKeywords,
    threatTypes,
    industriesMentioned: industries,
    regionsMentioned: regions,
    technologiesMentioned: technologies,
    severity
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { feedUrl, feedName } = await req.json();

    if (!feedUrl) {
      return new Response(
        JSON.stringify({ error: 'feedUrl is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching RSS feed: ${feedName || feedUrl}`);

    const feedResponse = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Threat-Intelligence-Bot/1.0'
      }
    });

    if (!feedResponse.ok) {
      throw new Error(`Failed to fetch RSS feed: ${feedResponse.status} ${feedResponse.statusText}`);
    }

    const feedXml = await feedResponse.text();

    const rssItems = parseRSS(feedXml);
    console.log(`Parsed ${rssItems.length} items from RSS feed`);

    const processedArticles = rssItems.map(item => processArticle(item));

    const result = {
      success: true,
      feedName: feedName || feedUrl,
      feedUrl,
      articleCount: processedArticles.length,
      articles: processedArticles,
      processedAt: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Error processing RSS feed:', error);

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
