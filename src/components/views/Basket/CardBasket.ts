//для карточки товара в корзине
import { ensureElement } from "../../../utils/utils";
import { Component } from "../../base/Component";
import { IEvents } from "../../base/Events";
import { IProduct } from "../../../types/index";

interface BasketCard {
  onClickDelete: (id: string) => void;
}

export class BasketProduct extends Component<IProduct> {
  protected indexElement: HTMLElement;
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected deleteButton: HTMLButtonElement;

  private productId: string;

  constructor(
    protected events: IEvents,
    container: HTMLElement,
    actions: BasketCard
  ) {
    super(container);

    this.indexElement = ensureElement<HTMLElement>(
      ".basket__item-index",
      this.container
    );
    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container
    );
    this.deleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      this.container
    );

    // Сохраняем ID товара
    this.productId = this.container.dataset.id || "";

    // Обработчик удаления
    this.deleteButton.addEventListener("click", () => {
      actions.onClickDelete(this.productId);
    });
  }

  // Устанавливаем порядковый номер
  set index(value: number) {
    this.indexElement.textContent = value.toString();
  }

  // Устанавливаем название товара
  set title(value: string) {
    this.titleElement.textContent = value;
  }

  // Устанавливаем цену
  set price(value: number) {
    this.priceElement.textContent = `${value} синапсов`;
  }
}
