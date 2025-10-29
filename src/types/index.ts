export type ApiPostMethods = "POST" | "PUT" | "DELETE";
export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}
//Создание интерфейсов для данных(в приложении используются две сущности, которые описывают данные, — товар и покупатель. Их можно описать такими интерфейсами)
// товар
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}
// покупатель
export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}
export type TPayment = "card" | "cash";

// класс использует композицию, чтобы выполнить запрос на сервер с помощью метода get класса Api и будет получать с сервера объект с массивом товаров

// Тип для данных заказа
export interface IOrderData {
  buyer: IBuyer;
  items: IProduct[];
}

// Тип для ответа сервера
export interface IApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}
// Тип для ответа с товарами
export interface IProductsResponse extends IApiResponse {
  items: IProduct[];
}
