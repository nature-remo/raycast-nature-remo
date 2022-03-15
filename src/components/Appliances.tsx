import { List } from "@raycast/api";
import { Appliance } from "nature-remo";
import { useAppliances } from "../lib/hooks";
import { AC } from "./Aircon";
import { IR } from "./Signals";

export function Appliances() {
  const { isLoading, appliances } = useAppliances();

  return (
    <List isLoading={isLoading}>
      <List.Section title="Results" subtitle={String(appliances.length)}>
        {appliances.map((app) => (
          <Item key={app.id} appliance={app} />
        ))}
      </List.Section>
    </List>
  );
}

function Item({ appliance }: { appliance: Appliance }) {
  switch (appliance.type) {
    case "AC":
      return <AC appliance={appliance} />;
      break;
    case "IR":
      return <IR appliance={appliance} />;
      break;
    default:
      console.log(`Unrecognized appliance type: ${appliance.type}`);

      return <IR appliance={appliance} />;
  }
}
