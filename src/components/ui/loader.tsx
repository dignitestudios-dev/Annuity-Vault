import { cn } from "@/lib/utils";
import React from "react";

interface LoaderProps extends React.SVGProps<SVGSVGElement> {}

export function Loader({ className, ...props }: LoaderProps) {
  return (
    <svg 
      className={cn("global-loader", className)} 
      viewBox="25 25 50 50"
      {...props}
    >
      <circle r="20" cy="50" cx="50"></circle>
    </svg>
  );
}
