//Global variables

const burgerIcon = $("#burger");
const navbarMenu = $("#nav-links");

const apiKey = "a447661e09msh17b913e41ecacfdp129f05jsn6e2975fac8c4";

const spotifyBaseUrl = "https://spotify23.p.rapidapi.com/search/";

const edamamBaseUrl = "https://edamam-recipe-search.p.rapidapi.com/search";

const surpriseMe = [
  "surprise",
  "cookie",
  "chocolate",
  "dessert",
  "spicy",
  "cake",
  "tapas",
  "sweet",
  "salty",
  "chilli",
  "bites",
  "burger",
  "buns",
  "bread",
  "grill",
  "cupcake",
];

//UTILITY FUNCTIONS

//extract info from local storage (get)
const getFromLocalStorage = (key, defaultValue) => {
  const parsedData = JSON.parse(localStorage.getItem(key));
  return parsedData ? parsedData : defaultValue;
};

//write info into local storage (set)
const writeToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

//empty local storage (clear)
const clearLS = () => {
  localStorage.clear();
};

//removes the designated container - target by ID
const removeContainer = (containerId) => {
  if (containerId) {
    $(`#${containerId}`).remove();
  }
};

//empty the designated container - target by ID
const emptyContainer = (containerId) => {
  if (containerId) {
    $(`#${containerId}`).empty();
    $(`#${containerId}`).off();
  }
};

const generateAlertModal = (message) => {
  const modal = ` <div class="modal is-active" id="modal">
    <div class="modal-background" id="modal-background"></div>
    <div
      class="modal-card"
      id="modal-event-details"
    >
    <div class="modal-card-body">
      <p class="mb-6">
        ${message}
      </p>
      </div>
      <footer class="modal-card-foot">
      <button class="button is-success" id="confirm">Okay</button>
      <button class="button modal-close" aria-label="close" id="close">No</button>
      </footer>
      </div>
    </div>`;
  $("#main").append(modal);
  const closeModal = () => {
    $("#modal").remove();
  };
  $("#confirm").click(closeModal);
  $("#close").click(closeModal);
};

const generateDeleteModal = (message, event) => {
  const modal = ` <div class="modal is-active" id="modal">
    <div class="modal-background" id="modal-background"></div>
    <div
      class="modal-card"
      id="modal-event-details"
    >
    <div class="modal-card-body">
      <p class="mb-6">
        ${message}
      </p>
      </div>
      <footer class="modal-card-foot">
      <button class="button is-success" id="confirm">Yes</button>
      <button class="button is-success" id="cancel">No</button>
      <button class="button modal-close" aria-label="close" id="close">No</button>
      </footer>
      </div>
    </div>`;

  $("#main").append(modal);

  const sendConfirmation = () => {
    $("#modal").remove();
    // my logic to remove the item from LS
    const target = event.target;

    // get the array from LS
    const getData = localStorage.getItem("myEvents");

    // PARSE IT
    const parsedData = JSON.parse(localStorage.getItem("myEvents"));

    // delete the item at target.id (index)
    const temp = parsedData.splice(target.id, 1);

    // saved the updated array back in LS with the same key
    localStorage.setItem("myEvents", JSON.stringify(parsedData));

    // delete the existing cards
    $("#container2").remove();

    // rerender you screen
    //pull my events from local storage using key name "myEvents"
    const savedEvents = getSavedEvents();

    //call function to render the saved events in cards
    renderSavedEvents(savedEvents);
    //deleteSavedEvent(e);
  };

  const closeModal = () => {
    $("#modal").remove();
  };
  $("#confirm").click(sendConfirmation);
  $("#cancel").click(closeModal);
  $("#close").click(closeModal);
};
//END UTILITY FUNCTIONS

//Functions

const renderError = (message, containerId) => {
  // create component
  const errorComponent = `<div class="notification is-danger is-light">
      <i class="fa-solid fa-triangle-exclamation"></i> ${message}
    </div>`;

  // append component to musicContainer
  containerId.append(errorComponent);
};

const renderAlert = (message, containerId) => {
  // create component
  const alertComponent = `<div class="empty is-light m-3"><p class="empty-message"><i class="fa-solid fa-circle-info"></i> ${message}</p>
  </div>`;

  // append component to musicContainer
  containerId.append(alertComponent);
};

