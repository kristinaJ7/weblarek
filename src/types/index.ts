export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

// Товар
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

// Покупатель (единый источник данных)
export interface IBuyer {
  email: string;
  phone: string;
  address: string;
  payment: TPayment;
}

export type TPayment = "card" | "cash";

// Данные для отправки заказа
export interface IOrderData {
  email: string;
  phone: string;
  address: string;
  items: string[];

  total: number;
  payment: TPayment;
}

// Ответ от сервера с товарами
export interface IProductsResponse {
  items: IProduct[];
}

/*
// Данные для обновления корзины
export interface CartUpdateData {
  count: number;
}
*/

export interface IContactsData {
  phone: string;
  email: string;
}
