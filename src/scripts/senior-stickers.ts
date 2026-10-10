// Cartoon senior faces used to cover residents' faces in photos (privacy policy).
// Each is a 100x100 SVG with an opaque round badge (r=48) so it fully hides
// whatever is underneath, at any size.

const BADGE = (fill: string) =>
	`<circle cx="50" cy="50" r="47" fill="${fill}" stroke="#fff" stroke-width="4"/>`;

const svg = (body: string) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`;

const INK = "#2b2238";

export const STICKERS: { name: string; svg: string }[] = [
	{
		name: "Grandma with glasses",
		svg: svg(`${BADGE("#ede9fe")}
			<circle cx="50" cy="17" r="11" fill="#d6d3e0"/>
			<ellipse cx="50" cy="42" rx="33" ry="24" fill="#d6d3e0"/>
			<ellipse cx="50" cy="57" rx="27" ry="29" fill="#f6d2b8"/>
			<path d="M23 52 Q24 30 50 30 Q76 30 77 52 Q70 39 50 39 Q30 39 23 52Z" fill="#d6d3e0"/>
			<circle cx="40" cy="56" r="7" fill="#fff" fill-opacity=".5" stroke="#5b4a6e" stroke-width="2.5"/>
			<circle cx="60" cy="56" r="7" fill="#fff" fill-opacity=".5" stroke="#5b4a6e" stroke-width="2.5"/>
			<path d="M47 56h6" stroke="#5b4a6e" stroke-width="2.5"/>
			<circle cx="40" cy="56" r="2.2" fill="${INK}"/>
			<circle cx="60" cy="56" r="2.2" fill="${INK}"/>
			<circle cx="32" cy="68" r="4.5" fill="#f4a6b8" opacity=".75"/>
			<circle cx="68" cy="68" r="4.5" fill="#f4a6b8" opacity=".75"/>
			<path d="M42 71 Q50 78 58 71" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`),
	},
	{
		name: "Grandpa with mustache",
		svg: svg(`${BADGE("#fce7f3")}
			<ellipse cx="22" cy="56" rx="7" ry="9" fill="#e8b892"/>
			<ellipse cx="78" cy="56" rx="7" ry="9" fill="#e8b892"/>
			<ellipse cx="50" cy="54" rx="28" ry="32" fill="#e8b892"/>
			<ellipse cx="41" cy="30" rx="7" ry="3" fill="#fff" opacity=".35"/>
			<ellipse cx="25" cy="45" rx="6" ry="11" fill="#eceef2"/>
			<ellipse cx="75" cy="45" rx="6" ry="11" fill="#eceef2"/>
			<path d="M33 43 Q39 38 46 42 M54 42 Q61 38 67 43" fill="none" stroke="#eceef2" stroke-width="4" stroke-linecap="round"/>
			<circle cx="40" cy="52" r="7" fill="#fff" fill-opacity=".5" stroke="#4b3a2a" stroke-width="2.5"/>
			<circle cx="60" cy="52" r="7" fill="#fff" fill-opacity=".5" stroke="#4b3a2a" stroke-width="2.5"/>
			<path d="M47 52h6" stroke="#4b3a2a" stroke-width="2.5"/>
			<circle cx="40" cy="52" r="2.2" fill="${INK}"/>
			<circle cx="60" cy="52" r="2.2" fill="${INK}"/>
			<ellipse cx="50" cy="62" rx="4.5" ry="5.5" fill="#d99c74"/>
			<path d="M35 71 Q42 64 50 68 Q58 64 65 71 Q57 76 50 72 Q43 76 35 71Z" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1"/>
			<path d="M44 78 Q50 82 56 78" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`),
	},
	{
		name: "Grandma with curls",
		svg: svg(`${BADGE("#e0f2fe")}
			<g fill="#e5e7eb">
				<circle cx="27" cy="40" r="10"/><circle cx="36" cy="28" r="10"/><circle cx="50" cy="23" r="11"/>
				<circle cx="64" cy="28" r="10"/><circle cx="73" cy="40" r="10"/>
				<circle cx="24" cy="54" r="8"/><circle cx="76" cy="54" r="8"/>
			</g>
			<ellipse cx="50" cy="58" rx="25" ry="27" fill="#a86b4c"/>
			<path d="M28 48 Q34 36 50 37 Q66 36 72 48 Q62 42 50 43 Q38 42 28 48Z" fill="#e5e7eb"/>
			<path d="M35 57 Q40 52 45 57 M55 57 Q60 52 65 57" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
			<circle cx="34" cy="68" r="4.5" fill="#e57f95" opacity=".6"/>
			<circle cx="66" cy="68" r="4.5" fill="#e57f95" opacity=".6"/>
			<path d="M42 71 Q50 79 58 71" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
			<circle cx="25" cy="68" r="3" fill="#fff" stroke="#c9c3d6"/>
			<circle cx="75" cy="68" r="3" fill="#fff" stroke="#c9c3d6"/>`),
	},
	{
		name: "Grandpa with beard",
		svg: svg(`${BADGE("#dcfce7")}
			<ellipse cx="50" cy="54" rx="27" ry="30" fill="#c58c64"/>
			<path d="M22 52 Q19 21 50 19 Q81 21 78 52 Q72 32 50 32 Q28 32 22 52Z" fill="#9ca3af"/>
			<path d="M23 56 Q24 92 50 92 Q76 92 77 56 Q70 75 50 75 Q30 75 23 56Z" fill="#e5e7eb"/>
			<path d="M34 45 Q40 41 45 45 M55 45 Q60 41 66 45" fill="none" stroke="#e5e7eb" stroke-width="4" stroke-linecap="round"/>
			<circle cx="40" cy="53" r="2.8" fill="${INK}"/>
			<circle cx="60" cy="53" r="2.8" fill="${INK}"/>
			<ellipse cx="50" cy="62" rx="4.5" ry="5" fill="#a96f4a"/>
			<path d="M38 71 Q44 66 50 69 Q56 66 62 71 Q56 74 50 72 Q44 74 38 71Z" fill="#f3f4f6"/>
			<path d="M45 77 Q50 80 55 77" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`),
	},
];

export function stickerUrl(index: number): string {
	return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(STICKERS[index].svg);
}

const cache = new Map<number, Promise<HTMLImageElement>>();

// Decoded sticker image, for drawing onto a canvas.
export function loadSticker(index: number): Promise<HTMLImageElement> {
	let p = cache.get(index);
	if (!p) {
		const el = new Image();
		el.src = stickerUrl(index);
		p = el.decode().then(() => el);
		cache.set(index, p);
	}
	return p;
}
