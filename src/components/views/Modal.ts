import { IEvents } from "../base/Events";
import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";

interface ModalOptions {
  content: HTMLElement;
  title?: string;
  closable?: boolean;
  closeOnOverlayClick?: boolean;
}

export class ModalWindow extends Component<HTMLElement> {
  public _isOpen = false;

  // Статические элементы — инициализируем в конструкторе
  private closeButton: HTMLButtonElement;
  private contentContainer: HTMLElement;

  constructor(
    protected events: IEvents,
    closeSelector: string = ".modal__close",
    contentSelector: string = ".modal__content"
  ) {
    const container = ensureElement<HTMLElement>("#modal-container");
    super(container);

    // Ищем элементы один раз
    this.closeButton = ensureElement<HTMLButtonElement>(
      closeSelector,
      this.container
    );
    this.contentContainer = ensureElement<HTMLElement>(
      contentSelector,
      this.container
    );

    // Вешаем обработчики один раз
    this.closeButton.addEventListener("click", this.close.bind(this));

    this.container.addEventListener("click", (event: MouseEvent) => {
      if (event.target === this.container && this._isOpen) {
        this.close();
      }
    });
  }

  open(content: HTMLElement): this {
    // Удаляем старый контент и вставляем новый без проверки _isOpen
    this.contentContainer.replaceChildren(content);

    // Всегда добавляем класс (даже если уже есть)
    this.container.classList.add("modal_active");
    document.body.style.overflow = "hidden";

    this._isOpen = true; // Обновляем флаг
    return this;
  }

  //скрыть и очистить
  close(): void {
    if (!this._isOpen) return;

    this._isOpen = false;
    this.container.classList.remove("modal_active");
    this.contentContainer.innerHTML = "";
    document.body.style.overflow = "";
  }

  show(options: ModalOptions): void {
    // Только вставка контента и управление состоянием
    this.open(options.content);

    // Управление закрываемостью — через классы контейнера
    if (options.closable === false) {
      this.container.classList.add("modal_unclosable");
    } else {
      this.container.classList.remove("modal_unclosable");
    }

    if (options.closeOnOverlayClick === false) {
      this.container.style.pointerEvents = "none";
    } else {
      this.container.style.pointerEvents = "auto";
    }
  }
}
