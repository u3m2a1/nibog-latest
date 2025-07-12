// Type definitions for lucide-react
// This is a workaround for TypeScript to recognize the lucide-react types

declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';

  // Define the type for Lucide icons
  type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

  // Export all the icons used in the project
  export const ArrowLeft: LucideIcon;
  export const Edit: LucideIcon;
  export const MapPin: LucideIcon;
  export const Loader2: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const Medal: LucideIcon;
  export const Trophy: LucideIcon;
  export const Award: LucideIcon;
  export const Star: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Trash: LucideIcon;
  
  // Add any other icons you use from lucide-react
}
