class searchBox {
  
  constructor(elementId, apiKey) {
    this.elementId = elementId;
    this.apiKey = apiKey;
    this.searchResultsElementId = 'searchboxjs-search-results';
    this.loopbackId = 0;
    this.acceptLanguage = null;
    this.callbacks = {};
  }
  
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  init() {
    this.searchElement = document.getElementById(this.elementId);
    if(!this.searchElement) throw new Error('Element not found');

    this.searchElement.classList.add('searchboxjs-input');
    this.#attachSearchResultsElement();

    this.searchElement.addEventListener("keyup", this.#keyUpHandler.bind(this));

    document.addEventListener('click', (event) => {
      if (!this.searchElement.contains(event.target) && !this.searchResults.contains(event.target)) {
        this.searchResults.style.display = 'none';
      }
    });
  }

  #createSearchResultsElement() {
    const searchResultsElement = document.createElement('div');
    searchResultsElement.id = this.searchResultsElementId;
    searchResultsElement.classList.add('searchboxjs-search-results');
    this.searchResults = searchResultsElement;
    return searchResultsElement;
  }

  #attachSearchResultsElement() {
    const searchResultsElement = this.#createSearchResultsElement();
    this.searchElement.parentNode.insertBefore(searchResultsElement, this.searchElement.nextSibling);
  }

  #keyUpHandler(event) {
    this.loopbackId++;
    event.preventDefault();
    const url = `https://api.opengeoapi.com?q=${encodeURIComponent(event.target.value)}&namedetails=1&addressdetails=1&token=${this.apiKey}${(this.acceptLanguage) ? '&accept-language=' + this.acceptLanguage : ''}`;
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-loopback-id': this.loopbackId,
        'x-token': this.apiKey,
        'Access-Control-Expose-Headers': 'X-Loopback-Id'
      }
    })
    .then(response => {
      const loopbackId = response.headers.get('X-Loopback-Id');
      return response.json();
    })
    .then(data => {
      this.searchResults.style.display = 'block';
      this.searchResults.innerHTML = "";
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const div = document.createElement("div");
        div.innerHTML = item.display_name;

        div.addEventListener('click', (e) => {
          if (this.callbacks.itemSelected) {
            this.callbacks.itemSelected(item);
            this.searchResults.style.display = 'none';
          }
        });

        this.searchResults.appendChild(div);
      }
    });
  }
}

// Check if we're in a module environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
module.exports = searchBox;
} else {
// For environments without modules (like browsers), attach to the global object
window.searchBox = searchBox;
}

// For environments that support ES6 modules, export the class
export default searchBox;