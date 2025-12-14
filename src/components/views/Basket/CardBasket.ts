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

  actions: BasketCard;

  private handleDelete = () => {
    console.log("BasketProduct: обработчик клика вызван");
    const productId = this.container.dataset.id;
    if (productId) {
      this.actions.onClickDelete(productId);
    } else {
      console.error("BasketProduct: data-id не найден", this.container);
    }
  };

  constructor(
    protected events: IEvents,
    container: HTMLElement,
    actions: BasketCard
  ) {
    super(container);

    this.actions = actions;

    try {
      this.indexElement = ensureElement(".basket__item-index", this.container);
      this.titleElement = ensureElement(".card__title", this.container);
      this.priceElement = ensureElement(".card__price", this.container);
      this.deleteButton = ensureElement<HTMLButtonElement>(
        ".basket__item-delete",
        this.container
      );
    } catch (error) {
      console.error("Ошибка при инициализации BasketProduct:", error);
      throw error;
    }

    this.deleteButton.addEventListener("click", this.handleDelete);
  }

  set index(value: number) {
    this.indexElement.textContent = value.toString();
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    if (value === null) {
      this.priceElement.textContent = "—"; // Или "Нет цены", "Бесплатно" и т.п.
    } else {
      this.priceElement.textContent = `${value} синапсов`;
    }
  }

  destroy(): void {
    this.deleteButton.removeEventListener("click", this.handleDelete);
  }

  getContainer(): HTMLElement {
    return this.container;
  }
}
