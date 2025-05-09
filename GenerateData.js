const {
  getLastLanguage,
  getLastPublisher,
  getLastCountry,
  getGenresIds,
  getRandomItem,
  getRandomNumberInRange,
  getRandomDateBetween,
} = require("./GetRandomItem");

const { faker } = require("@faker-js/faker");
const processCSV = require("./random test csv");

const {
  AgeRestrictions,
  HallTechnologies,
  ScreeningFormats,
  PaymentMethods,
  Cities,
  CinemaNames,
  DeliveryOrderStatuses,
  ProductTypes,
  EmployeePositions,
  SeatCategories,
} = require("./Classifiers");

async function readMovies(rowsNumber) {
  return processCSV("TMDB_movie_dataset_v11.csv", rowsNumber);
}

async function readTickets(rowsNumber) {
  return processCSV("cinema_hall_ticket_sales.csv", 1000);
}

// Функція для отримання ID або додавання нового значення
function getOrCreateId(array, value, key, idKey) {
  let existingItem = array.find((item) => item[key] === value);
  if (!existingItem) {
    const newItem = { [idKey]: array.length + 1, [key]: value };
    array.push(newItem);
    return newItem[idKey];
  }
  return existingItem[idKey];
}

function addMoviesGenres(moviesGenres, movieId, genresIds) {
  genresIds.forEach((genreId) => {
    moviesGenres.push({ movieId: movieId, genresId: genreId });
  });
}

function addMovie(
  movie,
  movies,
  Languages,
  Publishers,
  Countries,
  Genres,
  MovieGenres
) {
  const LanguageId = getOrCreateId(
    Languages,
    getLastLanguage(movie.spoken_languages),
    "language",
    "LanguageId"
  );
  const PublisherId = getOrCreateId(
    Publishers,
    getLastPublisher(movie.production_companies),
    "publisher",
    "PublisherId"
  );
  const CountryId = getOrCreateId(
    Countries,
    getLastCountry(movie.production_countries),
    "country",
    "CountryId"
  );
  const ageRestrictionId =
    movie.adult === "False"
      ? AgeRestrictions[getRandomInt(0, AgeRestrictions.length - 2)]
      : AgeRestrictions[AgeRestrictions.length - 1];
  const genreIds = getGenresIds(movie.genres, Genres);

  movies.push({
    MoviesId: movies.length + 1,
    Name: movie.title,
    CountriesId: CountryId,
    AgeRestrictionsId: ageRestrictionId.AgeRestrictionsId,
    PublishersId: PublisherId,
    Runtime: movie.runtime,
    Description: movie.overview,
    Budget: movie.budget,
    LanguagesId: LanguageId,
  });

  addMoviesGenres(MovieGenres, movies.length, genreIds);
}

async function generateData(
  cinemas,
  halls,
  employees,
  movies,
  runs,
  screenings,
  seats,
  clients,
  tickets,
  checkTickets,
  checks,
  moviesGenres,
  Languages,
  Publishers,
  Countries,
  Genres,
  MovieGenres
) {
  cinemas = generateCinemas(10, Cities, CinemaNames);
  halls = generateHalls(cinemas);
  employees = generateEmployees(24, cinemas);
  movies = [];

  const ReadMovies = await readMovies(40);

  ReadMovies.forEach((m) =>
    addMovie(m, movies, Languages, Publishers, Countries, Genres, MovieGenres)
  );
  runs = generateRuns(movies);
  screenings = generateScreenings(
    250,
    ScreeningFormats,
    halls,
    runs,
    Languages,
    movies
  );
  seats = generateSeats(halls, 4, 8, 5, 10);
  clients = generateClients(1400);
  const ticketPrices = [];
  const readedTickets = await readTickets(1000);

  readedTickets.forEach((t) => addTicket(t));

  function addTicket(ticket) {
    ticketPrices.push({
      ticketPrice: ticket.Ticket_Price,
      isVip: ticket.Seat_Type === "Standard",
    });
  }

  const screeningPrices = generateScreeningPrices(
    ticketPrices,
    screenings,
    halls,
    seats
  );

  tickets = generateTickets(
    4000,
    seats,
    screenings,
    // ticketPrice,
    screeningPrices
  );

  const wrongtickets = tickets.filter((t) => t.TicketsId != t.Number);

  checkTickets = generateCheckTickets(tickets, screenings, halls);
  checks = generateChecksFromTickets(
    checkTickets,
    PaymentMethods,
    employees,
    clients,
    tickets,
    screenings,
    halls,
    screeningPrices
  );

  const suppliers = generateSuppliers(7);

  const deliveryOrdersNumber = 120;

  const products = generateProducts(ProductTypes);
  const productsInOrder = generateProductsInOrder(
    1000,
    deliveryOrdersNumber,
    products
  );

  const deliveryOrders = generateDeliveryOrders(
    deliveryOrdersNumber,
    DeliveryOrderStatuses,
    PaymentMethods,
    suppliers,
    employees,
    productsInOrder
  );
  const productPlacements = generateProductPlacements(
    employees,
    productsInOrder,
    deliveryOrders
  );
  const productsInStorage = generateProductsInStorage(
    cinemas,
    productsInOrder,
    deliveryOrders,
    employees,
    productPlacements
  );

  // regenerateProductsInStorageQuantity(productsInStorage, productPlacements);

  const productChecksNumber = 600;

  const productCheckDetails = generateProductCheckDetails(
    productChecksNumber,
    productsInStorage
  );
  const productChecks = generateProductChecks(
    productChecksNumber,
    PaymentMethods,
    clients,
    employees,
    productCheckDetails,
    productsInStorage,
    products,
    productPlacements
  );

  // regenerateProductsInStorageQuantityAfterCheck(productsInStorage, productCheckDetails);

  return {
    cinemas,
    halls,
    employees,
    movies,
    runs,
    screenings,
    seats,
    clients,
    tickets,
    checkTickets,
    checks,
    moviesGenres,

    suppliers,
    deliveryOrders,
    products,
    productsInStorage,
    productsInOrder,
    productPlacements,
    productChecks,
    productCheckDetails,
    screeningPrices,
  };
}

