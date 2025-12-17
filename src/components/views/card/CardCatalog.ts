import { categoryMap } from "../../../utils/constants";
import { ensureElement } from "../../../utils/utils";
import { CDN_URL } from "../../../utils/constants";
import { IProduct } from "../../../types";

export interface ICardActions {
  /**
   * Обработчик клика по карточке товара
   * @param event - Событие клика
   * @param product - Данные товара
   */
  onClick?: (event: MouseEvent, product: IProduct) => void;
}

export class CardCatalog {
  protected container: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected categoryElement: HTMLElement;
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;

  private productData: IProduct;

  /**
   * Создаёт карточку товара
   * @param product - Данные товара (обязательно)
   * @param container - Корневой элемент карточки
   * @param actions - Обработчики событий (опционально)
   */
  constructor(
    product: IProduct,
    container: HTMLElement,
    actions?: ICardActions
  ) {
    if (!container) {
      throw new Error("CardCatalog: container не передан");
    }
    if (!product) {
      throw new Error("CardCatalog: product не передан");
    }

    this.container = container;
    this.productData = product;

    // Поиск элементов внутри контейнера
    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container
    );
    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container
    );
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container
    );

    // Привязка обработчика клика (если передан)
    if (actions && typeof actions.onClick === "function") {
      const clickHandler = actions.onClick;
      this.container.addEventListener("click", (event) => {
        clickHandler(event, this.productData);
      });
    }
  }

  /** Возвращает корневой элемент карточки */
  public getContainer(): HTMLElement {
    return this.container;
  }

  /** Устанавливает категорию товара */
  set category(value: string | null | undefined) {
    if (!value) return;

    this.categoryElement.textContent = value;
    Object.keys(categoryMap).forEach((key) => {
      this.categoryElement.classList.toggle(
        categoryMap[key as keyof typeof categoryMap],
        key === value
      );
    });
  }

  /** Устанавливает название товара */
  set title(value: string | null | undefined) {
    this.titleElement.textContent = value || "";
  }

  /** Устанавливает изображение товара */

  set image(value: string) {
    const cleanName = value.trim().replace(/\.\w+$/, "");
    const fullUrl = `${CDN_URL}/${cleanName}.png`;

    this.imageElement.src = fullUrl;
    this.imageElement.alt =
      this.titleElement.textContent || "Изображение товара";

    this.imageElement.onerror = () => {
      console.error("Не удалось загрузить изображение:", fullUrl);
    };
  }

  /** Устанавливает цену товара */
  set price(value: number | null) {
    if (value === null) {
      this.priceElement.textContent = "Бесплатно";
    } else {
      this.priceElement.textContent = `${value} синапсов`;
    }
  }
}
