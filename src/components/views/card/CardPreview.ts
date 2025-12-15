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

    // Валидация DOM-элементов
    try {
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
    } catch (error) {
      console.error("Ошибка инициализации CardPreview:", error);
      throw error;
    }

    // Слушатель на кнопку
    this.buttonElement.addEventListener("click", this.handleButtonClick);
  }

  public getContainer(): HTMLElement {
    return this.container;
  }

  fillData(product: IProduct): void {
    this.product = product;
    // НЕ перезаписываем isInCart здесь!

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
      this.buttonElement.textContent = "Недоступно";
      this.buttonElement.disabled = true;
    } else {
      if (this.isInCart) {
        this.buttonElement.textContent = "Удалить из корзины";
      } else {
        this.buttonElement.textContent = "Купить";
      }
      this.buttonElement.disabled = false;
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
    this.titleElement.textContent = value || "Нет названия";
  }

  set text(value: string) {
    this.textElement.textContent = value || "";
  }

  set image(value: string) {
    const cleanValue = value?.trim() || "";
    const nameWithoutExtension = cleanValue.replace(/\.\w+$/, "");
    const fullUrl = `${CDN_URL}/${nameWithoutExtension}.png`;

    this.imageElement.src = fullUrl;
    this.imageElement.alt = this.product?.title || "Изображение товара";

    this.imageElement.onerror = () => {
      console.error("Не удалось загрузить изображение:", fullUrl);
      // Запасной вариант
      this.imageElement.src = "/assets/placeholder.png";
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