const generateCinemas = (count, cities, CinemaNames) => {
  const cinemas = [];
  let cinemaId = 1;
  const usedCinemaNames = new Set(); // Зберігаємо використані назви

  // Функція для вибору унікальної назви кінотеатру
  const getUniqueCinemaName = () => {
    if (CinemaNames.length === usedCinemaNames.size) {
      throw new Error("Not enough unique cinema names available");
    }
    let name;
    do {
      name = getRandomItem(CinemaNames);
    } while (usedCinemaNames.has(name));
    usedCinemaNames.add(name);
    return name;
  };

  // Step 1: Ensure each city has at least one cinema.
  cities.forEach((city) => {
    cinemas.push({
      CinemasId: cinemaId++,
      Name: getUniqueCinemaName(),
      CitiesId: city.CitiesId,
      Address: faker.location.streetAddress(),
    });
  });

  // Step 2: Distribute remaining cinemas randomly among all cities.
  const remainingCinemasCount = count - cities.length;
  for (let i = 0; i < remainingCinemasCount; i++) {
    const randomCity = getRandomItem(cities); // Випадкове місто
    cinemas.push({
      CinemasId: cinemaId++,
      Name: getUniqueCinemaName(),
      CitiesId: randomCity.CitiesId,
      Address: faker.location.streetAddress(),
    });
  }

  return cinemas;
};

const generateHalls = (cinemas) => {
  // console.log('CINEMAS = ', cinemas);
  const halls = [];

  // Генеруємо зали для кожного кінотеатру
  cinemas.forEach((cinema) => {
    const hallCount = getRandomInt(2, 5); // Випадкова кількість залів від 2 до 5

    for (let i = 0; i < hallCount; i++) {
      const hallTechnology = getRandomItem(HallTechnologies).HallTechnologiesId;

      // console.log('HallTechnologiesId = ', hallTechnology);
      halls.push({
        HallsId: halls.length + 1, // Унікальний ідентифікатор для кожного залу
        CinemaId: cinema.CinemasId,
        HallNumber: i + 1, // Номер залу для даного кінотеатру (від 1 до hallCount)
        HallTechnologiesId: hallTechnology,
      });
    }
  });

  return halls;
};

const generateEmployees = (totalCount, cinemas) => {
  const employees = [];
  const minCashiersPerCinema = 2;
  const minWarehouseWorkersPerCinema = 1;
  const totalManagers = 5;

  const cinemaEmployeeMap = new Map();
  cinemas.forEach((cinema) => cinemaEmployeeMap.set(cinema.CinemasId, []));

  const generatePassword = () => faker.internet.password({ length: 10 });

  // Менеджери
  for (let i = 0; i < totalManagers; i++) {
    const cinemaId = getRandomItem(cinemas).CinemasId;
    const employee = {
      EmployeesId: employees.length + 1,
      CinemaId: cinemaId,
      Name: faker.person.firstName(),
      Surname: faker.person.lastName(),
      CellNumber: faker.phone.number(),
      Email: faker.internet.email(),
      PasswordHash: generatePassword(),
      Position: "Manager",
    };
    employees.push(employee);
    cinemaEmployeeMap.get(cinemaId).push(employee);
  }

  // Мінімальна кількість касирів і складу
  cinemas.forEach((cinema) => {
    const cinemaId = cinema.CinemasId;

    for (let j = 0; j < minCashiersPerCinema; j++) {
      const employee = {
        EmployeesId: employees.length + 1,
        CinemaId: cinemaId,
        Name: faker.person.firstName(),
        Surname: faker.person.lastName(),
        CellNumber: faker.phone.number(),
        Email: faker.internet.email(),
        PasswordHash: generatePassword(),
        Position: "Cashier",
      };
      employees.push(employee);
      cinemaEmployeeMap.get(cinemaId).push(employee);
    }

    for (let j = 0; j < minWarehouseWorkersPerCinema; j++) {
      const employee = {
        EmployeesId: employees.length + 1,
        CinemaId: cinemaId,
        Name: faker.person.firstName(),
        Surname: faker.person.lastName(),
        CellNumber: faker.phone.number(),
        Email: faker.internet.email(),
        PasswordHash: generatePassword(),
        Position: "WarehouseWorker",
      };
      employees.push(employee);
      cinemaEmployeeMap.get(cinemaId).push(employee);
    }
  });

  // Решта випадкових співробітників
  const remainingEmployeesCount = totalCount - employees.length - 1; // -1 для адміна
  for (let i = 0; i < remainingEmployeesCount; i++) {
    const cinemaId = getRandomItem(cinemas).CinemasId;
    const position = getRandomItem(["Cashier", "WarehouseWorker"]);
    const employee = {
      EmployeesId: employees.length + 1,
      CinemaId: cinemaId,
      Name: faker.person.firstName(),
      Surname: faker.person.lastName(),
      CellNumber: faker.phone.number(),
      Email: faker.internet.email(),
      PasswordHash: generatePassword(),
      Position: position,
    };
    employees.push(employee);
    cinemaEmployeeMap.get(cinemaId).push(employee);
  }

  // ✅ Додаємо одного адміна
  employees.push({
    EmployeesId: employees.length + 1,
    CinemaId: null,
    Name: "Admin",
    Surname: "User",
    CellNumber: faker.phone.number(),
    Email: "admin@example.com",
    PasswordHash: generatePassword(),
    Position: "admin",
  });

  return employees;
};

// Функція для генерації клієнтів з унікальними email та cellNumber і реальними доменами
const generateClients = (count) => {
  const clients = [];
  const usedEmails = new Set();
  const usedCellNumbers = new Set();
  const emailDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "icloud.com",
    "mail.com",
  ];

  for (let i = 0; i < count; i++) {
    let name = faker.person.firstName();
    let surname = faker.person.lastName();

    let email;
    do {
      const randomNum = faker.number.int({ min: 1000, max: 9999 });
      const domain = faker.helpers.arrayElement(emailDomains); // випадковий домен
      email = `${name.toLowerCase()}.${surname.toLowerCase()}${randomNum}@${domain}`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    let cellNumber;
    do {
      cellNumber = faker.phone.number("+380#########"); // український номер
    } while (usedCellNumbers.has(cellNumber));
    usedCellNumbers.add(cellNumber);

    clients.push({
      ClientsId: i + 1,
      Name: name,
      Surname: surname,
      CellNumber: cellNumber,
      Email: email,
    });
  }
  return clients;
};

