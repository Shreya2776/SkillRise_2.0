const otpStore = new Map();
const verifiedEmails = new Set();

export const saveOtp = (email, otp) => {
  otpStore.set(email, {
    otp,
    expire: Date.now() + 10 * 60 * 1000
  });
};

export const verifyOtpStore = (email, otp) => {
  const data = otpStore.get(email);

  if (!data) return false;

  if (data.otp !== otp) return false;
  if (data.expire < Date.now()) return false;

  otpStore.delete(email);
  return true;
};

export const markVerified = (email) => {
  verifiedEmails.add(email);
};

export const isVerified = (email) => {
  return verifiedEmails.has(email);
};