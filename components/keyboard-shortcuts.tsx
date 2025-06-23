'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Keyboard, 
  Command, 
  Plus, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Archive,
  Shuffle,
  X
} from 'lucide-react';

interface KeyboardShortcutsProps {
  onNewIdea: () => void;
  onToggleSearch: () => void;
  onToggleFilters: () => void;
  onToggleView: () => void;
  onToggleArchived: () => void;
  onOpenRoulette: () => void;
}

interface Shortcut {
  key: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
}

export function KeyboardShortcuts({
  onNewIdea,
  onToggleSearch,
  onToggleFilters,
  onToggleView,
  onToggleArchived,
  onOpenRoulette,
}: KeyboardShortcutsProps) {
  const [open, setOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    {
      key: 'Ctrl+N',
      description: 'Create new idea',
      icon: Plus,
      action: onNewIdea,
    },
    {
      key: 'Ctrl+K',
      description: 'Focus search',
      icon: Search,
      action: onToggleSearch,
    },
    {
      key: 'Ctrl+F',
      description: 'Toggle filters',
      icon: Filter,
      action: onToggleFilters,
    },
    {
      key: 'Ctrl+M',
      description: 'Toggle matrix/grid view',
      icon: Grid3X3,
      action: onToggleView,
    },
    {
      key: 'Ctrl+A',
      description: 'Toggle archived ideas',
      icon: Archive,
      action: onToggleArchived,
    },
    {
      key: 'Ctrl+R',
      description: 'Open idea roulette',
      icon: Shuffle,
      action: onOpenRoulette,
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      icon: Keyboard,
      action: () => setOpen(true),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const shortcut = shortcuts.find(s => {
        if (s.key === '?') {
          return event.key === '?' && !event.ctrlKey && !event.metaKey;
        }
        
        const keys = s.key.split('+');
        const hasCtrl = keys.includes('Ctrl');
        const key = keys[keys.length - 1].toLowerCase();
        
        return (
          event.key.toLowerCase() === key &&
          (hasCtrl ? (event.ctrlKey || event.metaKey) : true) &&
          (!hasCtrl || event.ctrlKey || event.metaKey)
        );
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  const formatKey = (key: string) => {
    return key
      .replace('Ctrl', '⌘')
      .replace('+', ' + ')
      .split(' + ')
      .map((k, i) => (
        <Badge key={i} variant="outline" className="text-xs px-2 py-1 font-mono">
          {k}
        </Badge>
      ));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate IdeaBox more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Navigation & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {shortcuts.map((shortcut, index) => {
                const Icon = shortcut.icon;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shortcut.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {formatKey(shortcut.key)}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground text-center">
            <Keyboard className="h-3 w-3 inline mr-1" />
            Press <Badge variant="outline" className="text-xs px-1">?</Badge> anytime to open this dialog
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}