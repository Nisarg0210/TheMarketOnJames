export const ADMIN_EMAILS = [
    "nisargpatel02.np@gmail.com",
    // Add more admin emails here
];

export const EMPLOYEE_EMAILS = [
    // Add employee emails here
    "nsrg0210@gmail.com",
];

export const isAuthorizedAdmin = (email?: string | null) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email) || email === process.env.ADMIN_EMAIL;
};

export const isAuthorizedEmployee = (email?: string | null) => {
    if (!email) return false;
    return EMPLOYEE_EMAILS.includes(email);
};