const generateMovies = (
  count,
  countries,
  ageRestrictions,
  publishers,
  languages
) => {
  const movies = [];
  for (let i = 0; i < count; i++) {
    // Generate a more complex and fitting name
    const genre = getRandomItem(Genres).Genre; // Random genre
    const character = faker.name.firstName(); // Random character name
    const setting = faker.address.city(); // Random setting (city)

    const name = `${character} in the ${genre} of ${setting} - ${faker.company.buzzVerb()}`;
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1); // Capitalize the first letter of Name

    // Generate a more thematic description
    const plotTwist = faker.hacker.phrase(); // Random plot twist
    const theme = faker.lorem.sentence(); // Random theme sentence
    const description = `In this ${genre} film, ${character} navigates through a world of intrigue and suspense, where ${plotTwist}. The story explores themes of ${theme}`;
    const capitalizedDescription =
      description.charAt(0).toUpperCase() + description.slice(1); // Capitalize the first letter of Description

    movies.push({
      MoviesId: i + 1,
      Name: capitalizedName, // Use the capitalized name
      CountriesId: getRandomItem(countries).CountriesId,
      AgeRestrictionsId: getRandomItem(ageRestrictions).AgeRestrictionsId,
      PublishersId: getRandomItem(publishers).PublishersId,
      Runtime: getRandomNumberInRange(60, 180), // Between 60 to 180 minutes
      Description: capitalizedDescription, // Use the capitalized description
      Budget: getRandomNumberInRange(100000, 10000000), // Between 100k and 10 million
      LanguagesId: getRandomItem(languages).LanguagesId,
    });
  }
  return movies;
};

const generateRuns = (movies) => {
  const runs = [];

  for (let i = 0; i < movies.length; i++) {
    runs.push({
      RunsId: i + 1,
      StartDate: new Date(
        Date.now() - getRandomNumberInRange(0, 365) * 24 * 60 * 60 * 1000
      ), // Random past date
      EndDate: new Date(
        Date.now() + getRandomNumberInRange(1, 30) * 24 * 60 * 60 * 1000
      ), // Random future date
      MovieId: movies[i].MoviesId, // Directly copy the movie ID
    });
  }
  return runs;
};

const generateScreeningPrices = (ticketPrices, Screenings, Halls, Seats) => {
  const screeningPrices = [];
  let screeningPriceIdCounter = 1; // initialize counter

  for (let i = 0; i < Screenings.length; i++) {
    const screeningId = Screenings[i].ScreeningsId;
    const randomTicket = getRandomItem(ticketPrices);
    const Hall = Halls.find((h) => h.HallsId === Screenings[i].HallsId);
    const seats = Seats.filter((s) => s.HallId === Hall.HallsId);
    const isVip = seats.some((s) => s.SeatCategoryId === 2);

    const TicketPrice = randomTicket.ticketPrice;

    // Regular seat price
    const ScreeningPrice = {
      ScreeningPriceId: screeningPriceIdCounter++,
      TicketPrice: TicketPrice,
      ScreeningId: screeningId,
      SeatCategoryId: 1,
    };
    screeningPrices.push(ScreeningPrice);

    // VIP seat price
    if (isVip) {
      const VipTicketPrice = Math.round(
        TicketPrice * getRandomNumberInRange(1.2, 2.0)
      );

      const ScreeningPrice2 = {
        ScreeningPriceId: screeningPriceIdCounter++,
        TicketPrice: VipTicketPrice,
        ScreeningId: screeningId,
        SeatCategoryId: 2,
      };
      screeningPrices.push(ScreeningPrice2);
    }
  }

  return screeningPrices;
};

const generateScreenings = (
  count,
  screeningFormats,
  halls,
  runs,
  languages,
  movies
) => {
  const screenings = [];

  for (let i = 0; i < count; i++) {
    const selectedRun = getRandomItem(runs); // Get a random run
    const selectedMovie = movies.find(
      (movie) => movie.MoviesId === selectedRun.MovieId
    ); // Find the corresponding movie
    const runtime = selectedMovie.Runtime; // Get the runtime of the selected movie in minutes

    let startDate;
    let endTime;

    do {
      // Generate a random start date within the run period
      startDate = getRandomDateBetween(
        selectedRun.StartDate,
        selectedRun.EndDate
      );

      // Calculate end time by adding runtime in milliseconds (properly handles day crossover)
      endTime = new Date(startDate.getTime() + runtime * 60000);
    } while (endTime > selectedRun.EndDate); // Check if the movie finishes before the run ends

    // Store only time portion for StartTime and EndTime (without date)
    const formattedStartTime = formatTime(startDate);
    const formattedEndTime = formatTime(endTime);

    screenings.push({
      ScreeningsId: i + 1,
      ScreeningFormatsId: getRandomItem(screeningFormats).ScreeningFormatsId,
      HallsId: getRandomItem(halls).HallsId,
      RunsId: selectedRun.RunsId,
      LanguagesId: getRandomItem(languages).LanguageId,
      StartDate: startDate,
      StartTime: formattedStartTime, // Store as TIME only (HH:mm:ss)
      EndTime: formattedEndTime, // Store as TIME only (HH:mm:ss)
    });
  }

  return screenings;
};
// Helper function to format time as HH:mm:ss
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const generateSeats = (
  halls,
  minRows,
  maxRows,
  minSeats,
  maxSeats,
  vipChance = 0.5,
  vipRowsCount = 2
) => {
  const seats = [];

  halls.forEach((hall) => {
    const rows = getRandomNumberInRange(minRows, maxRows);
    const seatsPerRow = getRandomNumberInRange(minSeats, maxSeats);

    // Чи будуть у цьому залі VIP-ряди (визначаємо випадково)
    const hasVipRows = Math.random() < vipChance;

    let vipRows = new Set();
    if (hasVipRows) {
      const startFromFront = Math.random() < 0.5; // 50% шанс, що VIP-ряди будуть спереду або ззаду
      if (startFromFront) {
        vipRows = new Set([...Array(vipRowsCount).keys()].map((i) => i + 1)); // Перші ряди
      } else {
        vipRows = new Set([...Array(vipRowsCount).keys()].map((i) => rows - i)); // Останні ряди
      }
    }

    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        seats.push({
          SeatsId: seats.length + 1,
          RowNumber: row,
          SeatNumber: seat,
          HallId: hall.HallsId,
          SeatCategoryId: vipRows.has(row) ? 2 : 1,
        });
      }
    }
  });

  return seats;
};

