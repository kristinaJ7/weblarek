//для работы с интерфейсом для товара

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
