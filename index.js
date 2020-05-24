//---------------------------- Переменные с обьектами HTML странници------------------------------

const formSearch = document.querySelector(".form-search"),
  inputCitiesFrom = formSearch.querySelector(".input__cities-from"),
  dropdownCitiesFrom = formSearch.querySelector(".dropdown__cities-from"),
  inputCitiesTo = formSearch.querySelector(".input__cities-to"),
  dropdownCitiesTo = formSearch.querySelector(".dropdown__cities-to"),
  inputDateDepart = formSearch.querySelector(".input__date-depart"),
  buttonSearch = formSearch.querySelector(".button__search"),
  cheapestTicket = document.getElementById("cheapest-ticket"),
  otherCheapTickets = document.getElementById("other-cheap-tickets"),
  Max_Count = 10;

//---cities.json------------------------------------База даных городов----------------------------------

let city = [];
let nums = [];

const cityesApi = "http://api.travelpayouts.com/data/ru/cities.json",
  proxy = "https://cors-anywhere.herokuapp.com/",
  API_KEY = "0b98c114d0a1427bd4948a1bbfc1bf04",
  calendarApi = "http://min-prices.aviasales.ru/calendar_preload";

//-------------------------------------Функции нашего приложения------------------------------------

const getData = (url, callback) => {
  const request = new XMLHttpRequest();

  request.open("GET", url);

  request.addEventListener("readystatechange", () => {
    if (request.readyState !== 4) return;

    if (request.status === 200) {
      callback(request.response);
    } else {
      console.error(request.status);
    }
  });

  request.send();
};

const showCity = (input, list) => {
  list.textContent = "";

  if (input.value === "") return false;
  const filterCity = city.filter((item) => {
    const fixItem = item.name.toLowerCase();
    return fixItem.startsWith(input.value.toLowerCase());
  });
  filterCity.forEach((item) => {
    let li = document.createElement("LI");
    li.classList.add("dropdown__city");
    li.textContent = item.name;
    list.append(li);
  });
};

const handlerCity = (event, input, list) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === "li") {
    input.value = target.textContent;
    list.textContent = "";
  }
};

const getNameCity = (code) => {
  const objCity = city.find((item) => item.code === code);
  return objCity.name;
};

const getDate = (date) => {
  return new Date(date).toLocaleString("ru", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getChanges = (num) => {
  if (num) {
    return num === 1 ? "С 1 пересадкой" : "С 2 пересадкой";
  } else {
    return "Без пересадок";
  }
};

const getLinkAviaSeils = (data) => {
  let link = "https://www.aviasales.ru/search/";

  link += data.origin;

  const date = new Date(data.depart_date);

  const day = date.getDate();

  link += day < 10 ? "0" + day : day;

  const month = date.getMonth() + 1;

  link += month < 10 ? "0" + month : month;

  link += data.destination;

  console.log(data);

  return link + 1;
};

const createCard = (data) => {
  const ticket = document.createElement("article");
  ticket.classList.add("ticket");
  let deep = "";

  if (data) {
    deep = `
       <h3 class="agent">${data.gate}</h3>
      <div class="ticket__wrapper">
        <div class="left-side">
          <a href="${getLinkAviaSeils(
            data
          )}" target="_blank" class="button button__buy">Купить
            за ${data.value}₽</a>
        </div>
        <div class="right-side">
          <div class="block-left">
            <div class="city__from">Вылет из города
              <span class="city__name">${getNameCity(data.origin)}</span>
            </div>
            <div class="date">${getDate(data.depart_date)}</div>
          </div>

          <div class="block-right">
            <div class="changes">${getChanges(data.number_of_changes)}</div>
            <div class="city__to">Город назначения:
              <span class="city__name">${getNameCity(data.destination)}</span>
            </div>
          </div>
        </div>
      </div>
       `;
  } else {
    deep = "<h3>К сожелению на текущую дату билетов не нашлось!</h3>";
  }

  ticket.insertAdjacentHTML("afterbegin", deep);

  return ticket;
};

const renderCheapDay = (cheapTicket) => {
  cheapestTicket.style.display = "block";
  cheapestTicket.innerHTML = "<h2>Самый дешевый билет на выбранную дату</h2>";

  const ticket = createCard(cheapTicket[0]);
  cheapestTicket.append(ticket);
  console.log(ticket);
};

const renderCheapMonth = (cheapTickets) => {
  const btn = document.createElement('button');
  btn.classList.add("button");
  cheapTickets.sort((a, b) => {
    if (a.value < b.value) return -1;
    if (a.value === b.value) return 0;
    if (a.value > b.value) return 1;
  });


  btn.textContent = "Вывести билеты";
  otherCheapTickets.insertAdjacentElement('beforebegin', btn);
  if(btn){
  btn.addEventListener('click', () =>{
    otherCheapTickets.style.display = "block";
    otherCheapTickets.innerHTML = "<h2>Самые дешевые билеты на другие даты</h2>";
    for (let i = 0; i < cheapTickets.length && i < Max_Count; i++) {
      const ticket = createCard(cheapTickets[i]);
      otherCheapTickets.append(ticket);
    }
  });
} 

};

const renderCheap = (data, date) => {
  const cheapTicketMonth = JSON.parse(data).best_prices;
  const cheapTicketDay = cheapTicketMonth.filter((item) => {
    return item.depart_date === date;
  });

  renderCheapDay(cheapTicketDay);
  renderCheapMonth(cheapTicketMonth);
};

//---------------------------------------Обработчики событий-------------------------------------


inputCitiesFrom.addEventListener("input", () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener("input", () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener("click", (event) => {
  handlerCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener("click", (event) => {
  handlerCity(event, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener("submit", (event) => {
  event.preventDefault();

  const cityFrom = city.find((item) => inputCitiesFrom.value === item.name);
  const cityTo = city.find((item) => inputCitiesTo.value === item.name);
  const formData = {
    from: cityFrom,
    to: cityTo,
    when: inputDateDepart.value,
  };
  if (formData.from && formData.to) {
    const requestData =
      "?depart_date=" +
      formData.when +
      "&origin=" +
      formData.from.code +
      "&destination=" +
      formData.to.code +
      "&one_way=true&token=" +
      API_KEY;

    getData(proxy + calendarApi + requestData, (response) => {
      renderCheap(response, formData.when);
    });
  } else {
    alert("Введите коректное названия города!");
  }
});

//----------------------------------- Вызов функций-------------------------------------------

getData(proxy + cityesApi, (date) => {
  city = JSON.parse(date).filter((item) => item.name);

  city.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });
});