//Constructing the URL for an API call
const constructUrl = (baseUrl, params) => {
  const queryParams = new URLSearchParams(params).toString();

  return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
};

//Fetching the data from an API
const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Failed to fetch data");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

//empty aside list, get update from local storage and renders list again
const updateAsideList = (theseChosenItems, tempId) => {
  $("#aside-list").empty();
  const remainingItems = 10 - theseChosenItems.length;
  $("#aside-list")
    .append(`<h4 class="aside-text mt-5">Your selected items:</h4><p class="remaining-count">${remainingItems} remaining slots </p><ul class="selected-items-list" id="selected-items-list">
  </ul>`);
  const createSelectedItem = (each) => {
    const selectedItemName = each.targetName;
    const selectedItemId = each.targetId;
    const selectedItemType = each.targetType;
    $("#selected-items-list")
      .append(`<div class="list-item"><li>${selectedItemName}</li><button
      class="button item-btn is-rounded is-small has-text-centered is-danger is-responsive"
      type="button"
      data-id=${selectedItemId}
      data-theme="clear"
      data-type=${selectedItemType}
      data-event=${tempId}
    >
      X
    </button>
  </div>`);
  };
  theseChosenItems.forEach(createSelectedItem);
};

//stores selected item into the event object in local storage
const handleItemSelection = (event) => {
  event.stopPropagation();
  const currentEventId = $("#event-select").attr("name");

  const targetId = $(event.target).attr("data-id");
  const targetName = $(event.target).attr("data-value");
  const targetType = $(event.target).attr("data-type");
  const targetPic = $(event.target).attr("data-pic");

  const chosenItem = {
    targetId,
    targetName,
    targetPic,
    targetType,
  };

  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex(
    (obj) => obj.eventId === currentEventId
  );
  const currentEvent = myEvents[currentEventIndex];

  const currentEventSelection = currentEvent[targetType];

  const itemExists = currentEventSelection.some(
    (item) => item.targetId === chosenItem.targetId
  );

  if (itemExists) {
    generateAlertModal(
      "This item has already been selected. Please pick another one."
    );
  } else {
    if (currentEventSelection.length < 10) {
      currentEventSelection.push(chosenItem);

      myEvents[currentEventIndex][targetType] = currentEventSelection;
      writeToLocalStorage("myEvents", myEvents);
    } else {
      generateAlertModal(
        "You've reached the limit of 10 items selected! Please remove some items from your selection to be able to add new ones."
      );
    }
  }

  updateAsideList(currentEventSelection, currentEventId);
};

//checks that the click happens on an add button
const handleItemClick = (event) => {
  event.stopPropagation();
  const target = $(event.target);
  const targetAdd = $(event.target).attr("data-action");

  if (target.is("button") && targetAdd === "add") {
    handleItemSelection(event);
  }
};

//render music cards in music container when selecting music (after API call)
const renderMusicCards = (items) => {
  if (items.length) {
    const createCard = (item) => {
      const playlistTitle = item.data.name;
      const ownerName = item.data.owner.name;
      const playlistCover = item.data.images.items[0].sources[0].url;
      const linkUrl = item.data.uri.substr(17);

      const playlistCard = `<div class="card api-card" id="music-card-${item.index}">
      <div class="card-image">
        <figure class="image is-4by3">
          <img
            src=${playlistCover}
            alt="album cover image"
          />
        </figure>
      </div>
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <p class="title is-4">${playlistTitle}</p>
            <p class="subtitle is-6">${ownerName}</p>
          </div>
        </div>
      </div>
      <footer class="card-footer">
        <button
          class="button is-ghost card-footer-item"
          type="button"
          data-id="${linkUrl}"
          data-value="${playlistTitle}"
          data-pic="${playlistCover}" data-type="music" data-action="add"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
        <a
          href="https://open.spotify.com/playlist/${linkUrl}"
          class="card-footer-item" target="_blank"
          ><i class="fa-brands fa-spotify"></i
        ></a>
      </footer>
    </div>`;

      return playlistCard;
    };

    const allCards = items.map(createCard).join("");

    const musicContainer = $("#music-card-container");
    emptyContainer("music-card-container");
    musicContainer.append(allCards);
    musicContainer.click(handleItemClick);
  } else {
    renderError("No results found.", musicContainer);
  }
};

