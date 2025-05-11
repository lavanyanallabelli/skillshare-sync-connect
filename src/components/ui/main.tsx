
import * as React from "react";
import { cn } from "@/lib/utils";

interface MainProps extends React.HTMLAttributes<HTMLDivElement> {}

const Main = React.forwardRef<HTMLDivElement, MainProps>(
  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn("flex-1", className)}
        {...props}
      />
    );
  }
);

Main.displayName = "Main";

export { Main };
