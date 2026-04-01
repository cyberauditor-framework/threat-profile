# Threat Intelligence Platform - Nanobot Skill

## Overview

This skill provides a comprehensive threat intelligence platform that generates customized threat profiles based on industry, region, and technology stack. It processes RSS feeds from 49+ leading cybersecurity sources to provide real-time threat analysis and actionable security recommendations.

## Features

### 1. Multi-Source RSS Feed Processing
- Processes feeds from 49 cybersecurity threat intelligence sources
- Automatic article parsing and metadata extraction
- Intelligent keyword and threat type detection
- Industry, region, and technology mention identification

### 2. Customizable Threat Profiles
- Filter threats by:
  - **Industries**: Financial Services, Healthcare, Energy, Government, etc.
  - **Regions**: North America, Europe, Asia Pacific, Middle East, etc.
  - **Technologies**: Windows, Linux, AWS, Azure, Office 365, etc.

### 3. Intelligent Analysis
- Automated threat severity classification (Critical, High, Medium, Low)
- Trend analysis (Increasing, Stable, Emerging)
- Top threat identification and ranking
- Statistical analysis of threat landscape

### 4. Actionable Recommendations
- Priority-based security recommendations
- Categorized by: Incident Response, Data Protection, User Awareness, etc.
- Specific action items for each recommendation
- Context-aware guidance based on your threat profile

## Architecture

### Database Schema

The system uses Supabase with the following tables:

- **threat_feeds**: RSS feed sources and metadata
- **threat_articles**: Parsed articles with extracted intelligence
- **industries**: Industry catalog
- **regions**: Geographic region catalog
- **technologies**: Technology and platform catalog
- **threat_profiles**: Generated threat analysis profiles

### Edge Functions

#### 1. rss-feed-processor
**Purpose**: Fetches and parses RSS feeds from threat intelligence sources

**Endpoint**: `/api/rss-feed-processor`

**Request**:
```json
{
  "feedUrl": "https://example.com/rss",
  "feedName": "Example Threat Feed"
}
```

**Response**:
```json
{
  "success": true,
  "feedName": "Example Threat Feed",
  "articleCount": 25,
  "articles": [
    {
      "title": "New Ransomware Campaign",
      "url": "https://...",
      "description": "...",
      "publishedAt": "2026-04-01T10:00:00Z",
      "keywords": ["ransomware", "malware"],
      "threatTypes": ["ransomware"],
      "industriesMentioned": ["healthcare"],
      "regionsMentioned": ["north america"],
      "technologiesMentioned": ["windows"],
      "severity": "critical"
    }
  ]
}
```

#### 2. threat-profile-generator
**Purpose**: Analyzes articles and generates comprehensive threat profiles

**Endpoint**: `/api/threat-profile-generator`

**Request**:
```json
{
  "profileName": "Healthcare Q1 2026",
  "industries": ["Healthcare"],
  "regions": ["United States"],
  "technologies": ["Windows", "Office 365"],
  "articles": [...]
}
```

**Response**:
```json
{
  "success": true,
  "profile": {
    "profileName": "Healthcare Q1 2026",
    "threatSummary": "Analysis of 150 threat intelligence articles...",
    "topThreats": [...],
    "recommendations": [...],
    "statistics": {...},
    "relevantArticles": [...]
  }
}
```

## Threat Intelligence Sources

The platform aggregates intelligence from 49 premium sources:

### APT & Advanced Threats
- Google Threat Analysis Group (TAG)
- Mandiant Resources
- APT reports – Securelist
- Blog - Volexity
- CrowdStrike Blog

### Malware Analysis
- SentinelLabs
- Bitdefender Labs
- McAfee Labs
- Research Archives - Intezer
- ASEC BLOG

### Vulnerability Intelligence
- CISA Advisories
- Rapid7 Cybersecurity Blog
- Qualys Threat Research
- Microsoft Security Blog

### Phishing & Social Engineering
- Cofense Threat Intelligence
- Spam and phishing reports – Securelist

### General Threat Research
- Unit 42 (Palo Alto Networks)
- Cisco Talos Blog
- Check Point Research
- Fortinet Threat Research
- Trend Micro Research
- Elastic Security Labs
- Datadog Security Labs
- SOC Prime Blog
- WeLiveSecurity (ESET)
- And many more...

