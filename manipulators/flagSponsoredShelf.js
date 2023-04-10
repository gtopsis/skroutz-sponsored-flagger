function flagSponsoredShelf() {
  const h4ElementsFlagged = document.querySelectorAll(
    "h4.sponsored-flagged-shelf"
  );

  if (h4ElementsFlagged.length === 0) {
    sponsoredShelfCount = 0;
  }

  //

  const h4Elements = document.querySelectorAll(
    "h4:not(.sponsored-flagged-shelf)"
  );

  if (!h4Elements || h4Elements.length === 0) {
    return;
  }

  Array.from(h4Elements).forEach((h4Element) => {
    if (h4Element && h4Element.textContent === "Sponsored") {
      sponsoredShelfCount++;

      h4Element.classList.add("sponsored-flagged-shelf");
      h4Element.classList.add("sponsored-flagged-shelf-label");
      h4Element.parentElement.classList.add("sponsored-flagged-shelf");

      h4Element.innerHTML =
        language == "EN" ? "Sponsored stores" : "Προωθούμενα καταστήματα";

      visible
        ? h4Element.parentElement.classList.remove("display-none")
        : h4Element.parentElement.classList.add("display-none");
    }
  });
}
