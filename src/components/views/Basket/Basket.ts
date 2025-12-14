import { Component } from "../../base/Component";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";

export class Basket extends Component<{ total: number }> {
  protected basketTitleElement: HTMLElement;
  protected basketListElement: HTMLElement;
  protected basketButtonOrderElement: HTMLButtonElement;
  protected basketPriceElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    try {
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
        console.log("Кнопка 'Оформить' нажата");
        this.events.emit("order:open");
      });
    } catch (error) {
      console.error("Ошибка инициализации корзины:", error);
      throw error;
    }
  }

  setList(items: HTMLElement[]): void {
    const validItems = items.filter((item) => item instanceof HTMLElement);

    if (validItems.length === 0) {
      this.basketListElement.textContent = "Корзина пуста";
      this.basketButtonOrderElement.disabled = true;
    } else {
      this.basketListElement.replaceChildren(...validItems);
      this.basketButtonOrderElement.disabled = false;
    }
  }

  set total(value: number) {
    this.basketPriceElement.textContent = `${value} синапсов`;
  }

  getContainer(): HTMLElement {
    return this.container;
  }
}
