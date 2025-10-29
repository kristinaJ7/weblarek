import {
  IApi,
  IProductsResponse,
  IOrderData,
  IApiResponse,
  IProduct,
} from "../types/index";

export class ApiService {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  // Метод возвращает Promise<IProduct[]> — массив продуктов
  async getProducts(): Promise<IProduct[]> {
    try {
      // Получаем полный ответ от API
      const response: IProductsResponse = await this.api.get<IProductsResponse>(
        "/product/"
      );
      //Возврат ответа из метода
      return response.items;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ошибка получения продуктов: ${error.message}`);
      } else {
        throw new Error("Ошибка получения продуктов: неизвестная ошибка");
      }
    }
  }
  async sendOrder(orderData: IOrderData): Promise<void> {
    const response: IApiResponse = await this.api.post<IApiResponse>(
      "/order/",
      orderData
    );

    if (!response.success) {
      throw new Error(response.error || "Ошибка отправки заказа");
    }
  }
}