const generateChecks = (count, paymentMethods, employees, clients, tickets) => {
  const checks = [];
  const ticketMap = new Map(); // Create Map for tracking tickets for each check

  // Generate checks
  for (let i = 0; i < count; i++) {
    const buyDateTime = faker.date.recent(); // Generate a recent date-time for both BuyDate and BuyTime

    checks.push({
      ChecksId: i + 1,
      PaymentMethodsId: getRandomItem(paymentMethods).PaymentMethodsId,
      EmployeeId: getRandomItem(employees).EmployeesId,
      ClientId: getRandomItem(clients).ClientsId,
      BuyDateTime: buyDateTime, // Use combined BuyDateTime
      Sum: 0, // Initialize sum to 0
    });

    ticketMap.set(checks[i].ChecksId, []); // Initialize an array for tickets for each check
  }

  // Indices for assigning tickets
  let ticketIndex = 0; // Index for tracking tickets

  // Randomly assign tickets to checks
  for (const check of checks) {
    const numTicketsForCheck = Math.min(
      2 + Math.floor(Math.random() * 3),
      tickets.length - ticketIndex
    ); // Random number of tickets (2-4)

    // Assign tickets, ensuring we don’t exceed available tickets
    for (
      let j = 0;
      j < numTicketsForCheck && ticketIndex < tickets.length;
      j++
    ) {
      ticketMap.get(check.ChecksId).push(tickets[ticketIndex]); // Add ticket to the corresponding check
      ticketIndex++; // Move to the next ticket
    }
  }

  // Calculate the total sum for each check
  checks.forEach((check) => {
    const connectedTickets = ticketMap.get(check.ChecksId);
    if (connectedTickets.length > 0) {
      check.Sum = connectedTickets.reduce(
        (sum, ticket) => sum + ticket.Price,
        0
      );
    }
  });

  return checks;
};

// Helper to get CinemaId from a ticket
const getCinemaIdFromTicket = (ticket, screenings, halls) => {
  const screening = screenings.find(
    (s) => s.ScreeningsId === ticket.ScreeningsId
  );
  const hall = halls.find((h) => h.HallsId === screening.HallsId);
  return hall.CinemaId;
};

const generateChecksFromTickets = (
  checkTickets,
  paymentMethods,
  employees,
  clients,
  tickets,
  screenings,
  halls,
  screeningPrices
) => {
  const checks = [];
  const ticketMap = new Map();

  // Group CheckTickets by CheckId
  checkTickets.forEach(({ CheckId, TicketId }) => {
    if (!ticketMap.has(CheckId)) {
      ticketMap.set(CheckId, []);
    }
    ticketMap.get(CheckId).push(TicketId);
  });

  // Generate Checks
  ticketMap.forEach((ticketIds, checkId) => {
    const firstTicket = tickets.find((t) => t.TicketsId === ticketIds[0]);
    const screening = screenings.find(
      (s) => s.ScreeningsId === firstTicket.ScreeningsId
    );

    if (!screening) {
      throw new Error(
        `Screening not found for TicketId ${firstTicket.TicketsId}`
      );
    }

    // Parse StartDate, StartTime, EndTime
    const screeningStartDate = new Date(screening.StartDate);
    const [startHours, startMinutes] =
      screening.StartTime.split(":").map(Number);
    const [endHours, endMinutes] = screening.EndTime.split(":").map(Number);

    // Screening start datetime
    const screeningStartDateTime = new Date(screeningStartDate);
    screeningStartDateTime.setHours(startHours, startMinutes, 0, 0);

    // Screening end datetime
    const screeningEndDateTime = new Date(screeningStartDate);
    screeningEndDateTime.setHours(endHours, endMinutes, 0, 0);

    // If EndTime is logically before StartTime (after midnight), add 1 day
    if (screeningEndDateTime <= screeningStartDateTime) {
      screeningEndDateTime.setDate(screeningEndDateTime.getDate() + 1);
    }

    const cinemaId = getCinemaIdFromTicket(firstTicket, screenings, halls);

    const availableEmployees = employees.filter((e) => e.CinemaId === cinemaId);
    const cashiers = availableEmployees.filter((e) => e.Position === "Cashier");
    const randomEmployee = getRandomItem(cashiers);
    const randomEmployeeId = randomEmployee.EmployeesId;

    const randomPaymentMethodId =
      getRandomItem(paymentMethods).PaymentMethodsId;
    const randomClient = getRandomItem(clients);
    const randomClientId = randomClient.ClientsId;

    // Ensure BuyDateTime is later than the earliest screening start time
    const earliestScreeningStartDateTime = ticketIds.reduce(
      (earliest, ticketId) => {
        const ticket = tickets.find((t) => t.TicketsId === ticketId);
        const ticketScreening = screenings.find(
          (s) => s.ScreeningsId === ticket.ScreeningsId
        );

        const ticketScreeningStartDate = new Date(ticketScreening.StartDate);
        const [ticketStartHours, ticketStartMinutes] =
          ticketScreening.StartTime.split(":").map(Number);

        const ticketScreeningStartDateTime = new Date(ticketScreeningStartDate);
        ticketScreeningStartDateTime.setHours(
          ticketStartHours,
          ticketStartMinutes,
          0,
          0
        );

        return earliest
          ? ticketScreeningStartDateTime < earliest
            ? ticketScreeningStartDateTime
            : earliest
          : ticketScreeningStartDateTime;
      },
      null
    );

    const randomBuyDate = generateBuyDateBeforeScreening(
      screeningStartDateTime,
      checkId
    );

    if (randomBuyDate >= earliestScreeningStartDateTime) {
      console.error("Error: Buy date is still not before screening!");
      // Force a full day earlier
      randomBuyDate.setTime(
        earliestScreeningStartDateTime.getTime() - 24 * 60 * 60 * 10000
      );
    }

    const check = {
      ChecksId: checkId,
      PaymentMethodsId: randomPaymentMethodId,
      EmployeeId: randomEmployeeId,
      ClientId: randomClientId,
      BuyDateTime: formatDateTimeForSql(randomBuyDate),
      Sum: 0,
    };

    // Calculate total Sum of all tickets
    check.Sum = ticketIds.reduce((sum, ticketId) => {
      const ticket = tickets.find((t) => t.TicketsId === ticketId);
      const screeningPrice = screeningPrices.find(
        (sp) => sp.ScreeningPriceId === ticket.ScreeningPriceId
      );
      return sum + Math.floor(Number(screeningPrice.TicketPrice));
    }, 0);

    checks.push(check);
  });

  return checks;
};

