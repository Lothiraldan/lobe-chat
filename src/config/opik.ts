/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const getOpikConfig = () => {
  return createEnv({
    runtimeEnv: {
      ENABLE_OPIK: process.env.ENABLE_OPIK === '1',
      OPIK_API_KEY: process.env.OPIK_API_KEY || '',
      OPIK_WORKSPACE: process.env.OPIK_WORKSPACE || 'Default',
      OPIK_PROJECT_NAME: process.env.OPIK_PROJECT_NAME || 'Default Project',
      OPIK_URL_OVERRIDE: process.env.OPIK_URL_OVERRIDE || 'https://www.comet.com/opik/api',
    },

    server: {
      ENABLE_OPIK: z.boolean(),
      OPIK_API_KEY: z.string().optional(),
      OPIK_WORKSPACE: z.string().optional(),
      OPIK_PROJECT_NAME: z.string().optional(),
      OPIK_URL_OVERRIDE: z.string().url(),
    },
  });
};

export const opikEnv = getOpikConfig();
