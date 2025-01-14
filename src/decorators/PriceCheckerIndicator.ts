import { Language } from "../enums/Language";
import { buyThroughSkroutzShippingCostRetriever } from "../retrievers/buyThroughSkroutzShippingCostRetriever";
import { buyThroughSkroutzRetriever } from "../retrievers/buyThroughSkroutzRetriever";
import { marketDataReceiver } from "../retrievers/marketDataRetriever";
import { State } from "../types/State";

interface LowestPriceData {
  formatted: string;
  unformatted: number;
  shopId: number;
}

export class PriceCheckerIndicator {
    private state: State;
    private btsPrice: number | undefined = undefined;
    private btsShippingCost: number | undefined = undefined;
    private lowestPriceData: LowestPriceData | undefined = undefined;

    constructor(state: State) {
        this.state = state;
    }

    public async start() {
        const offeringCard = document.querySelector("article.offering-card");

        if (!offeringCard) {
            return;
        }

        this.lowestPriceData = await marketDataReceiver();
        if (!this.lowestPriceData) {
            return;
        }

        this.btsPrice = buyThroughSkroutzRetriever();
        this.btsShippingCost = buyThroughSkroutzShippingCostRetriever();
        this.insertPriceIndication(offeringCard);
    }

    private insertPriceIndication(element: Element): void {
        const priceIndication = this.createPriceIndicationElement();
        element.insertBefore(priceIndication, element.children[1]);
    }

    private createPriceIndicationElement(): HTMLDivElement {
        const priceIndication = document.createElement("div");
        const colFlex = document.createElement("div");

        const shippingCost = this.btsShippingCost ?? 0;
        let isLowestPrice = false;
        if (!!this.btsPrice && !!this.lowestPriceData) {
            isLowestPrice = this.btsPrice + shippingCost <= this.lowestPriceData.unformatted;
        }

        const checkerStyle = isLowestPrice ? "info-label-positive" : "info-label-negative";

        priceIndication.classList.add("display-padding", "inline-flex-row", "price-checker-outline", checkerStyle);
        colFlex.classList.add("inline-flex-col");

        const icon = document.createElement("div");
        const brand = document.createElement("div");
        const information = document.createElement("div");
        const disclaimer = document.createElement("div");

        icon.classList.add("align-center", "icon-border");
        brand.classList.add("icon-border", "font-bold");
        information.classList.add("align-center", "font-bold");
        disclaimer.classList.add("align-end", "text-black");

        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("viewBox", "0 96 960 960");
        svgElement.setAttribute("width", "16");
        svgElement.setAttribute("height", "16");

        const img = document.createElement("img");
        img.src = "https://raw.githubusercontent.com/keybraker/reskroutzed/main/src/assets/icons/128.png";
        img.alt = "reSkroutzed";
        img.width = 16;
        img.height = 16;

        icon.appendChild(img);

        const lowestPrice = this.lowestPriceData ? this.lowestPriceData.unformatted : undefined;
        const formattedLowestPrice = lowestPrice?.toFixed(2);

        information.textContent = this.state.language === Language.ENGLISH
            ? `${formattedLowestPrice}€ is the lowest price with shipping apart from "Buy through Skroutz"`
            : `${formattedLowestPrice}€ είναι η χαμηλότερη τιμή με μεταφορικά εκτός "Αγορά μέσω Skroutz"`;
        information.title =  `(note that "Buy through Skroutz" is ${this.btsPrice}€ + ${shippingCost}€ shipping)`;
        colFlex.appendChild(information);

        const goToStoreButton = this.goToStoreButtonCreator(isLowestPrice);
        colFlex.appendChild(goToStoreButton);

        brand.textContent = "by reSkroutzed";
        brand.appendChild(icon);
        colFlex.appendChild(brand);

        priceIndication.appendChild(colFlex);

        return priceIndication;
    }

    private goToStoreButtonCreator(isLowestPrice: boolean): HTMLButtonElement {
        const goToStoreButton = document.createElement("button");
        const buttonStyle = isLowestPrice ? "go-to-shop-button-positive" : "go-to-shop-button-negative";

        goToStoreButton.classList.add(buttonStyle);
        goToStoreButton.textContent = this.state.language === Language.ENGLISH
            ? "Go to Shop"
            : "Μετάβαση στο κατάστημα";
        goToStoreButton.classList.add("custom-button-class");

        goToStoreButton.addEventListener("click", () => {
            const targetId = `shop-${this.lowestPriceData?.shopId}`;
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                targetElement.classList.add("lowest-price-store-highlight");
            }
        });

        return goToStoreButton;
    }
}
