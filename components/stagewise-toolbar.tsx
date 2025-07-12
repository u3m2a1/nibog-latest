'use client';

import dynamic from 'next/dynamic';

// Dynamically import the StagewiseToolbar component with SSR disabled
const StagewiseToolbar = dynamic(
  () => import('@stagewise/toolbar-next').then((mod) => mod.StagewiseToolbar),
  { ssr: false }
);

// Stagewise toolbar configuration
const stagewiseConfig = {
  plugins: []
};

export default function StagewiseToolbarWrapper() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <StagewiseToolbar config={stagewiseConfig} />;
}
