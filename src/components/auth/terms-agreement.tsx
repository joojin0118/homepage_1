/**
 * @file terms-agreement.tsx
 * @description 회원가입 약관 동의 컴포넌트
 *
 * 이 컴포넌트는 회원가입 시 필요한 이용약관 및 개인정보 처리방침 동의를 처리합니다.
 *
 * 주요 기능:
 * 1. 이용약관 및 개인정보 처리방침 텍스트 표시
 * 2. 체크박스를 통한 동의 상태 관리
 * 3. 필수 약관 동의 여부 검증
 * 4. 약관 상세 내용 모달 또는 접기/펼치기 기능
 *
 * @dependencies
 * - react
 * - @/components/ui/checkbox
 * - @/components/ui/button
 * - lucide-react
 */

"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TermsAgreementProps {
  isAgreed: boolean;
  onAgreementChange: (agreed: boolean) => void;
}

export function TermsAgreement({ isAgreed, onAgreementChange }: TermsAgreementProps) {
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);
  const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* 이용약관 */}
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">이용약관</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTermsExpanded(!isTermsExpanded)}
              className="h-6 w-6 p-0"
            >
              {isTermsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {isTermsExpanded && (
          <CardContent className="pt-0">
            <div className="text-xs text-muted-foreground space-y-2 max-h-32 overflow-y-auto">
              <p><strong>제1조 (목적)</strong></p>
              <p>이 약관은 회사가 제공하는 서비스의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
              
              <p><strong>제2조 (서비스의 제공 및 변경)</strong></p>
              <p>회사는 다음과 같은 업무를 수행합니다:</p>
              <p>1. 온라인 쇼핑몰 서비스 제공</p>
              <p>2. 상품 정보 제공 및 구매계약 중개</p>
              <p>3. 기타 회사가 정하는 업무</p>
              
              <p><strong>제3조 (약관의 효력 및 변경)</strong></p>
              <p>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 개인정보 처리방침 */}
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">개인정보 처리방침</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsPrivacyExpanded(!isPrivacyExpanded)}
              className="h-6 w-6 p-0"
            >
              {isPrivacyExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {isPrivacyExpanded && (
          <CardContent className="pt-0">
            <div className="text-xs text-muted-foreground space-y-2 max-h-32 overflow-y-auto">
              <p><strong>1. 개인정보 수집 목적</strong></p>
              <p>회원가입, 서비스 제공, 고객 상담, 마케팅 및 광고에 활용</p>
              
              <p><strong>2. 수집하는 개인정보 항목</strong></p>
              <p>이메일 주소, 비밀번호, 이름, 연락처</p>
              
              <p><strong>3. 개인정보 보유 및 이용기간</strong></p>
              <p>회원 탈퇴 시까지 또는 법정 보존기간</p>
              
              <p><strong>4. 개인정보 제3자 제공</strong></p>
              <p>원칙적으로 개인정보를 제3자에게 제공하지 않습니다.</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 동의 체크박스 */}
      <div className="flex items-start space-x-2 p-3 bg-muted/30 rounded-lg">
        <Checkbox
          id="terms-agreement"
          checked={isAgreed}
          onCheckedChange={onAgreementChange}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <label 
            htmlFor="terms-agreement" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            [필수] 이용약관 및 개인정보 처리방침에 동의합니다
          </label>
          <p className="text-xs text-muted-foreground">
            서비스 이용을 위해 약관 동의가 필요합니다.
          </p>
        </div>
      </div>
    </div>
  );
} 