import { z } from 'zod';

export const WEATHER_CONDITION_TYPES = [
  'clear',
  'partly_cloudy',
  'overcast',
  'light_rain',
  'heavy_rain',
  'storm',
  'snow',
  'fog',
] as const;
export type WeatherConditionType = (typeof WEATHER_CONDITION_TYPES)[number];

const WeatherConditionTypeEnum = z.enum(WEATHER_CONDITION_TYPES);

export const WeatherConditionSchema = z.object({
  type: WeatherConditionTypeEnum,
  label: z.string(),
  description: z.string(),
});
export type WeatherCondition = z.infer<typeof WeatherConditionSchema>;

export const WeatherTemperatureSchema = z.object({
  minC: z.number(),
  maxC: z.number(),
});
export type WeatherTemperature = z.infer<typeof WeatherTemperatureSchema>;

export const WeatherDaySchema = z.object({
  condition: WeatherConditionSchema,
  temperature: WeatherTemperatureSchema,
  precipitationChance: z.number().min(0).max(1),
  humidity: z.number().min(0).max(1),
  windLevel: z.number().min(0),
  narrative: z.string(),
});
export type WeatherDay = z.infer<typeof WeatherDaySchema>;

export const WeatherRuntimeSchema = z.object({
  generatedAtISO: z.string(),
  anchorDayISO: z.string(),
  days: z.array(WeatherDaySchema).min(1),
});
export type WeatherRuntime = z.infer<typeof WeatherRuntimeSchema>;
