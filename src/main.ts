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

// Формы
import { FormAddress } from "./components/views/form/AddressForm";
import { ContactsForm } from "./components/views/form/СontactsForm";
// Результат
import { SuccessOrder } from "./components/views/OrderSuccess";

import { cloneTemplate } from "./utils/utils";
import { IProduct } from "./types/index";
import { EventEmitter } from "./components/base/Events";

import { IContactsData } from "./types/index";

import { CartUpdateData } from "./types/index";

const events = new EventEmitter();
const productsModel = new Products(events);
const buyListModel = new BuyList(events);

const headerContainer = document.querySelector(".header") as HTMLElement;
const gallery = document.querySelector(".gallery") as HTMLElement;

if (headerContainer) {
  const header = new Header(events, headerContainer);
  // Явно указываем тип данных
  events.on("cart:updated", (data: CartUpdateData) => {
    header.counter = data.count;
  });
}

if (!gallery) throw new Error("Нет контейнера .gallery");

const api = new Api(API_URL);
const apiService = new ApiService(api);

const cardTemplate = document.getElementById(
  "card-catalog"
) as HTMLTemplateElement;
const previewTemplate = document.getElementById(
  "card-preview"
) as HTMLTemplateElement;
const basketTemplate = document.getElementById("basket") as HTMLTemplateElement;

if (!cardTemplate || !previewTemplate || !basketTemplate)
  throw new Error("Нет шаблонов");

const modal = new ModalWindow(events);
const addressForm = new FormAddress(events);
const contactsForm = new ContactsForm(events);

// Шаблон для успешной отправки заказа
const successTemplate = document.getElementById(
  "success"
) as HTMLTemplateElement;
const successContainer = cloneTemplate(successTemplate);
const successView = new SuccessOrder(events, successContainer);

// Действия для карточки товара (просмотр, добавление в корзину)
const cardActions = {
  onClick: (event: MouseEvent, product: IProduct) => {
    const previewElement = cloneTemplate<HTMLElement>(previewTemplate);
    const preview = new CardPreview(previewElement, {
      onClickBuy: (product) => {
        buyListModel.addItem(product);
        preview.setInCart(true); // Кнопка меняется на «Удалить из корзины»
        // modal.close(); ← НЕ НУЖНО (окно остаётся открытым)
        events.emit("cart:itemAdded", product);
        events.emit("cart:updated", {
          items: buyListModel.getItems(),
          total: buyListModel.getTotalPrice(),
          count: buyListModel.getItemCount(),
        });
      },
      onClickRemove: (product) => {
        buyListModel.removeItem(product.id);
        preview.setInCart(false); // Кнопка меняется на «Купить»
        modal.close(); // ← ОСТАВИЛИ (окно закрывается при удалении)
        events.emit("cart:updated", {
          items: buyListModel.getItems(),
          total: buyListModel.getTotalPrice(),
          count: buyListModel.getItemCount(),
        });
      },
    });

    preview.fillData(product);
    preview.setInCart(buyListModel.hasItem(product.id));
    modal.open(preview.getContainer());
    events.emit("preview:opened", { productId: product.id });
  },
};

// Открытие модалки корзины
function openBasketModal() {
  modal.close();
  const basketContainer = cloneTemplate<HTMLElement>(basketTemplate);

  // Создаём корзину с обработчиком удаления товара
  const basket = new Basket(events, basketContainer, {
    onClickDelete: (id: string) => {
      buyListModel.removeItem(id);
      console.log(`Товар ${id} удалён из корзины`);
      openBasketModal(); // Переоткрываем корзину после удаления
      events.emit("cart:updated", {
        items: buyListModel.getItems(),
        total: buyListModel.getTotalPrice(),
        count: buyListModel.getItemCount(),
      });
    },
  });

  basket.render({
    items: buyListModel.getItems(),
    total: buyListModel.getTotalPrice(),
  });

  modal.show({
    content: basket.getContainer(),
    title: "Корзина",
    closable: true,
    closeOnOverlayClick: true,
    closeButtonSelector: ".modal__close",
  });
}

// Рендеринг каталога товаров
function renderProducts() {
  if (!gallery || !cardTemplate) return;
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

// Обработчики событий
events.on("products:updated", renderProducts);
events.on("basket:open", openBasketModal);

events.on("order:open", () => {
  modal.close();
  modal.show({
    content: addressForm.getContainer(),
    title: "Доставка и оплата",
    closable: true,
    closeOnOverlayClick: true,
    closeButtonSelector: ".modal__close",
  });
});

events.on("order:address:submitted", () => {
  modal.show({
    content: contactsForm.getContainer(),
    title: "Контакты",
    closable: true,
    closeOnOverlayClick: true,
    closeButtonSelector: ".modal__close",
  });
  contactsForm.forceValidate();
});

events.on("contacts:submit", (data: IContactsData) => {
  modal.close();
  successView.render({ total: buyListModel.getTotalPrice() });
  modal.show({
    content: successView.getContainer(),
    title: "",
    closable: true,
    closeOnOverlayClick: true,
    closeButtonSelector: ".order-success__close",
  });
});

events.on("success:close", () => {
  modal.close();
  buyListModel.clear();
  events.emit("cart:updated", {
    items: [],
    total: 0,
    count: 0,
  });
  console.log("Корзина очищена");
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
