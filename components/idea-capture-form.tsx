'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Plus, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface IdeaCaptureFormProps {
  onToggleExpanded: () => void;
}

export function IdeaCaptureForm({ onToggleExpanded }: IdeaCaptureFormProps) {
  return (
    <Card 
      className="mb-8 border-2 border-dashed border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-800/90" 
      onClick={onToggleExpanded}
    >
      <CardContent className="p-8">
        <div className="flex items-center gap-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <Image 
                src="/logo.svg" 
                alt="Ideatrium Logo" 
                width={24} 
                height={24}
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">Capture a new idea...</h3>
            <p className="text-sm opacity-75">Click here to transform your thoughts into actionable insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            <Plus className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}