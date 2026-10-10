// In-browser face finding with MediaPipe, used to pre-place privacy stickers.
// The library (~1 MB) and model are loaded on first use only.
import type { FaceDetector } from "@mediapipe/tasks-vision";

const VERSION = "0.10.14"; // keep in sync with package.json
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODEL =
	"https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

/** A face box as fractions (0–1) of the image's width and height. */
export interface FaceBox {
	x: number;
	y: number;
	w: number;
	h: number;
	score: number;
}

// How sure the model must be before we place a sticker. In testing, real faces
// scored 0.85+ and false matches (crossed arms, a flag emblem) 0.5–0.73.
// Lower it to catch more faces at the cost of more stray stickers.
const MIN_SCORE = 0.75;

let detector: Promise<FaceDetector> | null = null;

function getDetector(): Promise<FaceDetector> {
	if (!detector) {
		detector = (async () => {
			const { FaceDetector, FilesetResolver } = await import("@mediapipe/tasks-vision");
			const fileset = await FilesetResolver.forVisionTasks(WASM);
			return FaceDetector.createFromOptions(fileset, {
				baseOptions: { modelAssetPath: MODEL },
				runningMode: "IMAGE",
				minDetectionConfidence: MIN_SCORE,
			});
		})();
		// Let a later call retry if loading failed (e.g. offline).
		detector.catch(() => (detector = null));
	}
	return detector;
}

// The model looks at a small square input and is tuned for close-up faces, so
// small faces in a group photo are missed when the whole image is scanned at
// once. We scan the whole image (padded to a square, so it isn't squashed)
// plus overlapping square tiles at several zoom levels, then merge the results.
const ZOOMS = [1, 2, 3, 4, 6]; // tile side = shorter image side / zoom
const TILE_PX = 384; // the model downsamples to a small input, so more pixels don't help

export async function detectFaces(source: HTMLCanvasElement): Promise<FaceBox[]> {
	const fd = await getDetector();
	const W = source.width;
	const H = source.height;
	const tile = document.createElement("canvas");
	const ctx = tile.getContext("2d")!;
	const found: FaceBox[] = [];

	// Scan the square region (sx, sy, side) of the source and record its faces.
	const scan = (sx: number, sy: number, side: number) => {
		const px = Math.min(TILE_PX, Math.round(side));
		const scale = px / side;
		tile.width = tile.height = px;
		ctx.fillStyle = "#808080";
		ctx.fillRect(0, 0, px, px);
		ctx.drawImage(source, -sx * scale, -sy * scale, W * scale, H * scale);
		for (const d of fd.detect(tile).detections) {
			const b = d.boundingBox;
			const score = d.categories[0]?.score ?? 0;
			if (!b) continue;
			found.push({
				x: (sx + b.originX / scale) / W,
				y: (sy + b.originY / scale) / H,
				w: b.width / scale / W,
				h: b.height / scale / H,
				score,
			});
		}
	};

	// Whole image, centered in a square.
	const longSide = Math.max(W, H);
	scan((W - longSide) / 2, (H - longSide) / 2, longSide);

	for (const zoom of ZOOMS) {
		const side = Math.min(W, H) / zoom;
		// Step 3/4 of a tile so neighbours overlap and faces on a seam are seen whole.
		const cols = Math.ceil((W - side) / (side * 0.75)) + 1;
		const rows = Math.ceil((H - side) / (side * 0.75)) + 1;
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const sx = cols === 1 ? 0 : ((W - side) * c) / (cols - 1);
				const sy = rows === 1 ? 0 : ((H - side) * r) / (rows - 1);
				scan(sx, sy, side);
			}
		}
		// Let the page repaint (and the "Looking for faces…" status show) between zoom levels.
		await new Promise((res) => setTimeout(res));
	}
	return mergeBoxes(found);
}

// Drop boxes that mostly overlap a higher-scoring one (same face seen in several tiles).
function mergeBoxes(boxes: FaceBox[]): FaceBox[] {
	const kept: FaceBox[] = [];
	for (const b of boxes.sort((a, z) => z.score - a.score)) {
		if (!kept.some((k) => overlap(k, b) > 0.4)) kept.push(b);
	}
	return kept;
}

// Intersection over the smaller box's area.
function overlap(a: FaceBox, b: FaceBox): number {
	const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
	const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
	return (ix * iy) / Math.min(a.w * a.h, b.w * b.h);
}
