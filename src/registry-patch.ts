function patchRegistryForMwc(customElements) {
  const originalDefine = customElements.define;
  customElements.define = function (tagName, ctor) {
    if (tagName.startsWith('mwc') && customElements.get(tagName)) {
      // <mwc-*> element is already registered, do not attempt to re-define
      return;
    }
    originalDefine.call(customElements, tagName, ctor);
  };
}

patchRegistryForMwc(customElements);