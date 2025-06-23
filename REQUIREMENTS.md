# 📦 IdeaBox - Brain Dump + Prioritizer
## Requirements & Implementation Phases

### 🎯 Project Overview
IdeaBox is a productivity web app that helps users capture, organize, and prioritize ideas using visual tools like the Eisenhower Matrix, converting top ideas into actionable tasks.

---

## 📋 Phase 1: Core Foundation (MVP)

### 🎯 Objectives
- Set up basic idea capture and display
- Implement core data structures
- Create foundational UI components

### ✅ Features
- **Idea Capture Form**
  - Title (required, max 100 chars)
  - Description (optional, max 500 chars)
  - Auto-save drafts
  - Quick capture with keyboard shortcuts

- **Idea Display**
  - Card-based layout
  - Grid view with responsive design
  - Basic idea information display
  - Creation timestamp

- **Basic CRUD Operations**
  - Add new ideas
  - Edit existing ideas
  - Delete ideas (with confirmation)
  - Local storage persistence

### 🖼️ UI Components
- `IdeaCard` - Display individual ideas
- `IdeaCaptureForm` - Quick idea input
- `IdeaGrid` - Main display layout
- `Header` - App navigation and branding

### 📊 Data Structure
```typescript
interface Idea {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
}
```

---

## 📋 Phase 2: Prioritization System

### 🎯 Objectives
- Implement Eisenhower Matrix visualization
- Add impact/effort scoring
- Create quadrant-based organization

### ✅ Features
- **Impact & Effort Scoring**
  - 1-5 scale sliders
  - Visual indicators (stars, bars)
  - Quick preset options (High, Medium, Low)

- **Eisenhower Matrix Dashboard**
  - 2x2 grid visualization
  - Drag-and-drop between quadrants
  - Color-coded quadrants:
    - Q1: High Impact, High Effort (Red - Plan)
    - Q2: High Impact, Low Effort (Green - Do First)
    - Q3: Low Impact, High Effort (Orange - Reconsider)
    - Q4: Low Impact, Low Effort (Blue - Optional)

- **Quadrant Actions**
  - Bulk operations per quadrant
  - Quick filters by quadrant
  - Statistics and insights

### 🖼️ UI Components
- `EisenhowerMatrix` - 2x2 grid layout
- `PrioritySlider` - Impact/effort input
- `QuadrantCard` - Quadrant container
- `PriorityIndicator` - Visual priority display

### 📊 Data Structure Updates
```typescript
interface Idea {
  // ... existing fields
  impact: number; // 1-5
  effort: number; // 1-5
  quadrant: 'q1' | 'q2' | 'q3' | 'q4';
}
```

---

## 📋 Phase 3: Organization & Filtering

### 🎯 Objectives
- Add comprehensive tagging system
- Implement advanced filtering and search
- Create organization tools

### ✅ Features
- **Tagging System**
  - Predefined tags: Startup, Project, Personal, Tech, Work
  - Custom tag creation
  - Color-coded tags
  - Tag autocomplete

- **Advanced Filtering**
  - Filter by tags (multi-select)
  - Filter by quadrant
  - Filter by status
  - Date range filtering
  - Combined filters

- **Search & Sort**
  - Full-text search (title + description)
  - Sort by: date, impact, effort, title
  - Saved filter presets
  - Search history

- **Bulk Operations**
  - Select multiple ideas
  - Bulk tag assignment
  - Bulk status changes
  - Bulk deletion

### 🖼️ UI Components
- `TagManager` - Tag creation and management
- `FilterSidebar` - All filtering options
- `SearchBar` - Search functionality
- `BulkActions` - Multiple selection tools

### 📊 Data Structure Updates
```typescript
interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'preset' | 'custom';
}

interface Idea {
  // ... existing fields
  tags: string[]; // Tag IDs
}
```

---

## 📋 Phase 4: Task Management

### 🎯 Objectives
- Convert ideas to actionable tasks
- Add task tracking and management
- Implement due dates and reminders

### ✅ Features
- **Idea to Task Conversion**
  - One-click conversion
  - Break down into subtasks
  - Set due dates and priorities
  - Assign task categories

- **Task Management**
  - Task status tracking: Not Started, In Progress, Completed
  - Progress indicators
  - Task dependencies
  - Time estimates

- **Due Dates & Reminders**
  - Calendar integration
  - Due date notifications
  - Overdue highlighting
  - Reminder settings

- **Action Plans**
  - Step-by-step breakdowns
  - Milestone tracking
  - Progress visualization
  - Completion rewards

### 🖼️ UI Components
- `TaskConverter` - Idea to task transformation
- `TaskBoard` - Kanban-style task view
- `DueDatePicker` - Calendar selection
- `ProgressTracker` - Visual progress indicators

### 📊 Data Structure Updates
```typescript
interface Task {
  id: string;
  ideaId: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: Date;
  estimatedHours?: number;
  subtasks: SubTask[];
  createdAt: Date;
  completedAt?: Date;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}
```

---

## 📋 Phase 5: AI Integration

### 🎯 Objectives
- Integrate Gemini API for intelligent suggestions
- Implement auto-scoring and recommendations
- Add AI-powered insights

### ✅ Features
- **Auto-Suggestions**
  - AI-suggested impact scores
  - AI-suggested effort estimates
  - Confidence indicators
  - Manual override options

- **Action Plan Generation**
  - AI-generated step-by-step plans
  - Resource recommendations
  - Timeline suggestions
  - Risk assessments