const formatDateTimeForSql = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

const generateBuyDateBeforeScreening = (screeningStartDateTime, id) => {
  // Create a new date object to avoid modifying the original
  const screeningTime = new Date(screeningStartDateTime.getTime());

  // Get numerical timestamp values for comparison
  const screeningTimestamp = screeningTime.getTime();

  // Calculate a random buy date between 1 and 100 days before screening
  const minTimeBefore = 24 * 60 * 60 * 1000; // minimum 1 day before
  const maxTimeBefore = 100 * 24 * 60 * 60 * 1000; // maximum 100 days before

  // Use id to create a consistent random factor between minTimeBefore and maxTimeBefore
  const randomFactor = (id % 10000) / 10000;
  const timeBeforeInMs =
    minTimeBefore + randomFactor * (maxTimeBefore - minTimeBefore);

  // Calculate buy timestamp by subtracting the time before from screening time
  const buyTimestamp = screeningTimestamp - timeBeforeInMs;
  const buyDate = new Date(buyTimestamp);

  // Double check buy date is before screening time
  if (buyDate >= screeningTime) {
    console.error(
      `Error: Generated buy date ${buyDate} is not before screening time ${screeningTime}`
    );
    // Force it to be exactly 24 hours before
    return new Date(screeningTimestamp - minTimeBefore);
  }

  return buyDate;
};

function formatDateForSql(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

// Function to generate CheckTickets until all tickets are linked
const generateCheckTickets = (tickets, screenings, halls) => {
  const checkTickets = [];
  let currentCheckId = 1;
  let previousCinemaId = null;

  // Iterate over all tickets and group them into checks
  tickets.forEach((ticket, index) => {
    const cinemaId = getCinemaIdFromTicket(ticket, screenings, halls);

    // If cinema changes or it's the first ticket, create a new check
    if (previousCinemaId !== null && cinemaId !== previousCinemaId) {
      currentCheckId++; // Start a new check
    }

    // Add the current ticket to the current check
    checkTickets.push({
      CheckTicketsId: checkTickets.length + 1, // Unique identifier
      CheckId: currentCheckId,
      TicketId: ticket.TicketsId,
    });

    // Update the previous cinema ID for the next iteration
    previousCinemaId = cinemaId;
  });

  return checkTickets;
};

const generateTickets = (count, seats, screenings, screeningPrices) => {
  const tickets = [];
  const usedSeats = new Map();
  let currentTicketId = 1;

  while (tickets.length < count) {
    const screening = getRandomItem(screenings);

    const pricesForScreening = screeningPrices.filter(
      (s) => s.ScreeningId === screening.ScreeningsId
    );

    if (pricesForScreening.length === 0) continue;

    const normalPrice = pricesForScreening.find((p) => p.SeatCategoryId === 1);
    const vipPrice = pricesForScreening.find((p) => p.SeatCategoryId === 2);

    const availableSeats = seats.filter(
      (seat) =>
        seat.HallId === screening.HallsId &&
        (!usedSeats.has(screening.ScreeningsId) ||
          !usedSeats.get(screening.ScreeningsId).has(seat.SeatsId))
    );

    if (availableSeats.length === 0) continue;

    const seat = getRandomItem(availableSeats);

    if (!usedSeats.has(screening.ScreeningsId)) {
      usedSeats.set(screening.ScreeningsId, new Set());
    }
    usedSeats.get(screening.ScreeningsId).add(seat.SeatsId);

    const screeningPriceId =
      seat.IsVipCategory && vipPrice
        ? vipPrice.ScreeningPriceId
        : normalPrice?.ScreeningPriceId;

    if (!screeningPriceId) continue;

    tickets.push({
      TicketsId: currentTicketId,
      SeatId: seat.SeatsId,
      Number: currentTicketId,
      ScreeningPriceId: screeningPriceId,
      ScreeningsId: screening.ScreeningsId, // додано згідно з твоїм запитом
    });

    currentTicketId++;
  }

  return tickets;
};

// Функція для генерації даних для Жанрів Фільмів
const generateMoviesGenres = (count, movies, genres) => {
  const moviesGenres = [];
  let id = 1;

  // Step 1: Assign at least one genre to each movie
  movies.forEach((movie) => {
    const genre = getRandomItem(genres); // Assign a random genre
    moviesGenres.push({
      MoviesGenresId: id++,
      MoviesId: movie.MoviesId,
      GenresId: genre.GenresId,
    });
  });

  // Step 2: Assign remaining genres randomly
  const extraAssociations = count - movies.length;
  for (let i = 0; i < extraAssociations; i++) {
    moviesGenres.push({
      MoviesGenresId: id++,
      MoviesId: getRandomItem(movies).MoviesId,
      GenresId: getRandomItem(genres).GenresId,
    });
  }

  return moviesGenres;
};

const generateSuppliers = (totalCount) => {
  const suppliers = [];

  for (let i = 0; i < totalCount; i++) {
    const supplier = {
      SupplierId: i + 1, // Adding unique ID
      Name: faker.person.firstName(),
      Surname: faker.person.lastName(),
      CellNumber: faker.phone.number(),
      Email: faker.internet.email(),
    };

    suppliers.push(supplier);
  }

  return suppliers;
};

const generateDeliveryOrders = (
  totalCount,
  deliveryOrderStatuses,
  paymentMethods,
  suppliers,
  employees,
  productsInOrder
) => {
  const deliveryOrders = [];

  // Фільтруємо список співробітників, залишаючи тільки менеджерів
  const managers = employees.filter((emp) => emp.Position === "Manager");

  // Вибираємо 3 унікальних менеджерів для обробки замовлень
  const employeesResponsibleForDeliveries = managers;

  const successfulStatusId = 2; // Delivered
  const successfulStatuses = deliveryOrderStatuses.filter(
    (s) => s.DeliveryOrderStatusId === successfulStatusId
  );
  const otherStatuses = deliveryOrderStatuses.filter(
    (s) => s.DeliveryOrderStatusId !== successfulStatusId
  );

  const weightedStatuses = [
    ...Array(19).fill(successfulStatuses).flat(), // 95% успішні
    ...Array(1).fill(otherStatuses).flat(), // 5% інші
  ];

  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() - 6);

  const maxAllowedDate = new Date();
  maxAllowedDate.setDate(maxAllowedDate.getDate() - 8);
  maxAllowedDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < totalCount; i++) {
    const productsInThisOrder = productsInOrder.filter(
      (p) => p.DeliveryOrderId === i + 1
    );

    const orderDate = new Date(baseDate.getTime());
    const timeOffset =
      (maxAllowedDate.getTime() - baseDate.getTime()) * (i / totalCount);
    orderDate.setTime(baseDate.getTime() + timeOffset);
    orderDate.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60)
    );

    if (orderDate > maxAllowedDate) {
      orderDate.setTime(maxAllowedDate.getTime());
    }

    const deliveryStatus =
      getRandomItem(weightedStatuses).DeliveryOrderStatusId;

    let endDate = new Date(orderDate);
    if (deliveryStatus === successfulStatusId) {
      endDate.setDate(orderDate.getDate() + getRandomNumberInRange(1, 7));
    } else {
      endDate = null;
    }

    const deliveryOrder = {
      DeliveryOrderId: i + 1,
      DeliveryOrderStatusId: deliveryStatus,
      PaymentMethodId: getRandomItem(paymentMethods).PaymentMethodsId,
      SupplierId: getRandomItem(suppliers).SupplierId,
      EmployeeId: getRandomItem(employeesResponsibleForDeliveries).EmployeesId, // Тільки менеджери
      Number: i + 1,
      Sum: productsInThisOrder.reduce(
        (acc, p) => acc + p.Price * p.Quantity,
        0
      ),
      OrderDateTime: orderDate.toISOString().slice(0, 19).replace("T", " "),
      EndDateTime: endDate
        ? endDate.toISOString().slice(0, 19).replace("T", " ")
        : null,
    };

    deliveryOrders.push(deliveryOrder);
  }

  return deliveryOrders;
};

