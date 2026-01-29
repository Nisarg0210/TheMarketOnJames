export async function sendEmail({
    to,
    subject,
    html
}: {
    to: string | string[];
    subject: string;
    html: string
}) {
    // For MVP/Demo: Log the email to console.
    // In production, integrate resend, sendgrid, or nodemailer here.
    console.log("----------------EMAIL SENDING----------------");
    console.log(`TO: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`HTML: ${html}`);
    console.log("---------------------------------------------");

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
        // Example implementation with Resend if key exists
        /*
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    from: 'Updates <onboarding@resend.dev>',
                    to: to,
                    subject: subject,
                    html: html
                })
            });
            const data = await res.json();
            console.log("Resend response:", data);
        } catch(e) { console.error("Email fail", e); }
        */
        console.log("Resend API Key found (logic commented out for test safety)");
    }
}