//render food cards in food container when selecting food (after API call)
const renderFoodCards = (items) => {
  if (items.length) {
    const createCard = (item, i) => {
      const recipeTitle = item.recipe.label;
      const source = item.recipe.source;
      const recipeImage = item.recipe.image;
      const linkUri = item.recipe.url;

      const foodCard = `<div class="card api-card" id="food-card-${i}">
      <div class="card-image">
        <figure class="image is-4by3">
          <img
            src=${recipeImage}
            alt="recipe cover image"
          />
        </figure>
      </div>
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <p class="title is-4">${recipeTitle}</p>
            <p class="subtitle is-6">${source}</p>
          </div>
        </div>
      </div>
      <footer class="card-footer">
        <button class="button is-ghost card-footer-item"
        type="button"
          data-id="${linkUri}"
          data-value="${recipeTitle}"
          data-pic="${recipeImage}" data-type="food" data-action="add">
          <i class="fa-solid fa-plus"></i>
        </button>
        <a
          href=${linkUri}
          class="card-footer-item" target="_blank"
          ><i class="fa-solid fa-earth-americas"></i
        ></a>
      </footer>
    </div>`;

      return foodCard;
    };

    const allCards = items.map(createCard).join("");

    const foodContainer = $("#food-card-container");
    emptyContainer("food-card-container");
    foodContainer.append(allCards);
    foodContainer.click(handleItemClick);
  } else {
    renderError("No results found.", foodContainer);
  }
};

//Handling form submit in music-container section - Spotify api call
const handleMusicSubmit = async (event) => {
  event.stopPropagation();
  event.preventDefault();

  try {
    const searchQuery = $("#music-type").val();
    const searchType = "playlists";

    if (searchQuery) {
      const baseUrl = spotifyBaseUrl;

      const url = constructUrl(baseUrl, { q: searchQuery, type: searchType });

      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
          "X-RapidAPI-Key": apiKey,
        },
      };

      const data = await fetchData(url, options);

      renderMusicCards(data?.playlists?.items || []);
    } else {
      searchInput.addClass("is-danger");
    }
  } catch (error) {
    renderError(
      "Sorry something went wrong and we are working on fixing it.",
      musicContainer
    );
  }
};

//select a word at random from the surpriseMe array
const getSurpriseWord = () => {
  const surpriseWordIndex = Math.floor(Math.random() * surpriseMe.length);
  return surpriseMe[surpriseWordIndex];
};
//get item selected by user from select list
const getUserChoice = () => {
  const userChoice = $("#food-select").find(":selected").attr("value");

  return userChoice === "surprise-me"
    ? getSurpriseWord()
    : $("#food-select").find(":selected").attr("value");
};

//Handling food submit in food-container section - Edamam api call
const handleFoodSubmit = async (event) => {
  event.stopPropagation();
  event.preventDefault();

  try {
    const searchQuery = getUserChoice();

    if (searchQuery) {
      const baseUrl = edamamBaseUrl;

      const url = constructUrl(baseUrl, { q: searchQuery });

      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Host": "edamam-recipe-search.p.rapidapi.com",
          "X-RapidAPI-Key": apiKey,
        },
      };

      const data = await fetchData(url, options);

      renderFoodCards(data?.hits || []);
    } else {
      searchInput.addClass("is-danger");
    }
  } catch (error) {
    renderError(
      "Sorry something went wrong and we are working on fixing it.",
      foodContainer
    );
  }
};

//checks that there is at least 1 food/music item selected before moving on
const atLeastOneItem = (e) => {
  const targetId = $(e.target).attr("data-event");
  const targetType = $(e.target).attr("data-theme");

  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex(
    (obj) => obj.eventId === targetId
  );

  const chosenItemsLength = myEvents[currentEventIndex][targetType].length;
  return chosenItemsLength;
};

