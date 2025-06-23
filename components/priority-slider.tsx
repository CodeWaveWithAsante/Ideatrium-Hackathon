'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap } from 'lucide-react';

interface PrioritySliderProps {
  impact: number;
  effort: number;
  onImpactChange: (value: number) => void;
  onEffortChange: (value: number) => void;
  disabled?: boolean;
}

const getScaleLabel = (value: number) => {
  switch (value) {
    case 1: return 'Very Low';
    case 2: return 'Low';
    case 3: return 'Medium';
    case 4: return 'High';
    case 5: return 'Very High';
    default: return 'Medium';
  }
};

const getScaleColor = (value: number) => {
  switch (value) {
    case 1: return 'bg-gray-500';
    case 2: return 'bg-blue-500';
    case 3: return 'bg-yellow-500';
    case 4: return 'bg-orange-500';
    case 5: return 'bg-red-500';
    default: return 'bg-yellow-500';
  }
};

const getScaleDescription = (type: 'impact' | 'effort', value: number) => {
  if (type === 'impact') {
    switch (value) {
      case 1: return 'Minimal positive change expected';
      case 2: return 'Some positive change expected';
      case 3: return 'Moderate positive change expected';
      case 4: return 'Significant positive change expected';
      case 5: return 'Transformational change expected';
      default: return 'Moderate positive change expected';
    }
  } else {
    switch (value) {
      case 1: return 'Very quick and easy to implement';
      case 2: return 'Relatively easy to implement';
      case 3: return 'Moderate time and resources required';
      case 4: return 'Significant time and resources required';
      case 5: return 'Major investment of time and resources';
      default: return 'Moderate time and resources required';
    }
  }
};

export function PrioritySlider({ 
  impact, 
  effort, 
  onImpactChange, 
  onEffortChange,
  disabled = false
}: PrioritySliderProps) {
  return (
    <div className="space-y-8">
      {/* Impact Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-base font-medium">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Impact
          </Label>
          <Badge variant="secondary" className={`${getScaleColor(impact)} text-white font-medium`}>
            {getScaleLabel(impact)}
          </Badge>
        </div>
        <Slider
          value={[impact]}
          onValueChange={(values) => onImpactChange(values[0])}
          max={5}
          min={1}
          step={1}
          className="w-full"
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Very Low</span>
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
          <span>Very High</span>
        </div>
        <p className="text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <strong>Impact:</strong> {getScaleDescription('impact', impact)}
        </p>
      </div>

      {/* Effort Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Zap className="h-5 w-5 text-orange-600" />
            Effort
          </Label>
          <Badge variant="secondary" className={`${getScaleColor(effort)} text-white font-medium`}>
            {getScaleLabel(effort)}
          </Badge>
        </div>
        <Slider
          value={[effort]}
          onValueChange={(values) => onEffortChange(values[0])}
          max={5}
          min={1}
          step={1}
          className="w-full"
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Very Low</span>
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
          <span>Very High</span>
        </div>
        <p className="text-sm text-muted-foreground bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
          <strong>Effort:</strong> {getScaleDescription('effort', effort)}
        </p>
      </div>

      {/* Priority Matrix Preview */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border">
        <h5 className="text-sm font-medium mb-2">Priority Quadrant</h5>
        <div className="text-sm">
          {impact >= 4 && effort >= 4 && (
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span><strong>Plan:</strong> High impact, high effort - requires planning</span>
            </div>
          )}
          {impact >= 4 && effort < 4 && (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span><strong>Do First:</strong> High impact, low effort - quick win!</span>
            </div>
          )}
          {impact < 4 && effort >= 4 && (
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span><strong>Reconsider:</strong> Low impact, high effort - may not be worth it</span>
            </div>
          )}
          {impact < 4 && effort < 4 && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span><strong>Optional:</strong> Low impact, low effort - nice to have</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}