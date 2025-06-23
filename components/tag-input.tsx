'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Tag } from '@/lib/types';
import { storage } from '@/lib/storage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  tagSchema,
  type TagFormData,
} from '@/lib/validations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TAG_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export function TagInput({ 
  selectedTags, 
  onTagsChange, 
  placeholder = "Add tags...",
  disabled = false
}: TagInputProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      color: TAG_COLORS[0],
    },
  });

  useEffect(() => {
    const tags = storage.getTags();
    setAvailableTags(tags);
  }, []);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags.filter(tag => 
        tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(tag.id)
      );
      setFilteredTags(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, availableTags, selectedTags]);

  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.includes(tag.id)) {
      onTagsChange([...selectedTags, tag.id]);
    }
    setInputValue('');
    setShowSuggestions(false);
    form.reset();
  };

  const handleCreateTag = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    // Check if tag already exists
    const existingTag = availableTags.find(tag => 
      tag.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (existingTag) {
      handleAddTag(existingTag);
      return;
    }

    // Validate and create new tag
    const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
    const tagData = { name: trimmedValue, color: randomColor };
    
    try {
      tagSchema.parse(tagData);
      const newTag = storage.addTag(tagData);
      setAvailableTags(prev => [...prev, newTag]);
      handleAddTag(newTag);
    } catch (error) {
      // Validation error - could show toast or form error
      console.error('Tag validation failed:', error);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleAddTag(filteredTags[0]);
      } else if (inputValue.trim()) {
        handleCreateTag();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInputValue('');
      form.reset();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    form.setValue('name', value);
  };

  const getTagById = (id: string) => availableTags.find(tag => tag.id === id);
  const selectedTagObjects = selectedTags.map(getTagById).filter(Boolean) as Tag[];

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <TagIcon className="h-4 w-4" />
        Tags
      </Label>
      
      {/* Selected Tags */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagObjects.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 pr-1"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}
            >
              {tag.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveTag(tag.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Form {...form}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => inputValue && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="pr-10"
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        
        {inputValue && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleCreateTag}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && !disabled && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto">
            <CardContent className="p-2">
              {filteredTags.length > 0 ? (
                <div className="space-y-1">
                  {filteredTags.map((tag) => (
                    <Button
                      key={tag.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 h-8"
                      onClick={() => handleAddTag(tag)}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                      {tag.category === 'preset' && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          Preset
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              ) : inputValue.trim() ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 h-8"
                  onClick={handleCreateTag}
                >
                  <Plus className="h-4 w-4" />
                  Create "{inputValue.trim()}"
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground p-2">
                  Start typing to search or create tags
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Press Enter to add tags, or click the + button. Tags help organize and filter your ideas.
      </p>
    </div>
  );
}