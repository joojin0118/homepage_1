import { Check, X } from "lucide-react";

// 비밀번호 조건
const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "최소 6자 이상",
    validator: (value: string) => value.length >= 6,
  },
  {
    id: "letter",
    label: "영문자 포함",
    validator: (value: string) => /[a-zA-Z]/.test(value),
  },
  {
    id: "number",
    label: "숫자 포함",
    validator: (value: string) => /\d/.test(value),
  },
  {
    id: "special",
    label: "특수문자 포함",
    validator: (value: string) =>
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
  },
];

// 모든 비밀번호 요구사항이 충족되는지 확인하는 함수
export function isPasswordValid(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((req) => req.validator(password));
}

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <div className="mt-2 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        비밀번호 요구사항:
      </p>
      <ul className="space-y-1 text-sm">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const isValid = password ? requirement.validator(password) : false;
          return (
            <li key={requirement.id} className="flex items-center">
              {isValid ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <X className="mr-2 h-4 w-4 text-red-500" />
              )}
              <span
                className={isValid ? "text-green-500" : "text-muted-foreground"}
              >
                {requirement.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
