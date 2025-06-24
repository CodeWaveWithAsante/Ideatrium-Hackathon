# 🧠 Ideatrium - Brain Dump + Prioritizer

Transform your thoughts into actionable ideas with AI-powered insights and smart prioritization using the Eisenhower Matrix.

![Ideatrium Dashboard](https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop&crop=center)
![Ideatrium Dashboard](./ideal1.png.png)

## ✨ Features

### 🎯 Core Functionality
- **Idea Capture**: Quick and intuitive idea input with rich descriptions
- **Smart Prioritization**: Eisenhower Matrix visualization (Impact vs Effort)
- **Task Conversion**: Transform ideas into actionable tasks with subtasks
- **Real-time Sync**: Cloud-based storage with instant synchronization
- **Offline Support**: Progressive Web App with offline capabilities

### 🤖 AI-Powered Insights
- **Auto-Suggestions**: AI-powered impact and effort scoring
- **Action Plans**: Generated step-by-step implementation guides
- **Pros & Cons Analysis**: Automated SWOT analysis for better decision making
- **Smart Insights**: Pattern recognition and productivity recommendations

### 🏷️ Organization & Filtering
- **Tagging System**: Preset and custom tags with color coding
- **Advanced Filtering**: Multi-criteria filtering and search
- **Bulk Operations**: Select and modify multiple ideas at once
- **Smart Presets**: Quick filters for high-impact, quick wins, and more

### 📊 Analytics & Visualization
- **Statistics Dashboard**: Track your creativity patterns and productivity
- **Eisenhower Matrix**: Visual 2x2 grid for priority management
- **Progress Tracking**: Monitor task completion and goal achievement
- **Idea Roulette**: Discover random inspiration from your collection

### 🎨 User Experience
- **Dark/Light Mode**: Automatic theme switching with manual override
- **Keyboard Shortcuts**: Power user features for quick navigation
- **Mobile Optimized**: Responsive design with touch-friendly interface
- **PWA Support**: Install as a native app on any device

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for cloud features)
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ideatrium.git
   cd ideatrium
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment**
   Edit `.env.local` with your credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Gemini AI API Configuration
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Enable Row Level Security (RLS) policies

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Run Database Migrations**
   ```sql
   -- Run the migration files in order:
   -- 1. supabase/migrations/20250622145824_rustic_reef.sql
   -- 2. supabase/migrations/20250622145856_orange_summit.sql
   ```

3. **Configure Authentication**
   - Enable email authentication
   - Set up email templates (optional)
   - Configure redirect URLs for production

### Google Gemini AI Setup

1. **Get API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your environment variables

2. **Configure Rate Limits**
   - The app includes built-in rate limiting
   - Fallback suggestions are provided if API fails

## 📱 Usage Guide

### Getting Started

1. **Sign Up/Sign In**
   - Create an account with email and password
   - Verify your email address
   - Start capturing ideas immediately

2. **Capture Your First Idea**
   - Click "New Idea" or press `Ctrl+N`
   - Add a title and description
   - Rate impact and effort (1-5 scale)
   - Add relevant tags

3. **Organize with the Matrix**
   - View ideas in the Eisenhower Matrix
   - Drag and drop between quadrants
   - Focus on "Do First" (high impact, low effort) items

### Advanced Features

#### Keyboard Shortcuts
- `Ctrl+N` - New idea
- `Ctrl+K` - Focus search
- `Ctrl+F` - Toggle filters
- `Ctrl+M` - Toggle matrix/grid view
- `Ctrl+A` - Toggle archived ideas
- `Ctrl+R` - Open idea roulette
- `?` - Show all shortcuts

#### Bulk Operations
1. Enable bulk select mode
2. Select multiple ideas
3. Apply tags, change status, or delete in bulk

#### AI Assistant
1. Open any idea
2. Click "AI Assistant"
3. Get suggestions for impact, effort, and action plans
4. Apply suggestions or use as inspiration

#### Task Management
1. Convert ideas to tasks
2. Add subtasks and due dates
3. Track progress in the task board
4. Mark tasks as complete

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 13+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: Google Gemini API
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel/Netlify compatible

### Project Structure
```
ideatrium/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── ui/                # Shadcn/UI base components
│   ├── auth/              # Authentication components
│   └── pwa/               # PWA-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── auth-context.tsx   # Authentication context
│   ├── supabase.ts        # Supabase client
│   ├── ai-service.ts      # AI integration
│   └── types.ts           # TypeScript definitions
├── public/                # Static assets
└── supabase/              # Database migrations
```

## 🔒 Security & Privacy

### Data Protection
- **Row Level Security**: All data is protected by Supabase RLS policies
- **User Isolation**: Users can only access their own data
- **Secure Authentication**: Email verification and password reset
- **HTTPS Only**: All communications are encrypted

### Privacy Features
- **Local Storage**: Works offline with local data storage
- **No Tracking**: No analytics or user tracking
- **Data Export**: Export your data anytime
- **Account Deletion**: Complete data removal on request

## 🌐 Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure Supabase URLs are configured for production

3. **Configure Domains**
   - Set up custom domain (optional)
   - Update Supabase auth settings with production URLs

### Netlify Deployment

1. **Build Settings**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   - Configure in Netlify dashboard
   - Set build command: `npm run build`
   - Set publish directory: `out`

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Supabase Connection Issues
- Verify environment variables are correct
- Check Supabase project status
- Ensure RLS policies are properly configured

#### AI Features Not Working
- Verify Gemini API key is valid
- Check API quota and rate limits
- Fallback suggestions will be used if API fails

#### PWA Installation Issues
- Ensure HTTPS is enabled
- Check service worker registration
- Verify manifest.json is accessible

### Getting Help

1. **Check the Issues**: Look for existing solutions
2. **Create an Issue**: Describe your problem with details
3. **Join Discussions**: Share ideas and get help from the community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/UI** for the beautiful component library
- **Supabase** for the backend infrastructure
- **Google Gemini** for AI capabilities
- **Lucide** for the icon set
- **Tailwind CSS** for the styling system

## 📊 Roadmap

### Upcoming Features
- [ ] Team collaboration and sharing
- [ ] Advanced analytics and reporting
- [ ] Integration with external tools (Notion, Trello)
- [ ] Voice input for idea capture
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - AI integration and advanced filtering
- **v1.2.0** - PWA support and offline capabilities
- **v1.3.0** - Task management and conversion features

---

## 🚀 Start Your Creative Journey

Ready to transform your ideas into action? 

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ideatrium)

**[Live Demo](https://ideatrium.app)** | **[Documentation](https://docs.ideatrium.app)** | **[Support](mailto:support@ideatrium.app)**

---

<div align="center">
  <p>Made with ❤️ for creative minds everywhere</p>
  <p>
    <a href="https://twitter.com/ideatriumapp">Twitter</a> •
    <a href="https://github.com/yourusername/ideatrium">GitHub</a> •
    <a href="https://ideatrium.app">Website</a>
  </p>
</div>