import { ensureElement, cloneTemplate } from "../../../utils/utils";
import { Component } from "../../base/Component";
import { IEvents } from "../../base/Events";
import { IProduct } from "../../../types/index";

interface IBasketData {
  items: IProduct[];
  total: number;
}

interface BasketItemActions {
  onClickDelete: (id: string) => void;
}

export class Basket extends Component<IBasketData> {
  protected basketTitleElement: HTMLElement;
  protected basketListElement: HTMLElement;
  protected basketButtonOrderElement: HTMLButtonElement;
  protected basketPriceElement: HTMLElement;

  private actions: BasketItemActions;

  constructor(
    protected events: IEvents,
    container: HTMLElement,
    actions: BasketItemActions
  ) {
    super(container);
    this.actions = actions;

    this.basketTitleElement = ensureElement<HTMLElement>(
      ".modal__title",
      this.container
    );
    this.basketListElement = ensureElement<HTMLElement>(
      ".basket__list",
      this.container
    );
    this.basketButtonOrderElement = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container
    );
    this.basketPriceElement = ensureElement<HTMLElement>(
      ".basket__price",
      this.container
    );

    this.basketButtonOrderElement.addEventListener("click", () => {
      this.events.emit("order:open");
    });
  }

  render(data: IBasketData): HTMLElement {
    // Обновляем общую цену
    this.total = data.total;

    // Очищаем список и заполняем заново
    this.items = data.items;

    return this.container;
  }

  set items(value: IProduct[]) {
    if (value.length === 0) {
      this.basketListElement.innerHTML = "<p>Корзина пуста</p>";
      this.basketButtonOrderElement.disabled = true;
    } else {
      this.basketListElement.innerHTML = "";
      value.forEach((item, index) => {
        const itemElement = this.createItemElement(item, index + 1);
        this.basketListElement.append(itemElement);
      });
      this.basketButtonOrderElement.disabled = false;
    }
  }

  set total(value: number) {
    this.basketPriceElement.textContent = `${value} синапсов`;
  }

  private createItemElement(item: IProduct, index: number): HTMLElement {
    const template = document.getElementById(
      "card-basket"
    ) as HTMLTemplateElement;
    const element = cloneTemplate(template);

    const indexEl = ensureElement<HTMLElement>(".basket__item-index", element);
    const titleEl = ensureElement<HTMLElement>(".card__title", element);
    const priceEl = ensureElement<HTMLElement>(".card__price", element);
    const deleteBtn = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      element
    );

    indexEl.textContent = index.toString();
    titleEl.textContent = item.title;
    priceEl.textContent = `${item.price} синапсов`;
    element.dataset.id = item.id;

    deleteBtn.addEventListener("click", () => {
      this.actions.onClickDelete(item.id);
    });

    return element;
  }

  getContainer(): HTMLElement {
    return this.container;
  }
}
