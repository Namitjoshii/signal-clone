"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import SignalLogo from "@/components/SignalLogo";
import { authenticate } from "@/lib/auth-api";
import { storeAuth } from "@/lib/auth-storage";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handlePhoneSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (phone.trim().length >= 10) {
      setStep("otp");
    }
  }

  async function handleOtpSubmit(event: FormEvent) {
    event.preventDefault();
    if (otp.trim().length < 4 || isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const { token, user } = await authenticate(phone, otp);
      storeAuth(token, user.id);
      router.push("/chat");
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-signal-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-signal-border bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <SignalLogo className="mb-4 h-20 w-20" />
            <h1 className="text-2xl font-bold text-signal-text">Signal</h1>
            <p className="mt-2 text-sm text-signal-muted">
              {step === "phone"
                ? "Enter your phone number to get started"
                : "Enter the verification code we sent you"}
            </p>
          </div>

          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-signal-text"
                >
                  Phone number
                </label>
                <div className="flex overflow-hidden rounded-lg border border-signal-border focus-within:border-signal-blue focus-within:ring-1 focus-within:ring-signal-blue">
                  <span className="flex items-center border-r border-signal-border bg-signal-input px-3 text-sm text-signal-muted">
                    +1
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="555 123 4567"
                    className="flex-1 bg-white px-4 py-3 text-sm text-signal-text placeholder:text-signal-muted focus:outline-none"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phone.trim().length < 10}
                className="w-full rounded-lg bg-signal-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <div>
                <label
                  htmlFor="otp"
                  className="mb-1.5 block text-sm font-medium text-signal-text"
                >
                  Verification code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="123456"
                  className="w-full rounded-lg border border-signal-border px-4 py-3 text-center text-lg tracking-[0.5em] text-signal-text placeholder:tracking-normal placeholder:text-signal-muted focus:border-signal-blue focus:outline-none focus:ring-1 focus:ring-signal-blue"
                  autoComplete="one-time-code"
                />
                <p className="mt-2 text-center text-xs text-signal-muted">
                  Sent to +1 {phone}
                </p>
              </div>

              <button
                type="submit"
                disabled={otp.trim().length < 4 || isSubmitting}
                className="w-full rounded-lg bg-signal-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Verifying..." : "Continue"}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                className="w-full py-2 text-sm text-signal-blue transition-colors hover:text-signal-blue-dark"
              >
                Change phone number
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-signal-muted">
          Your personal messages are end-to-end encrypted.
        </p>
      </div>
    </div>
  );
}
