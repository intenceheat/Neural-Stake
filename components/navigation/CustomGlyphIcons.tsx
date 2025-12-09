// components/navigation/CustomGlyphIcons.tsx

import { forwardRef } from 'react';
import { LucideProps } from 'lucide-react';

// NEXUS - Command Center Hub
export const NexusIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className = "w-6 h-6", strokeWidth = 1.4, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* Central diamond core */}
        <path d="M12 3L18 9L12 15L6 9L12 3Z" />
        
        {/* Outer containment ring */}
        <circle cx="12" cy="12" r="9" />
        
        {/* Power nodes at cardinal points */}
        <circle cx="12" cy="3" r="1.5" />
        <circle cx="21" cy="12" r="1.5" />
        <circle cx="12" cy="21" r="1.5" />
        <circle cx="3" cy="12" r="1.5" />
        
        {/* Connection lines to core */}
        <line x1="12" y1="4.5" x2="12" y2="7" />
        <line x1="19.5" y1="12" x2="17" y2="12" />
        <line x1="12" y1="19.5" x2="12" y2="17" />
        <line x1="4.5" y1="12" x2="7" y2="12" />
        
        {/* Lower secondary ring segment */}
        <path d="M6 17C7.5 18.5 9.5 19.5 12 19.5C14.5 19.5 16.5 18.5 18 17" />
      </svg>
    );
  }
);

NexusIcon.displayName = 'NexusIcon';

// STAKES - Vault Stack (keeping wallet vibe but sharper)
export const StakesIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className = "w-6 h-6", strokeWidth = 1.4, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* Main wallet body - angular */}
        <path d="M4 7L4 19C4 20.1 4.9 21 6 21L18 21C19.1 21 20 20.1 20 19L20 7C20 5.9 19.1 5 18 5L6 5C4.9 5 4 5.9 4 7Z" />
        
        {/* Top flap */}
        <path d="M4 7L4 5C4 3.9 4.9 3 6 3L14 3L17 6L20 7" />
        
        {/* Lock mechanism - centered */}
        <circle cx="15" cy="14" r="2.5" />
        <line x1="15" y1="16.5" x2="15" y2="18" />
        
        {/* Vault bars - left side detail */}
        <line x1="7" y1="10" x2="7" y2="18" />
        <line x1="9" y1="10" x2="9" y2="18" />
        
        {/* Stack indicator lines */}
        <line x1="4" y1="11" x2="11" y2="11" />
        <line x1="4" y1="14" x2="11" y2="14" />
      </svg>
    );
  }
);

StakesIcon.displayName = 'StakesIcon';

// MARKETS - Candlestick Chart
export const MarketsIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className = "w-6 h-6", strokeWidth = 1.4, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* Chart frame */}
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="3" y1="3" x2="3" y2="21" />
        
        {/* Candlestick 1 - bullish */}
        <line x1="6" y1="16" x2="6" y2="19" />
        <rect x="5" y="10" width="2" height="6" />
        <line x1="6" y1="7" x2="6" y2="10" />
        
        {/* Candlestick 2 - bearish */}
        <line x1="10" y1="13" x2="10" y2="16" />
        <rect x="9" y="6" width="2" height="7" />
        <line x1="10" y1="4" x2="10" y2="6" />
        
        {/* Candlestick 3 - bullish tall */}
        <line x1="14" y1="18" x2="14" y2="20" />
        <rect x="13" y="8" width="2" height="10" />
        <line x1="14" y1="5" x2="14" y2="8" />
        
        {/* Candlestick 4 - neutral */}
        <line x1="18" y1="14" x2="18" y2="17" />
        <rect x="17" y="9" width="2" height="5" />
        <line x1="18" y1="7" x2="18" y2="9" />
        
        {/* Trend line overlay */}
        <path d="M5 18L9 11L13 15L19 8" strokeWidth={(strokeWidth as number) * 0.8} opacity="0.6" />
      </svg>
    );
  }
);

MarketsIcon.displayName = 'MarketsIcon';

// INTEL - Neural Network (unchanged - already perfect)
export const IntelIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className = "w-6 h-6", strokeWidth = 1.4, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* Central node */}
        <circle cx="12" cy="12" r="2.5" />
        
        {/* Top layer nodes */}
        <circle cx="6" cy="6" r="1.5" />
        <circle cx="12" cy="4" r="1.5" />
        <circle cx="18" cy="6" r="1.5" />
        
        {/* Middle layer nodes */}
        <circle cx="4" cy="12" r="1.5" />
        <circle cx="20" cy="12" r="1.5" />
        
        {/* Bottom layer nodes */}
        <circle cx="6" cy="18" r="1.5" />
        <circle cx="12" cy="20" r="1.5" />
        <circle cx="18" cy="18" r="1.5" />
        
        {/* Neural connections - Top layer to center */}
        <line x1="7.2" y1="6.8" x2="10.2" y2="10.5" />
        <line x1="12" y1="5.5" x2="12" y2="9.5" />
        <line x1="16.8" y1="6.8" x2="13.8" y2="10.5" />
        
        {/* Neural connections - Middle layer to center */}
        <line x1="5.5" y1="12" x2="9.5" y2="12" />
        <line x1="18.5" y1="12" x2="14.5" y2="12" />
        
        {/* Neural connections - Center to bottom layer */}
        <line x1="10.2" y1="13.5" x2="7.2" y2="17.2" />
        <line x1="12" y1="14.5" x2="12" y2="18.5" />
        <line x1="13.8" y1="13.5" x2="16.8" y2="17.2" />
      </svg>
    );
  }
);

IntelIcon.displayName = 'IntelIcon';