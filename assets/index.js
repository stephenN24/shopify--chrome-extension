const copySVG =
  '<svg height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.002 512.002" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <polygon style="fill:#CFF09E;" points="174.475,131.664 211.409,131.664 211.409,16.977 15.593,16.977 15.593,380.336 174.475,380.336 "></polygon> <polygon style="fill:#CFF09E;" points="373.389,131.664 370.291,131.664 370.291,246.349 494.324,246.349 "></polygon> </g> <path style="fill:#507C5C;" d="M496.407,309.978c-8.61,0-15.593,6.981-15.593,15.593v153.857H190.068v-99.092V147.257h21.342 h124.033H354.7v99.092c0,8.612,6.982,15.593,15.593,15.593h124.034c6.382,0,12.119-3.889,14.484-9.817 c2.364-5.928,0.876-12.699-3.755-17.09L384.121,120.35c-0.128-0.122-0.267-0.226-0.398-0.343c-0.192-0.17-0.384-0.341-0.583-0.504 c-0.186-0.148-0.376-0.285-0.568-0.424c-0.214-0.156-0.426-0.313-0.649-0.458c-0.184-0.12-0.374-0.229-0.563-0.341 c-0.242-0.145-0.482-0.288-0.733-0.421c-0.178-0.094-0.36-0.175-0.541-0.26c-0.271-0.129-0.541-0.259-0.82-0.373 c-0.173-0.07-0.351-0.128-0.525-0.193c-0.293-0.108-0.583-0.215-0.883-0.304c-0.187-0.056-0.377-0.097-0.568-0.147 c-0.293-0.075-0.583-0.154-0.881-0.214c-0.245-0.048-0.493-0.076-0.741-0.114c-0.249-0.036-0.494-0.083-0.747-0.108 c-0.507-0.05-1.018-0.078-1.531-0.078h-3.098h-28.631L225.236,5.665c-2.896-2.747-6.736-4.279-10.729-4.279h-3.098l0,0l0,0H15.593 C6.982,1.386,0,8.367,0,16.979v363.359c0,8.612,6.982,15.593,15.593,15.593h143.29v99.092c0,8.612,6.982,15.593,15.593,15.593 h321.933c8.61,0,15.593-6.981,15.593-15.593V325.571C512,316.959,505.019,309.978,496.407,309.978z M385.884,230.756v-65.755 l69.34,65.755H385.884z M227.001,50.316l69.338,65.755h-69.338V50.316z M31.186,364.743V32.572h164.629l0.002,83.499h-21.342 c-8.61,0-15.593,6.981-15.593,15.593v233.079H31.186z"></path> </g></svg>';

const handleCopyToClipboard = () => {
  const buttons = document.querySelectorAll("button.copy");
  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      button.closest("li").querySelector("input").select();
      document.execCommand("copy");
      button.textContent = "Copied!";
      button.style.backgroundImage =
        "linear-gradient(160deg, #0093e9 0%, #80d0c7 100%)";
      button.style.color = "white";
    });
  });
};

const handleRedirects = () => {
  const links = document.querySelectorAll(".redirectLink");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const url = e.target.getAttribute("data-url");
      if (url) {
        chrome.tabs.create({ url: url });
      }
    });
  });
};

const buildInfoToCopyHTML = (info) => {
  let html = "";
  for (let i of info) {
    const [title, value] = i.split("->");
    html += `<li>
            <span class="title">${capitalizeFirstLetter(title)} </span>
            <input type="text" value="${value}" readonly>
            <button class="copy">${copySVG}</button></li>`;
  }

  return html;
};

const buildInfoToRedirectHTML = (info) => {
  let html = "";
  for (let i of info) {
    const [title, value] = i.split("->");
    html += `<li>
            <span class="title">${capitalizeFirstLetter(
              title.replace("_", " ")
            )} &#128279;</span>
            <a class="redirectLink" data-url=${value} href="#">${value}</a>
            </li>`;
  }

  return html;
};

const buildHTML = (info) => {
  const shopifyCopyInfo = info.shopify.copy;
  const shopifyRedirectInfo = info.shopify.redirect;
  const boostCopyInfo = info.boost.copy;
  const boostRedirectInfo = info.boost.redirect;
  let html = `<ul> <h1>ShopifyxBoostSD</h1>`;
  html += buildInfoToCopyHTML(shopifyCopyInfo);
  html += buildInfoToRedirectHTML(shopifyRedirectInfo);
  html += buildInfoToCopyHTML(boostCopyInfo);
  html += buildInfoToRedirectHTML(boostRedirectInfo);
  html += `</ul>`;

  return html;
};

