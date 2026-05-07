import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };
  return (
    <div className={cn('relative bg-black rounded-xl border border-gold/30 overflow-hidden flex-shrink-0', sizes[size], className)}>
      <Image
        src="/logo.jpeg"
        alt="JT Licores"
        fill
        className="object-cover scale-110"
        sizes="(max-width: 768px) 100vw, 200px"
        priority
      />
    </div>
  );
}
