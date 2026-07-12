import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg hover:opacity-95 hover:shadow-xl active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md active:scale-[0.98]",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-transparent hover:shadow-md active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground relative before:absolute before:inset-0 before:bg-accent before:scale-0 before:rounded-lg before:origin-center hover:before:scale-100 before:transition-transform before:duration-300",
        link: "text-primary underline-offset-4 hover:underline relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
