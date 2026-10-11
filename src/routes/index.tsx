import { createFileRoute } from "@tanstack/react-router";
import { Desk } from "@/components/desk";
import { getArena } from "@/lib/pym/api";
import { useArena } from "@/lib/use-arena";
import { useWallet } from "@/lib/wallet-store";

export const Route = createFileRoute("/")({
  loader: () => getArena({ data: { wallet: "" } }),
  component: Home,
  head: () => ({ meta: [{ title: "Desk · Pick Your Meme" }] }),
});

function Home() {
  const seeded = Route.useLoaderData();
  const address = useWallet((s) => s.address);
  const { arena, error, reload } = useArena(address, seeded);
  const view = arena ?? seeded;
  return (
    <>
      {error ? <p className="mb-3 text-sm text-coral">{error}</p> : null}
      <Desk arena={view} wallet={address} onRefresh={() => void reload()} />
    </>
  );
}

