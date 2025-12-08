import { categoryMap } from "../../../utils/constants";
import { ensureElement } from "../../../utils/utils";
import { CDN_URL } from "../../../utils/constants";

import { IProduct } from "../../../types";

export interface ICardPreviewActions {
  onClickBuy: (product: IProduct) => void;
  onClickRemove: (product: IProduct) => void;
}

export class CardPreview {
  protected container: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected categoryElement: HTMLElement;
  protected titleElement: HTMLElement;
  protected textElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected buttonElement: HTMLButtonElement;

  private product: IProduct | null = null;
  private isInCart: boolean = false;
  private actions: ICardPreviewActions;

  private handleButtonClick = () => {
    if (!this.product) return;

    if (this.isInCart) {
      this.actions.onClickRemove(this.product);
    } else {
      this.actions.onClickBuy(this.product);
    }
  };

  constructor(container: HTMLElement, actions: ICardPreviewActions) {
    this.container = container;
    this.actions = actions;

    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container
    );
    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container
    );
    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container
    );
    this.textElement = ensureElement<HTMLElement>(
      ".card__text",
      this.container
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container
    );
    this.buttonElement = ensureElement<HTMLButtonElement>(
      ".card__button",
      this.container
    );

    // Подписываемся на клик при инициализации
    this.buttonElement.addEventListener("click", this.handleButtonClick);
  }

  public getContainer(): HTMLElement {
    return this.container;
  }

  fillData(product: IProduct): void {
    this.product = product;
    this.isInCart = false; // По умолчанию товар не в корзине

    this.category = product.category;
    this.title = product.title;
    this.text = product.description || "";
    this.image = product.image;
    this.price = product.price;

    this.updateButtonState();
  }

  setInCart(isInCart: boolean): void {
    this.isInCart = isInCart;
    this.updateButtonState();
  }

  private updateButtonState(): void {
    if (!this.product) return;

    if (this.product.price === null) {
      // Цена отсутствует — блокируем кнопку
      this.buttonElement.textContent = "Недоступно";
      this.buttonElement.disabled = true;
      this.buttonElement.removeEventListener("click", this.handleButtonClick);
    } else {
      // Цена есть — настраиваем кнопку
      if (this.isInCart) {
        this.buttonElement.textContent = "Удалить из корзины";
      } else {
        this.buttonElement.textContent = "Купить";
      }
      this.buttonElement.disabled = false;

      // Восстанавливаем обработчик клика, если его нет
      const hasListener = this.buttonElement.addEventListener
        ? this.buttonElement.addEventListener("click", this.handleButtonClick)
        : false;

      if (!hasListener) {
        this.buttonElement.addEventListener("click", this.handleButtonClick);
      }
    }
  }

  // Сеттеры
  set category(value: string) {
    this.categoryElement.textContent = value;
    Object.keys(categoryMap).forEach((key) => {
      this.categoryElement.classList.toggle(
        categoryMap[key as keyof typeof categoryMap],
        key === value
      );
    });
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set text(value: string) {
    this.textElement.textContent = value;
  }

  set image(value: string) {
    const cleanValue = value.trim();
    const nameWithoutExtension = cleanValue.replace(/\.\w+$/, "");
    const fullUrl = `${CDN_URL}/${nameWithoutExtension}.png`;
    this.imageElement.src = fullUrl;
    this.imageElement.alt =
      this.titleElement.textContent || "Изображение товара";
    this.imageElement.onerror = () => {
      console.error("Не удалось загрузить изображение:", fullUrl);
    };
  }

  set price(value: number | null) {
    if (value === null) {
      this.priceElement.textContent = "Бесплатно";
    } else {
      this.priceElement.textContent = `${value} синапсов`;
    }
  }
}
