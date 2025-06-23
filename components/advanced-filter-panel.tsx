'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Search, 
  Filter, 
  Tag as TagIcon, 
  Grid3X3,
  SortAsc,
  SortDesc,
  Zap,
  Target,
  Clock,
  Calendar
} from 'lucide-react';
import { Tag } from '@/lib/types';
import { storage } from '@/lib/storage';

interface AdvancedFilterPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedQuadrants: string[];
  onQuadrantsChange: (quadrants: string[]) => void;
  sortBy: 'date' | 'title' | 'impact' | 'effort';
  onSortByChange: (sortBy: 'date' | 'title' | 'impact' | 'effort') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onApplyPreset: (preset: string) => void;
  onClearAll: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const QUADRANT_OPTIONS = [
  { id: 'q1', name: 'Plan', color: '#F59E0B', description: 'High Impact, High Effort' },
  { id: 'q2', name: 'Do First', color: '#10B981', description: 'High Impact, Low Effort' },
  { id: 'q3', name: 'Reconsider', color: '#EF4444', description: 'Low Impact, High Effort' },
  { id: 'q4', name: 'Optional', color: '#6B7280', description: 'Low Impact, Low Effort' },
];

const FILTER_PRESETS = [
  { id: 'high-impact', name: 'High Impact', icon: Target, description: 'Ideas with high impact potential' },
  { id: 'quick-wins', name: 'Quick Wins', icon: Zap, description: 'Easy to implement, high value' },
  { id: 'recent', name: 'Recent', icon: Clock, description: 'Recently added ideas' },
  { id: 'needs-planning', name: 'Needs Planning', icon: Calendar, description: 'Complex ideas requiring planning' },
];

export function AdvancedFilterPanel({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  selectedQuadrants,
  onQuadrantsChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onApplyPreset,
  onClearAll,
  isExpanded,
  onToggleExpanded,
}: AdvancedFilterPanelProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    const tags = storage.getTags();
    setAvailableTags(tags);
  }, []);

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleQuadrantToggle = (quadrantId: string) => {
    if (selectedQuadrants.includes(quadrantId)) {
      onQuadrantsChange(selectedQuadrants.filter(id => id !== quadrantId));
    } else {
      onQuadrantsChange([...selectedQuadrants, quadrantId]);
    }
  };

  const hasActiveFilters = 
    searchQuery.trim().length > 0 || 
    selectedTags.length > 0 || 
    selectedQuadrants.length > 0 ||
    sortBy !== 'date' ||
    sortOrder !== 'desc';

  const presetTags = availableTags.filter(tag => tag.category === 'preset');
  const customTags = availableTags.filter(tag => tag.category === 'custom');

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Ideas
          </Label>
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full"
          />
        </div>

        {isExpanded && (
          <>
            {/* Filter Presets */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Filters</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {FILTER_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => onApplyPreset(preset.id)}
                      className="gap-2 h-auto p-3 flex-col items-start"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{preset.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground text-left">
                        {preset.description}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Quadrant Filters */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Filter by Priority Quadrant
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {QUADRANT_OPTIONS.map((quadrant) => (
                  <Button
                    key={quadrant.id}
                    variant={selectedQuadrants.includes(quadrant.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuadrantToggle(quadrant.id)}
                    className="gap-2 justify-start h-auto p-3"
                    style={selectedQuadrants.includes(quadrant.id) ? {
                      backgroundColor: quadrant.color,
                      borderColor: quadrant.color,
                      color: 'white'
                    } : {
                      borderColor: `${quadrant.color}40`,
                      color: quadrant.color
                    }}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium">{quadrant.name}</span>
                      <span className="text-xs opacity-80">
                        {quadrant.description}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tag Filters */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Filter by Tags
              </Label>
              
              {/* Preset Tags */}
              {presetTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Preset Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {presetTags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTagToggle(tag.id)}
                        className="gap-2"
                        style={selectedTags.includes(tag.id) ? {
                          backgroundColor: tag.color,
                          borderColor: tag.color,
                          color: 'white'
                        } : {
                          borderColor: `${tag.color}40`,
                          color: tag.color
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: selectedTags.includes(tag.id) ? 'white' : tag.color }}
                        />
                        {tag.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Tags */}
              {customTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Custom Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTagToggle(tag.id)}
                        className="gap-2"
                        style={selectedTags.includes(tag.id) ? {
                          backgroundColor: tag.color,
                          borderColor: tag.color,
                          color: 'white'
                        } : {
                          borderColor: `${tag.color}40`,
                          color: tag.color
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: selectedTags.includes(tag.id) ? 'white' : tag.color }}
                        />
                        {tag.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {availableTags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tags available. Create some tags when adding ideas!
                </p>
              )}
            </div>

            <Separator />

            {/* Sort Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Sort Options</Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Sort By</Label>
                  <Select value={sortBy} onValueChange={onSortByChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date Created</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="impact">Impact Score</SelectItem>
                      <SelectItem value="effort">Effort Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Order</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="gap-2 w-full mt-1"
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <SortAsc className="h-4 w-4" />
                        Ascending
                      </>
                    ) : (
                      <>
                        <SortDesc className="h-4 w-4" />
                        Descending
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {!isExpanded && hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery.trim() && (
              <Badge variant="secondary" className="gap-1">
                <Search className="h-3 w-3" />
                "{searchQuery.trim()}"
              </Badge>
            )}
            {selectedTags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              return tag ? (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="gap-1"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ) : null;
            })}
            {selectedQuadrants.map(quadrantId => {
              const quadrant = QUADRANT_OPTIONS.find(q => q.id === quadrantId);
              return quadrant ? (
                <Badge
                  key={quadrant.id}
                  variant="secondary"
                  className="gap-1"
                  style={{ backgroundColor: `${quadrant.color}20`, color: quadrant.color }}
                >
                  {quadrant.name}
                </Badge>
              ) : null;
            })}
            {(sortBy !== 'date' || sortOrder !== 'desc') && (
              <Badge variant="secondary" className="gap-1">
                <SortDesc className="h-3 w-3" />
                {sortBy} ({sortOrder})
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}