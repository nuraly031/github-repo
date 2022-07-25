const body = document.querySelector("body");
const listForCards = document.querySelector(".list");
const searchForm = document.querySelector(".search");
const searchField = document.querySelector(".search__field");
let repositArray = [];

const debounce = (fn, ms) => {
  let timeout;
  return function (...arguments) {
    const fnCall = () => {
      fn.apply(this, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
};

body.addEventListener("click", (event) => {
  const className = event.target.className;
  if (className !== "search__field" || className !== "search__item") {
    clearAutocomplite();
  };
});
searchForm.addEventListener("click", addCard);
function addCard(event) {
  const evTar = event.target;
  if (evTar.className === "search__item") {
    const cardId = +event.target.id;
    repositArray.forEach((repo) => {
      if (cardId === repo["id"]) {
        searchField.value = "";
        clearAutocomplite();
        createCard(
          repo["name"],
          repo["owner"]["login"],
          repo["stargazers_count"]
        );
      };
    });
  };
};

function deleteAutocomp(event) {
  if (event.target.value === "") {
    if (document.querySelector(".search__list")) {
      document.querySelector(".search__list").remove();
    };
  };
};
const checkFieldIsEmptyTimeout = debounce(checkFieldIsEmpty, 1000);

searchField.addEventListener("keyup", checkFieldIsEmptyTimeout);
searchField.addEventListener("keyup", deleteAutocomp);
searchField.addEventListener("focusout", deleteAutocomp);
searchField.addEventListener("focus", checkFieldIsEmptyTimeout);

function checkFieldIsEmpty(event) {
  evTarget = event.target;
  fieldValue = evTarget.value;
  if (fieldValue !== "") {
    const searchList = document.createElement("ul");
    searchList.classList.add("search__list");
    if (!document.querySelector(".search__list")) {
      searchForm.appendChild(searchList);
    }
    clearAutocomplite();
    getRepos(fieldValue);
  }
}

function clearAutocomplite() {
  document.querySelectorAll(".search__item").forEach((elem) => elem.remove());
}

async function getRepos(value) {
  repositArray = [];
  if (!value) return;
  await fetch(
    `https://api.github.com/search/repositories?q=${value}&per_page=5`
  )
    .then((repoList) => repoList.json())
    .then((repoList) => {
      repoList.items.forEach((repo) => repositArray.push(repo));
      createAutocompliteElems(repositArray);
    })
    .catch((err) => console.log(err.message));
}

function createAutocompliteElems(array) {
  const searchList = document.querySelector(".search__list");
  let fragment = new DocumentFragment();
  array.forEach((repo) => {
    const item = document.createElement("li");
    item.classList.add("search__item");
    item.id = `${repo.id}`;
    item.textContent = `${repo.name}`;
    fragment.appendChild(item);
  });
  if (searchList) return searchList.append(fragment);
  return;
}

function createCard(name, owner, stars) {
  const lisrCard = document.createElement("div");
  lisrCard.classList.add("list__card");

  const user = document.createElement("div");
  user.classList.add("user");

  const cardName = document.createElement("p");
  cardName.classList.add("card__name");
  cardName.textContent = `Name: ${name}`;
  user.append(cardName);

  const cardOwner = document.createElement("p");
  cardOwner.classList.add("card__owner");
  cardOwner.textContent = `Owner: ${owner}`;
  user.append(cardOwner);

  const cardStars = document.createElement("p");
  cardStars.classList.add("card__owner");
  cardStars.textContent = `Stars: ${stars}`;
  user.append(cardStars);

  const btn = document.createElement("button");
  btn.classList.add("card__close");
  btn.setAttribute("type", "button");

  lisrCard.append(user);
  lisrCard.appendChild(btn);
  return listForCards.append(lisrCard);
}

function deleteCard(event) {
  const closeClick = event.target.className;
  if (closeClick !== "card__close") return;
  const card = event.target.closest(".list__card");
  card.remove();
}
listForCards.addEventListener("click", deleteCard);
