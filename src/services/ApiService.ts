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

    // Корректное логирование
    console.log("HTTP статус:", response.status); // Статус HTTP
    console.log("Данные ответа:", response.data); // Тело ответа
    console.log("Полный ответ:", response);

    /*
   if (!response.success) {
throw new Error(response.error || "Ошибка отправки заказа");
}
 }*/
    // Проверяем, что ответ содержит id (признак успешного заказа)
    if (!response.id) {
      throw new Error(response.error || "Ошибка отправки заказа");
    }

    // Если нужно, можно вернуть данные заказа
    return response; // или ничего, если Promise<void>
  }
}
