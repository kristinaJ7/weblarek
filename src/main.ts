import "./scss/styles.scss";

import { Products } from "./components/Models/Products";
import { BuyList } from "./components/Models/BuyList";
import { ApiService } from "./services/ApiService";
import { API_URL } from "./utils/constants";
import { Api } from "./components/base/Api";
import { Header } from "./components/views/Header";
import { CardPreview } from "./components/views/card/CardPreview";
import { ModalWindow } from "./components/views/Modal";
import { Basket } from "./components/views/Basket/Basket";

// Формы
import { FormAddress } from "./components/views/form/AddressForm";
import { ContactsForm } from "./components/views/form/СontactsForm";

// Результат
import { SuccessOrder } from "./components/views/OrderSuccess";
import { cloneTemplate, ensureElement } from "./utils/utils";
import { IProduct } from "./types/index";
import { EventEmitter } from "./components/base/Events";
import { Buyer } from "./components/Models/Buyer";
import { GalleryView } from "./components/views/card/Gallery";

import { IBuyer } from "./types/index";

import { BasketProduct } from "./components/views/Basket/CardBasket";
import { IContactsData } from "./types/index";
import { TPayment } from "./types/index";
import { IOrderData } from "./types/index";

// === ИНИЦИАЛИЗАЦИЯ ===
const events = new EventEmitter();
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
const basketContainer = cloneTemplate<HTMLElement>(basketTemplate);
const basket = new Basket(events, basketContainer);

// Превью товара
const previewElement = cloneTemplate<HTMLElement>(previewTemplate);
const preview = new CardPreview(previewElement, {
  onClickBuy: (product: IProduct) => {
    buyListModel.addItem(product); // ← Модель сама эмитит "cart:updated"
    modal.close();
  },
  onClickRemove: (product: IProduct) => {
    buyListModel.removeItem(product.id); // ← Модель сама эмитит "cart:updated"
    modal.close();
  },
});

// Представление для галереи
const galleryView = new GalleryView(
  gallery,
  {
    onClickProduct: (product: IProduct) => {
      productsModel.setSelectedProduct(product);
      events.emit("product:selected", product);
    },
  },
  cardTemplate
);

// === ОБРАБОТЧИКИ СОБЫТИЙ ===

// 2. Рендеринг каталога
events.on("products:updated", () => {
  console.log("Событие products:updated сработало!");
  galleryView.render(productsModel.getProducts());
});

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

//объединили оба обработчика
const header = new Header(events, headerContainer);
events.on("cart:updated", () => {
  // 1. Обновляем счётчик в шапке (без проверки — header точно существует)
  header.counter = buyListModel.getItemCount();

  // 2. Обновляем список и сумму в корзине
  const basketItems = createBasketItemElements(buyListModel.getItems());
  basket.setList(basketItems);
  basket.total = buyListModel.getTotalPrice();
});

// 2. basket:open — обработчик для открытия корзины (вызывается при клике на иконку корзины)
events.on("basket:open", () => {
  modal.show({
    content: basket.getContainer(),
  });
});

// 1. Открытие формы адреса
events.on("order:open", () => {
  modal.show({
    content: addressForm.getContainer(),
  });
});

// 2. Обработчик изменений в модели (обновляет UI)
events.on("buyer:change", ({ isValid }: { isValid: boolean }) => {
  // Используем ФОРМАТИРОВАННЫЕ ошибки (строки, а не массивы)
  const formattedErrors = buyer.getFormattedErrors();

  addressForm.showErrors(formattedErrors);
  contactsForm.showErrors(formattedErrors);

  // Включаем/выключаем кнопки отправки
  addressForm.setSubmitEnabled(isValid);
  contactsForm.setSubmitEnabled(isValid);
});

// 3. Обработчики изменений в полях

// Форма адреса
events.on(
  "payment:selected",
  ({ paymentMethod }: { paymentMethod: TPayment }) => {
    buyer.setData("payment", paymentMethod);
  }
);

events.on("address:changed", ({ address }: { address: string }) => {
  buyer.setData("address", address);
});

// Форма контактов
events.on(
  "contacts:field:change",
  ({ field, value }: { field: keyof IContactsData; value: string }) => {
    if (field in buyer.getData()) {
      buyer.setData(field as keyof IBuyer, value);
    }
  }
);

// 4. Обработчик submit формы адреса (валидация этапа "Адрес")
events.on("order:address:submit", () => {
  const errors = buyer.validateAddressStep(); // Валидируем адрес + способ оплаты

  // Проверяем, есть ли ошибки на текущем этапе
  if (Object.keys(errors).length === 0) {
    events.emit("order:address:submitted");
  } else {
    // Преобразуем ошибки в формат строк
    const formattedErrors = buyer.getFormattedErrors();
    addressForm.showErrors(formattedErrors);
    console.log("Ошибки валидации (адрес):", errors);
  }
});

// 5. Переход к форме контактов
events.on("order:address:submitted", () => {
  modal.show({
    content: contactsForm.getContainer(),
  });
});

// 6. Обработчик submit формы контактов (валидация этапа "Контакты")
events.on("contacts:submit", () => {
  const contactErrors = buyer.validateContactStep(); // Валидируем email + телефон

  // Проверяем ошибки этапа "Контакты"
  if (Object.keys(contactErrors).length === 0) {
    // Финальная проверка всех полей
    const allErrors = buyer.validateAll();

    if (Object.keys(allErrors).length === 0) {
      console.log("Заказ оформлен:", buyer.getData());

      // Формирование и отправка заказа (как в вашем коде)
      const buyerData = buyer.getData();
      const order: IOrderData = {
        email: buyerData.email,
        phone: buyerData.phone,
        address: buyerData.address,
        items: buyListModel.getItems().map((item) => item.id),
        total: buyListModel.getTotalPrice(),
        payment: buyerData.payment,
      };

      apiService
        .sendOrder(order)
        .then(() => {
          buyListModel.clear();
          buyer.clear();
          events.emit("cart:updated");
          successView.render({ total: order.total });
          modal.show({ content: successView.getContainer() });
        })
        .catch((error) => {
          console.error("Ошибка отправки заказа:", error);
          alert("Не удалось отправить заказ. Проверьте данные и соединение.");
        });
    } else {
      // Преобразуем финальные ошибки в строки
      const formattedErrors = buyer.getFormattedErrors();
      contactsForm.showErrors(formattedErrors);
      console.log("Ошибки валидации (все поля):", allErrors);
    }
  } else {
    // Преобразуем ошибки этапа "Контакты" в строки
    const formattedErrors = buyer.getFormattedErrors();
    contactsForm.showErrors(formattedErrors);
    console.log("Ошибки валидации (контакты):", contactErrors);
  }
});

// 7. Обработчик закрытия модалки успеха
events.on("success:close", () => {
  modal.close();
});

// Загрузка товаров
apiService
  .getProducts()
  .then((products) => {
    console.log("Получены товары:", products); // ← Посмотрите в консоли
    productsModel.setItems(products);
    /* renderProducts();
    events.emit("products:loaded", products);*/
  })
  .catch((error) => events.emit("api:error", error));
