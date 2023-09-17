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

export function LIGHT({ appliance: { id, nickname, device, light } }: { appliance: Appliance }) {
  if (!light) return <List.Item title="Invalid appliance" />;

  const client = useNatureRemo();
  const isPoweredOff = useMemo(() => light.state.power === "off", [light.state.power]);

  const buttons = useMemo(() => light.buttons, [light.buttons]);

  const accessories = useMemo(
    () =>
      isPoweredOff
        ? [{ text: "Powered Off", icon: Icon.LightBulbOff }]
        : [
            {
              text: light.state.brightness,
              icon: Icon.LightBulb,
            },
          ],
    [light.state.brightness, isPoweredOff]
  );

  async function setLight(button: string) {
    await client.updateLight(id, button);

    await invalidate("appliances");
  }

  return (
    <List.Item
      title={nickname}
      subtitle={device.name}
      accessories={accessories}
      icon={Icon.LightBulb}
      actions={
        <ActionPanel>
          <ActionPanel.Submenu title="Buttons">
            {buttons.map((button) => (
              <Action
                key={button.name}
                icon={getIcon(button.image)}
                title={capitalize(button.name)}
                onAction={() => setLight(button.name)}
              />
            ))}
          </ActionPanel.Submenu>
        </ActionPanel>
      }
    />
  );
}
