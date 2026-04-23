interface SendEmailInput {
  to: string
  subject: string
  text: string
  html?: string
}

function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.AUTH_FROM_EMAIL)
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email:dev-fallback]", {
        to: input.to,
        subject: input.subject,
        text: input.text,
      })
      return { ok: true }
    }
    return {
      ok: false,
      error: "Email provider is not configured. Set RESEND_API_KEY and AUTH_FROM_EMAIL.",
    }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.AUTH_FROM_EMAIL,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html ?? `<p>${input.text}</p>`,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      return { ok: false, error: `Email send failed (${response.status}): ${detail}` }
    }

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    }
  }
}

export function buildVerificationEmail(code: string) {
  return {
    subject: "Verify your Dealseeker account",
    text: `Your Dealseeker verification code is ${code}. It expires in 15 minutes.`,
    html: `<p>Your Dealseeker verification code is <strong>${code}</strong>.</p><p>This code expires in 15 minutes.</p>`,
  }
}

export function buildResetPasswordEmail(code: string) {
  return {
    subject: "Reset your Dealseeker password",
    text: `Your Dealseeker password reset code is ${code}. It expires in 15 minutes.`,
    html: `<p>Your Dealseeker password reset code is <strong>${code}</strong>.</p><p>This code expires in 15 minutes.</p>`,
  }
}
