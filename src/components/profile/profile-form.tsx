/**
 * @file profile-form.tsx
 * @description 프로필 이름 수정 폼 컴포넌트
 *
 * 이 컴포넌트는 사용자가 자신의 이름을 수정할 수 있는 폼을 제공합니다.
 *
 * 주요 기능:
 * 1. 현재 이름 표시
 * 2. 이름 수정 폼
 * 3. 실시간 유효성 검사
 * 4. 서버 액션을 통한 업데이트
 * 5. 로딩 상태 표시
 * 6. 성공/에러 메시지 표시
 *
 * @dependencies
 * - react-hook-form: 폼 상태 관리
 * - @/actions/profile: 프로필 서버 액션
 * - @/components/ui: ShadcnUI 컴포넌트들
 */

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile, type ProfileData } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Save, Edit } from "lucide-react";

// 폼 스키마
const ProfileFormSchema = z.object({
  name: z
    .string()
    .min(1, "이름은 최소 1글자 이상이어야 합니다.")
    .max(50, "이름은 50글자를 초과할 수 없습니다."),
});

type ProfileFormData = z.infer<typeof ProfileFormSchema>;

interface ProfileFormProps {
  initialProfile: ProfileData;
  onProfileUpdate?: (profile: ProfileData) => void;
}

export function ProfileForm({
  initialProfile,
  onProfileUpdate,
}: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: initialProfile.name || "",
    },
  });

  const handleSubmit = async (data: ProfileFormData) => {
    setMessage(null);

    startTransition(async () => {
      try {
        console.log("📝 프로필 업데이트 요청:", data);

        const formData = new FormData();
        formData.append("name", data.name);

        const result = await updateProfile(formData);

        if (result.success && result.profile) {
          console.log("✅ 프로필 업데이트 성공");
          setMessage({
            type: "success",
            text: "이름이 성공적으로 업데이트되었습니다.",
          });
          setIsEditing(false);
          onProfileUpdate?.(result.profile);
        } else {
          console.error("❌ 프로필 업데이트 실패:", result.error);
          setMessage({
            type: "error",
            text: result.error || "프로필 업데이트에 실패했습니다.",
          });
        }
      } catch (error) {
        console.error("프로필 업데이트 중 예외:", error);
        setMessage({
          type: "error",
          text: "프로필 업데이트 중 오류가 발생했습니다.",
        });
      }
    });
  };

  const handleCancel = () => {
    form.reset({ name: initialProfile.name || "" });
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-xl sm:text-2xl">프로필 정보</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isPending}
            >
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {/* 메시지 표시 */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* 이름 필드 */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            이름
          </Label>

          {isEditing ? (
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="이름을 입력하세요"
                  disabled={isPending}
                  className={form.formState.errors.name ? "border-red-500" : ""}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending || !form.formState.isValid}
                  className="flex-1"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
              <p className="text-base sm:text-lg">
                {initialProfile.name || "이름이 설정되지 않았습니다"}
              </p>
            </div>
          )}
        </div>

        {/* 기타 정보 (읽기 전용) */}
        <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            권한
          </p>
          <p className="text-base sm:text-lg">
            {initialProfile.is_admin ? "관리자" : "일반 사용자"}
          </p>
        </div>

        <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            가입일
          </p>
          <p className="text-base sm:text-lg">
            {new Date(initialProfile.created_at).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
