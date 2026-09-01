import assert from "node:assert/strict";
import test from "node:test";
import {
	detectNerdFont,
	resolveGlyphs,
	resolveIconMode,
	runtimeSymbol,
	type IconGlyphs,
} from "../extensions/open-tui/icons.ts";

const GLYPH_KEYS = [
	"cwd",
	"session",
	"git",
	"working",
	"done",
	"context",
	"model",
	"thinking",
	"input",
	"output",
	"cache",
	"cacheHit",
	"cost",
	"speed",
	"latency",
	"stall",
	"extensions",
	"ahead",
	"behind",
	"diverged",
	"conflicted",
	"stashed",
	"modified",
	"staged",
	"untracked",
	"renamed",
	"deleted",
] as const satisfies readonly (keyof IconGlyphs)[];

function isNerdFontCodePoint(codePoint: number): boolean {
	return (
		(codePoint >= 0xe000 && codePoint <= 0xf8ff) ||
		(codePoint >= 0xf0000 && codePoint <= 0xffffd)
	);
}

test("both icon modes provide every semantic glyph", () => {
	for (const mode of ["nerd", "ascii"] as const) {
		const glyphs = resolveGlyphs(mode);
		for (const key of GLYPH_KEYS) {
			assert.notEqual(glyphs[key], "", `${mode}.${key}`);
		}
	}
});

test("nerd glyphs use Private Use Area code points", () => {
	const glyphs = resolveGlyphs("nerd");
	for (const key of GLYPH_KEYS) {
		const glyph = glyphs[key];
		const chars = [...glyph];
		assert.equal(chars.length, 1, `nerd.${key} should be a single glyph`);
		const codePoint = chars[0]!.codePointAt(0);
		assert.ok(codePoint !== undefined, `nerd.${key} is empty`);
		assert.ok(
			isNerdFontCodePoint(codePoint),
			`nerd.${key} ${glyph} U+${codePoint.toString(16).toUpperCase()} is not a Nerd Font PUA glyph`,
		);
	}
});

test("nerd and ascii glyphs stay distinct per semantic", () => {
	const nerd = resolveGlyphs("nerd");
	const ascii = resolveGlyphs("ascii");
	for (const key of GLYPH_KEYS) {
		assert.notEqual(nerd[key], ascii[key], `${key} should differ across icon modes`);
	}
});

test("nerd glyphs are unique so footer icons do not collide", () => {
	const nerd = resolveGlyphs("nerd");
	const seen = new Map<string, string>();
	for (const key of GLYPH_KEYS) {
		const glyph = nerd[key];
		const previous = seen.get(glyph);
		assert.equal(previous, undefined, `nerd.${key} reuses nerd.${previous} (${glyph})`);
		seen.set(glyph, key);
	}
});

test("runtime symbols use Nerd Font logos in nerd mode", () => {
	assert.equal(runtimeSymbol("bun", "nerd"), "\uE76F");
	assert.equal(runtimeSymbol("nodejs", "nerd"), "\uE718");
	assert.equal(runtimeSymbol("bun", "ascii"), "bun");
	assert.equal(runtimeSymbol("unknown-runtime", "nerd"), "\uF120");
	assert.equal(runtimeSymbol("unknown-runtime", "ascii"), "unknown-runtime");
});

test("auto mode follows terminal detection", () => {
	const original = {
		TERM_PROGRAM: process.env.TERM_PROGRAM,
		LC_TERMINAL: process.env.LC_TERMINAL,
		TERM: process.env.TERM,
		WT_SESSION: process.env.WT_SESSION,
		KITTY_WINDOW_ID: process.env.KITTY_WINDOW_ID,
		WEZTERM_EXECUTABLE: process.env.WEZTERM_EXECUTABLE,
		WEZTERM_PANE: process.env.WEZTERM_PANE,
		GHOSTTY_RESOURCES_DIR: process.env.GHOSTTY_RESOURCES_DIR,
		ALACRITTY_SOCKET: process.env.ALACRITTY_SOCKET,
		ITERM_SESSION_ID: process.env.ITERM_SESSION_ID,
	};

	const clearDetectEnv = () => {
		for (const key of Object.keys(original)) delete process.env[key];
	};

	try {
		clearDetectEnv();
		assert.equal(detectNerdFont(), false);
		assert.equal(resolveIconMode("auto"), "ascii");
		assert.equal(resolveIconMode("nerd"), "nerd");
		assert.equal(resolveIconMode("ascii"), "ascii");

		clearDetectEnv();
		process.env.TERM_PROGRAM = "WarpTerminal";
		assert.equal(detectNerdFont(), true);

		clearDetectEnv();
		process.env.TERM = "alacritty";
		assert.equal(detectNerdFont(), true);

		clearDetectEnv();
		process.env.TERM = "foot-extra";
		assert.equal(detectNerdFont(), true);

		clearDetectEnv();
		process.env.WT_SESSION = "wt-1";
		assert.equal(detectNerdFont(), true);

		clearDetectEnv();
		process.env.TERM = "xterm-256color";
		assert.equal(detectNerdFont(), false);
	} finally {
		clearDetectEnv();
		for (const [key, value] of Object.entries(original)) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
	}
});
