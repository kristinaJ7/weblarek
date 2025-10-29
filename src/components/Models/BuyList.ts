//для работы с корзиной
// ипорт интерфейса карточки
import { IProduct } from "../../types";

export class BuyList {
  private cardListItem: IProduct[] = []; // хранит массив товаров выбранных покупателем для покупки

  //МЕТОДЫ:

  //получение массива товаров, которые находятся в корзине
  getItems(): IProduct[] {
    return this.cardListItem;
  }

  // добавление товара, который был получен в параметре, в массив корзины
  addItem(item: IProduct): void {
    this.cardListItem.push(item);
  }

  // Удаление товара из корзины по ID (полученного в параметре из массива корзины)
  removeItem(id: string): void {
    this.cardListItem = this.cardListItem.filter((item) => item.id !== id);
  }

  // Очистка корзины
  clear(): void {
    this.cardListItem = [];
  }

  // получение стоимости всех товаров в корзине;
  getTotalPrice(): number {
    return this.cardListItem.reduce(
      (total, item) => total + (item.price ?? 0),
      0
    );
  }

  // Получение количества товаров в корзине
  getItemCount(): number {
    return this.cardListItem.length;
  }

  // проверка наличия товара в корзине по его id, полученного в параметр метода
  hasItem(id: string): boolean {
    return this.cardListItem.some((item) => item.id === id);
  }
}
