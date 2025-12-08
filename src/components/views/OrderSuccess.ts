import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { EventEmitter } from "../base/Events";

export type OrderResult = {
  id: string;
  total: number;
};

export class SuccessOrder extends Component<OrderResult> {
  protected orderTitleElement: HTMLElement;
  protected description: HTMLElement;
  protected orderButtonCloseElement: HTMLButtonElement;

  constructor(protected events: EventEmitter, container: HTMLElement) {
    super(container);

    this.orderTitleElement = ensureElement<HTMLElement>(
      ".order-success__title",
      this.container
    );
    this.description = ensureElement<HTMLElement>(
      ".order-success__description",
      this.container
    );
    this.orderButtonCloseElement = ensureElement<HTMLButtonElement>(
      ".order-success__close",
      this.container
    );

    // Инициализация через сеттер
    this.setTotal(0);

    this.orderButtonCloseElement.addEventListener("click", () => {
      this.events.emit("success:close");
    });
  }

  set total(value: number) {
    this.description.textContent = `Списано ${value} синапсов`;
  }

  /**
   * Устанавливает итоговую сумму заказа
   * @param value Сумма в синапсах
   */
  setTotal(value: number): void {
    this.total = value;
  }

  /**
   * Обновляет содержимое модалки успеха
   * @param data Частичные данные заказа
   */
  render(data?: Partial<OrderResult>): HTMLElement {
    if (data && data.total !== undefined) {
      this.setTotal(data.total);
    }
    return this.container;
  }

  /**
   * Возвращает корневой элемент компонента
   */
  getContainer(): HTMLElement {
    return this.container;
  }
}
