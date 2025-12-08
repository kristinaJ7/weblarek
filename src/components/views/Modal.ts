import { IEvents } from "../base/Events";
import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";

interface ModalOptions {
  content: HTMLElement;
  title?: string;
  closable?: boolean;
  closeOnOverlayClick?: boolean;
  closeButtonSelector?: string;
}

export class ModalWindow extends Component<HTMLElement> {
  protected modalCloseButtonElement: HTMLButtonElement;
  protected modalContentElement: HTMLElement;
  private _isOpen = false;

  constructor(
    protected events: IEvents,
    closeSelector: string = ".modal__close",
    contentSelector: string = ".modal__content"
  ) {
    const container = ensureElement<HTMLElement>("#modal-container");
    super(container);

    this.modalCloseButtonElement = ensureElement<HTMLButtonElement>(
      closeSelector,
      this.container
    );
    this.modalContentElement = ensureElement<HTMLElement>(
      contentSelector,
      this.container
    );

    this.modalCloseButtonElement.addEventListener("click", () => this.close());

    this.container.addEventListener("click", (event: MouseEvent) => {
      if (event.target === this.container) this.close();
    });
  }

  open(content: HTMLElement): this {
    if (this._isOpen) return this;

    this._isOpen = true;
    this.modalContentElement.replaceChildren(content);
    this.container.classList.add("modal_active");
    document.body.style.overflow = "hidden";
    return this;
  }

  close(): void {
    if (!this._isOpen) return;

    this._isOpen = false;
    this.container.classList.remove("modal_active");
    this.modalContentElement.innerHTML = "";
    document.body.style.overflow = "";
  }

  show(options: ModalOptions): void {
    // 1. Обновляем контент
    if (options.content) {
      this.modalContentElement.replaceChildren(options.content);
    }

    // 2. Обновляем заголовок (если передан)
    if (options.title) {
      // Предполагаем, что в шаблоне есть элемент .modal__title
      const titleEl = this.container.querySelector(".modal__title");
      if (titleEl) {
        titleEl.textContent = options.title;
      }
    }

    // 3. Настраиваем закрываемость
    if (options.closable === false) {
      this.container.classList.add("modal_unclosable");
    } else {
      this.container.classList.remove("modal_unclosable");
    }

    // 4. Настраиваем закрытие по клику на оверлей
    if (options.closeOnOverlayClick === false) {
      this.container.style.pointerEvents = "none"; // Или другая логика
    }

    // 5. Обновляем селектор кнопки закрытия (если нужно)
    if (options.closeButtonSelector) {
      const newButton = ensureElement<HTMLButtonElement>(
        options.closeButtonSelector,
        this.container
      );
      this.modalCloseButtonElement = newButton;
    }

    // Открываем модалку
    this.open(options.content);
  }
}
