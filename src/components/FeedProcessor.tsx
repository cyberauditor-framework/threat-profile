import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Activity } from 'lucide-react';
import { Article, ThreatProfile } from '../types/threat-intelligence';

interface Feed {
  name: string;
  url: string;
  enabled: boolean;
  category: string;
}

interface FeedProcessorProps {
  profileName: string;
  industries: string[];
  regions: string[];
  technologies: string[];
  feeds: Feed[];
  onComplete: (articles: Article[]) => void;
  onProfileGenerated: (profile: ThreatProfile) => void;
}

interface FeedStatus {
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  articleCount?: number;
  error?: string;
}

export default function FeedProcessor({
  profileName,
  industries,
  regions,
  technologies,
  feeds,
  onComplete,
  onProfileGenerated
}: FeedProcessorProps) {
  const [feedStatuses, setFeedStatuses] = useState<FeedStatus[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'fetching' | 'analyzing' | 'complete'>('fetching');

  useEffect(() => {
    processFeeds();
  }, []);

  const processFeeds = async () => {
    const enabledFeeds = feeds.filter(f => f.enabled).slice(0, 10);

    const initialStatuses: FeedStatus[] = enabledFeeds.map(feed => ({
      name: feed.name,
      status: 'pending'
    }));
    setFeedStatuses(initialStatuses);

    const articles: Article[] = [];

    for (let i = 0; i < enabledFeeds.length; i++) {
      const feed = enabledFeeds[i];

      setFeedStatuses(prev =>
        prev.map((fs, idx) =>
          idx === i ? { ...fs, status: 'processing' } : fs
        )
      );

      try {
        const response = await fetch('/api/rss-feed-processor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            feedUrl: feed.url,
            feedName: feed.name
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.articles) {
          articles.push(...data.articles);

          setFeedStatuses(prev =>
            prev.map((fs, idx) =>
              idx === i
                ? { ...fs, status: 'success', articleCount: data.articles.length }
                : fs
            )
          );
        } else {
          throw new Error(data.error || 'Failed to process feed');
        }
      } catch (error) {
        console.error(`Error processing feed ${feed.name}:`, error);

        setFeedStatuses(prev =>
          prev.map((fs, idx) =>
            idx === i
              ? {
                  ...fs,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              : fs
          )
        );
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setAllArticles(articles);
    onComplete(articles);

    setCurrentPhase('analyzing');
    await generateProfile(articles);
  };

  const generateProfile = async (articles: Article[]) => {
    try {
      const response = await fetch('/api/threat-profile-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileName,
          industries,
          regions,
          technologies,
          articles
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.profile) {
        setCurrentPhase('complete');
        setIsProcessing(false);
        onProfileGenerated(data.profile);
      } else {
        throw new Error(data.error || 'Failed to generate profile');
      }
    } catch (error) {
      console.error('Error generating profile:', error);
      setCurrentPhase('complete');
      setIsProcessing(false);
    }
  };

  const successCount = feedStatuses.filter(fs => fs.status === 'success').length;
  const errorCount = feedStatuses.filter(fs => fs.status === 'error').length;
  const totalArticles = allArticles.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Processing Threat Intelligence Feeds</h2>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-slate-300 mb-2">
                <span>
                  {currentPhase === 'fetching' && 'Fetching RSS feeds...'}
                  {currentPhase === 'analyzing' && 'Analyzing threat data...'}
                  {currentPhase === 'complete' && 'Analysis complete'}
                </span>
                <span>
                  {successCount + errorCount} / {feedStatuses.length} feeds
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((successCount + errorCount) / feedStatuses.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">{successCount}</div>
              <div className="text-sm text-slate-400">Successful</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-400">{errorCount}</div>
              <div className="text-sm text-slate-400">Failed</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-3xl font-bold text-cyan-400">{totalArticles}</div>
              <div className="text-sm text-slate-400">Articles</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {feedStatuses.map((feed, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700"
            >
              <div className="flex items-center gap-3 flex-1">
                {feed.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full bg-slate-700" />
                )}
                {feed.status === 'processing' && (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                )}
                {feed.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {feed.status === 'error' && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white text-sm">{feed.name}</span>
              </div>

              <div className="text-sm text-slate-400">
                {feed.status === 'success' && `${feed.articleCount} articles`}
                {feed.status === 'error' && feed.error}
              </div>
            </div>
          ))}
        </div>

        {currentPhase === 'analyzing' && (
          <div className="mt-8 text-center">
            <Activity className="w-12 h-12 text-cyan-400 animate-pulse mx-auto mb-4" />
            <p className="text-slate-300 text-lg">Analyzing threat patterns and generating profile...</p>
          </div>
        )}
      </div>
    </div>
  );
}