// handles the click on "Save&Continue" button
const handleAsideClick = (e) => {
  e.stopPropagation();

  const target = $(e.target);
  const targetType = $(e.target).attr("data-theme");

  if (target.is("button")) {
    if (targetType === "food") {
      const status = atLeastOneItem(e);
      status
        ? renderMusicSection(e)
        : generateAlertModal("Please choose at least one food item");
    } else if (targetType === "music") {
      const status = atLeastOneItem(e);
      status
        ? renderEventCard(e)
        : generateAlertModal("Please choose at least one Playlist");
    } else if (targetType === "clear") {
      const itemEventId = $(e.target).attr("data-event");
      const itemType = $(e.target).attr("data-type");
      const itemId = $(e.target).attr("data-id");
      const myEvents = getFromLocalStorage("myEvents");
      const currentEventIndex = myEvents.findIndex(
        (obj) => obj.eventId === itemEventId
      );
      const itemTypeArray = myEvents[currentEventIndex][itemType];

      const itemIndex = itemTypeArray.findIndex(
        (obj) => obj.targetId === itemId
      );
      itemTypeArray.splice(itemIndex, 1);

      myEvents[currentEventIndex][itemType] = itemTypeArray;
      writeToLocalStorage("myEvents", myEvents);
      updateAsideList(itemTypeArray, itemEventId);
    }
  }
};

//render the music section in the main container
const renderMusicSection = (e) => {
  emptyContainer("main");
  window.scrollTo(0, 0);
  const tempId = $(e.target).attr("data-event");

  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex((obj) => obj.eventId === tempId);
  const chosenMusicItems = myEvents[currentEventIndex].music;
  const displayName = myEvents[currentEventIndex].eventDisplayName;

  $("#main").append(`<section class="section music-section" id="music-section">
    <div class="container has-text-centered" id="music-container">
      <form class="form" id="music-selection">
        <p class="music-text-div">Please select your desired music and click "Submit"</p>
        <div
          class="form-field is-flex-direction-row is-align-content-center my-5"
        >
          <input type="text" class="music-input" id="music-type" />
  
          <button
            class="button is-rounded is-medium has-text-centered is-primary is-responsive"
            type="submit"
            id="music-submit-btn"
          >
            Submit
          </button>
        </div>
      </form>
      <div class="card-container mt-3" id="music-card-container">
      </div>
    </div>
    <div class="aside music-aside has-text-centered" id="music-aside">
      <div class="aside-list my-5" id="aside-list">
        <h4 class="aside-text mt-5">Your selected items:</h4><p class="remaining-count">10 remaining slots </p>
        <ul class="selected-items-list" id="selected-items-list">
        </ul>
      </div>
      <div class="aside-event my-5">
        <h4 class="aside-text m-5">For the event</h4>
        <p class="event-select" name=${tempId} id="event-select">${displayName}</p>
      </div>
      <div class="aside-btn my-5">
        <button
          class="button is-rounded is-medium has-text-centered is-primary is-responsive my-5"
          type="button"
          id="music-save-btn"
          data-theme="music"
          data-event=${tempId}
        >
          Save & Continue
        </button>
      </div>
    </div>
    </section>`);

  const musicCardContainer = $("#music-card-container");
  renderAlert(
    "No search submitted yet. Please enter a music genre, a band or artist name and click submit in the form above.",
    musicCardContainer
  );

  $("#music-selection").submit(handleMusicSubmit);

  updateAsideList(chosenMusicItems, tempId);
  $("#music-aside").click(handleAsideClick);
};

//render the food section in the main container
const renderFoodSection = (eventId) => {
  emptyContainer("main");
  window.scrollTo(0, 0);
  const tempId = eventId;

  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex((obj) => obj.eventId === tempId);

  const chosenFoodItems = myEvents[currentEventIndex].food;
  const displayName = myEvents[currentEventIndex].eventDisplayName;

  $("#main").append(`<section class="section food-section" id="food-section">
    <div class="container has-text-centered" id="food-container">
      <form class="form" id="food-selection">
        <p class="food-text-div">Please select your desired food type in the list and click "Submit"</p>
  
        <div
          class="form-field is-flex-direction-row is-align-content-center my-5"
        >

  
          <button
            class="form-button button is-rounded is-medium has-text-centered is-primary is-responsive"
            type="submit"
            id="food-submit-btn"
          >
            Submit
          </button>
        </div>
      </form>
      <div class="card-container mt-3" id="food-card-container"> 
      </div>
    </div>
    <div class="aside food-aside has-text-centered" id="food-aside">
      <div class="aside-list my-5" id="aside-list">
        <h4 class="aside-text mt-5">Your selected items:</h4><p class="remaining-count">10 remaining slots </p>
        <ul class="selected-items-list" id="selected-items-list">
        </ul>
      </div>
      <div class="aside-event my-5">
        <h4 class="aside-text m-5">For the event</h4>
        <p class="event-select" name=${tempId} id="event-select">${displayName}</p>
      </div>
      <div class="aside-btn save-btn my-5">
        <button
          class="button is-rounded is-medium has-text-centered is-primary is-responsive my-5"
          type="button"
          id="food-save-btn"
          data-theme="food"
          data-event="${tempId}"
        >
          Save & Continue
        </button>
      </div>
    </div>
    </section>`);

  const foodCardContainer = $("#food-card-container");
  renderAlert(
    "No search submitted yet. Please choose a type of cuisine and click submit in the form above.",
    foodCardContainer
  );

  $("#food-selection").submit(handleFoodSubmit);

  updateAsideList(chosenFoodItems, tempId);
  $("#food-aside").click(handleAsideClick);
};

