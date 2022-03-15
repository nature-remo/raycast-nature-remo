/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { AirconModeType, Appliance, Cloud } from "nature-remo";
import { getPreferences } from "../lib/preferences";

export function AC({ appliance }: { appliance: Appliance }) {
  const aircon = appliance.aircon!;
  const settings = appliance.settings!;

  const currentTemp = settings.temp !== "" ? settings.temp + (settings.temp_unit === "c" ? "℃" : "°F") + " |" : "";
  const currentMode = settings.mode;

  const modes = Object.keys(aircon.range.modes) as AirconModeType[];

  async function setMode(mode: AirconModeType) {
    const conf = aircon.range.modes[mode];
    const { apiKey } = getPreferences();
    const client = new Cloud(apiKey);

    console.log("set mode", conf);
    const res = await client.updateAirconSettings(appliance.id, {
      operation_mode: mode,
    });

    console.log("res", res);
  }

  return (
    <List.Item
      title={appliance.nickname}
      subtitle={appliance.device.name}
      accessoryTitle={currentTemp + " " + currentMode}
      icon={Icon.Globe}
      actions={
        <ActionPanel>
          <ActionPanel.Submenu title="Mode">
            {modes.map((mode) => (
              <Action key={mode} title={mode} onAction={() => setMode(mode)} />
            ))}
          </ActionPanel.Submenu>
        </ActionPanel>
      }
    />
  );
}