- **Pros & Cons Analysis**
  - Automated SWOT analysis
  - Risk identification
  - Opportunity highlighting
  - Decision support

- **Smart Insights**
  - Pattern recognition in ideas
  - Productivity recommendations
  - Trend analysis
  - Success predictions

### 🖼️ UI Components
- `AIAssistant` - Main AI interaction panel
- `SuggestionCard` - AI recommendation display
- `InsightsDashboard` - Analytics and patterns
- `ActionPlanGenerator` - AI-powered planning

### 🔧 Technical Requirements
- Gemini API integration
- Rate limiting and error handling
- AI response caching
- User feedback collection

---

## 📋 Phase 6: Enhanced User Experience

### 🎯 Objectives
- Implement advanced UX features
- Add gamification elements
- Create engagement tools

### ✅ Features
- **Idea Roulette**
  - Random idea surfacing
  - Filtered randomization
  - Inspiration mode
  - Surprise recommendations

- **Dark/Light Mode**
  - System preference detection
  - Manual toggle
  - Theme persistence
  - Smooth transitions

- **Keyboard Shortcuts**
  - Quick capture (Ctrl+N)
  - Navigation shortcuts
  - Bulk operations
  - Power user features

- **Data Visualization**
  - Idea statistics dashboard
  - Progress charts
  - Productivity insights
  - Goal tracking

### 🖼️ UI Components
- `ThemeToggle` - Dark/light mode switcher
- `RouletteWheel` - Random idea selector
- `StatsDashboard` - Analytics visualization
- `ShortcutHelper` - Keyboard shortcut guide

---

## 📋 Phase 7: Backend & Authentication

### 🎯 Objectives
- Implement Supabase backend
- Add user authentication
- Enable real-time sync

### ✅ Features
- **User Authentication**
  - Email/password signup
  - Social login options
  - Password reset
  - Account management

- **Data Persistence**
  - Cloud storage via Supabase
  - Real-time synchronization
  - Offline capability
  - Data backup/export

- **Multi-device Sync**
  - Cross-device synchronization
  - Conflict resolution
  - Version history
  - Data integrity

- **Collaboration Features**
  - Shared idea boards
  - Team workspaces
  - Commenting system
  - Permission management

### 🔧 Technical Requirements
- Supabase setup and configuration
- Database schema design
- Row-level security policies
- Real-time subscriptions

---

## 📋 Phase 8: PWA & Mobile Experience

### 🎯 Objectives
- Convert to Progressive Web App
- Optimize mobile experience
- Add offline functionality

### ✅ Features
- **PWA Capabilities**
  - Installable app
  - Offline functionality
  - Push notifications
  - Background sync

- **Mobile Optimization**
  - Touch-friendly interface
  - Swipe gestures
  - Mobile-first design
  - Performance optimization

- **Offline Support**
  - Local data caching
  - Offline mode indicator
  - Sync when online
  - Conflict resolution

### 🔧 Technical Requirements
- Service worker implementation
- Web app manifest
- Cache strategies
- Background sync

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Trust, productivity
- **Secondary**: Green (#10B981) - Success, growth
- **Accent**: Purple (#8B5CF6) - Creativity, innovation
- **Warning**: Orange (#F59E0B) - Caution, planning
- **Error**: Red (#EF4444) - Danger, critical
- **Neutral**: Gray scale for backgrounds and text

### Typography
- **Headlines**: Inter Bold (32px, 24px, 20px)
- **Body**: Inter Regular (16px, 14px)
- **Labels**: Inter Medium (14px, 12px)
- **Monospace**: JetBrains Mono for code/IDs

### Spacing System
- 4px base unit
- Consistent 8px, 16px, 24px, 32px spacing
- Generous whitespace for clarity

---

## 🚀 Implementation Timeline

### Week 1-2: Phase 1 (Core Foundation)
- Project setup and basic components
- Idea capture and display
- Local storage implementation

### Week 3-4: Phase 2 (Prioritization)
- Eisenhower Matrix implementation
- Drag-and-drop functionality
- Priority scoring system

### Week 5-6: Phase 3 (Organization)
- Tagging system
- Advanced filtering
- Search functionality

### Week 7-8: Phase 4 (Task Management)
- Task conversion features
- Due date management
- Progress tracking

### Week 9-10: Phase 5 (AI Integration)
- Gemini API setup
- AI suggestions
- Action plan generation

### Week 11-12: Phase 6-8 (Polish & Deploy)
- UX enhancements
- Backend integration
- PWA implementation

---

## 📊 Success Metrics

### User Engagement
- Daily active users
- Ideas captured per user
- Task conversion rate
- Time spent in app

### Feature Usage
- AI suggestion acceptance rate
- Filter/search usage
- Tag adoption
- Roulette feature engagement

### Technical Performance
- Page load times
- Offline capability usage
- Sync success rate
- Error rates

---

## 🔧 Technical Architecture

### Frontend Stack
- **Framework**: Next.js 13+ (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: React Context + useReducer
- **TypeScript**: Full type safety
- **Testing**: Jest + React Testing Library

### Backend Stack
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **AI**: Google Gemini API
- **Deployment**: Vercel/Netlify

### Development Tools
- **Version Control**: Git
- **Code Quality**: ESLint + Prettier
- **Deployment**: CI/CD pipeline
- **Monitoring**: Error tracking + Analytics

This comprehensive requirements document provides a clear roadmap for building IdeaBox in manageable phases, ensuring each phase delivers value while building toward the complete vision.