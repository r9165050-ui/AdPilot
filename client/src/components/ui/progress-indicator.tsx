interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center space-x-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            index <= currentStep
              ? "bg-fb-blue text-white"
              : "bg-gray-200 text-gray-600"
          }`}>
            {index + 1}
          </div>
          <span className={`text-sm ${
            index <= currentStep ? "text-fb-blue font-medium" : "text-gray-500"
          }`}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-gray-200 mx-4 w-16" />
          )}
        </div>
      ))}
    </div>
  );
}
