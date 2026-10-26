"use client";

import * as React from "react";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export function Site() {
  const [code, setCode] = React.useState("");
  const [done, setDone] = React.useState(false);
  return (
    <div className="grid gap-2">
      <Label htmlFor="login-code">Login code</Label>
      <InputOTP id="login-code" maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={code} onChange={(v) => { setCode(v); setDone(false); }} onComplete={() => setDone(true)}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <p aria-live="polite" className="font-sans text-body-sm text-fg-muted">
        {done ? "Code entered. Checking..." : "Enter the 6-digit code we emailed you."}
      </p>
    </div>
  );
}

export function States() {
  return (
    <div className="grid gap-5">
      <InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} defaultValue="A7" aria-label="Order code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
      <div className="grid gap-2">
        <InputOTP maxLength={4} defaultValue="1234" aria-invalid aria-label="Wrong code">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        <p className="font-sans text-body-sm text-danger">That code has expired.</p>
      </div>
      <InputOTP maxLength={4} disabled aria-label="Disabled code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
