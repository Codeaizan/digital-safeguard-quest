
import { cn } from "@/lib/utils";

interface PasswordStrengthBarProps {
  strength: number; // 0-3
}

export function PasswordStrengthBar({ strength }: PasswordStrengthBarProps) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full transition-all duration-300",
          strength === 0 && "w-0",
          strength === 1 && "w-1/3 bg-red-500",
          strength === 2 && "w-2/3 bg-yellow-500",
          strength === 3 && "w-full bg-green-500"
        )}
      />
    </div>
  );
}