//render small cards on event card to display selected playlists
const renderSmallMusicCard = (selectedMusic) => {
  const createSmallCard = (each) => {
    $("#small-music-card-container")
      .append(`<div class="card small-card" id="small-card-1">
    <div class="card-image">
      <figure class="image is-4by3">
        <img
          src=${each.targetPic}
          alt="recipe cover image"
        />
      </figure>
    </div>
    <div class="small-card-content">
      <div class="media">
        <div class="media-content">
          <p class="title is-6">${each.targetName}</p>
        </div>
      </div>
    </div>
    </div>`);
  };

  selectedMusic.forEach(createSmallCard);
};

//render small cards on event card to display selected recipes
const renderSmallFoodCard = (selectedFood) => {
  const createSmallCard = (each) => {
    $("#small-food-card-container")
      .append(`<div class="card small-card" id="small-card-1">
    <div class="card-image">
      <figure class="image is-4by3">
        <img
          src=${each.targetPic}
          alt="recipe cover image"
        />
      </figure>
    </div>
    <div class="small-card-content">
      <div class="media">
        <div class="media-content">
          <p class="title is-6">${each.targetName}</p>
        </div>
      </div>
    </div>
    </div>`);
  };

  selectedFood.forEach(createSmallCard);
};

const handleEditClick = (e) => {
  e.stopPropagation();
  const eventId = $(event.target).attr("data-event");

  renderFoodSection(eventId);
};

const handlePrintCard = () => {
  window.print();
};

const renderEventCard = (e) => {
  emptyContainer("main");
  window.scrollTo(0, 0);

  const currentEventId = $(e.target).attr("data-event");
  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex(
    (obj) => obj.eventId === currentEventId
  );
  const currentEvent = myEvents[currentEventIndex];
  const eventId = currentEvent.eventId;
  const eventDisplayName = currentEvent.eventDisplayName;
  const eventDate = currentEvent.eventDate;
  const eventLocation = currentEvent.eventLocation.replace(
    /\b[a-z]/g,
    function (letter) {
      return letter.toUpperCase();
    }
  );
  const eventDescription = currentEvent.eventDescription;
  const eventOrganiser = currentEvent.eventOrganiser.replace(
    /\b[a-z]/g,
    function (letter) {
      return letter.toUpperCase();
    }
  );
  const organiserEmail = currentEvent.organiserEmail;

  $("#main")
    .append(`<section class="print-card-container event-card-section has-text-centered ">
    <div class="card-design section-to-print event-card-container m-5">
      <h2>You are officially invited to : </h2>
      <p class="event-name"><span class="h2-title">${eventDisplayName.replace(
        /\b[a-z]/g,
        function (letter) {
          return letter.toUpperCase();
        }
      )}</span></p>
      <div class="event-details">
      <p class="event-card-details key-info">
      <ion-icon name="calendar-outline"></ion-icon>  <span>${eventDate}</span></p>
      <p class="event-card-details key-info"><ion-icon name="location-outline"></ion-icon>  <span>${eventLocation}</span> </p>
      <p class="event-card-details key-info">
        And there is much more to know about this event <span>${eventDescription}</span>
      </p>
      <p class="event-card-details key-info">It'll be a blast and we really hope to see you there!</p>
      </div>
  
      <div class="event-selection-container">
      <hr>
      <div class="event-food-container">
        <p class="event-card-text key-info">
          This is the food on offer at the event
        </p>
        <div class="small-card-container" id="small-food-card-container">
        </div>
      </div>
      <hr>
      <div class="event-music-container">
        <p class="event-card-text key-info">
          We will be enjoying these playlists
        </p>
        <div class="small-card-container" id="small-music-card-container">
        </div>
      </div>
      <hr>
      </div>
      <div class="end-text" id="end-text">
        <p>
          This event is organised and managed by <span>${eventOrganiser}</span>.  </span>
        </p>
      </div>
    </div>
    <div class="btn-div m-5">
      <button class="button print-btn is-rounded is-big is-primary is-responsive m-2" id="print-btn" type="button" data-action="print">
        Print this event card
      </button>
     
      <a class="button selection-btn is-rounded has-text-centered is-primary is-responsive is-big m-2" id="selection-btn" href="./event.html">Go to my saved events</a>
    </div>
    </section>`);

  const selectedFood = myEvents[currentEventIndex].food;
  const selectedMusic = myEvents[currentEventIndex].music;

  renderSmallFoodCard(selectedFood);
  renderSmallMusicCard(selectedMusic);

  $("#selection-btn").click(handleEditClick);
  $("#print-btn").click(handlePrintCard);
};

