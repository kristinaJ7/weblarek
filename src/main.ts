import "./scss/styles.scss";

import { Products } from "./components/Models/Products";
import { BuyList } from "./components/Models/BuyList";

import { ApiService } from "./services/ApiService";
import { API_URL } from "./utils/constants";
import { Api } from "./components/base/Api";

import { Header } from "./components/views/Header";
import { CardCatalog } from "./components/views/card/CardCatalog";
import { CardPreview } from "./components/views/card/CardPreview";
import { ModalWindow } from "./components/views/Modal";

import { Basket } from "./components/views/Basket/Basket";
import { BasketProduct } from "./components/views/Basket/CardBasket";

// Формы
import { FormAddress } from "./components/views/form/AddressForm";
import { ContactsForm } from "./components/views/form/СontactsForm";

// Результат
import { SuccessOrder } from "./components/views/OrderSuccess";

import { cloneTemplate, ensureElement } from "./utils/utils";
import { IProduct } from "./types/index";
import { EventEmitter } from "./components/base/Events";
import { IContactsData } from "./types/index";

import { TPayment } from "./types/index";
import { Buyer } from "./components/Models/Buyer";
import { IOrderData } from "./types/index";
import { ValidationErrors } from "./components/Models/Buyer";

// === ИНИЦИАЛИЗАЦИЯ ===
const events = new EventEmitter(); // Единый экземпляр
const productsModel = new Products(events);
const buyListModel = new BuyList(events);

const api = new Api(API_URL);
const apiService = new ApiService(api);

// Контейнеры
const headerContainer = ensureElement<HTMLElement>(".header");
const gallery = ensureElement<HTMLElement>(".gallery");
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const cardTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const previewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const successTemplate = ensureElement<HTMLTemplateElement>("#success");

// Модалка
const modal = new ModalWindow(events);

// Формы и представления
const addressForm = new FormAddress(events);
const contactsForm = new ContactsForm(events);

const buyer = new Buyer(events);

// При успешной отправке
const successContainer = cloneTemplate(successTemplate);
const successView = new SuccessOrder(events, successContainer);

// Корзина
if (!basketTemplate) throw new Error("Шаблон корзины не найден");
const basketContainer = cloneTemplate<HTMLElement>(basketTemplate);
const basket = new Basket(events, basketContainer);

// Превью товара
const previewElement = cloneTemplate<HTMLElement>(previewTemplate);
const preview = new CardPreview(previewElement, {
  onClickBuy: (product) => {
    buyListModel.addItem(product);
    events.emit("cart:updated");
    modal.close(); // Закрываем превью после покупки
  },
  onClickRemove: (product) => {
    buyListModel.removeItem(product.id);
    modal.close();
    events.emit("cart:updated");
  },
});

// Действия для карточек каталога
const cardActions = {
  onClick: (event: MouseEvent, product: IProduct) => {
    productsModel.setSelectedProduct(product);
  },
};

// === ОБРАБОТЧИКИ СОБЫТИЙ ===

// 1. Обновление шапки (счётчик корзины)
if (headerContainer) {
  const header = new Header(events, headerContainer);
  events.on("cart:updated", () => {
    header.counter = buyListModel.getItemCount();
  });
}

// 2. Рендеринг каталога
function renderProducts() {
  gallery.innerHTML = "";
  productsModel.getProducts().forEach((product) => {
    const cardElement = cloneTemplate<HTMLElement>(cardTemplate);
    const card = new CardCatalog(product, cardElement, cardActions);
    card.title = product.title || "Нет названия";
    card.image = product.image || "";
    card.category = product.category || "Прочее";
    card.price = product.price || null;
    card.getContainer().dataset.id = product.id;
    gallery.append(card.getContainer());
  });
}
events.on("products:updated", renderProducts);

// 3. Открытие превью товара
events.on("product:selected", (selectedProduct: IProduct) => {
  if (!selectedProduct) return;

  preview.fillData(selectedProduct);
  preview.setInCart(buyListModel.hasItem(selectedProduct.id));
  modal.show({
    content: preview.getContainer(),
    closeOnOverlayClick: true,
    closable: true,
  });
});

// Вспомогательная функция: преобразует товары в DOM-элементы корзины
function createBasketItemElements(items: IProduct[]): HTMLElement[] {
  return items.map((item, index) => {
    const basketItemTemplate =
      ensureElement<HTMLTemplateElement>("#card-basket");
    const cardContainer = cloneTemplate<HTMLElement>(basketItemTemplate);
    cardContainer.dataset.id = item.id;

    const productCard = new BasketProduct(events, cardContainer, {
      onClickDelete: (id) => {
        buyListModel.removeItem(id);
      },
    });
    productCard.index = index + 1;
    productCard.title = item.title;
    productCard.price = item.price;
    return productCard.getContainer();
  });
}

