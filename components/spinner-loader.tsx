import Image from 'next/image';

interface Props {
  title: string;
  message: string;
}

export const SpinnerLoader = ({ title, message }: Props) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Image 
              src="/logo.svg" 
              alt="Ideatrium Logo" 
              width={34} 
              height={34} 
              className="animate-pulse"
            />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground animate-in slide-in-from-bottom-2 duration-700 delay-300">{title}</p>
          <p className="text-sm text-muted-foreground animate-in slide-in-from-bottom-2 duration-700 delay-500">{message}</p>
        </div>
      </div>
    </div>
  );
};