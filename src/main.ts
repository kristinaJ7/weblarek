import "./scss/styles.scss";

import { apiProducts } from "./utils/data.ts"; // путь к данным
import { Products } from "./components/Models/Products"; // путь к файлу с классом Products
import { BuyList } from "./components/Models/BuyList"; // путь к модели корзины
import { Buyer } from "./components/Models/Buyer"; // путь к модели корзины

// api
import { ApiService } from "./services/ApiService";
import { API_URL } from "./utils/constants";
import { Api } from "./components/base/Api";

//проверка класса  ProductsCatalog и его методов
const productsModel = new Products();
productsModel.setItems(apiProducts.items);
console.log("Массив товаров из каталога: ", productsModel.getProducts());

//проверка класса  Buyer и его методов
const BuyerModel = new Buyer();
BuyerModel.setEmail("example@example.com");
BuyerModel.setPhone("123-456-7890");
BuyerModel.setAddress("123 Main St");
BuyerModel.setPayment("card");

console.log("Данные покупателя: ", BuyerModel.getData());
// Пример валидации данных
const validationErrors = BuyerModel.validate();
console.log("Ошибки валидации: ", validationErrors);

//проверка класса BuyList и его методов
const BuyListModel = new BuyList();
BuyListModel.addItem(apiProducts.items[0]); // добавляем первый товар в корзину
console.log("Массив товаров из корзины: ", BuyListModel.getItems());

// Пример удаления товара из корзины
BuyListModel.removeItem(apiProducts.items[0].id);
console.log("Корзина после удаления товара: ", BuyListModel.getItems());

// Пример получения количества товаров в корзине
console.log("Количество товаров в корзине: ", BuyListModel.getItemCount());

// Пример проверки наличия товара в корзине
const hasItem = BuyListModel.hasItem(apiProducts.items[0].id);
console.log(`Товар с ID ${apiProducts.items[0].id} в корзине:`, hasItem);

// Создание экземпляра Api
const api = new Api(API_URL);

// Создание экземпляра ApiService
const apiService = new ApiService(api);

// Получение списка товаров с сервера
apiService
  .getProducts()
  .then((products) => {
    // Обновление модели товаров
    productsModel.setItems(products);
    console.log(
      "Массив товаров из каталога (с сервера): ",
      productsModel.getProducts()
    );
  })
  .catch((error) => console.error(error));
