// Build the public URL for an R2-stored image key, or a fallback placeholder.
export function mediaUrl(key: string | null | undefined, fallback = "/blog-placeholder-1.jpg"): string {
	if (!key) return fallback;
	return `/media/${key}`;
}
