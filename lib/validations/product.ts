import { z } from "zod";

export const productUnits = [
  "styck",
  "timmar",
  "dagar",
  "manader",
  "kilogram",
  "gram",
  "liter",
  "meter",
  "centimeter",
  "millimeter",
  "m2",
  "m3",
  "mil",
  "kilometer",
  "ha",
  "ton",
  "ord",
  "ar",
  "veckor",
  "minuter",
  "MB",
  "GB",
] as const;

export const productTypes = ["V", "T"] as const;

// Margin scheme types for used goods taxation (vinstmarginalbeskattning)
export const marginSchemeTypes = [
  "used_goods",       // Begagnade varor
  "artwork",          // Konstverk
  "antiques",         // Antikviteter
  "collectors_items", // Samlarföremål
] as const;

export type MarginSchemeType = (typeof marginSchemeTypes)[number];

// Labels for margin scheme types
export const marginSchemeTypeLabels: Record<MarginSchemeType, string> = {
  used_goods: "Begagnade varor",
  artwork: "Konstverk",
  antiques: "Antikviteter",
  collectors_items: "Samlarföremål",
};

// Display labels for units (Swedish)
export const unitLabels: Record<(typeof productUnits)[number], string> = {
  styck: "st",
  timmar: "tim",
  dagar: "dagar",
  manader: "mån",
  kilogram: "kg",
  gram: "g",
  liter: "l",
  meter: "m",
  centimeter: "cm",
  millimeter: "mm",
  m2: "m²",
  m3: "m³",
  mil: "mil",
  kilometer: "km",
  ha: "ha",
  ton: "ton",
  ord: "ord",
  ar: "år",
  veckor: "v",
  minuter: "min",
  MB: "MB",
  GB: "GB",
};

// Full unit names (for dropdowns)
export const unitFullNames: Record<(typeof productUnits)[number], string> = {
  styck: "Styck",
  timmar: "Timmar",
  dagar: "Dagar",
  manader: "Månader",
  kilogram: "Kilogram",
  gram: "Gram",
  liter: "Liter",
  meter: "Meter",
  centimeter: "Centimeter",
  millimeter: "Millimeter",
  m2: "Kvadratmeter (m²)",
  m3: "Kubikmeter (m³)",
  mil: "Mil",
  kilometer: "Kilometer",
  ha: "Hektar",
  ton: "Ton",
  ord: "Ord",
  ar: "År",
  veckor: "Veckor",
  minuter: "Minuter",
  MB: "Megabyte",
  GB: "Gigabyte",
};

// Product type labels
export const productTypeLabels: Record<(typeof productTypes)[number], string> = {
  V: "Varor",
  T: "Tjänster",
};

export const createProductSchema = z.object({
  name: z.string().min(1, "Beskrivning krävs").max(200, "Max 200 tecken"),
  description: z.string().max(500).optional(),
  defaultQuantity: z.number().min(0.01, "Antal måste vara minst 0.01").default(1),
  unit: z.enum(productUnits).default("styck"),
  unitPrice: z.number().min(0, "Pris måste vara minst 0"),
  vatRate: z
    .number()
    .refine((v) => [0, 6, 12, 25].includes(v), "Ogiltig momssats"),
  type: z.enum(productTypes).default("T"),
  marginSchemeType: z.enum(marginSchemeTypes).optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductUnit = (typeof productUnits)[number];
export type ProductType = (typeof productTypes)[number];
