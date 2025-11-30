import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'Ít nhất 8 ký tự', test: (p) => p.length >= 8 },
  { label: 'Một chữ cái in hoa (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'Một chữ cái thường (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'Một chữ số (0-9)', test: (p) => /[0-9]/.test(p) },
  {
    label: 'Một ký tự đặc biệt (!@#$%^&*)',
    test: (p) => /[!@#$%^&*]/.test(p),
  },
];

interface PasswordStrengthIndicatorProps {
  password: string;
  showOnlyWhenTyping?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showOnlyWhenTyping = true,
}: PasswordStrengthIndicatorProps) {
  const passedCount = requirements.filter((req) => req.test(password)).length;
  const strengthPercentage = (passedCount / requirements.length) * 100;

  // Determine strength level and color
  const getStrengthInfo = () => {
    if (!password || passedCount === 0)
      return { label: '', color: 'bg-gray-200' };
    if (passedCount <= 2) return { label: 'Yếu', color: 'bg-red-500' };
    if (passedCount <= 3)
      return { label: 'Trung bình', color: 'bg-orange-500' };
    if (passedCount <= 4) return { label: 'Tốt', color: 'bg-yellow-500' };
    return { label: 'Mạnh', color: 'bg-green-500' };
  };

  const strengthInfo = getStrengthInfo();

  // Always render the container to prevent layout shift, but hide content when empty
  const isVisible = !showOnlyWhenTyping || password;

  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden`}
      style={{
        maxHeight: isVisible ? '200px' : '0px',
        opacity: isVisible ? 1 : 0,
        marginTop: isVisible ? '0.5rem' : '0',
      }}
    >
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-brand-dark/60">
            Độ mạnh mật khẩu
          </span>
          {password && (
            <span
              className={`text-xs font-semibold ${
                passedCount <= 2
                  ? 'text-red-500'
                  : passedCount <= 3
                    ? 'text-orange-500'
                    : passedCount <= 4
                      ? 'text-yellow-600'
                      : 'text-green-500'
              }`}
            >
              {strengthInfo.label}
            </span>
          )}
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${strengthInfo.color}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Requirements List - Compact 2 column grid */}
      <div className="grid grid-cols-1 gap-x-1 gap-y-1 mt-1">
        {requirements.map((req, index) => {
          const isPassed = req.test(password);
          return (
            <div
              key={index}
              className={`flex items-center gap-2 text-xs py-1.5 transition-colors duration-200 ${
                isPassed ? 'text-green-600' : 'text-brand-dark/40'
              }`}
            >
              <span
                className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  isPassed
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isPassed ? (
                  <Check className="w-2.5 h-2.5" />
                ) : (
                  <X className="w-2.5 h-2.5" />
                )}
              </span>
              <span className={`truncate ${isPassed ? 'font-medium' : ''}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PasswordStrengthIndicator;
