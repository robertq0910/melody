import { defineMiddleware } from "astro:middleware";

// Guards /admin/* routes. In production these should sit behind a Cloudflare
// Access policy, which injects `Cf-Access-Authenticated-User-Email`. We allow
// the request through when that header is present (Access vouched for it) or
// when running the local Astro dev server. Otherwise we refuse, so the admin
// is never world-readable even if the Access policy is missing.
export const onRequest = defineMiddleware((context, next) => {
	const { pathname } = context.url;
	if (pathname === "/admin" || pathname.startsWith("/admin/")) {
		const hasAccess = context.request.headers.has("Cf-Access-Authenticated-User-Email");
		if (!hasAccess && !import.meta.env.DEV) {
			return new Response(
				"Forbidden. Protect /admin/* with a Cloudflare Access policy to sign in.",
				{ status: 403, headers: { "content-type": "text/plain" } },
			);
		}
	}
	return next();
});
