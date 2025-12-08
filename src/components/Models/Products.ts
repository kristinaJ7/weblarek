//для работы с интерфейсом для товара
/*
// импортируем интерфейс продукта
import { IProduct } from "../../types";

export class Products {
  // объявляем класс, который определяет структуру и поведение для будущих объектов
  private productsList: IProduct[] = []; // Массив для хранения всех товаров
  private selectedProduct: IProduct | null = null; // Переменная для хранения выбранного продукта(хранит товар, выбранный для подробного отображения)

  //содержит методы:( класс называется Products, метод сохранения данных в нём —  setItems(items: IProduct[]): void
  //  а метод получения массива всех товаров — get():  IProduct[]

  setItems(items: IProduct[]): void {
    // Метод для установки списка продуктов
    this.productsList = items;
  }

  getProducts(): IProduct[] {
    // Метод для получения списка продуктов(получение массива товаров из модели)
    return this.productsList;
  }

  getProductById(id: string): IProduct | null {
    // Метод для поиска продукта по ID(получение одного товара по его id)
    return this.productsList.find((product) => product.id === id) || null;
  }

  setSelectedProduct(product: IProduct): void {
    // Метод для установки выбранного продукта(сохранение товара для подробного отображения)
    this.selectedProduct = product;
  }

  getSelectedProduct(): IProduct | null {
    // Метод для получения выбранного продукта(получение товара для подробного отображения)
    return this.selectedProduct;
  }
}
*/





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
    if (this.selectedProduct) {
      this.selectedProduct = null;
      this.events.emit("product:selected", undefined);
    }
  }

  getProducts(): IProduct[] {
    return this.productsList;
  }

  getProductById(id: string): IProduct | null {
    const product = this.productsList.find((p) => p.id === id) || null;
    if (product) {
      this.events.emit("product:found", product);
    } else {
      this.events.emit("product:notFound", { id });
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
