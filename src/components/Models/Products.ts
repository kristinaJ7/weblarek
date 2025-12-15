import { IEvents } from "../base/Events";
import { IProduct } from "../../types";

export class Products {
  private productsList: IProduct[] = [];
  private selectedProduct: IProduct | null = null;
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }

  setItems(items: IProduct[]): void {
    this.productsList = items;
    this.events.emit("products:updated", items);

    this.selectedProduct = null;
  }

  getProducts(): IProduct[] {
    return this.productsList;
  }

  getProductById(id: string): IProduct | null {
    const product = this.productsList.find((p) => p.id === id) || null;
    if (product) {
      this.events.emit("product:found", product);
    }
    return product;
  }

  setSelectedProduct(product: IProduct): void {
    this.selectedProduct = product;
    this.events.emit("product:selected", product);
  }

  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }
}
