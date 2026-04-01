import { useState } from 'react';
import { Shield, AlertTriangle, Activity } from 'lucide-react';
import { THREAT_FEEDS, INDUSTRIES, REGIONS, TECHNOLOGIES } from '../data/threat-feeds';
import { ThreatProfile, Article } from '../types/threat-intelligence';
import ProfileConfiguration from './ProfileConfiguration';
import FeedProcessor from './FeedProcessor';
import ProfileResults from './ProfileResults';

export default function ThreatIntelligence() {
  const [currentStep, setCurrentStep] = useState<'config' | 'processing' | 'results'>('config');
  const [profileName, setProfileName] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [collectedArticles, setCollectedArticles] = useState<Article[]>([]);
  const [generatedProfile, setGeneratedProfile] = useState<ThreatProfile | null>(null);

  const handleConfigComplete = (
    name: string,
    industries: string[],
    regions: string[],
    technologies: string[]
  ) => {
    setProfileName(name);
    setSelectedIndustries(industries);
    setSelectedRegions(regions);
    setSelectedTechnologies(technologies);
    setCurrentStep('processing');
  };

  const handleProcessingComplete = (articles: Article[]) => {
    setCollectedArticles(articles);
  };

  const handleProfileGenerated = (profile: ThreatProfile) => {
    setGeneratedProfile(profile);
    setCurrentStep('results');
  };

  const handleReset = () => {
    setCurrentStep('config');
    setProfileName('');
    setSelectedIndustries([]);
    setSelectedRegions([]);
    setSelectedTechnologies([]);
    setCollectedArticles([]);
    setGeneratedProfile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Threat Intelligence Platform</h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Generate comprehensive threat profiles based on industry, region, and technology stack
          </p>
        </header>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <StepIndicator
              step={1}
              label="Configure"
              icon={Shield}
              active={currentStep === 'config'}
              completed={currentStep !== 'config'}
            />
            <div className="w-24 h-1 bg-slate-700 rounded" />
            <StepIndicator
              step={2}
              label="Process Feeds"
              icon={Activity}
              active={currentStep === 'processing'}
              completed={currentStep === 'results'}
            />
            <div className="w-24 h-1 bg-slate-700 rounded" />
            <StepIndicator
              step={3}
              label="Results"
              icon={AlertTriangle}
              active={currentStep === 'results'}
              completed={false}
            />
          </div>
        </div>

        {currentStep === 'config' && (
          <ProfileConfiguration
            onComplete={handleConfigComplete}
            industries={INDUSTRIES}
            regions={REGIONS}
            technologies={TECHNOLOGIES}
          />
        )}

        {currentStep === 'processing' && (
          <FeedProcessor
            profileName={profileName}
            industries={selectedIndustries}
            regions={selectedRegions}
            technologies={selectedTechnologies}
            feeds={THREAT_FEEDS}
            onComplete={handleProcessingComplete}
            onProfileGenerated={handleProfileGenerated}
          />
        )}

        {currentStep === 'results' && generatedProfile && (
          <ProfileResults
            profile={generatedProfile}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  step: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  completed: boolean;
}

function StepIndicator({ step, label, icon: Icon, active, completed }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          active
            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
            : completed
            ? 'bg-green-500 text-white'
            : 'bg-slate-700 text-slate-400'
        }`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <span
        className={`text-sm font-medium ${
          active ? 'text-cyan-400' : completed ? 'text-green-400' : 'text-slate-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
