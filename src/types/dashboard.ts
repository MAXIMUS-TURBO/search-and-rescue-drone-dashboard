// types/dashboard.ts
//
// Shared TypeScript types for the STRIX dashboard.

export type Waypoint = {
  latitude: number
  longitude: number
  altitude?: number
}

export type Target = {
  latitude: number
  longitude: number
  altitude_m: number
}

export type DashboardState = {
  drone: {
    latitude: number | null
    longitude: number | null
    altitude_m: number | null
    speed_mps: number | null
    heading_deg: number | null
    battery_percent: number | null
    battery_voltage: number | null
  }

  mission: {
    state: string
    detail: string
    route_received?: boolean
    target_detected?: boolean
  }

  route: {
    waypoints: Waypoint[]
  }

  targets: Target[]
}