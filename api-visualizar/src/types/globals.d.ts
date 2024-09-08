import { PublicApiMethods } from '../../api-client/src/public.api';

declare global {
  interface Window {
    talknAPI: PublicApiMethods;
  }
}
