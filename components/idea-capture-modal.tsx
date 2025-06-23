'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Lightbulb, Sparkles } from 'lucide-react';
import { TagInput } from './tag-input';
import { PrioritySlider } from './priority-slider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ideaSchema,
  type IdeaFormData,
} from '@/lib/validations';

interface IdeaCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: IdeaFormData) => void;
}

export function IdeaCaptureModal({ 
  open, 
  onOpenChange, 
  onSubmit 
}: IdeaCaptureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      impact: 3,
      effort: 3,
    },
  });

  const handleSubmit = async (data: IdeaFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const watchedTitle = form.watch('title');
  const watchedDescription = form.watch('description');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] xl:max-w-[900px] 2xl:max-w-[1000px] max-h-[95vh] flex flex-col p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-white/20 dark:border-slate-700/50">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Capture Your Idea</DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  Transform your brilliant idea into an actionable item with priority assessment
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <Sparkles className="h-4 w-4" />
              <span>Every great achievement starts with a single idea</span>
            </div>
          </DialogHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Idea Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What's your brilliant idea?"
                        maxLength={100}
                        className="text-lg h-14 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <div className="text-xs text-muted-foreground">
                        {watchedTitle?.length || 0}/100 characters
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add more details about your idea... What problem does it solve? What makes it unique?"
                        maxLength={500}
                        rows={5}
                        className="resize-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <div className="text-xs text-muted-foreground">
                        {watchedDescription?.length || 0}/500 characters
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TagInput
                          selectedTags={field.value}
                          onTagsChange={field.onChange}
                          placeholder="Add tags to organize your idea..."
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Priority Assessment
                </h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Help prioritize your idea by rating its potential impact and required effort
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-">
                  <FormField
                    control={form.control}
                    name="impact"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl className="w-full">
                          <div>
                            <PrioritySlider
                              impact={field.value}
                              effort={form.watch('effort')}
                              onImpactChange={field.onChange}
                              onEffortChange={(effort) => form.setValue('effort', effort)}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.watch('title')?.trim()}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                      Adding Idea...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Add Idea
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleOpenChange(false)}
                  className="px-8 h-12"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center pb-4 border-t pt-4">
                💡 <strong>Pro tip:</strong> Press Ctrl/Cmd + Enter to quickly save your idea
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}