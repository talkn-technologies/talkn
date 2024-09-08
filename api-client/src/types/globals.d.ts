import { PublicApiMethods } from '@api-client/public.api';

declare global {
  interface Window {
    talknAPI: PublicApiMethods;
  }
}
