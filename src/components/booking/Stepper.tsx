import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Stepper */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300",
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="mx-4 h-0.5 flex-1">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Étape {currentStep} sur {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps.find((s) => s.id === currentStep)?.title}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-300",
                currentStep >= step.id ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

