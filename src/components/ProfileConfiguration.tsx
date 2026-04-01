import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface ProfileConfigurationProps {
  onComplete: (name: string, industries: string[], regions: string[], technologies: string[]) => void;
  industries: Option[];
  regions: Option[];
  technologies: Option[];
}

export default function ProfileConfiguration({
  onComplete,
  industries,
  regions,
  technologies
}: ProfileConfigurationProps) {
  const [profileName, setProfileName] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileName.trim()) {
      onComplete(profileName, selectedIndustries, selectedRegions, selectedTechnologies);
    }
  };

  const canSubmit = profileName.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Configure Threat Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="profileName" className="block text-sm font-medium text-slate-300 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              id="profileName"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="e.g., Financial Sector Q1 2026"
              required
            />
          </div>

          <MultiSelect
            label="Industries"
            options={industries}
            selected={selectedIndustries}
            onChange={setSelectedIndustries}
            placeholder="Select industries to focus on"
          />

          <MultiSelect
            label="Regions"
            options={regions}
            selected={selectedRegions}
            onChange={setSelectedRegions}
            placeholder="Select geographic regions"
          />

          <MultiSelect
            label="Technologies"
            options={technologies}
            selected={selectedTechnologies}
            onChange={setSelectedTechnologies}
            placeholder="Select technologies in use"
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Start Threat Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

function MultiSelect({ label, options, selected, onChange, placeholder }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent flex items-center justify-between"
        >
          <span className={selected.length === 0 ? 'text-slate-500' : 'text-white'}>
            {selected.length === 0
              ? placeholder
              : `${selected.length} selected`}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center justify-between transition-colors"
              >
                <span className="text-white">{option.label}</span>
                {selected.includes(option.value) && (
                  <Check className="w-5 h-5 text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((value) => (
            <span
              key={value}
              className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm flex items-center gap-2"
            >
              {value}
              <button
                type="button"
                onClick={() => toggleOption(value)}
                className="hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
