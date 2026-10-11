import { o as __toESM } from "../_runtime.mjs";
import { Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as getArena } from "./api-BYyjfxhj.mjs";
import { o as useWallet } from "./router-B4i5X2fk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-arena-QBtM-pFN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useArena(wallet, seed) {
	const [arena, setArena] = (0, import_react.useState)(seed ?? null);
	const [error, setError] = (0, import_react.useState)(null);
	const flight = (0, import_react.useRef)(false);
	const load = (0, import_react.useCallback)(async () => {
		if (flight.current) return;
		flight.current = true;
		try {
			const data = await getArena({ data: { wallet: wallet ?? "" } });
			setArena(data);
			setError(null);
			if (data.balanceCents != null) useWallet.getState().setBalance(data.balanceCents);
		} catch (err) {
			setError(err instanceof Error ? err.message : "The desk didn't answer.");
		} finally {
			flight.current = false;
		}
	}, [wallet]);
	(0, import_react.useEffect)(() => {
		const kick = setTimeout(() => void load(), 0);
		const id = setInterval(() => void load(), 5e3);
		return () => {
			clearTimeout(kick);
			clearInterval(id);
		};
	}, [load]);
	return {
		arena,
		error,
		loading: !arena,
		reload: load
	};
}
//#endregion
export { useArena as t };