const initialBasketItems = createBasketItemElements(buyListModel.getItems());
basket.setList(initialBasketItems);
basket.total = buyListModel.getTotalPrice();

// Обработчик обновления корзины
events.on("cart:updated", () => {
  const basketItems = createBasketItemElements(buyListModel.getItems());
  basket.setList(basketItems);
  basket.total = buyListModel.getTotalPrice();
});

// 2. basket:open — обработчик для открытия корзины (вызывается при клике на иконку корзины)
events.on("basket:open", () => {
  modal.show({
    content: basket.getContainer(),
    title: "Корзина",
    closable: true,
    closeOnOverlayClick: true,
  });
});

events.on("order:open", () => {
  modal.show({
    content: addressForm.getContainer(),
  });
});

events.on("order:address:submitted", () => {
  modal.show({
    content: contactsForm.getContainer(),
  });
});

events.on(
  "address:field:change",
  ({
    field,
    value,
  }: {
    field: "address" | "paymentMethod";
    value: string | TPayment;
  }) => {
    buyer.setData(field, value);
  }
);

// 2. Обработчики валидации и отправки
events.on(
  "contacts:field:change",
  ({ field, value }: { field: keyof IContactsData; value: string }) => {
    buyer.setData(field, value);

    // Отладка: проверяем, включается ли кнопка
    console.log("buyer.isValid():", buyer.isValid());
    console.log("Ошибки:", buyer.validate());
  }
);

// Валидация при изменении данных
events.on(
  "buyer:change",
  ({ errors, isValid }: { errors: ValidationErrors; isValid: boolean }) => {
    contactsForm.showErrors(errors);
    contactsForm.setSubmitEnabled(isValid);
  }
);

events.on("contacts:submit", () => {
  // 1. Валидация через Buyer (теперь с нормализованными данными)
  if (!buyer.isValid()) {
    contactsForm.showErrors(buyer.validate());
    return;
  }

  const buyerData = buyer.getData();

  // 2. Дополнительные проверки (уже не нужны для телефона/email/address — они в Buyer)
  // Но оставим проверку длины адреса
  if (buyerData.address.length < 5) {
    alert("Адрес должен быть не короче 5 символов");
    return;
  }

  // 3. Проверка paymentMethod (с защитой от null)
  if (!buyerData.paymentMethod) {
    alert("Выберите способ оплаты");
    return;
  }

  const normalizedPaymentMethod = buyerData.paymentMethod.toLowerCase();
  if (!["cash", "card"].includes(normalizedPaymentMethod)) {
    alert("Недопустимый способ оплаты. Выберите из списка.");
    return;
  }

  // 4. Формирование заказа (телефон уже нормализован в Buyer)
  const order: IOrderData = {
    email: buyerData.email,
    phone: buyerData.phone,
    address: buyerData.address,
    items: buyListModel.getItems().map((item) => item.id),
    total: buyListModel.getTotalPrice(),
    payment: normalizedPaymentMethod as TPayment,
  };

  console.log("Отправляем заказ:", order);
  console.log("Тело запроса:", JSON.stringify(order, null, 2));

  //5. отправка

  apiService
    .sendOrder(order)
    .then(() => {
      // 1. Очищаем корзину в модели
      buyListModel.clear();

      // 2. Обновляем интерфейс корзины
      const emptyBasketItems = createBasketItemElements([]);
      basket.setList(emptyBasketItems);
      basket.total = 0;

      // 3. Обновляем счётчик в шапке
      events.emit("cart:updated");

      // 4. Показываем модалку успеха
      successView.render({ total: order.total });
      modal.show({ content: successView.getContainer() });
    })
    .catch((error) => {
      console.error("Ошибка отправки заказа:", error);
      alert("Не удалось отправить заказ. Проверьте данные и соединение.");
    });
});

// Добавляем обработчик для закрытия модалки
events.on("success:close", () => {
  modal.close(); // Явно закрываем модалку
});

// Загрузка товаров
apiService
  .getProducts()
  .then((products) => {
    productsModel.setItems(products);
    renderProducts();
    events.emit("products:loaded", products);
  })
  .catch((error) => events.emit("api:error", error));

// Закрытие модалки по Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.close();
    events.emit("modal:closedByEsc");
  }
});

export {};
