import { defineMiddleware } from "astro:middleware";

// Guards /admin/* routes. Three ways in, checked in order:
//   1. Cloudflare Access — injects `Cf-Access-Authenticated-User-Email` (the
//      intended production path once /admin sits on a custom domain behind an
//      Access policy). If present, Access already vouched for the user.
//   2. Local astro dev — open, for convenience.
//   3. HTTP Basic Auth — a lightweight password gate for demo deployments on
//      `*.workers.dev`, where Cloudflare Access can't be used. Enabled only when
//      the `ADMIN_PASSWORD` secret is set; username defaults to "admin" (override
//      with `ADMIN_USER`).
// If none apply we refuse, so admin is never world-readable.
export const onRequest = defineMiddleware((context, next) => {
	const { pathname } = context.url;
	if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
		return next();
	}

	// 1. Cloudflare Access vouched for the request.
	if (context.request.headers.has("Cf-Access-Authenticated-User-Email")) {
		return next();
	}

	// 2. Local dev server is open.
	if (import.meta.env.DEV) {
		return next();
	}

	// 3. Basic Auth fallback, if a password is configured.
	const env = context.locals.runtime?.env as
		| (Env & { ADMIN_PASSWORD?: string; ADMIN_USER?: string })
		| undefined;
	const expectedPassword = env?.ADMIN_PASSWORD;
	if (expectedPassword) {
		const expectedUser = env?.ADMIN_USER || "admin";
		if (checkBasicAuth(context.request.headers.get("Authorization"), expectedUser, expectedPassword)) {
			return next();
		}
		return new Response("Authentication required.", {
			status: 401,
			headers: {
				"WWW-Authenticate": 'Basic realm="Melody Admin", charset="UTF-8"',
				"content-type": "text/plain",
			},
		});
	}

	// Nothing configured — fail closed.
	return new Response(
		"Forbidden. Protect /admin/* with a Cloudflare Access policy or set the ADMIN_PASSWORD secret to sign in.",
		{ status: 403, headers: { "content-type": "text/plain" } },
	);
});

// Validates a `Basic <base64(user:pass)>` Authorization header against the
// expected credentials using a length-safe, constant-time-ish comparison.
function checkBasicAuth(header: string | null, expectedUser: string, expectedPassword: string): boolean {
	if (!header || !header.startsWith("Basic ")) {
		return false;
	}
	let decoded: string;
	try {
		decoded = atob(header.slice(6).trim());
	} catch {
		return false;
	}
	const sep = decoded.indexOf(":");
	if (sep === -1) {
		return false;
	}
	const user = decoded.slice(0, sep);
	const password = decoded.slice(sep + 1);
	// Compare both fields without short-circuiting on the first mismatch.
	return safeEqual(user, expectedUser) && safeEqual(password, expectedPassword);
}

function safeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}
	let mismatch = 0;
	for (let i = 0; i < a.length; i++) {
		mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return mismatch === 0;
}
