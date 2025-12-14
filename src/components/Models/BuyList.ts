import { IProduct } from "../../types";
import { IEvents } from "../base/Events"; // Импорт IEvents

export class BuyList {
  private cardListItem: IProduct[] = [];
  private events: IEvents;

  // Конструктор с передачей EventEmitter
  constructor(events: IEvents) {
    this.events = events;
  }

  getItems(): IProduct[] {
    return this.cardListItem;
  }

  addItem(item: IProduct): void {
    this.cardListItem.push(item);
    // Эмит события при добавлении
    this.events.emit("basket:itemAdded", item);
    this.events.emit("basket:updated", {
      total: this.getTotalPrice(),
      count: this.getItemCount(),
    });
  }

  removeItem(id: string): void {
    this.cardListItem = this.cardListItem.filter((item) => item.id !== id);
    // Эмит события при удалении
    this.events.emit("basket:itemRemoved", { id });
    this.events.emit("basket:updated", {
      total: this.getTotalPrice(),
      count: this.getItemCount(),
    });
    // Дополнительно эмитим cart:updated для совместимости
    this.events.emit("cart:updated");
  }

  clear(): void {
    this.cardListItem = [];
    // Эмит события при очистке
    this.events.emit("basket:cleared");
    this.events.emit("basket:updated", {
      total: 0,
      count: 0,
    });
  }
  getTotalPrice(): number {
    return this.cardListItem.reduce(
      (total, item) => total + (item.price ?? 0),
      0
    );
  }

  getItemCount(): number {
    return this.cardListItem.length;
  }

  hasItem(id: string): boolean {
    return this.cardListItem.some((item) => item.id === id);
  }
}
