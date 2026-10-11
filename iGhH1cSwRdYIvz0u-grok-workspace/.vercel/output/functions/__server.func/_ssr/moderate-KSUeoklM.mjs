//#region node_modules/.nitro/vite/services/ssr/assets/moderate-KSUeoklM.js
var RULES = [
	{
		re: /\b(porn|porno|nsfw|xxx|nude|nudes|naked|hentai|onlyfans|sex\s*tape|dick\s*pic)\b/i,
		reason: "Rejected. That text is NSFW, and Pick Your Meme does not launch it. Rewrite it and try again. You were not charged."
	},
	{
		re: /\b(gore|guts|dismember\w*|mutilat\w*|corpse|behead\w*|snuff|torture)\b/i,
		reason: "Rejected. That reads as gruesome. We do not put that on a coin. Rewrite it and try again. You were not charged."
	},
	{
		re: /\b(kys|kill\s*yourself)\b/i,
		reason: "Rejected. That text is not allowed on the desk. You were not charged."
	}
];
function moderateText(parts) {
	const text = parts.join(" \n ");
	for (const rule of RULES) if (rule.re.test(text)) return {
		ok: false,
		reason: rule.reason
	};
	return { ok: true };
}
function suggestTicker(title) {
	const words = title.toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
	if (words.length >= 2) {
		const initials = words.map((w) => w[0]).join("").slice(0, 5);
		if (initials.length >= 2) return initials;
	}
	return (words.join("").slice(0, 5) || "MEME").slice(0, 6);
}
function cleanTicker(raw) {
	const t = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
	if (t.length < 2 || t.length > 6) return null;
	return t;
}
//#endregion
export { moderateText as n, suggestTicker as r, cleanTicker as t };
