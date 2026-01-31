import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectCardSkeletonProps {
  isGridView?: boolean;
  isFeatured?: boolean;
}

const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({ 
  isGridView = true, 
  isFeatured = false 
}) => {
  if (isFeatured) {
    return (
      <div className="rounded-3xl bg-card border overflow-hidden mb-16 animate-pulse">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Skeleton */}
          <Skeleton className="aspect-[4/3] md:aspect-auto md:min-h-[600px]" />
          
          {/* Content Skeleton */}
          <div className="flex flex-col p-8 md:p-12 space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="flex gap-4 pt-8 mt-auto">
              <Skeleton className="h-11 flex-1 rounded-md" />
              <Skeleton className="h-11 w-11 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-card border overflow-hidden animate-pulse ${isGridView ? 'flex flex-col' : 'flex flex-col md:flex-row'}`}>
      {/* Image Skeleton */}
      <Skeleton className={`${isGridView ? 'aspect-[4/3]' : 'md:w-2/5 aspect-square md:aspect-auto md:min-h-[250px]'}`} />
      
      {/* Content Skeleton */}
      <div className={`flex flex-col p-6 space-y-4 ${isGridView ? '' : 'md:w-3/5'}`}>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-4/5" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        <div className="flex gap-3 pt-6 mt-auto border-t">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default ProjectCardSkeleton;
