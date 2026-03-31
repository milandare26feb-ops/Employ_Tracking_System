/**
 * TypeScript type definitions for the Battery Status API
 * https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API
 */

interface BatteryManager extends EventTarget {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null
  onchargingtimechange: ((this: BatteryManager, ev: Event) => void) | null
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => void) | null
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null
}

interface Navigator {
  getBattery?: () => Promise<BatteryManager>
}
