// Admin auth + media-upload helpers.
//
// The /admin/* routes are meant to sit behind a Cloudflare Access policy
// (Zero Trust → free for up to 50 users). Access authenticates users at the
// edge and injects the `Cf-Access-Authenticated-User-Email` header. This guard
// trusts that header in production and allows everything in local dev (where
// Access is not in front of the app).

// Access protection lives in src/middleware.ts; this just surfaces the
// authenticated email (when present) for display in the admin chrome.
export function adminEmail(request: Request): string {
	return request.headers.get("Cf-Access-Authenticated-User-Email") ?? "dev@localhost";
}

const EXT: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
};

// Stores an uploaded image in R2 and returns the object key, or null if no file.
export async function uploadImage(
	bucket: R2Bucket | undefined,
	file: FormDataEntryValue | null,
	prefix: string,
): Promise<string | null> {
	if (!bucket || !(file instanceof File) || file.size === 0) return null;
	const ext = EXT[file.type];
	if (!ext) throw new Error("Unsupported image type. Use JPG, PNG, WebP, or GIF.");
	if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB.");

	const key = `${prefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
	await bucket.put(key, await file.arrayBuffer(), {
		httpMetadata: { contentType: file.type },
	});
	return key;
}

// Best-effort delete of an R2 object (e.g. when a photo is removed or replaced).
export async function deleteImage(
	bucket: R2Bucket | undefined,
	key: string | null | undefined,
): Promise<void> {
	if (bucket && key) {
		try {
			await bucket.delete(key);
		} catch {
			// Non-fatal: the DB row is the source of truth; orphan objects are harmless.
		}
	}
}

// Turns a name into a URL-friendly slug.
export function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60);
}
