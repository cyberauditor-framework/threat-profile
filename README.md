# Threat Intelligence Platform

A comprehensive, production-ready threat intelligence platform designed for Nanobot that generates customized threat profiles by aggregating and analyzing data from 49+ premium cybersecurity threat intelligence feeds.

## Overview

This platform enables security teams to generate rigorous, data-driven threat profiles tailored to specific industries, geographic regions, and technology stacks. It processes real-time threat intelligence from leading sources including Unit 42, CrowdStrike, Mandiant, CISA, Microsoft Security, and many more.

## Key Features

### Multi-Source Intelligence Aggregation
- **49+ Premium Threat Feeds**: Aggregates intelligence from APT researchers, malware analysts, vulnerability researchers, and security vendors
- **Real-Time Processing**: Fetches and parses RSS feeds on-demand
- **Intelligent Categorization**: Automatically categorizes feeds by type (APT, malware, vulnerabilities, phishing, etc.)

### Customizable Threat Profiles
- **Industry Targeting**: Filter threats by 12+ industry sectors (Financial, Healthcare, Energy, Government, etc.)
- **Geographic Focus**: 17+ regions from North America to APAC, Middle East, and beyond
- **Technology Stack**: 25+ technologies including cloud platforms, operating systems, and enterprise software

### Advanced Analysis
- **Automated Threat Classification**: Critical, High, Medium, and Low severity ratings
- **Trend Analysis**: Identifies increasing, stable, and emerging threats
- **Statistical Insights**: Comprehensive metrics on threat landscape
- **Relevance Filtering**: Smart filtering based on your organization's profile

### Actionable Intelligence
- **Prioritized Recommendations**: Security actions ranked by priority
- **Category-Based Guidance**: Organized by Incident Response, Data Protection, Threat Detection, etc.
- **Specific Action Items**: Detailed steps for each recommendation
- **Export Capabilities**: JSON export for SIEM integration and reporting

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: PostgreSQL with Row Level Security
- **RSS Processing**: Custom XML parser with intelligent extraction

### System Components

1. **RSS Feed Processor** (`rss-feed-processor`)
   - Fetches RSS/Atom feeds from threat intelligence sources
   - Parses XML content and extracts metadata
   - Identifies threat types, industries, regions, and technologies
   - Classifies severity based on content analysis

2. **Threat Profile Generator** (`threat-profile-generator`)
   - Filters articles based on user criteria
   - Generates top threat rankings
   - Creates prioritized recommendations
   - Compiles statistical analysis

3. **Web Interface**
   - Step-by-step profile configuration
   - Real-time feed processing with progress tracking
   - Comprehensive results dashboard
   - Export and sharing capabilities

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configuration

Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy Edge Functions

Deploy the two Edge Functions to your Supabase project:
- `rss-feed-processor`
- `threat-profile-generator`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### 4. Setup Database

Execute the database migration to create all required tables, indexes, and security policies.

### 5. Run Locally

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

## Usage

### Creating a Threat Profile

1. **Configure Profile**
   - Enter a descriptive name
   - Select relevant industries
   - Choose geographic regions
   - Pick technologies in use

2. **Processing**
   - System fetches enabled RSS feeds
   - Parses and analyzes articles
   - Extracts threat intelligence

3. **Review Results**
   - Executive summary
   - Top threats ranked by severity
   - Prioritized security recommendations
   - Statistical analysis
   - Threat type distribution

4. **Export**
   - Download as JSON
   - Share with security team
   - Integrate with SIEM

## Threat Intelligence Sources

The platform aggregates from 49 sources including:

- **APT Research**: Google TAG, Mandiant, CrowdStrike, Volexity
- **Malware Analysis**: SentinelLabs, Bitdefender, McAfee, Intezer
- **Vulnerability Intelligence**: CISA, Rapid7, Qualys, Microsoft
- **Phishing Intelligence**: Cofense, Securelist
- **Vendor Research**: Cisco Talos, Check Point, Fortinet, Palo Alto
- **Industry Leaders**: Unit 42, Trend Micro, Elastic, Datadog
- **And many more**: ESET, SOC Prime, SEKOIA, Chainalysis, etc.

See [THREAT_INTELLIGENCE_SKILL.md](THREAT_INTELLIGENCE_SKILL.md) for complete list.

## Documentation

- **[THREAT_INTELLIGENCE_SKILL.md](THREAT_INTELLIGENCE_SKILL.md)**: Comprehensive skill documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Deployment and configuration guide

## Security Features

- **Row Level Security (RLS)**: All database tables protected
- **User Isolation**: Each user sees only their own profiles
- **Input Validation**: All inputs sanitized and validated
- **CORS Protection**: Properly configured CORS headers
- **No Secret Exposure**: API keys never sent to client

## Performance

- **Concurrent Processing**: Multiple feeds processed in parallel
- **Optimized Queries**: GIN indexes on array fields
- **Smart Caching**: Feed results cached to reduce external requests
- **Efficient Filtering**: Database-level filtering for speed

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ThreatIntelligence.tsx    # Main orchestrator
│   │   ├── ProfileConfiguration.tsx   # Step 1: Configuration
│   │   ├── FeedProcessor.tsx          # Step 2: Processing
│   │   └── ProfileResults.tsx         # Step 3: Results
│   ├── data/
│   │   └── threat-feeds.ts            # Feed definitions & catalogs
│   ├── types/
│   │   └── threat-intelligence.ts     # TypeScript definitions
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── functions/
│       ├── rss-feed-processor/
│       │   └── index.ts
│       └── threat-profile-generator/
│           └── index.ts
├── THREAT_INTELLIGENCE_SKILL.md
├── DEPLOYMENT.md
└── README.md
```

## Customization

### Adding New Threat Feeds

Edit `src/data/threat-feeds.ts`:

```typescript
{
  name: 'New Security Blog',
  url: 'https://example.com/feed.xml',
  enabled: true,
  category: 'research'
}
```

### Adding Industries/Regions/Technologies

Update the respective catalogs in `src/data/threat-feeds.ts`.

### Customizing Analysis Logic

Modify the extraction and classification logic in:
- `supabase/functions/rss-feed-processor/index.ts`
- `supabase/functions/threat-profile-generator/index.ts`

## Best Practices

1. **Regular Profiling**: Generate profiles weekly or monthly
2. **Multiple Profiles**: Create separate profiles for different systems/departments
3. **Trend Tracking**: Compare profiles over time
4. **Act on Recommendations**: Prioritize critical and high severity items
5. **Share Intelligence**: Export and distribute to relevant teams

## Limitations & Considerations

- RSS feed availability varies by source
- Some feeds may have rate limiting
- Processing time depends on number of feeds
- Free Supabase tier has function invocation limits

## Future Enhancements

Potential improvements:
- Machine learning for threat prediction
- STIX/TAXII integration
- CVE database correlation
- Historical trend analysis
- Automated email reports
- Threat actor attribution
- API for external integrations

## Contributing

When adding new features:
1. Follow existing code patterns
2. Add TypeScript types
3. Update documentation
4. Test thoroughly
5. Ensure RLS policies are correct

## License

This project is provided as-is for threat intelligence and security awareness purposes.

## Support

For questions or issues:
1. Review documentation thoroughly
2. Check Supabase function logs
3. Verify RSS feed availability
4. Ensure proper configuration

---

**Built for rigorous threat intelligence analysis. Designed for security professionals.**