## Usage Guide

### 1. Configure Your Profile

1. Enter a descriptive profile name (e.g., "Financial Sector Q1 2026")
2. Select relevant industries
3. Select geographic regions of interest
4. Select technologies used in your environment

### 2. Processing

The system will:
1. Fetch RSS feeds from enabled sources
2. Parse and analyze articles
3. Extract threat intelligence metadata
4. Filter relevant content based on your criteria

### 3. Review Results

Your threat profile includes:

- **Executive Summary**: High-level overview of the threat landscape
- **Statistics Dashboard**:
  - Total articles analyzed
  - Relevant articles
  - Threat severity breakdown
- **Top Threats**: Ranked list of the most significant threats with:
  - Severity rating
  - Trend analysis
  - Affected sectors
  - Article count
- **Recommendations**: Prioritized security actions with:
  - Priority level
  - Category
  - Specific action items
- **Threat Type Distribution**: Visual representation of threat categories

### 4. Export

Download your complete threat profile as JSON for:
- Integration with SIEM systems
- Sharing with security teams
- Historical analysis
- Compliance documentation

## Integration with Nanobot

This skill is designed to be used as a tool within Nanobot for automated threat intelligence gathering and analysis.

### Example Nanobot Usage

```
Generate a threat profile for:
- Industries: Financial Services, Healthcare
- Regions: United States, Europe
- Technologies: Windows, Office 365, AWS
```

The skill will automatically:
1. Process relevant threat feeds
2. Filter for financial and healthcare threats
3. Focus on US and European threats
4. Highlight Windows, Office 365, and AWS vulnerabilities
5. Generate actionable recommendations

## Security Considerations

### Row Level Security (RLS)

All database tables implement RLS:
- Users can only view their own threat profiles
- Reference data (industries, regions, technologies) is readable by authenticated users
- Feed processing requires authentication

### Data Privacy

- No sensitive organizational data is stored
- Threat intelligence is aggregated from public sources
- User profiles are isolated and protected

## Performance Optimization

- **Indexes**: GIN indexes on array fields for fast filtering
- **Caching**: Feed data is processed and cached
- **Parallel Processing**: Multiple feeds processed concurrently
- **Batch Operations**: Efficient bulk article processing

## Customization

### Adding New Feeds

Update `src/data/threat-feeds.ts`:

```typescript
{
  name: 'New Threat Feed',
  url: 'https://example.com/feed.xml',
  enabled: true,
  category: 'research'
}
```

### Adding Industries/Regions/Technologies

Update the respective arrays in `src/data/threat-feeds.ts`:

```typescript
export const INDUSTRIES = [
  { value: 'New Industry', label: 'New Industry' },
  // ...
];
```

## Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL (Supabase)
- **RSS Parsing**: Custom XML parser
- **API**: RESTful endpoints with CORS support

## Deployment

### Edge Functions

Deploy both functions to Supabase:

```bash
# Deploy RSS feed processor
supabase functions deploy rss-feed-processor

# Deploy threat profile generator
supabase functions deploy threat-profile-generator
```

### Database Migration

Apply the schema migration:

```sql
-- Use the SQL from the migration file to create all tables
-- File: Database schema is defined in edge function documentation
```

## Best Practices

1. **Regular Updates**: Run threat profile generation weekly or monthly
2. **Multiple Profiles**: Create separate profiles for different departments or systems
3. **Trend Tracking**: Compare profiles over time to identify emerging threats
4. **Action on Recommendations**: Implement high and critical priority recommendations first
5. **Share Intelligence**: Export and share profiles with relevant teams

## Troubleshooting

### Feed Processing Errors

- Some feeds may be temporarily unavailable
- Rate limiting may occur with rapid successive requests
- Network timeouts are handled gracefully

### Performance

- Processing 10 feeds takes approximately 30-60 seconds
- Profile generation is near-instantaneous after feed processing
- Large result sets are automatically limited to top results

## Future Enhancements

Potential improvements:
- Machine learning for threat prediction
- Integration with CVE databases
- STIX/TAXII support
- Automated email reporting
- API for external integrations
- Historical trend analysis
- Threat actor attribution

## License

This skill is provided as-is for threat intelligence and security awareness purposes.

## Support

For issues or questions about this skill, consult the Nanobot documentation or security team.
