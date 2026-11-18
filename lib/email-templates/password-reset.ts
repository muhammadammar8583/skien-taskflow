export function createOtpEmail(otp: string) {
  return {
    subject: "Your password reset code",
    text: `Your password reset code is ${otp}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#172033"><h1>Password reset</h1><p>Use this code to reset your password:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
  };
}

export function createPasswordChangedEmail() {
  return {
    subject: "Your password was changed",
    text: "Your password was successfully changed. If you did not make this change, contact support immediately.",
    html: "<div style=\"font-family:Arial,sans-serif;line-height:1.5;color:#172033\"><h1>Password changed</h1><p>Your password was successfully changed.</p><p>If you did not make this change, contact support immediately.</p></div>",
  };
}
