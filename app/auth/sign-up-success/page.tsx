"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "@/components/animate-ui/icons/check";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);

    const supabase = createClient();
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: '', // Will use the email from the current session
      });

      if (error) throw error;
      setResendMessage("Confirmation email sent!");
    } catch (error) {
      setResendMessage("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
        <Card className="shadow-md">
          <CardContent className="p-6 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <Check size={32} className="text-success" animateOnHover />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl font-semibold text-primary mb-2">
                Check Your Email
              </h1>
              <p className="text-base text-secondary">
                We&apos;ve sent you a confirmation link to verify your account.
              </p>
            </div>

            {/* Resend Button */}
            <div className="pt-4">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? "Sending..." : "Resend Confirmation Email"}
              </Button>
            </div>

            {/* Resend Message */}
            {resendMessage && (
              <p className={`text-sm ${resendMessage.includes("sent") ? "text-success" : "text-error"}`}>
                {resendMessage}
              </p>
            )}

            {/* Additional Info */}
            <div className="text-sm text-tertiary">
              <p>Didn&apos;t receive the email? Check your spam folder.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
