import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function PageContainer({
  children,
  className,
  title,
  description,
}: PageContainerProps) {
  return (
    <main className={cn("flex-1 container py-8", className)}>
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight gradient-text">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </main>
  );
}
