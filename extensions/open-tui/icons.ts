export type IconMode = "auto" | "nerd" | "ascii";

export interface IconGlyphs {
	cwd: string;
	session: string;
	git: string;
	working: string;
	done: string;
	context: string;
	model: string;
	thinking: string;
	input: string;
	output: string;
	cacheHit: string;
	cost: string;
	speed: string;
	latency: string;
	stall: string;
	extensions: string;
	ahead: string;
	behind: string;
	diverged: string;
	conflicted: string;
	stashed: string;
	modified: string;
	staged: string;
	untracked: string;
	renamed: string;
	deleted: string;
}

const NERD_GLYPHS: IconGlyphs = {
	cwd: "\uF07C", // nf-fa-folder
	session: "\uF02B", // nf-fa-tag
	git: "\uF418", // nf-oct-git_branch
	working: "\uF017", // nf-fa-clock_o
	done: "\uF00C", // nf-fa-check
	context: "\uF0C9", // nf-fa-bars
	model: "\uF121", // nf-fa-code
	thinking: "\uF0EB", // nf-fa-lightbulb_o
	// client network view: input = upload to API, output = download from API
	input: "\uF093", // nf-fa-upload
	output: "\uF019", // nf-fa-download
	cacheHit: "\uF1C0", // nf-fa-database
	cost: "\uF155", // nf-fa-usd
	speed: "\u{F04C5}", // nf-md-speedometer
	latency: "\uF252", // nf-fa-hourglass_half
	stall: "\uF071", // nf-fa-warning
	extensions: "\uF1E6", // nf-fa-plug
	ahead: "\uF062", // nf-fa-arrow_up
	behind: "\uF063", // nf-fa-arrow_down
	diverged: "\uF0DC", // nf-fa-sort
	conflicted: "\uF419", // nf-oct-git_merge
	stashed: "\uF01C", // nf-fa-inbox
	modified: "\uF040", // nf-fa-pencil
	staged: "\uF067", // nf-fa-plus
	untracked: "\uF128", // nf-fa-question
	renamed: "\uF064", // nf-fa-share
	deleted: "\uF068", // nf-fa-minus
};

// ponytail: ASCII fallback uses compact symbols (not English words) to keep
// the footer's icon-like feel on non-Nerd-Font terminals. Symbols chosen to
// avoid collisions with the git-status set {= S ! A ? r x ^ v}.
const ASCII_GLYPHS: IconGlyphs = {
	cwd: "@",
	session: "s",
	git: "*",
	working: "o",
	done: "+",
	context: "#",
	model: "M",
	thinking: "~",
	input: "↑",
	output: "↓",
	cacheHit: "c",
	cost: "$",
	speed: ">",
	latency: "~",
	stall: "!",
	extensions: "&",
	ahead: "^",
	behind: "v",
	diverged: "^v",
	conflicted: "=",
	stashed: "S",
	modified: "!",
	staged: "A",
	untracked: "?",
	renamed: "r",
	deleted: "x",
};

const NERD_FONT_TERMINALS = new Set([
	"iTerm.app",
	"Ghostty",
	"ghostty",
	"WezTerm",
	"kitty",
	"rio",
	"tabby",
	"Tabby",
	"WindowsTerminal",
	"vscode",
	"WarpTerminal",
	"Hyper",
	"Alacritty",
	"alacritty",
	"Terminus",
	"mintty",
]);

const NERD_FONT_TERMS = new Set([
	"xterm-kitty",
	"xterm-ghostty",
	"wezterm",
	"alacritty",
	"rio",
	"foot",
]);

export function detectNerdFont(): boolean {
	const termProgram = process.env.TERM_PROGRAM;
	if (termProgram && NERD_FONT_TERMINALS.has(termProgram)) return true;

	const lcTerminal = process.env.LC_TERMINAL;
	if (lcTerminal && NERD_FONT_TERMINALS.has(lcTerminal)) return true;

	const term = process.env.TERM;
	if (term && (NERD_FONT_TERMS.has(term) || term.startsWith("foot-"))) return true;

	// Terminal-specific env vars set even when TERM_PROGRAM is missing
	// (Windows Terminal, Kitty, WezTerm, Ghostty, Alacritty, iTerm2).
	return Boolean(
		process.env.WT_SESSION ||
			process.env.KITTY_WINDOW_ID ||
			process.env.WEZTERM_EXECUTABLE ||
			process.env.WEZTERM_PANE ||
			process.env.GHOSTTY_RESOURCES_DIR ||
			process.env.ALACRITTY_SOCKET ||
			process.env.ITERM_SESSION_ID,
	);
}

export function resolveIconMode(mode: IconMode): "nerd" | "ascii" {
	if (mode === "nerd") return "nerd";
	if (mode === "ascii") return "ascii";
	return detectNerdFont() ? "nerd" : "ascii";
}

export function resolveGlyphs(mode: IconMode): IconGlyphs {
	const resolved = resolveIconMode(mode);
	return resolved === "nerd" ? NERD_GLYPHS : ASCII_GLYPHS;
}

const RUNTIME_SYMBOLS: Record<string, string> = {
	nodejs: "\uE718",
	rust: "\uE7A8",
	go: "\uE626",
	python: "\uE73C",
	ruby: "\uE739",
	java: "\uE256",
	cpp: "\uE61D",
	c: "\uE61E",
	swift: "\uE755",
	kotlin: "\uE634",
	deno: "\uE7FB",
	bun: "\uE76F", // nf-seti-bun
	php: "\uE73D",
	haskell: "\uE777",
	julia: "\uE624",
	lua: "\uE620",
	elixir: "\uE62B",
	erlang: "\uE7B1",
	gleam: "\uE6B4",
	crystal: "\uE62F",
	dart: "\uE7C0",
	nim: "\uE677",
	zig: "\uE6A9",
	ocaml: "\uE67A",
	clojure: "\uE76A",
	scala: "\uE747",
	perl: "\uE769",
	r: "\uE68A",
	elm: "\uE62C",
	haxe: "\uE7B7",
	vagrant: "\uE21A",
	terraform: "\uE1A5",
};

const RUNTIME_ASCII_SYMBOLS: Record<string, string> = {
	nodejs: "node",
	rust: "rs",
	go: "go",
	python: "py",
	ruby: "rb",
	java: "java",
	swift: "swift",
	kotlin: "kt",
	cpp: "c++",
	c: "c",
	deno: "deno",
	bun: "bun",
	php: "php",
	haskell: "hs",
	julia: "jl",
	lua: "lua",
	elixir: "ex",
	erlang: "erl",
	gleam: "gleam",
	crystal: "cr",
	dart: "dart",
	nim: "nim",
	zig: "zig",
	ocaml: "ml",
	clojure: "clj",
	scala: "scala",
	perl: "pl",
	r: "R",
	elm: "elm",
	haxe: "hx",
	vagrant: "vag",
	terraform: "tf",
};

export function runtimeSymbol(name: string, mode: IconMode): string {
	if (resolveIconMode(mode) === "ascii") return RUNTIME_ASCII_SYMBOLS[name] ?? name;
	return RUNTIME_SYMBOLS[name] ?? "\uF120"; // nf-fa-terminal
}
