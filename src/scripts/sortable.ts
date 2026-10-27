// Drag-to-reorder for admin lists (gallery photos, performers, a performance's line-up).
// Uses pointer events rather than HTML5 drag and drop so it works with touch too.
// Drags start from a handle (any pointer) or, optionally, from another part of the
// item with a mouse only — so on phones the rest of the page still scrolls normally.
// Focusing a handle and pressing the arrow keys moves the item one place.

interface SortableOptions {
	/** Selects the reorderable children of the container. */
	items: string;
	/** Selects the drag handle inside an item. Give it `touch-action: none`. */
	handle: string;
	/** Optional extra drag area inside an item, mouse only (e.g. a photo). */
	mouseArea?: string;
	/** Called after the order has changed (once per drag or key press). */
	onChange: (items: HTMLElement[]) => void;
}

export function makeSortable(container: HTMLElement, opts: SortableOptions) {
	let dragged: HTMLElement | null = null;
	let startOrder: HTMLElement[] = [];

	const items = () => [...container.querySelectorAll<HTMLElement>(opts.items)];
	const changed = () => {
		const now = items();
		if (now.some((el, i) => el !== startOrder[i])) opts.onChange(now);
	};

	container.addEventListener("pointerdown", (e) => {
		const target = e.target as HTMLElement;
		const onHandle = target.closest(opts.handle);
		const onArea = opts.mouseArea && target.closest(opts.mouseArea) && e.pointerType === "mouse";
		if (!(onHandle || onArea) || e.button !== 0) return;
		dragged = target.closest<HTMLElement>(opts.items);
		if (!dragged) return;
		e.preventDefault();
		startOrder = items();
		dragged.classList.add("dragging");
		container.setPointerCapture(e.pointerId);
	});

	container.addEventListener("pointermove", (e) => {
		if (!dragged) return;
		const over = items().find((el) => {
			if (el === dragged) return false;
			const r = el.getBoundingClientRect();
			return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
		});
		if (!over) return;
		// Moving forward → land after the hovered item; moving back → before it.
		const all = items();
		const after = all.indexOf(over) > all.indexOf(dragged);
		over.insertAdjacentElement(after ? "afterend" : "beforebegin", dragged);
	});

	const endDrag = () => {
		if (!dragged) return;
		dragged.classList.remove("dragging");
		dragged = null;
		changed();
	};
	container.addEventListener("pointerup", endDrag);
	container.addEventListener("pointercancel", endDrag);

	container.addEventListener("keydown", (e) => {
		const handle = (e.target as HTMLElement).closest<HTMLElement>(opts.handle);
		if (!handle) return;
		const item = handle.closest<HTMLElement>(opts.items)!;
		startOrder = items();
		if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			item.previousElementSibling?.insertAdjacentElement("beforebegin", item);
		} else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			item.nextElementSibling?.insertAdjacentElement("afterend", item);
		} else {
			return;
		}
		e.preventDefault();
		handle.focus();
		changed();
	});
}

/** POSTs `action` + comma-separated `order` to the current page, reporting progress in `status`. */
export async function saveOrder(action: string, ids: string[], status: HTMLElement | null) {
	if (status) status.textContent = "Saving…";
	try {
		const body = new FormData();
		body.set("action", action);
		body.set("order", ids.join(","));
		const res = await fetch(location.pathname, { method: "POST", body });
		if (!res.ok) throw new Error(String(res.status));
		if (status) status.textContent = "Order saved.";
	} catch {
		if (status) status.textContent = "Couldn't save the order — reload and try again.";
	}
}
