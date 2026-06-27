import type { APIRoute } from "astro";

export const prerender = false;

// Serves images stored in the R2 `MEDIA` bucket at /media/<key>.
export const GET: APIRoute = async ({ params, locals }) => {
	const key = params.key;
	const bucket = locals.runtime?.env?.MEDIA;
	if (!key || !bucket) {
		return new Response("Not found", { status: 404 });
	}

	const object = await bucket.get(key);
	if (!object) {
		return new Response("Not found", { status: 404 });
	}

	// Buffer the body and read metadata via plain properties. We deliberately avoid
	// `object.writeHttpMetadata(headers)` and streaming `object.body`: passing a
	// Headers object / ReadableStream across the `astro dev` platformProxy boundary
	// throws "Cannot stringify arbitrary non-POJOs". Images are small, so buffering
	// is fine, and this path works identically in dev and production.
	const body = await object.arrayBuffer();
	return new Response(body, {
		headers: {
			"content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
			etag: object.httpEtag,
			// Media is immutable once uploaded under a unique key; cache aggressively.
			"cache-control": "public, max-age=31536000, immutable",
		},
	});
};
