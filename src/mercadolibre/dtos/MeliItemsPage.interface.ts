import { MeliItem } from './MeliItem.interface';

export interface MeliItemsPage {
  total: number;
  offset: number;
  limit: number;
  products: MeliItem[];
}
