'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isSupabaseConfigured, testDatabaseConnection } from '@/lib/supabase';
import { toast } from 'sonner';

export function DebugPanel() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await testDatabaseConnection();
      setConnectionStatus('success');
      toast.success('Database connection successful!');
    } catch (error: any) {
      setConnectionStatus('error');
      toast.error('Database connection failed', {
        description: error.message,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const supabaseConfigured = isSupabaseConfigured();
  const hasUser = !!user;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="gap-2 bg-white/80 backdrop-blur-sm"
        >
          <Settings className="h-4 w-4" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Debug Panel
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Supabase Configuration Status */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Supabase Configuration</h4>
            <div className="flex items-center gap-2">
              {supabaseConfigured ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Configured
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Not Configured
                  </Badge>
                </>
              )}
            </div>
            {!supabaseConfigured && (
              <div className="space-y-2">
                <p className="text-xs text-red-600">
                  Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                  Open Supabase Dashboard
                </Button>
              </div>
            )}
          </div>

          {/* Authentication Status */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Authentication</h4>
            <div className="flex items-center gap-2">
              {hasUser ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Authenticated
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Not Authenticated
                  </Badge>
                </>
              )}
            </div>
            {hasUser && (
              <p className="text-xs text-muted-foreground">
                User ID: {user.id.slice(0, 8)}...
              </p>
            )}
          </div>

          {/* Database Connection Test */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Database Connection</h4>
            <div className="flex items-center gap-2">
              {connectionStatus === 'success' && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Connected
                  </Badge>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Failed
                  </Badge>
                </>
              )}
              {connectionStatus === 'unknown' && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  Unknown
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={!supabaseConfigured || !hasUser || isTestingConnection}
              className="w-full gap-2"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Database className="h-3 w-3" />
                  Test Connection
                </>
              )}
            </Button>
          </div>

          {/* Environment Variables */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Environment</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>SUPABASE_URL:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>SUPABASE_ANON_KEY:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GEMINI_API_KEY:</span>
                <span className={process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'text-green-600' : 'text-orange-600'}>
                  {process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '✓' : '○'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="w-full gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}