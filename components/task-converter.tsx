"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  Target,
  AlertTriangle,
  Zap,
  Minus,
} from "lucide-react";
import { format } from "date-fns";
import { Idea, TaskFormData } from "@/lib/types";
import { TagInput } from "./tag-input";
import { cn } from "@/lib/utils";

interface TaskConverterProps {
  idea: Idea;
  onConvert: (ideaId: string, taskData: TaskFormData) => void;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "#6B7280", icon: Minus },
  { value: "medium", label: "Medium", color: "#F59E0B", icon: Clock },
  { value: "high", label: "High", color: "#EF4444", icon: AlertTriangle },
  { value: "urgent", label: "Urgent", color: "#DC2626", icon: Zap },
];

export function TaskConverter({ idea, onConvert }: TaskConverterProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: idea.title,
    description: idea.description || "",
    priority:
      idea.quadrant === "q2"
        ? "high"
        : idea.quadrant === "q1"
        ? "medium"
        : "low",
    dueDate: undefined,
    estimatedHours: undefined,
    tags: idea.tags,
    subtasks: [],
  });
  const [newSubtask, setNewSubtask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    onConvert(idea.id, {
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate,
      estimatedHours: formData.estimatedHours,
      tags: formData.tags,
      subtasks: formData.subtasks,
    });

    setOpen(false);

    // Reset form
    setFormData({
      title: idea.title,
      description: idea.description || "",
      priority:
        idea.quadrant === "q2"
          ? "high"
          : idea.quadrant === "q1"
          ? "medium"
          : "low",
      dueDate: undefined,
      estimatedHours: undefined,
      tags: idea.tags,
      subtasks: [],
    });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setFormData((prev) => ({
        ...prev,
        subtasks: [...prev.subtasks, newSubtask.trim()],
      }));
      setNewSubtask("");
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const selectedPriority = PRIORITY_OPTIONS.find(
    (p) => p.value === formData.priority
  );
  const PriorityIcon = selectedPriority?.icon || Clock;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          Convert to Task
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] xl:max-w-[800px] max-h-[95vh] flex flex-col p-0">
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Convert Idea to Task
            </DialogTitle>
            <DialogDescription>
              Transform your idea into an actionable task with deadlines and
              subtasks.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Original Idea Preview */}
          <Card className="mb-6 bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Original Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <h3 className="font-semibold mb-2">{idea.title}</h3>
              {idea.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {idea.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline">Impact: {idea.impact}/5</Badge>
                <Badge variant="outline">Effort: {idea.effort}/5</Badge>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                maxLength={100}
                className="text-lg"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Task Description</Label>
              <Textarea
                id="task-description"
                placeholder="Add details about what needs to be accomplished..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(
                    value: "low" | "medium" | "high" | "urgent"
                  ) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <PriorityIcon
                        className="h-4 w-4"
                        style={{ color: selectedPriority?.color }}
                      />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((priority) => {
                      const Icon = priority.icon;
                      return (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Icon
                              className="h-4 w-4"
                              style={{ color: priority.color }}
                            />
                            {priority.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate
                        ? format(formData.dueDate, "PPPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) =>
                        setFormData((prev) => ({ ...prev, dueDate: date }))
                      }
                    />
                    {/* {formData.dueDate && (
                      <div className="p-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              dueDate: undefined,
                            }))
                          }
                          className="w-full"
                        >
                          Clear Date
                        </Button>
                      </div>
                    )} */}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="estimated-hours">Estimated Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="How many hours will this take?"
                value={formData.estimatedHours || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedHours: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>

            <TagInput
              selectedTags={formData.tags}
              onTagsChange={(tags) =>
                setFormData((prev) => ({ ...prev, tags }))
              }
              placeholder="Add tags to organize your task..."
            />

            {/* Subtasks */}
            <div className="space-y-3">
              <Label>Subtasks</Label>

              {formData.subtasks.length > 0 && (
                <div className="space-y-2">
                  {formData.subtasks.map((subtask, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                    >
                      <span className="flex-1 text-sm">{subtask}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubtask(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={!formData.title.trim()}
                className="flex-1"
              >
                <Target className="h-4 w-4 mr-2" />
                Create Task
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
