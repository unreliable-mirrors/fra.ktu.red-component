import jsx from "texsaur";

import { DataStore } from "./data_store.js";
import { EventDispatcher } from "./event_dispatcher.js";

export class KTUComponent extends HTMLElement {
  static observedAttributes: string[] = ["binding"];

  binding: string | null | undefined;

  //TODO: CHANGE THIS TO GENERICS
  bindingKeys!: string[];
  bindingData: any;

  handleUpdateStateWrapper: Function = this.updateStateWrapper.bind(this);

  constructor(props?: { binding?: string }) {
    super();
    this.binding = props?.binding;
    if (!this.binding) {
      this.binding = this.getAttribute("binding");
    }
    this.bindingKeys = this.binding ? this.binding.split(",") : [];
    this.bindingData = this.defaultBinding();
    this.updateState();
  }

  getObservedAttributes(): readonly (typeof KTUComponent.observedAttributes)[number][] {
    return (this.constructor as typeof KTUComponent).observedAttributes;
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ): void {
    (this as any)[name] = newValue;
    this.reRender();
  }

  connectedCallback() {
    if (!this.binding) {
      this.binding = this.getAttribute("binding");
    }
    this.bindingKeys = this.binding ? this.binding.split(",") : [];
    this.updateState();
    this.reRender();
    this.bindEvents();
  }

  disconnectedCallback() {
    //TODO: THIS IS BROKEN
    for (const bindingKey of this.bindingKeys) {
      EventDispatcher.getInstance().removeEventListener(
        bindingKey,
        "update",
        this.handleUpdateStateWrapper,
      );
    }
  }

  updateStateWrapper() {
    this.updateState();

    this.reRender();
  }

  updateState() {
    for (const bindingKey of this.bindingKeys) {
      if (typeof DataStore.getInstance().getStore(bindingKey) !== "undefined") {
        this.bindingData[bindingKey] =
          DataStore.getInstance().getStore(bindingKey);
      } else
        [(this.bindingData[bindingKey] = this.defaultBinding()[bindingKey])];
    }
  }
  defaultBinding(): Record<string, any> {
    return {};
  }
  bindEvents() {
    for (const bindingKey of this.bindingKeys) {
      EventDispatcher.getInstance().addEventListener(
        bindingKey,
        "update",
        this.handleUpdateStateWrapper,
      );
    }
  }

  reRender() {
    this.innerHTML = "";
    this.appendChild(this.render());
    this.afterRender();
  }
  render(): Element {
    return <></>;
  }
  afterRender() {}
}
