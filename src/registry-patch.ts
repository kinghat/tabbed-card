function patchRegistryForMwc(customElements: CustomElementRegistry) {
  const originalDefine = customElements.define;
  customElements.define = function (tagName: string, ctor: CustomElementConstructor, options?: ElementDefinitionOptions) {
    if (tagName.startsWith('mwc') && customElements.get(tagName)) {
      // <mwc-*> element is already registered, do not attempt to re-define
      return;
    }
    originalDefine.call(customElements, tagName, ctor, options);
  };
}

patchRegistryForMwc(customElements);
export {};