const handleEventCardClick = (e) => {
  e.stopPropagation();
  e.preventDefault();
  const target = $(e.target);
  const targetId = $(e.target).attr("id");

  if (targetId === "event-card-btn") {
    renderEventCard(e);
  }
};

const deleteSavedEvent = (event) => {
  const confirmation = generateDeleteModal(
    "Are you sure you want to delete this event?",
    event
  );
};

//render Saved events
const renderSavedEvents = (items) => {
  $("#saved-events-container").append(`<div id="container2"></div>`);

  if (items.length) {
    const createCard = (item, i) => {
      const eventId = item.eventId;
      const capitalisedEventName = item.eventDisplayName.replace(
        /\b[a-z]/g,
        function (letter) {
          return letter.toUpperCase();
        }
      );
      const eventDate = item.eventDate;
      const eventLocation = item.eventLocation;

      const eventFood = item.food;
      const eventFoodList = [];
      if (!eventFood) {
        eventFoodList.push("No food selected yet");
      } else {
        for (let i of eventFood) {
          eventFoodList.push(i.targetName);
        }
      }

      const eventMusic = item.music;
      const eventMusicList = [];
      if (!eventMusic) {
        eventMusicList.push("No music selected yet");
      } else {
        for (let i of eventMusic) {
          eventMusicList.push(i.targetName);
        }
      }

      $("#container2")
        .append(`<div class="event-page-card m-3 card py-5 my-5" id="${eventId}">
      <h2
        class="title is-4 card-header-title has-text-centered"
        id="event-page-card-name"
      >
        ${capitalisedEventName}
      </h2>
      <div class="event-details card my-5">
        <ul class="card-content m-0 pt-0">
          <li class="event-list-item" id="event-date-1">Date : ${eventDate}</li>
          <li class="event-list-item" id="event-location-1">Location : 
            ${eventLocation}
          </li>
          <li class="event-list-item" id="event-food">Selected food: ${eventFoodList}</li>
          <li class="event-list-item" id="event-music">Selected playlists: ${eventMusicList}</li>
        </ul>
        <div class="delete-button columns is-centered" id="delete-button">
        <button class="button is-rounded is-small is-primary is-responsive event-card-btn mx-1 mb-5" id="event-card-btn"
        type="button"
          data-event="${eventId}">
          See full event card</i>
        </button>
        <button id="${i}" class="button is-rounded is-small is-danger is-responsive event-card-btn mx-1 mb-5 delete-button" 
        type="button"
          data-event="${eventId}">
          Delete</i>
        </button>
        </div>
      </div>
    </div>`);

      $(`#${i}`).click(deleteSavedEvent);
    };

    items.forEach((item, i) => {
      createCard(item, i);
    });

    $("#saved-events-container").click(handleEventCardClick);
  } else {
    const savedEventsContainer = $("#saved-events-container");
    renderError("You have no saved events.", savedEventsContainer);
  }
};

const getSavedEvents = () => {
  return getFromLocalStorage("myEvents", []);
};

// On load
const onReady = () => {
  //event listener for mobile burger bar menu for html pages -Youtube NetNinja Bulma
  burgerIcon.click(() => {
    navbarMenu.toggleClass("is-active");
  });

  const savedEvents = getSavedEvents();

  renderSavedEvents(savedEvents);
};

$(document).ready(onReady);