const generateProducts = (productTypes) => {
  const BasePrices = {
    1: 80,
    2: 45,
    3: 55,
    4: 50,
    5: 60,
    6: 65,
    7: 80,
    8: 130,
    9: 70,
    10: 55,
    11: 90,
  };

  const sizes = ["Small", "Medium", "Large"];
  const SizeCoefficients = { Small: 0.8, Medium: 1, Large: 1.2 };
  const BasePrice = 50;

  const products = [];

  let productId = 1;

  productTypes.forEach((productType) => {
    sizes.forEach((size) => {
      const basePrice = BasePrices[productType.ProductTypeId] || BasePrice;
      const price = basePrice * SizeCoefficients[size];

      products.push({
        ProductId: productId++,
        ProductTypeId: productType.ProductTypeId,
        Price: price,
        Name: `${productType.ProductType} (${size})`,
      });
    });
  });

  return products;
};

const generateProductsInStorage = (
  cinemas,
  productsInOrder,
  deliveryOrders,
  employees,
  productPlacements
) => {
  const productsInStorage = [];
  const successfulDeliveryStatuses = [2]; // Статус "доставлено"

  const employeeCinemaMap = new Map();
  for (const employee of employees) {
    employeeCinemaMap.set(employee.EmployeesId, employee.CinemaId);
  }

  const productShelfLifeMap = new Map();
  const productPlacementMap = new Map();
  const deliveryOrderProductionDateMap = new Map();

  for (const placement of productPlacements) {
    const relatedOrder = productsInOrder.find(
      (p) => p.ProductInOrderId === placement.ProductInOrderId
    );
    if (!relatedOrder) continue;

    const relatedDeliveryOrder = deliveryOrders.find(
      (d) => d.DeliveryOrderId === relatedOrder.DeliveryOrderId
    );
    if (
      !relatedDeliveryOrder ||
      !successfulDeliveryStatuses.includes(
        relatedDeliveryOrder.DeliveryOrderStatusId
      )
    )
      continue;

    const cinemaId = employeeCinemaMap.get(placement.EmployeeId);
    if (!cinemaId) continue;

    const orderDate = new Date(relatedDeliveryOrder.OrderDateTime);

    let productionDate = deliveryOrderProductionDateMap.get(
      relatedOrder.DeliveryOrderId
    );
    if (!productionDate) {
      productionDate = new Date(
        orderDate.getTime() -
          getRandomNumberInRange(5, 15) * 24 * 60 * 60 * 1000
      );
      if (productionDate > orderDate) {
        console.warn(
          `⚠️ Виправлено ProductionDate (${productionDate.toISOString()}) > OrderDate (${orderDate.toISOString()})`
        );
        productionDate = new Date(
          orderDate.getTime() - 5 * 24 * 60 * 60 * 1000
        ); // Мінімум 5 днів перед OrderDate
      }
      deliveryOrderProductionDateMap.set(
        relatedOrder.DeliveryOrderId,
        productionDate
      );
    }

    productionDate = new Date(orderDate.getTime() - 5 * 24 * 60 * 60 * 1000); // Мінімум 5 днів перед OrderDate

    const shelfLife =
      productShelfLifeMap.get(relatedOrder.ProductId) ||
      getRandomNumberInRange(30, 180) * 24 * 60 * 60 * 1000;
    productShelfLifeMap.set(relatedOrder.ProductId, shelfLife);

    const expirationDate = new Date(productionDate.getTime() + shelfLife);

    const productInStorage = {
      ProductInStorageId: productsInStorage.length + 1,
      ProductId: relatedOrder.ProductId,
      CinemaId: cinemaId,
      ProductionDate: productionDate,
      ExpirationDate: expirationDate,
      Quantity: placement.Quantity,
    };

    productsInStorage.push(productInStorage);
    productPlacementMap.set(
      placement.ProductPlacementId,
      productInStorage.ProductInStorageId
    );
  }

  for (const placement of productPlacements) {
    placement.ProductInStorageId =
      productPlacementMap.get(placement.ProductPlacementId) || null;
  }

  return productsInStorage;
};

