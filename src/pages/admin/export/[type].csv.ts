import type { APIRoute } from "astro";
import { getDb } from "../../../lib/db";

export const prerender = false;

// Column order per export type. Each maps to a DB column.
const EXPORTS: Record<string, { table: string; columns: string[] }> = {
	hosting: {
		table: "hosting_requests",
		columns: [
			"id",
			"created_at",
			"org_name",
			"contact_name",
			"email",
			"phone",
			"location",
			"preferred_date",
			"message",
			"status",
		],
	},
	volunteer: {
		table: "volunteer_applications",
		columns: [
			"id",
			"created_at",
			"name",
			"email",
			"phone",
			"age",
			"instrument",
			"experience",
			"message",
			"status",
		],
	},
	contact: {
		table: "contact_messages",
		columns: ["id", "created_at", "name", "email", "subject", "message", "status"],
	},
};

function csvCell(value: unknown): string {
	const s = value === null || value === undefined ? "" : String(value);
	// Quote when the value contains a comma, quote, or newline; escape quotes.
	if (/[",\n\r]/.test(s)) {
		return `"${s.replace(/"/g, '""')}"`;
	}
	return s;
}

export const GET: APIRoute = async ({ params, locals }) => {
	const config = params.type ? EXPORTS[params.type] : undefined;
	if (!config) {
		return new Response("Unknown export type", { status: 404 });
	}

	const db = getDb(locals);
	const { results } = await db
		.prepare(`SELECT ${config.columns.join(", ")} FROM ${config.table} ORDER BY created_at DESC`)
		.all<Record<string, unknown>>();

	const header = config.columns.join(",");
	const rows = (results ?? []).map((row) =>
		config.columns.map((col) => csvCell(row[col])).join(","),
	);
	// Prepend a UTF-8 BOM so Excel opens it with correct encoding.
	const csv = "﻿" + [header, ...rows].join("\r\n") + "\r\n";

	const date = new Date().toISOString().slice(0, 10);
	return new Response(csv, {
		headers: {
			"content-type": "text/csv; charset=utf-8",
			"content-disposition": `attachment; filename="${params.type}-${date}.csv"`,
		},
	});
};
