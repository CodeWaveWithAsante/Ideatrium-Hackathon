'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Search, Filter, Tag as TagIcon } from 'lucide-react';
import { Tag } from '@/lib/types';
import { storage } from '@/lib/storage';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TagFilter({ 
  selectedTags, 
  onTagsChange, 
  searchQuery, 
  onSearchChange 
}: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleClearFilters = () => {
    onTagsChange([]);
    onSearchChange('');
  };

  const hasActiveFilters = selectedTags.length > 0 || searchQuery.trim().length > 0;
  const presetTags = availableTags.filter(tag => tag.category === 'preset');
  const customTags = availableTags.filter(tag => tag.category === 'custom');

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {selectedTags.length + (searchQuery.trim() ? 1 : 0)}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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

        {/* Tag Filters */}
        {isExpanded && (
          <div className="space-y-4">
            <div className="space-y-2">
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
          </div>
        )}

        {/* Quick Summary */}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}