import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface BaseStepperFormProps {
  steps: Step[];
  currentStep: number;
  children: React.ReactNode;
  onCancel: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  canProceed?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  submitLabel?: string;
}

export function BaseStepperForm({
  steps,
  currentStep,
  children,
  onCancel,
  onNext,
  onPrevious,
  onSubmit,
  canProceed = true,
  isSubmitting = false,
  nextLabel = 'Next',
  submitLabel = 'Create',
}: Readonly<BaseStepperFormProps>) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/50'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 mt-5 rounded transition-all ${
                      stepNumber < currentStep
                        ? 'bg-emerald-500'
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div>{children}</div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>

        <div className="flex-1" />

        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Previous
          </button>
        )}

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
