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
import { CardCatalog } from "./components/views/card/CardCatalog";

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

const basketItemTemplate = ensureElement<HTMLTemplateElement>("#card-basket");

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

function createProductCards(
  products: IProduct[],
  onClick: (product: IProduct) => void,
  template: HTMLTemplateElement
): HTMLElement[] {
  return products.map((product) => {
    const cardElement = cloneTemplate<HTMLElement>(template);
    const card = new CardCatalog(product, cardElement, {
      onClick: () => onClick(product),
    });

    // Просто передаём данные — обработка внутри CardCatalog
    card.title = product.title;
    card.image = product.image;
    card.category = product.category;
    card.price = product.price;
    card.getContainer().dataset.id = product.id;

    return card.getContainer();
  });
}

// === СОЗДАНИЕ ПРЕВЬЮ ТОВАРА ===
const previewElement = cloneTemplate<HTMLElement>(previewTemplate);
const preview = new CardPreview(previewElement, {
  onClickBuy: (product: IProduct) => {
    buyListModel.addItem(product);
    modal.close();
  },
  onClickRemove: (product: IProduct) => {
    buyListModel.removeItem(product.id);
    modal.close();
  },
});

// === ГАЛЕРЕЯ ТОВАРОВ ===
const galleryView = new GalleryView(gallery);
events.on("products:updated", () => {
  const products = productsModel.getProducts();

  const productCards = createProductCards(
    products,
    (product: IProduct) => {
      productsModel.setSelectedProduct(product);
    },
    cardTemplate
  );

  galleryView.render(productCards);
});

// === ОБРАБОТЧИК ОТКРЫТИЯ ПРЕВЬЮ ===
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

function createBasketItemElements(items: IProduct[]): HTMLElement[] {
  return items.map((item, index) => {
    // используем уже найденный шаблон
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

export interface OrderChangedEvent {
  data: IBuyer;
  errors: Record<string, string>;
  isValid: boolean;
}

events.on("order:changed", (payload: OrderChangedEvent) => {
  const { data, errors, isValid } = payload;

  console.log("[order:changed] Данные:", {
    email: data.email,
    phone: data.phone,
  });
  console.log(
    "[order:changed] Ошибки:",
    Object.fromEntries(Object.entries(errors).filter(([_, v]) => v))
  );
  console.log("[order:changed] isValid:", isValid);

  // Форма адреса (без изменений)
  addressForm.showErrors({
    payment: errors.payment,
    address: errors.address,
  });
  addressForm.setSubmitEnabled(true);

  // Форма контактов
  contactsForm.showErrors({
    email: errors.email,
    phone: errors.phone,
  });

  // КРИТИЧЕСКАЯ ПРОВЕРКА: все ли обязательные поля ЗАПОЛНЕНЫ?
  const areAllRequiredFieldsFilled =
    !!data.email?.trim() &&
    !!data.phone?.trim() &&
    !!data.address?.trim() &&
    !!data.payment;
  const canSubmit = isValid && areAllRequiredFieldsFilled;

  contactsForm.setSubmitEnabled(canSubmit);

  console.debug("[order:changed]", {
    isValid,
    areAllRequiredFieldsFilled,
    canSubmit,
    errors,
  });
});

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

// 4. Обработчик submit формы адреса — теперь только переход к следующему шагу
events.on("order:address:submit", () => {
  console.log("[order:address:submit] Обработчик вызван!");
  console.log("[order:address:submit]", { data: buyer.getData() });
  modal.show({
    content: contactsForm.getContainer(),
  });
});

// 6. Обработчик submit формы контактов — только отправка заказа
events.on("contacts:submit", () => {
  // Валидация уже выполнена в модели через buyer:change
  // Здесь только формирование и отправка заказа

  if (!buyer.isValid()) {
    console.log("Есть ошибки валидации, заказ не отправлен");
    return;
  }

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
      buyListModel.clear(); // В этом методе теперь эмитится cart:updated
      buyer.clear();

      // Явно сбрасываем UI форм
      contactsForm.resetUI();
      addressForm.resetUI();

      successView.render({ total: order.total });
      modal.show({ content: successView.getContainer() });
    })
    .catch((error) => {
      console.error("Ошибка отправки заказа:", error);
      alert("Не удалось отправить заказ. Проверьте данные и соединение.");
    });
});

// 7. Обработчик закрытия модалки успеха
events.on("success:close", () => {
  modal.close();
});

// Загрузка товаров
apiService
  .getProducts()
  .then((products) => {
    console.log("Получены товары:", products);
    productsModel.setItems(products);
  })
  .catch((error) => events.emit("api:error", error));
