//Класс делает только одну вещь: управляет DOM‑контейнером (рендерит и очищает).
export class GalleryView {
  constructor(private container: HTMLElement) {}

  render(items: HTMLElement[]): void {
    this.container.replaceChildren(...items);
  }

  clear(): void {
    this.container.innerHTML = "";
  }
}
