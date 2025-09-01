import type { Metadata } from 'next';

// This function can be used to dynamically generate metadata
// You can fetch this data from a CMS or database
export const getBaseMetadata = (brandName: string): Metadata => ({
  title: {
    default: brandName,
    template: `%s | ${brandName}`,
  },
  description: `A vibrant and modern e-commerce experience from ${brandName}.`,
});
