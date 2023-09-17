import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { Appliance, Cloud } from "nature-remo";
import { useMemo } from "react";
import { getIcon } from "../lib/icon";
import { getPreferences } from "../lib/preferences";
import { invalidate } from "../lib/useCache";
import { capitalize } from "../lib/utils";

function useNatureRemo() {
  const { apiKey } = getPreferences();
  const client = useMemo<Cloud>(() => new Cloud(apiKey), [apiKey]);

  return client;
}

export function TV({ appliance: { id, nickname, device, tv } }: { appliance: Appliance }) {
  if (!tv) return <List.Item title="Invalid appliance" />;

  const client = useNatureRemo();

  const buttons = useMemo(() => tv.buttons, [tv.buttons]);

  const accessories = useMemo(
    () => [
      {
        text: tv.state.input,
        icon: Icon.Monitor,
      },
    ],
    [tv.state.input]
  );

  async function setTV(button: string) {
    await client.updateTV(id, button);

    await invalidate("appliances");
  }

  return (
    <List.Item
      title={nickname}
      subtitle={device.name}
      accessories={accessories}
      icon={Icon.Monitor}
      actions={
        <ActionPanel>
          <ActionPanel.Submenu title="Buttons">
            {buttons.map((button) => (
              <Action
                key={button.name}
                icon={getIcon(button.image)}
                title={capitalize(button.name)}
                onAction={() => setTV(button.name)}
              />
            ))}
          </ActionPanel.Submenu>
        </ActionPanel>
      }
    />
  );
}