const regenerateProductsInStorageQuantity = (
  productsInStorage,
  productPlacements
) => {
  for (let productInStorage of productsInStorage) {
    const matchingProductPlacements = productPlacements.filter(
      (p) => p.ProductInStorageId === productInStorage.ProductInStorageId
    );
    productInStorage.Quantity = matchingProductPlacements.reduce((acc, p) => {
      return acc + p.Quantity;
    }, 0);
  }
};

const regenerateProductsInStorageQuantityAfterCheck = (
  productsInStorage,
  productCheckDetails
) => {
  for (let productInStorage of productsInStorage) {
    const matchingCheckDetails = productCheckDetails.filter(
      (p) => p.ProductInStorageId === productInStorage.ProductInStorageId
    );
    productInStorage.Quantity -= matchingCheckDetails.reduce((acc, m) => {
      return acc + m.Quantity;
    }, 0);
  }
};

const generateProductsInOrder = (
  totalCount,
  deliveryOrdersNumber,
  products
) => {
  const orders = [];
  const expirationOffsets = new Map(); // Зберігаємо фіксований інтервал для кожного продукту

  const avgProductsPerOrder = Math.floor(totalCount / deliveryOrdersNumber);
  const varyingPoint = Math.round(avgProductsPerOrder / 10);

  for (let i = 0; i < deliveryOrdersNumber; i++) {
    const usedProductIds = new Set();
    const productsInThisOrder = Math.max(
      1,
      avgProductsPerOrder + getRandomNumberInRange(varyingPoint, varyingPoint)
    );

    for (let j = 0; j < productsInThisOrder; j++) {
      let product;
      do {
        product = getRandomItem(products);
      } while (usedProductIds.has(product.ProductId));

      usedProductIds.add(product.ProductId);

      const productionDate = getRandomPastDate(2 * 365); // Випадкова дата за останні 2 роки

      // Якщо продукт вже має визначений інтервал, використовуємо його
      let expirationOffset;
      if (expirationOffsets.has(product.ProductId)) {
        expirationOffset = expirationOffsets.get(product.ProductId);
      } else {
        expirationOffset = getRandomNumberInRange(6 * 30, 24 * 30); // 6-24 місяці у днях
        expirationOffsets.set(product.ProductId, expirationOffset);
      }

      const expirationDate = new Date(productionDate);
      expirationDate.setDate(productionDate.getDate() + expirationOffset);

      const order = {
        ProductInOrderId: orders.length + 1, // Унікальний ID
        ProductId: product.ProductId,
        DeliveryOrderId: i + 1,
        Quantity: getRandomNumberInRange(50, 500),
        Price: (product.Price / 2) * (1 + (Math.random() - 0.5) / 10), // Ціна = половина + варіація ±5%
        ProductionDate: productionDate,
        ExpirationDate: expirationDate,
      };
      orders.push(order);
    }
  }
  return orders;
};

// Функція для отримання випадкової дати у минулому (у днях)
const getRandomPastDate = (maxDaysAgo) => {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - getRandomNumberInRange(0, maxDaysAgo));
  return pastDate;
};

const generateProductPlacements = (
  employees,
  productsInOrder,
  deliveryOrders
) => {
  const placements = [];
  let placementIdCounter = 1;

  const successfulDeliveryStatus = 2;

  const successfulDeliveryOrders = deliveryOrders
    .filter((order) => order.DeliveryOrderStatusId === successfulDeliveryStatus)
    .sort((a, b) => a.DeliveryOrderId - b.DeliveryOrderId);

  const successfulProductOrders = productsInOrder.filter((productInOrder) =>
    successfulDeliveryOrders.some(
      (order) => order.DeliveryOrderId === productInOrder.DeliveryOrderId
    )
  );

  const cinemas = [...new Set(employees.map((e) => e.CinemaId))];

  const employeesByCinema = new Map();
  for (const cinemaId of cinemas) {
    const warehouseWorkers = employees.filter(
      (e) => e.Position === "WarehouseWorker"
    );
    employeesByCinema.set(
      cinemaId,
      warehouseWorkers.filter((e) => e.CinemaId === cinemaId)
    );
  }

  for (const productOrder of successfulProductOrders) {
    const deliveryOrder = successfulDeliveryOrders.find(
      (order) => order.DeliveryOrderId === productOrder.DeliveryOrderId
    );
    if (!deliveryOrder) continue;

    const endDate = new Date(deliveryOrder.OrderDateTime);
    endDate.setMinutes(endDate.getMinutes() + getRandomNumberInRange(30, 240));

    let remainingQuantity = productOrder.Quantity;
    const numCinemas = getRandomNumberInRange(
      1,
      Math.min(cinemas.length, remainingQuantity)
    );
    const selectedCinemas = shuffleArray([...cinemas]).slice(0, numCinemas);

    for (let i = 0; i < selectedCinemas.length; i++) {
      const cinemaId = selectedCinemas[i];
      if (remainingQuantity <= 0) break;

      const employeesInCinema = employeesByCinema.get(cinemaId);
      if (!employeesInCinema || employeesInCinema.length === 0) continue;

      const employee = getRandomItem(employeesInCinema);

      let quantityForCinema;
      if (i === selectedCinemas.length - 1) {
        quantityForCinema = remainingQuantity;
      } else {
        quantityForCinema = getRandomNumberInRange(
          1,
          remainingQuantity - (selectedCinemas.length - i - 1)
        );
      }

      remainingQuantity -= quantityForCinema;

      const placementDate = new Date(endDate);
      const minutesToAdd = getRandomNumberInRange(10, 720);
      placementDate.setMinutes(endDate.getMinutes() + minutesToAdd);

      const placement = {
        ProductPlacementId: placementIdCounter++,
        EmployeeId: employee.EmployeesId,
        ProductInOrderId: productOrder.ProductInOrderId,
        Quantity: quantityForCinema,
        PlacementDate: placementDate,
      };

      placements.push(placement);
    }
  }

  return placements;
};

