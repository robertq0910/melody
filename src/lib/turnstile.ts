// Server-side verification of a Cloudflare Turnstile token.
// The public site key is rendered into the form; the secret key verifies here.

export async function verifyTurnstile(
	token: string | null,
	secret: string | undefined,
	remoteIp?: string | null,
): Promise<boolean> {
	if (!token) return false;
	if (!secret) {
		// No secret configured: fail closed in production, but allow local dev
		// where a secret may be intentionally absent.
		return import.meta.env.DEV;
	}

	const body = new FormData();
	body.append("secret", secret);
	body.append("response", token);
	if (remoteIp) body.append("remoteip", remoteIp);

	try {
		const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			body,
		});
		const data = (await res.json()) as { success: boolean };
		return data.success === true;
	} catch {
		return false;
	}
}
