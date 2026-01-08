import { z } from "zod";
import { deliveryMethods } from "./invoice";

// Country codes for EU countries (ISO 3166-1 alpha-2)
export const countryCodes = [
  "SE", // Sweden
  "NO", // Norway
  "DK", // Denmark
  "FI", // Finland
  "DE", // Germany
  "FR", // France
  "NL", // Netherlands
  "BE", // Belgium
  "AT", // Austria
  "ES", // Spain
  "IT", // Italy
  "PT", // Portugal
  "PL", // Poland
  "CZ", // Czech Republic
  "GB", // United Kingdom
  "IE", // Ireland
  "CH", // Switzerland
  "LU", // Luxembourg
  "EE", // Estonia
  "LV", // Latvia
  "LT", // Lithuania
] as const;

export type CountryCode = (typeof countryCodes)[number];

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Namn krävs").max(100, "Max 100 tecken"),
  orgNumber: z.string().max(20).optional(),
  email: z.string().email("Ogiltig e-post").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  postalCode: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  // VAT/B2B fields
  vatNumber: z.string().max(20).optional().nullable(),
  countryCode: z.enum(countryCodes).optional().nullable(),
  // ROT/RUT fields
  personalNumber: z
    .string()
    .max(13)
    .regex(/^(\d{8}-?\d{4})?$/, "Personnummer måste vara i format YYYYMMDD-XXXX")
    .optional()
    .nullable()
    .or(z.literal("")),
  propertyDesignation: z.string().max(100).optional().nullable(),
  apartmentNumber: z.string().max(20).optional().nullable(),
  housingAssociationOrgNumber: z.string().max(20).optional().nullable(),
  // Delivery preferences
  preferredDeliveryMethod: z.enum(deliveryMethods).optional().nullable(),
  einvoiceAddress: z.string().max(100).optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.extend({
  id: z.string(),
});

// Schema for updating only delivery preferences
export const updateCustomerDeliverySchema = z.object({
  id: z.string(),
  preferredDeliveryMethod: z.enum(deliveryMethods).optional().nullable(),
  einvoiceAddress: z.string().max(100).optional().nullable(),
});

// Customer contact schemas
export const customerContactSchema = z.object({
  id: z.string().optional(), // Optional for new contacts
  name: z.string().min(1, "Namn krävs").max(100, "Max 100 tecken"),
  role: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email("Ogiltig e-post").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  isPrimary: z.boolean().default(false),
});

export const syncContactsSchema = z.object({
  customerId: z.string(),
  contacts: z.array(customerContactSchema),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateCustomerDeliveryInput = z.infer<typeof updateCustomerDeliverySchema>;
export type CustomerContactInput = z.infer<typeof customerContactSchema>;
export type SyncContactsInput = z.infer<typeof syncContactsSchema>;
