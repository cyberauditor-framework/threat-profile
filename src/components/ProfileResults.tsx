import { Download, RefreshCw, AlertTriangle, TrendingUp, Shield, Target } from 'lucide-react';
import { ThreatProfile } from '../types/threat-intelligence';

interface ProfileResultsProps {
  profile: ThreatProfile;
  onReset: () => void;
}

export default function ProfileResults({ profile, onReset }: ProfileResultsProps) {
  const handleDownload = () => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.profileName.replace(/\s+/g, '_')}_threat_profile.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{profile.profileName}</h2>
            <p className="text-slate-400">
              Generated on {new Date(profile.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Articles"
            value={profile.statistics.totalArticles}
            color="cyan"
          />
          <StatCard
            label="Relevant Articles"
            value={profile.statistics.relevantArticles}
            color="blue"
          />
          <StatCard
            label="Critical Threats"
            value={profile.statistics.criticalThreats}
            color="red"
          />
          <StatCard
            label="High Threats"
            value={profile.statistics.highThreats}
            color="orange"
          />
        </div>

        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Executive Summary
          </h3>
          <p className="text-slate-300 leading-relaxed">{profile.threatSummary}</p>
        </div>

        {profile.industries.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Industries</h4>
            <div className="flex flex-wrap gap-2">
              {profile.industries.map((ind) => (
                <span key={ind} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.regions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Regions</h4>
            <div className="flex flex-wrap gap-2">
              {profile.regions.map((reg) => (
                <span key={reg} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  {reg}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.technologies.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {profile.technologies.map((tech) => (
                <span key={tech} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          Top Threats
        </h3>
        <div className="space-y-4">
          {profile.topThreats.map((threat, idx) => (
            <ThreatCard key={idx} threat={threat} rank={idx + 1} />
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyan-400" />
          Recommendations
        </h3>
        <div className="space-y-4">
          {profile.recommendations.map((rec, idx) => (
            <RecommendationCard key={idx} recommendation={rec} />
          ))}
        </div>
      </div>

      {profile.statistics.topThreatTypes.length > 0 && (
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Threat Type Distribution
          </h3>
          <div className="space-y-3">
            {profile.statistics.topThreatTypes.map((tt, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-32 text-slate-300 text-sm">{tt.type}</div>
                <div className="flex-1 bg-slate-900 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-500"
                    style={{
                      width: `${(tt.count / profile.statistics.topThreatTypes[0].count) * 100}%`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-white text-sm font-medium">{tt.count} articles</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
    orange: 'text-orange-400'
  };

  return (
    <div className="bg-slate-900 rounded-lg p-4 text-center">
      <div className={`text-3xl font-bold ${colors[color as keyof typeof colors]}`}>{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function ThreatCard({ threat, rank }: { threat: ThreatProfile['topThreats'][0]; rank: number }) {
  const severityColors = {
    critical: 'bg-red-500/20 text-red-300 border-red-500',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
    low: 'bg-blue-500/20 text-blue-300 border-blue-500'
  };

  const trendColors = {
    increasing: 'text-red-400',
    stable: 'text-yellow-400',
    emerging: 'text-cyan-400'
  };

  return (
    <div className="bg-slate-900 rounded-lg p-5 border-l-4 border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            {rank}
          </div>
          <h4 className="text-lg font-semibold text-white capitalize">{threat.name}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              severityColors[threat.severity as keyof typeof severityColors]
            }`}
          >
            {threat.severity.toUpperCase()}
          </span>
          <span className={`text-xs font-medium ${trendColors[threat.trend as keyof typeof trendColors]}`}>
            {threat.trend}
          </span>
        </div>
      </div>
      <p className="text-slate-300 text-sm mb-3">{threat.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{threat.articleCount} related articles</span>
        {threat.affectedSectors.length > 0 && (
          <span>Sectors: {threat.affectedSectors.slice(0, 3).join(', ')}</span>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: ThreatProfile['recommendations'][0] }) {
  const priorityColors = {
    critical: 'bg-red-500/20 text-red-300 border-red-500',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
    low: 'bg-blue-500/20 text-blue-300 border-blue-500'
  };

  return (
    <div className="bg-slate-900 rounded-lg p-5 border-l-4 border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-semibold text-white">{recommendation.title}</h4>
          <p className="text-sm text-slate-400 mt-1">{recommendation.category}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            priorityColors[recommendation.priority as keyof typeof priorityColors]
          }`}
        >
          {recommendation.priority.toUpperCase()}
        </span>
      </div>
      <p className="text-slate-300 text-sm mb-4">{recommendation.description}</p>
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-slate-400 uppercase">Recommended Actions</h5>
        <ul className="space-y-1">
          {recommendation.actions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-cyan-400 mt-1">•</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