const constructAdminRedirectsLinks = async (URL, shopWithoutDomain) => {
  try {
    const response = await fetch(URL);
    if (!response.ok) {
    }
    const data = await response.json();
    if (data.collection) {
      const adminRedirectURL = `https://admin.shopify.com/store/${shopWithoutDomain}/collections/${data.collection.id}`;
      return adminRedirectURL;
    }
    if (data.product) {
      const adminRedirectURL = `https://admin.shopify.com/store/${shopWithoutDomain}/products/${data.product.id}`;
      return adminRedirectURL;
    }
  } catch (error) {
    console.log("Failed while fetching JSON from URL: ", error);
  }
};

const constructURLLink = (location, id) => {
  try {
    const redirectLinks = {};
    const currentURL = new URL(location.href);
    const origin = currentURL.origin;
    const collectionsAll = origin + "/collections/all";
    redirectLinks.collections_all = collectionsAll;
    currentURL.searchParams.set("preview_theme_id", id);

    redirectLinks.preview_link = currentURL.toString();

    currentURL.search = "";
    if (
      currentURL.pathname.includes("/products") ||
      currentURL.pathname.includes("/collections")
    ) {
      const jsonInfoLink = currentURL.toString() + ".json";
      redirectLinks.current_page_JSON = jsonInfoLink;
    }
    return redirectLinks;
  } catch (error) {
    console.log(error);
  }
};

const prepareInfo = async (data) => {
  const shopifyInfo = JSON.parse(data.shopifyInfo);
  const location = JSON.parse(data.location);
  const boostVersions = JSON.parse(data.boostVersions);

  let info = {
    shopify: { copy: [], redirect: [] },
    boost: { copy: [], redirect: [] },
  };
  for (let key in shopifyInfo) {
    if (key == "shop") {
      info.shopify.copy.push(`Shop->${shopifyInfo[key]}`);
    }
    if (key == "theme") {
      info.shopify.copy.push(`Theme ID->${shopifyInfo[key].id}`);
      info.shopify.copy.push(`Theme Name->${shopifyInfo[key].name}`);
    }
  }
  info.shopify.copy.push(
    `Other->country:${shopifyInfo.country}, currency:${shopifyInfo.currency.active}`
  );

  const redirectlinks = constructURLLink(location, shopifyInfo.theme.id);
  for (let key in redirectlinks) {
    if (key === "preview_link") {
      info.shopify.copy.push(
        `${capitalizeFirstLetter(key.replace("_", " "))}->${redirectlinks[key]}`
      );
    } else {
      info.shopify.redirect.push(
        `${capitalizeFirstLetter(key)}->${redirectlinks[key]}`
      );
    }
  }

  let versions = "";
  for (let key in boostVersions) {
    versions += "" + boostVersions[key];
  }

  let shopWithoutDomain = shopifyInfo.shop.replace(".myshopify.com", "");

  if (Object.values(boostVersions).length != 0) {
    info.boost.copy.push(`Boost Versions->${versions}`);
    info.boost.redirect.push(
      `Shopify Integration->https://admin.shopify.com/store/${shopWithoutDomain}/apps/product-filter-search/shopify-integration`
    );
  }

  if (redirectlinks.current_page_JSON) {
    await constructAdminRedirectsLinks(
      redirectlinks.current_page_JSON,
      shopWithoutDomain
    ).then((response) => {
      if (response) {
        info.shopify.redirect.push(`This Page Admin->${response}`);
      }
    });
  }

  return info;
};

const main = async () => {
  try {
    const response = await chrome.storage.local.get("dataForPopup200");
    const data = response.dataForPopup200;

    const shopifyInfoElm = document.querySelector("#popup");

    const shopifyInfoParsed = JSON.parse(data.shopifyInfo);

    if (!shopifyInfoParsed || !shopifyInfoParsed.shop) {
      shopifyInfoElm.innerHTML =
        "<h1>Refresh the page on the Shopify Store Front</h1>";
      return;
    }

    const info = await prepareInfo(data);

    shopifyInfoElm.innerHTML = buildHTML(info);
    handleCopyToClipboard();
    handleRedirects();
  } catch (error) {
    console.log(error);
  }
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("loading", message);
  if (message.action == "pageStartedLoading") {
    document.querySelector(
      ".alert"
    ).innerHTML = `<h3 style="color: red;">&#x26A0; You have toggled the popup while the page was loading,to ensure the information is relatad to the current store page, the logic will auto refresh once the page finishes loading 🔃 </h3>`;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action == "pageLoaded") {
    document.querySelector(
      ".alert"
    ).innerHTML = `<h3 style="color: red;">&#x26A0; You have toggled the popup while the page was loading,to ensure the information is relatad to the current store page, the logic will auto refresh once the page finishes loading 🔃 </h3>`;
    setTimeout(() => {
      main();
      const alertElm = document.querySelector(".alert");
      if (alertElm) {
        alertElm.innerHTML = "";
      }
      console.log("2 seconds");
    }, 2000);
  }
});

window.addEventListener("load", () => {
  main();
});

function capitalizeFirstLetter(val) {
  if (typeof val !== "string") return "";
  return val
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
