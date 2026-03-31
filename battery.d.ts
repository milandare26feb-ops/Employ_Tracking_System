/**
 * TypeScript type definitions for the Battery Status API
 * https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API
 */

interface BatteryManager extends EventTarget {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null
  onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null
}

interface Navigator {
  getBattery?: () => Promise<BatteryManager>
}
