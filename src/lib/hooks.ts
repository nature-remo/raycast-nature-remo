import { Appliance, Cloud } from "nature-remo";
import { useQuery } from "./useQuery";
import { getPreferences } from "./preferences";

export function useAppliances() {
  const {
    state: { isLoading, results },
    perform: perform,
  } = useQuery(() => performLiveVideoSearch(), { cacheKey: "appliances", cacheMs: 5 * 60 * 1000 });

  return {
    isLoading,
    perform,
    appliances: results || [],
  };
}

async function performLiveVideoSearch(): Promise<Appliance[]> {
  const { apiKey } = getPreferences();
  const client = new Cloud(apiKey);

  return await client.getAppliances();
}