// Функція для випадкового вибору числа в діапазоні [min, max]
// const getRandomNumberInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Функція для випадкового перемішування масиву
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

// Функція для вибору випадкового елемента масиву
// const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

const generateProductChecks = (
  totalCount,
  paymentMethods,
  clients,
  employees,
  productCheckDetails,
  productsInStorage,
  products,
  productPlacements
) => {
  const checks = [];

  // Отримуємо найранішу дату розміщення товару
  let earliestPlacementDate = new Date(
    Math.min(...productPlacements.map((p) => new Date(p.PlacementDate)))
  );

  // Поточна дата (сьогодні)
  let today = new Date();

  for (let i = 1; i <= totalCount; i++) {
    let sum = 0;
    let checkDetails = productCheckDetails.filter(
      (d) => d.ProductCheckId === i
    );

    // Визначаємо мінімально можливу дату покупки (найраніша PlacementDate серед товарів у чеку)
    let minBuyTime = new Date(
      Math.max(
        earliestPlacementDate,
        Math.min(
          ...checkDetails.map((d) => {
            let placement = productPlacements.find(
              (p) => p.ProductInStorageId === d.ProductInStorageId
            );
            return placement
              ? new Date(placement.PlacementDate)
              : earliestPlacementDate;
          })
        )
      )
    );

    for (const checkDetail of checkDetails) {
      const relevantProductInStorage = productsInStorage.find(
        (product) =>
          product.ProductInStorageId === checkDetail.ProductInStorageId
      );

      if (!relevantProductInStorage) continue;

      const relevantProduct = products.find(
        (product) => product.ProductId === relevantProductInStorage.ProductId
      );

      if (!relevantProduct) continue;

      sum += checkDetail.Quantity * relevantProduct.Price;
    }

    // Генеруємо дату покупки між `minBuyTime` та `today`
    let buyTime = new Date(
      minBuyTime.getTime() + ((today - minBuyTime) / totalCount) * i
    );

    // Додаємо випадкову флуктуацію в межах ±2 години
    buyTime.setMinutes(
      buyTime.getMinutes() + getRandomNumberInRange(-120, 120)
    );

    const check = {
      ProductCheckId: i,
      PaymentMethodId: getRandomItem(paymentMethods).PaymentMethodsId,
      ClientId: getRandomItem(clients).ClientsId,
      EmployeeId: getRandomItem(employees).EmployeesId,
      Number: i,
      Sum: sum,
      BuyTime: new Date(buyTime), // Тепер BuyTime завжди > PlacementDate
    };

    checks.push(check);
  }

  return checks;
};

const generateProductCheckDetails = (
  productChecksNumber,
  productsInStorage
) => {
  const checkDetails = [];

  for (let j = 1; j <= productChecksNumber; j++) {
    const checkDetailCount = getRandomWeightedNumber({
      1: 10,
      2: 50,
      3: 20,
      4: 10,
      5: 5,
      6: 2,
      7: 1,
      8: 1,
      9: 1,
      10: 1,
    });

    const orderedProductIds = new Set();

    // Вибираємо випадковий кінотеатр для цього чеку
    const availableCinemaIds = [
      ...new Set(productsInStorage.map((p) => p.CinemaId)),
    ];
    const selectedCinemaId = getRandomItem(availableCinemaIds);

    // Динамічно обчислюємо дату порівняння (2023 + трохи більше для вищих ID)
    const baseYear = 2023;
    const expirationThreshold = new Date(baseYear + Math.floor(j / 500), 0, 1); // Додаємо 1 рік за кожні 100 чеків

    // Фільтруємо тільки ті продукти, які є в наявності, не прострочені і з потрібного кінотеатру
    let availableProducts = productsInStorage.filter(
      (p) =>
        p.Quantity > 0 &&
        p.CinemaId === selectedCinemaId &&
        new Date(p.ExpirationDate) >= expirationThreshold // Динамічний поріг дати
    );

    for (let i = 0; i < checkDetailCount; i++) {
      if (availableProducts.length === 0) break; // Якщо немає товарів, зупиняємо

      let filteredProducts = availableProducts.filter(
        (p) => !orderedProductIds.has(p.ProductInStorageId)
      );

      if (filteredProducts.length === 0) break;

      let productInStorage = getRandomItem(filteredProducts);
      orderedProductIds.add(productInStorage.ProductInStorageId);

      let boughtQuantity;

      do {
        boughtQuantity = getRandomWeightedNumber({
          1: 40,
          2: 50,
          3: 20,
          4: 10,
          5: 5,
          6: 2,
          7: 1,
          8: 1,
          9: 1,
          10: 1,
        });
      } while (productInStorage.Quantity < boughtQuantity);

      productInStorage.Quantity -= boughtQuantity;

      checkDetails.push({
        ProductCheckDetailId: checkDetails.length + 1,
        ProductCheckId: j,
        ProductInStorageId: productInStorage.ProductInStorageId,
        Quantity: boughtQuantity,
      });

      // Оновлюємо доступні продукти після зміни кількості
      availableProducts = productsInStorage.filter(
        (p) =>
          p.Quantity > 0 &&
          p.CinemaId === selectedCinemaId &&
          new Date(p.ExpirationDate) >= expirationThreshold
      );
    }
  }
  return checkDetails;
};

// Функція для генерації числа з ймовірностями
const getRandomWeightedNumber = (weights) => {
  const entries = Object.entries(weights);
  const weightedArray = entries.flatMap(([num, weight]) =>
    Array(weight).fill(parseInt(num))
  );
  return getRandomItem(weightedArray);
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = { generateData };
